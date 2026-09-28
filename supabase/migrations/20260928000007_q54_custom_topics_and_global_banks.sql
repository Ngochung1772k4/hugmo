-- Q54 private topics and scoped bank fallback. Run after 00005 and 00006.

alter table public.q54_topics add column if not exists created_by uuid references auth.users(id) on delete cascade;
alter table public.q54_topics add column if not exists visibility text not null default 'PUBLIC';
alter table public.q54_topics drop constraint if exists q54_topics_visibility_check;
alter table public.q54_topics add constraint q54_topics_visibility_check check (visibility in ('PUBLIC', 'PRIVATE'));
update public.q54_topics set visibility = 'PUBLIC' where visibility is null;

alter table public.q54_questions add column if not exists subtopic_ko text;
alter table public.q54_collocations add column if not exists function_group text;
alter table public.q54_collocations drop constraint if exists q54_collocations_function_group_check;
alter table public.q54_collocations add constraint q54_collocations_function_group_check check (function_group is null or function_group in ('POSITIVE', 'NEGATIVE', 'CAUSE', 'SOLUTION', 'SPECIAL'));
create index if not exists idx_q54_collocations_function_group on public.q54_collocations(function_group, reuse_score desc);
create index if not exists idx_q54_topics_owner on public.q54_topics(created_by) where visibility = 'PRIVATE';

drop policy if exists "read published q54 topics" on public.q54_topics;
create policy "read q54 topics" on public.q54_topics for select to authenticated using ((visibility = 'PUBLIC' and status = 'PUBLISHED') or created_by = auth.uid());
drop policy if exists "read published q54 collocation topics" on public.q54_collocation_topics;
create policy "read scoped q54 collocation topics" on public.q54_collocation_topics for select to authenticated using (
  exists (select 1 from public.q54_collocations c where c.id = collocation_id and c.status = 'PUBLISHED')
  and exists (select 1 from public.q54_topics t where t.id = topic_id and ((t.visibility = 'PUBLIC' and t.status = 'PUBLISHED') or t.created_by = auth.uid()))
);

create or replace function public.q54_group_for_requirement_type(p_type text)
returns text language sql immutable as $$
  select case p_type
    when '장점' then 'POSITIVE' when '필요성' then 'POSITIVE' when '중요성' then 'POSITIVE' when '긍정적인 영향' then 'POSITIVE'
    when '문제점' then 'NEGATIVE' when '부정적인 영향' then 'NEGATIVE' when '부작용' then 'NEGATIVE'
    when '원인' then 'CAUSE' when '배경' then 'CAUSE' when '어려운 이유' then 'CAUSE'
    when '노력' then 'SOLUTION' when '해결 방안' then 'SOLUTION' when '방법' then 'SOLUTION' when '바람직한 태도' then 'SOLUTION'
    else 'SPECIAL'
  end
$$;

create or replace function public.save_q54_private_question_with_topic(
  p_topic_slug text,
  p_topic_name_ko text,
  p_topic_name_vi text,
  p_subtopic_ko text,
  p_prompt_ko text,
  p_requirements jsonb,
  p_source_type text default 'AI_GENERATED'
)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  topic public.q54_topics;
  question public.q54_questions;
  item jsonb;
  item_count integer := 0;
  item_index integer := 0;
  type_value text;
  slug_base text;
begin
  if uid is null then raise exception 'Authentication is required'; end if;
  if coalesce(trim(p_topic_name_ko), '') = '' or coalesce(trim(p_topic_name_vi), '') = '' then raise exception 'A topic is required'; end if;
  if char_length(trim(coalesce(p_prompt_ko, ''))) not between 1 and 4000 then raise exception 'Invalid prompt'; end if;
  if p_source_type not in ('MANUAL', 'AI_GENERATED') then raise exception 'Invalid source type'; end if;
  if jsonb_typeof(p_requirements) <> 'array' or jsonb_array_length(p_requirements) < 1 then raise exception 'At least one requirement is required'; end if;

  select * into topic from public.q54_topics
  where slug = trim(p_topic_slug) and visibility = 'PUBLIC' and status = 'PUBLISHED'
  limit 1;
  if not found then
    select * into topic from public.q54_topics
    where created_by = uid and visibility = 'PRIVATE' and name_ko = trim(p_topic_name_ko)
    limit 1;
  end if;
  if not found then
    slug_base := nullif(regexp_replace(lower(trim(p_topic_slug)), '[^a-z0-9-]', '', 'g'), '');
    slug_base := coalesce(slug_base, 'custom-topic');
    insert into public.q54_topics(slug, name_ko, name_vi, description_vi, visibility, created_by, status, source_type)
    values ('private-' || substr(replace(uid::text, '-', ''), 1, 8) || '-' || slug_base, trim(p_topic_name_ko), trim(p_topic_name_vi), null, 'PRIVATE', uid, 'PUBLISHED', p_source_type)
    returning * into topic;
  end if;

  insert into public.q54_questions(topic_id, created_by, subtopic_ko, prompt_ko, visibility, status, source_type)
  values (topic.id, uid, nullif(trim(coalesce(p_subtopic_ko, '')), ''), trim(p_prompt_ko), 'PRIVATE', 'PUBLISHED', p_source_type)
  returning * into question;

  for item in select value from jsonb_array_elements(p_requirements) loop
    type_value := trim(item->>'requirementType');
    if coalesce(trim(item->>'promptKo'), '') = '' or coalesce(trim(item->>'labelVi'), '') = '' or type_value not in ('장점', '필요성', '중요성', '긍정적인 영향', '문제점', '부정적인 영향', '부작용', '어려운 이유', '원인', '배경', '노력', '해결 방안', '방법', '바람직한 태도', '역할', '특징', '고려 사항', '기타') then
      raise exception 'Invalid requirement';
    end if;
    insert into public.q54_question_requirements(question_id, order_index, prompt_ko, label_vi, requirement_type, function_group, status, source_type)
    values (question.id, item_index, trim(item->>'promptKo'), trim(item->>'labelVi'), type_value, public.q54_group_for_requirement_type(type_value), 'PUBLISHED', p_source_type);
    item_index := item_index + 1;
    item_count := item_count + 1;
  end loop;
  return jsonb_build_object('topic', to_jsonb(topic), 'question', to_jsonb(question), 'requirementCount', item_count);
end $$;

revoke all on function public.save_q54_private_question_with_topic(text, text, text, text, text, jsonb, text) from public;
grant execute on function public.save_q54_private_question_with_topic(text, text, text, text, text, jsonb, text) to authenticated;

update public.q54_collocations
set function_group = case expression_ko
  when '환경을 보호하다' then 'SOLUTION'
  when '건강 문제를 유발하다' then 'NEGATIVE'
  when '부정적인 영향을 미치다' then 'NEGATIVE'
  when '삶의 질을 향상시키다' then 'POSITIVE'
  when '일회용품 사용을 줄이다' then 'SOLUTION'
  when '환경 교육을 강화하다' then 'SOLUTION'
  when '친환경 정책을 마련하다' then 'SOLUTION'
  when '생태계를 보전하다' then 'SOLUTION'
  else function_group
end;

insert into public.q54_collocations(expression_ko, meaning_vi, reuse_score, function_group, status, source_type) values
  ('~는 데 도움이 된다', 'giúp ích cho việc ~', 5, 'POSITIVE', 'PUBLISHED', 'MANUAL'),
  ('~에 기여하다', 'đóng góp vào ~', 5, 'POSITIVE', 'PUBLISHED', 'MANUAL'),
  ('~에 긍정적인 영향을 미치다', 'tạo ảnh hưởng tích cực đến ~', 5, 'POSITIVE', 'PUBLISHED', 'MANUAL'),
  ('~는 데 중요한 역할을 한다', 'đóng vai trò quan trọng trong việc ~', 5, 'POSITIVE', 'PUBLISHED', 'MANUAL'),
  ('~을 줄이다', 'giảm ~', 4, 'POSITIVE', 'PUBLISHED', 'MANUAL'),
  ('~을 높이다', 'nâng cao ~', 4, 'POSITIVE', 'PUBLISHED', 'MANUAL'),
  ('~기 때문이다', 'bởi vì ~', 5, 'CAUSE', 'PUBLISHED', 'MANUAL'),
  ('~으로 인해', 'do ~', 5, 'CAUSE', 'PUBLISHED', 'MANUAL'),
  ('~의 영향으로', 'do ảnh hưởng của ~', 4, 'CAUSE', 'PUBLISHED', 'MANUAL'),
  ('~이 부족하다', '~ còn thiếu', 4, 'CAUSE', 'PUBLISHED', 'MANUAL'),
  ('~할 필요가 있다', 'cần phải ~', 5, 'SOLUTION', 'PUBLISHED', 'MANUAL'),
  ('~해야 한다', 'phải ~', 5, 'SOLUTION', 'PUBLISHED', 'MANUAL'),
  ('~을 강화하다', 'tăng cường ~', 4, 'SOLUTION', 'PUBLISHED', 'MANUAL'),
  ('~을 마련하다', 'đề ra/chuẩn bị ~', 4, 'SOLUTION', 'PUBLISHED', 'MANUAL'),
  ('~을 개선하다', 'cải thiện ~', 4, 'SOLUTION', 'PUBLISHED', 'MANUAL')
on conflict (expression_ko) do update set meaning_vi = excluded.meaning_vi, reuse_score = excluded.reuse_score, function_group = excluded.function_group, status = excluded.status, source_type = excluded.source_type;
