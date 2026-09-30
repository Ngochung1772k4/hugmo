-- Expanded Q54 Idea Bank: reusable seed units plus owner-only AI additions.

alter table public.q54_ideas alter column topic_id drop not null;
alter table public.q54_ideas add column if not exists seed_key text;
alter table public.q54_ideas add column if not exists scope text not null default 'TOPIC';
alter table public.q54_ideas add column if not exists requirement_types text[] not null default '{}';
alter table public.q54_ideas add column if not exists subtopic_tags jsonb not null default '[]'::jsonb;
alter table public.q54_ideas add column if not exists reason_ko text;
alter table public.q54_ideas add column if not exists reason_vi text;
alter table public.q54_ideas add column if not exists result_ko text;
alter table public.q54_ideas add column if not exists result_vi text;
alter table public.q54_ideas add column if not exists expansion_ko text;
alter table public.q54_ideas add column if not exists expansion_vi text;
alter table public.q54_ideas add column if not exists logic_chain_ko jsonb;
alter table public.q54_ideas add column if not exists logic_chain_vi jsonb;
alter table public.q54_ideas add column if not exists recommended_collocations jsonb;
alter table public.q54_ideas add column if not exists reuse_score integer;
alter table public.q54_ideas add column if not exists difficulty text;
alter table public.q54_ideas add column if not exists created_by uuid references auth.users(id) on delete cascade;
alter table public.q54_ideas add column if not exists visibility text not null default 'PUBLIC';

alter table public.q54_ideas drop constraint if exists q54_ideas_scope_check;
alter table public.q54_ideas add constraint q54_ideas_scope_check check (scope in ('GLOBAL', 'TOPIC'));
alter table public.q54_ideas drop constraint if exists q54_ideas_visibility_check;
alter table public.q54_ideas add constraint q54_ideas_visibility_check check (visibility in ('PUBLIC', 'PRIVATE'));
alter table public.q54_ideas drop constraint if exists q54_ideas_difficulty_check;
alter table public.q54_ideas add constraint q54_ideas_difficulty_check check (difficulty is null or difficulty in ('EASY', 'NORMAL', 'ADVANCED'));
alter table public.q54_ideas drop constraint if exists q54_ideas_subtopic_tags_array;
alter table public.q54_ideas add constraint q54_ideas_subtopic_tags_array check (jsonb_typeof(subtopic_tags) = 'array');
alter table public.q54_ideas drop constraint if exists q54_ideas_logic_chain_ko_array;
alter table public.q54_ideas add constraint q54_ideas_logic_chain_ko_array check (logic_chain_ko is null or jsonb_typeof(logic_chain_ko) = 'array');
alter table public.q54_ideas drop constraint if exists q54_ideas_logic_chain_vi_array;
alter table public.q54_ideas add constraint q54_ideas_logic_chain_vi_array check (logic_chain_vi is null or jsonb_typeof(logic_chain_vi) = 'array');
alter table public.q54_ideas drop constraint if exists q54_ideas_recommended_collocations_array;
alter table public.q54_ideas add constraint q54_ideas_recommended_collocations_array check (recommended_collocations is null or jsonb_typeof(recommended_collocations) = 'array');
alter table public.q54_ideas drop constraint if exists q54_ideas_scope_topic_check;
alter table public.q54_ideas add constraint q54_ideas_scope_topic_check check ((scope = 'GLOBAL' and topic_id is null) or (scope = 'TOPIC' and topic_id is not null));
alter table public.q54_ideas drop constraint if exists q54_ideas_expanded_seed_check;
alter table public.q54_ideas add constraint q54_ideas_expanded_seed_check check (
  seed_key is null or (
    cardinality(requirement_types) > 0
    and coalesce(trim(reason_ko), '') <> '' and coalesce(trim(reason_vi), '') <> ''
    and coalesce(trim(result_ko), '') <> '' and coalesce(trim(result_vi), '') <> ''
    and jsonb_array_length(logic_chain_ko) between 3 and 4
    and jsonb_array_length(logic_chain_vi) = jsonb_array_length(logic_chain_ko)
    and jsonb_array_length(recommended_collocations) between 2 and 4
    and reuse_score between 1 and 5 and difficulty is not null
  )
);

update public.q54_ideas set scope = 'TOPIC' where scope is null;
update public.q54_ideas set visibility = 'PUBLIC' where visibility is null;
create unique index if not exists uq_q54_ideas_seed_key on public.q54_ideas(seed_key) where seed_key is not null;
create index if not exists idx_q54_ideas_retrieval on public.q54_ideas(scope, topic_id, function_group, reuse_score desc) where status = 'PUBLISHED';
create index if not exists idx_q54_ideas_private_owner on public.q54_ideas(created_by, topic_id) where visibility = 'PRIVATE';

drop policy if exists "read published q54 ideas" on public.q54_ideas;
drop policy if exists "read q54 ideas" on public.q54_ideas;
create policy "read q54 ideas" on public.q54_ideas for select to authenticated
  using ((visibility = 'PUBLIC' and status = 'PUBLISHED') or (visibility = 'PRIVATE' and created_by = auth.uid()));

alter table public.q54_ai_request_logs drop constraint if exists q54_ai_request_logs_request_kind_check;
alter table public.q54_ai_request_logs add constraint q54_ai_request_logs_request_kind_check check (request_kind in ('QUESTION_ANALYSIS', 'SENTENCE_ASSESSMENT', 'TRANSLATION_GENERATION', 'TRANSLATION_HINT', 'IDEA_GENERATION'));

create or replace function public.claim_q54_ai_request(p_request_kind text)
returns void language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); recent_count integer;
begin
  if uid is null then raise exception 'Authentication is required'; end if;
  if p_request_kind not in ('TRANSLATION_GENERATION', 'TRANSLATION_HINT', 'IDEA_GENERATION') then raise exception 'Invalid Q54 AI request kind'; end if;
  perform pg_advisory_xact_lock(hashtextextended(uid::text, 54));
  select count(*) into recent_count from public.q54_ai_request_logs where user_id = uid and created_at >= now() - interval '5 minutes';
  if recent_count >= 5 then raise exception 'Q54_RATE_LIMIT_SHORT'; end if;
  select count(*) into recent_count from public.q54_ai_request_logs where user_id = uid and created_at >= now() - interval '24 hours';
  if recent_count >= 30 then raise exception 'Q54_RATE_LIMIT_DAILY'; end if;
  insert into public.q54_ai_request_logs(user_id, request_kind) values (uid, p_request_kind);
end $$;

create or replace function public.create_q54_private_generated_ideas(p_question_id uuid, p_requirement_id uuid, p_ideas jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  question public.q54_questions;
  requirement public.q54_question_requirements;
  item jsonb;
  inserted jsonb := '[]'::jsonb;
  idea public.q54_ideas;
  idea_count integer := 0;
begin
  if uid is null then raise exception 'Authentication is required'; end if;
  if jsonb_typeof(p_ideas) <> 'array' or jsonb_array_length(p_ideas) <> 3 then raise exception 'Exactly three ideas are required'; end if;
  select * into question from public.q54_questions where id = p_question_id and ((visibility = 'PUBLIC' and status = 'PUBLISHED') or created_by = uid);
  if not found or question.topic_id is null then raise exception 'Question not found'; end if;
  select * into requirement from public.q54_question_requirements where id = p_requirement_id and question_id = question.id and status = 'PUBLISHED';
  if not found then raise exception 'Requirement not found'; end if;
  for item in select value from jsonb_array_elements(p_ideas) loop
    if coalesce(trim(item->>'keywordKo'), '') = '' or coalesce(trim(item->>'keywordVi'), '') = ''
       or coalesce(trim(item->>'reasonKo'), '') = '' or coalesce(trim(item->>'reasonVi'), '') = ''
       or coalesce(trim(item->>'resultKo'), '') = '' or coalesce(trim(item->>'resultVi'), '') = ''
       or jsonb_typeof(item->'logicChainKo') <> 'array' or jsonb_array_length(item->'logicChainKo') not between 3 and 4
       or jsonb_typeof(item->'logicChainVi') <> 'array' or jsonb_array_length(item->'logicChainVi') <> jsonb_array_length(item->'logicChainKo')
       or jsonb_typeof(item->'recommendedCollocations') <> 'array' or jsonb_array_length(item->'recommendedCollocations') not between 2 and 4 then
      raise exception 'Invalid generated idea';
    end if;
    insert into public.q54_ideas(topic_id, requirement_id, scope, requirement_types, subtopic_tags, function_group, keyword_ko, keyword_vi, reason_ko, reason_vi, result_ko, result_vi, expansion_ko, expansion_vi, logic_steps, logic_chain_ko, logic_chain_vi, recommended_collocations, reuse_score, difficulty, visibility, created_by, status, source_type)
    values (question.topic_id, requirement.id, 'TOPIC', array[requirement.requirement_type], '[]'::jsonb, requirement.function_group, trim(item->>'keywordKo'), trim(item->>'keywordVi'), trim(item->>'reasonKo'), trim(item->>'reasonVi'), trim(item->>'resultKo'), trim(item->>'resultVi'), nullif(trim(item->>'expansionKo'), ''), nullif(trim(item->>'expansionVi'), ''), item->'logicChainKo', item->'logicChainKo', item->'logicChainVi', item->'recommendedCollocations', 3, 'NORMAL', 'PRIVATE', uid, 'PUBLISHED', 'AI_GENERATED')
    returning * into idea;
    inserted := inserted || jsonb_build_array(to_jsonb(idea));
    idea_count := idea_count + 1;
  end loop;
  if idea_count <> 3 then raise exception 'Exactly three ideas are required'; end if;
  return inserted;
end $$;

revoke all on function public.claim_q54_ai_request(text) from public;
revoke all on function public.create_q54_private_generated_ideas(uuid, uuid, jsonb) from public;
grant execute on function public.claim_q54_ai_request(text), public.create_q54_private_generated_ideas(uuid, uuid, jsonb) to authenticated;
