create or replace function public.extract_prompt_suggestions()
returns setof public.prompt_suggestions
language sql
set search_path = ''
as $$
  with extracted as (
    delete from public.prompt_suggestions
    where true
    returning *
  )
  select *
  from extracted
  order by created_at, id;
$$;
