-- Tutorials (English / Twi), shop & product view analytics, and seller promo codes.

alter table public.videos add column if not exists is_tutorial boolean not null default false;
alter table public.videos add column if not exists language text not null default 'en' check (language in ('en', 'tw'));
alter table public.videos add column if not exists topic text not null default '' check (char_length(topic) <= 60);
alter table public.videos add column if not exists sort int not null default 0;
create index if not exists videos_tutorial_idx on public.videos (is_tutorial, language, sort);

alter table public.products add column if not exists view_count int not null default 0;
alter table public.stores add column if not exists view_count int not null default 0;

-- Keep counters out of sellers' hands (they change only through track_view / internal code).
create or replace function private.guard_product()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  new.updated_at := now();
  if pg_trigger_depth() = 1 and current_setting('app.internal', true) is distinct from 'on' then
    if tg_op = 'INSERT' then
      new.rating_avg := 0; new.rating_count := 0; new.sold_count := 0; new.view_count := 0;
      if not private.is_admin() then new.featured := false; end if;
    else
      new.rating_avg := old.rating_avg; new.rating_count := old.rating_count; new.sold_count := old.sold_count;
      new.view_count := old.view_count;
      new.store_id := old.store_id;
      if not private.is_admin() then new.featured := old.featured; end if;
    end if;
  end if;
  return new;
end;
$$;

create or replace function private.guard_store()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if current_setting('app.internal', true) = 'on' then return new; end if;
  if not private.is_admin() then
    if tg_op = 'INSERT' then
      new.status := 'active';
      new.verified := false;
      new.owner_id := (select auth.uid());
      new.view_count := 0;
    else
      new.status := old.status;
      new.verified := old.verified;
      new.owner_id := old.owner_id;
      new.view_count := old.view_count;
    end if;
  end if;
  return new;
end;
$$;

create or replace function private.track_view(p_kind text, p_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  perform set_config('app.internal', 'on', true);
  if p_kind = 'product' then
    update public.products set view_count = view_count + 1 where id = p_id and status = 'active';
  elsif p_kind = 'store' then
    update public.stores set view_count = view_count + 1 where id = p_id and status = 'active';
  end if;
  perform set_config('app.internal', 'off', true);
end;
$$;
revoke all on function private.track_view(text, uuid) from public;
grant execute on function private.track_view(text, uuid) to anon, authenticated;
create or replace function public.track_view(p_kind text, p_id uuid)
returns void language sql security invoker set search_path = '' as $$ select private.track_view(p_kind, p_id); $$;
revoke all on function public.track_view(text, uuid) from public;
grant execute on function public.track_view(text, uuid) to anon, authenticated;

-- ───────────── promo codes ─────────────
create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores (id) on delete cascade,
  code text not null unique check (code ~ '^[A-Z0-9]{3,20}$'),
  percent_off int not null check (percent_off between 1 and 90),
  min_order numeric(12, 2) not null default 0 check (min_order >= 0),
  max_uses int check (max_uses is null or max_uses > 0),
  used_count int not null default 0,
  expires_at timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists coupons_store_idx on public.coupons (store_id);
alter table public.coupons enable row level security;
create policy "coupons: owner or admin read" on public.coupons for select to authenticated
  using ((select private.is_store_owner(store_id)) or (select private.is_admin()));
create policy "coupons: owner or admin insert" on public.coupons for insert to authenticated
  with check ((select private.is_store_owner(store_id)) or (select private.is_admin()));
create policy "coupons: owner or admin update" on public.coupons for update to authenticated
  using ((select private.is_store_owner(store_id)) or (select private.is_admin()))
  with check ((select private.is_store_owner(store_id)) or (select private.is_admin()));
create policy "coupons: owner or admin delete" on public.coupons for delete to authenticated
  using ((select private.is_store_owner(store_id)) or (select private.is_admin()));
grant select, insert, update, delete on public.coupons to authenticated;

create or replace function private.guard_coupon()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  new.code := upper(trim(new.code));
  if current_setting('app.internal', true) is distinct from 'on' then
    if tg_op = 'INSERT' then new.used_count := 0; else new.used_count := old.used_count; new.store_id := old.store_id; end if;
  end if;
  return new;
end;
$$;
drop trigger if exists guard_coupon on public.coupons;
create trigger guard_coupon before insert or update on public.coupons for each row execute function private.guard_coupon();

alter table public.orders add column if not exists coupon_code text;
alter table public.orders add column if not exists discount numeric(12, 2) not null default 0;

-- Shoppers can check a code before paying (returns only what checkout needs).
create or replace function private.preview_coupon(p_code text)
returns table (store_id uuid, store_name text, percent_off int, min_order numeric)
language sql stable security definer set search_path = '' as $$
  select c.store_id, s.name, c.percent_off, c.min_order
  from public.coupons c join public.stores s on s.id = c.store_id
  where c.code = upper(trim(p_code)) and c.active and s.status = 'active'
    and (c.expires_at is null or c.expires_at > now())
    and (c.max_uses is null or c.used_count < c.max_uses);
$$;
revoke all on function private.preview_coupon(text) from public;
grant execute on function private.preview_coupon(text) to anon, authenticated;
create or replace function public.preview_coupon(p_code text)
returns table (store_id uuid, store_name text, percent_off int, min_order numeric)
language sql stable security invoker set search_path = '' as $$ select * from private.preview_coupon(p_code); $$;
revoke all on function public.preview_coupon(text) from public;
grant execute on function public.preview_coupon(text) to anon, authenticated;

drop function if exists public.place_order(jsonb, jsonb, text, jsonb);
drop function if exists private.place_order(jsonb, jsonb, text, jsonb);

create function private.place_order(
  p_items jsonb, p_shipping jsonb, p_payment_method text, p_momo jsonb, p_coupon text
) returns uuid language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := (select auth.uid());
  v_order uuid;
  v_item jsonb;
  v_product public.products;
  v_qty int;
  v_subtotal numeric(12, 2) := 0;
  v_fee numeric(12, 2);
  v_settings public.platform_settings;
  v_pct numeric := 0;
  v_coupon public.coupons;
  v_coupon_base numeric(12, 2) := 0;
  v_discount numeric(12, 2) := 0;
  v_method text := coalesce(p_shipping ->> 'delivery_method', 'delivery');
  v_town text := coalesce(nullif(trim(p_shipping ->> 'town'), ''), 'Assin Foso');
begin
  if v_uid is null then raise exception 'Please sign in to place an order.'; end if;
  if p_payment_method not in ('cod', 'momo') then raise exception 'Choose a payment method.'; end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then raise exception 'Your cart is empty.'; end if;
  if jsonb_array_length(p_items) > 50 then raise exception 'Too many items in one order.'; end if;
  if char_length(coalesce(trim(p_shipping ->> 'name'), '')) < 2 then raise exception 'Enter the recipient name.'; end if;
  if char_length(regexp_replace(coalesce(p_shipping ->> 'phone', ''), '\D', '', 'g')) < 9 then raise exception 'Enter a valid phone number.'; end if;
  if v_method = 'delivery' and char_length(coalesce(trim(p_shipping ->> 'address'), '')) < 3 then raise exception 'Enter a delivery address or landmark.'; end if;
  if p_payment_method = 'momo' and char_length(regexp_replace(coalesce(p_momo ->> 'number', ''), '\D', '', 'g')) < 9 then
    raise exception 'Enter the Mobile Money number you will pay from.';
  end if;

  if nullif(trim(coalesce(p_coupon, '')), '') is not null then
    select * into v_coupon from public.coupons c
      where c.code = upper(trim(p_coupon)) and c.active
        and (c.expires_at is null or c.expires_at > now())
        and (c.max_uses is null or c.used_count < c.max_uses)
      for update;
    if not found then raise exception 'That promo code is not valid or has expired.'; end if;
  end if;

  select * into v_settings from public.platform_settings where id = 1;
  if v_settings.fees_enabled then v_pct := v_settings.seller_fee_percent; end if;
  v_fee := case when v_method = 'pickup' or coalesce(v_settings.free_delivery, true) then 0
                when lower(v_town) like 'assin fo%' then 10
                when lower(coalesce(p_shipping ->> 'region', 'Central Region')) like 'central%' then 25
                else 45 end;

  insert into public.orders (order_number, buyer_id, payment_method, momo_network, momo_number, momo_reference,
    delivery_method, shipping_name, shipping_phone, shipping_address, shipping_town, shipping_region, notes,
    subtotal, delivery_fee, total)
  values (
    'SSD-' || to_char(now(), 'YYMMDD') || '-' || nextval('private.order_number_seq'),
    v_uid, p_payment_method,
    case when p_payment_method = 'momo' then left(p_momo ->> 'network', 30) end,
    case when p_payment_method = 'momo' then left(p_momo ->> 'number', 20) end,
    case when p_payment_method = 'momo' then left(p_momo ->> 'reference', 60) end,
    v_method, left(trim(p_shipping ->> 'name'), 120), left(trim(p_shipping ->> 'phone'), 30),
    left(coalesce(p_shipping ->> 'address', ''), 300), left(v_town, 80),
    left(coalesce(nullif(p_shipping ->> 'region', ''), 'Central Region'), 80),
    left(coalesce(p_shipping ->> 'notes', ''), 500), 0, v_fee, 0)
  returning id into v_order;

  perform set_config('app.internal', 'on', true);
  for v_item in select * from jsonb_array_elements(p_items) loop
    v_qty := greatest(1, least(99, coalesce((v_item ->> 'quantity')::int, 1)));
    select p.* into v_product from public.products p
      join public.stores s on s.id = p.store_id
      where p.id = (v_item ->> 'product_id')::uuid and p.status = 'active' and s.status = 'active'
      for update of p;
    if not found then raise exception 'An item in your cart is no longer available.'; end if;
    if v_product.stock < v_qty then
      raise exception 'Only % left of "%".', v_product.stock, v_product.title;
    end if;
    update public.products set stock = stock - v_qty, sold_count = sold_count + v_qty where id = v_product.id;
    insert into public.order_items (order_id, product_id, store_id, title, image, unit_price, quantity, platform_fee)
      values (v_order, v_product.id, v_product.store_id, v_product.title, v_product.images[1], v_product.price, v_qty,
              round(v_product.price * v_qty * v_pct / 100, 2));
    v_subtotal := v_subtotal + v_product.price * v_qty;
    if v_coupon.id is not null and v_product.store_id = v_coupon.store_id then
      v_coupon_base := v_coupon_base + v_product.price * v_qty;
    end if;
  end loop;

  if v_coupon.id is not null then
    if v_coupon_base = 0 then raise exception 'That promo code is for another shop''s products.'; end if;
    if v_coupon_base < v_coupon.min_order then
      raise exception 'Spend at least GH₵ % with this shop to use that code.', v_coupon.min_order;
    end if;
    v_discount := round(v_coupon_base * v_coupon.percent_off / 100.0, 2);
    update public.coupons set used_count = used_count + 1 where id = v_coupon.id;
  end if;
  perform set_config('app.internal', 'off', true);

  update public.orders set subtotal = v_subtotal, discount = v_discount, coupon_code = v_coupon.code,
    total = v_subtotal - v_discount + v_fee where id = v_order;
  return v_order;
end;
$$;
revoke all on function private.place_order(jsonb, jsonb, text, jsonb, text) from public;
grant execute on function private.place_order(jsonb, jsonb, text, jsonb, text) to authenticated;

create function public.place_order(p_items jsonb, p_shipping jsonb, p_payment_method text, p_momo jsonb default '{}'::jsonb, p_coupon text default null)
returns uuid language sql security invoker set search_path = '' as $$
  select private.place_order(p_items, p_shipping, p_payment_method, p_momo, p_coupon);
$$;
revoke all on function public.place_order(jsonb, jsonb, text, jsonb, text) from public, anon;
grant execute on function public.place_order(jsonb, jsonb, text, jsonb, text) to authenticated;

-- Remove the demo catalogue seeded in 20261117000002 so only real sellers' data remains.
delete from public.stores where slug in ('sambee-care-essentials', 'sambea-care-essentials') and owner_id is null;
