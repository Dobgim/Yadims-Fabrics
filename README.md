# YADIMS Fabrics & Seams

> The Art of Fine Fabrics

A production-ready luxury fabric storefront and admin dashboard, built with Next.js 15, React 19,
TypeScript, Tailwind CSS, shadcn/ui, Framer Motion and Supabase.

---

## Quick start

```bash
npm install
cp .env.example .env.local   # optional — the site runs without it
npm run dev
```

Open <http://localhost:3000>.

**Every photograph on the site is uploaded by the shop.** There is no stock photography and no
bundled demo catalogue: fabrics, categories, collections and gallery images all come from Supabase,
so a picture on the storefront is always cloth the shop actually has. With no database connected the
storefront renders as an empty shop rather than inventing stock.

The shop has **no customer accounts**. One person runs it: orders are placed as a guest, and the
single sign-in belongs to the owner, on her way to the dashboard.

---

## Architecture

| Layer | Where | Notes |
| --- | --- | --- |
| Routing | `src/app` | Route groups: `(shop)` storefront, `(auth)` sign-in flows, `admin` dashboard |
| Data access | `src/lib/queries/*` | The only place Supabase is touched; components never query directly |
| Fallback content | `src/data/*` | Curated catalogue, gallery, policies |
| Server actions | `src/app/actions/*` | All writes; every one returns the same `ActionResult` shape |
| Validation | `src/lib/validations.ts` | Zod schemas shared by client forms and server actions |
| Design tokens | `src/app/globals.css`, `tailwind.config.ts` | CSS variables + brand scales |
| Motion | `src/lib/motion.ts` | Shared variants and easing, so animation is consistent site-wide |

**Server Components by default.** Client Components are used only where interaction demands it:
cart, filters, carousels, forms, the lightbox.

**Pricing lives in one file.** `src/lib/pricing.ts` is read by the cart, the checkout summary and
the order record, so those three can never disagree about what a customer owes.

**Prices are never trusted from the client.** `placeOrder` re-reads every price from the catalogue
server-side before writing an order.

---

## Pages

**Storefront** — Home, Shop (search / category / collection / material / colour / price filters,
sort, grid–list toggle, pagination, quick view), Product detail (zoom gallery, specs, care,
WhatsApp enquiry, related), Collections + detail, Gallery (masonry + lightbox), Services,
About, FAQs, Contact (Google Maps), Wishlist, Cart, guest Checkout.

**Legal** — Privacy Policy, Shipping Policy, Return Policy, Terms & Conditions. All four are
authored in `src/data/legal.ts` and rendered by one component.

**Admin** — Overview, Analytics, Products, Categories, Collections, Orders, Customers, Gallery,
Messages, Newsletter, Media Library, Settings.

Plus a custom 404, route-level loading UI and an error boundary.

---

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com) and copy the URL, anon key and
   service-role key into `.env.local`.
2. In the SQL editor, paste and run `supabase/setup.sql` — schema, RLS policies and storage
   buckets, in one go. It seeds no content; the shop starts empty and is filled from `/admin`.
3. Create the owner's user in Supabase → Authentication → Users → Add user, then promote it:
   ```sql
   update public.profiles set role = 'admin' where email = 'you@example.com';
   ```
4. Turn off Authentication → Sign In / Providers → Email → *Allow new users to sign up*.
5. Sign in at `/sign-in`.

Full walkthrough in [ADMIN-SETUP.md](ADMIN-SETUP.md).

### Security model

- Catalogue and published content are readable by anyone, including anonymous visitors.
- Orders may be placed by a guest; only staff can read them back.
- Everything else requires `staff` or `admin`, checked through `SECURITY DEFINER` helpers
  (`public.is_staff()` / `public.is_admin()`) so a policy on `profiles` cannot recurse into itself.
- `proxy.ts` guards `/admin` — the only gated area — and every admin server action
  re-checks the caller's role against the session — a route guard alone is not enough when an
  action can be invoked directly.
- Role changes are admin-only, so staff cannot promote themselves.
- The service-role key is used only in `createAdminClient()`, which is `server-only`.

---

## Environment

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | for accounts | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | for accounts | Public client key |
| `SUPABASE_SERVICE_ROLE_KEY` | for admin | Cross-customer reads. Server-only — never expose |
| `NEXT_PUBLIC_SITE_URL` | for SEO | Canonical URLs, sitemap, auth redirects |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | no | Contact map. Falls back to a Maps link |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | no | Builds `wa.me` deep links |

---

## Scripts

```bash
npm run dev        # development server
npm run build      # production build
npm run start      # serve the production build
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
```

---

## Deploying to Vercel

1. Push to GitHub and import the repository into Vercel.
2. Add the environment variables above (mark `SUPABASE_SERVICE_ROLE_KEY` server-only).
3. Set `NEXT_PUBLIC_SITE_URL` to the production domain — the sitemap, canonical tags and auth
   callbacks all read it.
4. In Supabase → Authentication → URL Configuration, add `https://your-domain/auth/callback` as a
   redirect URL.

`next.config.ts` adds the Supabase storage hostname to `images.remotePatterns` automatically from
`NEXT_PUBLIC_SUPABASE_URL`.

---

## Design system

**Colour** — Primary `#0E6B43`, Dark `#084B2A`, Gold `#D4AF37`, on a warm paper canvas rather than
a clinical white. Full 50–900 scales as `brand-*` and `gold-*`; semantic tokens as CSS variables
with a complete dark theme.

**Type** — Playfair Display for headings, Inter for body. Fluid `display-*` sizes clamp between
mobile and desktop without breakpoints.

**Motion** — One easing curve (`cubic-bezier(0.22, 1, 0.36, 1)`) everywhere, exposed to Tailwind as
`ease-luxe` and to Framer Motion as `luxeEase`. Scroll reveals animate once. `prefers-reduced-motion`
is honoured globally.

**Accessibility** — Skip link, visible focus rings, labelled controls, `aria-current` on active
navigation, `aria-pressed` on toggles, keyboard navigation in the gallery lightbox and carousels,
and decorative imagery marked `aria-hidden`.

---

## SEO

Per-route metadata with Open Graph and Twitter cards, canonical URLs, `sitemap.xml` (50 URLs
including every product, collection and article), `robots.txt` excluding private routes, and
JSON-LD for Store, Product, Article, BreadcrumbList and FAQPage.
