-- Add richer contact fields for the QR starter assessment form.

do $$
begin
  if to_regclass('public.starter_assessment_leads') is null then
    raise exception 'starter_assessment_leads is missing; apply supabase/07_starter_assessment.sql before this migration';
  end if;
end
$$;

alter table public.starter_assessment_leads
  add column if not exists last_name text,
  add column if not exists phone text,
  add column if not exists instagram text;

alter table public.starter_assessment_leads
  drop constraint if exists starter_assessment_leads_phone_check;

alter table public.starter_assessment_leads
  add constraint starter_assessment_leads_phone_check
  check (phone is null or phone ~ '^\+[1-9][0-9]{7,14}$');

alter table public.starter_assessment_leads
  drop constraint if exists starter_assessment_leads_instagram_check;

alter table public.starter_assessment_leads
  add constraint starter_assessment_leads_instagram_check
  check (instagram is null or char_length(instagram) between 2 and 120);

comment on column public.starter_assessment_leads.last_name is
  'Visitor last name collected on the starter assessment contact step.';

comment on column public.starter_assessment_leads.phone is
  'Required visitor phone number collected in international format.';

comment on column public.starter_assessment_leads.instagram is
  'Optional visitor Instagram handle collected on the starter assessment contact step.';
