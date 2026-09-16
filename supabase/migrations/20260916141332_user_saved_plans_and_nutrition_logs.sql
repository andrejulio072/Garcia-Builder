-- Saved workout/nutrition templates and daily nutrition tracking.
-- Passwords remain exclusively managed by Supabase Auth.

create table if not exists public.user_saved_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  template_type text not null check (template_type in ('workout', 'nutrition')),
  template_key text not null check (char_length(template_key) between 1 and 160),
  title text not null check (char_length(title) between 1 and 180),
  source_url text,
  template_snapshot jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, template_type, template_key)
);

create table if not exists public.nutrition_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  saved_template_id uuid references public.user_saved_templates(id) on delete set null,
  log_date date not null default current_date,
  meals_completed integer not null default 0 check (meals_completed between 0 and 20),
  target_meals integer not null default 0 check (target_meals between 0 and 20),
  calories numeric check (calories is null or calories between 0 and 15000),
  protein_g numeric check (protein_g is null or protein_g between 0 and 1000),
  carbs_g numeric check (carbs_g is null or carbs_g between 0 and 2000),
  fats_g numeric check (fats_g is null or fats_g between 0 and 1000),
  water_ml integer not null default 0 check (water_ml between 0 and 20000),
  adherence_percent integer not null default 0 check (adherence_percent between 0 and 100),
  notes text check (notes is null or char_length(notes) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, log_date)
);

alter table public.workout_logs
  add column if not exists saved_template_id uuid
  references public.user_saved_templates(id) on delete set null;

alter table public.user_saved_templates enable row level security;
alter table public.nutrition_logs enable row level security;

revoke all on public.user_saved_templates from public, anon, authenticated;
revoke all on public.nutrition_logs from public, anon, authenticated;
grant select, insert, update, delete on public.user_saved_templates to authenticated;
grant select, insert, update, delete on public.nutrition_logs to authenticated;

drop policy if exists "user_saved_templates_select_owner" on public.user_saved_templates;
create policy "user_saved_templates_select_owner"
  on public.user_saved_templates for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "user_saved_templates_insert_owner" on public.user_saved_templates;
create policy "user_saved_templates_insert_owner"
  on public.user_saved_templates for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "user_saved_templates_update_owner" on public.user_saved_templates;
create policy "user_saved_templates_update_owner"
  on public.user_saved_templates for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "user_saved_templates_delete_owner" on public.user_saved_templates;
create policy "user_saved_templates_delete_owner"
  on public.user_saved_templates for delete to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "nutrition_logs_select_owner" on public.nutrition_logs;
create policy "nutrition_logs_select_owner"
  on public.nutrition_logs for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "nutrition_logs_insert_owner" on public.nutrition_logs;
create policy "nutrition_logs_insert_owner"
  on public.nutrition_logs for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "nutrition_logs_update_owner" on public.nutrition_logs;
create policy "nutrition_logs_update_owner"
  on public.nutrition_logs for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "nutrition_logs_delete_owner" on public.nutrition_logs;
create policy "nutrition_logs_delete_owner"
  on public.nutrition_logs for delete to authenticated
  using ((select auth.uid()) = user_id);

create index if not exists idx_user_saved_templates_user_type_updated
  on public.user_saved_templates(user_id, template_type, updated_at desc);
create index if not exists idx_nutrition_logs_user_date
  on public.nutrition_logs(user_id, log_date desc);
create index if not exists idx_nutrition_logs_saved_template
  on public.nutrition_logs(saved_template_id)
  where saved_template_id is not null;
create index if not exists idx_workout_logs_saved_template
  on public.workout_logs(saved_template_id)
  where saved_template_id is not null;

comment on table public.user_saved_templates is
  'User-owned snapshots of workout and nutrition templates selected from the public libraries.';
comment on table public.nutrition_logs is
  'One user-owned nutrition summary per calendar day.';
