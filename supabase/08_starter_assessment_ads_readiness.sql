-- Forward-only, idempotent starter assessment schema alignment for ads-readiness.

alter table if exists public.starter_assessment_leads
  add column if not exists entry_context text,
  add column if not exists landing_url text,
  add column if not exists gclid text,
  add column if not exists gbraid text,
  add column if not exists wbraid text,
  add column if not exists fbclid text,
  add column if not exists first_touch_at timestamptz,
  add column if not exists latest_touch_at timestamptz,
  add column if not exists latest_utm_source text,
  add column if not exists latest_utm_medium text,
  add column if not exists latest_utm_campaign text,
  add column if not exists latest_utm_content text,
  add column if not exists latest_utm_term text,
  add column if not exists latest_gclid text,
  add column if not exists latest_gbraid text,
  add column if not exists latest_wbraid text,
  add column if not exists latest_fbclid text;

update public.starter_assessment_leads
set entry_context = coalesce(entry_context,
  case
    when lower(coalesce(utm_source, '')) = 'business_card' and lower(coalesce(utm_medium, '')) = 'qr' then 'qr'
    when lower(coalesce(utm_medium, '')) like '%paid_social%'
      or lower(coalesce(utm_medium, '')) like '%cpc%'
      or lower(coalesce(utm_medium, '')) like '%ppc%'
      or lower(coalesce(utm_medium, '')) like '%paid%'
      or lower(coalesce(utm_medium, '')) like '%display%'
      or lower(coalesce(utm_medium, '')) like '%retargeting%'
      or lower(coalesce(utm_source, '')) like '%meta%'
      or lower(coalesce(utm_source, '')) like '%facebook%'
      or lower(coalesce(utm_source, '')) like '%instagram%'
      or lower(coalesce(utm_source, '')) like '%google%'
      or lower(coalesce(utm_source, '')) like '%youtube%'
    then 'paid'
    else 'organic'
  end
)
where entry_context is null;

update public.starter_assessment_leads
set first_touch_at = coalesce(first_touch_at, created_at),
    latest_touch_at = coalesce(latest_touch_at, created_at)
where first_touch_at is null or latest_touch_at is null;

alter table if exists public.starter_assessment_leads
  alter column entry_context set default 'organic';

alter table if exists public.starter_assessment_leads
  add constraint if not exists starter_assessment_entry_context_check
  check (entry_context in ('qr', 'paid', 'organic'));

create index if not exists starter_assessment_leads_entry_context_idx
  on public.starter_assessment_leads (entry_context);

create index if not exists starter_assessment_leads_click_ids_idx
  on public.starter_assessment_leads (gclid, gbraid, wbraid, fbclid);
