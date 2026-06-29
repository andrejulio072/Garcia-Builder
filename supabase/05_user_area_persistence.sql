-- Garcia Builder user area persistence
-- Canonical user data lives in Supabase tables; localStorage is only a UI/offline cache.

create extension if not exists pgcrypto;

create or replace function public.is_assigned_trainer(target_user_id uuid)
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select exists (
    select 1
    from public.user_profiles up
    where up.user_id = target_user_id
      and up.trainer_id = (select auth.uid())
  );
$$;

revoke all on function public.is_assigned_trainer(uuid) from public, anon;
grant execute on function public.is_assigned_trainer(uuid) to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('user-assets', 'user-assets', true, 5242880, array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public read user-assets" on storage.objects;
create policy "Public read user-assets"
  on storage.objects for select
  to public
  using (bucket_id = 'user-assets');

drop policy if exists "Users can upload to own user-assets folder" on storage.objects;
create policy "Users can upload to own user-assets folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'user-assets'
    and split_part(name, '/', 1) = (select auth.uid())::text
  );

drop policy if exists "Users can update own user-assets objects" on storage.objects;
create policy "Users can update own user-assets objects"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'user-assets'
    and split_part(name, '/', 1) = (select auth.uid())::text
  )
  with check (
    bucket_id = 'user-assets'
    and split_part(name, '/', 1) = (select auth.uid())::text
  );

drop policy if exists "Users can delete own user-assets objects" on storage.objects;
create policy "Users can delete own user-assets objects"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'user-assets'
    and split_part(name, '/', 1) = (select auth.uid())::text
  );

create table if not exists public.progress_photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  photo_url text not null,
  storage_path text,
  taken_at date not null default current_date,
  note text,
  visibility text not null default 'coach' check (visibility in ('private','coach','public')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_macros (
  user_id uuid primary key references auth.users(id) on delete cascade,
  goal text default 'maintain',
  activity_level text default 'moderate',
  calories numeric,
  protein_pct numeric default 30,
  carbs_pct numeric default 40,
  fats_pct numeric default 30,
  protein_g numeric,
  carbs_g numeric,
  fats_g numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_habits (
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null default current_date,
  water_ml integer default 0,
  steps integer default 0,
  sleep_hours numeric default 0,
  workout boolean default false,
  meditation boolean default false,
  stretch boolean default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, date)
);

create table if not exists public.workout_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workout_date date not null default current_date,
  title text,
  workout_name text,
  duration_minutes integer,
  completed boolean not null default true,
  exercises jsonb not null default '[]'::jsonb,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.progress_photos enable row level security;
alter table public.user_macros enable row level security;
alter table public.user_habits enable row level security;
alter table public.workout_logs enable row level security;
alter table public.body_metrics enable row level security;
alter table public.sessions enable row level security;

revoke all on public.progress_photos from public, anon, authenticated;
revoke all on public.user_macros from public, anon, authenticated;
revoke all on public.user_habits from public, anon, authenticated;
revoke all on public.workout_logs from public, anon, authenticated;
grant select, insert, update, delete on public.progress_photos to authenticated;
grant select, insert, update, delete on public.user_macros to authenticated;
grant select, insert, update, delete on public.user_habits to authenticated;
grant select, insert, update, delete on public.workout_logs to authenticated;

drop policy if exists "progress_photos_select_owner_or_trainer" on public.progress_photos;
create policy "progress_photos_select_owner_or_trainer"
  on public.progress_photos for select to authenticated
  using ((select auth.uid()) = user_id or public.is_assigned_trainer(user_id));
drop policy if exists "progress_photos_insert_owner" on public.progress_photos;
create policy "progress_photos_insert_owner"
  on public.progress_photos for insert to authenticated
  with check ((select auth.uid()) = user_id);
drop policy if exists "progress_photos_update_owner" on public.progress_photos;
create policy "progress_photos_update_owner"
  on public.progress_photos for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
drop policy if exists "progress_photos_delete_owner" on public.progress_photos;
create policy "progress_photos_delete_owner"
  on public.progress_photos for delete to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "user_macros_select_owner_or_trainer" on public.user_macros;
create policy "user_macros_select_owner_or_trainer"
  on public.user_macros for select to authenticated
  using ((select auth.uid()) = user_id or public.is_assigned_trainer(user_id));
drop policy if exists "user_macros_insert_owner" on public.user_macros;
create policy "user_macros_insert_owner"
  on public.user_macros for insert to authenticated
  with check ((select auth.uid()) = user_id);
drop policy if exists "user_macros_update_owner" on public.user_macros;
create policy "user_macros_update_owner"
  on public.user_macros for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
drop policy if exists "user_macros_delete_owner" on public.user_macros;
create policy "user_macros_delete_owner"
  on public.user_macros for delete to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "user_habits_select_owner_or_trainer" on public.user_habits;
create policy "user_habits_select_owner_or_trainer"
  on public.user_habits for select to authenticated
  using ((select auth.uid()) = user_id or public.is_assigned_trainer(user_id));
drop policy if exists "user_habits_insert_owner" on public.user_habits;
create policy "user_habits_insert_owner"
  on public.user_habits for insert to authenticated
  with check ((select auth.uid()) = user_id);
drop policy if exists "user_habits_update_owner" on public.user_habits;
create policy "user_habits_update_owner"
  on public.user_habits for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
drop policy if exists "user_habits_delete_owner" on public.user_habits;
create policy "user_habits_delete_owner"
  on public.user_habits for delete to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "workout_logs_select_owner_or_trainer" on public.workout_logs;
create policy "workout_logs_select_owner_or_trainer"
  on public.workout_logs for select to authenticated
  using ((select auth.uid()) = user_id or public.is_assigned_trainer(user_id));
drop policy if exists "workout_logs_insert_owner_or_trainer" on public.workout_logs;
create policy "workout_logs_insert_owner_or_trainer"
  on public.workout_logs for insert to authenticated
  with check ((select auth.uid()) = user_id or public.is_assigned_trainer(user_id));
drop policy if exists "workout_logs_update_owner_or_trainer" on public.workout_logs;
create policy "workout_logs_update_owner_or_trainer"
  on public.workout_logs for update to authenticated
  using ((select auth.uid()) = user_id or public.is_assigned_trainer(user_id))
  with check ((select auth.uid()) = user_id or public.is_assigned_trainer(user_id));
drop policy if exists "workout_logs_delete_owner_or_trainer" on public.workout_logs;
create policy "workout_logs_delete_owner_or_trainer"
  on public.workout_logs for delete to authenticated
  using ((select auth.uid()) = user_id or public.is_assigned_trainer(user_id));

drop policy if exists "body_metrics_select_owner_or_trainer" on public.body_metrics;
drop policy if exists "User can select own body_metrics" on public.body_metrics;
drop policy if exists "body_metrics_select_own" on public.body_metrics;
create policy "body_metrics_select_owner_or_trainer"
  on public.body_metrics for select to authenticated
  using ((select auth.uid()) = user_id or public.is_assigned_trainer(user_id));
drop policy if exists "body_metrics_update_owner" on public.body_metrics;
drop policy if exists "User can update own body_metrics" on public.body_metrics;
drop policy if exists "body_metrics_update_own" on public.body_metrics;
create policy "body_metrics_update_owner"
  on public.body_metrics for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
drop policy if exists "body_metrics_insert_owner" on public.body_metrics;
drop policy if exists "User can upsert own body_metrics" on public.body_metrics;
drop policy if exists "body_metrics_insert_own" on public.body_metrics;
create policy "body_metrics_insert_owner"
  on public.body_metrics for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "sessions_update_user_or_trainer" on public.sessions;
drop policy if exists "Users or trainers can update own sessions" on public.sessions;
create policy "sessions_update_user_or_trainer"
  on public.sessions for update to authenticated
  using ((select auth.uid()) = user_id or (select auth.uid()) = trainer_id)
  with check ((select auth.uid()) = user_id or (select auth.uid()) = trainer_id);
drop policy if exists "sessions_select_user_or_trainer" on public.sessions;
drop policy if exists "Users and trainers can select own sessions" on public.sessions;
create policy "sessions_select_user_or_trainer"
  on public.sessions for select to authenticated
  using ((select auth.uid()) = user_id or (select auth.uid()) = trainer_id);
drop policy if exists "sessions_insert_trainer" on public.sessions;
drop policy if exists "Trainer can insert sessions for their clients" on public.sessions;
create policy "sessions_insert_trainer"
  on public.sessions for insert to authenticated
  with check ((select auth.uid()) = trainer_id);

create index if not exists idx_progress_photos_user_date on public.progress_photos(user_id, taken_at desc);
create index if not exists idx_user_habits_user_date on public.user_habits(user_id, date desc);
create index if not exists idx_workout_logs_user_date on public.workout_logs(user_id, workout_date desc);
create index if not exists idx_sessions_user_trainer on public.sessions(user_id, trainer_id);

insert into public.user_macros (user_id)
select u.id from auth.users u
on conflict (user_id) do nothing;

insert into public.user_habits (user_id, date)
select u.id, current_date from auth.users u
on conflict (user_id, date) do nothing;
