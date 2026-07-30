-- Paid assessment launch recovery migration.
-- Forward-only and idempotent: adds missing starter_assessment_leads columns without data loss.

do $$
begin
  if to_regclass('public.starter_assessment_leads') is null then
    raise exception 'starter_assessment_leads table is missing';
  end if;
end
$$;

alter table public.starter_assessment_leads
  add column if not exists entry_context text;
alter table public.starter_assessment_leads
  add column if not exists landing_url text;
alter table public.starter_assessment_leads
  add column if not exists latest_utm_source text;
alter table public.starter_assessment_leads
  add column if not exists latest_utm_medium text;
alter table public.starter_assessment_leads
  add column if not exists latest_utm_campaign text;
alter table public.starter_assessment_leads
  add column if not exists latest_utm_content text;
alter table public.starter_assessment_leads
  add column if not exists latest_utm_term text;
alter table public.starter_assessment_leads
  add column if not exists gclid text;
alter table public.starter_assessment_leads
  add column if not exists gbraid text;
alter table public.starter_assessment_leads
  add column if not exists wbraid text;
alter table public.starter_assessment_leads
  add column if not exists fbclid text;
alter table public.starter_assessment_leads
  add column if not exists first_touch_at timestamptz;
alter table public.starter_assessment_leads
  add column if not exists latest_touch_at timestamptz;
alter table public.starter_assessment_leads
  add column if not exists event_id uuid;

-- Backfill safe defaults for legacy rows.
update public.starter_assessment_leads
set entry_context = coalesce(entry_context,
  case
    when lower(coalesce(utm_source, '')) = 'business_card' and lower(coalesce(utm_medium, '')) = 'qr' then 'qr'
    when lower(coalesce(utm_medium, '')) in ('paid_social', 'cpc', 'ppc', 'paid', 'display', 'retargeting') then 'paid'
    else 'organic'
  end
)
where entry_context is null;

update public.starter_assessment_leads
set first_touch_at = coalesce(first_touch_at, created_at),
    latest_touch_at = coalesce(latest_touch_at, created_at)
where first_touch_at is null or latest_touch_at is null;

update public.starter_assessment_leads
set event_id = coalesce(event_id, gen_random_uuid())
where event_id is null;

alter table public.starter_assessment_leads
  alter column entry_context set not null;
alter table public.starter_assessment_leads
  alter column first_touch_at set not null;
alter table public.starter_assessment_leads
  alter column latest_touch_at set not null;
alter table public.starter_assessment_leads
  alter column event_id set not null;

-- Enforce allowed values with explicit add/drop for broad Postgres compatibility.
alter table public.starter_assessment_leads
  drop constraint if exists starter_assessment_leads_entry_context_check;
alter table public.starter_assessment_leads
  add constraint starter_assessment_leads_entry_context_check
  check (entry_context in ('paid', 'qr', 'organic'));

alter table public.starter_assessment_leads
  drop constraint if exists starter_assessment_leads_language_check;
alter table public.starter_assessment_leads
  add constraint starter_assessment_leads_language_check
  check (language in ('en', 'pt', 'es'));

create unique index if not exists starter_assessment_leads_event_id_uidx
  on public.starter_assessment_leads (event_id);
create unique index if not exists starter_assessment_leads_result_token_hash_uidx
  on public.starter_assessment_leads (result_token_hash);

create index if not exists starter_assessment_leads_entry_context_idx
  on public.starter_assessment_leads (entry_context, created_at desc);
create index if not exists starter_assessment_leads_latest_utm_idx
  on public.starter_assessment_leads (latest_utm_source, latest_utm_campaign);
create index if not exists starter_assessment_leads_click_ids_idx
  on public.starter_assessment_leads (gclid, gbraid, wbraid, fbclid);
