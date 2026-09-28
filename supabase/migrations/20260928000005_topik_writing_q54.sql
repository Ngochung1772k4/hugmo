-- TOPIK II Writing Q54 MVP. Content is seeded separately in seed/topik_writing_q54_environment_seed.sql.

create table if not exists public.q54_topics (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_ko text not null,
  name_vi text not null,
  description_vi text,
  status text not null default 'DRAFT' check (status in ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
  source_type text not null default 'MANUAL' check (source_type in ('MANUAL', 'AI_GENERATED', 'OFFICIAL')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.q54_questions (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid references public.q54_topics(id) on delete set null,
  created_by uuid references auth.users(id) on delete cascade,
  prompt_ko text not null check (char_length(trim(prompt_ko)) between 1 and 4000),
  visibility text not null default 'PUBLIC' check (visibility in ('PUBLIC', 'PRIVATE')),
  status text not null default 'DRAFT' check (status in ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
  source_type text not null default 'MANUAL' check (source_type in ('MANUAL', 'AI_GENERATED', 'OFFICIAL')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.q54_question_requirements (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.q54_questions(id) on delete cascade,
  order_index integer not null check (order_index >= 0),
  prompt_ko text not null check (char_length(trim(prompt_ko)) between 1 and 1000),
  label_vi text not null,
  requirement_type text not null check (requirement_type in ('장점', '필요성', '중요성', '긍정적인 영향', '문제점', '부정적인 영향', '부작용', '어려운 이유', '원인', '배경', '노력', '해결 방안', '방법', '바람직한 태도', '역할', '특징', '고려 사항', '기타')),
  function_group text not null check (function_group in ('POSITIVE', 'NEGATIVE', 'CAUSE', 'SOLUTION', 'SPECIAL')),
  status text not null default 'DRAFT' check (status in ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
  source_type text not null default 'MANUAL' check (source_type in ('MANUAL', 'AI_GENERATED', 'OFFICIAL')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (question_id, order_index)
);

create table if not exists public.q54_ideas (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.q54_topics(id) on delete cascade,
  requirement_id uuid references public.q54_question_requirements(id) on delete set null,
  function_group text not null check (function_group in ('POSITIVE', 'NEGATIVE', 'CAUSE', 'SOLUTION', 'SPECIAL')),
  keyword_ko text not null,
  keyword_vi text not null,
  logic_steps jsonb not null default '[]'::jsonb check (jsonb_typeof(logic_steps) = 'array'),
  status text not null default 'DRAFT' check (status in ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
  source_type text not null default 'MANUAL' check (source_type in ('MANUAL', 'AI_GENERATED', 'OFFICIAL')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.q54_collocations (
  id uuid primary key default gen_random_uuid(),
  expression_ko text not null unique,
  meaning_vi text not null,
  reuse_score integer not null check (reuse_score between 1 and 5),
  status text not null default 'DRAFT' check (status in ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
  source_type text not null default 'MANUAL' check (source_type in ('MANUAL', 'AI_GENERATED', 'OFFICIAL')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.q54_collocation_topics (
  collocation_id uuid not null references public.q54_collocations(id) on delete cascade,
  topic_id uuid not null references public.q54_topics(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (collocation_id, topic_id)
);

create table if not exists public.q54_sentence_patterns (
  id uuid primary key default gen_random_uuid(),
  function_group text not null check (function_group in ('POSITIVE', 'NEGATIVE', 'CAUSE', 'SOLUTION', 'SPECIAL')),
  pattern_ko text not null unique,
  meaning_vi text not null,
  difficulty text not null default 'INTERMEDIATE' check (difficulty in ('BEGINNER', 'INTERMEDIATE', 'ADVANCED')),
  reuse_score integer not null check (reuse_score between 1 and 5),
  status text not null default 'DRAFT' check (status in ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
  source_type text not null default 'MANUAL' check (source_type in ('MANUAL', 'AI_GENERATED', 'OFFICIAL')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.q54_pattern_examples (
  id uuid primary key default gen_random_uuid(),
  pattern_id uuid not null references public.q54_sentence_patterns(id) on delete cascade,
  topic_id uuid references public.q54_topics(id) on delete set null,
  collocation_id uuid references public.q54_collocations(id) on delete set null,
  sentence_ko text not null,
  translation_vi text not null,
  status text not null default 'DRAFT' check (status in ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
  source_type text not null default 'MANUAL' check (source_type in ('MANUAL', 'AI_GENERATED', 'OFFICIAL')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.q54_translation_exercises (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.q54_topics(id) on delete cascade,
  requirement_id uuid not null references public.q54_question_requirements(id) on delete cascade,
  prompt_vi text not null,
  reference_answer_ko text not null,
  vocabulary_hint jsonb not null default '[]'::jsonb check (jsonb_typeof(vocabulary_hint) = 'array'),
  pattern_hint text,
  sample_sentence_ko text,
  status text not null default 'DRAFT' check (status in ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
  source_type text not null default 'MANUAL' check (source_type in ('MANUAL', 'AI_GENERATED', 'OFFICIAL')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.q54_sentence_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  submission_id uuid not null,
  exercise_id uuid not null references public.q54_translation_exercises(id) on delete restrict,
  requirement_id uuid not null references public.q54_question_requirements(id) on delete restrict,
  prompt_vi text not null,
  answer_ko text not null check (char_length(trim(answer_ko)) between 1 and 1000),
  hint_level integer not null check (hint_level between 0 and 5),
  hints_used jsonb not null default '[]'::jsonb check (jsonb_typeof(hints_used) = 'array'),
  state text not null default 'PROCESSING' check (state in ('PROCESSING', 'ASSESSED', 'FAILED')),
  assessment_json jsonb,
  assessment_provider text,
  assessment_model text,
  prompt_version text,
  schema_version text,
  failure_code text,
  assessed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, submission_id)
);

create table if not exists public.q54_ai_request_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  request_kind text not null check (request_kind in ('QUESTION_ANALYSIS', 'SENTENCE_ASSESSMENT')),
  created_at timestamptz not null default now()
);

create table if not exists public.q54_user_errors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  error_key text not null,
  error_type text not null check (error_type in ('PARTICLE', 'GRAMMAR', 'VOCABULARY', 'COLLOCATION', 'SPELLING', 'LOGIC', 'REPETITION', 'QUESTION_RELEVANCE')),
  original_text text not null,
  corrected_text text not null,
  explanation_vi text not null,
  collocation_id uuid references public.q54_collocations(id) on delete set null,
  pattern_id uuid references public.q54_sentence_patterns(id) on delete set null,
  occurrence_count integer not null default 1 check (occurrence_count > 0),
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  last_attempt_id uuid references public.q54_sentence_attempts(id) on delete set null,
  mastered boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, error_key)
);

create or replace function public.q54_set_updated_at() returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end $$;
drop trigger if exists q54_topics_updated_at on public.q54_topics;
drop trigger if exists q54_questions_updated_at on public.q54_questions;
drop trigger if exists q54_requirements_updated_at on public.q54_question_requirements;
drop trigger if exists q54_ideas_updated_at on public.q54_ideas;
drop trigger if exists q54_collocations_updated_at on public.q54_collocations;
drop trigger if exists q54_patterns_updated_at on public.q54_sentence_patterns;
drop trigger if exists q54_pattern_examples_updated_at on public.q54_pattern_examples;
drop trigger if exists q54_exercises_updated_at on public.q54_translation_exercises;
drop trigger if exists q54_attempts_updated_at on public.q54_sentence_attempts;
drop trigger if exists q54_errors_updated_at on public.q54_user_errors;
create trigger q54_topics_updated_at before update on public.q54_topics for each row execute function public.q54_set_updated_at();
create trigger q54_questions_updated_at before update on public.q54_questions for each row execute function public.q54_set_updated_at();
create trigger q54_requirements_updated_at before update on public.q54_question_requirements for each row execute function public.q54_set_updated_at();
create trigger q54_ideas_updated_at before update on public.q54_ideas for each row execute function public.q54_set_updated_at();
create trigger q54_collocations_updated_at before update on public.q54_collocations for each row execute function public.q54_set_updated_at();
create trigger q54_patterns_updated_at before update on public.q54_sentence_patterns for each row execute function public.q54_set_updated_at();
create trigger q54_pattern_examples_updated_at before update on public.q54_pattern_examples for each row execute function public.q54_set_updated_at();
create trigger q54_exercises_updated_at before update on public.q54_translation_exercises for each row execute function public.q54_set_updated_at();
create trigger q54_attempts_updated_at before update on public.q54_sentence_attempts for each row execute function public.q54_set_updated_at();
create trigger q54_errors_updated_at before update on public.q54_user_errors for each row execute function public.q54_set_updated_at();

create index if not exists idx_q54_questions_topic_status on public.q54_questions(topic_id, status);
create unique index if not exists uq_q54_curated_question_prompt on public.q54_questions(topic_id, prompt_ko) where created_by is null;
create index if not exists idx_q54_requirements_question_order on public.q54_question_requirements(question_id, order_index);
create index if not exists idx_q54_ideas_requirement on public.q54_ideas(requirement_id);
create index if not exists idx_q54_exercises_requirement on public.q54_translation_exercises(requirement_id, status);
create index if not exists idx_q54_attempts_user_created on public.q54_sentence_attempts(user_id, created_at desc);
create index if not exists idx_q54_ai_requests_user_created on public.q54_ai_request_logs(user_id, created_at desc);
create index if not exists idx_q54_errors_user_last_seen on public.q54_user_errors(user_id, last_seen_at desc);

alter table public.q54_topics enable row level security;
alter table public.q54_questions enable row level security;
alter table public.q54_question_requirements enable row level security;
alter table public.q54_ideas enable row level security;
alter table public.q54_collocations enable row level security;
alter table public.q54_collocation_topics enable row level security;
alter table public.q54_sentence_patterns enable row level security;
alter table public.q54_pattern_examples enable row level security;
alter table public.q54_translation_exercises enable row level security;
alter table public.q54_sentence_attempts enable row level security;
alter table public.q54_ai_request_logs enable row level security;
alter table public.q54_user_errors enable row level security;

drop policy if exists "read published q54 topics" on public.q54_topics;
drop policy if exists "read q54 questions" on public.q54_questions;
drop policy if exists "read q54 requirements" on public.q54_question_requirements;
drop policy if exists "read published q54 ideas" on public.q54_ideas;
drop policy if exists "read published q54 collocations" on public.q54_collocations;
drop policy if exists "read published q54 collocation topics" on public.q54_collocation_topics;
drop policy if exists "read published q54 patterns" on public.q54_sentence_patterns;
drop policy if exists "read published q54 pattern examples" on public.q54_pattern_examples;
drop policy if exists "read published q54 exercises" on public.q54_translation_exercises;
drop policy if exists "read own q54 attempts" on public.q54_sentence_attempts;
drop policy if exists "read own q54 errors" on public.q54_user_errors;
create policy "read published q54 topics" on public.q54_topics for select to authenticated using (status = 'PUBLISHED');
create policy "read q54 questions" on public.q54_questions for select to authenticated using ((visibility = 'PUBLIC' and status = 'PUBLISHED') or created_by = auth.uid());
create policy "read q54 requirements" on public.q54_question_requirements for select to authenticated using (exists (select 1 from public.q54_questions q where q.id = question_id and ((q.visibility = 'PUBLIC' and q.status = 'PUBLISHED') or q.created_by = auth.uid())));
create policy "read published q54 ideas" on public.q54_ideas for select to authenticated using (status = 'PUBLISHED');
create policy "read published q54 collocations" on public.q54_collocations for select to authenticated using (status = 'PUBLISHED');
create policy "read published q54 collocation topics" on public.q54_collocation_topics for select to authenticated using (exists (select 1 from public.q54_collocations c where c.id = collocation_id and c.status = 'PUBLISHED') and exists (select 1 from public.q54_topics t where t.id = topic_id and t.status = 'PUBLISHED'));
create policy "read published q54 patterns" on public.q54_sentence_patterns for select to authenticated using (status = 'PUBLISHED');
create policy "read published q54 pattern examples" on public.q54_pattern_examples for select to authenticated using (status = 'PUBLISHED');
create policy "read published q54 exercises" on public.q54_translation_exercises for select to authenticated using (status = 'PUBLISHED');
create policy "read own q54 attempts" on public.q54_sentence_attempts for select to authenticated using (user_id = auth.uid());
create policy "read own q54 errors" on public.q54_user_errors for select to authenticated using (user_id = auth.uid());

revoke insert, update, delete on public.q54_topics, public.q54_questions, public.q54_question_requirements, public.q54_ideas, public.q54_collocations, public.q54_collocation_topics, public.q54_sentence_patterns, public.q54_pattern_examples, public.q54_translation_exercises, public.q54_sentence_attempts, public.q54_ai_request_logs, public.q54_user_errors from anon, authenticated;

create or replace function public.save_q54_private_question(p_topic_id uuid, p_prompt_ko text, p_requirements jsonb, p_source_type text default 'AI_GENERATED')
returns jsonb language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); question public.q54_questions; item jsonb; requirement public.q54_question_requirements; item_count integer := 0; item_index integer := 0;
begin
  if uid is null then raise exception 'Authentication is required'; end if;
  if not exists (select 1 from public.q54_topics where id = p_topic_id and status = 'PUBLISHED') then raise exception 'Topic not found'; end if;
  if p_source_type not in ('MANUAL', 'AI_GENERATED') then raise exception 'Invalid source type'; end if;
  if jsonb_typeof(p_requirements) <> 'array' or jsonb_array_length(p_requirements) < 1 then raise exception 'At least one requirement is required'; end if;
  insert into public.q54_questions(topic_id, created_by, prompt_ko, visibility, status, source_type)
  values (p_topic_id, uid, trim(p_prompt_ko), 'PRIVATE', 'PUBLISHED', p_source_type)
  returning * into question;
  for item in select value from jsonb_array_elements(p_requirements) loop
    if coalesce(trim(item->>'promptKo'), '') = '' or coalesce(trim(item->>'labelVi'), '') = '' or coalesce(trim(item->>'requirementType'), '') not in ('장점', '필요성', '중요성', '긍정적인 영향', '문제점', '부정적인 영향', '부작용', '어려운 이유', '원인', '배경', '노력', '해결 방안', '방법', '바람직한 태도', '역할', '특징', '고려 사항', '기타') or coalesce(trim(item->>'functionGroup'), '') not in ('POSITIVE', 'NEGATIVE', 'CAUSE', 'SOLUTION', 'SPECIAL') then
      raise exception 'Invalid requirement';
    end if;
    insert into public.q54_question_requirements(question_id, order_index, prompt_ko, label_vi, requirement_type, function_group, status, source_type)
    values (question.id, item_index, trim(item->>'promptKo'), trim(item->>'labelVi'), trim(item->>'requirementType'), trim(item->>'functionGroup'), 'PUBLISHED', p_source_type)
    returning * into requirement;
    item_index := item_index + 1; item_count := item_count + 1;
  end loop;
  return jsonb_build_object('question', to_jsonb(question), 'requirementCount', item_count);
end $$;

create or replace function public.claim_q54_sentence_submission(p_submission_id uuid, p_exercise_id uuid, p_answer_ko text, p_hint_level integer, p_hints_used jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); existing public.q54_sentence_attempts; exercise public.q54_translation_exercises; requirement public.q54_question_requirements; recent_count integer;
begin
  if uid is null then raise exception 'Authentication is required'; end if;
  if p_hint_level not between 0 and 5 or jsonb_typeof(coalesce(p_hints_used, '[]'::jsonb)) <> 'array' then raise exception 'Invalid hint state'; end if;
  if char_length(trim(coalesce(p_answer_ko, ''))) not between 1 and 1000 then raise exception 'Invalid answer'; end if;
  perform pg_advisory_xact_lock(hashtextextended(uid::text, 54));
  select * into existing from public.q54_sentence_attempts where user_id = uid and submission_id = p_submission_id;
  if found then return jsonb_build_object('claimed', false, 'attempt', to_jsonb(existing)); end if;
  select * into exercise from public.q54_translation_exercises where id = p_exercise_id and status = 'PUBLISHED';
  if not found then raise exception 'Exercise not found'; end if;
  select * into requirement from public.q54_question_requirements where id = exercise.requirement_id and status = 'PUBLISHED';
  if not found then raise exception 'Requirement not found'; end if;
  select count(*) into recent_count from public.q54_sentence_attempts where user_id = uid and created_at >= now() - interval '5 minutes';
  select count(*) into recent_count from public.q54_ai_request_logs where user_id = uid and created_at >= now() - interval '5 minutes';
  if recent_count >= 5 then raise exception 'Q54_RATE_LIMIT_SHORT'; end if;
  select count(*) into recent_count from public.q54_ai_request_logs where user_id = uid and created_at >= now() - interval '24 hours';
  if recent_count >= 30 then raise exception 'Q54_RATE_LIMIT_DAILY'; end if;
  insert into public.q54_ai_request_logs(user_id, request_kind) values (uid, 'SENTENCE_ASSESSMENT');
  insert into public.q54_sentence_attempts(user_id, submission_id, exercise_id, requirement_id, prompt_vi, answer_ko, hint_level, hints_used, state)
  values (uid, p_submission_id, exercise.id, requirement.id, exercise.prompt_vi, trim(p_answer_ko), p_hint_level, coalesce(p_hints_used, '[]'::jsonb), 'PROCESSING')
  returning * into existing;
  return jsonb_build_object('claimed', true, 'attempt', to_jsonb(existing));
end $$;

create or replace function public.claim_q54_question_analysis()
returns void language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); recent_count integer;
begin
  if uid is null then raise exception 'Authentication is required'; end if;
  perform pg_advisory_xact_lock(hashtextextended(uid::text, 54));
  select count(*) into recent_count from public.q54_ai_request_logs where user_id = uid and created_at >= now() - interval '5 minutes';
  if recent_count >= 5 then raise exception 'Q54_RATE_LIMIT_SHORT'; end if;
  select count(*) into recent_count from public.q54_ai_request_logs where user_id = uid and created_at >= now() - interval '24 hours';
  if recent_count >= 30 then raise exception 'Q54_RATE_LIMIT_DAILY'; end if;
  insert into public.q54_ai_request_logs(user_id, request_kind) values (uid, 'QUESTION_ANALYSIS');
end $$;

create or replace function public.complete_q54_sentence_submission(p_attempt_id uuid, p_assessment jsonb, p_provider text, p_model text, p_prompt_version text, p_schema_version text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare attempt public.q54_sentence_attempts; error_item jsonb; error_type_value text; error_key_value text;
begin
  select * into attempt from public.q54_sentence_attempts where id = p_attempt_id for update;
  if not found then raise exception 'Attempt not found'; end if;
  if attempt.state = 'ASSESSED' then return to_jsonb(attempt); end if;
  if jsonb_typeof(p_assessment) <> 'object' then raise exception 'Invalid assessment'; end if;
  update public.q54_sentence_attempts set state = 'ASSESSED', assessment_json = p_assessment, assessment_provider = p_provider, assessment_model = p_model, prompt_version = p_prompt_version, schema_version = p_schema_version, failure_code = null, assessed_at = now() where id = attempt.id returning * into attempt;
  for error_item in select value from jsonb_array_elements(coalesce(p_assessment->'errors', '[]'::jsonb)) loop
    error_type_value := coalesce(error_item->>'type', 'GRAMMAR');
    if error_type_value not in ('PARTICLE', 'GRAMMAR', 'VOCABULARY', 'COLLOCATION', 'SPELLING', 'LOGIC', 'REPETITION', 'QUESTION_RELEVANCE') then error_type_value := 'GRAMMAR'; end if;
    if coalesce(trim(error_item->>'original'), '') = '' or coalesce(trim(error_item->>'corrected'), '') = '' or coalesce(trim(error_item->>'explanationVi'), '') = '' then continue; end if;
    error_key_value := md5(lower(error_type_value || '|' || trim(error_item->>'original') || '|' || trim(error_item->>'corrected')));
    insert into public.q54_user_errors(user_id, error_key, error_type, original_text, corrected_text, explanation_vi, last_attempt_id)
    values (attempt.user_id, error_key_value, error_type_value, trim(error_item->>'original'), trim(error_item->>'corrected'), trim(error_item->>'explanationVi'), attempt.id)
    on conflict (user_id, error_key) do update set occurrence_count = public.q54_user_errors.occurrence_count + 1, last_seen_at = now(), last_attempt_id = excluded.last_attempt_id, explanation_vi = excluded.explanation_vi, mastered = false;
  end loop;
  return to_jsonb(attempt);
end $$;

revoke all on function public.save_q54_private_question(uuid, text, jsonb, text) from public;
revoke all on function public.claim_q54_sentence_submission(uuid, uuid, text, integer, jsonb) from public;
revoke all on function public.complete_q54_sentence_submission(uuid, jsonb, text, text, text, text) from public;
revoke all on function public.claim_q54_question_analysis() from public;
grant execute on function public.save_q54_private_question(uuid, text, jsonb, text), public.claim_q54_sentence_submission(uuid, uuid, text, integer, jsonb), public.claim_q54_question_analysis() to authenticated;
grant execute on function public.complete_q54_sentence_submission(uuid, jsonb, text, text, text, text) to service_role;
