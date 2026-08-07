-- =====================================================================
-- YADIMS Fabrics & Seams — complete database setup
--
-- PASTE THIS WHOLE FILE into the Supabase dashboard:
--     SQL Editor  ->  New query  ->  paste  ->  Run
--
-- It builds everything the site needs, in order:
--     1. Tables, enums, triggers, indexes
--     2. Row Level Security policies + storage buckets
--     3. Starter catalogue so the shop is not empty on first load
--
-- Safe to run more than once. Every statement is idempotent: tables use
-- CREATE ... IF NOT EXISTS, policies and triggers are dropped first, and
-- every seed row is keyed on its slug with ON CONFLICT DO NOTHING.
--
-- After running this, see supabase/make-admin.sql to grant yourself the
-- admin role. That is a separate, deliberate step.
-- =====================================================================


-- #####################################################################
-- PART 1 of 3 — Schema
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


-- #####################################################################
-- PART 2 of 3 — Row Level Security and storage
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
-- PART 3 of 3 — Starter catalogue
-- #####################################################################

-- =====================================================================
-- Seed data for YADIMS Fabrics & Seams
--
-- Mirrors src/data/catalogue.ts so a freshly provisioned database matches
-- what the storefront already shows. Safe to re-run: every insert is
-- idempotent on its slug.
--
-- Image paths point at files committed in `public/`, so they resolve on
-- any deployment without depending on a third-party CDN.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Categories — the fabric types actually stocked
-- ---------------------------------------------------------------------
insert into public.categories (name, slug, description, image_url, position, is_featured) values
  ('Italian Silk', 'italian-silk', 'Charmeuse, mikado and duchess satin woven in Como. Bought direct, which is why it sits below imported equivalents.', '/fabrics/cat-silk.jpg', 1, true),
  ('Stone & Beaded Lace', 'stone-beaded-lace', 'Hand-set stones, pearls and glass beading on a net ground. The most requested cloth in the shop.', '/fabrics/cat-stone-lace.jpg', 2, true),
  ('Jacquard', 'jacquard', 'Motifs woven into the cloth rather than printed on it, so the pattern reads from both faces and never lifts.', '/fabrics/cat-jacquard.jpg', 3, true),
  ('Brocade & Organza Brocade', 'brocade', 'Metallic-thread brocade with the weight for ceremony, plus organza brocade where the motif floats on a sheer ground.', '/fabrics/cat-brocade.jpg', 4, true),
  ('Organza', 'organza', 'Crisp sheers that hold their own volume — where chiffon falls, organza stands.', '/fabrics/cat-organza.jpg', 5, true),
  ('Crepe', 'crepe', 'Matte, pebbled and forgiving. The workhorse of a well-made wardrobe.', '/fabrics/cat-crepe.jpg', 6, true),
  ('Chiffon', 'chiffon', 'Featherweight sheers that move with the wearer.', '/fabrics/cat-chiffon.jpg', 7, true),
  ('Linen', 'linen', 'Stone-washed European flax that arrives already softened. Breathable in real heat.', '/fabrics/cat-linen-new.jpg', 8, true),
  ('Ankara', 'ankara', 'Genuine double-sided wax, sold as a full six-yard piece. Matched dye lots held for aso-ebi parties.', '/fabrics/cat-wax.jpg', 9, true)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------
-- Collections — grouped by what the cloth is for
-- ---------------------------------------------------------------------
insert into public.collections (name, slug, tagline, description, cover_image_url, accent_image_url, position, is_featured) values
  ('Stone & Beaded Lace', 'stone-lace', 'Hand-set, endlessly detailed',
   'The most requested cloth in the shop. Stones, pearls and glass beading set by hand on a fine net ground.',
   '/fabrics/col-stone-lace-cover.jpg', '/fabrics/col-stone-lace-accent.jpg', 1, true),
  ('Wedding Collection', 'wedding', 'For the day everything is measured against',
   'Everything a wedding party needs under one roof: gown fabrics, aso-ebi in matched dye lots, and lining that behaves under studio light.',
   '/fabrics/col-wedding.jpg', '/fabrics/col-wedding-accent.jpg', 2, true),
  ('Traditional Collection', 'traditional', 'Heritage cloth, honestly sourced',
   'Wax prints, brocade and hand-stamped adire bought directly from the mills and artisan houses that make them.',
   '/fabrics/col-traditional.jpg', '/fabrics/col-traditional-accent.jpg', 3, true),
  ('Evening Collection', 'evening', 'Cloth that catches the light',
   'Duchess satin, silk crepe and metallic jacquard — fabrics with enough body to hold a silhouette across a long night.',
   '/fabrics/col-evening.jpg', '/fabrics/col-evening-accent.jpg', 4, true),
  ('Bridal Collection', 'bridal', 'Ivory, blush and every white in between',
   'Twelve distinct whites, swatched side by side, so you can choose against skin tone rather than against a screen.',
   '/fabrics/col-bridal.jpg', '/fabrics/col-bridal-accent.jpg', 5, true),
  ('Premium Collection', 'premium', 'The top of the house',
   'Limited-length bolts from European and Asian mills. When a premium piece sells out, it rarely returns.',
   '/fabrics/col-premium.jpg', '/fabrics/col-premium-accent.jpg', 6, true),
  ('New Arrivals', 'new-arrivals', 'Just off the bolt',
   'The most recent additions to the shelves, updated as stock lands.',
   '/fabrics/col-new.jpg', '/fabrics/col-new-accent.jpg', 7, true)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------
-- Products
--
-- One representative line per category. category_id / collection_id are
-- resolved by slug so this file has no dependency on generated UUIDs.
-- Add the rest of the shelf through the dashboard.
-- ---------------------------------------------------------------------
insert into public.products (
  name, slug, sku, short_description, description, price, compare_at_price, currency, unit,
  material, width_cm, weight_gsm, care_instructions, origin, colors, tags, images,
  stock_quantity, category_id, collection_id, status, is_featured, is_new_arrival,
  rating_average, rating_count
)
select
  v.name, v.slug, v.sku, v.short_description, v.description, v.price, v.compare_at_price,
  'XAF', 'yard', v.material, v.width_cm, v.weight_gsm, v.care_instructions, v.origin,
  v.colors, v.tags, v.images, v.stock_quantity,
  (select id from public.categories c where c.slug = v.category_slug),
  (select id from public.collections co where co.slug = v.collection_slug),
  'active', v.is_featured, v.is_new_arrival, v.rating_average, v.rating_count
from (values
  ('Italian Silk Charmeuse', 'italian-silk-charmeuse', 'YF-0001',
   '19 momme charmeuse with a lacquered face and matte crepe reverse.',
   'Grade 6A filament woven at 19 momme in Como. Heavy enough to fall in a clean column, light enough for a bias cut. The satin face has a wet shine; the reverse is a soft crepe, so a single fabric gives you two finishes in one garment.',
   46500::numeric, 52000::numeric, '100% Mulberry silk', 140::numeric, 92::numeric,
   'Dry clean recommended. Hand wash cold with pH-neutral soap if you must; hang to dry away from direct sun.',
   'Woven in Como, Italy',
   array['Champagne','Emerald','Onyx','Bordeaux','Pearl'], array['italian silk','charmeuse','premium'],
   array['/fabrics/p-silk-teal.jpg','/fabrics/p-silk-navy.jpg'],
   54, 'italian-silk', 'premium', true, false, 0::numeric, 0),

  ('Stone-Beaded French Lace', 'stone-beaded-french-lace', 'YF-0002',
   'Hand-set stones and pearls on a fine French net.',
   'Every stone is set by hand, which is the reason no two metres are quite identical. The net ground is fine enough to disappear against skin, so the beading appears to sit directly on the wearer.',
   96500::numeric, null::numeric, 'Nylon net, glass stone, pearl', 130::numeric, 240::numeric,
   'Dry clean by a specialist familiar with beaded goods. Store rolled, never folded.',
   'Net milled in France, beaded by hand in India',
   array['Ivory','Champagne','Silver','Blush'], array['stone lace','beaded','bridal','premium'],
   array['/fabrics/p-stone-pearl.jpg','/fabrics/p-stone-bridal.jpg'],
   11, 'stone-beaded-lace', 'stone-lace', true, false, 0::numeric, 0),

  ('Metallic Jacquard', 'metallic-jacquard', 'YF-0003',
   'Woven-in metallic motif with real ceremonial weight.',
   'The pattern is woven rather than printed, so it appears on both faces and will never crack or lift. Weighty enough for agbada, kaftan and full ceremonial skirts.',
   44500::numeric, null::numeric, 'Viscose / Metallic thread', 145::numeric, 250::numeric,
   'Dry clean only. Press on the reverse at a low temperature.',
   'Woven in India',
   array['Antique Gold','Rose Gold','Emerald Gold','Royal Multi'], array['jacquard','metallic','evening'],
   array['/fabrics/p-jacquard-metallic.jpg','/fabrics/p-jacquard-pattern.jpg'],
   34, 'jacquard', 'evening', true, false, 0::numeric, 0),

  ('Organza Brocade', 'organza-brocade', 'YF-0004',
   'A brocade motif floating on a sheer organza ground.',
   'All the presence of a brocade with none of the weight — the metallic motif is woven onto a crisp organza, so the cloth stands away from the body while remaining translucent between the figures.',
   52000::numeric, null::numeric, 'Organza ground, metallic thread', 135::numeric, 120::numeric,
   'Dry clean. Steam only; a hot plate will flatten the ground.',
   'Woven in India',
   array['Champagne Gold','Ivory Silver','Blush Gold','Emerald Gold'], array['brocade','organza','premium'],
   array['/fabrics/p-organza-peach.jpg','/fabrics/p-brocade-detail.jpg'],
   16, 'brocade', 'premium', true, true, 0::numeric, 0),

  ('Silk Organza', 'silk-organza', 'YF-0005',
   'True silk organza — crisper, finer and far more alive than polyester.',
   'Silk organza has a spring that no synthetic reproduces: it creases sharply, holds a pleat, and recovers. Used as interfacing by couture houses as often as it is used as a face fabric.',
   34500::numeric, null::numeric, '100% Silk organza', 140::numeric, 40::numeric,
   'Dry clean. Press on the lowest setting under a cloth.',
   'Woven in China',
   array['Ivory','Champagne','Powder Blue','Onyx'], array['organza','silk','premium','sheer'],
   array['/fabrics/p-organza-blue.jpg','/fabrics/p-organza-black.jpg'],
   29, 'organza', 'premium', true, false, 0::numeric, 0),

  ('Silk Crepe', 'silk-crepe', 'YF-0006',
   'Matte silk crepe with a fine pebbled surface and heavy fall.',
   'The fabric to reach for when a garment must look expensive without shining. A dry, pebbled hand, a weight that falls straight, and no glare under camera.',
   37500::numeric, null::numeric, '100% Silk crepe', 140::numeric, 110::numeric,
   'Dry clean. Press on the reverse at a low temperature.',
   'Woven in Italy',
   array['Sage','Ivory','Terracotta','Onyx','Bordeaux'], array['crepe','silk','premium'],
   array['/fabrics/p-crepe-sage.jpg','/fabrics/p-crepe-ivory.jpg'],
   43, 'crepe', 'premium', true, false, 0::numeric, 0),

  ('Silk Chiffon', 'silk-chiffon', 'YF-0007',
   'Featherweight silk sheer with a faint grainy texture.',
   'Airy, matte and slightly crisp rather than slippery. Ideal for layered overskirts, floating sleeves and anything meant to move on its own.',
   29500::numeric, null::numeric, '100% Silk', 140::numeric, 45::numeric,
   'Dry clean. Press on the lowest setting under a cloth.',
   'Woven in China',
   array['Blush','Ivory','Dusty Rose','Charcoal','Sea Glass'], array['chiffon','silk','sheer'],
   array['/fabrics/p-chiffon-blue.jpg','/fabrics/p-chiffon-lilac.jpg'],
   58, 'chiffon', 'evening', true, false, 0::numeric, 0),

  ('Washed European Linen', 'washed-european-linen', 'YF-0008',
   'Stone-washed flax that arrives already softened.',
   'Pre-washed at the mill, so it has done most of its shrinking and all of its softening before you cut it. Mid-weight — substantial enough for a structured shirt or unlined jacket, still breathable in real heat.',
   23500::numeric, null::numeric, '100% Linen', 145::numeric, 185::numeric,
   'Machine wash warm. Tumble dry low and remove slightly damp; the creases are part of it.',
   'Woven in Lithuania',
   array['Natural','Cream','Sage','Terracotta','Ink'], array['linen','natural','tailoring'],
   array['/fabrics/p-linen-cream.jpg','/fabrics/p-linen-natural.jpg'],
   104, 'linen', 'premium', true, false, 0::numeric, 0),

  ('Premium Wax Print — Royal', 'premium-wax-print-royal', 'YF-0009',
   'Full six-yard piece, true wax, matched dye lots available.',
   'Genuine double-sided wax with the crackle veining that only comes from a real resist process — the colour reads identically from either face. Sold as a full six-yard piece.',
   24000::numeric, null::numeric, '100% Cotton', 118::numeric, 160::numeric,
   'Machine wash cold, inside out, with like colours. Iron while slightly damp.',
   'Printed in Ghana',
   array['Indigo','Ochre','Emerald','Crimson'], array['ankara','wax','traditional'],
   array['/fabrics/p-wax-1.jpg','/fabrics/p-wax-3.jpg'],
   86, 'ankara', 'traditional', true, false, 0::numeric, 0)
) as v(
  name, slug, sku, short_description, description, price, compare_at_price, material,
  width_cm, weight_gsm, care_instructions, origin, colors, tags, images, stock_quantity,
  category_slug, collection_slug, is_featured, is_new_arrival, rating_average, rating_count
)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------
-- Gallery
-- ---------------------------------------------------------------------
insert into public.gallery_items (title, caption, image_url, category, aspect, position) values
  ('The Bolt Wall', 'Floor to ceiling, sorted by weight rather than colour.', '/fabrics/g-shop-2.jpg', 'Store', 'portrait', 0),
  ('Silk Shelf', 'Charmeuse and duchess satin, folded on the bias.', '/fabrics/g-shelf-silk.jpg', 'Fabric Displays', 'portrait', 1),
  ('The Lace Table', 'Where every bridal decision actually gets made.', '/fabrics/g-lace-table.jpg', 'Fabric Displays', 'landscape', 2),
  ('Cotton Rolls', 'Solid cottons and poplins in forty shades.', '/fabrics/g-cotton-rolls.jpg', 'New Stock', 'portrait', 3),
  ('Stone Lace, Under Light', 'Hand-set stones on a fine net ground.', '/fabrics/p-stone-pearl.jpg', 'Fabric Displays', 'square', 4),
  ('Wax, Worn', 'A six-yard piece, cut and sewn by a customer.', '/fabrics/p-wax-1.jpg', 'Customer Showcase', 'portrait', 5),
  ('At the Machine', 'The part nobody photographs and everybody feels.', '/fabrics/g-tailor-1.jpg', 'Events', 'landscape', 6),
  ('Finishing', 'A hem pressed before it leaves the counter.', '/fabrics/g-tailor-2.jpg', 'Customer Showcase', 'portrait', 7),
  ('Opening Up', 'The shop at eight in the morning.', '/fabrics/g-shop-3.jpg', 'Events', 'landscape', 8)
on conflict do nothing;

-- ---------------------------------------------------------------------
-- Settings
-- ---------------------------------------------------------------------
insert into public.settings (key, value) values
  ('shipping', '{"free_threshold": 50000, "local_fee": 2500, "national_fee": 4500, "currency": "XAF"}'::jsonb),
  ('store', '{"name": "YADIMS Fabrics & Seams", "tagline": "The Art of Fine Fabrics", "city": "Yaoundé", "address": "Tam-Tam, Opposite Bali Hotel"}'::jsonb)
on conflict (key) do nothing;

-- ---------------------------------------------------------------------
-- Promote your first account to admin
--
-- Sign up through /sign-up, then run this with your address:
--
--   update public.profiles set role = 'admin' where email = 'you@example.com';
-- ---------------------------------------------------------------------


-- #####################################################################
-- Done.
--
-- Check it worked — this should list 14 tables:
--     select table_name from information_schema.tables
--     where table_schema = 'public' order by table_name;
--
-- Next: sign up at /sign-up, then run supabase/make-admin.sql.
-- #####################################################################
