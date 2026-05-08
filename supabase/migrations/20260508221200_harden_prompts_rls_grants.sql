alter table public.prompts enable row level security;

revoke insert, update, delete on table public.prompts from anon, authenticated;
revoke insert, update, delete on table public.prompts from public;
grant select on table public.prompts to anon, authenticated;

do $$
begin
  if exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'prompts'
      and policyname = 'Escritura autenticada'
  ) then
    alter policy "Escritura autenticada" on public.prompts rename to "Service role writes only";
  end if;
end $$;
