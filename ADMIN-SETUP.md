# Setting up the YADIMS dashboard

The storefront runs on its own — the fabrics you see now are bundled with the
site. The **dashboard** is different: it needs a database, because that is where
the fabrics you add have to live.

This is a one-time setup. Budget about fifteen minutes. It is free.

---

## 1. Create the database

1. Go to **[supabase.com](https://supabase.com)** and sign up.
2. **New project**. Give it a name (`yadims-fabrics`), choose a region close to
   Cameroon — **West EU (London)** or **Central EU (Frankfurt)** are the nearest
   — and set a database password.
3. **Save that password somewhere safe.** It cannot be shown again.

Wait a minute or two while the project provisions.

---

## 2. Create the tables

In the Supabase dashboard, open **SQL Editor** → **New query**.

Open **`supabase/setup.sql`**, copy the whole file, paste it into the editor and
click **Run**. That is the entire database — one paste.

It contains three parts, in the order they have to run:

1. **Schema** — 14 tables, enums, indexes, triggers
2. **Security** — Row Level Security policies and the four storage buckets
3. **Starter catalogue** — the fabrics, categories and collections the site
   currently shows, so the shop is not empty on the first load

Part 2 is not optional. It is what stops a customer reading another customer's
orders, and what allows you — and only you — to upload images.

The whole file is safe to run again. If a step fails halfway, fix it and re-run
the lot; nothing is duplicated.

To check it worked, run:

```sql
select table_name from information_schema.tables
where table_schema = 'public' order by table_name;
```

You should get 14 rows, from `addresses` through to `wishlist_items`.

> The individual files in `supabase/migrations/` and `supabase/seed.sql` are the
> same SQL, split up. Use `setup.sql` unless you have a reason not to.

---

## 3. Copy the keys

**This is already done for this project** — `.env.local` is filled in with the
project URL and anon key.

One key is still missing, and the dashboard is slower without it: the
**service-role key**. In Supabase go to **Project Settings** → **API**, copy the
`service_role` `secret` value, and paste it into `.env.local`:

```
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
```

Everything works without it — the dashboard falls back to your own signed-in
permissions, which the staff policies already allow. It mainly matters for
reading across every customer's rows at once, such as the analytics totals.

For reference, the three values come from **Project Settings** → **API**:

| On that page | Goes into `.env.local` as |
| --- | --- |
| Project URL | `NEXT_PUBLIC_SUPABASE_URL` |
| `anon` `public` key | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| `service_role` `secret` key | `SUPABASE_SERVICE_ROLE_KEY` |

So `.env.local` in this folder ends up looking like:

```
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijkl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_WHATSAPP_NUMBER=237677693901
```

> **The service-role key bypasses every security rule in the database.**
> It belongs in `.env.local` and in Vercel's environment variables, and nowhere
> else. Never paste it into a chat, an email, or a file that gets committed.
> `.env.local` is already in `.gitignore` — leave it there.

Restart the dev server after editing `.env.local`; environment variables are
read once at boot.

---

## 4. Make yourself the admin

1. Start the site and go to **`/sign-up`**. Register with the email address you
   want to use as the shop's login, and a password of your choosing.
2. Confirm the address from the email Supabase sends you.
3. Back in Supabase → **SQL Editor**, open `supabase/make-admin.sql`, change the
   email on line 16 to the one you just used, and run it.
4. Sign out and sign in again. The session carries your role, so it needs
   refreshing once.

> **To skip the confirmation email** while you are setting up: Supabase →
> **Authentication** → **Sign In / Providers** → **Email**, turn off *Confirm
> email*, and sign-up becomes instant. Turn it back on before you take real
> customers, or anyone can register under an address they do not own.

Now **`/admin`** opens, and a **Dashboard** link appears at the top of your
account page.

There is no button anywhere on the site that grants the admin role. That is the
point — the only way to become an admin is to hold the database password.

---

## 5. Add your first fabric

**Admin → Products → New product.**

- **Photographs.** Drag them in, or click to choose. They upload straight to
  Supabase Storage. The first image is what shows on the shop grid, and you can
  reorder them with the arrows. Daylight, plain background, up to 8 MB each.
- **Price** is per unit — set *Sold by* to the yard, the metre, the piece.
- **Stock on hand** is what the storefront calls sold out at zero. Keep it honest.
- **Status** starts as *Draft*, which is invisible to customers. Switch it to
  *Active* when you are ready.

Everything else in the dashboard works the same way: **Categories** and
**Collections** open a panel, **Gallery** takes store photographs, **Journal**
writes articles.

---

## 6. Going live on Vercel

Add the same variables in **Vercel → Project → Settings → Environment
Variables**, with two changes:

- `NEXT_PUBLIC_SITE_URL` becomes your real domain
- everything else is copied across as-is

Then in Supabase → **Authentication** → **URL Configuration**, set the **Site
URL** to your domain and add `https://yourdomain.com/**` to the redirect
allow-list, or the confirmation emails will point at `localhost`.

---

## Troubleshooting

**`/admin` sends me to my account page.**
Your profile is still `customer`. Re-run step 4, then sign out and back in.

**Images upload but do not appear.**
The `20250101000001_rls.sql` migration creates the storage buckets. Run it if
you skipped it. Check **Storage** in Supabase — you should see `products`,
`gallery`, `blog` and `avatars`.

**"Connect Supabase to make changes."**
The app cannot see your keys. Check `.env.local` for typos and restart the dev
server.

**Upload fails with a permissions error.**
Storage writes are limited to staff and admin. Same fix as the first item.

**I want to remove a fabric that has been ordered.**
You cannot, and you should not — it would tear a hole in the order history.
Set its status to *Archived* instead. It disappears from the shop and stays on
the invoices.
