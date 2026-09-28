import type { Q54Collocation, Q54Exercise, Q54Idea, Q54Pattern, Q54PatternExample, Q54Question, Q54QuestionBundle, Q54Requirement, Q54Topic } from '../types';

export const environmentTopic: Q54Topic = { id: 'q54-topic-environment', slug: 'environment', name_ko: '환경', name_vi: 'Môi trường', description_vi: 'Ý tưởng, collocation và cấu trúc cho TOPIK II Writing câu 54.', status: 'PUBLISHED', source_type: 'MANUAL' };
export const environmentQuestion: Q54Question = { id: 'q54-question-environment-1', topic_id: environmentTopic.id, subtopic_ko: '환경 보호', prompt_ko: '환경 보호가 중요한 이유는 무엇인가? 환경 문제가 심해지면 어떤 문제가 생길 수 있는가? 환경을 보호하기 위해 개인과 사회는 어떤 노력을 해야 하는가?', visibility: 'PUBLIC', status: 'PUBLISHED', source_type: 'MANUAL' };
export const environmentRequirements: Q54Requirement[] = [
  { id: 'q54-req-environment-positive', question_id: environmentQuestion.id, order_index: 0, prompt_ko: '환경 보호가 중요한 이유는 무엇인가?', label_vi: 'Tầm quan trọng của bảo vệ môi trường', requirement_type: '중요성', function_group: 'POSITIVE' },
  { id: 'q54-req-environment-negative', question_id: environmentQuestion.id, order_index: 1, prompt_ko: '환경 문제가 심해지면 어떤 문제가 생길 수 있는가?', label_vi: 'Vấn đề khi môi trường bị suy thoái', requirement_type: '문제점', function_group: 'NEGATIVE' },
  { id: 'q54-req-environment-solution', question_id: environmentQuestion.id, order_index: 2, prompt_ko: '환경을 보호하기 위해 개인과 사회는 어떤 노력을 해야 하는가?', label_vi: 'Nỗ lực và giải pháp bảo vệ môi trường', requirement_type: '노력', function_group: 'SOLUTION' },
];
export const environmentIdeas: Q54Idea[] = [
  { id: 'idea-1', topic_id: environmentTopic.id, requirement_id: environmentRequirements[0].id, function_group: 'POSITIVE', keyword_ko: '삶의 질 향상', keyword_vi: 'Nâng cao chất lượng cuộc sống', logic_steps: ['Không khí và nước sạch', 'Bảo vệ sức khỏe', 'Nâng cao chất lượng cuộc sống'] },
  { id: 'idea-2', topic_id: environmentTopic.id, requirement_id: environmentRequirements[0].id, function_group: 'POSITIVE', keyword_ko: '미래 세대', keyword_vi: 'Thế hệ tương lai', logic_steps: ['Bảo vệ hiện tại', 'Giữ gìn tài nguyên', 'Cuộc sống của thế hệ sau'] },
  { id: 'idea-3', topic_id: environmentTopic.id, requirement_id: environmentRequirements[1].id, function_group: 'NEGATIVE', keyword_ko: '건강 문제', keyword_vi: 'Vấn đề sức khỏe', logic_steps: ['Ô nhiễm không khí và nước', 'Tiếp xúc chất độc hại', 'Vấn đề sức khỏe'] },
  { id: 'idea-4', topic_id: environmentTopic.id, requirement_id: environmentRequirements[1].id, function_group: 'NEGATIVE', keyword_ko: '자연재해', keyword_vi: 'Thiên tai', logic_steps: ['Biến đổi khí hậu', 'Thời tiết cực đoan', 'Thiệt hại do thiên tai'] },
  { id: 'idea-5', topic_id: environmentTopic.id, requirement_id: environmentRequirements[2].id, function_group: 'SOLUTION', keyword_ko: '일회용품 사용 줄이기', keyword_vi: 'Giảm đồ dùng một lần', logic_steps: ['Giảm tiêu dùng không cần thiết', 'Ít rác thải hơn', 'Giảm gánh nặng môi trường'] },
  { id: 'idea-6', topic_id: environmentTopic.id, requirement_id: environmentRequirements[2].id, function_group: 'SOLUTION', keyword_ko: '환경 교육 강화', keyword_vi: 'Tăng cường giáo dục môi trường', logic_steps: ['Nhận thức vấn đề', 'Học cách thực hành', 'Hành động bền vững'] },
];
export const environmentCollocations: Q54Collocation[] = [
  { id: 'col-1', expression_ko: '환경을 보호하다', meaning_vi: 'bảo vệ môi trường', reuse_score: 5, function_group: 'SOLUTION' }, { id: 'col-2', expression_ko: '건강 문제를 유발하다', meaning_vi: 'gây ra vấn đề sức khỏe', reuse_score: 5, function_group: 'NEGATIVE' },
  { id: 'col-3', expression_ko: '부정적인 영향을 미치다', meaning_vi: 'gây ảnh hưởng tiêu cực', reuse_score: 5, function_group: 'NEGATIVE' }, { id: 'col-4', expression_ko: '삶의 질을 향상시키다', meaning_vi: 'nâng cao chất lượng cuộc sống', reuse_score: 5, function_group: 'POSITIVE' },
  { id: 'col-5', expression_ko: '일회용품 사용을 줄이다', meaning_vi: 'giảm sử dụng đồ dùng một lần', reuse_score: 4, function_group: 'SOLUTION' }, { id: 'col-6', expression_ko: '환경 교육을 강화하다', meaning_vi: 'tăng cường giáo dục môi trường', reuse_score: 5, function_group: 'SOLUTION' },
];
export const environmentPatterns: Q54Pattern[] = [
  { id: 'pattern-1', function_group: 'POSITIVE', pattern_ko: 'N은/는 V-는 데 중요한 역할을 한다.', meaning_vi: 'N đóng vai trò quan trọng trong việc V.', difficulty: 'INTERMEDIATE', reuse_score: 5 },
  { id: 'pattern-2', function_group: 'NEGATIVE', pattern_ko: 'N은/는 N을 유발할 수 있다.', meaning_vi: 'N có thể gây ra N.', difficulty: 'INTERMEDIATE', reuse_score: 5 },
  { id: 'pattern-3', function_group: 'SOLUTION', pattern_ko: 'V-기 위해서는 N할 필요가 있다.', meaning_vi: 'Để V, cần phải N.', difficulty: 'INTERMEDIATE', reuse_score: 5 },
];
export const environmentExamples: Q54PatternExample[] = [
  { id: 'example-1', pattern_id: 'pattern-1', topic_id: environmentTopic.id, sentence_ko: '환경 보호는 삶의 질을 향상시키는 데 중요한 역할을 한다.', translation_vi: 'Bảo vệ môi trường đóng vai trò quan trọng trong việc nâng cao chất lượng cuộc sống.' },
  { id: 'example-2', pattern_id: 'pattern-2', topic_id: environmentTopic.id, sentence_ko: '대기 오염은 여러 건강 문제를 유발할 수 있다.', translation_vi: 'Ô nhiễm không khí có thể gây ra nhiều vấn đề sức khỏe.' },
  { id: 'example-3', pattern_id: 'pattern-3', topic_id: environmentTopic.id, sentence_ko: '환경을 보호하기 위해서는 일회용품 사용을 줄일 필요가 있다.', translation_vi: 'Để bảo vệ môi trường, cần giảm sử dụng đồ dùng một lần.' },
];
export const environmentExercises: Q54Exercise[] = [
  { id: 'exercise-1', topic_id: environmentTopic.id, requirement_id: environmentRequirements[0].id, prompt_vi: 'Bảo vệ môi trường đóng vai trò quan trọng trong việc nâng cao chất lượng cuộc sống.', reference_answer_ko: '환경 보호는 삶의 질을 향상시키는 데 중요한 역할을 한다.', vocabulary_hint: ['환경 보호', '삶의 질', '향상시키다'], pattern_hint: environmentPatterns[0].pattern_ko, sample_sentence_ko: '깨끗한 환경은 건강한 생활을 하는 데 도움이 된다.' },
  { id: 'exercise-2', topic_id: environmentTopic.id, requirement_id: environmentRequirements[1].id, prompt_vi: 'Ô nhiễm không khí có thể gây ra nhiều vấn đề sức khỏe.', reference_answer_ko: '대기 오염은 여러 건강 문제를 유발할 수 있다.', vocabulary_hint: ['대기 오염', '건강 문제', '유발하다'], pattern_hint: environmentPatterns[1].pattern_ko, sample_sentence_ko: '수질 오염은 사람들의 건강에 나쁜 영향을 미친다.' },
  { id: 'exercise-3', topic_id: environmentTopic.id, requirement_id: environmentRequirements[2].id, prompt_vi: 'Để bảo vệ môi trường, cần giảm sử dụng đồ dùng một lần.', reference_answer_ko: '환경을 보호하기 위해서는 일회용품 사용을 줄일 필요가 있다.', vocabulary_hint: ['환경을 보호하다', '일회용품', '줄이다'], pattern_hint: environmentPatterns[2].pattern_ko, sample_sentence_ko: '환경 문제를 해결하기 위해서는 시민들의 참여가 필요하다.' },
];
export const environmentBundle: Q54QuestionBundle = { topic: environmentTopic, question: environmentQuestion, requirements: environmentRequirements, ideas: environmentIdeas, collocations: environmentCollocations, globalCollocations: [], patterns: environmentPatterns, examples: environmentExamples, exercises: environmentExercises };
