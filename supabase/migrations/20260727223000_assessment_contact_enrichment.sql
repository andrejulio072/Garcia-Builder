-- Starter assessment contact enrichment.
-- Forward-only and idempotent migration for richer lead capture fields.

do $$
begin
  if to_regclass('public.starter_assessment_leads') is null then
    raise exception 'starter_assessment_leads table is missing';
  end if;
end
$$;

alter table public.starter_assessment_leads
  add column if not exists full_name text;
alter table public.starter_assessment_leads
  add column if not exists date_of_birth date;
alter table public.starter_assessment_leads
  add column if not exists instagram_handle text;
alter table public.starter_assessment_leads
  add column if not exists facebook_profile text;
alter table public.starter_assessment_leads
  add column if not exists preferred_contact_method text;
alter table public.starter_assessment_leads
  add column if not exists best_contact_time text;

update public.starter_assessment_leads
set full_name = coalesce(nullif(full_name, ''), first_name)
where full_name is null or full_name = '';

alter table public.starter_assessment_leads
  alter column full_name set not null;

alter table public.starter_assessment_leads
  drop constraint if exists starter_assessment_leads_preferred_contact_method_check;
alter table public.starter_assessment_leads
  add constraint starter_assessment_leads_preferred_contact_method_check
  check (
    preferred_contact_method is null
    or preferred_contact_method in ('email', 'whatsapp', 'instagram', 'facebook')
  );

create index if not exists starter_assessment_leads_preferred_contact_idx
  on public.starter_assessment_leads (preferred_contact_method, created_at desc);
