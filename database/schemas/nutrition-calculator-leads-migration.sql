-- Nutrition calculator lead storage contract.
-- Review and apply manually in Supabase before deployment.
create extension if not exists pgcrypto;

alter table public.leads
  alter column name drop not null,
  add column if not exists type text not null default 'website_lead',
  add column if not exists source text,
  add column if not exists goal text,
  add column if not exists lead_quality text default 'Warm',
  add column if not exists consent boolean default false,
  add column if not exists page text,
  add column if not exists utm_source text,
  add column if not exists utm_medium text,
  add column if not exists utm_campaign text,
  add column if not exists utm_content text,
  add column if not exists utm_term text,
  add column if not exists payload jsonb default '{}'::jsonb,
  add column if not exists nutrition_result jsonb default '{}'::jsonb,
  add column if not exists notes text,
  add column if not exists updated_at timestamptz not null default now();

create unique index if not exists leads_email_unique_idx on public.leads (email);
create index if not exists leads_type_idx on public.leads (type);
create index if not exists leads_created_at_idx on public.leads (created_at desc);

alter table public.leads enable row level security;
