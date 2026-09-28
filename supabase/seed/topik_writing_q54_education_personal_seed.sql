-- Curated Q54 Content Bank for education/self-development and personal data/digital society.
-- Run after migrations 00005 through 00009.

begin;

insert into public.q54_topics(slug, name_ko, name_vi, description_vi, visibility, status, source_type)
values
  ('education-self-development', '교육 / 자기계발', 'Giáo dục / Phát triển bản thân', 'Ý tưởng, collocation và cấu trúc viết về học tập, trải nghiệm và phát triển bản thân.', 'PUBLIC', 'PUBLISHED', 'MANUAL'),
  ('personal-data-digital-society', '개인정보 / 디지털 사회', 'Thông tin cá nhân / Xã hội số', 'Ý tưởng, collocation và cấu trúc viết về bảo vệ thông tin cá nhân và đời sống số an toàn.', 'PUBLIC', 'PUBLISHED', 'MANUAL')
on conflict (slug) do update set
  name_ko = excluded.name_ko,
  name_vi = excluded.name_vi,
  description_vi = excluded.description_vi,
  visibility = excluded.visibility,
  status = excluded.status,
  source_type = excluded.source_type;

-- These are global patterns. Topic mappings below decide where they are surfaced first.
insert into public.q54_sentence_patterns(function_group, pattern_ko, meaning_vi, difficulty, reuse_score, status, source_type)
values
  ('POSITIVE', 'N은/는 V-는 데 도움이 된다.', 'N giúp ích cho việc V.', 'INTERMEDIATE', 5, 'PUBLISHED', 'MANUAL'),
  ('POSITIVE', 'N은/는 V-는 데 중요한 역할을 한다.', 'N đóng vai trò quan trọng trong việc V.', 'INTERMEDIATE', 5, 'PUBLISHED', 'MANUAL'),
  ('POSITIVE', 'N은/는 N에 기여한다.', 'N đóng góp vào N.', 'INTERMEDIATE', 5, 'PUBLISHED', 'MANUAL'),
  ('POSITIVE', 'N은/는 N에 긍정적인 영향을 미친다.', 'N tạo ảnh hưởng tích cực đến N.', 'INTERMEDIATE', 5, 'PUBLISHED', 'MANUAL'),
  ('NEGATIVE', 'N은/는 N을 유발할 수 있다.', 'N có thể gây ra N.', 'INTERMEDIATE', 5, 'PUBLISHED', 'MANUAL'),
  ('NEGATIVE', 'N은/는 N에 부정적인 영향을 미칠 수 있다.', 'N có thể gây ảnh hưởng tiêu cực đến N.', 'INTERMEDIATE', 5, 'PUBLISHED', 'MANUAL'),
  ('NEGATIVE', 'N은/는 N으로 이어질 수 있다.', 'N có thể dẫn đến N.', 'INTERMEDIATE', 5, 'PUBLISHED', 'MANUAL'),
  ('CAUSE', 'N 때문에 N하기 어렵다.', 'Vì N nên khó làm N.', 'INTERMEDIATE', 5, 'PUBLISHED', 'MANUAL'),
  ('CAUSE', 'N으로 인해 N이 부족하다.', 'Do N nên thiếu N.', 'INTERMEDIATE', 5, 'PUBLISHED', 'MANUAL'),
  ('CAUSE', 'N의 영향으로 N이 증가하고 있다.', 'Do ảnh hưởng của N, N đang gia tăng.', 'INTERMEDIATE', 5, 'PUBLISHED', 'MANUAL'),
  ('SOLUTION', 'V-기 위해서는 N할 필요가 있다.', 'Để V, cần phải N.', 'INTERMEDIATE', 5, 'PUBLISHED', 'MANUAL'),
  ('SOLUTION', 'N을/를 강화해야 한다.', 'Cần tăng cường N.', 'INTERMEDIATE', 5, 'PUBLISHED', 'MANUAL')
on conflict (pattern_ko) do update set
  function_group = excluded.function_group,
  meaning_vi = excluded.meaning_vi,
  difficulty = excluded.difficulty,
  reuse_score = excluded.reuse_score,
  status = excluded.status,
  source_type = excluded.source_type;

insert into public.q54_collocations(expression_ko, meaning_vi, reuse_score, function_group, status, source_type)
values
  -- Education / self-development: 23 scoped collocations.
  ('사고력을 기르다', 'rèn luyện khả năng tư duy', 4, 'POSITIVE', 'PUBLISHED', 'MANUAL'),
  ('정보 활용 능력을 기르다', 'phát triển năng lực sử dụng thông tin', 4, 'POSITIVE', 'PUBLISHED', 'MANUAL'),
  ('지식을 습득하다', 'tiếp thu kiến thức', 5, 'POSITIVE', 'PUBLISHED', 'MANUAL'),
  ('경험을 쌓다', 'tích lũy kinh nghiệm', 5, 'POSITIVE', 'PUBLISHED', 'MANUAL'),
  ('개인의 성장에 기여하다', 'đóng góp vào sự phát triển cá nhân', 5, 'POSITIVE', 'PUBLISHED', 'MANUAL'),
  ('진로 선택에 도움을 주다', 'hỗ trợ lựa chọn nghề nghiệp', 4, 'POSITIVE', 'PUBLISHED', 'MANUAL'),
  ('학습 부담이 커지다', 'áp lực học tập tăng lên', 4, 'NEGATIVE', 'PUBLISHED', 'MANUAL'),
  ('집중력이 떨어지다', 'khả năng tập trung giảm', 4, 'NEGATIVE', 'PUBLISHED', 'MANUAL'),
  ('지나친 경쟁을 유발하다', 'gây ra cạnh tranh quá mức', 4, 'NEGATIVE', 'PUBLISHED', 'MANUAL'),
  ('직접적인 소통이 줄어들다', 'giao tiếp trực tiếp giảm', 3, 'NEGATIVE', 'PUBLISHED', 'MANUAL'),
  ('교육 격차가 커지다', 'khoảng cách giáo dục gia tăng', 4, 'NEGATIVE', 'PUBLISHED', 'MANUAL'),
  ('경제적 부담이 늘어나다', 'gánh nặng kinh tế tăng', 5, 'NEGATIVE', 'PUBLISHED', 'MANUAL'),
  ('학습 동기가 부족하다', 'thiếu động lực học tập', 4, 'CAUSE', 'PUBLISHED', 'MANUAL'),
  ('학습 시간이 부족하다', 'thiếu thời gian học tập', 4, 'CAUSE', 'PUBLISHED', 'MANUAL'),
  ('진로 정보가 부족하다', 'thiếu thông tin nghề nghiệp', 3, 'CAUSE', 'PUBLISHED', 'MANUAL'),
  ('실패에 대한 두려움을 느끼다', 'cảm thấy sợ thất bại', 3, 'CAUSE', 'PUBLISHED', 'MANUAL'),
  ('학습 환경이 충분하지 않다', 'môi trường học tập không đầy đủ', 3, 'CAUSE', 'PUBLISHED', 'MANUAL'),
  ('구체적인 목표를 세우다', 'đặt mục tiêu cụ thể', 5, 'SOLUTION', 'PUBLISHED', 'MANUAL'),
  ('꾸준한 학습 습관을 형성하다', 'hình thành thói quen học đều đặn', 4, 'SOLUTION', 'PUBLISHED', 'MANUAL'),
  ('다양한 경험 기회를 제공하다', 'cung cấp nhiều cơ hội trải nghiệm', 4, 'SOLUTION', 'PUBLISHED', 'MANUAL'),
  ('학습 지원을 강화하다', 'tăng cường hỗ trợ học tập', 4, 'SOLUTION', 'PUBLISHED', 'MANUAL'),
  ('학생의 상황에 맞는 교육을 제공하다', 'cung cấp giáo dục phù hợp với hoàn cảnh học sinh', 3, 'SOLUTION', 'PUBLISHED', 'MANUAL'),
  ('교육 프로그램을 마련하다', 'xây dựng chương trình giáo dục', 5, 'SOLUTION', 'PUBLISHED', 'MANUAL'),
  -- Personal data / digital society: 22 scoped collocations.
  ('개인정보를 보호하다', 'bảo vệ thông tin cá nhân', 5, 'POSITIVE', 'PUBLISHED', 'MANUAL'),
  ('사생활을 보호하다', 'bảo vệ đời tư', 4, 'POSITIVE', 'PUBLISHED', 'MANUAL'),
  ('경제적 피해를 예방하다', 'phòng ngừa thiệt hại kinh tế', 4, 'POSITIVE', 'PUBLISHED', 'MANUAL'),
  ('안전한 디지털 생활을 누리다', 'có một đời sống số an toàn', 3, 'POSITIVE', 'PUBLISHED', 'MANUAL'),
  ('온라인 서비스에 대한 신뢰를 높이다', 'nâng cao niềm tin vào dịch vụ trực tuyến', 3, 'POSITIVE', 'PUBLISHED', 'MANUAL'),
  ('개인정보가 유출되다', 'thông tin cá nhân bị rò rỉ', 2, 'NEGATIVE', 'PUBLISHED', 'MANUAL'),
  ('사생활을 침해하다', 'xâm phạm đời tư', 3, 'NEGATIVE', 'PUBLISHED', 'MANUAL'),
  ('경제적 피해를 입다', 'chịu thiệt hại kinh tế', 4, 'NEGATIVE', 'PUBLISHED', 'MANUAL'),
  ('사이버 범죄로 이어지다', 'dẫn đến tội phạm mạng', 3, 'NEGATIVE', 'PUBLISHED', 'MANUAL'),
  ('불안감이 커지다', 'cảm giác bất an tăng lên', 3, 'NEGATIVE', 'PUBLISHED', 'MANUAL'),
  ('서비스에 대한 신뢰가 떨어지다', 'niềm tin vào dịch vụ giảm', 3, 'NEGATIVE', 'PUBLISHED', 'MANUAL'),
  ('개인정보 보호에 대한 인식이 부족하다', 'thiếu nhận thức về bảo vệ thông tin cá nhân', 3, 'CAUSE', 'PUBLISHED', 'MANUAL'),
  ('정보를 지나치게 공개하다', 'công khai thông tin quá mức', 3, 'CAUSE', 'PUBLISHED', 'MANUAL'),
  ('보안 관리가 부족하다', 'thiếu quản lý bảo mật', 3, 'CAUSE', 'PUBLISHED', 'MANUAL'),
  ('디지털 서비스 이용이 늘어나다', 'việc dùng dịch vụ số tăng lên', 3, 'CAUSE', 'PUBLISHED', 'MANUAL'),
  ('복잡한 보안 절차를 피하다', 'tránh quy trình bảo mật phức tạp', 2, 'CAUSE', 'PUBLISHED', 'MANUAL'),
  ('개인정보 공개 범위를 제한하다', 'hạn chế phạm vi công khai thông tin cá nhân', 3, 'SOLUTION', 'PUBLISHED', 'MANUAL'),
  ('보안 의식을 강화하다', 'tăng cường ý thức bảo mật', 4, 'SOLUTION', 'PUBLISHED', 'MANUAL'),
  ('비밀번호를 안전하게 관리하다', 'quản lý mật khẩu an toàn', 3, 'SOLUTION', 'PUBLISHED', 'MANUAL'),
  ('관련 규제를 강화하다', 'tăng cường quy định liên quan', 5, 'SOLUTION', 'PUBLISHED', 'MANUAL'),
  ('개인정보 보호 교육을 강화하다', 'tăng cường giáo dục bảo vệ thông tin cá nhân', 3, 'SOLUTION', 'PUBLISHED', 'MANUAL'),
  ('보안 시스템을 개선하다', 'cải thiện hệ thống bảo mật', 4, 'SOLUTION', 'PUBLISHED', 'MANUAL')
on conflict (expression_ko) do update set
  meaning_vi = excluded.meaning_vi,
  reuse_score = excluded.reuse_score,
  function_group = excluded.function_group,
  status = excluded.status,
  source_type = excluded.source_type;

do $$
declare
  v_education_id uuid;
  v_personal_id uuid;
  v_education_question_id uuid;
  v_personal_question_id uuid;
  v_education_positive uuid;
  v_education_negative uuid;
  v_education_cause uuid;
  v_education_solution uuid;
  v_personal_positive uuid;
  v_personal_negative uuid;
  v_personal_cause uuid;
  v_personal_solution uuid;
begin
  select id into v_education_id from public.q54_topics where slug = 'education-self-development';
  select id into v_personal_id from public.q54_topics where slug = 'personal-data-digital-society';

  insert into public.q54_questions(topic_id, subtopic_ko, prompt_ko, visibility, status, source_type)
  select
    v_education_id,
    '온라인 학습과 자기계발',
    '온라인 학습의 장점은 무엇인가? 교육 과정에서 어떤 문제가 생길 수 있는가? 다양한 경험을 쌓기 어려운 이유는 무엇인가? 더 나은 학습을 위해 어떤 노력이 필요한가?',
    'PUBLIC', 'PUBLISHED', 'MANUAL'
  where not exists (
    select 1 from public.q54_questions q
    where q.topic_id = v_education_id
      and q.visibility = 'PUBLIC'
      and q.prompt_ko = '온라인 학습의 장점은 무엇인가? 교육 과정에서 어떤 문제가 생길 수 있는가? 다양한 경험을 쌓기 어려운 이유는 무엇인가? 더 나은 학습을 위해 어떤 노력이 필요한가?'
  );
  select id into v_education_question_id
  from public.q54_questions
  where topic_id = v_education_id and visibility = 'PUBLIC'
    and prompt_ko = '온라인 학습의 장점은 무엇인가? 교육 과정에서 어떤 문제가 생길 수 있는가? 다양한 경험을 쌓기 어려운 이유는 무엇인가? 더 나은 학습을 위해 어떤 노력이 필요한가?'
  order by created_at limit 1;

  insert into public.q54_question_requirements(question_id, order_index, prompt_ko, label_vi, requirement_type, function_group, status, source_type)
  values
    (v_education_question_id, 0, '온라인 학습의 장점은 무엇인가?', 'Lợi ích của học trực tuyến', '장점', 'POSITIVE', 'PUBLISHED', 'MANUAL'),
    (v_education_question_id, 1, '교육 과정에서 어떤 문제가 생길 수 있는가?', 'Vấn đề có thể phát sinh trong quá trình giáo dục', '문제점', 'NEGATIVE', 'PUBLISHED', 'MANUAL'),
    (v_education_question_id, 2, '다양한 경험을 쌓기 어려운 이유는 무엇인가?', 'Lý do khó tích lũy trải nghiệm đa dạng', '어려운 이유', 'CAUSE', 'PUBLISHED', 'MANUAL'),
    (v_education_question_id, 3, '더 나은 학습을 위해 어떤 노력이 필요한가?', 'Nỗ lực cần thiết để học tốt hơn', '노력', 'SOLUTION', 'PUBLISHED', 'MANUAL')
  on conflict (question_id, order_index) do update set
    prompt_ko = excluded.prompt_ko,
    label_vi = excluded.label_vi,
    requirement_type = excluded.requirement_type,
    function_group = excluded.function_group,
    status = excluded.status,
    source_type = excluded.source_type;

  select id into v_education_positive from public.q54_question_requirements where question_id = v_education_question_id and order_index = 0;
  select id into v_education_negative from public.q54_question_requirements where question_id = v_education_question_id and order_index = 1;
  select id into v_education_cause from public.q54_question_requirements where question_id = v_education_question_id and order_index = 2;
  select id into v_education_solution from public.q54_question_requirements where question_id = v_education_question_id and order_index = 3;

  insert into public.q54_questions(topic_id, subtopic_ko, prompt_ko, visibility, status, source_type)
  select
    v_personal_id,
    '개인정보 보호',
    '개인 정보 보호가 중요한 이유는 무엇인가? 개인 정보가 제대로 보호되지 않으면 어떤 문제가 생길 수 있는가? 개인 정보 유출이 늘어나는 원인은 무엇인가? 개인 정보를 보호하기 위해 어떤 노력이 필요한가?',
    'PUBLIC', 'PUBLISHED', 'MANUAL'
  where not exists (
    select 1 from public.q54_questions q
    where q.topic_id = v_personal_id
      and q.visibility = 'PUBLIC'
      and q.prompt_ko = '개인 정보 보호가 중요한 이유는 무엇인가? 개인 정보가 제대로 보호되지 않으면 어떤 문제가 생길 수 있는가? 개인 정보 유출이 늘어나는 원인은 무엇인가? 개인 정보를 보호하기 위해 어떤 노력이 필요한가?'
  );
  select id into v_personal_question_id
  from public.q54_questions
  where topic_id = v_personal_id and visibility = 'PUBLIC'
    and prompt_ko = '개인 정보 보호가 중요한 이유는 무엇인가? 개인 정보가 제대로 보호되지 않으면 어떤 문제가 생길 수 있는가? 개인 정보 유출이 늘어나는 원인은 무엇인가? 개인 정보를 보호하기 위해 어떤 노력이 필요한가?'
  order by created_at limit 1;

  insert into public.q54_question_requirements(question_id, order_index, prompt_ko, label_vi, requirement_type, function_group, status, source_type)
  values
    (v_personal_question_id, 0, '개인 정보 보호가 중요한 이유는 무엇인가?', 'Tầm quan trọng của bảo vệ thông tin cá nhân', '중요성', 'POSITIVE', 'PUBLISHED', 'MANUAL'),
    (v_personal_question_id, 1, '개인 정보가 제대로 보호되지 않으면 어떤 문제가 생길 수 있는가?', 'Vấn đề khi thông tin cá nhân không được bảo vệ tốt', '문제점', 'NEGATIVE', 'PUBLISHED', 'MANUAL'),
    (v_personal_question_id, 2, '개인 정보 유출이 늘어나는 원인은 무엇인가?', 'Nguyên nhân rò rỉ thông tin cá nhân gia tăng', '원인', 'CAUSE', 'PUBLISHED', 'MANUAL'),
    (v_personal_question_id, 3, '개인 정보를 보호하기 위해 어떤 노력이 필요한가?', 'Nỗ lực cần thiết để bảo vệ thông tin cá nhân', '노력', 'SOLUTION', 'PUBLISHED', 'MANUAL')
  on conflict (question_id, order_index) do update set
    prompt_ko = excluded.prompt_ko,
    label_vi = excluded.label_vi,
    requirement_type = excluded.requirement_type,
    function_group = excluded.function_group,
    status = excluded.status,
    source_type = excluded.source_type;

  select id into v_personal_positive from public.q54_question_requirements where question_id = v_personal_question_id and order_index = 0;
  select id into v_personal_negative from public.q54_question_requirements where question_id = v_personal_question_id and order_index = 1;
  select id into v_personal_cause from public.q54_question_requirements where question_id = v_personal_question_id and order_index = 2;
  select id into v_personal_solution from public.q54_question_requirements where question_id = v_personal_question_id and order_index = 3;

  delete from public.q54_ideas where requirement_id in (
    v_education_positive, v_education_negative, v_education_cause, v_education_solution,
    v_personal_positive, v_personal_negative, v_personal_cause, v_personal_solution
  );
  delete from public.q54_translation_exercises
  where visibility = 'PUBLIC' and requirement_id in (
    v_education_positive, v_education_negative, v_education_cause, v_education_solution,
    v_personal_positive, v_personal_negative, v_personal_cause, v_personal_solution
  );
  delete from public.q54_pattern_examples
  where topic_id in (v_education_id, v_personal_id) and source_type = 'MANUAL';

  insert into public.q54_ideas(topic_id, requirement_id, function_group, keyword_ko, keyword_vi, logic_steps, status, source_type)
  values
    (v_education_id, v_education_positive, 'POSITIVE', '사고력 향상', 'Nâng cao khả năng tư duy', '["다양한 지식과 정보 습득", "사고력 향상", "문제 해결 능력 향상"]', 'PUBLISHED', 'MANUAL'),
    (v_education_id, v_education_positive, 'POSITIVE', '정보 활용 능력 향상', 'Nâng cao năng lực sử dụng thông tin', '["정보를 찾고 비교함", "신뢰할 수 있는 정보 선택", "정보 활용 능력 향상"]', 'PUBLISHED', 'MANUAL'),
    (v_education_id, v_education_positive, 'POSITIVE', '개인의 성장', 'Phát triển cá nhân', '["새로운 지식 습득", "자신감 향상", "개인의 성장"]', 'PUBLISHED', 'MANUAL'),
    (v_education_id, v_education_positive, 'POSITIVE', '진로 선택에 도움', 'Hỗ trợ lựa chọn nghề nghiệp', '["직업 세계 이해", "적성 파악", "진로 선택에 도움"]', 'PUBLISHED', 'MANUAL'),
    (v_education_id, v_education_positive, 'POSITIVE', '새로운 기회 확대', 'Mở rộng cơ hội mới', '["온라인 학습 접근", "배움의 기회 확대", "새로운 기회 확대"]', 'PUBLISHED', 'MANUAL'),
    (v_education_id, v_education_positive, 'POSITIVE', '사회 적응 능력 향상', 'Nâng cao khả năng thích nghi xã hội', '["다양한 사람과 협력", "의사소통 경험", "사회 적응 능력 향상"]', 'PUBLISHED', 'MANUAL'),
    (v_education_id, v_education_negative, 'NEGATIVE', '학습 부담 증가', 'Tăng áp lực học tập', '["과도한 과제와 시험", "휴식 시간 부족", "학습 부담 증가"]', 'PUBLISHED', 'MANUAL'),
    (v_education_id, v_education_negative, 'NEGATIVE', '집중력 저하', 'Suy giảm khả năng tập trung', '["긴 온라인 학습 시간", "화면 피로", "집중력 저하"]', 'PUBLISHED', 'MANUAL'),
    (v_education_id, v_education_negative, 'NEGATIVE', '지나친 경쟁', 'Cạnh tranh quá mức', '["성적만 중시함", "학생 사이 비교", "지나친 경쟁"]', 'PUBLISHED', 'MANUAL'),
    (v_education_id, v_education_negative, 'NEGATIVE', '직접적인 소통 감소', 'Giảm giao tiếp trực tiếp', '["비대면 수업 증가", "대화 기회 감소", "직접적인 소통 감소"]', 'PUBLISHED', 'MANUAL'),
    (v_education_id, v_education_negative, 'NEGATIVE', '경제적 부담 증가', 'Tăng gánh nặng kinh tế', '["사교육 비용 발생", "가계 부담 증가", "경제적 부담 증가"]', 'PUBLISHED', 'MANUAL'),
    (v_education_id, v_education_negative, 'NEGATIVE', '학습 격차 확대', 'Gia tăng khoảng cách học tập', '["학습 환경 차이", "지원 차이", "학습 격차 확대"]', 'PUBLISHED', 'MANUAL'),
    (v_education_id, v_education_cause, 'CAUSE', '정보 부족', 'Thiếu thông tin', '["프로그램 정보 부족", "적절한 기회 찾기 어려움", "경험을 쌓기 어려움"]', 'PUBLISHED', 'MANUAL'),
    (v_education_id, v_education_cause, 'CAUSE', '시간 부족', 'Thiếu thời gian', '["수업과 과제 많음", "여유 시간 부족", "새로운 활동 참여 어려움"]', 'PUBLISHED', 'MANUAL'),
    (v_education_id, v_education_cause, 'CAUSE', '학습 동기 부족', 'Thiếu động lực học tập', '["목표가 분명하지 않음", "학습 필요성 낮게 느낌", "꾸준히 배우기 어려움"]', 'PUBLISHED', 'MANUAL'),
    (v_education_id, v_education_cause, 'CAUSE', '경제적 부담', 'Gánh nặng kinh tế', '["참여 비용 필요", "가족 부담 고려", "교육 기회 제한"]', 'PUBLISHED', 'MANUAL'),
    (v_education_id, v_education_cause, 'CAUSE', '실패에 대한 두려움', 'Nỗi sợ thất bại', '["새로운 활동 걱정", "도전 피함", "경험 기회 놓침"]', 'PUBLISHED', 'MANUAL'),
    (v_education_id, v_education_solution, 'SOLUTION', '구체적인 목표 설정', 'Đặt mục tiêu cụ thể', '["현재 수준 확인", "작은 목표 설정", "학습 계획 실천"]', 'PUBLISHED', 'MANUAL'),
    (v_education_id, v_education_solution, 'SOLUTION', '꾸준한 학습 습관 형성', 'Hình thành thói quen học đều đặn', '["정해진 시간 확보", "매일 조금씩 학습", "꾸준한 습관 형성"]', 'PUBLISHED', 'MANUAL'),
    (v_education_id, v_education_solution, 'SOLUTION', '교육 프로그램 확대', 'Mở rộng chương trình giáo dục', '["다양한 수업 마련", "선택 기회 확대", "필요한 교육 제공"]', 'PUBLISHED', 'MANUAL'),
    (v_education_id, v_education_solution, 'SOLUTION', '다양한 경험 기회 제공', 'Cung cấp nhiều cơ hội trải nghiệm', '["직업 체험과 봉사 활동", "직접 참여", "진로와 적성 이해"]', 'PUBLISHED', 'MANUAL'),
    (v_education_id, v_education_solution, 'SOLUTION', '학습 지원 강화', 'Tăng cường hỗ trợ học tập', '["상담과 자료 제공", "학습 어려움 해결", "학습 지속"]', 'PUBLISHED', 'MANUAL'),
    (v_education_id, v_education_solution, 'SOLUTION', '상황에 맞는 교육 제공', 'Cung cấp giáo dục phù hợp hoàn cảnh', '["학생별 상황 파악", "맞춤형 도움 제공", "교육 효과 향상"]', 'PUBLISHED', 'MANUAL'),
    (v_personal_id, v_personal_positive, 'POSITIVE', '사생활 보호', 'Bảo vệ đời tư', '["불필요한 정보 공개 감소", "개인 생활 보호", "사생활 보호"]', 'PUBLISHED', 'MANUAL'),
    (v_personal_id, v_personal_positive, 'POSITIVE', '경제적 피해 예방', 'Phòng ngừa thiệt hại kinh tế', '["금융 정보 보호", "사기 피해 감소", "경제적 피해 예방"]', 'PUBLISHED', 'MANUAL'),
    (v_personal_id, v_personal_positive, 'POSITIVE', '안전한 디지털 생활', 'Đời sống số an toàn', '["안전 수칙 실천", "위험 감소", "안전한 디지털 생활"]', 'PUBLISHED', 'MANUAL'),
    (v_personal_id, v_personal_positive, 'POSITIVE', '온라인 서비스 신뢰 향상', 'Nâng cao niềm tin vào dịch vụ trực tuyến', '["정보 보호 체계 마련", "이용자 안심", "서비스 신뢰 향상"]', 'PUBLISHED', 'MANUAL'),
    (v_personal_id, v_personal_positive, 'POSITIVE', '사이버 범죄 예방', 'Phòng ngừa tội phạm mạng', '["개인정보 보호", "범죄 악용 방지", "사이버 범죄 예방"]', 'PUBLISHED', 'MANUAL'),
    (v_personal_id, v_personal_negative, 'NEGATIVE', '개인정보 유출', 'Rò rỉ thông tin cá nhân', '["보안 관리 부족", "정보가 외부로 나감", "개인정보 유출"]', 'PUBLISHED', 'MANUAL'),
    (v_personal_id, v_personal_negative, 'NEGATIVE', '사생활 침해', 'Xâm phạm đời tư', '["개인 생활 공개", "원하지 않는 연락", "사생활 침해"]', 'PUBLISHED', 'MANUAL'),
    (v_personal_id, v_personal_negative, 'NEGATIVE', '경제적 피해', 'Thiệt hại kinh tế', '["금융 정보 악용", "사기 발생", "경제적 피해"]', 'PUBLISHED', 'MANUAL'),
    (v_personal_id, v_personal_negative, 'NEGATIVE', '사이버 범죄', 'Tội phạm mạng', '["정보가 범죄에 이용됨", "불법 행위 증가", "사이버 범죄"]', 'PUBLISHED', 'MANUAL'),
    (v_personal_id, v_personal_negative, 'NEGATIVE', '신뢰성 저하', 'Suy giảm độ tin cậy', '["정보 유출 사고 발생", "서비스 불안", "신뢰성 저하"]', 'PUBLISHED', 'MANUAL'),
    (v_personal_id, v_personal_negative, 'NEGATIVE', '불안감 증가', 'Gia tăng cảm giác bất an', '["피해 가능성 걱정", "안전하지 않다고 느낌", "불안감 증가"]', 'PUBLISHED', 'MANUAL'),
    (v_personal_id, v_personal_cause, 'CAUSE', '보호 인식 부족', 'Thiếu nhận thức bảo vệ thông tin', '["위험성을 잘 모름", "안전 수칙 미실천", "개인정보 유출"]', 'PUBLISHED', 'MANUAL'),
    (v_personal_id, v_personal_cause, 'CAUSE', '지나친 정보 공개', 'Công khai thông tin quá mức', '["SNS에 많은 정보 게시", "개인 정보 노출", "악용 가능성 증가"]', 'PUBLISHED', 'MANUAL'),
    (v_personal_id, v_personal_cause, 'CAUSE', '보안 관리 부족', 'Thiếu quản lý bảo mật', '["약한 비밀번호 사용", "보안 점검 부족", "정보 유출 위험"]', 'PUBLISHED', 'MANUAL'),
    (v_personal_id, v_personal_cause, 'CAUSE', '디지털 서비스 이용 증가', 'Gia tăng sử dụng dịch vụ số', '["온라인 활동 증가", "수집되는 정보 증가", "유출 가능성 증가"]', 'PUBLISHED', 'MANUAL'),
    (v_personal_id, v_personal_cause, 'CAUSE', '복잡한 보안 절차', 'Quy trình bảo mật phức tạp', '["설정 과정이 어려움", "보안 기능 사용 회피", "보호 수준 저하"]', 'PUBLISHED', 'MANUAL'),
    (v_personal_id, v_personal_solution, 'SOLUTION', '공개 범위 제한', 'Hạn chế phạm vi công khai', '["필요한 정보만 공개", "노출 위험 감소", "사생활 보호"]', 'PUBLISHED', 'MANUAL'),
    (v_personal_id, v_personal_solution, 'SOLUTION', '보안 인식 강화', 'Tăng cường nhận thức bảo mật', '["위험 사례 학습", "안전 수칙 실천", "정보 보호"]', 'PUBLISHED', 'MANUAL'),
    (v_personal_id, v_personal_solution, 'SOLUTION', '비밀번호 관리', 'Quản lý mật khẩu', '["복잡한 비밀번호 설정", "정기적으로 변경", "계정 보호"]', 'PUBLISHED', 'MANUAL'),
    (v_personal_id, v_personal_solution, 'SOLUTION', '관련 규제 강화', 'Tăng cường quy định liên quan', '["기업 책임 명확화", "위반 행위 제재", "정보 보호 강화"]', 'PUBLISHED', 'MANUAL'),
    (v_personal_id, v_personal_solution, 'SOLUTION', '개인정보 보호 교육 강화', 'Tăng cường giáo dục bảo vệ thông tin', '["올바른 이용 방법 교육", "위험 예방", "안전한 디지털 생활"]', 'PUBLISHED', 'MANUAL'),
    (v_personal_id, v_personal_solution, 'SOLUTION', '보안 시스템 개선', 'Cải thiện hệ thống bảo mật', '["안전한 기술 도입", "유출 가능성 감소", "서비스 신뢰 향상"]', 'PUBLISHED', 'MANUAL');

  insert into public.q54_translation_exercises(topic_id, requirement_id, prompt_vi, reference_answer_ko, vocabulary_hint, pattern_hint, sample_sentence_ko, visibility, generation_mode, difficulty, generation_context_json, hint_cache, status, source_type)
  values
    (v_education_id, v_education_positive, 'Giáo dục đóng vai trò quan trọng trong việc phát triển khả năng tư duy của cá nhân.', null, '["교육", "사고력", "기르다"]', 'N은/는 V-는 데 중요한 역할을 한다.', '교육은 개인의 사고력을 기르는 데 중요한 역할을 한다.', 'PUBLIC', 'CURATED', 'NORMAL', '{}'::jsonb, '{}'::jsonb, 'PUBLISHED', 'MANUAL'),
    (v_education_id, v_education_positive, 'Học trực tuyến giúp ích cho việc tiếp thu kiến thức cần thiết bất cứ lúc nào.', null, '["온라인 학습", "지식", "습득하다"]', 'N은/는 V-는 데 도움이 된다.', '온라인 학습은 언제든지 필요한 지식을 습득하는 데 도움이 된다.', 'PUBLIC', 'CURATED', 'NORMAL', '{}'::jsonb, '{}'::jsonb, 'PUBLISHED', 'MANUAL'),
    (v_education_id, v_education_positive, 'Trải nghiệm nghề nghiệp giúp học sinh lựa chọn nghề nghiệp phù hợp.', null, '["직업 체험", "진로", "도움을 주다"]', 'N은/는 V-는 데 도움이 된다.', '직업 체험은 학생들이 자신에게 맞는 진로를 선택하는 데 도움이 된다.', 'PUBLIC', 'CURATED', 'NORMAL', '{}'::jsonb, '{}'::jsonb, 'PUBLISHED', 'MANUAL'),
    (v_education_id, v_education_negative, 'Việc học trực tuyến quá mức có thể làm giảm khả năng tập trung của học sinh.', null, '["지나친 온라인 학습", "집중력", "떨어지다"]', 'N은/는 N에 부정적인 영향을 미칠 수 있다.', '지나친 온라인 학습은 학생들의 집중력에 부정적인 영향을 미칠 수 있다.', 'PUBLIC', 'CURATED', 'NORMAL', '{}'::jsonb, '{}'::jsonb, 'PUBLISHED', 'MANUAL'),
    (v_education_id, v_education_negative, 'Chi phí giáo dục tư nhân có thể làm tăng gánh nặng kinh tế của gia đình.', null, '["사교육 비용", "경제적 부담", "늘어나다"]', 'N은/는 N을 유발할 수 있다.', '사교육 비용은 가정의 경제적 부담을 늘릴 수 있다.', 'PUBLIC', 'CURATED', 'NORMAL', '{}'::jsonb, '{}'::jsonb, 'PUBLISHED', 'MANUAL'),
    (v_education_id, v_education_negative, 'Cạnh tranh quá mức có thể gây áp lực học tập cho học sinh.', null, '["지나친 경쟁", "학습 부담", "유발하다"]', 'N은/는 N을 유발할 수 있다.', '지나친 경쟁은 학생들에게 학습 부담을 유발할 수 있다.', 'PUBLIC', 'CURATED', 'NORMAL', '{}'::jsonb, '{}'::jsonb, 'PUBLISHED', 'MANUAL'),
    (v_education_id, v_education_cause, 'Do thiếu thông tin về chương trình, học sinh khó tìm được cơ hội trải nghiệm phù hợp.', null, '["프로그램 정보", "부족하다", "경험 기회"]', 'N으로 인해 N이 부족하다.', '프로그램 정보가 부족해서 학생들은 적절한 경험 기회를 찾기 어렵다.', 'PUBLIC', 'CURATED', 'NORMAL', '{}'::jsonb, '{}'::jsonb, 'PUBLISHED', 'MANUAL'),
    (v_education_id, v_education_cause, 'Do lịch học bận rộn, nhiều học sinh thiếu thời gian tham gia hoạt động mới.', null, '["수업 일정", "시간", "부족하다"]', 'N 때문에 N하기 어렵다.', '바쁜 수업 일정 때문에 많은 학생들이 새로운 활동에 참여할 시간이 부족하다.', 'PUBLIC', 'CURATED', 'NORMAL', '{}'::jsonb, '{}'::jsonb, 'PUBLISHED', 'MANUAL'),
    (v_education_id, v_education_cause, 'Vì sợ thất bại, một số học sinh ngại thử những hoạt động mới.', null, '["실패", "두려움", "새로운 활동"]', 'N 때문에 N하기 어렵다.', '실패에 대한 두려움 때문에 일부 학생들은 새로운 활동에 도전하기 어렵다.', 'PUBLIC', 'CURATED', 'NORMAL', '{}'::jsonb, '{}'::jsonb, 'PUBLISHED', 'MANUAL'),
    (v_education_id, v_education_solution, 'Để học tốt hơn, cần đặt mục tiêu cụ thể và thực hiện đều đặn.', null, '["구체적인 목표", "세우다", "꾸준히 실천하다"]', 'V-기 위해서는 N할 필요가 있다.', '더 나은 학습을 위해서는 구체적인 목표를 세우고 꾸준히 실천할 필요가 있다.', 'PUBLIC', 'CURATED', 'NORMAL', '{}'::jsonb, '{}'::jsonb, 'PUBLISHED', 'MANUAL'),
    (v_education_id, v_education_solution, 'Cần tăng cường hỗ trợ học tập cho những học sinh gặp khó khăn.', null, '["학습 지원", "어려움을 겪다", "강화하다"]', 'N을/를 강화해야 한다.', '학습에 어려움을 겪는 학생들을 위한 학습 지원을 강화해야 한다.', 'PUBLIC', 'CURATED', 'NORMAL', '{}'::jsonb, '{}'::jsonb, 'PUBLISHED', 'MANUAL'),
    (v_education_id, v_education_solution, 'Nhà trường cần cung cấp nhiều cơ hội trải nghiệm nghề nghiệp cho học sinh.', null, '["학교", "직업 체험", "기회"]', 'N을/를 강화해야 한다.', '학교는 학생들에게 다양한 직업 체험 기회를 제공해야 한다.', 'PUBLIC', 'CURATED', 'NORMAL', '{}'::jsonb, '{}'::jsonb, 'PUBLISHED', 'MANUAL'),
    (v_personal_id, v_personal_positive, 'Bảo vệ thông tin cá nhân đóng vai trò quan trọng trong việc tạo ra đời sống số an toàn.', null, '["개인정보 보호", "안전한 디지털 생활", "중요한 역할"]', 'N은/는 V-는 데 중요한 역할을 한다.', '개인정보 보호는 안전한 디지털 생활을 만드는 데 중요한 역할을 한다.', 'PUBLIC', 'CURATED', 'NORMAL', '{}'::jsonb, '{}'::jsonb, 'PUBLISHED', 'MANUAL'),
    (v_personal_id, v_personal_positive, 'Bảo vệ thông tin tài chính giúp phòng ngừa thiệt hại kinh tế.', null, '["금융 정보", "경제적 피해", "예방하다"]', 'N은/는 V-는 데 도움이 된다.', '금융 정보를 보호하는 것은 경제적 피해를 예방하는 데 도움이 된다.', 'PUBLIC', 'CURATED', 'NORMAL', '{}'::jsonb, '{}'::jsonb, 'PUBLISHED', 'MANUAL'),
    (v_personal_id, v_personal_positive, 'Sử dụng dịch vụ trực tuyến an toàn góp phần nâng cao niềm tin của người dùng.', null, '["안전한 온라인 서비스", "이용자", "신뢰"]', 'N은/는 N에 기여한다.', '안전한 온라인 서비스는 이용자들의 신뢰를 높이는 데 기여한다.', 'PUBLIC', 'CURATED', 'NORMAL', '{}'::jsonb, '{}'::jsonb, 'PUBLISHED', 'MANUAL'),
    (v_personal_id, v_personal_negative, 'Rò rỉ thông tin cá nhân có thể dẫn đến thiệt hại kinh tế nghiêm trọng.', null, '["개인정보 유출", "경제적 피해", "이어지다"]', 'N은/는 N으로 이어질 수 있다.', '개인정보 유출은 심각한 경제적 피해로 이어질 수 있다.', 'PUBLIC', 'CURATED', 'NORMAL', '{}'::jsonb, '{}'::jsonb, 'PUBLISHED', 'MANUAL'),
    (v_personal_id, v_personal_negative, 'Công khai quá nhiều thông tin trên SNS có thể xâm phạm đời tư.', null, '["SNS", "정보", "사생활 침해"]', 'N은/는 N을 유발할 수 있다.', 'SNS에 너무 많은 정보를 공개하면 사생활 침해를 유발할 수 있다.', 'PUBLIC', 'CURATED', 'NORMAL', '{}'::jsonb, '{}'::jsonb, 'PUBLISHED', 'MANUAL'),
    (v_personal_id, v_personal_negative, 'Quản lý bảo mật yếu có thể dẫn đến tội phạm mạng.', null, '["보안 관리", "사이버 범죄", "이어지다"]', 'N은/는 N으로 이어질 수 있다.', '보안 관리가 부족하면 사이버 범죄로 이어질 수 있다.', 'PUBLIC', 'CURATED', 'NORMAL', '{}'::jsonb, '{}'::jsonb, 'PUBLISHED', 'MANUAL'),
    (v_personal_id, v_personal_cause, 'Rò rỉ thông tin cá nhân xảy ra vì nhiều người thiếu nhận thức về bảo mật.', null, '["개인정보 유출", "보안 의식", "부족하다"]', 'N으로 인해 N이 부족하다.', '보안 의식이 부족하기 때문에 개인정보 유출이 발생할 수 있다.', 'PUBLIC', 'CURATED', 'NORMAL', '{}'::jsonb, '{}'::jsonb, 'PUBLISHED', 'MANUAL'),
    (v_personal_id, v_personal_cause, 'Do công khai thông tin quá mức, nguy cơ lạm dụng thông tin cá nhân gia tăng.', null, '["지나친 정보 공개", "악용 위험", "증가하다"]', 'N의 영향으로 N이 증가하고 있다.', '지나친 정보 공개의 영향으로 개인정보 악용 위험이 증가하고 있다.', 'PUBLIC', 'CURATED', 'NORMAL', '{}'::jsonb, '{}'::jsonb, 'PUBLISHED', 'MANUAL'),
    (v_personal_id, v_personal_cause, 'Khi việc sử dụng dịch vụ số tăng lên, lượng thông tin được thu thập cũng tăng.', null, '["디지털 서비스 이용", "수집되는 정보", "늘어나다"]', 'N의 영향으로 N이 증가하고 있다.', '디지털 서비스 이용이 늘어나면서 수집되는 개인정보도 증가하고 있다.', 'PUBLIC', 'CURATED', 'NORMAL', '{}'::jsonb, '{}'::jsonb, 'PUBLISHED', 'MANUAL'),
    (v_personal_id, v_personal_solution, 'Để bảo vệ thông tin cá nhân, cần hạn chế phạm vi công khai thông tin.', null, '["개인정보", "공개 범위", "제한하다"]', 'V-기 위해서는 N할 필요가 있다.', '개인정보를 보호하기 위해서는 정보 공개 범위를 제한할 필요가 있다.', 'PUBLIC', 'CURATED', 'NORMAL', '{}'::jsonb, '{}'::jsonb, 'PUBLISHED', 'MANUAL'),
    (v_personal_id, v_personal_solution, 'Cần quản lý mật khẩu một cách an toàn và thay đổi định kỳ.', null, '["비밀번호", "안전하게 관리하다", "정기적으로 바꾸다"]', 'N을/를 강화해야 한다.', '비밀번호를 안전하게 관리하고 정기적으로 바꾸어야 한다.', 'PUBLIC', 'CURATED', 'NORMAL', '{}'::jsonb, '{}'::jsonb, 'PUBLISHED', 'MANUAL'),
    (v_personal_id, v_personal_solution, 'Các cơ quan liên quan cần tăng cường giáo dục bảo vệ thông tin cá nhân.', null, '["관련 기관", "개인정보 보호 교육", "강화하다"]', 'N을/를 강화해야 한다.', '관련 기관은 개인정보 보호 교육을 강화해야 한다.', 'PUBLIC', 'CURATED', 'NORMAL', '{}'::jsonb, '{}'::jsonb, 'PUBLISHED', 'MANUAL');

  insert into public.q54_translation_exercise_answer_keys(exercise_id, reference_answer_ko)
  select e.id, refs.reference_answer_ko
  from public.q54_translation_exercises e
  join (
    values
      ('Giáo dục đóng vai trò quan trọng trong việc phát triển khả năng tư duy của cá nhân.', '교육은 개인의 사고력을 기르는 데 중요한 역할을 한다.'),
      ('Học trực tuyến giúp ích cho việc tiếp thu kiến thức cần thiết bất cứ lúc nào.', '온라인 학습은 언제든지 필요한 지식을 습득하는 데 도움이 된다.'),
      ('Trải nghiệm nghề nghiệp giúp học sinh lựa chọn nghề nghiệp phù hợp.', '직업 체험은 학생들이 자신에게 맞는 진로를 선택하는 데 도움이 된다.'),
      ('Việc học trực tuyến quá mức có thể làm giảm khả năng tập trung của học sinh.', '지나친 온라인 학습은 학생들의 집중력에 부정적인 영향을 미칠 수 있다.'),
      ('Chi phí giáo dục tư nhân có thể làm tăng gánh nặng kinh tế của gia đình.', '사교육 비용은 가정의 경제적 부담을 늘릴 수 있다.'),
      ('Cạnh tranh quá mức có thể gây áp lực học tập cho học sinh.', '지나친 경쟁은 학생들에게 학습 부담을 유발할 수 있다.'),
      ('Do thiếu thông tin về chương trình, học sinh khó tìm được cơ hội trải nghiệm phù hợp.', '프로그램 정보가 부족해서 학생들은 적절한 경험 기회를 찾기 어렵다.'),
      ('Do lịch học bận rộn, nhiều học sinh thiếu thời gian tham gia hoạt động mới.', '바쁜 수업 일정 때문에 많은 학생들이 새로운 활동에 참여할 시간이 부족하다.'),
      ('Vì sợ thất bại, một số học sinh ngại thử những hoạt động mới.', '실패에 대한 두려움 때문에 일부 학생들은 새로운 활동에 도전하기 어렵다.'),
      ('Để học tốt hơn, cần đặt mục tiêu cụ thể và thực hiện đều đặn.', '더 나은 학습을 위해서는 구체적인 목표를 세우고 꾸준히 실천할 필요가 있다.'),
      ('Cần tăng cường hỗ trợ học tập cho những học sinh gặp khó khăn.', '학습에 어려움을 겪는 학생들을 위한 학습 지원을 강화해야 한다.'),
      ('Nhà trường cần cung cấp nhiều cơ hội trải nghiệm nghề nghiệp cho học sinh.', '학교는 학생들에게 다양한 직업 체험 기회를 제공해야 한다.'),
      ('Bảo vệ thông tin cá nhân đóng vai trò quan trọng trong việc tạo ra đời sống số an toàn.', '개인정보 보호는 안전한 디지털 생활을 만드는 데 중요한 역할을 한다.'),
      ('Bảo vệ thông tin tài chính giúp phòng ngừa thiệt hại kinh tế.', '금융 정보를 보호하는 것은 경제적 피해를 예방하는 데 도움이 된다.'),
      ('Sử dụng dịch vụ trực tuyến an toàn góp phần nâng cao niềm tin của người dùng.', '안전한 온라인 서비스는 이용자들의 신뢰를 높이는 데 기여한다.'),
      ('Rò rỉ thông tin cá nhân có thể dẫn đến thiệt hại kinh tế nghiêm trọng.', '개인정보 유출은 심각한 경제적 피해로 이어질 수 있다.'),
      ('Công khai quá nhiều thông tin trên SNS có thể xâm phạm đời tư.', 'SNS에 너무 많은 정보를 공개하면 사생활 침해를 유발할 수 있다.'),
      ('Quản lý bảo mật yếu có thể dẫn đến tội phạm mạng.', '보안 관리가 부족하면 사이버 범죄로 이어질 수 있다.'),
      ('Rò rỉ thông tin cá nhân xảy ra vì nhiều người thiếu nhận thức về bảo mật.', '보안 의식이 부족하기 때문에 개인정보 유출이 발생할 수 있다.'),
      ('Do công khai thông tin quá mức, nguy cơ lạm dụng thông tin cá nhân gia tăng.', '지나친 정보 공개의 영향으로 개인정보 악용 위험이 증가하고 있다.'),
      ('Khi việc sử dụng dịch vụ số tăng lên, lượng thông tin được thu thập cũng tăng.', '디지털 서비스 이용이 늘어나면서 수집되는 개인정보도 증가하고 있다.'),
      ('Để bảo vệ thông tin cá nhân, cần hạn chế phạm vi công khai thông tin.', '개인정보를 보호하기 위해서는 정보 공개 범위를 제한할 필요가 있다.'),
      ('Cần quản lý mật khẩu một cách an toàn và thay đổi định kỳ.', '비밀번호를 안전하게 관리하고 정기적으로 바꾸어야 한다.'),
      ('Các cơ quan liên quan cần tăng cường giáo dục bảo vệ thông tin cá nhân.', '관련 기관은 개인정보 보호 교육을 강화해야 한다.')
  ) as refs(prompt_vi, reference_answer_ko) on refs.prompt_vi = e.prompt_vi
  where e.visibility = 'PUBLIC' and e.topic_id in (v_education_id, v_personal_id)
  on conflict (exercise_id) do update set reference_answer_ko = excluded.reference_answer_ko;
end $$;

-- Keep expressions global and map only the relevant ones to each curated topic.
insert into public.q54_collocation_topics(collocation_id, topic_id)
select c.id, t.id
from public.q54_collocations c
join public.q54_topics t on t.slug = 'education-self-development'
where c.expression_ko in (
  '사고력을 기르다', '정보 활용 능력을 기르다', '지식을 습득하다', '경험을 쌓다', '개인의 성장에 기여하다', '진로 선택에 도움을 주다',
  '학습 부담이 커지다', '집중력이 떨어지다', '지나친 경쟁을 유발하다', '직접적인 소통이 줄어들다', '교육 격차가 커지다', '경제적 부담이 늘어나다',
  '학습 동기가 부족하다', '학습 시간이 부족하다', '진로 정보가 부족하다', '실패에 대한 두려움을 느끼다', '학습 환경이 충분하지 않다',
  '구체적인 목표를 세우다', '꾸준한 학습 습관을 형성하다', '다양한 경험 기회를 제공하다', '학습 지원을 강화하다', '학생의 상황에 맞는 교육을 제공하다', '교육 프로그램을 마련하다'
) on conflict do nothing;

insert into public.q54_collocation_topics(collocation_id, topic_id)
select c.id, t.id
from public.q54_collocations c
join public.q54_topics t on t.slug = 'personal-data-digital-society'
where c.expression_ko in (
  '개인정보를 보호하다', '사생활을 보호하다', '경제적 피해를 예방하다', '안전한 디지털 생활을 누리다', '온라인 서비스에 대한 신뢰를 높이다',
  '개인정보가 유출되다', '사생활을 침해하다', '경제적 피해를 입다', '사이버 범죄로 이어지다', '불안감이 커지다', '서비스에 대한 신뢰가 떨어지다',
  '개인정보 보호에 대한 인식이 부족하다', '정보를 지나치게 공개하다', '보안 관리가 부족하다', '디지털 서비스 이용이 늘어나다', '복잡한 보안 절차를 피하다',
  '개인정보 공개 범위를 제한하다', '보안 의식을 강화하다', '비밀번호를 안전하게 관리하다', '관련 규제를 강화하다', '개인정보 보호 교육을 강화하다', '보안 시스템을 개선하다'
) on conflict do nothing;

insert into public.q54_topic_pattern_mappings(topic_id, pattern_id)
select t.id, p.id
from public.q54_topics t
cross join public.q54_sentence_patterns p
where t.slug in ('education-self-development', 'personal-data-digital-society')
  and p.pattern_ko in (
    'N은/는 V-는 데 도움이 된다.',
    'N은/는 V-는 데 중요한 역할을 한다.',
    'N은/는 N에 기여한다.',
    'N은/는 N에 긍정적인 영향을 미친다.',
    'N은/는 N을 유발할 수 있다.',
    'N은/는 N에 부정적인 영향을 미칠 수 있다.',
    'N은/는 N으로 이어질 수 있다.',
    'N 때문에 N하기 어렵다.',
    'N으로 인해 N이 부족하다.',
    'N의 영향으로 N이 증가하고 있다.',
    'V-기 위해서는 N할 필요가 있다.',
    'N을/를 강화해야 한다.'
  )
on conflict do nothing;

-- Every scoped collocation gets one short Korean example and a Vietnamese translation.
insert into public.q54_pattern_examples(pattern_id, topic_id, collocation_id, sentence_ko, translation_vi, status, source_type)
select p.id, t.id, c.id, examples.sentence_ko, examples.translation_vi, 'PUBLISHED', 'MANUAL'
from (
  values
    ('education-self-development', '사고력을 기르다', 'N은/는 V-는 데 중요한 역할을 한다.', '교육은 학생들의 사고력을 기르는 데 중요한 역할을 한다.', 'Giáo dục đóng vai trò quan trọng trong việc phát triển tư duy của học sinh.'),
    ('education-self-development', '정보 활용 능력을 기르다', 'N은/는 V-는 데 도움이 된다.', '다양한 자료를 읽는 것은 정보 활용 능력을 기르는 데 도움이 된다.', 'Đọc nhiều tài liệu giúp phát triển năng lực sử dụng thông tin.'),
    ('education-self-development', '지식을 습득하다', 'N은/는 V-는 데 도움이 된다.', '온라인 강의는 필요한 지식을 습득하는 데 도움이 된다.', 'Bài giảng trực tuyến giúp tiếp thu kiến thức cần thiết.'),
    ('education-self-development', '경험을 쌓다', 'N은/는 V-는 데 도움이 된다.', '봉사 활동은 다양한 경험을 쌓는 데 도움이 된다.', 'Hoạt động tình nguyện giúp tích lũy nhiều trải nghiệm.'),
    ('education-self-development', '개인의 성장에 기여하다', 'N은/는 N에 기여한다.', '꾸준한 독서는 개인의 성장에 기여한다.', 'Đọc sách đều đặn góp phần vào sự phát triển cá nhân.'),
    ('education-self-development', '진로 선택에 도움을 주다', 'N은/는 V-는 데 도움이 된다.', '직업 체험은 진로를 선택하는 데 도움을 준다.', 'Trải nghiệm nghề nghiệp giúp lựa chọn nghề.'),
    ('education-self-development', '학습 부담이 커지다', 'N은/는 N을 유발할 수 있다.', '과도한 과제는 학생들의 학습 부담을 키울 수 있다.', 'Bài tập quá nhiều có thể làm tăng áp lực học tập của học sinh.'),
    ('education-self-development', '집중력이 떨어지다', 'N은/는 N에 부정적인 영향을 미칠 수 있다.', '긴 온라인 수업은 집중력에 부정적인 영향을 미칠 수 있다.', 'Lớp học trực tuyến kéo dài có thể ảnh hưởng xấu đến khả năng tập trung.'),
    ('education-self-development', '지나친 경쟁을 유발하다', 'N은/는 N을 유발할 수 있다.', '성적만 중시하는 분위기는 지나친 경쟁을 유발할 수 있다.', 'Không khí chỉ coi trọng điểm số có thể gây cạnh tranh quá mức.'),
    ('education-self-development', '직접적인 소통이 줄어들다', 'N은/는 N으로 이어질 수 있다.', '비대면 수업의 증가는 직접적인 소통 감소로 이어질 수 있다.', 'Sự gia tăng lớp học không trực tiếp có thể dẫn đến giảm giao tiếp trực tiếp.'),
    ('education-self-development', '교육 격차가 커지다', 'N은/는 N으로 이어질 수 있다.', '학습 환경의 차이는 교육 격차가 커지는 결과로 이어질 수 있다.', 'Sự khác biệt về môi trường học tập có thể khiến khoảng cách giáo dục tăng.'),
    ('education-self-development', '경제적 부담이 늘어나다', 'N은/는 N을 유발할 수 있다.', '사교육 비용은 가정의 경제적 부담을 늘릴 수 있다.', 'Chi phí giáo dục tư nhân có thể làm tăng gánh nặng kinh tế của gia đình.'),
    ('education-self-development', '학습 동기가 부족하다', 'N으로 인해 N이 부족하다.', '뚜렷한 목표가 없으면 학습 동기가 부족해질 수 있다.', 'Nếu không có mục tiêu rõ ràng, động lực học tập có thể thiếu đi.'),
    ('education-self-development', '학습 시간이 부족하다', 'N 때문에 N하기 어렵다.', '바쁜 수업 일정 때문에 학습 시간이 부족하다.', 'Vì lịch học bận rộn nên thiếu thời gian học.'),
    ('education-self-development', '진로 정보가 부족하다', 'N으로 인해 N이 부족하다.', '진로 정보가 부족해서 적절한 직업을 선택하기 어렵다.', 'Do thiếu thông tin nghề nghiệp nên khó chọn nghề phù hợp.'),
    ('education-self-development', '실패에 대한 두려움을 느끼다', 'N 때문에 N하기 어렵다.', '실패에 대한 두려움 때문에 새로운 활동에 도전하기 어렵다.', 'Vì sợ thất bại nên khó thử những hoạt động mới.'),
    ('education-self-development', '학습 환경이 충분하지 않다', 'N으로 인해 N이 부족하다.', '조용한 공간이 없어서 학습 환경이 충분하지 않다.', 'Do không có không gian yên tĩnh nên môi trường học chưa đầy đủ.'),
    ('education-self-development', '구체적인 목표를 세우다', 'V-기 위해서는 N할 필요가 있다.', '꾸준히 공부하기 위해서는 구체적인 목표를 세울 필요가 있다.', 'Để học đều đặn, cần đặt mục tiêu cụ thể.'),
    ('education-self-development', '꾸준한 학습 습관을 형성하다', 'V-기 위해서는 N할 필요가 있다.', '실력을 높이기 위해서는 꾸준한 학습 습관을 형성할 필요가 있다.', 'Để nâng cao năng lực, cần hình thành thói quen học đều đặn.'),
    ('education-self-development', '다양한 경험 기회를 제공하다', 'N을/를 강화해야 한다.', '학교는 학생들에게 다양한 경험 기회를 제공해야 한다.', 'Trường học cần cung cấp cho học sinh nhiều cơ hội trải nghiệm.'),
    ('education-self-development', '학습 지원을 강화하다', 'N을/를 강화해야 한다.', '학습에 어려움을 겪는 학생들을 위한 지원을 강화해야 한다.', 'Cần tăng cường hỗ trợ cho học sinh gặp khó khăn trong học tập.'),
    ('education-self-development', '학생의 상황에 맞는 교육을 제공하다', 'N은/는 N에 긍정적인 영향을 미친다.', '학생의 상황에 맞는 교육은 학습 효과에 긍정적인 영향을 미친다.', 'Giáo dục phù hợp với hoàn cảnh học sinh tạo tác động tích cực đến hiệu quả học tập.'),
    ('education-self-development', '교육 프로그램을 마련하다', 'V-기 위해서는 N할 필요가 있다.', '다양한 배움의 기회를 위해 교육 프로그램을 마련할 필요가 있다.', 'Để có nhiều cơ hội học tập, cần xây dựng chương trình giáo dục.'),
    ('personal-data-digital-society', '개인정보를 보호하다', 'N은/는 V-는 데 중요한 역할을 한다.', '개인정보 보호는 안전한 디지털 생활을 만드는 데 중요한 역할을 한다.', 'Bảo vệ thông tin cá nhân đóng vai trò quan trọng trong việc tạo ra đời sống số an toàn.'),
    ('personal-data-digital-society', '사생활을 보호하다', 'N은/는 V-는 데 도움이 된다.', '정보 공개 범위를 제한하는 것은 사생활을 보호하는 데 도움이 된다.', 'Hạn chế phạm vi công khai thông tin giúp bảo vệ đời tư.'),
    ('personal-data-digital-society', '경제적 피해를 예방하다', 'N은/는 V-는 데 도움이 된다.', '금융 정보를 보호하면 경제적 피해를 예방하는 데 도움이 된다.', 'Bảo vệ thông tin tài chính giúp phòng ngừa thiệt hại kinh tế.'),
    ('personal-data-digital-society', '안전한 디지털 생활을 누리다', 'N은/는 V-는 데 도움이 된다.', '보안 수칙을 지키면 안전한 디지털 생활을 누리는 데 도움이 된다.', 'Tuân thủ quy tắc bảo mật giúp có đời sống số an toàn.'),
    ('personal-data-digital-society', '온라인 서비스에 대한 신뢰를 높이다', 'N은/는 N에 기여한다.', '안전한 서비스는 이용자들의 신뢰를 높이는 데 기여한다.', 'Dịch vụ an toàn góp phần nâng cao niềm tin của người dùng.'),
    ('personal-data-digital-society', '개인정보가 유출되다', 'N은/는 N으로 이어질 수 있다.', '개인정보가 유출되면 심각한 피해로 이어질 수 있다.', 'Nếu thông tin cá nhân bị rò rỉ, có thể dẫn đến thiệt hại nghiêm trọng.'),
    ('personal-data-digital-society', '사생활을 침해하다', 'N은/는 N을 유발할 수 있다.', '무분별한 정보 공개는 사생활 침해를 유발할 수 있다.', 'Công khai thông tin bừa bãi có thể gây xâm phạm đời tư.'),
    ('personal-data-digital-society', '경제적 피해를 입다', 'N은/는 N으로 이어질 수 있다.', '금융 정보 유출은 경제적 피해로 이어질 수 있다.', 'Rò rỉ thông tin tài chính có thể dẫn đến thiệt hại kinh tế.'),
    ('personal-data-digital-society', '사이버 범죄로 이어지다', 'N은/는 N으로 이어질 수 있다.', '보안 관리 부족은 사이버 범죄로 이어질 수 있다.', 'Thiếu quản lý bảo mật có thể dẫn đến tội phạm mạng.'),
    ('personal-data-digital-society', '불안감이 커지다', 'N은/는 N에 부정적인 영향을 미칠 수 있다.', '개인정보 유출은 이용자들의 불안감에 부정적인 영향을 미칠 수 있다.', 'Rò rỉ thông tin cá nhân có thể ảnh hưởng xấu đến cảm giác bất an của người dùng.'),
    ('personal-data-digital-society', '서비스에 대한 신뢰가 떨어지다', 'N은/는 N으로 이어질 수 있다.', '반복되는 유출 사고는 서비스 신뢰가 떨어지는 결과로 이어질 수 있다.', 'Sự cố rò rỉ lặp lại có thể khiến niềm tin vào dịch vụ giảm.'),
    ('personal-data-digital-society', '개인정보 보호에 대한 인식이 부족하다', 'N으로 인해 N이 부족하다.', '보호 인식이 부족하면 개인정보 유출 위험이 커진다.', 'Nếu thiếu nhận thức bảo vệ, nguy cơ rò rỉ thông tin cá nhân tăng.'),
    ('personal-data-digital-society', '정보를 지나치게 공개하다', 'N의 영향으로 N이 증가하고 있다.', '정보를 지나치게 공개하는 영향으로 악용 위험이 증가하고 있다.', 'Do công khai thông tin quá mức, nguy cơ bị lạm dụng đang tăng.'),
    ('personal-data-digital-society', '보안 관리가 부족하다', 'N으로 인해 N이 부족하다.', '보안 관리가 부족해서 개인정보 보호 수준이 낮다.', 'Do thiếu quản lý bảo mật, mức độ bảo vệ thông tin cá nhân thấp.'),
    ('personal-data-digital-society', '디지털 서비스 이용이 늘어나다', 'N의 영향으로 N이 증가하고 있다.', '디지털 서비스 이용이 늘어나면서 수집되는 정보도 증가하고 있다.', 'Khi việc sử dụng dịch vụ số tăng, thông tin được thu thập cũng tăng.'),
    ('personal-data-digital-society', '복잡한 보안 절차를 피하다', 'N 때문에 N하기 어렵다.', '복잡한 보안 절차 때문에 이용자들은 설정을 끝까지 하기 어렵다.', 'Vì quy trình bảo mật phức tạp, người dùng khó hoàn tất cài đặt.'),
    ('personal-data-digital-society', '개인정보 공개 범위를 제한하다', 'V-기 위해서는 N할 필요가 있다.', '사생활을 보호하기 위해서는 개인정보 공개 범위를 제한할 필요가 있다.', 'Để bảo vệ đời tư, cần hạn chế phạm vi công khai thông tin cá nhân.'),
    ('personal-data-digital-society', '보안 의식을 강화하다', 'N을/를 강화해야 한다.', '개인정보 유출을 막기 위해 보안 의식을 강화해야 한다.', 'Để ngăn rò rỉ thông tin cá nhân, cần tăng cường ý thức bảo mật.'),
    ('personal-data-digital-society', '비밀번호를 안전하게 관리하다', 'V-기 위해서는 N할 필요가 있다.', '계정을 보호하기 위해서는 비밀번호를 안전하게 관리할 필요가 있다.', 'Để bảo vệ tài khoản, cần quản lý mật khẩu an toàn.'),
    ('personal-data-digital-society', '관련 규제를 강화하다', 'N을/를 강화해야 한다.', '개인정보를 보호하기 위해 관련 규제를 강화해야 한다.', 'Để bảo vệ thông tin cá nhân, cần tăng cường quy định liên quan.'),
    ('personal-data-digital-society', '개인정보 보호 교육을 강화하다', 'N을/를 강화해야 한다.', '학교와 기관은 개인정보 보호 교육을 강화해야 한다.', 'Trường học và cơ quan cần tăng cường giáo dục bảo vệ thông tin cá nhân.'),
    ('personal-data-digital-society', '보안 시스템을 개선하다', 'N을/를 강화해야 한다.', '안전한 서비스를 위해 보안 시스템을 개선해야 한다.', 'Để có dịch vụ an toàn, cần cải thiện hệ thống bảo mật.')
) as examples(topic_slug, expression_ko, pattern_ko, sentence_ko, translation_vi)
join public.q54_topics t on t.slug = examples.topic_slug
join public.q54_collocations c on c.expression_ko = examples.expression_ko
join public.q54_sentence_patterns p on p.pattern_ko = examples.pattern_ko;

do $$
declare
  topic_slug text;
  v_topic_id uuid;
  group_name text;
  idea_count integer;
  collocation_count integer;
  pattern_count integer;
  example_count integer;
  exercise_count integer;
  answer_count integer;
begin
  foreach topic_slug in array array['education-self-development', 'personal-data-digital-society'] loop
    select t.id into v_topic_id from public.q54_topics t where t.slug = topic_slug and t.status = 'PUBLISHED' and t.source_type = 'MANUAL';
    if v_topic_id is null then raise exception 'Q54 seed validation failed: missing topic %', topic_slug; end if;
    foreach group_name in array array['POSITIVE', 'NEGATIVE', 'CAUSE', 'SOLUTION'] loop
      select count(*) into idea_count from public.q54_ideas i where i.topic_id = v_topic_id and i.function_group = group_name and i.status = 'PUBLISHED' and i.source_type = 'MANUAL';
      if idea_count = 0 then raise exception 'Q54 seed validation failed: % has no % ideas', topic_slug, group_name; end if;
    end loop;
    select count(*) into collocation_count from public.q54_collocation_topics links where links.topic_id = v_topic_id;
    if collocation_count < 18 then raise exception 'Q54 seed validation failed: % has only % collocations', topic_slug, collocation_count; end if;
    select count(*) into pattern_count from public.q54_topic_pattern_mappings mappings where mappings.topic_id = v_topic_id;
    if pattern_count < 10 then raise exception 'Q54 seed validation failed: % has only % pattern mappings', topic_slug, pattern_count; end if;
    select count(*) into example_count from public.q54_pattern_examples examples where examples.topic_id = v_topic_id and examples.status = 'PUBLISHED' and examples.source_type = 'MANUAL' and nullif(trim(examples.sentence_ko), '') is not null and nullif(trim(examples.translation_vi), '') is not null;
    if example_count < collocation_count then raise exception 'Q54 seed validation failed: % has only % complete examples for % collocations', topic_slug, example_count, collocation_count; end if;
    select count(*) into exercise_count from public.q54_translation_exercises exercises where exercises.topic_id = v_topic_id and exercises.visibility = 'PUBLIC' and exercises.status = 'PUBLISHED' and exercises.source_type = 'MANUAL';
    select count(*) into answer_count from public.q54_translation_exercise_answer_keys k join public.q54_translation_exercises e on e.id = k.exercise_id where e.topic_id = v_topic_id and e.visibility = 'PUBLIC' and e.status = 'PUBLISHED';
    if exercise_count < 12 or answer_count < 12 then raise exception 'Q54 seed validation failed: % has % exercises and % hidden answers', topic_slug, exercise_count, answer_count; end if;
  end loop;

  if exists (
    select 1
    from public.q54_collocation_topics links
    join public.q54_collocations c on c.id = links.collocation_id
    join public.q54_topics t on t.id = links.topic_id
    where t.slug in ('education-self-development', 'personal-data-digital-society')
    group by links.topic_id, c.expression_ko
    having count(*) > 1
  ) then raise exception 'Q54 seed validation failed: duplicate topic collocation mapping'; end if;
end $$;

commit;
