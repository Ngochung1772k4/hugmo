-- TOPIK II Reading Q20 (main idea) and Q21 (idiom in context).
-- Source content is book-derived and immutable to normal clients.
create extension if not exists pgcrypto;

create table if not exists public.topik_reading_idiom_groups (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name_ko text not null,
  name_vi text not null,
  sort_order integer not null unique
);

create table if not exists public.topik_reading_idioms (
  id uuid primary key default gen_random_uuid(),
  expression_ko text not null unique,
  meaning_vi_source text,
  memory_group_code text not null references public.topik_reading_idiom_groups(code),
  body_part text,
  core_verb text,
  core_verb_vi_editorial text,
  priority text not null check (priority in ('S', 'A', 'B')),
  source_type text not null default 'SOURCE_BOOK' check (source_type in ('SOURCE_BOOK', 'MANUAL', 'AI_GENERATED')),
  review_status text not null default 'VERIFIED' check (review_status in ('VERIFIED', 'NEEDS_GLOSS', 'NEEDS_REVIEW')),
  review_note text,
  status text not null default 'PUBLISHED' check (status in ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
  created_at timestamptz not null default now()
);

create table if not exists public.topik_reading_idiom_aliases (
  id uuid primary key default gen_random_uuid(),
  idiom_id uuid not null references public.topik_reading_idioms(id) on delete cascade,
  alias_ko text not null,
  unique (idiom_id, alias_ko)
);

create table if not exists public.topik_reading_source_locations (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in ('IDIOM')),
  entity_id uuid not null,
  source_page integer not null check (source_page > 0),
  source_kind text not null,
  unique (entity_type, entity_id, source_page, source_kind)
);

create table if not exists public.topik_reading_20_21_exercises (
  id uuid primary key default gen_random_uuid(),
  source_key text not null unique,
  source_id uuid references public.topik_sources(id),
  question_pair text not null check (question_pair in ('19_20', '21_22')),
  set_type text not null check (set_type in ('SAMPLE', 'PRACTICE')),
  source_page integer not null check (source_page > 0),
  passage_ko text not null,
  status text not null default 'PUBLISHED' check (status in ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
  source_type text not null default 'SOURCE_BOOK' check (source_type in ('SOURCE_BOOK', 'MANUAL', 'AI_GENERATED'))
);

create table if not exists public.topik_reading_mc_questions (
  id uuid primary key default gen_random_uuid(),
  exercise_id uuid not null references public.topik_reading_20_21_exercises(id) on delete cascade,
  question_no smallint not null check (question_no in (19, 20, 21, 22)),
  skill_code text not null check (skill_code in ('CONNECTIVE_IN_CONTEXT', 'TOPIC_MAIN_IDEA', 'IDIOM_IN_CONTEXT', 'CONTENT_MATCH')),
  prompt_ko text,
  options jsonb not null check (jsonb_typeof(options) = 'array' and jsonb_array_length(options) = 4),
  answer_index smallint not null check (answer_index between 1 and 4),
  correct_idiom_id uuid references public.topik_reading_idioms(id) on delete set null,
  option_idiom_ids uuid[] not null default '{}',
  unique (exercise_id, question_no)
);

create table if not exists public.topik_reading_20_21_attempts (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id uuid not null references public.topik_reading_mc_questions(id) on delete cascade,
  selected_index smallint not null check (selected_index between 1 and 4),
  is_correct boolean not null,
  mode text not null check (mode in ('GUIDED', 'PRACTICE', 'RETRY')),
  answered_at timestamptz not null default now()
);

create index if not exists idx_topik_reading_20_21_attempts_user_question
  on public.topik_reading_20_21_attempts(user_id, question_id, answered_at desc);

create table if not exists public.topik_reading_idiom_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  idiom_id uuid not null references public.topik_reading_idioms(id) on delete cascade,
  seen_count integer not null default 0 check (seen_count >= 0),
  correct_count integer not null default 0 check (correct_count >= 0),
  wrong_count integer not null default 0 check (wrong_count >= 0),
  last_seen_at timestamptz,
  status text not null default 'NEW' check (status in ('NEW', 'LEARNING', 'REVIEW', 'MASTERED')),
  primary key (user_id, idiom_id)
);

alter table public.topik_reading_idiom_groups enable row level security;
alter table public.topik_reading_idioms enable row level security;
alter table public.topik_reading_idiom_aliases enable row level security;
alter table public.topik_reading_source_locations enable row level security;
alter table public.topik_reading_20_21_exercises enable row level security;
alter table public.topik_reading_mc_questions enable row level security;
alter table public.topik_reading_20_21_attempts enable row level security;
alter table public.topik_reading_idiom_progress enable row level security;

drop policy if exists "read idiom groups" on public.topik_reading_idiom_groups;
create policy "read idiom groups" on public.topik_reading_idiom_groups for select to authenticated using (true);
drop policy if exists "read public idioms" on public.topik_reading_idioms;
create policy "read public idioms" on public.topik_reading_idioms for select to authenticated
  using (status = 'PUBLISHED' and review_status <> 'NEEDS_REVIEW');
drop policy if exists "read public idiom aliases" on public.topik_reading_idiom_aliases;
create policy "read public idiom aliases" on public.topik_reading_idiom_aliases for select to authenticated
  using (exists (select 1 from public.topik_reading_idioms i where i.id = idiom_id and i.status = 'PUBLISHED' and i.review_status <> 'NEEDS_REVIEW'));
drop policy if exists "read idiom source locations" on public.topik_reading_source_locations;
create policy "read idiom source locations" on public.topik_reading_source_locations for select to authenticated using (true);
drop policy if exists "read published reading 20 21 exercises" on public.topik_reading_20_21_exercises;
create policy "read published reading 20 21 exercises" on public.topik_reading_20_21_exercises for select to authenticated using (status = 'PUBLISHED');
drop policy if exists "read questions for published reading 20 21 exercises" on public.topik_reading_mc_questions;
create policy "read questions for published reading 20 21 exercises" on public.topik_reading_mc_questions for select to authenticated
  using (exists (select 1 from public.topik_reading_20_21_exercises e where e.id = exercise_id and e.status = 'PUBLISHED'));
drop policy if exists "read own reading 20 21 attempts" on public.topik_reading_20_21_attempts;
create policy "read own reading 20 21 attempts" on public.topik_reading_20_21_attempts for select to authenticated using (auth.uid() = user_id);
drop policy if exists "read own idiom progress" on public.topik_reading_idiom_progress;
create policy "read own idiom progress" on public.topik_reading_idiom_progress for select to authenticated using (auth.uid() = user_id);

revoke insert, update, delete on public.topik_reading_idiom_groups from anon, authenticated;
revoke insert, update, delete on public.topik_reading_idioms from anon, authenticated;
revoke insert, update, delete on public.topik_reading_idiom_aliases from anon, authenticated;
revoke insert, update, delete on public.topik_reading_source_locations from anon, authenticated;
revoke insert, update, delete on public.topik_reading_20_21_exercises from anon, authenticated;
revoke insert, update, delete on public.topik_reading_mc_questions from anon, authenticated;
revoke insert, update, delete on public.topik_reading_20_21_attempts from anon, authenticated;
revoke insert, update, delete on public.topik_reading_idiom_progress from anon, authenticated;

create or replace function public.topik_reading_20_21_update_idiom_progress(
  p_user_id uuid,
  p_idiom_id uuid,
  p_correct boolean
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  next_correct integer;
  next_wrong integer;
  next_status text;
begin
  if p_idiom_id is null then return; end if;

  insert into public.topik_reading_idiom_progress(user_id, idiom_id, seen_count, correct_count, wrong_count, last_seen_at, status)
  values (p_user_id, p_idiom_id, 1, case when p_correct then 1 else 0 end, case when p_correct then 0 else 1 end, now(), 'LEARNING')
  on conflict (user_id, idiom_id) do update set
    seen_count = public.topik_reading_idiom_progress.seen_count + 1,
    correct_count = public.topik_reading_idiom_progress.correct_count + case when p_correct then 1 else 0 end,
    wrong_count = public.topik_reading_idiom_progress.wrong_count + case when p_correct then 0 else 1 end,
    last_seen_at = now()
  returning correct_count, wrong_count into next_correct, next_wrong;

  if not p_correct then
    next_status := 'LEARNING';
  elsif next_correct >= 4 and next_correct::numeric / greatest(next_correct + next_wrong, 1) >= 0.8 then
    next_status := 'MASTERED';
  elsif next_correct >= 2 then
    next_status := 'REVIEW';
  else
    next_status := 'LEARNING';
  end if;

  update public.topik_reading_idiom_progress
  set status = next_status
  where user_id = p_user_id and idiom_id = p_idiom_id;
end;
$$;

create or replace function public.topik_reading_record_20_21_attempt(
  p_attempt_id uuid,
  p_question_id uuid,
  p_selected_index smallint,
  p_mode text default 'PRACTICE'
)
returns public.topik_reading_20_21_attempts
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  question_row public.topik_reading_mc_questions;
  saved_attempt public.topik_reading_20_21_attempts;
  selected_idiom uuid;
begin
  if current_user_id is null then raise exception 'Authentication is required' using errcode = '42501'; end if;
  if p_attempt_id is null then raise exception 'Attempt id is required' using errcode = '22023'; end if;
  if p_selected_index not between 1 and 4 then raise exception 'Selected index must be between 1 and 4' using errcode = '22023'; end if;
  if p_mode not in ('GUIDED', 'PRACTICE', 'RETRY') then raise exception 'Invalid practice mode' using errcode = '22023'; end if;

  select * into saved_attempt from public.topik_reading_20_21_attempts where id = p_attempt_id and user_id = current_user_id;
  if found then return saved_attempt; end if;

  select q.* into question_row
  from public.topik_reading_mc_questions q
  join public.topik_reading_20_21_exercises e on e.id = q.exercise_id
  where q.id = p_question_id and e.status = 'PUBLISHED';
  if not found then raise exception 'Question is unavailable' using errcode = '22023'; end if;

  insert into public.topik_reading_20_21_attempts(id, user_id, question_id, selected_index, is_correct, mode)
  values (p_attempt_id, current_user_id, p_question_id, p_selected_index, p_selected_index = question_row.answer_index, p_mode)
  on conflict (id) do nothing
  returning * into saved_attempt;
  if not found then
    select * into saved_attempt from public.topik_reading_20_21_attempts where id = p_attempt_id and user_id = current_user_id;
    return saved_attempt;
  end if;

  if question_row.question_no = 21 then
    selected_idiom := question_row.option_idiom_ids[p_selected_index];
    perform public.topik_reading_20_21_update_idiom_progress(current_user_id, question_row.correct_idiom_id, p_selected_index = question_row.answer_index);
    if selected_idiom is not null and selected_idiom <> question_row.correct_idiom_id then
      perform public.topik_reading_20_21_update_idiom_progress(current_user_id, selected_idiom, false);
    end if;
  end if;
  return saved_attempt;
end;
$$;

revoke all on function public.topik_reading_20_21_update_idiom_progress(uuid, uuid, boolean) from public;
revoke all on function public.topik_reading_record_20_21_attempt(uuid, uuid, smallint, text) from public;
grant execute on function public.topik_reading_record_20_21_attempt(uuid, uuid, smallint, text) to authenticated;
