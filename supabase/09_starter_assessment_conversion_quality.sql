-- Forward-only, idempotent conversion-quality alignment.
-- Persists the language used for the assessment so campaign and delivery QA can verify it.

alter table if exists public.starter_assessment_leads
  add column if not exists language text;

update public.starter_assessment_leads
set language = 'en'
where language is null;

alter table if exists public.starter_assessment_leads
  alter column language set default 'en';

alter table if exists public.starter_assessment_leads
  add constraint if not exists starter_assessment_language_check
  check (language in ('en', 'pt', 'es'));

create index if not exists starter_assessment_leads_language_idx
  on public.starter_assessment_leads (language);