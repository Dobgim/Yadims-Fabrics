-- =====================================================================
-- SECURITY FIX — stop users granting themselves the admin role
-- =====================================================================
--
-- RUN THIS IN THE SUPABASE SQL EDITOR. It takes one second and needs no
-- other changes.
--
-- The problem
-- -----------
-- The `profiles_update_own` policy says a signed-in user may update their
-- own profile row:
--
--     for update using (id = auth.uid()) with check (id = auth.uid())
--
-- That is correct for a name, a phone number or an avatar. But `role` lives
-- in the same row, and the policy does not distinguish between columns — so
-- any signed-in user could run one API call against their own row and come
-- back an admin, with full access to prices, orders and customer records.
--
-- A Postgres RLS policy cannot compare the old value of a column with the
-- new one (there is no OLD inside a policy), so this cannot be fixed by
-- rewriting the policy. It needs a trigger, which can.
--
-- The fix
-- -------
-- Below: profiles stay editable by their owner, but a change to `role` is
-- rejected unless the caller is already an admin.
--
--   * A customer editing their own name        -> allowed
--   * A customer setting their own role        -> rejected
--   * An admin changing somebody else's role   -> allowed
--   * The server's service-role key            -> allowed
--
-- The service-role case is why the check is skipped when `auth.uid()` is
-- null: that key is server-only, never reaches a browser, and is how the
-- dashboard's own role-change screen writes. RLS already guarantees only the
-- row's owner or an admin got this far at all.
-- ---------------------------------------------------------------------

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


-- ---------------------------------------------------------------------
-- Check who currently holds elevated access
--
-- Expect exactly one row: the shop's own login, as admin. Anything else
-- listed here got that role from somewhere, and is worth asking about.
-- ---------------------------------------------------------------------
select email, role, created_at
from public.profiles
where role in ('admin', 'staff')
order by created_at;
