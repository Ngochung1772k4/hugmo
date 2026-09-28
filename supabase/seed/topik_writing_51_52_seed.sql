-- Generated from seed/sources/TOPIK_Q51_Q52_SEED_DATA.json. Do not hand-edit source answers.
-- Regenerate with: node scripts/topikWriting5152Seed.mjs
begin;

insert into public.topik_sources(source_key, title, edition, scope, notes) values ('TOPIK_3_4_PHUONG_ANH_B11_2', 'Chinh phục TOPIK 3-4 – Tiếng Hàn Phương Anh', 'TOPIK 3-4. B11(2).pdf', 'TOPIK II Writing 51-52', 'Patterns, exercises and answer variants are sourced from the supplied book. Structural codes are application metadata. Do not silently rewrite source answers; use review_note when the parsed source appears questionable.') on conflict (source_key) do update set title = excluded.title, edition = excluded.edition, scope = excluded.scope, notes = excluded.notes;

insert into public.topik_writing_51_intents(code, name_vi, name_ko, sort_order, source_type, source_pages, status) values
  ('FUTURE_PLAN', 'Dự định / kế hoạch trong tương lai', '미래 계획 / 예정', 0, 'SOURCE_BOOK', array[228], 'PUBLISHED'),
  ('PAST_EXPERIENCE', 'Hành động / trải nghiệm đã được thực hiện', '경험 / 과거 행동', 1, 'SOURCE_BOOK', array[230], 'PUBLISHED'),
  ('REQUEST_FAVOR', 'Nhờ vả thực hiện hành động', '부탁', 2, 'SOURCE_BOOK', array[231], 'PUBLISHED'),
  ('REQUEST_COMMAND', 'Yêu cầu / mệnh lệnh / cấm', '요구 / 명령 / 금지', 3, 'SOURCE_BOOK', array[232, 233], 'PUBLISHED'),
  ('REQUEST_INFORMATION', 'Yêu cầu cung cấp thông tin', '정보 요청', 4, 'SOURCE_BOOK', array[233], 'PUBLISHED'),
  ('REFUSAL_INCONVENIENCE', 'Từ chối / gây sự bất tiện cho người khác', '거절 / 양해', 5, 'SOURCE_BOOK', array[234], 'PUBLISHED'),
  ('THANK_APOLOGY_CONGRATS', 'Cảm ơn / xin lỗi / chúc mừng', '감사 / 사과 / 축하', 6, 'SOURCE_BOOK', array[235, 236], 'PUBLISHED')
on conflict (code) do update set name_vi = excluded.name_vi, name_ko = excluded.name_ko, sort_order = excluded.sort_order, source_type = excluded.source_type, source_pages = excluded.source_pages, status = excluded.status;

delete from public.topik_writing_51_patterns where source_type = 'SOURCE_BOOK';
insert into public.topik_writing_51_patterns(intent_id, pattern_ko, pattern_kind, sort_order, source_type, source_pages, status)
select i.id, source.pattern_ko, source.pattern_kind, source.sort_order, 'SOURCE_BOOK', source.source_pages, 'PUBLISHED'
from (values
  ('FUTURE_PLAN', 'V-(으)려고 합니다', 'PREFERRED', 0, array[228]),
  ('FUTURE_PLAN', 'V-(으)ㄹ 생각입니다', 'ALTERNATIVE', 0, array[228]),
  ('FUTURE_PLAN', 'V-고자 합니다', 'ALTERNATIVE', 1, array[228]),
  ('FUTURE_PLAN', 'V-(으)ㄹ까 합니다', 'ALTERNATIVE', 2, array[228]),
  ('FUTURE_PLAN', 'V-(으)ㄹ 예정입니다', 'ALTERNATIVE', 3, array[228]),
  ('FUTURE_PLAN', 'V-(으)ㄹ 계획입니다', 'ALTERNATIVE', 4, array[228]),
  ('FUTURE_PLAN', 'V-겠습니다', 'ALTERNATIVE', 5, array[228]),
  ('FUTURE_PLAN', 'V-(으)면 누구나 - V-(으)ㄹ 수 있습니다', 'PAIRED', 0, array[228]),
  ('FUTURE_PLAN', 'V-(으)셔도 되고 - V-(으)셔도 됩니다', 'PAIRED', 1, array[228]),
  ('FUTURE_PLAN', 'V-(으)려면 - V-아/어야 합니다', 'PAIRED', 2, array[228]),
  ('PAST_EXPERIENCE', 'V-(으)ㄴ 적이 있습니다/없습니다', 'PREFERRED', 0, array[230]),
  ('PAST_EXPERIENCE', 'V-(으)ㄴ 지 N시간이/가 되었습니다', 'PREFERRED', 1, array[230]),
  ('PAST_EXPERIENCE', 'V-았/었습니다', 'PREFERRED', 2, array[230]),
  ('PAST_EXPERIENCE', 'V-지만 - V', 'PAIRED', 0, array[230]),
  ('PAST_EXPERIENCE', 'V-아/어도 - V', 'PAIRED', 1, array[230]),
  ('REQUEST_FAVOR', 'V-아/어 주시면 감사하겠습니다', 'PREFERRED', 0, array[231]),
  ('REQUEST_FAVOR', 'V-아/어 주시겠습니까?', 'PREFERRED', 1, array[231]),
  ('REQUEST_FAVOR', 'V-기 바랍니다', 'ALTERNATIVE', 0, array[231]),
  ('REQUEST_FAVOR', 'V-아/어 주십시오', 'ALTERNATIVE', 1, array[231]),
  ('REQUEST_FAVOR', 'V-아/어 주실 수 있으십니까?', 'ALTERNATIVE', 2, array[231]),
  ('REQUEST_FAVOR', 'V-아/어도 되겠습니까?', 'ALTERNATIVE', 3, array[231]),
  ('REQUEST_FAVOR', 'N한테서 -다고 들었습니다', 'PAIRED', 0, array[231]),
  ('REQUEST_FAVOR', 'N한테서 -다는 소식을 들었습니다', 'PAIRED', 1, array[231]),
  ('REQUEST_FAVOR', 'N을/를 물어보니 -다고 합니다', 'PAIRED', 2, array[231]),
  ('REQUEST_FAVOR', 'N을/를 알아보니 -다고 합니다', 'PAIRED', 3, array[231]),
  ('REQUEST_COMMAND', 'V-아/어 주시기 바랍니다', 'PREFERRED', 0, array[232, 233]),
  ('REQUEST_COMMAND', 'V-지 마시기 바랍니다', 'PREFERRED', 1, array[232, 233]),
  ('REQUEST_COMMAND', 'V-(으)십시오', 'ALTERNATIVE', 0, array[232, 233]),
  ('REQUEST_COMMAND', '가능하면 V-았/었으면 좋겠습니다', 'ALTERNATIVE', 1, array[232, 233]),
  ('REQUEST_COMMAND', 'V-아/어 주시면 감사하겠습니다', 'ALTERNATIVE', 2, array[232, 233]),
  ('REQUEST_COMMAND', 'V-(으)면 안 됩니다', 'ALTERNATIVE', 3, array[232, 233]),
  ('REQUEST_COMMAND', 'V-지 마십시오', 'ALTERNATIVE', 4, array[232, 233]),
  ('REQUEST_COMMAND', 'V-아/어서 불편합니다', 'PAIRED', 0, array[232, 233]),
  ('REQUEST_COMMAND', 'V-아/어서 다른 사람을 불편하게 합니다', 'PAIRED', 1, array[232, 233]),
  ('REQUEST_COMMAND', '의문사 + V-(으)ㄴ/는지', 'PAIRED', 2, array[232, 233]),
  ('REQUEST_INFORMATION', '어떤 N이/가 필요합니까?', 'PREFERRED', 0, array[233]),
  ('REQUEST_INFORMATION', '의문사 + V-(으)ㄴ/는지 알다', 'PREFERRED', 1, array[233]),
  ('REQUEST_INFORMATION', 'V-(으)ㄹ 수 있습니까?', 'ALTERNATIVE', 0, array[233]),
  ('REQUEST_INFORMATION', 'V-아/어 주시겠습니까?', 'ALTERNATIVE', 1, array[233]),
  ('REFUSAL_INCONVENIENCE', 'V-아/어야 할 것 같습니다', 'PREFERRED', 0, array[234]),
  ('REFUSAL_INCONVENIENCE', 'V-기가 어려울 것 같습니다', 'PREFERRED', 1, array[234]),
  ('REFUSAL_INCONVENIENCE', 'V-기가 어렵습니다', 'ALTERNATIVE', 0, array[234]),
  ('REFUSAL_INCONVENIENCE', 'V-(으)ㄹ 수 없을 것 같습니다', 'ALTERNATIVE', 1, array[234]),
  ('REFUSAL_INCONVENIENCE', 'V/A-더라도 V-기 바랍니다', 'PAIRED', 0, array[234]),
  ('REFUSAL_INCONVENIENCE', 'V/A-더라도 이해해 주시기 바랍니다', 'PAIRED', 1, array[234]),
  ('REFUSAL_INCONVENIENCE', 'V/A-더라도 양해해 주시기 바랍니다', 'PAIRED', 2, array[234]),
  ('THANK_APOLOGY_CONGRATS', 'V-아/어서 축하드립니다', 'PREFERRED', 0, array[235, 236]),
  ('THANK_APOLOGY_CONGRATS', 'V-아/어 주셔서 감사합니다', 'PREFERRED', 1, array[235, 236]),
  ('THANK_APOLOGY_CONGRATS', 'V-아/어서 죄송합니다', 'PREFERRED', 2, array[235, 236]),
  ('THANK_APOLOGY_CONGRATS', 'N을/를 축하해 드립니다', 'ALTERNATIVE', 0, array[235, 236]),
  ('THANK_APOLOGY_CONGRATS', 'V-아/어 주셔서 감사드립니다', 'ALTERNATIVE', 1, array[235, 236]),
  ('THANK_APOLOGY_CONGRATS', 'V-게 해서 죄송합니다', 'ALTERNATIVE', 2, array[235, 236]),
  ('THANK_APOLOGY_CONGRATS', 'V-(으)ㄴ 덕분에 - V-(으)ㄹ 수 있게 되었습니다', 'PAIRED', 0, array[235, 236])
) as source(intent_code, pattern_ko, pattern_kind, sort_order, source_pages)
join public.topik_writing_51_intents i on i.code = source.intent_code;

insert into public.topik_writing_52_relations(code, name_vi, name_ko, sort_order, source_type, source_pages, status) values
  ('CAUSE', 'Nguyên nhân', '원인', 0, 'SOURCE_BOOK', array[247], 'PUBLISHED'),
  ('EFFECT', 'Ảnh hưởng / tác động', '영향 / 효과', 1, 'SOURCE_BOOK', array[247], 'PUBLISHED'),
  ('ADDITION', 'Bổ sung / tương trợ', '추가 / 병렬', 2, 'SOURCE_BOOK', array[247], 'PUBLISHED'),
  ('REPORTED_SPEECH', 'Gián tiếp / dẫn nguồn', '간접 인용', 3, 'SOURCE_BOOK', array[248], 'PUBLISHED'),
  ('DEFINITION', 'Khái niệm / giới thiệu', '정의 / 소개', 4, 'SOURCE_BOOK', array[248], 'PUBLISHED'),
  ('PURPOSE_CONDITION', 'Mục đích / điều kiện', '목적 / 조건', 5, 'SOURCE_BOOK', array[248], 'PUBLISHED'),
  ('PARTIAL_NEGATION', 'Phủ định một phần', '부분 부정', 6, 'SOURCE_BOOK', array[248], 'PUBLISHED'),
  ('COMPARISON', 'So sánh', '비교', 7, 'SOURCE_BOOK', array[248], 'PUBLISHED'),
  ('DEPENDENCY_OTHER', 'Quan hệ phụ thuộc / biểu hiện khác', '의존 / 기타 표현', 8, 'SOURCE_BOOK', array[249], 'PUBLISHED')
on conflict (code) do update set name_vi = excluded.name_vi, name_ko = excluded.name_ko, sort_order = excluded.sort_order, source_type = excluded.source_type, source_pages = excluded.source_pages, status = excluded.status;

delete from public.topik_writing_52_patterns where source_type = 'SOURCE_BOOK';
insert into public.topik_writing_52_patterns(relation_id, pattern_ko, sort_order, source_type, source_pages, status)
select r.id, source.pattern_ko, source.sort_order, 'SOURCE_BOOK', source.source_pages, 'PUBLISHED'
from (values
  ('CAUSE', '그 이유는 ~기 때문이다', 0, array[247]),
  ('CAUSE', '왜냐하면 ~기 때문이다', 1, array[247]),
  ('EFFECT', 'N1은/는 N2에/에게 부정적/긍정적인 영향을 준다/미친다', 0, array[247]),
  ('EFFECT', 'N은/는 V-는 데(에) 도움을 준다/역할이 있다', 1, array[247]),
  ('EFFECT', 'N은/는 N을/를/에게 V-게 한다', 2, array[247]),
  ('EFFECT', 'N은/는 N을/를/에게 V-지 못하게 한다', 3, array[247]),
  ('ADDITION', '-(으)ㄹ 수도 있고 ~ -(으)ㄹ 수도 있다', 0, array[247]),
  ('ADDITION', '-기도 하고 ~ -기도 하다', 1, array[247]),
  ('REPORTED_SPEECH', 'N에 따르면 ~다고 한다', 0, array[248]),
  ('REPORTED_SPEECH', 'N에 의하면 ~다고 한다', 1, array[248]),
  ('REPORTED_SPEECH', '(과학자는/친구들은/…) ~ㄴ/는다고 한다', 2, array[248]),
  ('REPORTED_SPEECH', 'N에게 물어보니 ~ㄴ/는다고 한다', 3, array[248]),
  ('REPORTED_SPEECH', 'N을/를 통해 ~다는 사실을 알 수 있다', 4, array[248]),
  ('DEFINITION', 'N은/는 ~다는 뜻이다/말이다', 0, array[248]),
  ('DEFINITION', 'N은/는 ~는 것을 말한다', 1, array[248]),
  ('DEFINITION', 'N의 장점/단점은 ~V-는 것이다', 2, array[248]),
  ('DEFINITION', 'N은/는 ~다는 장점/단점이 있다', 3, array[248]),
  ('PURPOSE_CONDITION', 'V-기 위해서는 ~는 것이 좋다 / ~아/어야 한다', 0, array[248]),
  ('PURPOSE_CONDITION', 'V-(으)려면 ~는 것이 좋다 / ~아/어야 한다', 1, array[248]),
  ('PURPOSE_CONDITION', 'V-(으)면/-(으)ㄴ/는다면 ~(으)ㄹ 것이다 / ~(으)ㄹ 수 있다', 2, array[248]),
  ('PURPOSE_CONDITION', 'V-(으)ㄹ 경우 ~(으)ㄹ 수 있다/없다', 3, array[248]),
  ('PURPOSE_CONDITION', 'V-더라도 / -아/어도 + phủ định', 4, array[248]),
  ('PURPOSE_CONDITION', 'V-아/어야 ~(으)ㄹ 수 있다', 5, array[248]),
  ('PARTIAL_NEGATION', '그러나/하지만 ~다고 해서 ~는 것은 아니다', 0, array[248]),
  ('PARTIAL_NEGATION', '그러나/하지만 무조건 ~는 것은 아니다', 1, array[248]),
  ('PARTIAL_NEGATION', '반드시/꼭 ~아/어야 하는 것은 아니다', 2, array[248]),
  ('COMPARISON', 'V-는 것보다 ~는 것이 더 중요하다', 0, array[248]),
  ('COMPARISON', 'N보다는 ~는 것이 더 좋다/낫다', 1, array[248]),
  ('COMPARISON', 'V-는 것도 중요하지만 V-는 것도 중요하다', 2, array[248]),
  ('COMPARISON', 'V-지 말고 ~V-는 것이 좋다', 3, array[248]),
  ('COMPARISON', 'N이/가 아니라 N이다', 4, array[248]),
  ('DEPENDENCY_OTHER', 'N에 따라 N이/가 다르다(달라진다)', 0, array[249]),
  ('DEPENDENCY_OTHER', '얼마나 ~느냐에 따라 N이/가 달라진다', 1, array[249]),
  ('DEPENDENCY_OTHER', 'N은/는 N에 달려 있다', 2, array[249]),
  ('DEPENDENCY_OTHER', 'N은/는 얼마나 ~V-느냐에/A-냐에 달려 있다', 3, array[249]),
  ('DEPENDENCY_OTHER', '어떤/얼마나 ~(으)ㄴ/는지 모르다', 4, array[249]),
  ('DEPENDENCY_OTHER', 'V-는 데 시간이 많이 걸린다', 5, array[249]),
  ('DEPENDENCY_OTHER', 'V-는 데 비용이 많이 든다', 6, array[249])
) as source(relation_code, pattern_ko, sort_order, source_pages)
join public.topik_writing_52_relations r on r.code = source.relation_code;

insert into public.topik_writing_51_exercises(source_key, source_id, exercise_group, intent_code, title_ko, body_ko, blank_count, source_pages, answer_source_pages, source_type, status, review_status) values
  ('Q51_SECTION_FUTURE_PLAN_1', (select id from public.topik_sources where source_key = 'TOPIK_3_4_PHUONG_ANH_B11_2'), 'SECTION_PRACTICE', 'FUTURE_PLAN', null, '‘사진사랑’ 동호회 회원들은 그동안 좋은 사진을 많이 찍었습니다. 그래서 이번에 ________________. 전시회에 많은 관심 가져 주시면 감사하겠습니다.', 1, array[229], array[341], 'SOURCE_BOOK', 'PUBLISHED', 'VERIFIED'),
  ('Q51_SECTION_FUTURE_PLAN_2', (select id from public.topik_sources where source_key = 'TOPIK_3_4_PHUONG_ANH_B11_2'), 'SECTION_PRACTICE', 'FUTURE_PLAN', null, '우리 시에서는 매주 토요일 ‘알뜰 시장’이 열립니다. 이 시장에는 우리 동네 주민이면 누구나 ____________________. 여러분의 참여와 관심을 부탁드립니다.', 1, array[229], array[341], 'SOURCE_BOOK', 'PUBLISHED', 'VERIFIED'),
  ('Q51_SECTION_FUTURE_PLAN_3', (select id from public.topik_sources where source_key = 'TOPIK_3_4_PHUONG_ANH_B11_2'), 'SECTION_PRACTICE', 'FUTURE_PLAN', null, '다음 주에 우리 모임에서 스키를 타러 갑니다. 스키복은 각자 준비해 오셔도 되고 스키장 대여점에서 ___________________. 빌리는 비용은 홈페이지를 보시기 바랍니다.', 1, array[229], array[341], 'SOURCE_BOOK', 'PUBLISHED', 'VERIFIED'),
  ('Q51_SECTION_FUTURE_PLAN_4', (select id from public.topik_sources where source_key = 'TOPIK_3_4_PHUONG_ANH_B11_2'), 'SECTION_PRACTICE', 'FUTURE_PLAN', null, '답변: 저희는 프로그램에 참여하시는 외국인들에게 영어로 _____________________. 안내를 하시는 분도 모두 외국인이라서 불편하지 않으실 겁니다.', 1, array[229], array[341], 'SOURCE_BOOK', 'PUBLISHED', 'VERIFIED'),
  ('Q51_SECTION_FUTURE_PLAN_5', (select id from public.topik_sources where source_key = 'TOPIK_3_4_PHUONG_ANH_B11_2'), 'SECTION_PRACTICE', 'FUTURE_PLAN', null, '회원 여러분들께 양해 말씀 드립니다. 물품 부족으로 오늘 드리기로 했던 10주년 기념품을 하루 늦은 ______________________. 내일까지 기다리게 해서 죄송합니다.', 1, array[229], array[341], 'SOURCE_BOOK', 'PUBLISHED', 'VERIFIED'),
  ('Q51_SECTION_FUTURE_PLAN_6', (select id from public.topik_sources where source_key = 'TOPIK_3_4_PHUONG_ANH_B11_2'), 'SECTION_PRACTICE', 'FUTURE_PLAN', null, '벌써 한 해가 끝나가는 12월이 되었습니다. 그래서 다음주 금요일에 ________________________. 송년회에는 외국인 학생이면 누구나 참석할 수 있습니다. 많은 참여 바랍니다.', 1, array[229], array[341], 'SOURCE_BOOK', 'PUBLISHED', 'VERIFIED'),
  ('Q51_SECTION_FUTURE_PLAN_7', (select id from public.topik_sources where source_key = 'TOPIK_3_4_PHUONG_ANH_B11_2'), 'SECTION_PRACTICE', 'FUTURE_PLAN', null, '도와주신 덕분에 프로젝트를 성공적으로 마쳤습니다. 감사하는 마음으로 ____________________. 여러분을 위해 준비한 자리이니 오셔서 축하 파티를 즐기시면 됩니다.', 1, array[229], array[341], 'SOURCE_BOOK', 'PUBLISHED', 'NEEDS_REVIEW'),
  ('Q51_SECTION_PAST_EXPERIENCE_1', (select id from public.topik_sources where source_key = 'TOPIK_3_4_PHUONG_ANH_B11_2'), 'SECTION_PRACTICE', 'PAST_EXPERIENCE', null, '지난주 학생 식당에서 _____________________. 혹시 지갑을 보시거나 주우신 분은 아래 연락처로 연락 주시기 바랍니다.', 1, array[230], array[341], 'SOURCE_BOOK', 'PUBLISHED', 'VERIFIED'),
  ('Q51_SECTION_PAST_EXPERIENCE_2', (select id from public.topik_sources where source_key = 'TOPIK_3_4_PHUONG_ANH_B11_2'), 'SECTION_PRACTICE', 'PAST_EXPERIENCE', null, '학생 식당 앞에서 ___________________. 식당 카드를 잃어버리신 분은 카운터에 와서 _____________________. 제가 거기에 식당 카드를 맡겨 두었습니다.', 2, array[230], array[341], 'SOURCE_BOOK', 'PUBLISHED', 'VERIFIED'),
  ('Q51_SECTION_PAST_EXPERIENCE_3', (select id from public.topik_sources where source_key = 'TOPIK_3_4_PHUONG_ANH_B11_2'), 'SECTION_PRACTICE', 'PAST_EXPERIENCE', null, '문의: 전통 문화 프로그램에 관심이 많은 외국인입니다. 그런데 저는 영어는 잘하지만 한국말은 아직 _____________________. 그래도 괜찮으면 신청하고 싶습니다.', 1, array[230], array[341], 'SOURCE_BOOK', 'PUBLISHED', 'VERIFIED'),
  ('Q51_SECTION_PAST_EXPERIENCE_4', (select id from public.topik_sources where source_key = 'TOPIK_3_4_PHUONG_ANH_B11_2'), 'SECTION_PRACTICE', 'PAST_EXPERIENCE', null, '여행용 가방을 구입했습니다. 그런데 지퍼를 열려고 해도 잘 ______________________. 지퍼가 불량인 것 같습니다. 교환해 주셨으면 감사합니다.', 1, array[230], array[341], 'SOURCE_BOOK', 'PUBLISHED', 'VERIFIED'),
  ('Q51_SECTION_REQUEST_FAVOR_1', (select id from public.topik_sources where source_key = 'TOPIK_3_4_PHUONG_ANH_B11_2'), 'SECTION_PRACTICE', 'REQUEST_FAVOR', null, '문의: 이번 주말에 행복 펜션 203호를 예약한 사람입니다. 그런데 저는 차가 없어서 버스를 타려고 하는데 버스로 가는 방법을 좀 ___________________?', 1, array[231], array[342], 'SOURCE_BOOK', 'PUBLISHED', 'VERIFIED'),
  ('Q51_SECTION_REQUEST_FAVOR_2', (select id from public.topik_sources where source_key = 'TOPIK_3_4_PHUONG_ANH_B11_2'), 'SECTION_PRACTICE', 'REQUEST_FAVOR', null, '제 블로그를 사랑해 주신 분들께 감사드립니다. 개인 사정으로 잠시 쉬려고 합니다. 다시 블로그를 시작할 때까지 _______________________. 꼭 기다림에 보답하겠습니다.', 1, array[231], array[342], 'SOURCE_BOOK', 'PUBLISHED', 'VERIFIED'),
  ('Q51_SECTION_REQUEST_FAVOR_3', (select id from public.topik_sources where source_key = 'TOPIK_3_4_PHUONG_ANH_B11_2'), 'SECTION_PRACTICE', 'REQUEST_FAVOR', null, '기차표를 예매했는데 기차를 놓치고 말았습니다. 친구들에게 물어 보니 기차가 출발한 후에도 _______________________. 어떻게 하면 환불 받을 수 있는지 알고 싶습니다.', 1, array[231], array[342], 'SOURCE_BOOK', 'PUBLISHED', 'VERIFIED'),
  ('Q51_SECTION_REQUEST_FAVOR_4', (select id from public.topik_sources where source_key = 'TOPIK_3_4_PHUONG_ANH_B11_2'), 'SECTION_PRACTICE', 'REQUEST_FAVOR', null, '콘서트 표를 예매하려고 합니다. 그런데 제 컴퓨터는 인터넷 속도가 느려서 힘들 것 같습니다. 혹시 저 대신 콘서트 표를 __________________________________?', 1, array[231], array[342], 'SOURCE_BOOK', 'PUBLISHED', 'VERIFIED'),
  ('Q51_SECTION_REQUEST_FAVOR_5', (select id from public.topik_sources where source_key = 'TOPIK_3_4_PHUONG_ANH_B11_2'), 'SECTION_PRACTICE', 'REQUEST_FAVOR', null, '컴퓨터가 고장 났는데 보고서를 써야 해서 급히 수리를 해야합니다. 우리 반 친구들 중에서 만수 씨가 제일 _________________________ 이야기를 들었습니다. 컴퓨터 수리를 부탁드려도 되겠습니까?', 1, array[231], array[342], 'SOURCE_BOOK', 'PUBLISHED', 'VERIFIED'),
  ('Q51_SECTION_REQUEST_FAVOR_6', (select id from public.topik_sources where source_key = 'TOPIK_3_4_PHUONG_ANH_B11_2'), 'SECTION_PRACTICE', 'REQUEST_FAVOR', null, '다음 주에 신입생 환영회를 하려고 합니다. 선배님이 오셔서 신입생들에게 대학 생활에 대해 __________________. 조언을 듣고 싶어하는 후배들이 많습니다. 부탁드립니다.', 1, array[231], array[342], 'SOURCE_BOOK', 'PUBLISHED', 'VERIFIED'),
  ('Q51_SECTION_REQUEST_COMMAND_1', (select id from public.topik_sources where source_key = 'TOPIK_3_4_PHUONG_ANH_B11_2'), 'SECTION_PRACTICE', 'REQUEST_COMMAND', null, '답변: 버스 시간은 홈페이지에 자세히 ___________________. 그런데 짐이 많으면 버스 터미널에 내려서 저에게 ________________________. 전화 받고 출발하면 20분 내에 모시러 갈 수 있습니다.', 2, array[232, 233], array[342], 'SOURCE_BOOK', 'PUBLISHED', 'VERIFIED'),
  ('Q51_SECTION_REQUEST_COMMAND_2', (select id from public.topik_sources where source_key = 'TOPIK_3_4_PHUONG_ANH_B11_2'), 'SECTION_PRACTICE', 'REQUEST_COMMAND', null, '이번 시험 기간에 학생회에서 샌드위치를 무료로 나눠 드립니다. 오실 때에는 반드시 학생증을 _________________________________. 죄송하지만 학생증이 없으면 드릴 수 없습니다.', 1, array[232, 233], array[342], 'SOURCE_BOOK', 'PUBLISHED', 'VERIFIED'),
  ('Q51_SECTION_REQUEST_COMMAND_3', (select id from public.topik_sources where source_key = 'TOPIK_3_4_PHUONG_ANH_B11_2'), 'SECTION_PRACTICE', 'REQUEST_COMMAND', null, '이번 노래 자랑 대회에는 선착순으로 입장할 수 있습니다. 그리고 오시는 순서대로 자리에 ___________________. 자리가 없는 분은 서서 관람하셔도 됩니다.', 1, array[232, 233], array[342], 'SOURCE_BOOK', 'PUBLISHED', 'VERIFIED'),
  ('Q51_SECTION_REQUEST_COMMAND_4', (select id from public.topik_sources where source_key = 'TOPIK_3_4_PHUONG_ANH_B11_2'), 'SECTION_PRACTICE', 'REQUEST_COMMAND', null, '밤에는 세탁기나 청소기를 ___________________________________. 시끄러워서 다른 이웃들이 잠을 자거나 쉴 수 없습니다. 특히 밤에는 낮보다 소리가 _________________. 주의해 주시기 바랍니다.', 2, array[232, 233], array[342], 'SOURCE_BOOK', 'PUBLISHED', 'VERIFIED'),
  ('Q51_SECTION_REQUEST_COMMAND_5', (select id from public.topik_sources where source_key = 'TOPIK_3_4_PHUONG_ANH_B11_2'), 'SECTION_PRACTICE', 'REQUEST_COMMAND', null, '이곳에 쓰레기를 ______________________. 여기는 쓰레기를 버리는 곳이 아닙니다. CCTV가 설치되어 있으니 주의하시기 바랍니다.', 1, array[232, 233], array[342], 'SOURCE_BOOK', 'PUBLISHED', 'VERIFIED'),
  ('Q51_SECTION_REQUEST_COMMAND_6', (select id from public.topik_sources where source_key = 'TOPIK_3_4_PHUONG_ANH_B11_2'), 'SECTION_PRACTICE', 'REQUEST_COMMAND', null, '공연장 안에 음료를 ___________________________. 반드시 공연장 밖에서 다 드시고 빈 컵은 휴지통에 버려 주시기 바랍니다.', 1, array[232, 233], array[342], 'SOURCE_BOOK', 'PUBLISHED', 'VERIFIED'),
  ('Q51_SECTION_REQUEST_COMMAND_7', (select id from public.topik_sources where source_key = 'TOPIK_3_4_PHUONG_ANH_B11_2'), 'SECTION_PRACTICE', 'REQUEST_COMMAND', null, '비밀 번호를 잊어버려서 변경하려고 합니다. 그런데 어떻게 ________________________ . 아무리 찾아 봐도 변경 방법에 대한 안내가 없습니다.', 1, array[232, 233], array[342], 'SOURCE_BOOK', 'PUBLISHED', 'VERIFIED'),
  ('Q51_SECTION_REQUEST_INFORMATION_1', (select id from public.topik_sources where source_key = 'TOPIK_3_4_PHUONG_ANH_B11_2'), 'SECTION_PRACTICE', 'REQUEST_INFORMATION', null, '문의: 이번에 시청에서 다문화 강사를 모집한다고 들었습니다. 저는 외국인인데 어떤 ______________________? 또 서류는 언제까지 접수해야 합니까?', 1, array[233], array[343], 'SOURCE_BOOK', 'PUBLISHED', 'VERIFIED'),
  ('Q51_SECTION_REQUEST_INFORMATION_2', (select id from public.topik_sources where source_key = 'TOPIK_3_4_PHUONG_ANH_B11_2'), 'SECTION_PRACTICE', 'REQUEST_INFORMATION', null, '한국 친구한테서 집들이 초대를 받았습니다. 그런데 집들이에 갈 때 어떤 ______________________? 저는 한국 사람이 아니라서 집들이 선물에 대해 잘 모르겠습니다.', 1, array[233], array[343], 'SOURCE_BOOK', 'PUBLISHED', 'VERIFIED'),
  ('Q51_SECTION_REFUSAL_INCONVENIENCE_1', (select id from public.topik_sources where source_key = 'TOPIK_3_4_PHUONG_ANH_B11_2'), 'SECTION_PRACTICE', 'REFUSAL_INCONVENIENCE', null, '이번 주말에 원룸 옥상에서 생일 파티를 하려고 합니다. 조금 시끄럽더라도 ________________. 늦어도 12시 전에는 파티를 끝내도록 하겠습니다.', 1, array[234], array[343], 'SOURCE_BOOK', 'PUBLISHED', 'VERIFIED'),
  ('Q51_SECTION_REFUSAL_INCONVENIENCE_2', (select id from public.topik_sources where source_key = 'TOPIK_3_4_PHUONG_ANH_B11_2'), 'SECTION_PRACTICE', 'REFUSAL_INCONVENIENCE', null, '오늘부터 504호에서 내부 인테리어 공사를 시작합니다. 공사로 소음이 발생하더라도 _____________________. 최대한 빨리 공사를 마치도록 하겠습니다.', 1, array[234], array[343], 'SOURCE_BOOK', 'PUBLISHED', 'VERIFIED'),
  ('Q51_SECTION_REFUSAL_INCONVENIENCE_3', (select id from public.topik_sources where source_key = 'TOPIK_3_4_PHUONG_ANH_B11_2'), 'SECTION_PRACTICE', 'REFUSAL_INCONVENIENCE', null, '죄송합니다, 내일 점심 약속을 ____________________. 아이가 아파서 병원에 가야 합니다. 대신 다음에 제가 점심을 사겠습니다.', 1, array[234], array[343], 'SOURCE_BOOK', 'PUBLISHED', 'VERIFIED'),
  ('Q51_SECTION_REFUSAL_INCONVENIENCE_4', (select id from public.topik_sources where source_key = 'TOPIK_3_4_PHUONG_ANH_B11_2'), 'SECTION_PRACTICE', 'REFUSAL_INCONVENIENCE', null, '제 90회 시험을 보려고 신청했는데 개인적인 사정으로 ____________________. 취소하는 방법에 대해 알고 싶습니다. 빠른 답변 부탁드립니다.', 1, array[234], array[343], 'SOURCE_BOOK', 'PUBLISHED', 'VERIFIED'),
  ('Q51_SECTION_REFUSAL_INCONVENIENCE_5', (select id from public.topik_sources where source_key = 'TOPIK_3_4_PHUONG_ANH_B11_2'), 'SECTION_PRACTICE', 'REFUSAL_INCONVENIENCE', null, '콘서트 표를 대신 예매해 달라고 부탁하셨는데 제가 그날 다른 일이 있어서 표를 _______________. 죄송하지만 다른 분께 부탁을 해 보시기 바랍니다.', 1, array[234], array[343], 'SOURCE_BOOK', 'PUBLISHED', 'VERIFIED'),
  ('Q51_SECTION_REFUSAL_INCONVENIENCE_6', (select id from public.topik_sources where source_key = 'TOPIK_3_4_PHUONG_ANH_B11_2'), 'SECTION_PRACTICE', 'REFUSAL_INCONVENIENCE', null, '죄송합니다. 지금 제가 급한 일이 있어서 _____________________. 대신 제가 아는 분께 고쳐 달라고 부탁드려보겠습니다. 곧 연락드리겠습니다.', 1, array[234], array[343], 'SOURCE_BOOK', 'PUBLISHED', 'VERIFIED'),
  ('Q51_SECTION_THANK_APOLOGY_CONGRATS_1', (select id from public.topik_sources where source_key = 'TOPIK_3_4_PHUONG_ANH_B11_2'), 'SECTION_PRACTICE', 'THANK_APOLOGY_CONGRATS', null, '선배님, 이번에 원하던 회사에 ____________________________ 들었습니다. 선배님의 취직을 진심으로 축하드립니다. 앞으로 좋은 일만 가득하길 바랍니다.', 1, array[235, 236], array[343], 'SOURCE_BOOK', 'PUBLISHED', 'VERIFIED'),
  ('Q51_SECTION_THANK_APOLOGY_CONGRATS_2', (select id from public.topik_sources where source_key = 'TOPIK_3_4_PHUONG_ANH_B11_2'), 'SECTION_PRACTICE', 'THANK_APOLOGY_CONGRATS', null, '오래 전부터 기다리던 사람을 만나서 드디어 결혼을 하게 되었습니다. 바쁘시더라도 오셔서 ___________________. 축하해 주시는 모든 분들의 마음을 생각하며 서로 아끼고 사랑하며 살아가겠습니다.', 1, array[235, 236], array[343], 'SOURCE_BOOK', 'PUBLISHED', 'VERIFIED'),
  ('Q51_SECTION_THANK_APOLOGY_CONGRATS_3', (select id from public.topik_sources where source_key = 'TOPIK_3_4_PHUONG_ANH_B11_2'), 'SECTION_PRACTICE', 'THANK_APOLOGY_CONGRATS', null, '그저께 소나기가 오는 날 저에게 ______________________ 감사합니다. 우산이 없었으면 옷이 젖어서 감기에 걸릴 뻔했습니다. 내일 학교에 가서 우산을 돌려 드리겠습니다.', 1, array[235, 236], array[343], 'SOURCE_BOOK', 'PUBLISHED', 'VERIFIED'),
  ('Q51_SECTION_THANK_APOLOGY_CONGRATS_4', (select id from public.topik_sources where source_key = 'TOPIK_3_4_PHUONG_ANH_B11_2'), 'SECTION_PRACTICE', 'THANK_APOLOGY_CONGRATS', null, '선배님, 우리가 제주도에 있는 동안 친절하게 ___________________ 감사합니다. 선배님의 안내 덕분에 기억에 남는 즐거운 여행이 되었습니다.', 1, array[235, 236], array[343], 'SOURCE_BOOK', 'PUBLISHED', 'VERIFIED'),
  ('Q51_SECTION_THANK_APOLOGY_CONGRATS_5', (select id from public.topik_sources where source_key = 'TOPIK_3_4_PHUONG_ANH_B11_2'), 'SECTION_PRACTICE', 'THANK_APOLOGY_CONGRATS', null, '개인 사정으로 이번 달까지만 일할 수 있을 것 같습니다. 갑자기 __________________ 죄송합니다. 그동안 가족처럼 돌봐 주셔서 감사드립니다. 따뜻한 마음을 잊지 않겠습니다.', 1, array[235, 236], array[343], 'SOURCE_BOOK', 'PUBLISHED', 'VERIFIED'),
  ('Q51_SECTION_THANK_APOLOGY_CONGRATS_6', (select id from public.topik_sources where source_key = 'TOPIK_3_4_PHUONG_ANH_B11_2'), 'SECTION_PRACTICE', 'THANK_APOLOGY_CONGRATS', null, '그날 행사가 예정보다 늦게 시작됐습니다. 저희 잘못으로 바쁘신 분들을 1시간이나 _________________ 죄송합니다. 다음부터는 제시간에 시작하도록 하겠습니다.', 1, array[235, 236], array[343], 'SOURCE_BOOK', 'PUBLISHED', 'VERIFIED'),
  ('Q51_SECTION_THANK_APOLOGY_CONGRATS_7', (select id from public.topik_sources where source_key = 'TOPIK_3_4_PHUONG_ANH_B11_2'), 'SECTION_PRACTICE', 'THANK_APOLOGY_CONGRATS', null, '길을 잃은 저희들에게 길 안내는 물론이고 직접 만든__________________ 감사합니다. 게다가 음식 값도 안 받으셔서 어떻게 감사한 마음을 전해야 할지 모르겠습니다.', 1, array[235, 236], array[343], 'SOURCE_BOOK', 'PUBLISHED', 'VERIFIED'),
  ('Q51_MIXED_01', (select id from public.topik_sources where source_key = 'TOPIK_3_4_PHUONG_ANH_B11_2'), 'MIXED_PRACTICE', null, '원룸 문의', '제목 원룸 문의
Q 안녕하세요? 원룸을 찾고 있는데 원하는 조건이 있습니다.
우선 지하철 역에서 (ㄱ).
그런데 역 근처라도 너무 시끄럽지 않아야 합니다.
A 햇빛이 잘 들지 않아서 좀 어둡기는 하지만 손님이 원하시는 방이 하나 있습니다.
마침 지금 그 방이 (ㄴ). 그래서 언제든지 바로 들어가서 살 수 있습니다.
원하시면 빨리 연락해 주십시오.', 2, array[236], array[344], 'SOURCE_BOOK', 'PUBLISHED', 'VERIFIED'),
  ('Q51_MIXED_02', (select id from public.topik_sources where source_key = 'TOPIK_3_4_PHUONG_ANH_B11_2'), 'MIXED_PRACTICE', null, '바자회 안내', '바자회 안내
우리 학생회에서는 연말을 맞아 바자회를 열려고 합니다.
자세한 일정은 게시판을 보고 (ㄱ).
확인 후에도 문의사항이 있으시면 전화해 주십시오.
그리고 바자회 장소에는 주차할 공간이 부족합니다.
불편하시더라도 대중교통을 (ㄴ).
그럼, 협조 부탁드립니다.', 2, array[237], array[344], 'SOURCE_BOOK', 'PUBLISHED', 'VERIFIED'),
  ('Q51_MIXED_03', (select id from public.topik_sources where source_key = 'TOPIK_3_4_PHUONG_ANH_B11_2'), 'MIXED_PRACTICE', null, '분실물 문의', '제목 분실물 문의
Q 제가 오전에 기차에다가 가방을 (ㄱ).
혹시 찾을 수 있습니까? 확인 좀 부탁드립니다.
A 고객님, 분실물을 확인해 보니 가방이 두 개 있습니다.
까만색과 회색 가방이 있는데 오셔서 확인해 주시기 바랍니다.
그리고 저희 센터는 5시에 문을 닫습니다.
그러니까 (ㄴ).
감사합니다.', 2, array[237], array[344], 'SOURCE_BOOK', 'PUBLISHED', 'VERIFIED'),
  ('Q51_MIXED_04', (select id from public.topik_sources where source_key = 'TOPIK_3_4_PHUONG_ANH_B11_2'), 'MIXED_PRACTICE', null, '남자 옷 팝니다', '남자 옷 팝니다
남자 옷이 필요하신 분들께 알립니다.
사이즈가 안 맞아서 제가 입던 (ㄱ).
이 코트는 소재도 좋고 따뜻합니다.
그리고 그동안 옷 관리에 신경을 많이 썼기 때문에
중고 옷이지만 (ㄴ).
새 옷 같은 중고를 아주 저렴하게 드립니다.
아래 사진을 보시고 연락해 주십시오.', 2, array[238], array[344], 'SOURCE_BOOK', 'PUBLISHED', 'VERIFIED'),
  ('Q51_MIXED_05', (select id from public.topik_sources where source_key = 'TOPIK_3_4_PHUONG_ANH_B11_2'), 'MIXED_PRACTICE', null, '개인 광고 금지 안내', '개인 광고 금지 안내
회원 여러분, 이곳은 물건을 판매하는 곳이 아닙니다.
홈페이지 게시판에 물건을 파는 글을 (ㄱ).
만약 광고용 글이 올라오면 바로 (ㄴ).
지우기 전에 따로 연락드리지 않겠습니다.
게시판 이용 규칙을 잘 지켜 주시면 감사하겠습니다.
감사합니다.', 2, array[238], array[344], 'SOURCE_BOOK', 'PUBLISHED', 'VERIFIED'),
  ('Q51_MIXED_06', (select id from public.topik_sources where source_key = 'TOPIK_3_4_PHUONG_ANH_B11_2'), 'MIXED_PRACTICE', null, '양해 말씀 드립니다', '양해 말씀 드립니다
죄송합니다.
회원 여러분께 모임 날짜를 (ㄱ).
21일인데 20일로 알려 드린 점 양해 부탁드립니다.
바뀐 날짜는 홈페이지를 통해 다시 공지하겠습니다.
홈페이지 안내를 다시 한 번 (ㄴ).
확인 후, 궁금하신 점이 있으면 연락해 주십시오.', 2, array[239], array[344], 'SOURCE_BOOK', 'PUBLISHED', 'VERIFIED'),
  ('Q51_MIXED_07', (select id from public.topik_sources where source_key = 'TOPIK_3_4_PHUONG_ANH_B11_2'), 'MIXED_PRACTICE', null, '가격 인상 안내', '가격 인상 안내
그동안 우리 카페에서는 신선하고 맛있는 케이크를 다른 카페보다 (ㄱ).
그런데 더 이상 싼 가격을 유지하기가 어려워졌습니다.
재료비가 올라서 다음 달 부터 케이크 가격을 (ㄴ).
가격 인상에 대한 여러분의 이해와 양해를 부탁드립니다.
앞으로도 좋은 품질과 서비스로 보답하겠습니다.', 2, array[239], array[344], 'SOURCE_BOOK', 'PUBLISHED', 'VERIFIED'),
  ('Q51_MIXED_08', (select id from public.topik_sources where source_key = 'TOPIK_3_4_PHUONG_ANH_B11_2'), 'MIXED_PRACTICE', null, '공동 주방 이용 안내', '공동 주방 이용 안내
공동 주방 이용 시 다음 사항을 잘 지켜 주시기 바랍니다.
조리 도구는 사용 후 제자리에 (ㄱ).
제자리에 있어야 다른 사람이 이용할 때 찾기가 쉽습니다.
그리고 전자 제품은 사용 후 (ㄴ).
전원을 켜 놓으면 불이 날 수도 있어서 위험합니다.
모두가 함께 쓰는 공간이니까 잊지 마시기 바랍니다.', 2, array[240], array[344], 'SOURCE_BOOK', 'PUBLISHED', 'VERIFIED'),
  ('Q51_MIXED_09', (select id from public.topik_sources where source_key = 'TOPIK_3_4_PHUONG_ANH_B11_2'), 'MIXED_PRACTICE', null, '송년 모임 장소 변경 안내', '송년 모임 장소 변경 안내
이번 주 토요일에 우리 반 교실에서 송년 모임을 하기로 했는데 난방이 안 된다고 해서 학생회관으로 장소를 (ㄱ).
학생회관은 학교 도서관 맞은 편에 있습니다.
혹시 위치를 모르시면 학교 홈페이지를 보시기 바랍니다.
거기에 위치 안내가 자세히 (ㄴ).', 2, array[240], array[344], 'SOURCE_BOOK', 'PUBLISHED', 'VERIFIED'),
  ('Q51_MIXED_10', (select id from public.topik_sources where source_key = 'TOPIK_3_4_PHUONG_ANH_B11_2'), 'MIXED_PRACTICE', null, null, '안녕하세요? 미영 씨.
어제 회사에서 받은 홍보 자료를 찾을 수가 없습니다.
혹시, 그 자료를 제 이메일로 좀 (ㄱ)?
그리고 내일 회의에서 발표할 자료를 만들어 봤는데 제가 한국어를 잘 못해서 부족한 부분이 많습니다.
미영 씨가 자료를 한번 보시고 저에게 (ㄴ).
그 조언이 제게는 큰 도움이 될 것 같습니다.
감사합니다.', 2, array[241], array[344], 'SOURCE_BOOK', 'PUBLISHED', 'VERIFIED'),
  ('Q51_MIXED_11', (select id from public.topik_sources where source_key = 'TOPIK_3_4_PHUONG_ANH_B11_2'), 'MIXED_PRACTICE', null, null, '교수님 안녕하십니까?
지난해에 졸업한 김민수라고 합니다.
입사 원서를 내려고 하는데 회사에 문의를 해 보니 지원하려면 교수님의 추천서가 (ㄱ).
바쁘시겠지만 교수님께 추천서를 (ㄴ)?
자주 연락도 못 드렸는데 갑자기 부탁을 드려서 죄송합니다.
항상 건강하시길 바랍니다. 감사합니다.
김민수 올림', 2, array[241], array[345], 'SOURCE_BOOK', 'PUBLISHED', 'VERIFIED'),
  ('Q51_MIXED_12', (select id from public.topik_sources where source_key = 'TOPIK_3_4_PHUONG_ANH_B11_2'), 'MIXED_PRACTICE', null, '모임시간 변경 안내', '모임시간 변경 안내
이번 토요일 낮 12시에 모임을 가지기로 했는데 사정이 생겨서 (ㄱ).
저녁 6시나 7시로 바꾸는 게 좋을 것 같은데 둘 중 어느 시간이 (ㄴ).
그리고 선택한 시간을 문자 메시지로 보내주시면 감사하겠습니다.
그럼, 답변 기다리겠습니다.', 2, array[242], array[345], 'SOURCE_BOOK', 'PUBLISHED', 'VERIFIED'),
  ('Q51_MIXED_13', (select id from public.topik_sources where source_key = 'TOPIK_3_4_PHUONG_ANH_B11_2'), 'MIXED_PRACTICE', null, '유학생 ‘송년회’에 초대합니다', '유학생 ‘송년회’에 초대합니다
벌써 한 해가 끝나 가고 있습니다.
우리 유학생회에서는 한 해를 마무리하는 12월에 (ㄱ).
이번 송년회에는 유학생들이 다양한 (ㄴ).
공연 준비를 위해 한 달 동안 연습했습니다.
멋진 공연, 기대하셔도 좋습니다.', 2, array[242], array[345], 'SOURCE_BOOK', 'PUBLISHED', 'VERIFIED'),
  ('Q51_MIXED_14', (select id from public.topik_sources where source_key = 'TOPIK_3_4_PHUONG_ANH_B11_2'), 'MIXED_PRACTICE', null, '여행 가이드 선생님께', '여행 가이드 선생님께
여행하는 동안 친절하게 안내해 주셔서 감사합니다.
그 전에는 역사에 관심이 없었는데 설명을 너무 재미있게 해 주셔서 역사에 (ㄱ).
그리고 전통 문화에 대해서도 자세히 알려 주셨습니다.
설명을 듣지 않았다면 이런 문화가 있는 줄도 (ㄴ).
여행을 하면서 많이 배웠습니다. 감사합니다.', 2, array[243], array[345], 'SOURCE_BOOK', 'PUBLISHED', 'VERIFIED'),
  ('Q51_MIXED_15', (select id from public.topik_sources where source_key = 'TOPIK_3_4_PHUONG_ANH_B11_2'), 'MIXED_PRACTICE', null, null, '민수 씨, 이번에 시험에 합격했다고 들었습니다.
먼저 민수 씨의 (ㄱ).
그래서 축하 모임을 가지려고 합니다.
제가 벌써 친구들한테도 연락하고 식당도 (ㄴ).
이번 주 토요일, 민수 씨는 한국 식당으로 오시기만 하면 됩니다.
그럼, 그날 뵙겠습니다.', 2, array[243], array[345], 'SOURCE_BOOK', 'PUBLISHED', 'VERIFIED'),
  ('Q51_MIXED_16', (select id from public.topik_sources where source_key = 'TOPIK_3_4_PHUONG_ANH_B11_2'), 'MIXED_PRACTICE', null, null, '지난 주말에 어머니와 같이 방문했던 학생입니다.
어머니는 다리가 좀 아프셔서 걷는 것을 (ㄱ).
힘들게 걷는 어머니를 보시고 (ㄴ) 정말 감사합니다.
빌려 주신 휠체어 덕분에 아주 편하게 구경할 수 있었습니다.
감사 인사를 드리고 싶어서 저희 고향 기념품을 하나 보내 드립니다.
다음에 다시 가게 되면 꼭 인사 드리겠습니다.', 2, array[244], array[345], 'SOURCE_BOOK', 'PUBLISHED', 'VERIFIED'),
  ('Q51_MIXED_17', (select id from public.topik_sources where source_key = 'TOPIK_3_4_PHUONG_ANH_B11_2'), 'MIXED_PRACTICE', null, '축제에 다녀 와서', '축제에 다녀 와서
지난 주말에 지역 축제에 다녀왔습니다.
그런데 기대가 컸던 만큼 (ㄱ).
특히, 쓰레기가 너무 많아서 실망했습니다.
그리고 주차장이 너무 좁아서 (ㄴ).
주차가 힘들면 축제장에 안 가는 사람들도 많습니다.
앞으로 쓰레기와 주차 문제에 더 신경 써야 할 것 같습니다.', 2, array[244], array[345], 'SOURCE_BOOK', 'PUBLISHED', 'NEEDS_REVIEW'),
  ('Q51_MIXED_18', (select id from public.topik_sources where source_key = 'TOPIK_3_4_PHUONG_ANH_B11_2'), 'MIXED_PRACTICE', null, '실내 인테리어 장식', '실내 인테리어 장식
실내 장식을 할 때 벽의 색깔은 중요한 역할을 합니다.
왜냐하면 벽 색깔에 따라 (ㄱ).
노란색은 따뜻한 분위기, 하얀색은 깔끔한 분위기를 만들 수 있습니다.
여러분도 실내 분위기를 바꾸고 싶으면 벽 색깔을 (ㄴ).', 2, array[245], array[345], 'SOURCE_BOOK', 'PUBLISHED', 'VERIFIED'),
  ('Q51_MIXED_19', (select id from public.topik_sources where source_key = 'TOPIK_3_4_PHUONG_ANH_B11_2'), 'MIXED_PRACTICE', null, '노트북 구입할 때 이것만은 꼭 확인하세요', '노트북 구입할 때 이것만은 꼭 확인하세요
노트북을 구입하기 전에 확인해 봐야 할 것이 있습니다.
먼저 배터리를 얼마나 (ㄱ) 확인해야 합니다.
주로 밖에서 쓰기 때문에 배터리 사용 가능 시간이 길어야 합니다.
그리고 무게가 (ㄴ).
그래야 언제 어디서나 노트처럼 가볍게 들고 다닐 수 있습니다.', 2, array[245], array[345], 'SOURCE_BOOK', 'PUBLISHED', 'VERIFIED'),
  ('Q51_MIXED_20', (select id from public.topik_sources where source_key = 'TOPIK_3_4_PHUONG_ANH_B11_2'), 'MIXED_PRACTICE', null, '제주도 맛집 ‘제주 식당’ 후기', '제주도 맛집 ‘제주 식당’ 후기
이번 제주도 여행에서 마음에 드는 맛집을 찾았습니다.
특별한 양념을 사용해서 그런지 아주 맛있었습니다.
색깔이 빨개서 매울 줄 알았는데 생각보다 (ㄱ).
그런데 이 집은 준비한 걸 다 팔면 문을 닫으니까 늦게 가면 (ㄴ).
식사를 하시려면 제시간에 가시기 바랍니다.', 2, array[246], array[345], 'SOURCE_BOOK', 'PUBLISHED', 'VERIFIED'),
  ('Q51_MIXED_21', (select id from public.topik_sources where source_key = 'TOPIK_3_4_PHUONG_ANH_B11_2'), 'MIXED_PRACTICE', null, null, '이 책은 한국 문화에 대해 쉽게 설명되어 있습니다.
어휘와 문법이 어렵지 않습니다.
그래서 한국어를 (ㄱ) 얼마 안 된 외국인들도 읽을 수 있습니다.
저는 한국어를 잘 못하지만 재미있게 읽었습니다.
이 책을 꼭 한번 (ㄴ).', 2, array[246], array[346], 'SOURCE_BOOK', 'PUBLISHED', 'VERIFIED')
on conflict (source_key) do update set source_id = excluded.source_id, exercise_group = excluded.exercise_group, intent_code = excluded.intent_code, title_ko = excluded.title_ko, body_ko = excluded.body_ko, blank_count = excluded.blank_count, source_pages = excluded.source_pages, answer_source_pages = excluded.answer_source_pages, source_type = excluded.source_type, status = excluded.status, review_status = excluded.review_status;

delete from public.topik_writing_51_blanks b using public.topik_writing_51_exercises e where e.id = b.exercise_id and e.source_type = 'SOURCE_BOOK';
insert into public.topik_writing_51_blanks(exercise_id, blank_key, blank_order, source_answer_variants, review_note) values
  ((select id from public.topik_writing_51_exercises where source_key = 'Q51_SECTION_FUTURE_PLAN_1'), 'ㄱ', 0, '["전시회를 하려고 합니다"]'::jsonb, null),
  ((select id from public.topik_writing_51_exercises where source_key = 'Q51_SECTION_FUTURE_PLAN_2'), 'ㄱ', 0, '["참여하실 수 있습니다"]'::jsonb, null),
  ((select id from public.topik_writing_51_exercises where source_key = 'Q51_SECTION_FUTURE_PLAN_3'), 'ㄱ', 0, '["빌리셔도 됩니다","빌리실 수 있습니다"]'::jsonb, null),
  ((select id from public.topik_writing_51_exercises where source_key = 'Q51_SECTION_FUTURE_PLAN_4'), 'ㄱ', 0, '["안내를 해 드립니다"]'::jsonb, null),
  ((select id from public.topik_writing_51_exercises where source_key = 'Q51_SECTION_FUTURE_PLAN_5'), 'ㄱ', 0, '["내일 드리게 됐습니다","내일 드릴 예정입니다"]'::jsonb, null),
  ((select id from public.topik_writing_51_exercises where source_key = 'Q51_SECTION_FUTURE_PLAN_6'), 'ㄱ', 0, '["송년회를 하려고 합니다"]'::jsonb, null),
  ((select id from public.topik_writing_51_exercises where source_key = 'Q51_SECTION_FUTURE_PLAN_7'), 'ㄱ', 0, '["축하 파티를 준비했습니다"]'::jsonb, 'Parsed answer page truncates final 다 in ''준비했습니''; normalized to the obvious complete formal ending for implementation. Verify against page image before publishing if strict source fidelity is required.'),
  ((select id from public.topik_writing_51_exercises where source_key = 'Q51_SECTION_PAST_EXPERIENCE_1'), 'ㄱ', 0, '["지갑을 잃어버렸습니다"]'::jsonb, null),
  ((select id from public.topik_writing_51_exercises where source_key = 'Q51_SECTION_PAST_EXPERIENCE_2'), 'ㄱ', 0, '["식당카드를 주웠습니다"]'::jsonb, null),
  ((select id from public.topik_writing_51_exercises where source_key = 'Q51_SECTION_PAST_EXPERIENCE_2'), 'ㄴ', 1, '["찾아가시기 바랍니다","찾아가시면 됩니다"]'::jsonb, null),
  ((select id from public.topik_writing_51_exercises where source_key = 'Q51_SECTION_PAST_EXPERIENCE_3'), 'ㄱ', 0, '["잘 못합니다"]'::jsonb, null),
  ((select id from public.topik_writing_51_exercises where source_key = 'Q51_SECTION_PAST_EXPERIENCE_4'), 'ㄱ', 0, '["열리지 않습니다"]'::jsonb, null),
  ((select id from public.topik_writing_51_exercises where source_key = 'Q51_SECTION_REQUEST_FAVOR_1'), 'ㄱ', 0, '["알려주시겠습니까","알려 주실 수 있습니다"]'::jsonb, null),
  ((select id from public.topik_writing_51_exercises where source_key = 'Q51_SECTION_REQUEST_FAVOR_2'), 'ㄱ', 0, '["기다려 주시면 감사하겠습니다","기다려 주십시오"]'::jsonb, null),
  ((select id from public.topik_writing_51_exercises where source_key = 'Q51_SECTION_REQUEST_FAVOR_3'), 'ㄱ', 0, '["환불받을 수 있다고 합니다"]'::jsonb, null),
  ((select id from public.topik_writing_51_exercises where source_key = 'Q51_SECTION_REQUEST_FAVOR_4'), 'ㄱ', 0, '["예매해 줄 수 있으십니까","예매해 주실 수 있습니까"]'::jsonb, null),
  ((select id from public.topik_writing_51_exercises where source_key = 'Q51_SECTION_REQUEST_FAVOR_5'), 'ㄱ', 0, '["잘 고친다는","수리를 잘한다는"]'::jsonb, null),
  ((select id from public.topik_writing_51_exercises where source_key = 'Q51_SECTION_REQUEST_FAVOR_6'), 'ㄱ', 0, '["조언해 주시면 감사하겠습니다","조언해 주십시오","조언해 주시기 바랍니다"]'::jsonb, null),
  ((select id from public.topik_writing_51_exercises where source_key = 'Q51_SECTION_REQUEST_COMMAND_1'), 'ㄱ', 0, '["나와 있습니다"]'::jsonb, null),
  ((select id from public.topik_writing_51_exercises where source_key = 'Q51_SECTION_REQUEST_COMMAND_1'), 'ㄴ', 1, '["전화해 주십시오","전화 주시기 바랍니다"]'::jsonb, null),
  ((select id from public.topik_writing_51_exercises where source_key = 'Q51_SECTION_REQUEST_COMMAND_2'), 'ㄱ', 0, '["가지고 오시기 바랍니다","가지고 오십시오"]'::jsonb, null),
  ((select id from public.topik_writing_51_exercises where source_key = 'Q51_SECTION_REQUEST_COMMAND_3'), 'ㄱ', 0, '["앉아주시기 바랍니다","앉아 주십시오"]'::jsonb, null),
  ((select id from public.topik_writing_51_exercises where source_key = 'Q51_SECTION_REQUEST_COMMAND_4'), 'ㄱ', 0, '["돌리지 마십시오","사용하지 마십시오"]'::jsonb, null),
  ((select id from public.topik_writing_51_exercises where source_key = 'Q51_SECTION_REQUEST_COMMAND_4'), 'ㄴ', 1, '["더 크게 들립니다"]'::jsonb, null),
  ((select id from public.topik_writing_51_exercises where source_key = 'Q51_SECTION_REQUEST_COMMAND_5'), 'ㄱ', 0, '["버리지 마십시오","버리면 안 됩니다"]'::jsonb, null),
  ((select id from public.topik_writing_51_exercises where source_key = 'Q51_SECTION_REQUEST_COMMAND_6'), 'ㄱ', 0, '["가지고 들어가면 안 됩니다","가지고 들어가지 마십시오"]'::jsonb, null),
  ((select id from public.topik_writing_51_exercises where source_key = 'Q51_SECTION_REQUEST_COMMAND_7'), 'ㄱ', 0, '["변경하는지 모르겠습니다"]'::jsonb, null),
  ((select id from public.topik_writing_51_exercises where source_key = 'Q51_SECTION_REQUEST_INFORMATION_1'), 'ㄱ', 0, '["서류가 필요합니까","서류를 내야 합니까"]'::jsonb, null),
  ((select id from public.topik_writing_51_exercises where source_key = 'Q51_SECTION_REQUEST_INFORMATION_2'), 'ㄱ', 0, '["선물을 준비해야 합니까","선물을 가지고 가야 합니까"]'::jsonb, null),
  ((select id from public.topik_writing_51_exercises where source_key = 'Q51_SECTION_REFUSAL_INCONVENIENCE_1'), 'ㄱ', 0, '["양해해 주시기 바랍니다","이해해 주시기 바랍니다"]'::jsonb, null),
  ((select id from public.topik_writing_51_exercises where source_key = 'Q51_SECTION_REFUSAL_INCONVENIENCE_2'), 'ㄱ', 0, '["양해해 주시면 감사하겠습니다","이해해 주시면 감사하겠습니다"]'::jsonb, null),
  ((select id from public.topik_writing_51_exercises where source_key = 'Q51_SECTION_REFUSAL_INCONVENIENCE_3'), 'ㄱ', 0, '["지키지 못할 것 같습니다"]'::jsonb, null),
  ((select id from public.topik_writing_51_exercises where source_key = 'Q51_SECTION_REFUSAL_INCONVENIENCE_4'), 'ㄱ', 0, '["취소하려고 합니다"]'::jsonb, null),
  ((select id from public.topik_writing_51_exercises where source_key = 'Q51_SECTION_REFUSAL_INCONVENIENCE_5'), 'ㄱ', 0, '["예매하기가 어려울 것 같습니다","예매해 드리지 못할 것 같습니다"]'::jsonb, null),
  ((select id from public.topik_writing_51_exercises where source_key = 'Q51_SECTION_REFUSAL_INCONVENIENCE_6'), 'ㄱ', 0, '["고쳐 드리기가 어려울 것 같습니다","고쳐 드리기가 어렵습니다"]'::jsonb, null),
  ((select id from public.topik_writing_51_exercises where source_key = 'Q51_SECTION_THANK_APOLOGY_CONGRATS_1'), 'ㄱ', 0, '["입사하셨다는 소식을","입사하셨다는 말을","입사하셨다는 이야기를","입사하셨다고"]'::jsonb, null),
  ((select id from public.topik_writing_51_exercises where source_key = 'Q51_SECTION_THANK_APOLOGY_CONGRATS_2'), 'ㄱ', 0, '["축하해 주시면 감사하겠습니다"]'::jsonb, null),
  ((select id from public.topik_writing_51_exercises where source_key = 'Q51_SECTION_THANK_APOLOGY_CONGRATS_3'), 'ㄱ', 0, '["우산을 빌려 주셔서"]'::jsonb, null),
  ((select id from public.topik_writing_51_exercises where source_key = 'Q51_SECTION_THANK_APOLOGY_CONGRATS_4'), 'ㄱ', 0, '["안내해 주셔서"]'::jsonb, null),
  ((select id from public.topik_writing_51_exercises where source_key = 'Q51_SECTION_THANK_APOLOGY_CONGRATS_5'), 'ㄱ', 0, '["그만두게 돼서"]'::jsonb, null),
  ((select id from public.topik_writing_51_exercises where source_key = 'Q51_SECTION_THANK_APOLOGY_CONGRATS_6'), 'ㄱ', 0, '["기다리게 해서"]'::jsonb, null),
  ((select id from public.topik_writing_51_exercises where source_key = 'Q51_SECTION_THANK_APOLOGY_CONGRATS_7'), 'ㄱ', 0, '["음식까지 주셔서","음식도 주셔서"]'::jsonb, null),
  ((select id from public.topik_writing_51_exercises where source_key = 'Q51_MIXED_01'), 'ㄱ', 0, '["가까워야 합니다","가까웠으면 좋겠습니다"]'::jsonb, null),
  ((select id from public.topik_writing_51_exercises where source_key = 'Q51_MIXED_01'), 'ㄴ', 1, '["비어 있습니다"]'::jsonb, null),
  ((select id from public.topik_writing_51_exercises where source_key = 'Q51_MIXED_02'), 'ㄱ', 0, '["확인하시기 바랍니다","확인하십시오"]'::jsonb, null),
  ((select id from public.topik_writing_51_exercises where source_key = 'Q51_MIXED_02'), 'ㄴ', 1, '["이용해 주시기 바랍니다","이용해 주십시오"]'::jsonb, null),
  ((select id from public.topik_writing_51_exercises where source_key = 'Q51_MIXED_03'), 'ㄱ', 0, '["두고 내렸습니다","놓고 내렸습니다"]'::jsonb, null),
  ((select id from public.topik_writing_51_exercises where source_key = 'Q51_MIXED_03'), 'ㄴ', 1, '["5시 전에 오시기 바랍니다"]'::jsonb, null),
  ((select id from public.topik_writing_51_exercises where source_key = 'Q51_MIXED_04'), 'ㄱ', 0, '["코트를 팔려고 합니다"]'::jsonb, null),
  ((select id from public.topik_writing_51_exercises where source_key = 'Q51_MIXED_04'), 'ㄴ', 1, '["새 옷이나 다름없습니다","새 옷이나 같습니다"]'::jsonb, null),
  ((select id from public.topik_writing_51_exercises where source_key = 'Q51_MIXED_05'), 'ㄱ', 0, '["올리지 마십시오","올리면 안 됩니다"]'::jsonb, null),
  ((select id from public.topik_writing_51_exercises where source_key = 'Q51_MIXED_05'), 'ㄴ', 1, '["지우겠습니다","지우도록 하겠습니다"]'::jsonb, null),
  ((select id from public.topik_writing_51_exercises where source_key = 'Q51_MIXED_06'), 'ㄱ', 0, '["잘못 알려드렸습니다"]'::jsonb, null),
  ((select id from public.topik_writing_51_exercises where source_key = 'Q51_MIXED_06'), 'ㄴ', 1, '["확인해 주시기 바랍니다"]'::jsonb, null),
  ((select id from public.topik_writing_51_exercises where source_key = 'Q51_MIXED_07'), 'ㄱ', 0, '["싸게 팔아 왔습니다","싸게 팔았습니다"]'::jsonb, null),
  ((select id from public.topik_writing_51_exercises where source_key = 'Q51_MIXED_07'), 'ㄴ', 1, '["올리게 되었습니다","올릴 예정입니다"]'::jsonb, null),
  ((select id from public.topik_writing_51_exercises where source_key = 'Q51_MIXED_08'), 'ㄱ', 0, '["놓아 두시기 바랍니다"]'::jsonb, null),
  ((select id from public.topik_writing_51_exercises where source_key = 'Q51_MIXED_08'), 'ㄴ', 1, '["전원을 꺼 주시기 바랍니다"]'::jsonb, null),
  ((select id from public.topik_writing_51_exercises where source_key = 'Q51_MIXED_09'), 'ㄱ', 0, '["바꾸려고 합니다"]'::jsonb, null),
  ((select id from public.topik_writing_51_exercises where source_key = 'Q51_MIXED_09'), 'ㄴ', 1, '["나와 있습니다"]'::jsonb, null),
  ((select id from public.topik_writing_51_exercises where source_key = 'Q51_MIXED_10'), 'ㄱ', 0, '["보내 주실 수 있으십니까"]'::jsonb, null),
  ((select id from public.topik_writing_51_exercises where source_key = 'Q51_MIXED_10'), 'ㄴ', 1, '["조언을 해 주시면 감사하겠습니다"]'::jsonb, null),
  ((select id from public.topik_writing_51_exercises where source_key = 'Q51_MIXED_11'), 'ㄱ', 0, '["필요하다고 합니다"]'::jsonb, null),
  ((select id from public.topik_writing_51_exercises where source_key = 'Q51_MIXED_11'), 'ㄴ', 1, '["부탁을 드려도 되겠습니까"]'::jsonb, null),
  ((select id from public.topik_writing_51_exercises where source_key = 'Q51_MIXED_12'), 'ㄱ', 0, '["시간을 변경하려고 합니다","시간을 바꾸려고 합니다"]'::jsonb, null),
  ((select id from public.topik_writing_51_exercises where source_key = 'Q51_MIXED_12'), 'ㄴ', 1, '["좋은지 선택해 주십시오"]'::jsonb, null),
  ((select id from public.topik_writing_51_exercises where source_key = 'Q51_MIXED_13'), 'ㄱ', 0, '["송년회를 하려고 합니다"]'::jsonb, null),
  ((select id from public.topik_writing_51_exercises where source_key = 'Q51_MIXED_13'), 'ㄴ', 1, '["공연을 준비했습니다"]'::jsonb, null),
  ((select id from public.topik_writing_51_exercises where source_key = 'Q51_MIXED_14'), 'ㄱ', 0, '["관심을 가지게 되었습니다","관심이 생겼습니다"]'::jsonb, null),
  ((select id from public.topik_writing_51_exercises where source_key = 'Q51_MIXED_14'), 'ㄴ', 1, '["몰랐을 것입니다"]'::jsonb, null),
  ((select id from public.topik_writing_51_exercises where source_key = 'Q51_MIXED_15'), 'ㄱ', 0, '["합격을 축하드립니다"]'::jsonb, null),
  ((select id from public.topik_writing_51_exercises where source_key = 'Q51_MIXED_15'), 'ㄴ', 1, '["예약해 두었습니다","예약했습니다"]'::jsonb, null),
  ((select id from public.topik_writing_51_exercises where source_key = 'Q51_MIXED_16'), 'ㄱ', 0, '["힘들어하셨습니다"]'::jsonb, null),
  ((select id from public.topik_writing_51_exercises where source_key = 'Q51_MIXED_16'), 'ㄴ', 1, '["휠체어를 빌려 주셔서"]'::jsonb, null),
  ((select id from public.topik_writing_51_exercises where source_key = 'Q51_MIXED_17'), 'ㄱ', 0, '["실망도 컸습니다"]'::jsonb, 'Source answer key parses ㄴ as ''주차하기가 힘들어하셨습니다'', which appears awkward against the passage. Preserve as source answer but mark NEEDS_REVIEW before public release.'),
  ((select id from public.topik_writing_51_exercises where source_key = 'Q51_MIXED_17'), 'ㄴ', 1, '["주차하기가 힘들어하셨습니다"]'::jsonb, 'Source answer key parses ㄴ as ''주차하기가 힘들어하셨습니다'', which appears awkward against the passage. Preserve as source answer but mark NEEDS_REVIEW before public release.'),
  ((select id from public.topik_writing_51_exercises where source_key = 'Q51_MIXED_18'), 'ㄱ', 0, '["분위기가 달라지기 때문입니다"]'::jsonb, null),
  ((select id from public.topik_writing_51_exercises where source_key = 'Q51_MIXED_18'), 'ㄴ', 1, '["바꿔 보십시오","바꿔 보시기 바랍니다"]'::jsonb, null),
  ((select id from public.topik_writing_51_exercises where source_key = 'Q51_MIXED_19'), 'ㄱ', 0, '["오래 쓸 수 있는지"]'::jsonb, null),
  ((select id from public.topik_writing_51_exercises where source_key = 'Q51_MIXED_19'), 'ㄴ', 1, '["가벼워야 합니다"]'::jsonb, null),
  ((select id from public.topik_writing_51_exercises where source_key = 'Q51_MIXED_20'), 'ㄱ', 0, '["맵지 않았습니다"]'::jsonb, null),
  ((select id from public.topik_writing_51_exercises where source_key = 'Q51_MIXED_20'), 'ㄴ', 1, '["식사를 할 수 없습니다","식사를 못합니다"]'::jsonb, null),
  ((select id from public.topik_writing_51_exercises where source_key = 'Q51_MIXED_21'), 'ㄱ', 0, '["공부한 지","배운 지"]'::jsonb, null),
  ((select id from public.topik_writing_51_exercises where source_key = 'Q51_MIXED_21'), 'ㄴ', 1, '["읽어 보십시오","읽어 보시기 바랍니다"]'::jsonb, null)
;

insert into public.topik_writing_52_exercises(source_key, source_id, title_ko, body_ko, blank_count, source_pages, answer_source_pages, source_type, status, review_status) values
  ('Q52_PRACTICE_01', (select id from public.topik_sources where source_key = 'TOPIK_3_4_PHUONG_ANH_B11_2'), null, '혼자서 일하는 것보다 같이 할 때 좋은 결과를 얻는다. 또한 혼자 전체를 책임지는 것보다 일의 특성에 따라 전문화할 경우 생산성을 (ㄱ). 생산성이 향상되면 삶의 질도 높아진다. 만약 인간이 각자 떨어져서 필요한 것을 직접 생산했다면 삶의 질이 이렇게 (ㄴ).', 2, array[249], array[346], 'SOURCE_BOOK', 'PUBLISHED', 'VERIFIED'),
  ('Q52_PRACTICE_02', (select id from public.topik_sources where source_key = 'TOPIK_3_4_PHUONG_ANH_B11_2'), null, '부드러운 아이스크림의 비밀은 공기에 있다. 아이스크림 재료는 특별하지 않지만 공기가 들어가면 달라진다. 부피가 커지면서 부드러워지게 된다. 그래서 아이스크림의 부드러운 정도는 공기가 얼마나 (ㄱ). 공기가 많을수록 아이스크림은 더 부드러워진다. 그러나 녹은 아이스크림을 다시 얼리면 처음처럼 (ㄴ). 얼음이 생겨 딱딱해지기 때문이다.', 2, array[249], array[346], 'SOURCE_BOOK', 'PUBLISHED', 'VERIFIED'),
  ('Q52_PRACTICE_03', (select id from public.topik_sources where source_key = 'TOPIK_3_4_PHUONG_ANH_B11_2'), null, '아이들은 광고에 나오는 탄산음료를 좋아한다. 탄산음료는 아이들 건강에 좋지 않지만 광고를 보고 나면 더 자주 마시게 된다. 전문가에 따르면 아이들은 어른보다 광고의 영향을 (ㄱ). 이렇듯 광고가 주는 영향을 생각한다면 어린이가 TV를 보는 시간대에는 탄산음료 광고를 (ㄴ). 아이들이 광고를 안 보면 탄산음료를 덜 마시게 될 것이다.', 2, array[250], array[346], 'SOURCE_BOOK', 'PUBLISHED', 'VERIFIED'),
  ('Q52_PRACTICE_04', (select id from public.topik_sources where source_key = 'TOPIK_3_4_PHUONG_ANH_B11_2'), null, '나이에 따라 추위를 느끼는 정도도 다르다. 같은 추위라도 젊은 사람들보다 노인들이 추위를 (ㄱ). 나이가 젊으면 체온 조절이 잘 되지만 나이가 들면 이 기능이 떨어지기 때문이다. 따라서 체온을 보호하기 위해서 나이가 들수록 옷을 더 (ㄴ). 옷 외에도 모자나 장갑, 목도리 등으로 몸을 따뜻하게 해야 한다.', 2, array[250], array[346], 'SOURCE_BOOK', 'PUBLISHED', 'VERIFIED'),
  ('Q52_PRACTICE_05', (select id from public.topik_sources where source_key = 'TOPIK_3_4_PHUONG_ANH_B11_2'), null, '공부를 할 때 목표를 어디에 두는지가 중요하다. 목표는 자신의 능력에 맞게 정하는 것이 좋다. 너무 무리한 목표를 잡거나 반대로 지나치게 낮은 목표를 잡는다면 (ㄱ). 성취감은 적당히 어려운 목표를 이루었을 때 느낄 수 있다. 이렇듯 성취감을 느끼고 못 느끼는 것은 목표를 (ㄴ).', 2, array[250], array[346], 'SOURCE_BOOK', 'PUBLISHED', 'VERIFIED'),
  ('Q52_PRACTICE_06', (select id from public.topik_sources where source_key = 'TOPIK_3_4_PHUONG_ANH_B11_2'), null, '안전한 여행을 하기 위해서는 여행을 가기 전에 먼저 그 지역에 어떤 질병이 (ㄱ). 유행하는 질병을 알면 미리 예방 주사를 맞을 수도 있고 필요한 약을 준비할 수도 있다. 또한 현지에서 질병을 예방하려면 손 씻기 같은 개인위생도 중요하다. 손을 자주 씻고 끓인 물이나 음식을 익혀 먹는 것만으로도 (ㄴ).', 2, array[251], array[346], 'SOURCE_BOOK', 'PUBLISHED', 'VERIFIED'),
  ('Q52_PRACTICE_07', (select id from public.topik_sources where source_key = 'TOPIK_3_4_PHUONG_ANH_B11_2'), null, '사람은 누구나 오래 살고 싶어한다. 의학의 발달로 평균 수명이 연장돼 이 바람이 현실이 되고 있다. 연구결과에 의하면 인간은 120세까지 (ㄱ). 하지만 이렇게 오래 사는 것이 환영할 일만은 아니다. 이제 우리는 60세 이후부터 어떻게 살아야 할지 걱정해야 한다. 왜냐하면 수명이 길어진 만큼 퇴직 이후의 시간도 이전보다 더 (ㄴ).', 2, array[251], array[346], 'SOURCE_BOOK', 'PUBLISHED', 'VERIFIED'),
  ('Q52_PRACTICE_08', (select id from public.topik_sources where source_key = 'TOPIK_3_4_PHUONG_ANH_B11_2'), null, '게임은 무조건 나쁘다고 생각하는 사람들이 있다. 그러나 게임이 나쁘기만 한 것은 아니다. 우선 스트레스 해소에 좋다. 공부나 일에 스트레스가 많은 사람들은 장소에 상관없이 게임으로 (ㄱ). 또한 흥미를 줄 수 있다. 하기 싫은 일도 게임을 활용하면 (ㄴ). 재미는 최고의 동기가 될 수 있다.', 2, array[251], array[347], 'SOURCE_BOOK', 'PUBLISHED', 'VERIFIED'),
  ('Q52_PRACTICE_09', (select id from public.topik_sources where source_key = 'TOPIK_3_4_PHUONG_ANH_B11_2'), null, '우리가 먹는 음식에 어떤 성분이 들어 있는지 아는 것은 중요하다. 그러나 마트에서 식품을 살 때 성분을 제대로 확인해 보지 않고 구입하는 사람들이 많다. 내용물을 직접 확인할 수 없는 가공 식품에는 어떤 (ㄱ). 우리가 모르는 성분 중에는 건강에 안 좋은 것도 많을 것이다. 편리함 때문에 가공식품을 자주 먹는 사람들이라면 건강을 위해서 반드시 (ㄴ).', 2, array[252], array[347], 'SOURCE_BOOK', 'PUBLISHED', 'VERIFIED'),
  ('Q52_PRACTICE_10', (select id from public.topik_sources where source_key = 'TOPIK_3_4_PHUONG_ANH_B11_2'), null, '여러 가지 일을 동시에 하다 보면 집중력이 떨어진다. 스마트폰을 많이 쓰기 시작하면서 집중력이 떨어진 것을 보면 알 수 있다. 사람들은 스마트폰으로 신문을 읽으면서 메시지를 보거나 광고를 보는 등 여러 가지 일을 한다. 연구 결과에 따르면 스마트폰이 나오기 전에는 집중력이 지속되는 시간이 12초였지만 지금은 8초로 (ㄱ). 따라서 집중력을 키우려면 스마트폰을 너무 오래 (ㄴ).', 2, array[252], array[347], 'SOURCE_BOOK', 'PUBLISHED', 'VERIFIED'),
  ('Q52_PRACTICE_11', (select id from public.topik_sources where source_key = 'TOPIK_3_4_PHUONG_ANH_B11_2'), null, '살기 어려운 환경에서 자라는 것이 반드시 나쁜 것은 아니다. 그 예로 한국의 소나무를 들 수 있다. 좋은 소나무가 자라고 있는 곳을 보면 (ㄱ) 알 수 있다. 나쁜 환경에 적응하기 위한 과정이 좋은 결과로 나타난 것이다. 이와 비슷한 예는 또 있다. 어떤 농부들의 이야기에 따르면 좋은 포도주를 생산하기 위해서 포도나무를 심을 때 일부러 (ㄴ).', 2, array[252], array[347], 'SOURCE_BOOK', 'PUBLISHED', 'VERIFIED'),
  ('Q52_PRACTICE_12', (select id from public.topik_sources where source_key = 'TOPIK_3_4_PHUONG_ANH_B11_2'), null, '대나무에는 ‘마디’가 있는데 이 마디는 성장을 멈추고 기다리는 동안 생긴다고 한다. 쉬는 동안 생기는 ‘마디’는 대나무가 강하게 성장할 수 있도록 도와준다. 사람에게 휴식은 마디와 같다. 대나무에게 마디가 필요한 것처럼 사람에게도 (ㄱ). 만약 휴식이 없다면 (ㄴ). 이는 충분한 휴식 후에 업무 능력이 향상되었다는 연구 결과를 통해서도 알 수 있다.', 2, array[253], array[347], 'SOURCE_BOOK', 'PUBLISHED', 'VERIFIED'),
  ('Q52_PRACTICE_13', (select id from public.topik_sources where source_key = 'TOPIK_3_4_PHUONG_ANH_B11_2'), null, '‘소확행’은 작지만 확실한 행복을 말한다. 언제 올지도 모르는 행복을 기다리지 않고 작은 일에서 행복을 찾는 것이다. 그런데 사람마다 행복에 대한 기준이 다른 것처럼 (ㄱ). 그냥 쉬기만 해도 행복을 느끼는 사람들이 있다. 이렇듯 자신이 행복하다고 느끼면 무엇이든 (ㄴ). ‘소확행’은 자기만의 일상 속 작은 행복인 것이다.', 2, array[253], array[347], 'SOURCE_BOOK', 'PUBLISHED', 'VERIFIED'),
  ('Q52_PRACTICE_14', (select id from public.topik_sources where source_key = 'TOPIK_3_4_PHUONG_ANH_B11_2'), null, '바닷물이 들어왔다가 빠져나간 평평한 곳을 ‘갯벌’이라고 한다. 이 갯벌은 ‘정화’ 기능을 한다. 사람들이 버린 더러운 물은 갯벌을 지나면서 점차 깨끗해진다. 이처럼 갯벌은 물을 (ㄱ) 태풍의 피해를 줄이는 역할을 하기도 한다. 갯벌을 지키면 개발할 때보다 얻을 수 있는 것이 훨씬 더 많다. 그러므로 우리는 (ㄴ).', 2, array[253], array[347], 'SOURCE_BOOK', 'PUBLISHED', 'VERIFIED'),
  ('Q52_PRACTICE_15', (select id from public.topik_sources where source_key = 'TOPIK_3_4_PHUONG_ANH_B11_2'), null, '‘퇴고’란 완성된 글을 다시 읽으면서 고치는 것을 말한다. 처음에는 잘 썼다고 생각했던 글도 다시 보면 (ㄱ). 따라서 부족하다고 생각하는 부분은 내용, 글의 구조, 언어 표현을 생각하면서 고치는 것이 좋다. 퇴고를 꼼꼼하게 하는 것은 글의 완성도를 위해서 꼭 필요하다. 왜냐하면 퇴고를 얼마나 잘하느냐에 따라 (ㄴ).', 2, array[254], array[347], 'SOURCE_BOOK', 'PUBLISHED', 'VERIFIED'),
  ('Q52_PRACTICE_16', (select id from public.topik_sources where source_key = 'TOPIK_3_4_PHUONG_ANH_B11_2'), null, '공동주택의 단점은 층간 소음으로 인해 갈등이 (ㄱ). 만약 갈등이 발생하면 서로 자신의 입장만 강조하기 때문에 (ㄴ). 따라서 층간 소음 문제를 해결하기 위해서는 개인의 노력보다는 공공 기관에서 객관적인 기준을 마련하는 것이 필요하다.', 2, array[254], array[347], 'SOURCE_BOOK', 'PUBLISHED', 'VERIFIED'),
  ('Q52_PRACTICE_17', (select id from public.topik_sources where source_key = 'TOPIK_3_4_PHUONG_ANH_B11_2'), null, '모바일 메신저가 현대인의 중요한 의사소통 수단이 된 지 오래다. 모바일 메신저의 장점은 메시지와 정보, 사진 등을 쉽게 (ㄱ). 그렇지만 전송이 쉽다는 장점 때문에 원하지 않는 정보도 받게 된다. 그래서 피로감을 느낀 사람들은 회사에서는 메신저를 켜 두지만 (ㄴ). 집은 휴식을 위한 공간이기 때문이다.', 2, array[254], array[347], 'SOURCE_BOOK', 'PUBLISHED', 'VERIFIED'),
  ('Q52_PRACTICE_18', (select id from public.topik_sources where source_key = 'TOPIK_3_4_PHUONG_ANH_B11_2'), null, '마라톤은 비용도 거의 들지 않고 특별한 장소가 필요한 것도 아니다. 즉, 마라톤의 장점은 운동화만 있으면 (ㄱ). 또한 에너지 소비가 많고 지방을 감소시키는 효과가 있어서 마라톤을 하면 (ㄴ). 그래서 마라톤 선수들 중에는 살찐 사람들이 거의 없다.', 2, array[255], array[348], 'SOURCE_BOOK', 'PUBLISHED', 'VERIFIED'),
  ('Q52_PRACTICE_19', (select id from public.topik_sources where source_key = 'TOPIK_3_4_PHUONG_ANH_B11_2'), null, '음식은 기후의 영향을 받는다. 기후가 따뜻한 지역에서는 신선한 음식이 발달한다. 왜냐하면 음식 재료가 풍부해서 언제든지 (ㄱ). 반면에 겨울이 길어서 재료를 구하기 어려운 지역에서는 짠 음식이 발달한다. 이런 지역에서는 맛도 중요하지만 음식을 (ㄴ). 그래서 오래 보관할 수 있는 음식 종류가 많다.', 2, array[255], array[348], 'SOURCE_BOOK', 'PUBLISHED', 'VERIFIED'),
  ('Q52_PRACTICE_20', (select id from public.topik_sources where source_key = 'TOPIK_3_4_PHUONG_ANH_B11_2'), null, '재능이 나타나는 시기는 사람마다 다르다. 일찍 발견하는 사람이 있는 반면 (ㄱ). 그런데 재능을 일찍 발견한 사람들은 더 이상 노력하지 않기 때문에 재능이 (ㄴ). 재능을 더 발전시키기 위해 필요한 것은 타고난 능력이 아니라 끊임없는 노력이다.', 2, array[255], array[348], 'SOURCE_BOOK', 'PUBLISHED', 'VERIFIED'),
  ('Q52_PRACTICE_21', (select id from public.topik_sources where source_key = 'TOPIK_3_4_PHUONG_ANH_B11_2'), null, '모르는 사람들과 교류하는 데 불편함을 느끼는 기성세대와 달리 젊은 사람들은 처음 만나는 사람들과 같이 있어도 (ㄱ). 이들은 다른 사람의 행동이 나와 달라도 (ㄴ). 실망보다는 다르다는 사실을 받아들인다. 반면에 기성세대는 생각이 다른 사람들을 받아들이지 못하고 잘 어울리려고 하지 않는다.', 2, array[256], array[348], 'SOURCE_BOOK', 'PUBLISHED', 'VERIFIED'),
  ('Q52_PRACTICE_22', (select id from public.topik_sources where source_key = 'TOPIK_3_4_PHUONG_ANH_B11_2'), null, '세상을 바꾸고 싶은가? 그렇다면 세상을 바꾸려고 하지 말고 (ㄱ). 생각이 바뀌면 세상도 달라 보인다. ‘물 반 컵’이 있을 때 반밖에 없다고 생각하는 사람은 부정적인 면을 보는 사람이다. 반면에 반이나 남았다고 생각하는 사람은 (ㄴ). 똑같은 상황이라도 긍정적으로 생각하면 힘든 일도 즐겁게 할 수 있다.', 2, array[256], array[348], 'SOURCE_BOOK', 'PUBLISHED', 'VERIFIED'),
  ('Q52_PRACTICE_23', (select id from public.topik_sources where source_key = 'TOPIK_3_4_PHUONG_ANH_B11_2'), null, '가족들은 항상 같이 있기 때문에 말하지 않아도 힘든 것을 알 것이라고 생각한다. 그러나 가족이라 하더라도 말을 안 하면 얼마나 (ㄱ). 그래서 아주 힘들 때는 가족들에게 알리고 도움을 받아야 한다. 또한 평소에도 위로와 용기를 주는 (ㄴ). 말 한 마디로 힘든 일도 이겨 낼 수 있기 때문이다.', 2, array[256], array[348], 'SOURCE_BOOK', 'PUBLISHED', 'VERIFIED'),
  ('Q52_PRACTICE_24', (select id from public.topik_sources where source_key = 'TOPIK_3_4_PHUONG_ANH_B11_2'), null, '밤에 일하는 사람들은 잠이 부족하고 항상 피곤함을 느낀다. 그래서 업무 능력도 떨어지게 된다. 연구 결과 낮잠을 자면 이런 수면 부족과 피로가 해소되어 업무 능력이 (ㄱ). 그런데 낮잠을 길게 자는 사람들은 오히려 몸이 무겁고 밤에 불면증을 겪는 등 부작용이 나타났다고 한다. 그러므로 낮잠을 잘 때는 (ㄴ).', 2, array[257], array[348], 'SOURCE_BOOK', 'PUBLISHED', 'VERIFIED'),
  ('Q52_PRACTICE_25', (select id from public.topik_sources where source_key = 'TOPIK_3_4_PHUONG_ANH_B11_2'), null, '‘스콜’이란 열대 지방에서 갑자기 내리는 소나기를 말한다. 그래서 열대 지방을 여행할 때는 언제 이런 스콜을 만날지 모르기 때문에 항상 (ㄱ). 그런데 이런 날씨 변화를 모르는 사람들은 우산을 준비하지 않는다. 왜냐하면 오전에 날씨가 너무 맑아서 (ㄴ) 생각하기 때문이다.', 2, array[257], array[348], 'SOURCE_BOOK', 'PUBLISHED', 'VERIFIED'),
  ('Q52_PRACTICE_26', (select id from public.topik_sources where source_key = 'TOPIK_3_4_PHUONG_ANH_B11_2'), null, '최근 태풍의 강도와 속도가 전과 달라졌다. 지구 온난화로 인해 바닷물의 온도가 높아져서 태풍이 점점 강해지고 있는 데 반해 이동 속도는 (ㄱ). 기상학자들은 강해진 태풍이 천천히 이동하면 피해가 더 (ㄴ). 태풍이 특정 지역에 머무르는 시간이 길어져 폭우가 내리고 홍수가 나는 등 피해 정도가 더 심해지는 것이다.', 2, array[257], array[348], 'SOURCE_BOOK', 'PUBLISHED', 'VERIFIED'),
  ('Q52_PRACTICE_27', (select id from public.topik_sources where source_key = 'TOPIK_3_4_PHUONG_ANH_B11_2'), null, '나이가 들어도 계속할 수 있는 운동으로 걷기만큼 (ㄱ). 걷기가 좋은 이유는 운동의 효과도 좋지만 안전하고 경제적이기 때문이다. 우선 신체에 무리한 힘을 주지 않기 때문에 안전할 뿐만 아니라 따로 스포츠 센터에 나갈 필요가 없으므로 (ㄴ). 이렇듯 걷기는 비용 없이 즐길 수 있는 안전한 운동으로 성인병 예방에도 좋은 최고의 운동이다.', 2, array[258], array[348], 'SOURCE_BOOK', 'PUBLISHED', 'VERIFIED'),
  ('Q52_PRACTICE_28', (select id from public.topik_sources where source_key = 'TOPIK_3_4_PHUONG_ANH_B11_2'), null, '음식의 맛을 결정하는 요인의 하나로 온도를 꼽을 수 있다. 왜냐하면 온도에 따라 음식 맛이 (ㄱ). 신맛은 음식이 따뜻할수록, 쓴맛은 차가울수록 더 잘 느껴진다. 따라서 신맛을 싫어한다면 음식의 온도를 낮추는 것이 좋고 쓴맛을 싫어한다면 (ㄴ).', 2, array[258], array[349], 'SOURCE_BOOK', 'PUBLISHED', 'VERIFIED'),
  ('Q52_PRACTICE_29', (select id from public.topik_sources where source_key = 'TOPIK_3_4_PHUONG_ANH_B11_2'), null, '단순하게 살기 위해서는 먼저 필요 없는 물건들을 버려야 한다. 그런데 아무리 (ㄱ) 막상 버리려고 하면 아깝다는 생각 때문에 망설이게 된다. 그런 마음이 들 때는 다른 사람에게 주거나 재활용 수거함을 이용하면 된다. 그리고 버리는 것만큼 중요한 것이 (ㄴ). 버리고 나서 또 사기 시작하면 단순한 삶은 유지될 수 없다.', 2, array[258], array[349], 'SOURCE_BOOK', 'PUBLISHED', 'VERIFIED'),
  ('Q52_PRACTICE_30', (select id from public.topik_sources where source_key = 'TOPIK_3_4_PHUONG_ANH_B11_2'), null, '‘나이테’는 나무줄기를 가로로 잘랐을 때 나타나는 둥근 띠 모양의 무늬로 성장 속도와 관계가 있다. 나무는 기온 차이에 따라 (ㄱ). 기온이 높은 여름에는 성장 속도가 빠르고 기온이 낮은 겨울에는 느려진다. 빨리 자랄 때는 나무 색깔이 연하고, 느리게 자랄 때는 짙은 색이 되면서 나이테가 생기게 된다. 그래서 기온 변화가 없고 성장 속도가 일정한 지역에서는 (ㄴ).', 2, array[259], array[349], 'SOURCE_BOOK', 'PUBLISHED', 'VERIFIED'),
  ('Q52_PRACTICE_31', (select id from public.topik_sources where source_key = 'TOPIK_3_4_PHUONG_ANH_B11_2'), null, '옷에 고추 가루가 묻을 때 세탁해도 얼룩이 남는다. 이 성분은 기름에 녹지만 물에는 (ㄱ). 따라서 얼룩을 (ㄴ) 세탁한 후에 햇빛이 있는 곳에 걷어 두면 이 성분을 지울 수 있다.', 2, array[259], array[349], 'SOURCE_BOOK', 'PUBLISHED', 'VERIFIED')
on conflict (source_key) do update set source_id = excluded.source_id, title_ko = excluded.title_ko, body_ko = excluded.body_ko, blank_count = excluded.blank_count, source_pages = excluded.source_pages, answer_source_pages = excluded.answer_source_pages, source_type = excluded.source_type, status = excluded.status, review_status = excluded.review_status;

delete from public.topik_writing_52_blanks b using public.topik_writing_52_exercises e where e.id = b.exercise_id and e.source_type = 'SOURCE_BOOK';
insert into public.topik_writing_52_blanks(exercise_id, blank_key, blank_order, source_answer_variants, relation_code, relation_tag_origin, review_note) values
  ((select id from public.topik_writing_52_exercises where source_key = 'Q52_PRACTICE_01'), 'ㄱ', 0, '["향상시킬 수 있다","높일 수 있다"]'::jsonb, null, null, null),
  ((select id from public.topik_writing_52_exercises where source_key = 'Q52_PRACTICE_01'), 'ㄴ', 1, '["높아지지 않았을 것이다"]'::jsonb, null, null, null),
  ((select id from public.topik_writing_52_exercises where source_key = 'Q52_PRACTICE_02'), 'ㄱ', 0, '["들어갔느냐에 달려 있다","많으냐에 따라 다르다"]'::jsonb, null, null, null),
  ((select id from public.topik_writing_52_exercises where source_key = 'Q52_PRACTICE_02'), 'ㄴ', 1, '["부드러워지지 않는다"]'::jsonb, null, null, null),
  ((select id from public.topik_writing_52_exercises where source_key = 'Q52_PRACTICE_03'), 'ㄱ', 0, '["더 많이 받는다고 한다"]'::jsonb, null, null, null),
  ((select id from public.topik_writing_52_exercises where source_key = 'Q52_PRACTICE_03'), 'ㄴ', 1, '["금지하는 것이 좋다","금지해야 한다"]'::jsonb, null, null, null),
  ((select id from public.topik_writing_52_exercises where source_key = 'Q52_PRACTICE_04'), 'ㄱ', 0, '["더 많이 느낀다"]'::jsonb, null, null, null),
  ((select id from public.topik_writing_52_exercises where source_key = 'Q52_PRACTICE_04'), 'ㄴ', 1, '["따뜻하게 입어야 한다"]'::jsonb, null, null, null),
  ((select id from public.topik_writing_52_exercises where source_key = 'Q52_PRACTICE_05'), 'ㄱ', 0, '["성취감을 느끼지 못할 것이다"]'::jsonb, null, null, null),
  ((select id from public.topik_writing_52_exercises where source_key = 'Q52_PRACTICE_05'), 'ㄴ', 1, '["어디에 두느냐에 달려 있다"]'::jsonb, null, null, null),
  ((select id from public.topik_writing_52_exercises where source_key = 'Q52_PRACTICE_06'), 'ㄱ', 0, '["유행하는지 알아야 한다"]'::jsonb, null, null, null),
  ((select id from public.topik_writing_52_exercises where source_key = 'Q52_PRACTICE_06'), 'ㄴ', 1, '["질병을 예방할 수 있다"]'::jsonb, null, null, null),
  ((select id from public.topik_writing_52_exercises where source_key = 'Q52_PRACTICE_07'), 'ㄱ', 0, '["살 수 있다고 한다"]'::jsonb, null, null, null),
  ((select id from public.topik_writing_52_exercises where source_key = 'Q52_PRACTICE_07'), 'ㄴ', 1, '["길어졌기 때문이다"]'::jsonb, null, null, null),
  ((select id from public.topik_writing_52_exercises where source_key = 'Q52_PRACTICE_08'), 'ㄱ', 0, '["스트레스를 풀 수 있다"]'::jsonb, null, null, null),
  ((select id from public.topik_writing_52_exercises where source_key = 'Q52_PRACTICE_08'), 'ㄴ', 1, '["재미있게 할 수 있다"]'::jsonb, null, null, null),
  ((select id from public.topik_writing_52_exercises where source_key = 'Q52_PRACTICE_09'), 'ㄱ', 0, '["성분이 들어 있는지 모른다"]'::jsonb, null, null, null),
  ((select id from public.topik_writing_52_exercises where source_key = 'Q52_PRACTICE_09'), 'ㄴ', 1, '["성분을 확인해야 한다"]'::jsonb, null, null, null),
  ((select id from public.topik_writing_52_exercises where source_key = 'Q52_PRACTICE_10'), 'ㄱ', 0, '["줄어들었다고 한다","줄었다고 한다"]'::jsonb, null, null, null),
  ((select id from public.topik_writing_52_exercises where source_key = 'Q52_PRACTICE_10'), 'ㄴ', 1, '["쓰지 않는 것이 좋다","사용하지 않는 것이 좋다","보지 않는 것이 좋다","쓰지 말아야 한다","사용하지 말아야 한다","보지 말아야 한다"]'::jsonb, null, null, null),
  ((select id from public.topik_writing_52_exercises where source_key = 'Q52_PRACTICE_11'), 'ㄱ', 0, '["환경이 나쁘다는 것을"]'::jsonb, null, null, null),
  ((select id from public.topik_writing_52_exercises where source_key = 'Q52_PRACTICE_11'), 'ㄴ', 1, '["환경이 나쁜 곳에 심는다고 한다"]'::jsonb, null, null, null),
  ((select id from public.topik_writing_52_exercises where source_key = 'Q52_PRACTICE_12'), 'ㄱ', 0, '["휴식이 필요하다"]'::jsonb, null, null, null),
  ((select id from public.topik_writing_52_exercises where source_key = 'Q52_PRACTICE_12'), 'ㄴ', 1, '["업무 능력이 향상되지 않을 것이다"]'::jsonb, null, null, null),
  ((select id from public.topik_writing_52_exercises where source_key = 'Q52_PRACTICE_13'), 'ㄱ', 0, '["행복을 느끼는 기준도 다르다"]'::jsonb, null, null, null),
  ((select id from public.topik_writing_52_exercises where source_key = 'Q52_PRACTICE_13'), 'ㄴ', 1, '["행복이 될 수 있다","소확행이 될 수 있다"]'::jsonb, null, null, null),
  ((select id from public.topik_writing_52_exercises where source_key = 'Q52_PRACTICE_14'), 'ㄱ', 0, '["깨끗하게 할 뿐만 아니라"]'::jsonb, null, null, null),
  ((select id from public.topik_writing_52_exercises where source_key = 'Q52_PRACTICE_14'), 'ㄴ', 1, '["갯벌을 보존해야 한다","갯벌을 지켜야 한다"]'::jsonb, null, null, null),
  ((select id from public.topik_writing_52_exercises where source_key = 'Q52_PRACTICE_15'), 'ㄱ', 0, '["부족한 부분이 많다","부족한 부분이 있다"]'::jsonb, null, null, null),
  ((select id from public.topik_writing_52_exercises where source_key = 'Q52_PRACTICE_15'), 'ㄴ', 1, '["글의 완성도가 달라지기 때문이다"]'::jsonb, null, null, null),
  ((select id from public.topik_writing_52_exercises where source_key = 'Q52_PRACTICE_16'), 'ㄱ', 0, '["생길 수 있다는 것이다","발생할 수 있다는 것이다"]'::jsonb, null, null, null),
  ((select id from public.topik_writing_52_exercises where source_key = 'Q52_PRACTICE_16'), 'ㄴ', 1, '["문제를 해결하기 어렵다"]'::jsonb, null, null, null),
  ((select id from public.topik_writing_52_exercises where source_key = 'Q52_PRACTICE_17'), 'ㄱ', 0, '["전송할 수 있다는 것이다"]'::jsonb, null, null, null),
  ((select id from public.topik_writing_52_exercises where source_key = 'Q52_PRACTICE_17'), 'ㄴ', 1, '["집에서는 꺼 둔다"]'::jsonb, null, null, null),
  ((select id from public.topik_writing_52_exercises where source_key = 'Q52_PRACTICE_18'), 'ㄱ', 0, '["어디에서든지 할 수 있다는 것이다"]'::jsonb, null, null, null),
  ((select id from public.topik_writing_52_exercises where source_key = 'Q52_PRACTICE_18'), 'ㄴ', 1, '["살이 찌지 않는다"]'::jsonb, null, null, null),
  ((select id from public.topik_writing_52_exercises where source_key = 'Q52_PRACTICE_19'), 'ㄱ', 0, '["재료를 구할 수 있기 때문이다"]'::jsonb, null, null, null),
  ((select id from public.topik_writing_52_exercises where source_key = 'Q52_PRACTICE_19'), 'ㄴ', 1, '["보관하는 것도 중요하다"]'::jsonb, null, null, null),
  ((select id from public.topik_writing_52_exercises where source_key = 'Q52_PRACTICE_20'), 'ㄱ', 0, '["늦게 발견하는 사람도 있다"]'::jsonb, null, null, null),
  ((select id from public.topik_writing_52_exercises where source_key = 'Q52_PRACTICE_20'), 'ㄴ', 1, '["더 발전하지 않는다"]'::jsonb, null, null, null),
  ((select id from public.topik_writing_52_exercises where source_key = 'Q52_PRACTICE_21'), 'ㄱ', 0, '["불편함을 느끼지 않는다"]'::jsonb, null, null, null),
  ((select id from public.topik_writing_52_exercises where source_key = 'Q52_PRACTICE_21'), 'ㄴ', 1, '["실망하지 않는다"]'::jsonb, null, null, null),
  ((select id from public.topik_writing_52_exercises where source_key = 'Q52_PRACTICE_22'), 'ㄱ', 0, '["생각을 바꿔야 한다","생각을 바꾸면 된다"]'::jsonb, null, null, null),
  ((select id from public.topik_writing_52_exercises where source_key = 'Q52_PRACTICE_22'), 'ㄴ', 1, '["긍정적인 면을 보는 사람이다"]'::jsonb, null, null, null),
  ((select id from public.topik_writing_52_exercises where source_key = 'Q52_PRACTICE_23'), 'ㄱ', 0, '["힘든지 모른다","힘든지 알 수 없다"]'::jsonb, null, null, null),
  ((select id from public.topik_writing_52_exercises where source_key = 'Q52_PRACTICE_23'), 'ㄴ', 1, '["말을 자주 해야 한다"]'::jsonb, null, null, null),
  ((select id from public.topik_writing_52_exercises where source_key = 'Q52_PRACTICE_24'), 'ㄱ', 0, '["높아진다고 한다","향상된다고 한다"]'::jsonb, null, null, null),
  ((select id from public.topik_writing_52_exercises where source_key = 'Q52_PRACTICE_24'), 'ㄴ', 1, '["너무 오래 자지 않는 것이 좋다","짧게 자야 한다"]'::jsonb, null, null, null),
  ((select id from public.topik_writing_52_exercises where source_key = 'Q52_PRACTICE_25'), 'ㄱ', 0, '["우산을 준비해야 한다"]'::jsonb, null, null, null),
  ((select id from public.topik_writing_52_exercises where source_key = 'Q52_PRACTICE_25'), 'ㄴ', 1, '["비가 오지 않을 거라고"]'::jsonb, null, null, null),
  ((select id from public.topik_writing_52_exercises where source_key = 'Q52_PRACTICE_26'), 'ㄱ', 0, '["더 느려지고 있다","점점 느려지고 있다"]'::jsonb, null, null, null),
  ((select id from public.topik_writing_52_exercises where source_key = 'Q52_PRACTICE_26'), 'ㄴ', 1, '["커질 것이라고 한다","커진다고 한다"]'::jsonb, null, null, null),
  ((select id from public.topik_writing_52_exercises where source_key = 'Q52_PRACTICE_27'), 'ㄱ', 0, '["좋은 것이 없다"]'::jsonb, null, null, null),
  ((select id from public.topik_writing_52_exercises where source_key = 'Q52_PRACTICE_27'), 'ㄴ', 1, '["비용이 들지 않는다"]'::jsonb, null, null, null),
  ((select id from public.topik_writing_52_exercises where source_key = 'Q52_PRACTICE_28'), 'ㄱ', 0, '["다르게 느껴지기 때문이다","달라지기 때문이다"]'::jsonb, null, null, null),
  ((select id from public.topik_writing_52_exercises where source_key = 'Q52_PRACTICE_28'), 'ㄴ', 1, '["온도를 높이는 것이 좋다"]'::jsonb, null, null, null),
  ((select id from public.topik_writing_52_exercises where source_key = 'Q52_PRACTICE_29'), 'ㄱ', 0, '["필요 없는 물건이라도"]'::jsonb, null, null, null),
  ((select id from public.topik_writing_52_exercises where source_key = 'Q52_PRACTICE_29'), 'ㄴ', 1, '["또 사지 않는 것이다","다시 사지 않는 것이다"]'::jsonb, null, null, null),
  ((select id from public.topik_writing_52_exercises where source_key = 'Q52_PRACTICE_30'), 'ㄱ', 0, '["성장 속도가 다르다","성장 속도가 달라진다"]'::jsonb, null, null, null),
  ((select id from public.topik_writing_52_exercises where source_key = 'Q52_PRACTICE_30'), 'ㄴ', 1, '["나이테가 생기지 않는다"]'::jsonb, null, null, null),
  ((select id from public.topik_writing_52_exercises where source_key = 'Q52_PRACTICE_31'), 'ㄱ', 0, '["녹지 않는다"]'::jsonb, null, null, null),
  ((select id from public.topik_writing_52_exercises where source_key = 'Q52_PRACTICE_31'), 'ㄴ', 1, '["지우기 위해서","지우려면"]'::jsonb, null, null, null)
;

do $$
declare q51_intent_count integer; q51_section_group_count integer; q51_mixed_count integer; q52_relation_count integer; q52_exercise_count integer; invalid_blank_count integer;
begin
  select count(*) into q51_intent_count from public.topik_writing_51_intents where source_type = 'SOURCE_BOOK';
  select count(distinct intent_code) into q51_section_group_count from public.topik_writing_51_exercises where exercise_group = 'SECTION_PRACTICE' and source_type = 'SOURCE_BOOK';
  select count(*) into q51_mixed_count from public.topik_writing_51_exercises where exercise_group = 'MIXED_PRACTICE' and source_type = 'SOURCE_BOOK';
  select count(*) into q52_relation_count from public.topik_writing_52_relations where source_type = 'SOURCE_BOOK';
  select count(*) into q52_exercise_count from public.topik_writing_52_exercises where source_type = 'SOURCE_BOOK';
  select count(*) into invalid_blank_count from (select e.id from public.topik_writing_51_exercises e left join public.topik_writing_51_blanks b on b.exercise_id = e.id where e.source_type = 'SOURCE_BOOK' group by e.id, e.blank_count having e.blank_count <> count(b.id) union all select e.id from public.topik_writing_52_exercises e left join public.topik_writing_52_blanks b on b.exercise_id = e.id where e.source_type = 'SOURCE_BOOK' group by e.id, e.blank_count having e.blank_count <> count(b.id)) invalid;
  if q51_intent_count <> 7 or q51_section_group_count <> 7 or q51_mixed_count <> 21 or q52_relation_count <> 9 or q52_exercise_count <> 31 or invalid_blank_count <> 0 then raise exception 'TOPIK Writing 51-52 seed validation failed: intents %, section groups %, mixed %, relations %, q52 %, invalid blanks %', q51_intent_count, q51_section_group_count, q51_mixed_count, q52_relation_count, q52_exercise_count, invalid_blank_count; end if;
end $$;

commit;
