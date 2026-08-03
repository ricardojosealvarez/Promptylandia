alter table public.prompts
  add column if not exists updated_at timestamptz;

update public.prompts
set updated_at = created_at
where updated_at is null;

alter table public.prompts
  alter column updated_at set default now(),
  alter column updated_at set not null;

create or replace function public.set_prompt_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_prompt_updated_at on public.prompts;

create trigger set_prompt_updated_at
before update on public.prompts
for each row
execute function public.set_prompt_updated_at();
