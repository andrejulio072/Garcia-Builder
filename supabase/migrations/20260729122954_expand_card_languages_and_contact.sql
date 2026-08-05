-- Extend the QR card assessment with ten supported languages and a preferred
-- reply channel. The existing table remains private and is written server-side.

do $$
begin
  if to_regclass('public.starter_assessment_leads') is null then
    raise exception 'starter_assessment_leads is missing; apply the starter assessment migrations first';
  end if;
end
$$;

alter table public.starter_assessment_leads
  add column if not exists preferred_contact_method text;

alter table public.starter_assessment_leads
  drop constraint if exists starter_assessment_leads_language_check;

alter table public.starter_assessment_leads
  add constraint starter_assessment_leads_language_check
  check (language in ('en', 'pt', 'es', 'fr', 'it', 'de', 'pl', 'ro', 'ar', 'ru'));

alter table public.starter_assessment_leads
  drop constraint if exists starter_assessment_leads_preferred_contact_method_check;

alter table public.starter_assessment_leads
  add constraint starter_assessment_leads_preferred_contact_method_check
  check (
    preferred_contact_method is null
    or preferred_contact_method in ('whatsapp', 'instagram', 'email')
  );

comment on column public.starter_assessment_leads.preferred_contact_method is
  'Visitor-selected reply channel from the gym QR card assessment.';

comment on column public.starter_assessment_leads.instagram is
  'Optional Instagram handle or social profile supplied with the assessment.';
