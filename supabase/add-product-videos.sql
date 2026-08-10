-- =====================================================================
-- Add video support to products
-- =====================================================================
--
-- RUN THIS ONCE in the Supabase dashboard -> SQL Editor.
--
-- Products can now carry short videos alongside their photographs. This adds
-- the column they are stored in. Until it is run, saving a product from the
-- dashboard will fail, because the form now sends a `videos` field the table
-- does not yet have.
--
-- Safe to run more than once.
-- ---------------------------------------------------------------------

alter table public.products
  add column if not exists videos text[] not null default '{}';

-- Confirm it is there. You should see the column listed.
select column_name, data_type
from information_schema.columns
where table_schema = 'public' and table_name = 'products' and column_name = 'videos';
