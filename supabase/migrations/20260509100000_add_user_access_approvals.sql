create schema if not exists private;

create table if not exists public.user_access (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  requested_at timestamptz not null default now(),
  approved_at timestamptz,
  approved_by uuid references auth.users(id),
  updated_at timestamptz not null default now()
);

alter table public.user_access enable row level security;

revoke all on table public.user_access from public, anon, authenticated;
grant all on table public.user_access to service_role;

create or replace function private.handle_new_auth_user_access()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.user_access (user_id, email, status)
  values (new.id, coalesce(new.email, ''), 'pending')
  on conflict (user_id) do nothing;
  return new;
end;
$$;

revoke all on function private.handle_new_auth_user_access() from public, anon, authenticated;

drop trigger if exists on_auth_user_created_user_access on auth.users;
create trigger on_auth_user_created_user_access
  after insert on auth.users
  for each row execute function private.handle_new_auth_user_access();

insert into public.user_access (user_id, email, status, approved_at, approved_by)
select u.id, coalesce(u.email, a.email), 'approved', now(), u.id
from public.admin_users a
join auth.users u on u.id = a.user_id
on conflict (user_id) do update
set status = 'approved',
    email = excluded.email,
    approved_at = coalesce(public.user_access.approved_at, now()),
    approved_by = coalesce(public.user_access.approved_by, excluded.approved_by),
    updated_at = now();
