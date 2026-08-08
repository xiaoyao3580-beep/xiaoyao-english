-- Xiaoyao Studio reinforcement tasks.
-- Run once in Supabase SQL Editor if you want the teacher report page
-- to save reinforcement drafts generated from error diagnostics.

create extension if not exists pgcrypto;

create table if not exists public.reinforcement_tasks (
  id uuid primary key default gen_random_uuid(),
  class_code text,
  class_label text,
  skill_key text not null,
  skill_label text not null,
  target_count integer not null default 8 check (target_count > 0 and target_count <= 80),
  difficulty text not null default '中阶巩固',
  source_strategy text not null default 'preset_first_ai_fill',
  prompt text not null,
  generated_items jsonb not null default '[]'::jsonb,
  assigned_student_ids text[] not null default '{}'::text[],
  status text not null default 'draft' check (status in ('draft','ready','assigned','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists reinforcement_tasks_class_code_idx on public.reinforcement_tasks (class_code);
create index if not exists reinforcement_tasks_skill_key_idx on public.reinforcement_tasks (skill_key);
create index if not exists reinforcement_tasks_created_at_idx on public.reinforcement_tasks (created_at desc);

create or replace function public.xy_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists reinforcement_tasks_touch_updated_at on public.reinforcement_tasks;
create trigger reinforcement_tasks_touch_updated_at
before update on public.reinforcement_tasks
for each row execute function public.xy_touch_updated_at();

alter table public.reinforcement_tasks enable row level security;

drop policy if exists "reinforcement tasks client read" on public.reinforcement_tasks;
create policy "reinforcement tasks client read"
on public.reinforcement_tasks
for select
using (true);

drop policy if exists "reinforcement tasks client insert" on public.reinforcement_tasks;
create policy "reinforcement tasks client insert"
on public.reinforcement_tasks
for insert
with check (true);

drop policy if exists "reinforcement tasks client update" on public.reinforcement_tasks;
create policy "reinforcement tasks client update"
on public.reinforcement_tasks
for update
using (true)
with check (true);

drop policy if exists "reinforcement tasks client delete" on public.reinforcement_tasks;
create policy "reinforcement tasks client delete"
on public.reinforcement_tasks
for delete
using (true);

notify pgrst, 'reload schema';
