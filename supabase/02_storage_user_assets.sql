-- Create storage bucket for user assets if not exists
insert into storage.buckets (id, name, public)
select 'user-assets', 'user-assets', true
where not exists (select 1 from storage.buckets where id = 'user-assets');

-- RLS policies for storage.objects in this bucket
-- Allow public read for objects in user-assets
create policy if not exists "Public read user-assets"
on storage.objects for select
using (bucket_id = 'user-assets');

-- Allow authenticated users to insert into their own prefix
create policy if not exists "Users can upload to own folder"
on storage.objects for insert
with check (
  bucket_id = 'user-assets' and
  (auth.uid()::text || '/') = split_part(name, '/', 1) || '/'
);

-- Allow owners to update/delete their own objects
create policy if not exists "Users can modify own objects"
on storage.objects for update using (
  bucket_id = 'user-assets' and
  (auth.uid()::text || '/') = split_part(name, '/', 1) || '/'
);

create policy if not exists "Users can delete own objects"
on storage.objects for delete using (
  bucket_id = 'user-assets' and
  (auth.uid()::text || '/') = split_part(name, '/', 1) || '/'
);
