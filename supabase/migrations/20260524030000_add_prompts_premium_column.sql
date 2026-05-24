alter table public.prompts
add column if not exists premium boolean not null default false;

comment on column public.prompts.premium is
  'Marks prompts with exceptional quality. Imported from PREMIUM values SI/NO in the master spreadsheet.';
