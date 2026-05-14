-- Xiaoyao Studio homepage banner backend setup.
-- Run this once in Supabase SQL Editor for project avffxvpwzpvlohoyqshb.

create table if not exists public.banners (
  id text primary key,
  tag text not null default 'Studio News',
  title text not null,
  subtitle text not null default '点击查看详情。',
  image text not null,
  link text default '',
  position text not null default 'center',
  sort_order integer not null default 1,
  status text not null default 'open' check (status in ('open', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.banners add column if not exists tag text not null default 'Studio News';
alter table public.banners add column if not exists title text not null default '';
alter table public.banners add column if not exists subtitle text not null default '点击查看详情。';
alter table public.banners add column if not exists image text not null default '';
alter table public.banners add column if not exists link text default '';
alter table public.banners add column if not exists position text not null default 'center';
alter table public.banners add column if not exists sort_order integer not null default 1;
alter table public.banners add column if not exists status text not null default 'open';
alter table public.banners add column if not exists created_at timestamptz not null default now();
alter table public.banners add column if not exists updated_at timestamptz not null default now();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists banners_set_updated_at on public.banners;
create trigger banners_set_updated_at
before update on public.banners
for each row execute function public.set_updated_at();

alter table public.banners enable row level security;

drop policy if exists "Banners public read" on public.banners;
drop policy if exists "Banners public insert" on public.banners;
drop policy if exists "Banners public update" on public.banners;
drop policy if exists "Banners public delete" on public.banners;

create policy "Banners public read"
on public.banners for select
using (true);

create policy "Banners public insert"
on public.banners for insert
with check (true);

create policy "Banners public update"
on public.banners for update
using (true)
with check (true);

create policy "Banners public delete"
on public.banners for delete
using (true);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'banner-images',
  'banner-images',
  true,
  10485760,
  array['image/jpeg','image/png','image/webp','image/gif']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Banner images public read" on storage.objects;
drop policy if exists "Banner images public insert" on storage.objects;
drop policy if exists "Banner images public update" on storage.objects;
drop policy if exists "Banner images public delete" on storage.objects;

create policy "Banner images public read"
on storage.objects for select
using (bucket_id = 'banner-images');

create policy "Banner images public insert"
on storage.objects for insert
with check (bucket_id = 'banner-images');

create policy "Banner images public update"
on storage.objects for update
using (bucket_id = 'banner-images')
with check (bucket_id = 'banner-images');

create policy "Banner images public delete"
on storage.objects for delete
using (bucket_id = 'banner-images');

insert into public.banners (id, tag, title, subtitle, image, link, position, sort_order, status)
values
  (
    'xiaoyao-book-launch',
    'Media Feature',
    '肖瑶老师|《高效英语学习法的“密码”》|新书发布会深圳举办',
    '点击查看报道全文。',
    'https://avffxvpwzpvlohoyqshb.supabase.co/storage/v1/object/public/banner-images/migrated/xiaoyao-book-launch.webp',
    'https://life.china.com/2023-05/01/content_203736.html',
    'center',
    1,
    'open'
  ),
  (
    'xiaoyao-youth-voice',
    'Studio Story',
    '肖瑶启言工作室：|用镜头语言，|让世界听见中国青少年的声音',
    '点击查看专题报道。',
    'https://avffxvpwzpvlohoyqshb.supabase.co/storage/v1/object/public/banner-images/migrated/xiaoyao-youth-voice.webp',
    'http://www.senn.com.cn/syzx/2025/02/11/208516.html',
    'center',
    2,
    'open'
  ),
  (
    'xiaoyao-radio-visit',
    'Studio Visit',
    '肖瑶老师|走进深圳交通广播电台',
    '做客FM106.2，分享英语学习经验与教育心得',
    'https://avffxvpwzpvlohoyqshb.supabase.co/storage/v1/object/public/banner-images/migrated/xiaoyao-radio-visit.webp',
    '',
    '50% 65%',
    3,
    'open'
  )
on conflict (id) do update
set tag = excluded.tag,
    title = excluded.title,
    subtitle = excluded.subtitle,
    image = excluded.image,
    link = excluded.link,
    position = excluded.position,
    sort_order = excluded.sort_order,
    status = excluded.status,
    updated_at = now();
