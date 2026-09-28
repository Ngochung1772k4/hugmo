-- Add a fixed semantic taxonomy for Q54 requirements on databases where 00005 is already applied.

update public.q54_question_requirements
set requirement_type = '기타'
where requirement_type not in ('장점', '필요성', '중요성', '긍정적인 영향', '문제점', '부정적인 영향', '부작용', '어려운 이유', '원인', '배경', '노력', '해결 방안', '방법', '바람직한 태도', '역할', '특징', '고려 사항', '기타');

alter table public.q54_question_requirements drop constraint if exists q54_question_requirements_requirement_type_check;
alter table public.q54_question_requirements add constraint q54_question_requirements_requirement_type_check check (requirement_type in ('장점', '필요성', '중요성', '긍정적인 영향', '문제점', '부정적인 영향', '부작용', '어려운 이유', '원인', '배경', '노력', '해결 방안', '방법', '바람직한 태도', '역할', '특징', '고려 사항', '기타'));

create or replace function public.save_q54_private_question(p_topic_id uuid, p_prompt_ko text, p_requirements jsonb, p_source_type text default 'AI_GENERATED')
returns jsonb language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); question public.q54_questions; item jsonb; item_count integer := 0; item_index integer := 0; type_value text;
begin
  if uid is null then raise exception 'Authentication is required'; end if;
  if not exists (select 1 from public.q54_topics where id = p_topic_id and status = 'PUBLISHED') then raise exception 'Topic not found'; end if;
  if p_source_type not in ('MANUAL', 'AI_GENERATED') then raise exception 'Invalid source type'; end if;
  if jsonb_typeof(p_requirements) <> 'array' or jsonb_array_length(p_requirements) < 1 then raise exception 'At least one requirement is required'; end if;
  insert into public.q54_questions(topic_id, created_by, prompt_ko, visibility, status, source_type) values (p_topic_id, uid, trim(p_prompt_ko), 'PRIVATE', 'PUBLISHED', p_source_type) returning * into question;
  for item in select value from jsonb_array_elements(p_requirements) loop
    type_value := trim(item->>'requirementType');
    if coalesce(trim(item->>'promptKo'), '') = '' or coalesce(trim(item->>'labelVi'), '') = '' or type_value not in ('장점', '필요성', '중요성', '긍정적인 영향', '문제점', '부정적인 영향', '부작용', '어려운 이유', '원인', '배경', '노력', '해결 방안', '방법', '바람직한 태도', '역할', '특징', '고려 사항', '기타') or coalesce(trim(item->>'functionGroup'), '') not in ('POSITIVE', 'NEGATIVE', 'CAUSE', 'SOLUTION', 'SPECIAL') then raise exception 'Invalid requirement'; end if;
    insert into public.q54_question_requirements(question_id, order_index, prompt_ko, label_vi, requirement_type, function_group, status, source_type)
    values (question.id, item_index, trim(item->>'promptKo'), trim(item->>'labelVi'), type_value, trim(item->>'functionGroup'), 'PUBLISHED', p_source_type);
    item_index := item_index + 1; item_count := item_count + 1;
  end loop;
  return jsonb_build_object('question', to_jsonb(question), 'requirementCount', item_count);
end $$;

revoke all on function public.save_q54_private_question(uuid, text, jsonb, text) from public;
grant execute on function public.save_q54_private_question(uuid, text, jsonb, text) to authenticated;
