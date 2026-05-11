-- Xiaoyao Studio attendance records setup
-- Run this in Supabase SQL Editor before using Teacher Admin -> 考勤管理.

create extension if not exists pgcrypto;

create table if not exists public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  class_code text not null,
  student_id text not null,
  student_name text,
  status text not null default 'present'
    check (status in ('present', 'late', 'leave', 'absent')),
  start_at timestamptz not null,
  end_at timestamptz not null,
  note text default '',
  created_by text default 'xiaoyao',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists attendance_records_class_time_idx
  on public.attendance_records (class_code, start_at desc);

create index if not exists attendance_records_student_time_idx
  on public.attendance_records (student_id, start_at desc);

create or replace function public.set_attendance_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_attendance_updated_at on public.attendance_records;
create trigger trg_attendance_updated_at
before update on public.attendance_records
for each row execute function public.set_attendance_updated_at();

alter table public.attendance_records enable row level security;

drop policy if exists "attendance_records_select_public" on public.attendance_records;
drop policy if exists "attendance_records_insert_public" on public.attendance_records;
drop policy if exists "attendance_records_update_public" on public.attendance_records;
drop policy if exists "attendance_records_delete_public" on public.attendance_records;

create policy "attendance_records_select_public"
on public.attendance_records for select
using (true);

create policy "attendance_records_insert_public"
on public.attendance_records for insert
with check (true);

create policy "attendance_records_update_public"
on public.attendance_records for update
using (true)
with check (true);

create policy "attendance_records_delete_public"
on public.attendance_records for delete
using (true);
