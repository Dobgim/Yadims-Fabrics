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
  stock_quantity int not null default 0 check (stock_quantity >= 0),
  min_order_quantity int not null default 1 check (min_order_quantity >= 1),
  category_id uuid references public.categories(id) on delete set null,
  collection_id uuid references public.collections(id) on delete set null,
  status product_status not null default 'draft',
  is_featured boolean not null default false,
  is_new_arrival boolean not null default false,
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
