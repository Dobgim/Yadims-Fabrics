-- =====================================================================
-- Clear the seeded star ratings
-- =====================================================================
--
-- Run this ONCE in the Supabase SQL Editor if you already ran setup.sql
-- before the shop dropped customer accounts.
--
-- The starter catalogue shipped with ratings on it — 4.9 out of 5 from 12
-- reviews, and so on. Those numbers were invented to make the seed data
-- look plausible. They were never real, and now that customers cannot hold
-- accounts, nobody can leave a review that would make them real.
--
-- A star rating on a product page is a claim about what other buyers
-- thought. Leaving invented ones up is the same problem as an invented
-- testimonial, so this sets them all back to zero. The product page no
-- longer displays a rating at all, but the database should not be carrying
-- a number the shop cannot stand behind.
-- ---------------------------------------------------------------------

update public.products
set rating_average = 0,
    rating_count = 0
where rating_count > 0 or rating_average > 0;

-- Confirm: every row should now read 0.00 and 0.
select name, rating_average, rating_count
from public.products
order by name;
