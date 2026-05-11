-- Xiaoyao Studio unified lesson completion records.
-- Run this in Supabase SQL Editor before relying on pets, reports, or attendance completion checks.
--
-- Table responsibilities:
-- - growth_logs: lesson/homework/check-in completion ledger written by lesson pages.
-- - attendance_records: manual teacher attendance/exemption records from Teacher Admin.
--
-- Existing foreign keys on growth_logs are preserved. If your current project already
-- links student_id to students(id), course records must use a real student id.

create extension if not exists pgcrypto;

create table if not exists public.growth_logs (
  id uuid primary key default gen_random_uuid(),
  student_id text not null,
  homework_id text not null,
  score numeric not null default 0,
  stars_earned int not null default 0,
  attempt_count int not null default 1,
  is_best_score boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.growth_logs
  add column if not exists student_id text,
  add column if not exists homework_id text,
  add column if not exists score numeric default 0,
  add column if not exists stars_earned int default 0,
  add column if not exists attempt_count int default 1,
  add column if not exists is_best_score boolean default true,
  add column if not exists correct_count numeric,
  add column if not exists total_count numeric,
  add column if not exists source text default 'lesson_bridge',
  add column if not exists event_type text default 'complete',
  add column if not exists module_title text,
  add column if not exists metadata jsonb default '{}'::jsonb,
  add column if not exists created_at timestamptz default now();

create index if not exists growth_logs_student_time_idx
  on public.growth_logs (student_id, created_at desc);

create index if not exists growth_logs_homework_time_idx
  on public.growth_logs (homework_id, created_at desc);

create index if not exists growth_logs_student_homework_idx
  on public.growth_logs (student_id, homework_id);

alter table public.growth_logs enable row level security;

drop policy if exists "growth_logs_select_public" on public.growth_logs;
drop policy if exists "growth_logs_insert_public" on public.growth_logs;
drop policy if exists "growth_logs_update_public" on public.growth_logs;
drop policy if exists "growth_logs_delete_public" on public.growth_logs;

create policy "growth_logs_select_public"
on public.growth_logs for select
using (true);

create policy "growth_logs_insert_public"
on public.growth_logs for insert
with check (true);

create policy "growth_logs_update_public"
on public.growth_logs for update
using (true)
with check (true);

create policy "growth_logs_delete_public"
on public.growth_logs for delete
using (true);

notify pgrst, 'reload schema';
