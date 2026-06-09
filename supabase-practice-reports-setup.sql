-- Xiaoyao Studio detailed student practice reports.
-- Run this once in Supabase SQL Editor.
--
-- This table stores rich per-attempt report data for custom homework pages.
-- It does not replace growth_logs. growth_logs remains the lightweight score
-- ledger for existing reports, points, and attendance logic.

create extension if not exists pgcrypto;

create table if not exists public.student_practice_reports (
  id uuid primary key default gen_random_uuid(),
  student_id text not null,
  homework_id text not null,
  module_title text,
  score numeric default 0,
  correct_count numeric,
  total_count numeric,
  started_at timestamptz,
  finished_at timestamptz,
  duration_seconds numeric,
  summary jsonb default '{}'::jsonb,
  phrase_details jsonb default '[]'::jsonb,
  attempts jsonb default '[]'::jsonb,
  raw_report jsonb default '{}'::jsonb,
  source text default 'lesson_bridge',
  created_at timestamptz not null default now()
);

alter table public.student_practice_reports
  add column if not exists student_id text,
  add column if not exists homework_id text,
  add column if not exists module_title text,
  add column if not exists score numeric default 0,
  add column if not exists correct_count numeric,
  add column if not exists total_count numeric,
  add column if not exists started_at timestamptz,
  add column if not exists finished_at timestamptz,
  add column if not exists duration_seconds numeric,
  add column if not exists summary jsonb default '{}'::jsonb,
  add column if not exists phrase_details jsonb default '[]'::jsonb,
  add column if not exists attempts jsonb default '[]'::jsonb,
  add column if not exists raw_report jsonb default '{}'::jsonb,
  add column if not exists source text default 'lesson_bridge',
  add column if not exists created_at timestamptz default now();

create index if not exists student_practice_reports_student_time_idx
  on public.student_practice_reports (student_id, created_at desc);

create index if not exists student_practice_reports_homework_time_idx
  on public.student_practice_reports (homework_id, created_at desc);

alter table public.student_practice_reports enable row level security;

drop policy if exists "student_practice_reports_select_public" on public.student_practice_reports;
drop policy if exists "student_practice_reports_insert_public" on public.student_practice_reports;
drop policy if exists "student_practice_reports_update_public" on public.student_practice_reports;
drop policy if exists "student_practice_reports_delete_public" on public.student_practice_reports;

create policy "student_practice_reports_select_public"
on public.student_practice_reports for select
using (true);

create policy "student_practice_reports_insert_public"
on public.student_practice_reports for insert
with check (true);

create policy "student_practice_reports_update_public"
on public.student_practice_reports for update
using (true)
with check (true);

create policy "student_practice_reports_delete_public"
on public.student_practice_reports for delete
using (true);

notify pgrst, 'reload schema';
