-- Pre-order fabrics.
--
-- Some cloth is sold to order: the customer reserves it with a deposit and the
-- house brings it in. A pre-order fabric carries a badge on the shop, appears
-- in its own Pre-Order section, and tells the customer up front what deposit
-- reserves it. The deposit is a percentage (the house works to 60%), agreed in
-- full — like every price here — over WhatsApp.
--
-- Run this once in the Supabase SQL Editor. Both columns have defaults, so
-- every existing fabric stays exactly as it is (an ordinary, in-stock fabric)
-- until it is explicitly marked as pre-order in the editor.

alter table public.products
  add column if not exists is_preorder boolean not null default false;

alter table public.products
  add column if not exists preorder_deposit_percent integer not null default 60
    check (preorder_deposit_percent between 1 and 100);
