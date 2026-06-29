-- Garcia Builder auth profile and preferences sync
-- Canonical profile table: public.user_profiles
-- Compatibility sync: public.profiles

create table if not exists public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  units text default 'metric',
  theme text default 'dark',
  language text default 'en',
  notifications jsonb default '{"email":true,"push":true,"reminders":true}'::jsonb,
  privacy jsonb default '{"profile_visible":true,"progress_visible":true}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.user_preferences enable row level security;

revoke all on public.user_preferences from public, anon, authenticated;
grant select, insert, update on public.user_preferences to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'user_preferences'
      and policyname = 'User can select own user_preferences'
  ) then
    create policy "User can select own user_preferences"
      on public.user_preferences
      for select
      to authenticated
      using ((select auth.uid()) = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'user_preferences'
      and policyname = 'User can insert own user_preferences'
  ) then
    create policy "User can insert own user_preferences"
      on public.user_preferences
      for insert
      to authenticated
      with check ((select auth.uid()) = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'user_preferences'
      and policyname = 'User can update own user_preferences'
  ) then
    create policy "User can update own user_preferences"
      on public.user_preferences
      for update
      to authenticated
      using ((select auth.uid()) = user_id)
      with check ((select auth.uid()) = user_id);
  end if;
end
$$;

create index if not exists idx_user_preferences_language on public.user_preferences(language);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  meta jsonb := coalesce(NEW.raw_user_meta_data, '{}'::jsonb);
  birthday_value date := nullif(coalesce(meta->>'birthday', meta->>'date_of_birth'), '')::date;
  preferred_language text := coalesce(nullif(meta->>'language', ''), 'en');
begin
  insert into public.profiles (
    id,
    full_name,
    phone,
    birthday,
    avatar_url,
    role
  )
  values (
    NEW.id,
    coalesce(meta->>'full_name', meta->>'name', NEW.email),
    meta->>'phone',
    birthday_value,
    coalesce(meta->>'avatar_url', meta->>'picture'),
    coalesce(nullif(meta->>'role', ''), 'client')
  )
  on conflict (id) do update
    set full_name = coalesce(excluded.full_name, public.profiles.full_name),
        phone = coalesce(excluded.phone, public.profiles.phone),
        birthday = coalesce(excluded.birthday, public.profiles.birthday),
        avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
        role = coalesce(excluded.role, public.profiles.role),
        updated_at = timezone('utc', now());

  insert into public.user_profiles (
    user_id,
    email,
    full_name,
    phone,
    birthday,
    avatar_url,
    joined_date,
    last_login
  )
  values (
    NEW.id,
    NEW.email,
    coalesce(meta->>'full_name', meta->>'name', NEW.email),
    meta->>'phone',
    birthday_value,
    coalesce(meta->>'avatar_url', meta->>'picture'),
    coalesce(NEW.created_at, now()),
    coalesce(NEW.updated_at, NEW.created_at, now())
  )
  on conflict (user_id) do update
    set email = coalesce(excluded.email, public.user_profiles.email),
        full_name = coalesce(excluded.full_name, public.user_profiles.full_name),
        phone = coalesce(excluded.phone, public.user_profiles.phone),
        birthday = coalesce(excluded.birthday, public.user_profiles.birthday),
        avatar_url = coalesce(excluded.avatar_url, public.user_profiles.avatar_url),
        joined_date = coalesce(public.user_profiles.joined_date, excluded.joined_date),
        last_login = timezone('utc', now()),
        updated_at = timezone('utc', now());

  insert into public.user_preferences (
    user_id,
    units,
    theme,
    language,
    notifications,
    privacy
  )
  values (
    NEW.id,
    coalesce(nullif(meta->>'units', ''), 'metric'),
    coalesce(nullif(meta->>'theme', ''), 'dark'),
    preferred_language,
    coalesce(
      nullif(meta->'notifications', 'null'::jsonb),
      '{"email":true,"push":true,"reminders":true}'::jsonb
    ),
    coalesce(
      nullif(meta->'privacy', 'null'::jsonb),
      '{"profile_visible":true,"progress_visible":true}'::jsonb
    )
  )
  on conflict (user_id) do update
    set units = coalesce(excluded.units, public.user_preferences.units),
        theme = coalesce(excluded.theme, public.user_preferences.theme),
        language = coalesce(excluded.language, public.user_preferences.language),
        notifications = coalesce(excluded.notifications, public.user_preferences.notifications),
        privacy = coalesce(excluded.privacy, public.user_preferences.privacy),
        updated_at = timezone('utc', now());

  return NEW;
end;
$$;

alter function public.handle_new_user() set search_path = public, auth;
revoke all on function public.handle_new_user() from public, anon, authenticated;
grant execute on function public.handle_new_user() to authenticated, anon;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

insert into public.user_preferences (
  user_id,
  units,
  theme,
  language,
  notifications,
  privacy
)
select
  u.id,
  'metric',
  'dark',
  'en',
  '{"email":true,"push":true,"reminders":true}'::jsonb,
  '{"profile_visible":true,"progress_visible":true}'::jsonb
from auth.users u
on conflict (user_id) do nothing;
