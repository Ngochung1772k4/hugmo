begin;

insert into public.q54_topics(slug, name_ko, name_vi, description_vi, status, source_type)
values ('environment', '환경', 'Môi trường', 'Ý tưởng, collocation và cấu trúc dùng để viết về bảo vệ môi trường.', 'PUBLISHED', 'MANUAL')
on conflict (slug) do update set name_ko = excluded.name_ko, name_vi = excluded.name_vi, description_vi = excluded.description_vi, status = excluded.status, source_type = excluded.source_type;

do $$
declare v_topic_id uuid; v_question_id uuid; v_r_positive uuid; v_r_negative uuid; v_r_solution uuid; v_pattern_id uuid;
begin
  select id into v_topic_id from public.q54_topics where slug = 'environment';
  insert into public.q54_questions(topic_id, prompt_ko, visibility, status, source_type)
  values (v_topic_id, '환경 보호가 중요한 이유는 무엇인가? 환경 문제가 심해지면 어떤 문제가 생길 수 있는가? 환경을 보호하기 위해 개인과 사회는 어떤 노력을 해야 하는가?', 'PUBLIC', 'PUBLISHED', 'MANUAL')
  on conflict do nothing;
  select q.id into v_question_id from public.q54_questions q where q.topic_id = v_topic_id and q.visibility = 'PUBLIC' and q.prompt_ko like '환경 보호가 중요한 이유는 무엇인가?%' order by q.created_at limit 1;

  insert into public.q54_question_requirements(question_id, order_index, prompt_ko, label_vi, requirement_type, function_group, status, source_type)
  values
    (v_question_id, 0, '환경 보호가 중요한 이유는 무엇인가?', 'Tầm quan trọng của bảo vệ môi trường', '중요성', 'POSITIVE', 'PUBLISHED', 'MANUAL'),
    (v_question_id, 1, '환경 문제가 심해지면 어떤 문제가 생길 수 있는가?', 'Vấn đề khi môi trường bị suy thoái', '문제점', 'NEGATIVE', 'PUBLISHED', 'MANUAL'),
    (v_question_id, 2, '환경을 보호하기 위해 개인과 사회는 어떤 노력을 해야 하는가?', 'Nỗ lực và giải pháp bảo vệ môi trường', '노력', 'SOLUTION', 'PUBLISHED', 'MANUAL')
  on conflict (question_id, order_index) do update set prompt_ko = excluded.prompt_ko, label_vi = excluded.label_vi, requirement_type = excluded.requirement_type, function_group = excluded.function_group, status = excluded.status, source_type = excluded.source_type;
  select r.id into v_r_positive from public.q54_question_requirements r where r.question_id = v_question_id and r.order_index = 0;
  select r.id into v_r_negative from public.q54_question_requirements r where r.question_id = v_question_id and r.order_index = 1;
  select r.id into v_r_solution from public.q54_question_requirements r where r.question_id = v_question_id and r.order_index = 2;

  delete from public.q54_ideas where requirement_id in (v_r_positive, v_r_negative, v_r_solution);
  insert into public.q54_ideas(topic_id, requirement_id, function_group, keyword_ko, keyword_vi, logic_steps, status, source_type) values
    (v_topic_id, v_r_positive, 'POSITIVE', '삶의 질 향상', 'Nâng cao chất lượng cuộc sống', '["깨끗한 공기와 물", "건강 보호", "삶의 질 향상"]', 'PUBLISHED', 'MANUAL'),
    (v_topic_id, v_r_positive, 'POSITIVE', '미래 세대', 'Thế hệ tương lai', '["현재의 환경 보호", "자원 보존", "미래 세대의 생활"]', 'PUBLISHED', 'MANUAL'),
    (v_topic_id, v_r_positive, 'POSITIVE', '생태계 보전', 'Bảo tồn hệ sinh thái', '["동식물 보호", "생태계 균형", "지속 가능한 사회"]', 'PUBLISHED', 'MANUAL'),
    (v_topic_id, v_r_negative, 'NEGATIVE', '건강 문제', 'Vấn đề sức khỏe', '["대기와 물 오염", "유해 물질 노출", "건강 문제"]', 'PUBLISHED', 'MANUAL'),
    (v_topic_id, v_r_negative, 'NEGATIVE', '자연재해', 'Thiên tai', '["기후 변화", "이상 기후 증가", "자연재해 피해"]', 'PUBLISHED', 'MANUAL'),
    (v_topic_id, v_r_negative, 'NEGATIVE', '경제적 피해', 'Thiệt hại kinh tế', '["환경 파괴", "복구 비용 증가", "경제적 피해"]', 'PUBLISHED', 'MANUAL'),
    (v_topic_id, v_r_solution, 'SOLUTION', '일회용품 사용 줄이기', 'Giảm sử dụng đồ dùng một lần', '["불필요한 소비 줄이기", "쓰레기 감소", "환경 부담 완화"]', 'PUBLISHED', 'MANUAL'),
    (v_topic_id, v_r_solution, 'SOLUTION', '환경 교육 강화', 'Tăng cường giáo dục môi trường', '["환경 문제 인식", "실천 방법 학습", "지속적인 행동"]', 'PUBLISHED', 'MANUAL'),
    (v_topic_id, v_r_solution, 'SOLUTION', '친환경 정책 마련', 'Xây dựng chính sách thân thiện môi trường', '["제도 마련", "기업과 시민 참여", "사회적 변화"]', 'PUBLISHED', 'MANUAL');

  insert into public.q54_collocations(expression_ko, meaning_vi, reuse_score, status, source_type) values
    ('환경을 보호하다', 'bảo vệ môi trường', 5, 'PUBLISHED', 'MANUAL'), ('건강 문제를 유발하다', 'gây ra vấn đề sức khỏe', 5, 'PUBLISHED', 'MANUAL'),
    ('부정적인 영향을 미치다', 'gây ảnh hưởng tiêu cực', 5, 'PUBLISHED', 'MANUAL'), ('삶의 질을 향상시키다', 'nâng cao chất lượng cuộc sống', 5, 'PUBLISHED', 'MANUAL'),
    ('일회용품 사용을 줄이다', 'giảm sử dụng đồ dùng một lần', 4, 'PUBLISHED', 'MANUAL'), ('환경 교육을 강화하다', 'tăng cường giáo dục môi trường', 5, 'PUBLISHED', 'MANUAL'),
    ('친환경 정책을 마련하다', 'xây dựng chính sách thân thiện môi trường', 5, 'PUBLISHED', 'MANUAL'), ('생태계를 보전하다', 'bảo tồn hệ sinh thái', 4, 'PUBLISHED', 'MANUAL')
  on conflict (expression_ko) do update set meaning_vi = excluded.meaning_vi, reuse_score = excluded.reuse_score, status = excluded.status, source_type = excluded.source_type;
  insert into public.q54_collocation_topics(collocation_id, topic_id) select c.id, v_topic_id from public.q54_collocations c where c.expression_ko in ('환경을 보호하다','건강 문제를 유발하다','부정적인 영향을 미치다','삶의 질을 향상시키다','일회용품 사용을 줄이다','환경 교육을 강화하다','친환경 정책을 마련하다','생태계를 보전하다') on conflict do nothing;

  insert into public.q54_sentence_patterns(function_group, pattern_ko, meaning_vi, difficulty, reuse_score, status, source_type) values
    ('POSITIVE', 'N은/는 V-는 데 중요한 역할을 한다.', 'N đóng vai trò quan trọng trong việc V.', 'INTERMEDIATE', 5, 'PUBLISHED', 'MANUAL'),
    ('NEGATIVE', 'N은/는 N을 유발할 수 있다.', 'N có thể gây ra N.', 'INTERMEDIATE', 5, 'PUBLISHED', 'MANUAL'),
    ('NEGATIVE', 'N에 부정적인 영향을 미치다.', 'Gây ảnh hưởng tiêu cực đến N.', 'INTERMEDIATE', 5, 'PUBLISHED', 'MANUAL'),
    ('SOLUTION', 'V-기 위해서는 N할 필요가 있다.', 'Để V, cần phải N.', 'INTERMEDIATE', 5, 'PUBLISHED', 'MANUAL'),
    ('SOLUTION', 'N을/를 강화하다.', 'Tăng cường N.', 'INTERMEDIATE', 4, 'PUBLISHED', 'MANUAL')
  on conflict (pattern_ko) do update set meaning_vi = excluded.meaning_vi, difficulty = excluded.difficulty, reuse_score = excluded.reuse_score, status = excluded.status, source_type = excluded.source_type;

  delete from public.q54_pattern_examples e where e.topic_id = v_topic_id;
  select p.id into v_pattern_id from public.q54_sentence_patterns p where p.pattern_ko = 'N은/는 V-는 데 중요한 역할을 한다.';
  insert into public.q54_pattern_examples(pattern_id, topic_id, sentence_ko, translation_vi, status, source_type) values (v_pattern_id, v_topic_id, '환경 보호는 삶의 질을 향상시키는 데 중요한 역할을 한다.', 'Bảo vệ môi trường đóng vai trò quan trọng trong việc nâng cao chất lượng cuộc sống.', 'PUBLISHED', 'MANUAL');
  select p.id into v_pattern_id from public.q54_sentence_patterns p where p.pattern_ko = 'N은/는 N을 유발할 수 있다.';
  insert into public.q54_pattern_examples(pattern_id, topic_id, sentence_ko, translation_vi, status, source_type) values (v_pattern_id, v_topic_id, '대기 오염은 여러 건강 문제를 유발할 수 있다.', 'Ô nhiễm không khí có thể gây ra nhiều vấn đề sức khỏe.', 'PUBLISHED', 'MANUAL');
  select p.id into v_pattern_id from public.q54_sentence_patterns p where p.pattern_ko = 'V-기 위해서는 N할 필요가 있다.';
  insert into public.q54_pattern_examples(pattern_id, topic_id, sentence_ko, translation_vi, status, source_type) values (v_pattern_id, v_topic_id, '환경을 보호하기 위해서는 일회용품 사용을 줄일 필요가 있다.', 'Để bảo vệ môi trường, cần giảm sử dụng đồ dùng một lần.', 'PUBLISHED', 'MANUAL');

  delete from public.q54_translation_exercises where requirement_id in (v_r_positive, v_r_negative, v_r_solution);
  insert into public.q54_translation_exercises(topic_id, requirement_id, prompt_vi, reference_answer_ko, vocabulary_hint, pattern_hint, sample_sentence_ko, status, source_type) values
    (v_topic_id, v_r_positive, 'Bảo vệ môi trường đóng vai trò quan trọng trong việc nâng cao chất lượng cuộc sống.', '환경 보호는 삶의 질을 향상시키는 데 중요한 역할을 한다.', '["환경 보호", "삶의 질", "향상시키다"]', 'N은/는 V-는 데 중요한 역할을 한다.', '깨끗한 환경은 건강한 생활을 하는 데 도움이 된다.', 'PUBLISHED', 'MANUAL'),
    (v_topic_id, v_r_negative, 'Ô nhiễm không khí có thể gây ra nhiều vấn đề sức khỏe.', '대기 오염은 여러 건강 문제를 유발할 수 있다.', '["대기 오염", "건강 문제", "유발하다"]', 'N은/는 N을 유발할 수 있다.', '수질 오염은 사람들의 건강에 나쁜 영향을 미친다.', 'PUBLISHED', 'MANUAL'),
    (v_topic_id, v_r_solution, 'Để bảo vệ môi trường, cần giảm sử dụng đồ dùng một lần.', '환경을 보호하기 위해서는 일회용품 사용을 줄일 필요가 있다.', '["환경을 보호하다", "일회용품", "줄이다"]', 'V-기 위해서는 N할 필요가 있다.', '환경 문제를 해결하기 위해서는 시민들의 참여가 필요하다.', 'PUBLISHED', 'MANUAL');
end $$;

do $$
declare topic_count integer; question_count integer; requirement_count integer; exercise_count integer;
begin
  select count(*) into topic_count from public.q54_topics where slug = 'environment' and status = 'PUBLISHED';
  select count(*) into question_count from public.q54_questions q join public.q54_topics t on t.id = q.topic_id where t.slug = 'environment' and q.status = 'PUBLISHED';
  select count(*) into requirement_count from public.q54_question_requirements r join public.q54_questions q on q.id = r.question_id join public.q54_topics t on t.id = q.topic_id where t.slug = 'environment' and r.status = 'PUBLISHED';
  select count(*) into exercise_count from public.q54_translation_exercises e join public.q54_topics t on t.id = e.topic_id where t.slug = 'environment' and e.status = 'PUBLISHED';
  if topic_count <> 1 or question_count < 1 or requirement_count < 3 or exercise_count < 3 then raise exception 'Q54 environment seed validation failed: topics %, questions %, requirements %, exercises %', topic_count, question_count, requirement_count, exercise_count; end if;
end $$;

commit;
