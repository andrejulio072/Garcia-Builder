-- Replace date-of-birth collection with an age-only assessment contract.
-- Forward-only and idempotent. Legacy DOB and consent columns are retained for history.

do $$
begin
  if to_regclass('public.starter_assessment_leads') is null then
    raise exception 'starter_assessment_leads table is missing';
  end if;
end
$$;

alter table public.starter_assessment_leads
  add column if not exists age integer;
alter table public.starter_assessment_leads
  add column if not exists resource_acknowledgement_at timestamptz;

alter table public.starter_assessment_leads
  alter column date_of_birth drop not null;
alter table public.starter_assessment_leads
  alter column age_confirmed drop not null;
alter table public.starter_assessment_leads
  alter column marketing_whatsapp_consent drop not null;

alter table public.starter_assessment_leads
  drop constraint if exists starter_assessment_leads_age_check;
alter table public.starter_assessment_leads
  add constraint starter_assessment_leads_age_check
  check (age is null or age between 18 and 100);

-- Historical age means age at original lead creation, not age on migration day.
-- Leave age null when DOB or creation time cannot produce a valid adult age.
update public.starter_assessment_leads
set age = extract(year from age(created_at::date, date_of_birth))::integer
where age is null
  and date_of_birth is not null
  and created_at is not null
  and extract(year from age(created_at::date, date_of_birth)) between 18 and 100;

-- The row creation time is the best retained timestamp for historical acknowledgements.
update public.starter_assessment_leads
set resource_acknowledgement_at = created_at
where resource_acknowledgement_at is null
  and resource_delivery_acknowledgement is true;

comment on column public.starter_assessment_leads.age is
  'Whole-number age supplied for the assessment, limited to 18 through 100. Historical rows may be null.';
comment on column public.starter_assessment_leads.date_of_birth is
  'Legacy field retained for historical records. New assessment submissions do not collect DOB.';
comment on column public.starter_assessment_leads.resource_acknowledgement_at is
  'Timestamp for required result/resource acknowledgement. Historical rows use lead creation time.';
