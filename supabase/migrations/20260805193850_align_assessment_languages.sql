-- Align the persisted assessment language contract with the ten browser locales.
-- Forward-only and idempotent for environments that applied earlier QR migrations.

do $$
begin
  if to_regclass('public.starter_assessment_leads') is null then
    raise exception 'starter_assessment_leads table is missing';
  end if;
end
$$;

alter table public.starter_assessment_leads
  drop constraint if exists starter_assessment_leads_language_check;

alter table public.starter_assessment_leads
  add constraint starter_assessment_leads_language_check
  check (language in ('en', 'pt', 'es', 'fr', 'de', 'it', 'nl', 'pl', 'ro', 'ru'));

comment on column public.starter_assessment_leads.language is
  'Assessment and transactional-email language: en, pt, es, fr, de, it, nl, pl, ro or ru.';
