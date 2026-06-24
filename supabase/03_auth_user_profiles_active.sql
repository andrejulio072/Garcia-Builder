-- Garcia Builder auth profile core
-- Safe, minimal schema needed by js/core/auth.js syncUserProfile().

create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  first_name text,
  last_name text,
  phone text,
  avatar_url text,
  birthday date,
  location text,
  bio text,
  goals jsonb default '[]'::jsonb,
  experience_level text,
  trainer_id uuid references auth.users(id) on delete set null,
  trainer_name text,
  joined_date timestamptz default now(),
  last_login timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.user_profiles enable row level security;

grant select, insert, update on public.user_profiles to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'user_profiles'
      and policyname = 'User can select own user_profiles'
  ) then
    create policy "User can select own user_profiles"
      on public.user_profiles
      for select
      to authenticated
      using ((select auth.uid()) = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'user_profiles'
      and policyname = 'User can insert own user_profiles'
  ) then
    create policy "User can insert own user_profiles"
      on public.user_profiles
      for insert
      to authenticated
      with check ((select auth.uid()) = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'user_profiles'
      and policyname = 'User can update own user_profiles'
  ) then
    create policy "User can update own user_profiles"
      on public.user_profiles
      for update
      to authenticated
      using ((select auth.uid()) = user_id)
      with check ((select auth.uid()) = user_id);
  end if;
end
$$;

create index if not exists idx_user_profiles_email on public.user_profiles(email);
create index if not exists idx_user_profiles_trainer on public.user_profiles(trainer_id);

create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_user_profiles_updated on public.user_profiles;
create trigger on_user_profiles_updated
  before update on public.user_profiles
  for each row execute function public.update_updated_at_column();

revoke all on function public.update_updated_at_column() from public, anon, authenticated;

-- Harden existing helper functions if they are present from an earlier partial setup.
alter function if exists public.handle_new_user() set search_path = public, auth;
revoke all on function public.handle_new_user() from public, anon, authenticated;

alter function if exists public.rls_auto_enable() set search_path = public;
revoke all on function public.rls_auto_enable() from public, anon, authenticated;
