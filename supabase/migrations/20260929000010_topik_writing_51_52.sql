-- TOPIK II Writing 51-52 source-book catalog and deterministic learner attempts.

create table if not exists public.topik_writing_51_intents (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name_vi text not null,
  name_ko text,
  description_vi text,
  sort_order integer not null,
  source_type text not null default 'SOURCE_BOOK' check (source_type in ('SOURCE_BOOK', 'MANUAL', 'AI_GENERATED')),
  source_pages integer[] not null default '{}' check (cardinality(source_pages) > 0),
  status text not null default 'PUBLISHED' check (status in ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
  created_at timestamptz not null default now()
);

create table if not exists public.topik_writing_51_patterns (
  id uuid primary key default gen_random_uuid(),
  intent_id uuid not null references public.topik_writing_51_intents(id) on delete cascade,
  pattern_ko text not null check (char_length(trim(pattern_ko)) > 0),
  pattern_kind text not null check (pattern_kind in ('PREFERRED', 'ALTERNATIVE', 'PAIRED')),
  sort_order integer not null default 0,
  source_type text not null default 'SOURCE_BOOK' check (source_type in ('SOURCE_BOOK', 'MANUAL', 'AI_GENERATED')),
  source_pages integer[] not null default '{}' check (cardinality(source_pages) > 0),
  status text not null default 'PUBLISHED' check (status in ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
  unique(intent_id, pattern_ko, pattern_kind)
);

create table if not exists public.topik_writing_51_exercises (
  id uuid primary key default gen_random_uuid(),
  source_key text not null unique,
  source_id uuid references public.topik_sources(id) on delete restrict,
  exercise_group text not null check (exercise_group in ('SECTION_PRACTICE', 'MIXED_PRACTICE')),
  intent_code text references public.topik_writing_51_intents(code) on update cascade,
  title_ko text,
  body_ko text not null check (char_length(trim(body_ko)) > 0),
  blank_count integer not null check (blank_count > 0),
  source_pages integer[] not null check (cardinality(source_pages) > 0),
  answer_source_pages integer[] not null default '{}' check (cardinality(answer_source_pages) > 0),
  source_type text not null default 'SOURCE_BOOK' check (source_type in ('SOURCE_BOOK', 'MANUAL', 'AI_GENERATED')),
  status text not null default 'PUBLISHED' check (status in ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
  review_status text not null default 'VERIFIED' check (review_status in ('VERIFIED', 'NEEDS_REVIEW')),
  created_at timestamptz not null default now()
);

create table if not exists public.topik_writing_51_blanks (
  id uuid primary key default gen_random_uuid(),
  exercise_id uuid not null references public.topik_writing_51_exercises(id) on delete cascade,
  blank_key text not null check (char_length(trim(blank_key)) > 0),
  blank_order integer not null check (blank_order >= 0),
  source_answer_variants jsonb not null default '[]'::jsonb check (jsonb_typeof(source_answer_variants) = 'array' and jsonb_array_length(source_answer_variants) > 0),
  review_note text,
  unique(exercise_id, blank_key),
  unique(exercise_id, blank_order)
);

create table if not exists public.topik_writing_52_relations (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name_vi text not null,
  name_ko text,
  sort_order integer not null,
  source_type text not null default 'SOURCE_BOOK' check (source_type in ('SOURCE_BOOK', 'MANUAL', 'AI_GENERATED')),
  source_pages integer[] not null default '{}' check (cardinality(source_pages) > 0),
  status text not null default 'PUBLISHED' check (status in ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
  created_at timestamptz not null default now()
);

create table if not exists public.topik_writing_52_patterns (
  id uuid primary key default gen_random_uuid(),
  relation_id uuid not null references public.topik_writing_52_relations(id) on delete cascade,
  pattern_ko text not null check (char_length(trim(pattern_ko)) > 0),
  sort_order integer not null default 0,
  source_type text not null default 'SOURCE_BOOK' check (source_type in ('SOURCE_BOOK', 'MANUAL', 'AI_GENERATED')),
  source_pages integer[] not null default '{}' check (cardinality(source_pages) > 0),
  status text not null default 'PUBLISHED' check (status in ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
  unique(relation_id, pattern_ko)
);

create table if not exists public.topik_writing_52_exercises (
  id uuid primary key default gen_random_uuid(),
  source_key text not null unique,
  source_id uuid references public.topik_sources(id) on delete restrict,
  title_ko text,
  body_ko text not null check (char_length(trim(body_ko)) > 0),
  blank_count integer not null check (blank_count > 0),
  source_pages integer[] not null check (cardinality(source_pages) > 0),
  answer_source_pages integer[] not null default '{}' check (cardinality(answer_source_pages) > 0),
  source_type text not null default 'SOURCE_BOOK' check (source_type in ('SOURCE_BOOK', 'MANUAL', 'AI_GENERATED')),
  status text not null default 'PUBLISHED' check (status in ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
  review_status text not null default 'VERIFIED' check (review_status in ('VERIFIED', 'NEEDS_REVIEW')),
  created_at timestamptz not null default now()
);

create table if not exists public.topik_writing_52_blanks (
  id uuid primary key default gen_random_uuid(),
  exercise_id uuid not null references public.topik_writing_52_exercises(id) on delete cascade,
  blank_key text not null check (char_length(trim(blank_key)) > 0),
  blank_order integer not null check (blank_order >= 0),
  source_answer_variants jsonb not null default '[]'::jsonb check (jsonb_typeof(source_answer_variants) = 'array' and jsonb_array_length(source_answer_variants) > 0),
  relation_code text references public.topik_writing_52_relations(code) on update cascade,
  relation_tag_origin text check (relation_tag_origin is null or relation_tag_origin in ('SOURCE_EXPLICIT', 'DERIVED')),
  review_note text,
  unique(exercise_id, blank_key),
  unique(exercise_id, blank_order)
);

create table if not exists public.topik_writing_blank_attempts (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  question_no integer not null check (question_no in (51, 52)),
  exercise_id uuid not null,
  answers jsonb not null check (jsonb_typeof(answers) = 'object'),
  result_json jsonb not null default '{}'::jsonb check (jsonb_typeof(result_json) = 'object'),
  score integer not null default 0 check (score >= 0),
  mode text not null default 'GUIDED' check (mode in ('GUIDED', 'MIXED', 'WRONG_ONLY')),
  created_at timestamptz not null default now()
);

create index if not exists idx_topik_writing_51_exercises_public on public.topik_writing_51_exercises(exercise_group, review_status, status);
create index if not exists idx_topik_writing_52_exercises_public on public.topik_writing_52_exercises(review_status, status);
create index if not exists idx_topik_writing_blank_attempts_owner on public.topik_writing_blank_attempts(user_id, question_no, created_at desc);

alter table public.topik_writing_51_intents enable row level security;
alter table public.topik_writing_51_patterns enable row level security;
alter table public.topik_writing_51_exercises enable row level security;
alter table public.topik_writing_51_blanks enable row level security;
alter table public.topik_writing_52_relations enable row level security;
alter table public.topik_writing_52_patterns enable row level security;
alter table public.topik_writing_52_exercises enable row level security;
alter table public.topik_writing_52_blanks enable row level security;
alter table public.topik_writing_blank_attempts enable row level security;

create policy "read published writing 51 intents" on public.topik_writing_51_intents for select to authenticated using (status = 'PUBLISHED');
create policy "read published writing 51 patterns" on public.topik_writing_51_patterns for select to authenticated using (status = 'PUBLISHED' and exists (select 1 from public.topik_writing_51_intents i where i.id = intent_id and i.status = 'PUBLISHED'));
create policy "read verified writing 51 exercises" on public.topik_writing_51_exercises for select to authenticated using (status = 'PUBLISHED' and review_status = 'VERIFIED');
create policy "read verified writing 51 blanks" on public.topik_writing_51_blanks for select to authenticated using (exists (select 1 from public.topik_writing_51_exercises e where e.id = exercise_id and e.status = 'PUBLISHED' and e.review_status = 'VERIFIED'));
create policy "read published writing 52 relations" on public.topik_writing_52_relations for select to authenticated using (status = 'PUBLISHED');
create policy "read published writing 52 patterns" on public.topik_writing_52_patterns for select to authenticated using (status = 'PUBLISHED' and exists (select 1 from public.topik_writing_52_relations r where r.id = relation_id and r.status = 'PUBLISHED'));
create policy "read verified writing 52 exercises" on public.topik_writing_52_exercises for select to authenticated using (status = 'PUBLISHED' and review_status = 'VERIFIED');
create policy "read verified writing 52 blanks" on public.topik_writing_52_blanks for select to authenticated using (exists (select 1 from public.topik_writing_52_exercises e where e.id = exercise_id and e.status = 'PUBLISHED' and e.review_status = 'VERIFIED'));
create policy "read own writing blank attempts" on public.topik_writing_blank_attempts for select to authenticated using (user_id = auth.uid());

revoke insert, update, delete on public.topik_writing_51_intents, public.topik_writing_51_patterns, public.topik_writing_51_exercises, public.topik_writing_51_blanks, public.topik_writing_52_relations, public.topik_writing_52_patterns, public.topik_writing_52_exercises, public.topik_writing_52_blanks, public.topik_writing_blank_attempts from anon, authenticated;

create or replace function public.topik_writing_normalize_source_answer(p_value text)
returns text
language sql
immutable
as $$
  select regexp_replace(
    regexp_replace(trim(coalesce(p_value, '')), '[[:space:]]+', ' ', 'g'),
    '[.!?…]+$',
    ''
  )
$$;

create or replace function public.topik_writing_record_attempt(
  p_attempt_id uuid,
  p_question_no integer,
  p_exercise_id uuid,
  p_answers jsonb,
  p_mode text default 'GUIDED'
)
returns public.topik_writing_blank_attempts
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  existing public.topik_writing_blank_attempts;
  blank_row record;
  answer_value text;
  matched_variant text;
  result_blanks jsonb := '[]'::jsonb;
  score_value integer := 0;
  exercise_exists boolean := false;
begin
  if uid is null then raise exception 'Authentication is required' using errcode = '42501'; end if;
  if p_attempt_id is null or p_exercise_id is null then raise exception 'Attempt and exercise are required' using errcode = '22023'; end if;
  if p_question_no not in (51, 52) then raise exception 'Invalid question number' using errcode = '22023'; end if;
  if p_mode not in ('GUIDED', 'MIXED', 'WRONG_ONLY') then raise exception 'Invalid writing practice mode' using errcode = '22023'; end if;
  if jsonb_typeof(coalesce(p_answers, '{}'::jsonb)) <> 'object' then raise exception 'Answers must be an object' using errcode = '22023'; end if;

  select * into existing from public.topik_writing_blank_attempts where id = p_attempt_id and user_id = uid;
  if found then return existing; end if;

  if p_question_no = 51 then
    select exists(select 1 from public.topik_writing_51_exercises e where e.id = p_exercise_id and e.status = 'PUBLISHED' and e.review_status = 'VERIFIED') into exercise_exists;
    for blank_row in select blank_key, source_answer_variants from public.topik_writing_51_blanks where exercise_id = p_exercise_id order by blank_order loop
      answer_value := p_answers ->> blank_row.blank_key;
      select variant into matched_variant from jsonb_array_elements_text(blank_row.source_answer_variants) variant where public.topik_writing_normalize_source_answer(variant) = public.topik_writing_normalize_source_answer(answer_value) limit 1;
      if coalesce(trim(answer_value), '') = '' then
        result_blanks := result_blanks || jsonb_build_array(jsonb_build_object('key', blank_row.blank_key, 'status', 'EMPTY', 'matched_variant', null));
      elsif matched_variant is not null then
        score_value := score_value + 1;
        result_blanks := result_blanks || jsonb_build_array(jsonb_build_object('key', blank_row.blank_key, 'status', 'SOURCE_MATCH', 'matched_variant', matched_variant));
      else
        result_blanks := result_blanks || jsonb_build_array(jsonb_build_object('key', blank_row.blank_key, 'status', 'NOT_SOURCE_MATCH', 'matched_variant', null));
      end if;
    end loop;
  else
    select exists(select 1 from public.topik_writing_52_exercises e where e.id = p_exercise_id and e.status = 'PUBLISHED' and e.review_status = 'VERIFIED') into exercise_exists;
    for blank_row in select blank_key, source_answer_variants from public.topik_writing_52_blanks where exercise_id = p_exercise_id order by blank_order loop
      answer_value := p_answers ->> blank_row.blank_key;
      select variant into matched_variant from jsonb_array_elements_text(blank_row.source_answer_variants) variant where public.topik_writing_normalize_source_answer(variant) = public.topik_writing_normalize_source_answer(answer_value) limit 1;
      if coalesce(trim(answer_value), '') = '' then
        result_blanks := result_blanks || jsonb_build_array(jsonb_build_object('key', blank_row.blank_key, 'status', 'EMPTY', 'matched_variant', null));
      elsif matched_variant is not null then
        score_value := score_value + 1;
        result_blanks := result_blanks || jsonb_build_array(jsonb_build_object('key', blank_row.blank_key, 'status', 'SOURCE_MATCH', 'matched_variant', matched_variant));
      else
        result_blanks := result_blanks || jsonb_build_array(jsonb_build_object('key', blank_row.blank_key, 'status', 'NOT_SOURCE_MATCH', 'matched_variant', null));
      end if;
    end loop;
  end if;

  if not exercise_exists then raise exception 'Exercise is not available' using errcode = '22023'; end if;
  insert into public.topik_writing_blank_attempts(id, user_id, question_no, exercise_id, answers, result_json, score, mode)
  values (p_attempt_id, uid, p_question_no, p_exercise_id, p_answers, jsonb_build_object('blanks', result_blanks), score_value, p_mode)
  returning * into existing;
  return existing;
end;
$$;

revoke all on function public.topik_writing_normalize_source_answer(text) from public;
revoke all on function public.topik_writing_record_attempt(uuid, integer, uuid, jsonb, text) from public;
grant execute on function public.topik_writing_record_attempt(uuid, integer, uuid, jsonb, text) to authenticated;
