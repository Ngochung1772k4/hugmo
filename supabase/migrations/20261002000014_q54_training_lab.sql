-- Q54 Training Lab: private learning sessions, writing drafts, error drills, and active recall.

create table if not exists public.q54_training_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id uuid not null references public.q54_questions(id) on delete cascade,
  mode text not null check (mode in ('PRACTICE', 'EXAM')),
  status text not null default 'ACTIVE' check (status in ('ACTIVE', 'SUBMITTED', 'EXPIRED', 'ABANDONED')),
  bank_stage text not null default 'CLOSED' check (bank_stage in ('CLOSED', 'IDEA', 'PATTERN')),
  question_snapshot jsonb not null check (jsonb_typeof(question_snapshot) = 'object'),
  requirements_snapshot jsonb not null check (jsonb_typeof(requirements_snapshot) = 'array'),
  started_at timestamptz not null default now(),
  ends_at timestamptz,
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((mode = 'PRACTICE' and ends_at is null) or (mode = 'EXAM' and ends_at is not null))
);

create table if not exists public.q54_skill_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id uuid references public.q54_training_sessions(id) on delete set null,
  question_id uuid not null references public.q54_questions(id) on delete cascade,
  requirement_id uuid references public.q54_question_requirements(id) on delete set null,
  idea_id uuid references public.q54_ideas(id) on delete set null,
  error_id uuid references public.q54_user_errors(id) on delete set null,
  skill_type text not null check (skill_type in ('IDEA_SPRINT', 'LOGIC_CHAIN', 'SENTENCE_BUILDER', 'REWRITE', 'ERROR_DRILL')),
  submission_id uuid,
  input_json jsonb not null default '{}'::jsonb check (jsonb_typeof(input_json) in ('object', 'array')),
  result_json jsonb not null default '{}'::jsonb check (jsonb_typeof(result_json) = 'object'),
  duration_ms integer check (duration_ms is null or duration_ms >= 0),
  created_at timestamptz not null default now()
);
create unique index if not exists uq_q54_skill_attempts_submission on public.q54_skill_attempts(user_id, submission_id) where submission_id is not null;

create table if not exists public.q54_writing_drafts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id uuid references public.q54_training_sessions(id) on delete set null,
  question_id uuid not null references public.q54_questions(id) on delete cascade,
  requirement_id uuid references public.q54_question_requirements(id) on delete set null,
  idea_id uuid references public.q54_ideas(id) on delete set null,
  unit_type text not null check (unit_type in ('THREE_SENTENCE', 'PARAGRAPH', 'ESSAY')),
  draft_number integer not null default 1 check (draft_number > 0),
  parent_draft_id uuid references public.q54_writing_drafts(id) on delete set null,
  submission_id uuid not null,
  assistance_stage text not null default 'CLOSED' check (assistance_stage in ('CLOSED', 'IDEA', 'PATTERN')),
  content_ko text not null check (char_length(trim(content_ko)) between 1 and 5000),
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
  unique (user_id, submission_id),
  check ((unit_type = 'ESSAY' and requirement_id is null) or (unit_type <> 'ESSAY' and requirement_id is not null))
);

create table if not exists public.q54_error_drill_sets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  submission_id uuid not null,
  error_ids uuid[] not null default '{}',
  items_json jsonb,
  state text not null default 'PROCESSING' check (state in ('PROCESSING', 'READY', 'FAILED', 'COMPLETED')),
  assessment_provider text,
  assessment_model text,
  prompt_version text,
  schema_version text,
  failure_code text,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (user_id, submission_id),
  check (items_json is null or jsonb_typeof(items_json) = 'array')
);

create table if not exists public.q54_collocation_review_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  collocation_id uuid not null references public.q54_collocations(id) on delete cascade,
  state text not null default 'NEW' check (state in ('NEW', 'LEARNING', 'REVIEW', 'MASTERED')),
  correct_streak integer not null default 0 check (correct_streak >= 0),
  due_at timestamptz not null default now(),
  last_seen_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, collocation_id)
);

alter table public.q54_user_errors add column if not exists last_draft_id uuid references public.q54_writing_drafts(id) on delete set null;

create index if not exists idx_q54_sessions_owner_status on public.q54_training_sessions(user_id, status, created_at desc);
create index if not exists idx_q54_drafts_owner_unit on public.q54_writing_drafts(user_id, unit_type, created_at desc);
create index if not exists idx_q54_drafts_session on public.q54_writing_drafts(session_id, created_at);
create index if not exists idx_q54_drills_owner_state on public.q54_error_drill_sets(user_id, state, created_at desc);
create index if not exists idx_q54_collocation_progress_due on public.q54_collocation_review_progress(user_id, due_at);

drop trigger if exists q54_training_sessions_updated_at on public.q54_training_sessions;
drop trigger if exists q54_writing_drafts_updated_at on public.q54_writing_drafts;
drop trigger if exists q54_collocation_review_progress_updated_at on public.q54_collocation_review_progress;
create trigger q54_training_sessions_updated_at before update on public.q54_training_sessions for each row execute function public.q54_set_updated_at();
create trigger q54_writing_drafts_updated_at before update on public.q54_writing_drafts for each row execute function public.q54_set_updated_at();
create trigger q54_collocation_review_progress_updated_at before update on public.q54_collocation_review_progress for each row execute function public.q54_set_updated_at();

alter table public.q54_training_sessions enable row level security;
alter table public.q54_skill_attempts enable row level security;
alter table public.q54_writing_drafts enable row level security;
alter table public.q54_error_drill_sets enable row level security;
alter table public.q54_collocation_review_progress enable row level security;

create policy "read own q54 training sessions" on public.q54_training_sessions for select to authenticated using (user_id = auth.uid());
create policy "read own q54 skill attempts" on public.q54_skill_attempts for select to authenticated using (user_id = auth.uid());
create policy "read own q54 writing drafts" on public.q54_writing_drafts for select to authenticated using (user_id = auth.uid());
create policy "read own q54 error drills" on public.q54_error_drill_sets for select to authenticated using (user_id = auth.uid());
create policy "read own q54 collocation review progress" on public.q54_collocation_review_progress for select to authenticated using (user_id = auth.uid());
revoke insert, update, delete on public.q54_training_sessions, public.q54_skill_attempts, public.q54_writing_drafts, public.q54_error_drill_sets, public.q54_collocation_review_progress from anon, authenticated;

alter table public.q54_ai_request_logs drop constraint if exists q54_ai_request_logs_request_kind_check;
alter table public.q54_ai_request_logs add constraint q54_ai_request_logs_request_kind_check check (request_kind in ('QUESTION_ANALYSIS', 'SENTENCE_ASSESSMENT', 'TRANSLATION_GENERATION', 'TRANSLATION_HINT', 'IDEA_GENERATION', 'DRAFT_ASSESSMENT', 'ERROR_DRILL_GENERATION'));

create or replace function public.claim_q54_ai_request(p_request_kind text)
returns void language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); recent_count integer;
begin
  if uid is null then raise exception 'Authentication is required'; end if;
  if p_request_kind not in ('QUESTION_ANALYSIS', 'SENTENCE_ASSESSMENT', 'TRANSLATION_GENERATION', 'TRANSLATION_HINT', 'IDEA_GENERATION', 'DRAFT_ASSESSMENT', 'ERROR_DRILL_GENERATION') then raise exception 'Invalid Q54 AI request kind'; end if;
  perform pg_advisory_xact_lock(hashtextextended(uid::text, 54));
  select count(*) into recent_count from public.q54_ai_request_logs where user_id = uid and created_at >= now() - interval '5 minutes';
  if recent_count >= 5 then raise exception 'Q54_RATE_LIMIT_SHORT'; end if;
  select count(*) into recent_count from public.q54_ai_request_logs where user_id = uid and created_at >= now() - interval '24 hours';
  if recent_count >= 30 then raise exception 'Q54_RATE_LIMIT_DAILY'; end if;
  insert into public.q54_ai_request_logs(user_id, request_kind) values (uid, p_request_kind);
end $$;

create or replace function public.start_q54_training_session(p_question_id uuid, p_mode text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); q public.q54_questions; reqs jsonb; session public.q54_training_sessions;
begin
  if uid is null then raise exception 'Authentication is required'; end if;
  if p_mode not in ('PRACTICE', 'EXAM') then raise exception 'Invalid training mode'; end if;
  select * into q from public.q54_questions where id = p_question_id and ((visibility = 'PUBLIC' and status = 'PUBLISHED') or created_by = uid);
  if not found then raise exception 'Question not found'; end if;
  select coalesce(jsonb_agg(to_jsonb(r) order by r.order_index), '[]'::jsonb) into reqs from public.q54_question_requirements r where r.question_id = q.id and r.status = 'PUBLISHED';
  if jsonb_array_length(reqs) = 0 then raise exception 'Question has no requirements'; end if;
  insert into public.q54_training_sessions(user_id, question_id, mode, status, bank_stage, question_snapshot, requirements_snapshot, ends_at)
  values (uid, q.id, p_mode, 'ACTIVE', 'CLOSED', to_jsonb(q), reqs, case when p_mode = 'EXAM' then now() + interval '30 minutes' else null end)
  returning * into session;
  return to_jsonb(session);
end $$;

create or replace function public.advance_q54_training_bank_stage(p_session_id uuid, p_bank_stage text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); session public.q54_training_sessions; current_rank integer; next_rank integer;
begin
  if uid is null then raise exception 'Authentication is required'; end if;
  if p_bank_stage not in ('CLOSED', 'IDEA', 'PATTERN') then raise exception 'Invalid bank stage'; end if;
  select * into session from public.q54_training_sessions where id = p_session_id and user_id = uid for update;
  if not found then raise exception 'Session not found'; end if;
  if session.mode = 'EXAM' then raise exception 'Bank is locked in exam mode'; end if;
  current_rank := case session.bank_stage when 'CLOSED' then 0 when 'IDEA' then 1 else 2 end;
  next_rank := case p_bank_stage when 'CLOSED' then 0 when 'IDEA' then 1 else 2 end;
  if next_rank < current_rank then raise exception 'Bank stage cannot be reduced'; end if;
  update public.q54_training_sessions set bank_stage = p_bank_stage where id = session.id returning * into session;
  return to_jsonb(session);
end $$;

create or replace function public.record_q54_idea_sprint(p_session_id uuid, p_requirement_id uuid, p_ideas jsonb, p_duration_ms integer, p_skipped boolean default false)
returns jsonb language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); session public.q54_training_sessions; attempt public.q54_skill_attempts;
begin
  if uid is null then raise exception 'Authentication is required'; end if;
  if jsonb_typeof(p_ideas) <> 'array' or coalesce(p_duration_ms, -1) not between 0 and 60000 then raise exception 'Invalid sprint payload'; end if;
  select * into session from public.q54_training_sessions where id = p_session_id and user_id = uid;
  if not found or session.mode <> 'PRACTICE' then raise exception 'Practice session not found'; end if;
  if not exists (select 1 from public.q54_question_requirements where id = p_requirement_id and question_id = session.question_id) then raise exception 'Requirement not found'; end if;
  insert into public.q54_skill_attempts(user_id, session_id, question_id, requirement_id, skill_type, input_json, result_json, duration_ms)
  values (uid, session.id, session.question_id, p_requirement_id, 'IDEA_SPRINT', p_ideas, jsonb_build_object('ideaCount', jsonb_array_length(p_ideas), 'skipped', p_skipped), p_duration_ms)
  returning * into attempt;
  return to_jsonb(attempt);
end $$;

create or replace function public.record_q54_logic_chain_attempt(p_session_id uuid, p_idea_id uuid, p_ordered_nodes jsonb, p_duration_ms integer)
returns jsonb language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); session public.q54_training_sessions; idea public.q54_ideas; attempt public.q54_skill_attempts; correct boolean;
begin
  if uid is null then raise exception 'Authentication is required'; end if;
  if jsonb_typeof(p_ordered_nodes) <> 'array' or coalesce(p_duration_ms, -1) < 0 then raise exception 'Invalid logic payload'; end if;
  select * into session from public.q54_training_sessions where id = p_session_id and user_id = uid;
  if not found then raise exception 'Session not found'; end if;
  select * into idea from public.q54_ideas where id = p_idea_id and (scope = 'GLOBAL' or topic_id = (session.question_snapshot->>'topic_id')::uuid or created_by = uid);
  if not found or idea.logic_chain_ko is null then raise exception 'Idea not found'; end if;
  correct := p_ordered_nodes = idea.logic_chain_ko;
  insert into public.q54_skill_attempts(user_id, session_id, question_id, idea_id, skill_type, input_json, result_json, duration_ms)
  values (uid, session.id, session.question_id, idea.id, 'LOGIC_CHAIN', p_ordered_nodes, jsonb_build_object('correct', correct), p_duration_ms)
  returning * into attempt;
  return jsonb_build_object('attempt', to_jsonb(attempt), 'correct', correct, 'expected', idea.logic_chain_ko);
end $$;

create or replace function public.record_q54_skill_attempt(p_session_id uuid, p_requirement_id uuid, p_idea_id uuid, p_skill_type text, p_input jsonb, p_result jsonb, p_duration_ms integer default null)
returns jsonb language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); session public.q54_training_sessions; attempt public.q54_skill_attempts;
begin
  if uid is null then raise exception 'Authentication is required'; end if;
  if p_skill_type not in ('SENTENCE_BUILDER', 'ERROR_DRILL') or jsonb_typeof(p_input) not in ('object', 'array') or jsonb_typeof(p_result) <> 'object' then raise exception 'Invalid skill attempt'; end if;
  select * into session from public.q54_training_sessions where id = p_session_id and user_id = uid;
  if not found then raise exception 'Session not found'; end if;
  if p_requirement_id is not null and not exists (select 1 from public.q54_question_requirements where id = p_requirement_id and question_id = session.question_id) then raise exception 'Requirement not found'; end if;
  insert into public.q54_skill_attempts(user_id, session_id, question_id, requirement_id, idea_id, skill_type, input_json, result_json, duration_ms)
  values (uid, session.id, session.question_id, p_requirement_id, p_idea_id, p_skill_type, p_input, p_result, p_duration_ms)
  returning * into attempt;
  return to_jsonb(attempt);
end $$;

create or replace function public.claim_q54_draft_submission(p_submission_id uuid, p_session_id uuid, p_question_id uuid, p_requirement_id uuid, p_idea_id uuid, p_unit_type text, p_content_ko text, p_parent_draft_id uuid default null, p_assistance_stage text default 'CLOSED')
returns jsonb language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); existing public.q54_writing_drafts; session public.q54_training_sessions; q public.q54_questions; parent public.q54_writing_drafts; draft public.q54_writing_drafts; draft_no integer := 1;
begin
  if uid is null then raise exception 'Authentication is required'; end if;
  if p_unit_type not in ('THREE_SENTENCE', 'PARAGRAPH', 'ESSAY') or p_assistance_stage not in ('CLOSED', 'IDEA', 'PATTERN') then raise exception 'Invalid draft type'; end if;
  if char_length(trim(coalesce(p_content_ko, ''))) not between 1 and 5000 then raise exception 'Invalid draft content'; end if;
  perform pg_advisory_xact_lock(hashtextextended(uid::text || ':' || p_submission_id::text, 5401));
  select * into existing from public.q54_writing_drafts where user_id = uid and submission_id = p_submission_id;
  if found then return jsonb_build_object('claimed', false, 'draft', to_jsonb(existing)); end if;
  select * into q from public.q54_questions where id = p_question_id and ((visibility = 'PUBLIC' and status = 'PUBLISHED') or created_by = uid);
  if not found then raise exception 'Question not found'; end if;
  if p_session_id is not null then
    select * into session from public.q54_training_sessions where id = p_session_id and user_id = uid for update;
    if not found or session.question_id <> q.id then raise exception 'Session not found'; end if;
    if session.status <> 'ACTIVE' then raise exception 'Session is not active'; end if;
    if session.mode = 'EXAM' and now() > session.ends_at then
      update public.q54_training_sessions set status = 'EXPIRED' where id = session.id;
      raise exception 'EXAM_TIME_EXPIRED';
    end if;
    if session.mode = 'EXAM' and p_assistance_stage <> 'CLOSED' then raise exception 'Assistance is locked in exam mode'; end if;
  end if;
  if (p_unit_type = 'ESSAY' and p_requirement_id is not null) or (p_unit_type <> 'ESSAY' and p_requirement_id is null) then raise exception 'Invalid requirement for draft type'; end if;
  if p_requirement_id is not null and not exists (select 1 from public.q54_question_requirements where id = p_requirement_id and question_id = q.id) then raise exception 'Requirement not found'; end if;
  if p_idea_id is not null and not exists (select 1 from public.q54_ideas where id = p_idea_id and ((visibility = 'PUBLIC' and status = 'PUBLISHED') or created_by = uid)) then raise exception 'Idea not found'; end if;
  if p_parent_draft_id is not null then
    select * into parent from public.q54_writing_drafts where id = p_parent_draft_id and user_id = uid and question_id = q.id and unit_type = p_unit_type;
    if not found then raise exception 'Parent draft not found'; end if;
    draft_no := parent.draft_number + 1;
  end if;
  perform public.claim_q54_ai_request('DRAFT_ASSESSMENT');
  insert into public.q54_writing_drafts(user_id, session_id, question_id, requirement_id, idea_id, unit_type, draft_number, parent_draft_id, submission_id, assistance_stage, content_ko, state)
  values (uid, p_session_id, q.id, p_requirement_id, p_idea_id, p_unit_type, draft_no, p_parent_draft_id, p_submission_id, p_assistance_stage, trim(p_content_ko), 'PROCESSING')
  returning * into draft;
  return jsonb_build_object('claimed', true, 'draft', to_jsonb(draft));
end $$;

create or replace function public.complete_q54_draft_assessment(p_draft_id uuid, p_assessment jsonb, p_provider text, p_model text, p_prompt_version text, p_schema_version text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare draft public.q54_writing_drafts; error_item jsonb; error_type_value text; error_key_value text; collocation_id_value uuid;
begin
  if coalesce(auth.jwt()->>'role', '') <> 'service_role' then raise exception 'Service role is required'; end if;
  select * into draft from public.q54_writing_drafts where id = p_draft_id for update;
  if not found then raise exception 'Draft not found'; end if;
  if jsonb_typeof(p_assessment) <> 'object' then raise exception 'Invalid assessment'; end if;
  update public.q54_writing_drafts set state = 'ASSESSED', assessment_json = p_assessment, assessment_provider = p_provider, assessment_model = p_model, prompt_version = p_prompt_version, schema_version = p_schema_version, failure_code = null, assessed_at = now() where id = draft.id returning * into draft;
  for error_item in select value from jsonb_array_elements(coalesce(p_assessment->'errors', '[]'::jsonb)) loop
    error_type_value := upper(coalesce(error_item->>'type', ''));
    if error_type_value not in ('PARTICLE', 'GRAMMAR', 'VOCABULARY', 'COLLOCATION', 'SPELLING', 'LOGIC', 'REPETITION', 'QUESTION_RELEVANCE') then continue; end if;
    if coalesce(trim(error_item->>'original'), '') = '' or coalesce(trim(error_item->>'corrected'), '') = '' or coalesce(trim(error_item->>'explanationVi'), '') = '' then continue; end if;
    error_key_value := error_type_value || '|' || lower(trim(error_item->>'original')) || '|' || lower(trim(error_item->>'corrected'));
    collocation_id_value := null;
    if error_type_value = 'COLLOCATION' then
      select id into collocation_id_value from public.q54_collocations where status = 'PUBLISHED' and expression_ko in (trim(error_item->>'original'), trim(error_item->>'corrected')) order by reuse_score desc limit 1;
    end if;
    insert into public.q54_user_errors(user_id, error_key, error_type, original_text, corrected_text, explanation_vi, collocation_id, last_draft_id)
    values (draft.user_id, error_key_value, error_type_value, trim(error_item->>'original'), trim(error_item->>'corrected'), trim(error_item->>'explanationVi'), collocation_id_value, draft.id)
    on conflict (user_id, error_key) do update set occurrence_count = public.q54_user_errors.occurrence_count + 1, last_seen_at = now(), last_draft_id = excluded.last_draft_id, explanation_vi = excluded.explanation_vi, mastered = false;
  end loop;
  if draft.unit_type = 'ESSAY' and draft.session_id is not null then
    update public.q54_training_sessions set status = 'SUBMITTED', submitted_at = now()
    where id = draft.session_id and mode = 'EXAM' and status = 'ACTIVE';
  end if;
  return to_jsonb(draft);
end $$;

create or replace function public.fail_q54_draft_assessment(p_draft_id uuid, p_failure_code text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if coalesce(auth.jwt()->>'role', '') <> 'service_role' then raise exception 'Service role is required'; end if;
  update public.q54_writing_drafts set state = 'FAILED', failure_code = left(coalesce(p_failure_code, 'UNKNOWN'), 120) where id = p_draft_id and state = 'PROCESSING';
end $$;

create or replace function public.record_q54_rewrite_attempt(p_error_id uuid, p_answer_ko text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); err public.q54_user_errors; attempt public.q54_skill_attempts; correct boolean; success_days integer; question_id_value uuid;
begin
  if uid is null then raise exception 'Authentication is required'; end if;
  select * into err from public.q54_user_errors where id = p_error_id and user_id = uid for update;
  if not found then raise exception 'Error not found'; end if;
  correct := regexp_replace(lower(trim(p_answer_ko)), '\\s+', ' ', 'g') = regexp_replace(lower(trim(err.corrected_text)), '\\s+', ' ', 'g');
  select question_id into question_id_value from public.q54_writing_drafts where id = err.last_draft_id;
  if question_id_value is null then select r.question_id into question_id_value from public.q54_sentence_attempts a join public.q54_question_requirements r on r.id = a.requirement_id where a.id = err.last_attempt_id; end if;
  if question_id_value is null then select question_id into question_id_value from public.q54_training_sessions where user_id = uid order by created_at desc limit 1; end if;
  if question_id_value is null then raise exception 'No question context for error'; end if;
  insert into public.q54_skill_attempts(user_id, question_id, error_id, skill_type, input_json, result_json)
  values (uid, question_id_value, err.id, 'REWRITE', jsonb_build_object('answerKo', trim(p_answer_ko)), jsonb_build_object('correct', correct))
  returning * into attempt;
  select count(distinct (created_at at time zone 'Asia/Bangkok')::date) into success_days from public.q54_skill_attempts where user_id = uid and error_id = err.id and skill_type = 'REWRITE' and coalesce((result_json->>'correct')::boolean, false);
  if success_days >= 3 then update public.q54_user_errors set mastered = true where id = err.id; end if;
  return jsonb_build_object('attempt', to_jsonb(attempt), 'correct', correct, 'mastered', success_days >= 3, 'successDays', success_days);
end $$;

create or replace function public.claim_q54_error_drill(p_submission_id uuid, p_error_ids uuid[] default null)
returns jsonb language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); existing public.q54_error_drill_sets; selected_ids uuid[]; drill public.q54_error_drill_sets;
begin
  if uid is null then raise exception 'Authentication is required'; end if;
  perform pg_advisory_xact_lock(hashtextextended(uid::text || ':' || p_submission_id::text, 5402));
  select * into existing from public.q54_error_drill_sets where user_id = uid and submission_id = p_submission_id;
  if found then return jsonb_build_object('claimed', false, 'drill', to_jsonb(existing)); end if;
  selected_ids := coalesce(p_error_ids, array(select id from public.q54_user_errors where user_id = uid and not mastered order by occurrence_count desc, last_seen_at desc limit 5));
  if coalesce(cardinality(selected_ids), 0) = 0 then raise exception 'No errors available'; end if;
  if exists (select 1 from unnest(selected_ids) id where not exists (select 1 from public.q54_user_errors e where e.id = id and e.user_id = uid)) then raise exception 'Invalid error selection'; end if;
  perform public.claim_q54_ai_request('ERROR_DRILL_GENERATION');
  insert into public.q54_error_drill_sets(user_id, submission_id, error_ids, state) values (uid, p_submission_id, selected_ids, 'PROCESSING') returning * into drill;
  return jsonb_build_object('claimed', true, 'drill', to_jsonb(drill));
end $$;

create or replace function public.complete_q54_error_drill(p_drill_id uuid, p_items jsonb, p_provider text, p_model text, p_prompt_version text, p_schema_version text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare drill public.q54_error_drill_sets;
begin
  if coalesce(auth.jwt()->>'role', '') <> 'service_role' then raise exception 'Service role is required'; end if;
  select * into drill from public.q54_error_drill_sets where id = p_drill_id for update;
  if not found or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) <> 5 then raise exception 'Invalid drill items'; end if;
  update public.q54_error_drill_sets set state = 'READY', items_json = p_items, assessment_provider = p_provider, assessment_model = p_model, prompt_version = p_prompt_version, schema_version = p_schema_version, failure_code = null where id = drill.id returning * into drill;
  return to_jsonb(drill);
end $$;

create or replace function public.fail_q54_error_drill(p_drill_id uuid, p_failure_code text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if coalesce(auth.jwt()->>'role', '') <> 'service_role' then raise exception 'Service role is required'; end if;
  update public.q54_error_drill_sets set state = 'FAILED', failure_code = left(coalesce(p_failure_code, 'UNKNOWN'), 120) where id = p_drill_id and state = 'PROCESSING';
end $$;

create or replace function public.record_q54_error_drill_attempt(p_drill_id uuid, p_answers jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); drill public.q54_error_drill_sets; item jsonb; answer jsonb; correct_count integer := 0; index_value integer := 0; attempt public.q54_skill_attempts; question_id_value uuid;
begin
  if uid is null then raise exception 'Authentication is required'; end if;
  select * into drill from public.q54_error_drill_sets where id = p_drill_id and user_id = uid and state = 'READY' for update;
  if not found or jsonb_typeof(p_answers) <> 'array' or jsonb_array_length(p_answers) <> 5 then raise exception 'Drill not found'; end if;
  for item in select value from jsonb_array_elements(drill.items_json) loop
    answer := p_answers->index_value;
    if coalesce(answer->>'selectedIndex', '') ~ '^[0-9]+$' and (answer->>'selectedIndex')::integer = (item->>'correctIndex')::integer then correct_count := correct_count + 1; end if;
    index_value := index_value + 1;
  end loop;
  select d.question_id into question_id_value from public.q54_user_errors e join public.q54_writing_drafts d on d.id = e.last_draft_id where e.id = any(drill.error_ids) order by d.created_at desc limit 1;
  if question_id_value is null then select r.question_id into question_id_value from public.q54_user_errors e join public.q54_sentence_attempts a on a.id = e.last_attempt_id join public.q54_question_requirements r on r.id = a.requirement_id where e.id = any(drill.error_ids) order by a.created_at desc limit 1; end if;
  if question_id_value is null then select question_id into question_id_value from public.q54_training_sessions where user_id = uid order by created_at desc limit 1; end if;
  if question_id_value is null then raise exception 'No question context for error drill'; end if;
  insert into public.q54_skill_attempts(user_id, question_id, skill_type, input_json, result_json)
  values (uid, question_id_value, 'ERROR_DRILL', p_answers, jsonb_build_object('score', correct_count, 'total', 5, 'drillId', drill.id)) returning * into attempt;
  update public.q54_error_drill_sets set state = 'COMPLETED', completed_at = now() where id = drill.id;
  return jsonb_build_object('attempt', to_jsonb(attempt), 'score', correct_count, 'total', 5);
end $$;

create or replace function public.record_q54_collocation_recall(p_collocation_id uuid, p_answer_ko text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); collocation public.q54_collocations; progress public.q54_collocation_review_progress; correct boolean; next_state text; next_due timestamptz;
begin
  if uid is null then raise exception 'Authentication is required'; end if;
  select * into collocation from public.q54_collocations where id = p_collocation_id and status = 'PUBLISHED';
  if not found then raise exception 'Collocation not found'; end if;
  select * into progress from public.q54_collocation_review_progress where user_id = uid and collocation_id = collocation.id for update;
  correct := regexp_replace(lower(trim(p_answer_ko)), '\\s+', ' ', 'g') = regexp_replace(lower(trim(collocation.expression_ko)), '\\s+', ' ', 'g');
  if correct then
    next_state := case when coalesce(progress.correct_streak, 0) + 1 >= 3 then 'MASTERED' when coalesce(progress.correct_streak, 0) + 1 >= 1 then 'REVIEW' else 'LEARNING' end;
    next_due := now() + case when coalesce(progress.correct_streak, 0) + 1 >= 3 then interval '30 days' else interval '1 day' end;
  else next_state := 'LEARNING'; next_due := now() + interval '10 minutes'; end if;
  insert into public.q54_collocation_review_progress(user_id, collocation_id, state, correct_streak, due_at, last_seen_at)
  values (uid, collocation.id, next_state, case when correct then 1 else 0 end, next_due, now())
  on conflict (user_id, collocation_id) do update set state = next_state, correct_streak = case when correct then public.q54_collocation_review_progress.correct_streak + 1 else 0 end, due_at = next_due, last_seen_at = now(), updated_at = now()
  returning * into progress;
  return jsonb_build_object('correct', correct, 'progress', to_jsonb(progress), 'expected', collocation.expression_ko);
end $$;

revoke all on function public.start_q54_training_session(uuid, text), public.advance_q54_training_bank_stage(uuid, text), public.record_q54_idea_sprint(uuid, uuid, jsonb, integer, boolean), public.record_q54_logic_chain_attempt(uuid, uuid, jsonb, integer), public.record_q54_skill_attempt(uuid, uuid, uuid, text, jsonb, jsonb, integer), public.claim_q54_draft_submission(uuid, uuid, uuid, uuid, uuid, text, text, uuid, text), public.complete_q54_draft_assessment(uuid, jsonb, text, text, text, text), public.fail_q54_draft_assessment(uuid, text), public.record_q54_rewrite_attempt(uuid, text), public.claim_q54_error_drill(uuid, uuid[]), public.complete_q54_error_drill(uuid, jsonb, text, text, text, text), public.fail_q54_error_drill(uuid, text), public.record_q54_error_drill_attempt(uuid, jsonb), public.record_q54_collocation_recall(uuid, text) from public;
grant execute on function public.start_q54_training_session(uuid, text), public.advance_q54_training_bank_stage(uuid, text), public.record_q54_idea_sprint(uuid, uuid, jsonb, integer, boolean), public.record_q54_logic_chain_attempt(uuid, uuid, jsonb, integer), public.record_q54_skill_attempt(uuid, uuid, uuid, text, jsonb, jsonb, integer), public.claim_q54_draft_submission(uuid, uuid, uuid, uuid, uuid, text, text, uuid, text), public.complete_q54_draft_assessment(uuid, jsonb, text, text, text, text), public.fail_q54_draft_assessment(uuid, text), public.record_q54_rewrite_attempt(uuid, text), public.claim_q54_error_drill(uuid, uuid[]), public.complete_q54_error_drill(uuid, jsonb, text, text, text, text), public.fail_q54_error_drill(uuid, text), public.record_q54_error_drill_attempt(uuid, jsonb), public.record_q54_collocation_recall(uuid, text) to authenticated;
