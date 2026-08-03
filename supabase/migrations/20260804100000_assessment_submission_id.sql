-- Durable serverless idempotency for starter-assessment submissions.

do $$
begin
  if to_regclass('public.starter_assessment_leads') is null then
    raise exception 'starter_assessment_leads table is missing';
  end if;
end
$$;

alter table public.starter_assessment_leads
  add column if not exists submission_id uuid;

-- Historical event IDs are already unique and make safe one-time backfill values.
update public.starter_assessment_leads
set submission_id = coalesce(submission_id, event_id, gen_random_uuid())
where submission_id is null;

alter table public.starter_assessment_leads
  alter column submission_id set not null;

create unique index if not exists starter_assessment_leads_submission_id_uidx
  on public.starter_assessment_leads (submission_id);

comment on column public.starter_assessment_leads.submission_id is
  'Client-generated UUID used as the durable idempotency key for one assessment submission.';
