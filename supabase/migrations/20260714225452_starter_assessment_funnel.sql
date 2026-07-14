-- Transition the existing QR assessment table to the seven-question,
-- multilingual funnel. The original table is defined by 07_starter_assessment.sql.

do $$
begin
  if to_regclass('public.starter_assessment_leads') is null then
    raise exception 'starter_assessment_leads is missing; apply supabase/07_starter_assessment.sql before this transition migration';
  end if;
end
$$;

alter table public.starter_assessment_leads
  add column if not exists language text not null default 'en';

alter table public.starter_assessment_leads
  drop constraint if exists starter_assessment_leads_language_check;

alter table public.starter_assessment_leads
  add constraint starter_assessment_leads_language_check
  check (language in ('en', 'pt', 'es'));

alter table public.starter_assessment_leads
  alter column country drop not null;

comment on column public.starter_assessment_leads.language is
  'Language selected for the QR assessment result and transactional email: en, pt or es.';
