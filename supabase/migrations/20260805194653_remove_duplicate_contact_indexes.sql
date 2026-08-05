-- The corresponding unique constraints already provide equivalent indexes.
drop index if exists public.leads_email_unique_idx;
drop index if exists public.idx_newsletter_subscribers_email_unique;
