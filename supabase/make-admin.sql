-- =====================================================================
-- Grant the shop owner the admin role
-- =====================================================================
--
-- Run this ONCE, in the Supabase dashboard → SQL Editor, after the user has
-- been created under Authentication → Users.
--
-- Creating a user gives it a `profiles` row with role = 'customer'. Nothing in
-- the application can promote that row — deliberately. If the site could hand
-- out the admin role, so could anyone who found the endpoint. The only way in
-- is here, holding the database password.
--
-- The email below is already the shop's login. Change it only if you are
-- promoting somebody else.
-- ---------------------------------------------------------------------

update public.profiles
set role = 'admin',
    full_name = 'YADIMS Fabrics & Seams'
where email = 'yadimsfabricsseams@gmail.com';

-- Confirm it took. The row should read role = admin.
select id, email, full_name, role, created_at
from public.profiles
order by created_at;


-- ---------------------------------------------------------------------
-- Roles, for reference
-- ---------------------------------------------------------------------
--   customer  The default a new user gets. The shop has no customer area,
--             so this role can do nothing beyond what a guest can do.
--   staff     Everything in the dashboard except changing anyone's role.
--   admin     The above, plus role changes and store settings.
--
-- To add someone who helps in the shop: create their user under
-- Authentication → Users, then:
--
--   update public.profiles set role = 'staff' where email = 'helper@example.com';
--
-- To take access away again:
--
--   update public.profiles set role = 'customer' where email = 'helper@example.com';
--
--
-- ---------------------------------------------------------------------
-- After this: close registration
-- ---------------------------------------------------------------------
-- The site has no sign-up page, but the Supabase auth API still accepts new
-- registrations until you turn it off:
--
--   Authentication → Sign In / Providers → Email
--   → turn off "Allow new users to sign up"
--
-- Do this only once the account above exists and works.
