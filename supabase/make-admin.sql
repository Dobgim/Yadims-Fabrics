-- =====================================================================
-- Grant yourself the admin role
-- =====================================================================
--
-- Run this ONCE, in the Supabase dashboard → SQL Editor, after you have
-- signed up through the website at /sign-up.
--
-- Signing up creates a `profiles` row with role = 'customer'. Nothing in the
-- application can promote that row — deliberately. If the site could hand out
-- the admin role, so could anyone who found the endpoint. The only way in is
-- here, holding the database password.
--
-- Replace the email below with the one you signed up with.
-- ---------------------------------------------------------------------

update public.profiles
set role = 'admin'
where email = 'you@example.com';

-- Confirm it took. You should see exactly one row, role = admin.
select id, email, full_name, role, created_at
from public.profiles
order by created_at;


-- ---------------------------------------------------------------------
-- Roles, for reference
-- ---------------------------------------------------------------------
--   customer  Can shop, order, review, manage their own account. The default.
--   staff     Everything in the dashboard except changing anyone's role.
--   admin     The above, plus role changes and store settings.
--
-- To add someone who helps in the shop, have them sign up first, then:
--
--   update public.profiles set role = 'staff' where email = 'helper@example.com';
--
-- To take access away again:
--
--   update public.profiles set role = 'customer' where email = 'helper@example.com';
