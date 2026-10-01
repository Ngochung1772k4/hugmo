-- Q54 assessment v3: persist immutable context and only store server-validated feedback.

alter table public.q54_writing_drafts
  add column if not exists assessment_context_json jsonb;

alter table public.q54_writing_drafts
  drop constraint if exists q54_writing_drafts_assessment_context_json_check;

alter table public.q54_writing_drafts
  add constraint q54_writing_drafts_assessment_context_json_check
  check (assessment_context_json is null or jsonb_typeof(assessment_context_json) = 'object');

create or replace function public.claim_q54_draft_submission(p_submission_id uuid, p_session_id uuid, p_question_id uuid, p_requirement_id uuid, p_idea_id uuid, p_unit_type text, p_content_ko text, p_parent_draft_id uuid default null, p_assistance_stage text default 'CLOSED')
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  existing public.q54_writing_drafts;
  session public.q54_training_sessions;
  q public.q54_questions;
  parent public.q54_writing_drafts;
  draft public.q54_writing_drafts;
  draft_no integer := 1;
  question_snapshot_value jsonb;
  all_requirement_snapshots jsonb;
  allowed_requirement_snapshots jsonb;
  selected_requirement_snapshot jsonb;
  assessment_context_value jsonb;
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
    question_snapshot_value := session.question_snapshot;
    select coalesce(jsonb_agg(jsonb_build_object(
      'id', item->>'id',
      'promptKo', coalesce(item->>'prompt_ko', item->>'promptKo'),
      'labelVi', coalesce(item->>'label_vi', item->>'labelVi'),
      'requirementType', coalesce(item->>'requirement_type', item->>'requirementType'),
      'functionGroup', coalesce(item->>'function_group', item->>'functionGroup')
    ) order by coalesce((item->>'order_index')::integer, 0)), '[]'::jsonb)
    into all_requirement_snapshots
    from jsonb_array_elements(session.requirements_snapshot) item;
  else
    question_snapshot_value := jsonb_build_object(
      'id', q.id,
      'promptKo', q.prompt_ko,
      'subtopicKo', q.subtopic_ko,
      'topicId', q.topic_id
    );
    select coalesce(jsonb_agg(jsonb_build_object(
      'id', r.id,
      'promptKo', r.prompt_ko,
      'labelVi', r.label_vi,
      'requirementType', r.requirement_type,
      'functionGroup', r.function_group
    ) order by r.order_index), '[]'::jsonb)
    into all_requirement_snapshots
    from public.q54_question_requirements r
    where r.question_id = q.id and r.status = 'PUBLISHED';
  end if;

  if jsonb_array_length(all_requirement_snapshots) = 0 then raise exception 'Question has no requirements'; end if;
  if (p_unit_type = 'ESSAY' and p_requirement_id is not null) or (p_unit_type <> 'ESSAY' and p_requirement_id is null) then raise exception 'Invalid requirement for draft type'; end if;
  if p_requirement_id is not null then
    select item into selected_requirement_snapshot
    from jsonb_array_elements(all_requirement_snapshots) item
    where item->>'id' = p_requirement_id::text;
    if selected_requirement_snapshot is null then raise exception 'Requirement not found'; end if;
  end if;
  if p_idea_id is not null and not exists (select 1 from public.q54_ideas where id = p_idea_id and ((visibility = 'PUBLIC' and status = 'PUBLISHED') or created_by = uid)) then raise exception 'Idea not found'; end if;
  if p_parent_draft_id is not null then
    select * into parent from public.q54_writing_drafts where id = p_parent_draft_id and user_id = uid and question_id = q.id and unit_type = p_unit_type;
    if not found then raise exception 'Parent draft not found'; end if;
    draft_no := parent.draft_number + 1;
  end if;

  allowed_requirement_snapshots := case when p_unit_type = 'ESSAY' then all_requirement_snapshots else jsonb_build_array(selected_requirement_snapshot) end;
  assessment_context_value := jsonb_build_object(
    'questionSnapshot', question_snapshot_value,
    'selectedRequirement', case when p_unit_type = 'ESSAY' then null else selected_requirement_snapshot end,
    'requirementsAllowedForAssessment', allowed_requirement_snapshots
  );
  perform public.claim_q54_ai_request('DRAFT_ASSESSMENT');
  insert into public.q54_writing_drafts(user_id, session_id, question_id, requirement_id, idea_id, unit_type, draft_number, parent_draft_id, submission_id, assistance_stage, content_ko, assessment_context_json, state)
  values (uid, p_session_id, q.id, p_requirement_id, p_idea_id, p_unit_type, draft_no, p_parent_draft_id, p_submission_id, p_assistance_stage, trim(p_content_ko), assessment_context_value, 'PROCESSING')
  returning * into draft;
  return jsonb_build_object('claimed', true, 'draft', to_jsonb(draft));
end $$;

create or replace function public.complete_q54_draft_assessment(p_draft_id uuid, p_assessment jsonb, p_provider text, p_model text, p_prompt_version text, p_schema_version text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare draft public.q54_writing_drafts; issue_item jsonb; error_type_value text; error_key_value text; collocation_id_value uuid;
begin
  if coalesce(auth.jwt()->>'role', '') <> 'service_role' then raise exception 'Service role is required'; end if;
  select * into draft from public.q54_writing_drafts where id = p_draft_id for update;
  if not found then raise exception 'Draft not found'; end if;
  if jsonb_typeof(p_assessment) <> 'object' or jsonb_typeof(p_assessment->'coverage') <> 'array' or jsonb_typeof(p_assessment->'issues') <> 'array' then raise exception 'Invalid validated assessment'; end if;
  update public.q54_writing_drafts
  set state = 'ASSESSED', assessment_json = p_assessment, assessment_provider = p_provider, assessment_model = p_model,
      prompt_version = p_prompt_version, schema_version = p_schema_version, failure_code = null, assessed_at = now()
  where id = draft.id
  returning * into draft;

  for issue_item in select value from jsonb_array_elements(p_assessment->'issues') loop
    error_type_value := upper(coalesce(issue_item->>'category', ''));
    if error_type_value not in ('PARTICLE', 'GRAMMAR', 'VOCABULARY', 'COLLOCATION', 'SPELLING') then continue; end if;
    if coalesce(trim(issue_item->>'original'), '') = '' or position(issue_item->>'original' in draft.content_ko) = 0 or coalesce(trim(issue_item->>'corrected'), '') = '' or coalesce(trim(issue_item->>'explanationVi'), '') = '' then continue; end if;
    error_key_value := error_type_value || '|' || lower(issue_item->>'original') || '|' || lower(trim(issue_item->>'corrected'));
    collocation_id_value := null;
    if error_type_value = 'COLLOCATION' then
      select id into collocation_id_value from public.q54_collocations where status = 'PUBLISHED' and expression_ko in (trim(issue_item->>'original'), trim(issue_item->>'corrected')) order by reuse_score desc limit 1;
    end if;
    insert into public.q54_user_errors(user_id, error_key, error_type, original_text, corrected_text, explanation_vi, collocation_id, last_draft_id)
    values (draft.user_id, error_key_value, error_type_value, issue_item->>'original', trim(issue_item->>'corrected'), trim(issue_item->>'explanationVi'), collocation_id_value, draft.id)
    on conflict (user_id, error_key) do update
      set occurrence_count = public.q54_user_errors.occurrence_count + 1, last_seen_at = now(), last_draft_id = excluded.last_draft_id,
          explanation_vi = excluded.explanation_vi, mastered = false;
  end loop;
  if draft.unit_type = 'ESSAY' and draft.session_id is not null then
    update public.q54_training_sessions set status = 'SUBMITTED', submitted_at = now()
    where id = draft.session_id and mode = 'EXAM' and status = 'ACTIVE';
  end if;
  return to_jsonb(draft);
end $$;
