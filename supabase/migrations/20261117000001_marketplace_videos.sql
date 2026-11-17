-- Sambea Son and Daughter Home Care — marketplace, videos and care requests.
-- Privileged helpers live in the unexposed `private` schema; public RPCs are
-- thin SECURITY INVOKER wrappers so nothing definer-owned is reachable directly.

create schema if not exists private;
grant usage on schema private to anon, authenticated;

-- ───────────────────────── profiles ─────────────────────────
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text not null default '',
  phone text not null default '',
  avatar_url text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create table private.admin_emails (email text primary key);
insert into private.admin_emails (email) values ('beagracelyn@gmail.com');

create or replace function private.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select coalesce((select p.is_admin from public.profiles p where p.id = (select auth.uid())), false);
$$;
revoke all on function private.is_admin() from public;
grant execute on function private.is_admin() to anon, authenticated;

create or replace function private.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, email, full_name, phone, is_admin)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'phone', ''),
    exists (select 1 from private.admin_emails a where lower(a.email) = lower(new.email))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function private.handle_new_user();

create or replace function private.guard_profile()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if not private.is_admin() then
    new.is_admin := old.is_admin;
    new.email := old.email;
  end if;
  return new;
end;
$$;
create trigger guard_profile before update on public.profiles
  for each row execute function private.guard_profile();

alter table public.profiles enable row level security;
create policy "profiles: read own or admin" on public.profiles for select to authenticated
  using ((select auth.uid()) = id or (select private.is_admin()));
create policy "profiles: update own" on public.profiles for update to authenticated
  using ((select auth.uid()) = id or (select private.is_admin()))
  with check ((select auth.uid()) = id or (select private.is_admin()));

-- ───────────────────────── catalogue ─────────────────────────
create table public.categories (
  id serial primary key,
  name text not null,
  slug text not null unique,
  icon text not null default 'package',
  sort int not null default 0
);
alter table public.categories enable row level security;
create policy "categories: public read" on public.categories for select to anon, authenticated using (true);
create policy "categories: admin write" on public.categories for all to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));

create table public.stores (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid unique references public.profiles (id) on delete set null,
  name text not null check (char_length(name) between 2 and 80),
  slug text not null unique check (slug ~ '^[a-z0-9-]{2,60}$'),
  description text not null default '',
  logo_url text,
  banner_url text,
  phone text not null default '',
  whatsapp text not null default '',
  town text not null default 'Assin Foso',
  region text not null default 'Central Region',
  status text not null default 'active' check (status in ('active', 'suspended')),
  verified boolean not null default false,
  created_at timestamptz not null default now()
);
create index stores_owner_idx on public.stores (owner_id);

create or replace function private.is_store_owner(p_store uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.stores s where s.id = p_store and s.owner_id = (select auth.uid()));
$$;
revoke all on function private.is_store_owner(uuid) from public;
grant execute on function private.is_store_owner(uuid) to anon, authenticated;

create or replace function private.guard_store()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if not private.is_admin() then
    if tg_op = 'INSERT' then
      new.status := 'active';
      new.verified := false;
      new.owner_id := (select auth.uid());
    else
      new.status := old.status;
      new.verified := old.verified;
      new.owner_id := old.owner_id;
    end if;
  end if;
  return new;
end;
$$;
create trigger guard_store before insert or update on public.stores
  for each row execute function private.guard_store();

alter table public.stores enable row level security;
create policy "stores: public read active" on public.stores for select to anon, authenticated
  using (status = 'active' or owner_id = (select auth.uid()) or (select private.is_admin()));
create policy "stores: create own" on public.stores for insert to authenticated
  with check (owner_id = (select auth.uid()) or (select private.is_admin()));
create policy "stores: owner update" on public.stores for update to authenticated
  using (owner_id = (select auth.uid()) or (select private.is_admin()))
  with check (owner_id = (select auth.uid()) or (select private.is_admin()));
create policy "stores: admin delete" on public.stores for delete to authenticated
  using ((select private.is_admin()));

create table public.products (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores (id) on delete cascade,
  category_id int references public.categories (id) on delete set null,
  title text not null check (char_length(title) between 2 and 140),
  description text not null default '',
  price numeric(12, 2) not null check (price >= 0),
  compare_at_price numeric(12, 2) check (compare_at_price is null or compare_at_price >= 0),
  stock int not null default 0 check (stock >= 0),
  images text[] not null default '{}',
  tags text[] not null default '{}',
  status text not null default 'active' check (status in ('active', 'draft', 'archived')),
  featured boolean not null default false,
  rating_avg numeric(3, 2) not null default 0,
  rating_count int not null default 0,
  sold_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index products_store_idx on public.products (store_id);
create index products_category_idx on public.products (category_id);
create index products_status_created_idx on public.products (status, created_at desc);

create or replace function private.guard_product()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  new.updated_at := now();
  -- Ratings and sales counters are maintained by internal triggers/RPCs only.
  if pg_trigger_depth() = 1 and current_setting('app.internal', true) is distinct from 'on' then
    if tg_op = 'INSERT' then
      new.rating_avg := 0; new.rating_count := 0; new.sold_count := 0;
      if not private.is_admin() then new.featured := false; end if;
    else
      new.rating_avg := old.rating_avg; new.rating_count := old.rating_count; new.sold_count := old.sold_count;
      new.store_id := old.store_id;
      if not private.is_admin() then new.featured := old.featured; end if;
    end if;
  end if;
  return new;
end;
$$;
create trigger guard_product before insert or update on public.products
  for each row execute function private.guard_product();

alter table public.products enable row level security;
create policy "products: public read active" on public.products for select to anon, authenticated
  using (
    (status = 'active' and exists (select 1 from public.stores s where s.id = store_id and s.status = 'active'))
    or (select private.is_store_owner(store_id))
    or (select private.is_admin())
  );
create policy "products: owner insert" on public.products for insert to authenticated
  with check ((select private.is_store_owner(store_id)) or (select private.is_admin()));
create policy "products: owner update" on public.products for update to authenticated
  using ((select private.is_store_owner(store_id)) or (select private.is_admin()))
  with check ((select private.is_store_owner(store_id)) or (select private.is_admin()));
create policy "products: owner delete" on public.products for delete to authenticated
  using ((select private.is_store_owner(store_id)) or (select private.is_admin()));

-- ───────────────────────── orders ─────────────────────────
create sequence private.order_number_seq start 1001;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  buyer_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  payment_method text not null check (payment_method in ('cod', 'momo')),
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid', 'paid', 'refunded')),
  momo_network text,
  momo_number text,
  momo_reference text,
  delivery_method text not null default 'delivery' check (delivery_method in ('delivery', 'pickup')),
  shipping_name text not null,
  shipping_phone text not null,
  shipping_address text not null default '',
  shipping_town text not null default 'Assin Foso',
  shipping_region text not null default 'Central Region',
  notes text not null default '',
  subtotal numeric(12, 2) not null,
  delivery_fee numeric(12, 2) not null default 0,
  total numeric(12, 2) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index orders_buyer_idx on public.orders (buyer_id, created_at desc);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  store_id uuid references public.stores (id) on delete set null,
  title text not null,
  image text,
  unit_price numeric(12, 2) not null,
  quantity int not null check (quantity > 0),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  created_at timestamptz not null default now()
);
create index order_items_order_idx on public.order_items (order_id);
create index order_items_store_idx on public.order_items (store_id, created_at desc);
create index order_items_product_idx on public.order_items (product_id);

create or replace function private.can_see_order(p_order uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.orders o where o.id = p_order and o.buyer_id = (select auth.uid()))
      or exists (
        select 1 from public.order_items i join public.stores s on s.id = i.store_id
        where i.order_id = p_order and s.owner_id = (select auth.uid())
      )
      or private.is_admin();
$$;
revoke all on function private.can_see_order(uuid) from public;
grant execute on function private.can_see_order(uuid) to authenticated;

alter table public.orders enable row level security;
create policy "orders: parties read" on public.orders for select to authenticated
  using (buyer_id = (select auth.uid()) or (select private.can_see_order(id)));

alter table public.order_items enable row level security;
create policy "order_items: parties read" on public.order_items for select to authenticated
  using ((select private.can_see_order(order_id)));

-- Recompute an order's overall status from its items.
create or replace function private.refresh_order_status(p_order uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare
  v_total int; v_cancelled int; v_done int; v_shipped int; v_confirmed int; v_status text;
begin
  select count(*),
         count(*) filter (where status = 'cancelled'),
         count(*) filter (where status in ('delivered', 'cancelled')),
         count(*) filter (where status in ('shipped', 'delivered')),
         count(*) filter (where status in ('confirmed', 'shipped', 'delivered'))
    into v_total, v_cancelled, v_done, v_shipped, v_confirmed
    from public.order_items where order_id = p_order;
  v_status := case
    when v_total = v_cancelled then 'cancelled'
    when v_done = v_total then 'delivered'
    when v_shipped > 0 then 'shipped'
    when v_confirmed > 0 then 'confirmed'
    else 'pending' end;
  update public.orders set status = v_status, updated_at = now(),
    payment_status = case when v_status = 'delivered' and payment_method = 'cod' then 'paid' else payment_status end
  where id = p_order;
end;
$$;
revoke all on function private.refresh_order_status(uuid) from public;

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

  v_fee := case when v_method = 'pickup' then 0
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
    insert into public.order_items (order_id, product_id, store_id, title, image, unit_price, quantity)
      values (v_order, v_product.id, v_product.store_id, v_product.title, v_product.images[1], v_product.price, v_qty);
    v_subtotal := v_subtotal + v_product.price * v_qty;
  end loop;
  perform set_config('app.internal', 'off', true);

  update public.orders set subtotal = v_subtotal, total = v_subtotal + v_fee where id = v_order;
  return v_order;
end;
$$;
revoke all on function private.place_order(jsonb, jsonb, text, jsonb) from public;
grant execute on function private.place_order(jsonb, jsonb, text, jsonb) to authenticated;

create or replace function private.set_item_status(p_item uuid, p_status text)
returns void language plpgsql security definer set search_path = '' as $$
declare v_row public.order_items;
begin
  if p_status not in ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled') then raise exception 'Unknown status.'; end if;
  select * into v_row from public.order_items where id = p_item for update;
  if not found then raise exception 'Order item not found.'; end if;
  if not (private.is_admin() or private.is_store_owner(v_row.store_id)) then raise exception 'Not allowed.'; end if;
  if v_row.status = 'cancelled' then raise exception 'This item was cancelled.'; end if;
  if p_status = 'cancelled' and v_row.product_id is not null then
    perform set_config('app.internal', 'on', true);
    update public.products set stock = stock + v_row.quantity, sold_count = greatest(0, sold_count - v_row.quantity)
      where id = v_row.product_id;
    perform set_config('app.internal', 'off', true);
  end if;
  update public.order_items set status = p_status where id = p_item;
  perform private.refresh_order_status(v_row.order_id);
end;
$$;
revoke all on function private.set_item_status(uuid, text) from public;
grant execute on function private.set_item_status(uuid, text) to authenticated;

create or replace function private.cancel_order(p_order uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare v_order public.orders; v_row public.order_items;
begin
  select * into v_order from public.orders where id = p_order for update;
  if not found then raise exception 'Order not found.'; end if;
  if not (v_order.buyer_id = (select auth.uid()) or private.is_admin()) then raise exception 'Not allowed.'; end if;
  if v_order.status not in ('pending', 'confirmed') then raise exception 'This order has already shipped and cannot be cancelled here.'; end if;
  perform set_config('app.internal', 'on', true);
  for v_row in select * from public.order_items where order_id = p_order and status <> 'cancelled' loop
    if v_row.product_id is not null then
      update public.products set stock = stock + v_row.quantity, sold_count = greatest(0, sold_count - v_row.quantity)
        where id = v_row.product_id;
    end if;
  end loop;
  perform set_config('app.internal', 'off', true);
  update public.order_items set status = 'cancelled' where order_id = p_order;
  update public.orders set status = 'cancelled', updated_at = now() where id = p_order;
end;
$$;
revoke all on function private.cancel_order(uuid) from public;
grant execute on function private.cancel_order(uuid) to authenticated;

create or replace function private.set_payment_status(p_order uuid, p_status text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not private.is_admin() then raise exception 'Only administrators can confirm payments.'; end if;
  if p_status not in ('unpaid', 'paid', 'refunded') then raise exception 'Unknown payment status.'; end if;
  update public.orders set payment_status = p_status, updated_at = now() where id = p_order;
end;
$$;
revoke all on function private.set_payment_status(uuid, text) from public;
grant execute on function private.set_payment_status(uuid, text) to authenticated;

-- Public RPC wrappers (SECURITY INVOKER).
create function public.place_order(p_items jsonb, p_shipping jsonb, p_payment_method text, p_momo jsonb default '{}'::jsonb)
returns uuid language sql security invoker set search_path = '' as $$
  select private.place_order(p_items, p_shipping, p_payment_method, p_momo);
$$;
create function public.set_order_item_status(p_item uuid, p_status text)
returns void language sql security invoker set search_path = '' as $$ select private.set_item_status(p_item, p_status); $$;
create function public.cancel_order(p_order uuid)
returns void language sql security invoker set search_path = '' as $$ select private.cancel_order(p_order); $$;
create function public.set_order_payment_status(p_order uuid, p_status text)
returns void language sql security invoker set search_path = '' as $$ select private.set_payment_status(p_order, p_status); $$;
revoke all on function public.place_order(jsonb, jsonb, text, jsonb) from public, anon;
revoke all on function public.set_order_item_status(uuid, text) from public, anon;
revoke all on function public.cancel_order(uuid) from public, anon;
revoke all on function public.set_order_payment_status(uuid, text) from public, anon;
grant execute on function public.place_order(jsonb, jsonb, text, jsonb) to authenticated;
grant execute on function public.set_order_item_status(uuid, text) to authenticated;
grant execute on function public.cancel_order(uuid) to authenticated;
grant execute on function public.set_order_payment_status(uuid, text) to authenticated;

-- ───────────────────────── reviews & wishlists ─────────────────────────
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  author_name text not null default '',
  rating int not null check (rating between 1 and 5),
  comment text not null default '' check (char_length(comment) <= 1500),
  created_at timestamptz not null default now(),
  unique (product_id, user_id)
);
create index reviews_user_idx on public.reviews (user_id);

create or replace function private.has_purchased(p_product uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.order_items i join public.orders o on o.id = i.order_id
    where i.product_id = p_product and o.buyer_id = (select auth.uid()) and i.status <> 'cancelled'
  );
$$;
revoke all on function private.has_purchased(uuid) from public;
grant execute on function private.has_purchased(uuid) to authenticated;

create or replace function private.refresh_rating()
returns trigger language plpgsql security definer set search_path = '' as $$
declare v_product uuid := coalesce(new.product_id, old.product_id);
begin
  perform set_config('app.internal', 'on', true);
  update public.products p set
    rating_avg = coalesce((select round(avg(r.rating)::numeric, 2) from public.reviews r where r.product_id = v_product), 0),
    rating_count = (select count(*) from public.reviews r where r.product_id = v_product)
  where p.id = v_product;
  perform set_config('app.internal', 'off', true);
  return null;
end;
$$;
create trigger refresh_rating after insert or update or delete on public.reviews
  for each row execute function private.refresh_rating();

alter table public.reviews enable row level security;
create policy "reviews: public read" on public.reviews for select to anon, authenticated using (true);
create policy "reviews: buyers write" on public.reviews for insert to authenticated
  with check (user_id = (select auth.uid()) and (select private.has_purchased(product_id)));
create policy "reviews: own update" on public.reviews for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "reviews: own or admin delete" on public.reviews for delete to authenticated
  using (user_id = (select auth.uid()) or (select private.is_admin()));

create table public.wishlists (
  user_id uuid not null references public.profiles (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);
create index wishlists_product_idx on public.wishlists (product_id);
alter table public.wishlists enable row level security;
create policy "wishlists: own read" on public.wishlists for select to authenticated using (user_id = (select auth.uid()));
create policy "wishlists: own insert" on public.wishlists for insert to authenticated with check (user_id = (select auth.uid()));
create policy "wishlists: own delete" on public.wishlists for delete to authenticated using (user_id = (select auth.uid()));

-- ───────────────────────── videos ─────────────────────────
create table public.videos (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 2 and 160),
  description text not null default '',
  category text not null default 'Care tips',
  source text not null check (source in ('youtube', 'cloudinary')),
  youtube_id text check (youtube_id is null or youtube_id ~ '^[A-Za-z0-9_-]{6,20}$'),
  video_url text,
  thumbnail_url text,
  duration_seconds int,
  published boolean not null default true,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  check ((source = 'youtube' and youtube_id is not null) or (source = 'cloudinary' and video_url is not null))
);
create index videos_published_idx on public.videos (published, created_at desc);
alter table public.videos enable row level security;
create policy "videos: public read published" on public.videos for select to anon, authenticated
  using (published or (select private.is_admin()));
create policy "videos: admin insert" on public.videos for insert to authenticated with check ((select private.is_admin()));
create policy "videos: admin update" on public.videos for update to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "videos: admin delete" on public.videos for delete to authenticated using ((select private.is_admin()));

-- ───────────────────────── care requests ─────────────────────────
create table public.care_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  phone text not null check (char_length(phone) between 6 and 30),
  email text not null default '' check (char_length(email) <= 160),
  service text not null check (char_length(service) <= 80),
  town text not null default 'Assin Foso' check (char_length(town) <= 80),
  message text not null default '' check (char_length(message) <= 2000),
  status text not null default 'new' check (status in ('new', 'contacted', 'closed')),
  created_at timestamptz not null default now()
);
alter table public.care_requests enable row level security;
create policy "care_requests: anyone can submit" on public.care_requests for insert to anon, authenticated
  with check (status = 'new');
create policy "care_requests: admin read" on public.care_requests for select to authenticated using ((select private.is_admin()));
create policy "care_requests: admin update" on public.care_requests for update to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));

-- ───────────────────────── grants ─────────────────────────
grant select on public.categories, public.stores, public.products, public.reviews, public.videos to anon;
grant insert on public.care_requests to anon;
grant select, insert, update, delete on public.categories, public.stores, public.products, public.reviews,
  public.wishlists, public.videos, public.care_requests to authenticated;
grant select, update on public.profiles to authenticated;
grant select on public.orders, public.order_items to authenticated;
