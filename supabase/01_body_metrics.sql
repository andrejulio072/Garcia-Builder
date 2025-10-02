-- Body Metrics table with RLS and client-side deduplication
create extension if not exists pgcrypto;

create table if not exists public.body_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  weight numeric,
  height numeric,
  body_fat numeric,
  measurements jsonb default '{}'::jsonb,
  notes text,
  client_id text, -- client-generated id to dedupe local sync
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.body_metrics enable row level security;

-- Policies: a user can manage only their own rows
create policy if not exists "body_metrics_select_own"
on public.body_metrics for select using (auth.uid() = user_id);

create policy if not exists "body_metrics_insert_own"
on public.body_metrics for insert with check (auth.uid() = user_id);

create policy if not exists "body_metrics_update_own"
on public.body_metrics for update using (auth.uid() = user_id);

-- Useful indexes
create index if not exists idx_body_metrics_user_date on public.body_metrics(user_id, date desc);
create unique index if not exists uq_body_metrics_user_client on public.body_metrics(user_id, client_id) where client_id is not null;
