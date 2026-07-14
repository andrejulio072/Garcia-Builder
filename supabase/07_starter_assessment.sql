-- Garcia Builder Fitness starter assessment funnel.
-- Apply in Supabase SQL editor or via CLI after reviewing retention policy with the owner.

create extension if not exists pgcrypto;

create table if not exists public.starter_assessment_leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  first_name text not null check (char_length(first_name) between 1 and 60),
  email text not null check (char_length(email) between 3 and 254),
  country text null check (country is null or country in ('Ireland', 'United Kingdom', 'United States', 'Canada', 'Australia', 'Portugal', 'Brazil', 'Spain', 'France', 'Germany', 'Netherlands', 'Other')),
  language text not null default 'en' check (language in ('en', 'pt', 'es')),
  whatsapp text null check (whatsapp is null or whatsapp ~ '^\+[1-9][0-9]{7,14}$'),
  age_confirmed boolean not null,
  primary_goal text not null check (primary_goal in ('Lose body fat', 'Build muscle', 'Improve body composition', 'Become fitter and more energetic', 'Rebuild consistency', 'Not sure yet')),
  desired_result text not null check (desired_result in ('Feel more confident in my body', 'Lose weight and reduce my waist', 'Look leaner and more defined', 'Build strength and muscle', 'Improve fitness and energy', 'Create a routine I can maintain')),
  training_environment text not null check (training_environment in ('Commercial gym', 'Home with some equipment', 'Home with little or no equipment', 'A mixture of gym and home', 'I am not currently training')),
  training_days text not null check (training_days in ('2 days', '3 days', '4 days', '5 or more days', 'I am unsure')),
  main_barrier text not null check (main_barrier in ('Nutrition and food choices', 'Lack of consistency', 'Limited time', 'I do not know what programme to follow', 'Motivation and accountability', 'I have stopped seeing progress', 'I am overwhelmed by conflicting information')),
  nutrition_support text not null check (nutrition_support in ('Simple meal structure', 'Calories and macro targets', 'High-protein food ideas', 'Portion guidance without tracking everything', 'Meal preparation and planning', 'Help controlling cravings and overeating', 'I am unsure')),
  starting_timeline text not null check (starting_timeline in ('As soon as possible', 'Within the next two weeks', 'Within the next month', 'I am researching my options', 'I only want the free resources for now')),
  support_preference text not null check (support_preference in ('A free guide to help me begin', 'A workout and nutrition template', 'A structured programme I can follow', 'A fully tailored coaching plan', 'I would like to speak with Andre first')),
  recommended_path text not null,
  recommended_workout text not null,
  recommended_nutrition text not null,
  recommended_resource text not null,
  lead_score integer not null default 0 check (lead_score >= 0),
  lead_status text not null check (lead_status in ('cold', 'interested', 'warm')),
  score_reasons jsonb not null default '[]'::jsonb,
  resource_delivery_acknowledgement boolean not null,
  marketing_email_consent boolean not null default false,
  marketing_whatsapp_consent boolean not null default false,
  marketing_email_consent_at timestamptz null,
  marketing_whatsapp_consent_at timestamptz null,
  consent_copy_version text not null,
  privacy_policy_version text not null,
  utm_source text null,
  utm_medium text null,
  utm_campaign text null,
  utm_content text null,
  utm_term text null,
  referrer text null,
  landing_path text null,
  result_token_hash text unique not null,
  result_token_expires_at timestamptz not null,
  result_email_sent_at timestamptz null,
  zapier_notified_at timestamptz null,
  last_activity_at timestamptz null
);

-- Backwards-compatible upgrades for environments where this migration was
-- already applied before language support and the shorter contact form.
alter table public.starter_assessment_leads
  add column if not exists language text not null default 'en';
alter table public.starter_assessment_leads
  drop constraint if exists starter_assessment_leads_language_check;
alter table public.starter_assessment_leads
  add constraint starter_assessment_leads_language_check check (language in ('en', 'pt', 'es'));
alter table public.starter_assessment_leads
  alter column country drop not null;

create table if not exists public.starter_assessment_events (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.starter_assessment_leads(id) on delete cascade,
  created_at timestamptz not null default now(),
  event_name text not null check (event_name in ('result_viewed', 'guide_downloaded', 'workout_template_viewed', 'nutrition_template_viewed', 'whatsapp_clicked', 'consultation_clicked')),
  event_key text null,
  metadata jsonb not null default '{}'::jsonb,
  unique (lead_id, event_name, event_key)
);

create index if not exists starter_assessment_leads_created_at_idx on public.starter_assessment_leads (created_at desc);
create index if not exists starter_assessment_leads_lower_email_idx on public.starter_assessment_leads (lower(email));
create index if not exists starter_assessment_leads_status_idx on public.starter_assessment_leads (lead_status);
create index if not exists starter_assessment_leads_score_idx on public.starter_assessment_leads (lead_score desc);
create index if not exists starter_assessment_leads_token_hash_idx on public.starter_assessment_leads (result_token_hash);
create index if not exists starter_assessment_leads_utm_idx on public.starter_assessment_leads (utm_source, utm_campaign);
create index if not exists starter_assessment_events_lead_idx on public.starter_assessment_events (lead_id, created_at desc);

create or replace function public.set_starter_assessment_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists starter_assessment_leads_updated_at on public.starter_assessment_leads;
create trigger starter_assessment_leads_updated_at
before update on public.starter_assessment_leads
for each row execute function public.set_starter_assessment_updated_at();

alter table public.starter_assessment_leads enable row level security;
alter table public.starter_assessment_events enable row level security;

revoke all privileges on table public.starter_assessment_leads from anon, authenticated;
revoke all privileges on table public.starter_assessment_events from anon, authenticated;
revoke all on function public.set_starter_assessment_updated_at() from public;

-- No broad public policies are intentionally created.
-- The serverless endpoints must use a service-role key for controlled inserts,
-- result-token lookups, and event scoring.

comment on table public.starter_assessment_leads is 'QR starter assessment leads. Contains PII; access only through server-side service-role endpoints.';
comment on table public.starter_assessment_events is 'Starter assessment conversion events. Metadata must not contain PII.';
