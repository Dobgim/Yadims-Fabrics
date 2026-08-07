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
