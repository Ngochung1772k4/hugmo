-- Q54 Translation Workbench: private exercises, lazy hints, and generation context.

alter table public.q54_translation_exercises add column if not exists created_by uuid references auth.users(id) on delete cascade;
alter table public.q54_translation_exercises add column if not exists visibility text not null default 'PUBLIC';
alter table public.q54_translation_exercises add column if not exists generation_mode text not null default 'CURATED';
alter table public.q54_translation_exercises add column if not exists difficulty text not null default 'NORMAL';
alter table public.q54_translation_exercises add column if not exists generation_context_json jsonb not null default '{}'::jsonb;
alter table public.q54_translation_exercises add column if not exists hint_cache jsonb not null default '{}'::jsonb;
alter table public.q54_translation_exercises alter column reference_answer_ko drop not null;
alter table public.q54_translation_exercises drop constraint if exists q54_translation_exercises_visibility_check;
alter table public.q54_translation_exercises add constraint q54_translation_exercises_visibility_check check (visibility in ('PUBLIC', 'PRIVATE'));
alter table public.q54_translation_exercises drop constraint if exists q54_translation_exercises_generation_mode_check;
alter table public.q54_translation_exercises add constraint q54_translation_exercises_generation_mode_check check (generation_mode in ('CURATED', 'AI_GENERATED', 'USER_ENTERED'));
alter table public.q54_translation_exercises drop constraint if exists q54_translation_exercises_difficulty_check;
alter table public.q54_translation_exercises add constraint q54_translation_exercises_difficulty_check check (difficulty = 'NORMAL');
alter table public.q54_translation_exercises drop constraint if exists q54_translation_exercises_context_object;
alter table public.q54_translation_exercises add constraint q54_translation_exercises_context_object check (jsonb_typeof(generation_context_json) = 'object');
alter table public.q54_translation_exercises drop constraint if exists q54_translation_exercises_hints_object;
alter table public.q54_translation_exercises add constraint q54_translation_exercises_hints_object check (jsonb_typeof(hint_cache) = 'object');
create index if not exists idx_q54_private_exercises_owner_requirement on public.q54_translation_exercises(created_by, requirement_id, created_at desc) where visibility = 'PRIVATE';

create table if not exists public.q54_translation_exercise_answer_keys (
  exercise_id uuid primary key references public.q54_translation_exercises(id) on delete cascade,
  reference_answer_ko text not null,
  created_at timestamptz not null default now()
);
insert into public.q54_translation_exercise_answer_keys(exercise_id, reference_answer_ko)
select id, reference_answer_ko from public.q54_translation_exercises where reference_answer_ko is not null
on conflict (exercise_id) do update set reference_answer_ko = excluded.reference_answer_ko;
update public.q54_translation_exercises set reference_answer_ko = null where reference_answer_ko is not null;
alter table public.q54_translation_exercise_answer_keys enable row level security;
revoke all on public.q54_translation_exercise_answer_keys from anon, authenticated;

drop policy if exists "read published q54 exercises" on public.q54_translation_exercises;
create policy "read q54 exercises" on public.q54_translation_exercises for select to authenticated using ((visibility = 'PUBLIC' and status = 'PUBLISHED') or created_by = auth.uid());

alter table public.q54_ai_request_logs drop constraint if exists q54_ai_request_logs_request_kind_check;
alter table public.q54_ai_request_logs add constraint q54_ai_request_logs_request_kind_check check (request_kind in ('QUESTION_ANALYSIS', 'SENTENCE_ASSESSMENT', 'TRANSLATION_GENERATION', 'TRANSLATION_HINT'));

create or replace function public.claim_q54_ai_request(p_request_kind text)
returns void language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); recent_count integer;
begin
  if uid is null then raise exception 'Authentication is required'; end if;
  if p_request_kind not in ('TRANSLATION_GENERATION', 'TRANSLATION_HINT') then raise exception 'Invalid Q54 AI request kind'; end if;
  perform pg_advisory_xact_lock(hashtextextended(uid::text, 54));
  select count(*) into recent_count from public.q54_ai_request_logs where user_id = uid and created_at >= now() - interval '5 minutes';
  if recent_count >= 5 then raise exception 'Q54_RATE_LIMIT_SHORT'; end if;
  select count(*) into recent_count from public.q54_ai_request_logs where user_id = uid and created_at >= now() - interval '24 hours';
  if recent_count >= 30 then raise exception 'Q54_RATE_LIMIT_DAILY'; end if;
  insert into public.q54_ai_request_logs(user_id, request_kind) values (uid, p_request_kind);
end $$;

create or replace function public.create_q54_manual_translation_exercise(p_question_id uuid, p_requirement_id uuid, p_prompt_vi text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  question public.q54_questions;
  requirement public.q54_question_requirements;
  topic public.q54_topics;
  exercise public.q54_translation_exercises;
  context jsonb;
begin
  if uid is null then raise exception 'Authentication is required'; end if;
  if char_length(trim(coalesce(p_prompt_vi, ''))) not between 1 and 250 then raise exception 'Manual sentence must contain 1 to 250 characters'; end if;
  select * into question from public.q54_questions where id = p_question_id and ((visibility = 'PUBLIC' and status = 'PUBLISHED') or created_by = uid);
  if not found then raise exception 'Question not found'; end if;
  select * into requirement from public.q54_question_requirements where id = p_requirement_id and question_id = question.id and status = 'PUBLISHED';
  if not found then raise exception 'Requirement not found'; end if;
  select * into topic from public.q54_topics where id = question.topic_id and ((visibility = 'PUBLIC' and status = 'PUBLISHED') or created_by = uid);
  if not found then raise exception 'Topic not found'; end if;
  context := jsonb_build_object(
    'topicKo', topic.name_ko, 'topicVi', topic.name_vi, 'subtopicKo', question.subtopic_ko,
    'questionKo', question.prompt_ko, 'requirementKo', requirement.prompt_ko,
    'requirementType', requirement.requirement_type, 'functionGroup', requirement.function_group,
    'promptVi', trim(p_prompt_vi)
  );
  insert into public.q54_translation_exercises(topic_id, requirement_id, created_by, visibility, generation_mode, difficulty, generation_context_json, hint_cache, prompt_vi, reference_answer_ko, vocabulary_hint, pattern_hint, sample_sentence_ko, status, source_type)
  values (topic.id, requirement.id, uid, 'PRIVATE', 'USER_ENTERED', 'NORMAL', context, '{}'::jsonb, trim(p_prompt_vi), null, '[]'::jsonb, null, null, 'PUBLISHED', 'MANUAL')
  returning * into exercise;
  return to_jsonb(exercise);
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
  select * into exercise from public.q54_translation_exercises where id = p_exercise_id and status = 'PUBLISHED' and ((visibility = 'PUBLIC') or created_by = uid);
  if not found then raise exception 'Exercise not found'; end if;
  select * into requirement from public.q54_question_requirements where id = exercise.requirement_id and status = 'PUBLISHED';
  if not found then raise exception 'Requirement not found'; end if;
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

revoke all on function public.create_q54_manual_translation_exercise(uuid, uuid, text) from public;
revoke all on function public.claim_q54_ai_request(text) from public;
revoke all on function public.claim_q54_sentence_submission(uuid, uuid, text, integer, jsonb) from public;
grant execute on function public.create_q54_manual_translation_exercise(uuid, uuid, text), public.claim_q54_ai_request(text), public.claim_q54_sentence_submission(uuid, uuid, text, integer, jsonb) to authenticated;
