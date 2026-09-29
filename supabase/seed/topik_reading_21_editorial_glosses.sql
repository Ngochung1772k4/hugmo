-- Generated from TOPIK_READING_21_EDITORIAL_GLOSSES.json.
-- Editorial meanings are deliberately separate from source-book meanings.
begin;
insert into public.topik_reading_idiom_editorial_glosses(idiom_id, meaning_vi_editorial, source_type, status, note) values
  ((select id from public.topik_reading_idioms where expression_ko = '눈을 맞추다'), 'nhìn vào mắt nhau; giao tiếp bằng ánh mắt', 'EDITORIAL_MANUAL', 'PUBLISHED', 'Các nghĩa này phục vụ học tập; không phải nghĩa Việt được trích từ glossary của sách.'),
  ((select id from public.topik_reading_idioms where expression_ko = '맛을 보다'), 'nếm thử; trải nghiệm thử một việc hoặc sự việc', 'EDITORIAL_MANUAL', 'PUBLISHED', 'Các nghĩa này phục vụ học tập; không phải nghĩa Việt được trích từ glossary của sách.'),
  ((select id from public.topik_reading_idioms where expression_ko = '문을 두드리다'), 'gõ cửa; nghĩa bóng là thử bước vào hoặc tìm cơ hội ở một lĩnh vực mới', 'EDITORIAL_MANUAL', 'PUBLISHED', 'Các nghĩa này phục vụ học tập; không phải nghĩa Việt được trích từ glossary của sách.'),
  ((select id from public.topik_reading_idioms where expression_ko = '손에 잡히다'), 'cầm hoặc nắm được; nghĩa bóng là cụ thể, thấy rõ hoặc trong tầm với', 'EDITORIAL_MANUAL', 'PUBLISHED', 'Các nghĩa này phục vụ học tập; không phải nghĩa Việt được trích từ glossary của sách.'),
  ((select id from public.topik_reading_idioms where expression_ko = '손에 꼽히다'), 'thuộc số ít nổi bật hoặc hàng đầu trong một nhóm', 'EDITORIAL_MANUAL', 'PUBLISHED', 'Các nghĩa này phục vụ học tập; không phải nghĩa Việt được trích từ glossary của sách.'),
  ((select id from public.topik_reading_idioms where expression_ko = '눈에 걸리다'), 'lọt vào mắt hoặc khiến trong lòng bận tâm', 'EDITORIAL_MANUAL', 'PUBLISHED', 'Các nghĩa này phục vụ học tập; không phải nghĩa Việt được trích từ glossary của sách.'),
  ((select id from public.topik_reading_idioms where expression_ko = '눈에 밟히다'), 'cứ hiện lên trong tâm trí, khiến không yên lòng', 'EDITORIAL_MANUAL', 'PUBLISHED', 'Các nghĩa này phục vụ học tập; không phải nghĩa Việt được trích từ glossary của sách.'),
  ((select id from public.topik_reading_idioms where expression_ko = '손에 익다'), 'quen tay, thành thạo do đã làm nhiều', 'EDITORIAL_MANUAL', 'PUBLISHED', 'Các nghĩa này phục vụ học tập; không phải nghĩa Việt được trích từ glossary của sách.'),
  ((select id from public.topik_reading_idioms where expression_ko = '발이 넓다'), 'có quan hệ rộng, quen biết nhiều người', 'EDITORIAL_MANUAL', 'PUBLISHED', 'Các nghĩa này phục vụ học tập; không phải nghĩa Việt được trích từ glossary của sách.'),
  ((select id from public.topik_reading_idioms where expression_ko = '눈길을 끌다'), 'thu hút sự chú ý', 'EDITORIAL_MANUAL', 'PUBLISHED', 'Các nghĩa này phục vụ học tập; không phải nghĩa Việt được trích từ glossary của sách.'),
  ((select id from public.topik_reading_idioms where expression_ko = '눈높이에 맞다'), 'phù hợp với trình độ, tiêu chuẩn hoặc góc nhìn của đối tượng', 'EDITORIAL_MANUAL', 'PUBLISHED', 'Các nghĩa này phục vụ học tập; không phải nghĩa Việt được trích từ glossary của sách.'),
  ((select id from public.topik_reading_idioms where expression_ko = '발뺌을 하다'), 'chối bỏ trách nhiệm hoặc tìm cách thoái thác', 'EDITORIAL_MANUAL', 'PUBLISHED', 'Các nghĩa này phục vụ học tập; không phải nghĩa Việt được trích từ glossary của sách.'),
  ((select id from public.topik_reading_idioms where expression_ko = '한 우물을 파다'), 'kiên trì tập trung vào một việc hoặc một lĩnh vực', 'EDITORIAL_MANUAL', 'PUBLISHED', 'Các nghĩa này phục vụ học tập; không phải nghĩa Việt được trích từ glossary của sách.')
on conflict (idiom_id) do update set meaning_vi_editorial = excluded.meaning_vi_editorial, source_type = excluded.source_type, status = excluded.status, note = excluded.note, updated_at = now();
do $$ begin if (select count(*) from public.topik_reading_idiom_editorial_glosses where source_type = 'EDITORIAL_MANUAL' and status = 'PUBLISHED') <> 13 then raise exception 'Expected 13 published Q21 editorial glosses'; end if; end $$;
commit;
