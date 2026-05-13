-- Xiaoyao Studio pet module.
-- Run this after supabase-growth-logs-setup.sql.
-- This version is adapted for xiaoyao1 student accounts: students.id is text,
-- and all course rewards are driven by growth_logs.

create extension if not exists pgcrypto;

create or replace function public.xy_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.student_pets (
  student_id text primary key references public.students(id) on delete cascade,
  pet_type text not null default 'fox' check (pet_type in ('fox', 'owl')),
  pet_name text not null,
  is_visible boolean not null default true,
  experience_points integer not null default 0 check (experience_points >= 0),
  pet_points integer not null default 0 check (pet_points >= 0),
  level_mode text not null default 'auto' check (level_mode in ('auto', 'manual')),
  manual_level integer check (manual_level between 1 and 4),
  equipped_item text,
  environment_key text not null default 'warm-sun' check (environment_key in ('warm-sun', 'forest', 'starry', 'ocean')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
declare
  constraint_name text;
begin
  for constraint_name in
    select conname
    from pg_constraint
    where conrelid = 'public.student_pets'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) like '%pet_type%'
  loop
    execute format('alter table public.student_pets drop constraint if exists %I', constraint_name);
  end loop;
end $$;

alter table public.student_pets
add constraint student_pets_pet_type_check
check (pet_type in ('fox', 'owl', 'deer', 'whale', 'otter', 'dragon'));

create table if not exists public.pet_inventory (
  student_id text not null references public.students(id) on delete cascade,
  item_key text not null,
  acquired_at timestamptz not null default now(),
  primary key (student_id, item_key)
);

create table if not exists public.pet_item_rules (
  item_key text primary key,
  label text not null,
  price integer not null default 0 check (price >= 0),
  sort_order integer not null default 0,
  active boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.pet_level_rules (
  level integer primary key check (level between 1 and 4),
  required_xp integer not null default 0 check (required_xp >= 0),
  stage integer not null check (stage between 1 and 4),
  updated_at timestamptz not null default now()
);

create table if not exists public.pet_reward_rules (
  tier_key text primary key,
  label text not null,
  min_score integer not null check (min_score between 0 and 100),
  xp_reward integer not null default 0 check (xp_reward >= 0),
  point_reward integer not null default 0 check (point_reward >= 0),
  sort_order integer not null default 0,
  active boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.pet_type_rules (
  pet_type text primary key check (pet_type in ('fox', 'owl', 'deer', 'whale', 'otter', 'dragon')),
  label_zh text not null,
  is_hidden boolean not null default false,
  unlock_points integer not null default 0 check (unlock_points >= 0),
  unlock_pet_count integer not null default 0 check (unlock_pet_count >= 0),
  switch_price integer not null default 80 check (switch_price >= 0),
  sort_order integer not null default 0,
  active boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.pet_type_rules
add column if not exists switch_price integer not null default 80 check (switch_price >= 0);

create table if not exists public.pet_type_unlocks (
  student_id text not null references public.students(id) on delete cascade,
  pet_type text not null check (pet_type in ('fox', 'owl', 'deer', 'whale', 'otter', 'dragon')),
  source text not null default 'manual',
  reason text,
  created_by text,
  created_at timestamptz not null default now(),
  primary key (student_id, pet_type)
);

create table if not exists public.pet_reward_events (
  id uuid primary key default gen_random_uuid(),
  student_id text not null references public.students(id) on delete cascade,
  source_type text not null,
  source_id uuid,
  tier_key text,
  xp_delta integer not null default 0,
  point_delta integer not null default 0,
  reason text,
  created_by text,
  created_at timestamptz not null default now()
);

create unique index if not exists pet_reward_events_once_idx
on public.pet_reward_events(student_id, source_type, source_id)
where source_id is not null;

create index if not exists pet_reward_events_student_idx on public.pet_reward_events(student_id);
create index if not exists pet_reward_events_time_idx on public.pet_reward_events(created_at desc);

insert into public.pet_item_rules (item_key, label, price, sort_order, active)
values
  ('scarf', '围巾', 40, 1, true),
  ('bow', '蝴蝶结', 60, 2, true),
  ('hat', '帽子', 100, 3, true),
  ('crown', '皇冠', 180, 4, true)
on conflict (item_key) do update
set label = excluded.label,
    price = excluded.price,
    sort_order = excluded.sort_order,
    active = excluded.active,
    updated_at = now();

insert into public.pet_level_rules (level, required_xp, stage)
values
  (1, 0, 1),
  (2, 100, 2),
  (3, 250, 3),
  (4, 450, 4)
on conflict (level) do update
set required_xp = excluded.required_xp,
    stage = excluded.stage,
    updated_at = now();

insert into public.pet_reward_rules (tier_key, label, min_score, xp_reward, point_reward, sort_order, active)
values
  ('high', '优秀', 90, 30, 20, 1, true),
  ('medium', '达标', 70, 18, 12, 2, true),
  ('low', '完成', 0, 8, 5, 3, true)
on conflict (tier_key) do update
set label = excluded.label,
    min_score = excluded.min_score,
    xp_reward = excluded.xp_reward,
    point_reward = excluded.point_reward,
    sort_order = excluded.sort_order,
    active = excluded.active,
    updated_at = now();

insert into public.pet_type_rules (pet_type, label_zh, is_hidden, unlock_points, unlock_pet_count, switch_price, sort_order, active)
values
  ('fox', '小狐狸', false, 0, 0, 80, 1, true),
  ('owl', '小夜鹰', false, 0, 0, 80, 2, true),
  ('deer', '小鹿', false, 0, 0, 80, 3, true),
  ('otter', '小水獭', false, 0, 0, 80, 4, true),
  ('whale', '小鲸鱼', true, 600, 0, 160, 5, true),
  ('dragon', '小龙', true, 0, 4, 160, 6, true)
on conflict (pet_type) do update
set label_zh = excluded.label_zh,
    is_hidden = excluded.is_hidden,
    unlock_points = excluded.unlock_points,
    unlock_pet_count = excluded.unlock_pet_count,
    switch_price = excluded.switch_price,
    sort_order = excluded.sort_order,
    active = excluded.active,
    updated_at = now();

drop trigger if exists trg_student_pets_updated_at on public.student_pets;
create trigger trg_student_pets_updated_at
before update on public.student_pets
for each row execute function public.xy_touch_updated_at();

drop trigger if exists trg_pet_item_rules_updated_at on public.pet_item_rules;
create trigger trg_pet_item_rules_updated_at
before update on public.pet_item_rules
for each row execute function public.xy_touch_updated_at();

drop trigger if exists trg_pet_level_rules_updated_at on public.pet_level_rules;
create trigger trg_pet_level_rules_updated_at
before update on public.pet_level_rules
for each row execute function public.xy_touch_updated_at();

drop trigger if exists trg_pet_reward_rules_updated_at on public.pet_reward_rules;
create trigger trg_pet_reward_rules_updated_at
before update on public.pet_reward_rules
for each row execute function public.xy_touch_updated_at();

drop trigger if exists trg_pet_type_rules_updated_at on public.pet_type_rules;
create trigger trg_pet_type_rules_updated_at
before update on public.pet_type_rules
for each row execute function public.xy_touch_updated_at();

alter table public.student_pets enable row level security;
alter table public.pet_inventory enable row level security;
alter table public.pet_item_rules enable row level security;
alter table public.pet_level_rules enable row level security;
alter table public.pet_reward_rules enable row level security;
alter table public.pet_type_rules enable row level security;
alter table public.pet_type_unlocks enable row level security;
alter table public.pet_reward_events enable row level security;

drop policy if exists "student_pets_public_all" on public.student_pets;
drop policy if exists "pet_inventory_public_all" on public.pet_inventory;
drop policy if exists "pet_item_rules_public_all" on public.pet_item_rules;
drop policy if exists "pet_level_rules_public_all" on public.pet_level_rules;
drop policy if exists "pet_reward_rules_public_all" on public.pet_reward_rules;
drop policy if exists "pet_type_rules_public_all" on public.pet_type_rules;
drop policy if exists "pet_type_unlocks_public_all" on public.pet_type_unlocks;
drop policy if exists "pet_reward_events_public_all" on public.pet_reward_events;

create policy "student_pets_public_all" on public.student_pets
for all to anon, authenticated using (true) with check (true);
create policy "pet_inventory_public_all" on public.pet_inventory
for all to anon, authenticated using (true) with check (true);
create policy "pet_item_rules_public_all" on public.pet_item_rules
for all to anon, authenticated using (true) with check (true);
create policy "pet_level_rules_public_all" on public.pet_level_rules
for all to anon, authenticated using (true) with check (true);
create policy "pet_reward_rules_public_all" on public.pet_reward_rules
for all to anon, authenticated using (true) with check (true);
create policy "pet_type_rules_public_all" on public.pet_type_rules
for all to anon, authenticated using (true) with check (true);
create policy "pet_type_unlocks_public_all" on public.pet_type_unlocks
for all to anon, authenticated using (true) with check (true);
create policy "pet_reward_events_public_all" on public.pet_reward_events
for all to anon, authenticated using (true) with check (true);

create or replace function public.award_pet_for_growth_log(p_log_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  log_row public.growth_logs;
  reward_rule public.pet_reward_rules;
  inserted_event public.pet_reward_events;
  next_pet public.student_pets;
begin
  select * into log_row from public.growth_logs where id = p_log_id;
  if log_row.id is null then
    return jsonb_build_object('awarded', false, 'reason', 'log_not_found');
  end if;

  select * into next_pet
  from public.student_pets
  where student_id = log_row.student_id
  for update;

  if next_pet.student_id is null then
    return jsonb_build_object('awarded', false, 'reason', 'no_pet');
  end if;

  select * into reward_rule
  from public.pet_reward_rules
  where active = true and min_score <= least(greatest(coalesce(log_row.score, 0), 0), 100)
  order by min_score desc, sort_order asc
  limit 1;

  if reward_rule.tier_key is null then
    return jsonb_build_object('awarded', false, 'reason', 'no_rule');
  end if;

  insert into public.pet_reward_events (
    student_id, source_type, source_id, tier_key, xp_delta, point_delta, reason, created_by
  )
  values (
    log_row.student_id,
    'growth_log',
    log_row.id,
    reward_rule.tier_key,
    reward_rule.xp_reward,
    reward_rule.point_reward,
    coalesce(nullif(log_row.module_title, ''), log_row.homework_id) || ' · ' || round(log_row.score)::text || '%',
    log_row.student_id
  )
  on conflict (student_id, source_type, source_id) where source_id is not null do nothing
  returning * into inserted_event;

  if inserted_event.id is null then
    return jsonb_build_object('awarded', false, 'reason', 'already_awarded');
  end if;

  update public.student_pets
  set experience_points = experience_points + reward_rule.xp_reward,
      pet_points = pet_points + reward_rule.point_reward
  where student_id = log_row.student_id
  returning * into next_pet;

  return jsonb_build_object('awarded', true, 'event', to_jsonb(inserted_event), 'pet', to_jsonb(next_pet));
end;
$$;

create or replace function public.sync_pet_rewards_for_student(p_student_id text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  row_record record;
  before_count integer;
  after_count integer;
begin
  select count(*) into before_count
  from public.pet_reward_events
  where student_id = p_student_id and source_type = 'growth_log';

  for row_record in
    select id from public.growth_logs
    where student_id = p_student_id
    order by created_at asc
  loop
    perform public.award_pet_for_growth_log(row_record.id);
  end loop;

  select count(*) into after_count
  from public.pet_reward_events
  where student_id = p_student_id and source_type = 'growth_log';

  return greatest(after_count - before_count, 0);
end;
$$;

create or replace function public.handle_growth_log_pet_reward()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.award_pet_for_growth_log(new.id);
  return new;
end;
$$;

drop trigger if exists trg_growth_log_pet_reward on public.growth_logs;
create trigger trg_growth_log_pet_reward
after insert on public.growth_logs
for each row execute function public.handle_growth_log_pet_reward();

create or replace function public.pet_type_unlock_count(p_student_id text)
returns integer
language sql
stable
set search_path = public
as $$
  select count(distinct pet_type)::integer
  from (
    select pet_type from public.pet_type_unlocks where student_id = trim(p_student_id)
    union
    select pet_type from public.student_pets where student_id = trim(p_student_id)
  ) owned;
$$;

create or replace function public.is_pet_type_unlocked(
  p_student_id text,
  p_pet_type text
)
returns boolean
language plpgsql
stable
set search_path = public
as $$
declare
  clean_student text := trim(p_student_id);
  clean_type text := trim(p_pet_type);
  type_rule public.pet_type_rules;
  current_pet public.student_pets;
begin
  select * into type_rule
  from public.pet_type_rules
  where pet_type = clean_type and active = true;

  if type_rule.pet_type is null then
    return false;
  end if;

  if type_rule.is_hidden = false then
    return true;
  end if;

  if exists (
    select 1 from public.pet_type_unlocks
    where student_id = clean_student and pet_type = clean_type
  ) then
    return true;
  end if;

  select * into current_pet
  from public.student_pets
  where student_id = clean_student;

  if current_pet.pet_type = clean_type then
    return true;
  end if;

  if type_rule.unlock_points > 0 and coalesce(current_pet.pet_points, 0) >= type_rule.unlock_points then
    return true;
  end if;

  if type_rule.unlock_pet_count > 0 and public.pet_type_unlock_count(clean_student) >= type_rule.unlock_pet_count then
    return true;
  end if;

  return false;
end;
$$;

create or replace function public.initialize_student_pet(
  p_student_id text,
  p_pet_type text,
  p_pet_name text
)
returns public.student_pets
language plpgsql
security definer
set search_path = public
as $$
declare
  clean_name text := nullif(trim(p_pet_name), '');
  next_pet public.student_pets;
begin
  if p_pet_type not in ('fox', 'owl', 'deer', 'whale', 'otter', 'dragon') then
    raise exception 'Unsupported pet type.';
  end if;
  if not public.is_pet_type_unlocked(trim(p_student_id), p_pet_type) then
    raise exception 'Pet type locked.';
  end if;
  if clean_name is null or length(clean_name) > 24 then
    raise exception 'Pet name must be 1-24 characters.';
  end if;

  insert into public.student_pets (student_id, pet_type, pet_name)
  values (trim(p_student_id), p_pet_type, clean_name)
  on conflict (student_id) do update
  set pet_name = excluded.pet_name
  returning * into next_pet;

  insert into public.pet_type_unlocks (student_id, pet_type, source, reason, created_by)
  values (trim(p_student_id), p_pet_type, 'create', '创建宠物', trim(p_student_id))
  on conflict do nothing;

  perform public.sync_pet_rewards_for_student(next_pet.student_id);
  select * into next_pet from public.student_pets where student_id = trim(p_student_id);
  return next_pet;
end;
$$;

create or replace function public.equip_pet_item(
  p_student_id text,
  p_item_key text default null
)
returns public.student_pets
language plpgsql
security definer
set search_path = public
as $$
declare
  clean_item text := nullif(trim(coalesce(p_item_key, '')), '');
  next_pet public.student_pets;
begin
  if clean_item is not null and not exists (
    select 1 from public.pet_inventory
    where student_id = trim(p_student_id) and item_key = clean_item
  ) then
    raise exception 'Item is not owned.';
  end if;

  update public.student_pets
  set equipped_item = clean_item
  where student_id = trim(p_student_id)
  returning * into next_pet;

  if next_pet.student_id is null then
    raise exception 'Pet not found.';
  end if;

  return next_pet;
end;
$$;

create or replace function public.set_pet_environment(
  p_student_id text,
  p_environment_key text
)
returns public.student_pets
language plpgsql
security definer
set search_path = public
as $$
declare
  clean_environment text := trim(p_environment_key);
  next_pet public.student_pets;
begin
  if clean_environment not in ('warm-sun', 'forest', 'starry', 'ocean') then
    raise exception 'Unsupported pet environment.';
  end if;

  update public.student_pets
  set environment_key = clean_environment
  where student_id = trim(p_student_id)
  returning * into next_pet;

  if next_pet.student_id is null then
    raise exception 'Pet not found.';
  end if;

  return next_pet;
end;
$$;

create or replace function public.set_student_pet_type(
  p_student_id text,
  p_pet_type text
)
returns public.student_pets
language plpgsql
security definer
set search_path = public
as $$
declare
  clean_student text := trim(p_student_id);
  clean_type text := trim(p_pet_type);
  type_rule public.pet_type_rules;
  switch_cost integer := 0;
  next_pet public.student_pets;
begin
  if clean_type not in ('fox', 'owl', 'deer', 'whale', 'otter', 'dragon') then
    raise exception 'Unsupported pet type.';
  end if;

  select * into type_rule
  from public.pet_type_rules
  where pet_type = clean_type and active = true;

  if type_rule.pet_type is null then
    raise exception 'Pet type is not available.';
  end if;

  if not public.is_pet_type_unlocked(clean_student, clean_type) then
    raise exception 'Pet type locked.';
  end if;

  select * into next_pet
  from public.student_pets
  where student_id = clean_student
  for update;

  if next_pet.student_id is null then
    raise exception 'Pet not found.';
  end if;

  if next_pet.pet_type = clean_type then
    return next_pet;
  end if;

  switch_cost := greatest(0, coalesce(type_rule.switch_price, 0));

  if next_pet.pet_points < switch_cost then
    raise exception 'Not enough pet points.';
  end if;

  update public.student_pets
  set pet_type = clean_type,
      equipped_item = null,
      pet_points = pet_points - switch_cost
  where student_id = clean_student
  returning * into next_pet;

  insert into public.pet_type_unlocks (student_id, pet_type, source, reason, created_by)
  values (clean_student, clean_type, 'auto', '切换宠物', clean_student)
  on conflict do nothing;

  if switch_cost > 0 then
    insert into public.pet_reward_events (
      student_id, source_type, tier_key, xp_delta, point_delta, reason, created_by
    )
    values (
      clean_student,
      'pet_switch',
      clean_type,
      0,
      -switch_cost,
      '更换宠物为' || type_rule.label_zh,
      clean_student
    );
  end if;

  return next_pet;
end;
$$;

create or replace function public.admin_unlock_pet_type(
  p_target_student_id text,
  p_pet_type text,
  p_reason text default '教师手动发放'
)
returns public.pet_type_unlocks
language plpgsql
security definer
set search_path = public
as $$
declare
  clean_student text := trim(p_target_student_id);
  clean_type text := trim(p_pet_type);
  next_unlock public.pet_type_unlocks;
begin
  if clean_type not in ('fox', 'owl', 'deer', 'whale', 'otter', 'dragon') then
    raise exception 'Unsupported pet type.';
  end if;

  insert into public.pet_type_unlocks (student_id, pet_type, source, reason, created_by)
  values (clean_student, clean_type, 'manual', nullif(trim(p_reason), ''), 'teacher')
  on conflict (student_id, pet_type) do update
  set source = excluded.source,
      reason = excluded.reason,
      created_by = excluded.created_by
  returning * into next_unlock;

  return next_unlock;
end;
$$;

create or replace function public.purchase_pet_item(
  p_student_id text,
  p_item_key text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  clean_student text := trim(p_student_id);
  clean_item text := trim(p_item_key);
  item_rule public.pet_item_rules;
  next_pet public.student_pets;
begin
  select * into item_rule
  from public.pet_item_rules
  where item_key = clean_item and active = true;

  if item_rule.item_key is null then
    raise exception 'Item is not available.';
  end if;

  select * into next_pet
  from public.student_pets
  where student_id = clean_student
  for update;

  if next_pet.student_id is null then
    raise exception 'Pet not found.';
  end if;

  if exists (select 1 from public.pet_inventory where student_id = clean_student and item_key = clean_item) then
    update public.student_pets
    set equipped_item = clean_item
    where student_id = clean_student
    returning * into next_pet;
    return jsonb_build_object('pet', to_jsonb(next_pet), 'alreadyOwned', true);
  end if;

  if next_pet.pet_points < item_rule.price then
    raise exception 'Not enough pet points.';
  end if;

  update public.student_pets
  set pet_points = pet_points - item_rule.price,
      equipped_item = clean_item
  where student_id = clean_student
  returning * into next_pet;

  insert into public.pet_inventory (student_id, item_key)
  values (clean_student, clean_item)
  on conflict do nothing;

  insert into public.pet_reward_events (
    student_id, source_type, tier_key, xp_delta, point_delta, reason, created_by
  )
  values (
    clean_student,
    'purchase',
    clean_item,
    0,
    -item_rule.price,
    '购买' || item_rule.label,
    clean_student
  );

  return jsonb_build_object('pet', to_jsonb(next_pet), 'alreadyOwned', false);
end;
$$;

create or replace function public.admin_adjust_pet(
  p_target_student_id text,
  p_xp_delta integer,
  p_point_delta integer,
  p_reason text default '教师补偿'
)
returns public.student_pets
language plpgsql
security definer
set search_path = public
as $$
declare
  next_pet public.student_pets;
begin
  update public.student_pets
  set experience_points = greatest(0, experience_points + coalesce(p_xp_delta, 0)),
      pet_points = greatest(0, pet_points + coalesce(p_point_delta, 0))
  where student_id = trim(p_target_student_id)
  returning * into next_pet;

  if next_pet.student_id is null then
    raise exception 'Pet not found.';
  end if;

  insert into public.pet_reward_events (
    student_id, source_type, xp_delta, point_delta, reason, created_by
  )
  values (
    trim(p_target_student_id),
    'manual',
    coalesce(p_xp_delta, 0),
    coalesce(p_point_delta, 0),
    nullif(trim(p_reason), ''),
    'teacher'
  );

  return next_pet;
end;
$$;

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.student_pets to anon, authenticated;
grant select, insert, update, delete on public.pet_inventory to anon, authenticated;
grant select, insert, update, delete on public.pet_item_rules to anon, authenticated;
grant select, insert, update, delete on public.pet_level_rules to anon, authenticated;
grant select, insert, update, delete on public.pet_reward_rules to anon, authenticated;
grant select, insert, update, delete on public.pet_type_rules to anon, authenticated;
grant select, insert, update, delete on public.pet_type_unlocks to anon, authenticated;
grant select, insert, update, delete on public.pet_reward_events to anon, authenticated;
grant execute on function public.pet_type_unlock_count(text) to anon, authenticated;
grant execute on function public.is_pet_type_unlocked(text, text) to anon, authenticated;
grant execute on function public.award_pet_for_growth_log(uuid) to anon, authenticated;
grant execute on function public.sync_pet_rewards_for_student(text) to anon, authenticated;
grant execute on function public.initialize_student_pet(text, text, text) to anon, authenticated;
grant execute on function public.equip_pet_item(text, text) to anon, authenticated;
grant execute on function public.set_pet_environment(text, text) to anon, authenticated;
grant execute on function public.set_student_pet_type(text, text) to anon, authenticated;
grant execute on function public.purchase_pet_item(text, text) to anon, authenticated;
grant execute on function public.admin_adjust_pet(text, integer, integer, text) to anon, authenticated;
grant execute on function public.admin_unlock_pet_type(text, text, text) to anon, authenticated;

notify pgrst, 'reload schema';
