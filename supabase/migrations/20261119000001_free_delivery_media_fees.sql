-- Free delivery, seller social links, short product videos, media storage and
-- a (currently 0%) platform fee that can be switched on later.

alter table public.stores add column if not exists facebook_url text not null default '' check (char_length(facebook_url) <= 300);
alter table public.stores add column if not exists youtube_url text not null default '' check (char_length(youtube_url) <= 300);
alter table public.products add column if not exists video_url text check (video_url is null or char_length(video_url) <= 600);
alter table public.order_items add column if not exists platform_fee numeric(12, 2) not null default 0;

-- Single-row platform settings. Selling is free for now (0%).
create table if not exists public.platform_settings (
  id int primary key default 1 check (id = 1),
  seller_fee_percent numeric(5, 2) not null default 0 check (seller_fee_percent between 0 and 50),
  fees_enabled boolean not null default false,
  fee_note text not null default 'Selling on SamBee is free for now.' check (char_length(fee_note) <= 300),
  free_delivery boolean not null default true,
  updated_at timestamptz not null default now()
);
insert into public.platform_settings (id) values (1) on conflict (id) do nothing;
alter table public.platform_settings enable row level security;
create policy "platform_settings: public read" on public.platform_settings for select to anon, authenticated using (true);
create policy "platform_settings: admin update" on public.platform_settings for update to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));
grant select on public.platform_settings to anon;
grant select, update on public.platform_settings to authenticated;

-- Order placement: free delivery (unless switched off later) and platform fee per item.
create or replace function private.place_order(
  p_items jsonb, p_shipping jsonb, p_payment_method text, p_momo jsonb
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
  end loop;
  perform set_config('app.internal', 'off', true);

  update public.orders set subtotal = v_subtotal, total = v_subtotal + v_fee where id = v_order;
  return v_order;
end;
$$;

-- Public media bucket for product photos, shop logos and short product videos (max 3 MB each).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 3145728,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "media: users upload to own folder" on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "media: users read own files" on storage.objects for select to authenticated
  using (bucket_id = 'media' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "media: users delete own files" on storage.objects for delete to authenticated
  using (bucket_id = 'media' and ((storage.foldername(name))[1] = (select auth.uid())::text or (select private.is_admin())));

alter table public.stores add column if not exists video_url text check (video_url is null or char_length(video_url) <= 600);
