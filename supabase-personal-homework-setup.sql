-- Add personal-course targeting for one-to-one and online coaching homework.
-- Run this once in the Supabase SQL Editor before publishing personal homework.

alter table public.homework
  add column if not exists course_type text not null default 'class',
  add column if not exists class_id text,
  add column if not exists student_id text;

alter table public.students
  add column if not exists student_type text not null default 'class';

update public.homework
set
  course_type = coalesce(nullif(course_type, ''), 'class'),
  class_id = coalesce(nullif(class_id, ''), class_code)
where coalesce(nullif(course_type, ''), 'class') = 'class';

update public.students
set student_type = coalesce(nullif(student_type, ''), 'class');

alter table public.homework
  drop constraint if exists homework_course_type_check;

alter table public.homework
  add constraint homework_course_type_check
  check (course_type in ('class', 'one_to_one', 'coaching'));

alter table public.students
  drop constraint if exists students_student_type_check;

alter table public.students
  add constraint students_student_type_check
  check (student_type in ('class', 'one_to_one', 'coaching'));

create index if not exists homework_course_class_idx
  on public.homework (course_type, class_id, date desc);

create index if not exists homework_course_student_idx
  on public.homework (course_type, student_id, date desc);
