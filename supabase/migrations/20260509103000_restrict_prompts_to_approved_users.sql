create or replace function private.is_approved_or_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_access ua
    where ua.user_id = auth.uid()
      and ua.status = 'approved'
  )
  or exists (
    select 1
    from public.admin_users au
    where au.user_id = auth.uid()
  );
$$;

grant usage on schema private to authenticated;
revoke all on function private.is_approved_or_admin() from public, anon;
grant execute on function private.is_approved_or_admin() to authenticated;

drop policy if exists "Lectura pública" on public.prompts;
drop policy if exists "Approved users can read prompts" on public.prompts;

revoke select on table public.prompts from anon;
grant select on table public.prompts to authenticated;

create policy "Approved users can read prompts"
on public.prompts
for select
to authenticated
using (private.is_approved_or_admin());
