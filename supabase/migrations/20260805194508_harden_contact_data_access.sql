-- Keep public newsletter signup available while limiting subscriber management
-- to the same administrator identities used by the leads dashboard.
alter table public.newsletter_subscribers enable row level security;

revoke all on public.newsletter_subscribers from public, anon, authenticated;
grant insert on public.newsletter_subscribers to anon, authenticated;
grant select, update, delete on public.newsletter_subscribers to authenticated;

drop policy if exists newsletter_subscribers_insert_public
  on public.newsletter_subscribers;
drop policy if exists newsletter_subscribers_select_authenticated
  on public.newsletter_subscribers;
drop policy if exists newsletter_subscribers_update_authenticated
  on public.newsletter_subscribers;
drop policy if exists newsletter_subscribers_delete_authenticated
  on public.newsletter_subscribers;

create policy newsletter_subscribers_insert_public
  on public.newsletter_subscribers
  for insert
  to anon, authenticated
  with check (true);

create policy newsletter_subscribers_select_admin
  on public.newsletter_subscribers
  for select
  to authenticated
  using (
    (auth.jwt() ->> 'email') = any (
      array['andrejulio072@gmail.com', 'admin@garciabuilder.fitness']::text[]
    )
  );

create policy newsletter_subscribers_update_admin
  on public.newsletter_subscribers
  for update
  to authenticated
  using (
    (auth.jwt() ->> 'email') = any (
      array['andrejulio072@gmail.com', 'admin@garciabuilder.fitness']::text[]
    )
  )
  with check (
    (auth.jwt() ->> 'email') = any (
      array['andrejulio072@gmail.com', 'admin@garciabuilder.fitness']::text[]
    )
  );

create policy newsletter_subscribers_delete_admin
  on public.newsletter_subscribers
  for delete
  to authenticated
  using (
    (auth.jwt() ->> 'email') = any (
      array['andrejulio072@gmail.com', 'admin@garciabuilder.fitness']::text[]
    )
  );

-- Profiles contain phone numbers, dates of birth, body metrics, and preferences.
-- They must only be readable and writable by the profile owner.
alter table public.profiles enable row level security;

drop policy if exists "Public profiles are viewable by everyone"
  on public.profiles;

revoke all on public.profiles from public, anon, authenticated;
grant select, insert, update on public.profiles to authenticated;

-- The unique constraint already owns an equivalent index.
drop index if exists public.starter_assessment_leads_result_token_hash_uidx;
