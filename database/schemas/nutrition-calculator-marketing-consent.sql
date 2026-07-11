-- Nutrition calculator marketing consent and follow-up fields.
-- Review and apply manually in Supabase before deploying this change.
alter table public.leads
  add column if not exists marketing_consent boolean default false,
  add column if not exists marketing_consent_text text,
  add column if not exists marketing_consent_at timestamptz,
  add column if not exists lead_stage text default 'New Lead',
  add column if not exists follow_up_status text default 'Not Contacted';

create index if not exists leads_marketing_consent_idx
  on public.leads (marketing_consent);

create index if not exists leads_lead_stage_idx
  on public.leads (lead_stage);
