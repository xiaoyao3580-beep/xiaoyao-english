-- Xiaoyao Studio lesson upload storage.
-- Run this once in Supabase SQL Editor for the current static frontend.
-- Bucket used by xiaoyao1/app.js: LESSON_UPLOAD_BUCKET = 'lesson-files'

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'lesson-files',
  'lesson-files',
  true,
  52428800,
  array['text/html', 'application/octet-stream']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "lesson files public read" on storage.objects;
create policy "lesson files public read"
on storage.objects
for select
using (bucket_id = 'lesson-files');

drop policy if exists "lesson files client upload" on storage.objects;
create policy "lesson files client upload"
on storage.objects
for insert
with check (bucket_id = 'lesson-files');

drop policy if exists "lesson files client update" on storage.objects;
create policy "lesson files client update"
on storage.objects
for update
using (bucket_id = 'lesson-files')
with check (bucket_id = 'lesson-files');

drop policy if exists "lesson files client delete" on storage.objects;
create policy "lesson files client delete"
on storage.objects
for delete
using (bucket_id = 'lesson-files');
