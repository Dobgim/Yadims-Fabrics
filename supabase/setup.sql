-- =====================================================================
-- YADIMS Fabrics & Seams — complete database setup
--
-- PASTE THIS WHOLE FILE into the Supabase dashboard:
--     SQL Editor  ->  New query  ->  paste  ->  Run
--
-- It builds everything the site needs, in order:
--     1. Tables, enums, triggers, indexes
--     2. Row Level Security policies + storage buckets
--
-- It does NOT insert any fabrics, categories or photographs. The shop starts
-- empty on purpose: everything a customer sees is added by the owner through
-- the dashboard, so a photograph on the site is always cloth the shop has.
--
-- Safe to run more than once. Every statement is idempotent: tables use
-- CREATE ... IF NOT EXISTS, policies and triggers are dropped first, and
-- every seed row is keyed on its slug with ON CONFLICT DO NOTHING.
--
-- After running this, see supabase/make-admin.sql to grant yourself the
-- admin role. That is a separate, deliberate step.
-- =====================================================================


-- #####################################################################
-- PART 1 of 2 — Schema
-- #####################################################################

-- =====================================================================
-- YADIMS Fabrics & Seams — core schema
-- =====================================================================

create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";

-- ---------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------
do $$ begin
  create type user_role as enum ('customer', 'staff', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type product_status as enum ('draft', 'active', 'archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type order_status as enum
    ('pending','confirmed','processing','shipped','delivered','cancelled','refunded');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_status as enum ('unpaid','paid','refunded','failed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type post_status as enum ('draft','published');
exception when duplicate_object then null; end $$;

do $$ begin
  create type message_status as enum ('new','read','replied','archived');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------
-- Shared trigger: keep updated_at honest
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------------------------------------------------------------------
-- profiles (1:1 with auth.users)
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text not null,
  phone text,
  avatar_url text,
  role user_role not null default 'customer',
  marketing_opt_in boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-provision a profile whenever a user signs up.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Role check helper, used by policies. SECURITY DEFINER avoids RLS recursion
-- (a policy on profiles cannot itself SELECT profiles under RLS).
create or replace function public.is_staff(uid uuid default auth.uid())
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = uid and role in ('admin','staff')
  );
$$;

create or replace function public.is_admin(uid uuid default auth.uid())
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = uid and role = 'admin');
$$;

-- ---------------------------------------------------------------------
-- Catalogue
-- ---------------------------------------------------------------------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  parent_id uuid references public.categories(id) on delete set null,
  position int not null default 0,
  is_featured boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  tagline text,
  description text,
  cover_image_url text,
  accent_image_url text,
  position int not null default 0,
  is_featured boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  sku text unique,
  short_description text,
  description text,
  price numeric(12,2) not null check (price >= 0),
  compare_at_price numeric(12,2) check (compare_at_price >= 0),
  currency text not null default 'XAF',
  unit text not null default 'yard',
  material text,
  width_cm numeric(6,1),
  weight_gsm numeric(6,1),
  care_instructions text,
  origin text,
  colors text[] not null default '{}',
  tags text[] not null default '{}',
  images text[] not null default '{}',
  videos text[] not null default '{}',
  stock_quantity int not null default 0 check (stock_quantity >= 0),
  min_order_quantity int not null default 1 check (min_order_quantity >= 1),
  category_id uuid references public.categories(id) on delete set null,
  collection_id uuid references public.collections(id) on delete set null,
  status product_status not null default 'draft',
  is_featured boolean not null default false,
  is_new_arrival boolean not null default false,
  is_preorder boolean not null default false,
  preorder_deposit_percent integer not null default 60 check (preorder_deposit_percent between 1 and 100),
  rating_average numeric(3,2) not null default 0,
  rating_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

create index if not exists products_status_idx on public.products (status);
create index if not exists products_category_idx on public.products (category_id);
create index if not exists products_collection_idx on public.products (collection_id);
create index if not exists products_price_idx on public.products (price);
create index if not exists products_colors_idx on public.products using gin (colors);
create index if not exists products_tags_idx on public.products using gin (tags);
create index if not exists products_name_trgm_idx on public.products using gin (name gin_trgm_ops);

-- ---------------------------------------------------------------------
-- Content
-- ---------------------------------------------------------------------
create table if not exists public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  caption text,
  image_url text not null,
  category text not null default 'Store',
  aspect text not null default 'portrait' check (aspect in ('portrait','landscape','square')),
  position int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text not null,
  cover_image_url text,
  category text not null default 'Fabric Care',
  tags text[] not null default '{}',
  author_name text not null default 'YADIMS Editorial',
  author_avatar_url text,
  read_minutes int not null default 4,
  status post_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists blog_posts_set_updated_at on public.blog_posts;
create trigger blog_posts_set_updated_at
  before update on public.blog_posts
  for each row execute function public.set_updated_at();

create index if not exists blog_posts_status_idx on public.blog_posts (status, published_at desc);

-- ---------------------------------------------------------------------
-- Commerce
-- ---------------------------------------------------------------------
create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  label text not null default 'Home',
  full_name text not null,
  phone text not null,
  line1 text not null,
  line2 text,
  city text not null,
  region text,
  country text not null default 'Cameroon',
  postal_code text,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists addresses_user_idx on public.addresses (user_id);

-- Human-friendly order numbers: YF-2026-0001
create sequence if not exists public.order_number_seq start 1;

create or replace function public.generate_order_number()
returns text language sql volatile as $$
  select 'YF-' || to_char(now(), 'YYYY') || '-' ||
         lpad(nextval('public.order_number_seq')::text, 4, '0');
$$;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default public.generate_order_number(),
  user_id uuid references public.profiles(id) on delete set null,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  shipping_address jsonb not null default '{}'::jsonb,
  subtotal numeric(12,2) not null default 0,
  shipping_fee numeric(12,2) not null default 0,
  discount numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  currency text not null default 'XAF',
  status order_status not null default 'pending',
  payment_status payment_status not null default 'unpaid',
  payment_method text not null default 'cash_on_delivery',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

create index if not exists orders_user_idx on public.orders (user_id, created_at desc);
create index if not exists orders_status_idx on public.orders (status);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  product_image_url text,
  color text,
  unit_price numeric(12,2) not null,
  quantity int not null check (quantity > 0),
  line_total numeric(12,2) not null
);

create index if not exists order_items_order_idx on public.order_items (order_id);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  author_name text not null,
  rating int not null check (rating between 1 and 5),
  title text,
  body text not null,
  is_approved boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists reviews_product_idx on public.reviews (product_id, is_approved);

-- Denormalised rating cache on products, kept in sync by trigger.
create or replace function public.refresh_product_rating()
returns trigger language plpgsql as $$
declare
  target uuid := coalesce(new.product_id, old.product_id);
begin
  update public.products p
  set rating_average = coalesce(agg.avg_rating, 0),
      rating_count   = coalesce(agg.n, 0)
  from (
    select avg(rating)::numeric(3,2) as avg_rating, count(*) as n
    from public.reviews
    where product_id = target and is_approved
  ) agg
  where p.id = target;
  return null;
end $$;

drop trigger if exists reviews_refresh_rating on public.reviews;
create trigger reviews_refresh_rating
  after insert or update or delete on public.reviews
  for each row execute function public.refresh_product_rating();

create table if not exists public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

-- ---------------------------------------------------------------------
-- Marketing / ops
-- ---------------------------------------------------------------------
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  subject text not null,
  message text not null,
  status message_status not null default 'new',
  created_at timestamptz not null default now()
);

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  source text not null default 'footer',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

drop trigger if exists settings_set_updated_at on public.settings;
create trigger settings_set_updated_at
  before update on public.settings
  for each row execute function public.set_updated_at();


-- #####################################################################
-- PART 2 of 2 — Row Level Security and storage
-- #####################################################################

-- =====================================================================
-- Row Level Security
--
-- Model:
--   * Catalogue + published content  -> readable by anyone (incl. anon)
--   * Customer-owned rows            -> readable/writable by the owner only
--   * Everything else                -> staff/admin only
-- =====================================================================

alter table public.profiles              enable row level security;
alter table public.categories            enable row level security;
alter table public.collections           enable row level security;
alter table public.products              enable row level security;
alter table public.gallery_items         enable row level security;
alter table public.blog_posts            enable row level security;
alter table public.addresses             enable row level security;
alter table public.orders                enable row level security;
alter table public.order_items           enable row level security;
alter table public.reviews               enable row level security;
alter table public.wishlist_items        enable row level security;
alter table public.contact_messages      enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.settings              enable row level security;

-- ------------------------------ profiles -----------------------------
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (id = auth.uid() or public.is_staff());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- A policy cannot compare a column's old value with its new one, so
-- `profiles_update_own` above cannot tell "changing my name" from "making
-- myself an admin" — both are an update to my own row. This trigger draws
-- that line: a role change requires an admin, or the server's service-role
-- key (which has no auth.uid()).
create or replace function public.guard_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role
     and auth.uid() is not null
     and not public.is_admin()
  then
    raise exception 'Only an admin may change a role'
      using errcode = 'insufficient_privilege';
  end if;

  return new;
end $$;

drop trigger if exists profiles_guard_role on public.profiles;
create trigger profiles_guard_role
  before update on public.profiles
  for each row execute function public.guard_profile_role();


drop policy if exists "profiles_admin_all" on public.profiles;
create policy "profiles_admin_all" on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

-- --------------------- public catalogue + content ---------------------
drop policy if exists "categories_public_read" on public.categories;
create policy "categories_public_read" on public.categories for select using (true);

drop policy if exists "categories_staff_write" on public.categories;
create policy "categories_staff_write" on public.categories
  for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists "collections_public_read" on public.collections;
create policy "collections_public_read" on public.collections for select using (true);

drop policy if exists "collections_staff_write" on public.collections;
create policy "collections_staff_write" on public.collections
  for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists "products_public_read" on public.products;
create policy "products_public_read" on public.products
  for select using (status = 'active' or public.is_staff());

drop policy if exists "products_staff_write" on public.products;
create policy "products_staff_write" on public.products
  for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists "gallery_public_read" on public.gallery_items;
create policy "gallery_public_read" on public.gallery_items
  for select using (is_published or public.is_staff());

drop policy if exists "gallery_staff_write" on public.gallery_items;
create policy "gallery_staff_write" on public.gallery_items
  for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists "posts_public_read" on public.blog_posts;
create policy "posts_public_read" on public.blog_posts
  for select using (status = 'published' or public.is_staff());

drop policy if exists "posts_staff_write" on public.blog_posts;
create policy "posts_staff_write" on public.blog_posts
  for all using (public.is_staff()) with check (public.is_staff());

-- ---------------------------- addresses ------------------------------
drop policy if exists "addresses_own" on public.addresses;
create policy "addresses_own" on public.addresses
  for all using (user_id = auth.uid() or public.is_staff())
  with check (user_id = auth.uid() or public.is_staff());

-- ------------------------------ orders -------------------------------
drop policy if exists "orders_select_own" on public.orders;
create policy "orders_select_own" on public.orders
  for select using (user_id = auth.uid() or public.is_staff());

-- Guests may place orders (user_id null); signed-in users only for themselves.
drop policy if exists "orders_insert" on public.orders;
create policy "orders_insert" on public.orders
  for insert with check (user_id is null or user_id = auth.uid());

drop policy if exists "orders_staff_write" on public.orders;
create policy "orders_staff_write" on public.orders
  for update using (public.is_staff()) with check (public.is_staff());

drop policy if exists "order_items_select" on public.order_items;
create policy "order_items_select" on public.order_items
  for select using (
    public.is_staff()
    or exists (
      select 1 from public.orders o
      where o.id = order_items.order_id and o.user_id = auth.uid()
    )
  );

drop policy if exists "order_items_insert" on public.order_items;
create policy "order_items_insert" on public.order_items
  for insert with check (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and (o.user_id is null or o.user_id = auth.uid() or public.is_staff())
    )
  );

-- ------------------------------ reviews ------------------------------
drop policy if exists "reviews_public_read" on public.reviews;
create policy "reviews_public_read" on public.reviews
  for select using (is_approved or user_id = auth.uid() or public.is_staff());

drop policy if exists "reviews_insert_authed" on public.reviews;
create policy "reviews_insert_authed" on public.reviews
  for insert with check (auth.uid() is not null and user_id = auth.uid());

drop policy if exists "reviews_staff_write" on public.reviews;
create policy "reviews_staff_write" on public.reviews
  for all using (public.is_staff()) with check (public.is_staff());

-- ----------------------------- wishlist ------------------------------
drop policy if exists "wishlist_own" on public.wishlist_items;
create policy "wishlist_own" on public.wishlist_items
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ------------------------- contact / newsletter ----------------------
drop policy if exists "messages_insert_anyone" on public.contact_messages;
create policy "messages_insert_anyone" on public.contact_messages
  for insert with check (true);

drop policy if exists "messages_staff_read" on public.contact_messages;
create policy "messages_staff_read" on public.contact_messages
  for select using (public.is_staff());

drop policy if exists "messages_staff_write" on public.contact_messages;
create policy "messages_staff_write" on public.contact_messages
  for update using (public.is_staff()) with check (public.is_staff());

drop policy if exists "newsletter_insert_anyone" on public.newsletter_subscribers;
create policy "newsletter_insert_anyone" on public.newsletter_subscribers
  for insert with check (true);

drop policy if exists "newsletter_staff_read" on public.newsletter_subscribers;
create policy "newsletter_staff_read" on public.newsletter_subscribers
  for select using (public.is_staff());

drop policy if exists "newsletter_staff_write" on public.newsletter_subscribers;
create policy "newsletter_staff_write" on public.newsletter_subscribers
  for all using (public.is_staff()) with check (public.is_staff());

-- ----------------------------- settings ------------------------------
drop policy if exists "settings_public_read" on public.settings;
create policy "settings_public_read" on public.settings for select using (true);

drop policy if exists "settings_admin_write" on public.settings;
create policy "settings_admin_write" on public.settings
  for all using (public.is_admin()) with check (public.is_admin());

-- =====================================================================
-- Storage buckets
-- =====================================================================
insert into storage.buckets (id, name, public)
values ('products', 'products', true),
       ('gallery',  'gallery',  true),
       ('blog',     'blog',     true),
       ('avatars',  'avatars',  true)
on conflict (id) do nothing;

drop policy if exists "media_public_read" on storage.objects;
create policy "media_public_read" on storage.objects
  for select using (bucket_id in ('products','gallery','blog','avatars'));

drop policy if exists "media_staff_write" on storage.objects;
create policy "media_staff_write" on storage.objects
  for all to authenticated
  using (bucket_id in ('products','gallery','blog') and public.is_staff())
  with check (bucket_id in ('products','gallery','blog') and public.is_staff());

-- Users manage their own avatar, stored under `avatars/<uid>/…`
drop policy if exists "avatars_own_write" on storage.objects;
create policy "avatars_own_write" on storage.objects
  for all to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);


-- #####################################################################
-- Done.
--
-- Check it worked — this should list 14 tables:
--     select table_name from information_schema.tables
--     where table_schema = 'public' order by table_name;
--
-- Next: create the owner's user under Authentication -> Users, then run
-- supabase/make-admin.sql. After that, add fabrics from /admin.
-- #####################################################################
