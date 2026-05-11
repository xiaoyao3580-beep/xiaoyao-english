create extension if not exists "pgcrypto";

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.vote_topics (
  id uuid primary key default gen_random_uuid(),
  topic_number integer not null unique,
  title_en text not null,
  title_zh text not null,
  topic_type text not null check (topic_type in ('OPINION', 'STORY', 'IMAGINATION')),
  allow_multiple boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vote_submissions (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid references public.vote_topics(id) on delete set null,
  topic_number integer not null references public.vote_topics(topic_number) on update cascade,
  topic_title_en text not null,
  topic_title_zh text not null,
  topic_type text not null check (topic_type in ('OPINION', 'STORY', 'IMAGINATION')),
  student_class text not null,
  student_name text not null,
  answers jsonb not null default '{}'::jsonb,
  remarks text,
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists idx_vote_topics_topic_number on public.vote_topics(topic_number);
create index if not exists idx_vote_submissions_topic_number on public.vote_submissions(topic_number);
create index if not exists idx_vote_submissions_submitted_at on public.vote_submissions(submitted_at desc);
create index if not exists idx_vote_submissions_student_class on public.vote_submissions(student_class);

drop index if exists public.idx_vote_submissions_one_per_topic;
create unique index if not exists idx_vote_submissions_one_per_topic
on public.vote_submissions(topic_number);

create unique index if not exists idx_vote_submissions_one_per_student
on public.vote_submissions(lower(student_class), lower(student_name));

drop trigger if exists trg_vote_topics_updated_at on public.vote_topics;
create trigger trg_vote_topics_updated_at
before update on public.vote_topics
for each row
execute function public.handle_updated_at();

insert into public.vote_topics (topic_number, title_en, title_zh, topic_type, allow_multiple)
values
  (1, 'Should primary school students use AI to do their homework?', '小学生该不该用 AI 写作业？', 'OPINION', false),
  (2, 'AI is smart, but does it care about people?', 'AI 很聪明，但它会关心人吗？', 'OPINION', false),
  (3, 'If I had a robot classmate', '如果我有一个机器人同学', 'IMAGINATION', false),
  (4, 'Why can''t we stop watching short videos?', '为什么刷短视频停不下来？', 'OPINION', false),
  (5, 'Do you want to live on Mars?', '你想住在火星吗？', 'OPINION', false),
  (6, 'Curiosity is my superpower', '好奇心是我的超能力', 'STORY', false),
  (7, 'A good class isn''t necessarily a quiet class', '好课堂不一定是安静的课堂', 'OPINION', false),
  (8, 'Mistakes help me learn', '错误帮助我学习', 'STORY', false),
  (9, 'The best teacher is not necessarily the strictest teacher', '最好的老师不一定是最严厉的老师', 'OPINION', false),
  (10, 'Why do Chinese people value learning?', '为什么中国人重视学习？', 'OPINION', false),
  (11, 'The moment I stopped being afraid to speak English', '我不再害怕开口说英语，是从哪一刻开始的', 'STORY', false),
  (12, 'If animals could talk, whose English would be the best?', '如果动物会说话，谁的英语最好', 'IMAGINATION', false),
  (13, 'If there were only 6 hours in a day, what time would I cut?', '如果一天只有6个小时，我会砍掉哪段时间', 'IMAGINATION', false),
  (14, 'If you could delete one emotion, which one would it be?', '如果可以删掉一种情绪，你会删哪个', 'IMAGINATION', false),
  (15, 'If colors had flavors, what would red taste like?', '如果颜色有味道，红色是什么味', 'IMAGINATION', false),
  (16, 'Why do adults always say "I''ve told you this before"?', '为什么大人总说"我跟你讲过了"', 'STORY', false),
  (17, 'Why does my mom believe health articles on Moments?', '为什么我妈相信朋友圈里的养生文章', 'OPINION', false),
  (18, 'Is it better to have more friends? Does a quiet child mean no ideas?', '朋友越多越好吗？安静的孩子，就是没想法吗', 'OPINION', false),
  (19, 'What is "true intelligence"?', '什么才算"真正的聪明"', 'OPINION', false),
  (20, 'Is time fair?', '时间是公平的吗', 'OPINION', false),
  (21, 'If I were to design a school, what would it look like?', '如果让我设计一所学校，它会是什么样', 'IMAGINATION', false),
  (22, 'In the animal world, who lives the smartest?', '动物世界里，谁活得最聪明', 'OPINION', false),
  (23, 'Not being able to do it doesn''t mean you can''t do it well', '做不到，不等于做不好', 'STORY', false),
  (24, 'Growing up, what does it actually mean to become?', '长大，到底是变成什么样', 'STORY', false),
  (25, 'Why do people need friends?', '为什么人需要朋友？', 'OPINION', false),
  (26, 'If I could invent a magical app, what would it do?', '如果我能发明一个神奇的 App，它会有什么用？', 'IMAGINATION', false),
  (27, 'Will playing video games make us smarter or dumber?', '打游戏会让我们变聪明还是变笨？', 'OPINION', false),
  (28, 'A time I chose to be brave instead of perfect', '有一次，我选择了勇敢而不是完美', 'STORY', false),
  (29, 'Why do we sometimes feel angry for no reason?', '为什么我们有时候会无缘无故地生气？', 'OPINION', false),
  (30, 'What I wish adults understood about being a kid today', '我希望大人能明白，现在做个小孩是什么感觉', 'OPINION', false),
  (31, 'What makes a true friend different from a normal classmate?', '真正的朋友和普通的同学有什么区别？', 'OPINION', false),
  (32, 'The best apology I ever gave or received', '我道过最棒的歉，或者收到过最棒的道歉', 'STORY', false),
  (33, 'If history classes were taught by time machines', '如果历史课是用时光机来上的', 'IMAGINATION', false),
  (34, 'What if we had to pay for things with kindness instead of money?', '如果买东西不用钱，而是用“善良”来支付会怎样？', 'IMAGINATION', false),
  (35, 'The most useless thing I learned this year, and why I still like it', '今年我学到的最没用的一件事，以及为什么我依然喜欢它', 'STORY', false)
on conflict (topic_number) do update
set
  title_en = excluded.title_en,
  title_zh = excluded.title_zh,
  topic_type = excluded.topic_type,
  allow_multiple = excluded.allow_multiple;

drop view if exists public.vote_topic_status;
create view public.vote_topic_status as
select
  t.id,
  t.topic_number,
  t.title_en,
  t.title_zh,
  t.topic_type,
  t.allow_multiple,
  (
    not t.allow_multiple
    and exists (
      select 1
      from public.vote_submissions s
      where s.topic_number = t.topic_number
    )
  ) as is_locked,
  (
    select count(*)::integer
    from public.vote_submissions s
    where s.topic_number = t.topic_number
  ) as submission_count
from public.vote_topics t;

create or replace function public.submit_vote_selection(
  p_topic_number integer,
  p_student_class text,
  p_student_name text,
  p_answers jsonb,
  p_remarks text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_topic public.vote_topics%rowtype;
  v_class text := nullif(btrim(coalesce(p_student_class, '')), '');
  v_name text := nullif(btrim(coalesce(p_student_name, '')), '');
  v_remarks text := nullif(btrim(coalesce(p_remarks, '')), '');
  v_required text[];
  v_key text;
  v_submission_id uuid;
  v_constraint text;
begin
  if v_class is null then
    raise exception 'MISSING_CLASS';
  end if;

  if not (v_class = any (array['Talent A1+', 'Talent A2', 'Talent A2+'])) then
    raise exception 'INVALID_CLASS';
  end if;

  if v_name is null then
    raise exception 'MISSING_NAME';
  end if;

  select * into v_topic
  from public.vote_topics
  where topic_number = p_topic_number;

  if not found then
    raise exception 'INVALID_TOPIC';
  end if;

  if p_answers is null or jsonb_typeof(p_answers) <> 'object' then
    raise exception 'MISSING_ANSWER';
  end if;

  v_required := case v_topic.topic_type
    when 'STORY' then array['story', 'feeling', 'lesson']
    when 'IMAGINATION' then array['imagination', 'interesting', 'next']
    else array['opinion', 'reason', 'example', 'conclusion']
  end;

  foreach v_key in array v_required loop
    if nullif(btrim(coalesce(p_answers ->> v_key, '')), '') is null then
      raise exception 'MISSING_ANSWER:%', v_key;
    end if;
  end loop;

  if exists (
    select 1
    from public.vote_submissions s
    where lower(s.student_class) = lower(v_class)
      and lower(s.student_name) = lower(v_name)
  ) then
    raise exception 'STUDENT_ALREADY_SUBMITTED';
  end if;

  if not v_topic.allow_multiple and exists (
    select 1
    from public.vote_submissions s
    where s.topic_number = v_topic.topic_number
  ) then
    raise exception 'TOPIC_ALREADY_TAKEN';
  end if;

  insert into public.vote_submissions (
    topic_id,
    topic_number,
    topic_title_en,
    topic_title_zh,
    topic_type,
    student_class,
    student_name,
    answers,
    remarks
  )
  values (
    v_topic.id,
    v_topic.topic_number,
    v_topic.title_en,
    v_topic.title_zh,
    v_topic.topic_type,
    v_class,
    v_name,
    p_answers,
    v_remarks
  )
  returning id into v_submission_id;

  return jsonb_build_object(
    'submissionId', v_submission_id,
    'topicNumber', v_topic.topic_number,
    'allowMultiple', v_topic.allow_multiple
  );
exception
  when unique_violation then
    get stacked diagnostics v_constraint = constraint_name;

    if v_constraint = 'idx_vote_submissions_one_per_student' then
      raise exception 'STUDENT_ALREADY_SUBMITTED';
    end if;

    if v_constraint = 'idx_vote_submissions_one_per_topic' then
      raise exception 'TOPIC_ALREADY_TAKEN';
    end if;

    raise;
end;
$$;

alter table public.vote_topics enable row level security;
alter table public.vote_submissions enable row level security;

drop policy if exists "public read vote topics" on public.vote_topics;
create policy "public read vote topics"
on public.vote_topics
for select
to anon, authenticated
using (true);

drop policy if exists "public read vote submissions" on public.vote_submissions;
create policy "public read vote submissions"
on public.vote_submissions
for select
to anon, authenticated
using (true);

drop policy if exists "public insert vote submissions" on public.vote_submissions;
create policy "public insert vote submissions"
on public.vote_submissions
for insert
to anon, authenticated
with check (true);

drop policy if exists "public delete vote submissions" on public.vote_submissions;
create policy "public delete vote submissions"
on public.vote_submissions
for delete
to anon, authenticated
using (true);

drop policy if exists "teachers read vote submissions" on public.vote_submissions;
drop policy if exists "teachers delete vote submissions" on public.vote_submissions;

grant select on public.vote_topics to anon, authenticated;
grant select on public.vote_topic_status to anon, authenticated;
grant select, insert, delete on public.vote_submissions to anon, authenticated;
grant execute on function public.submit_vote_selection(integer, text, text, jsonb, text) to anon, authenticated;

notify pgrst, 'reload schema';
