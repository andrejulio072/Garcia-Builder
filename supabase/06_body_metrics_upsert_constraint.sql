-- Allows Supabase client upserts with onConflict: 'user_id,client_id'.
-- A partial unique index cannot be inferred by PostgREST for this conflict target.

create unique index if not exists uq_body_metrics_user_client_all
on public.body_metrics(user_id, client_id);
