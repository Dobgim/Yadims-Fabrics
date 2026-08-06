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

Run these two files, in this order, pasting the whole contents of each and
clicking **Run**:

1. `supabase/migrations/20250101000000_init.sql` — tables, indexes, triggers
2. `supabase/migrations/20250101000001_rls.sql` — security rules and storage buckets

The second one is not optional. It is what stops a customer reading another
customer's orders, and what allows you — and only you — to upload images.

Optionally run `supabase/seed.sql` afterwards to fill the shop with the
starting catalogue. Skip it if you would rather add every fabric yourself.

---

## 3. Copy the three keys

In Supabase: **Project Settings** → **API**.

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
   want to use as the shop's login.
2. Back in Supabase → **SQL Editor**, open `supabase/make-admin.sql`, change the
   email on line 16 to the one you just used, and run it.
3. Sign out and sign in again. The session carries your role, so it needs
   refreshing once.

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
