import type { TopikGrammar, TopikQuestion, TopikRelationGroup } from '../types';

const makeOptions = (questionId: string, values: string[], correctIndex: number) =>
  values.map((text_ko, index) => ({
    id: `${questionId}-option-${index + 1}`,
    question_id: questionId,
    position: index + 1,
    text_ko,
    is_correct: index === correctIndex,
    why_wrong_vi: null,
  }));

export const demoQuestions: TopikQuestion[] = [
  {
    id: 'demo-fill-1', source_key: 'demo-fill-1', kind: 'FILL_GRAMMAR',
    stem_ko: '친구를 만나___ 영화를 보러 갔어요.', target_text: null,
    explanation_vi: '-고 나서 diễn tả hành động sau xảy ra sau khi hành động trước hoàn tất.',
    source_section: 'DEMO', source_item: 'FILL_01',
    options: makeOptions('demo-fill-1', ['고 나서', '기 때문에', '는 동안', '더라도'], 0),
  },
  {
    id: 'demo-fill-2', source_key: 'demo-fill-2', kind: 'FILL_GRAMMAR',
    stem_ko: '비가 많이 오___ 우산을 가져가세요.', target_text: null,
    explanation_vi: '-기 때문에 nêu lý do trực tiếp cho mệnh đề sau.',
    source_section: 'DEMO', source_item: 'FILL_02',
    options: makeOptions('demo-fill-2', ['는데', '기 때문에', '자마자', '는 대신에'], 1),
  },
  {
    id: 'demo-similar-1', source_key: 'demo-similar-1', kind: 'SIMILAR_GRAMMAR',
    stem_ko: '막차가 끊겨서 택시를 탈 수밖에 없었다.', target_text: '탈 수밖에 없었다',
    explanation_vi: 'Trong ngữ cảnh này, hai cách diễn đạt đều nói rằng không còn lựa chọn nào khác ngoài đi taxi.',
    source_section: 'DEMO', source_item: 'SIMILAR_01',
    options: makeOptions('demo-similar-1', ['탈 뻔했다', '타야만 했다', '탈 듯했다', '타는 법이었다'], 1),
  },
  {
    id: 'demo-similar-2', source_key: 'demo-similar-2', kind: 'SIMILAR_GRAMMAR',
    stem_ko: '회의가 끝나자마자 집에 갔어요.', target_text: '끝나자마자',
    explanation_vi: 'Cả hai biểu thức đều chỉ hành động diễn ra ngay sau khi cuộc họp kết thúc.',
    source_section: 'DEMO', source_item: 'SIMILAR_02',
    options: makeOptions('demo-similar-2', ['끝나는 대로', '끝나 봐야', '끝나기는 하지만', '끝나는가 하면'], 0),
  },
];

export const demoGrammar: TopikGrammar[] = [
  {
    id: 'demo-grammar-1', slug: 'demo-go-naseo', pattern_ko: '-고 나서', form_rule: 'V-고 나서',
    display_meaning_vi: 'sau khi hoàn thành hành động trước', primary_category: 'SEQUENCE', question_scope: 'Q1_2',
    senses: [{ id: 'demo-sense-1', sense_key: 'demo-go-naseo-sense', meaning_vi: 'sau khi hoàn thành hành động trước', usage_note_vi: 'Dùng khi vế sau xảy ra sau vế trước.', constraints_vi: null, category: 'SEQUENCE', examples: [{ id: 'demo-example-1', sentence_ko: '숙제를 하고 나서 잤어요.', translation_vi: 'Tôi ngủ sau khi làm bài tập.' }] }],
  },
  {
    id: 'demo-grammar-2', slug: 'demo-gi-ttaemune', pattern_ko: '-기 때문에', form_rule: 'V/A-기 때문에',
    display_meaning_vi: 'vì, bởi vì', primary_category: 'CAUSE', question_scope: 'Q1_2',
    senses: [{ id: 'demo-sense-2', sense_key: 'demo-gi-ttaemune-sense', meaning_vi: 'vì, bởi vì', usage_note_vi: 'Nêu nguyên nhân cho kết quả sau.', constraints_vi: null, category: 'CAUSE', examples: [{ id: 'demo-example-2', sentence_ko: '비가 오기 때문에 못 가요.', translation_vi: 'Vì trời mưa nên tôi không thể đi.' }] }],
  },
];

export const demoRelations: TopikRelationGroup[] = [
  {
    id: 'demo-relation-1', group_key: 'demo-relation-1', title_vi: 'không còn lựa chọn khác', category: 'NECESSITY', context_note_vi: 'Chỉ tương đương khi cả hai diễn tả sự bắt buộc do không còn lựa chọn khác.',
    members: [
      { sense_id: 'demo-relation-1-a', member_order: 1, member_role: 'HEAD', pattern_ko: '-(으)ㄹ 수밖에 없다', meaning_vi: 'không còn cách nào khác', usage_note_vi: null, constraints_vi: null, examples: [] },
      { sense_id: 'demo-relation-1-b', member_order: 2, member_role: 'EQUIVALENT', pattern_ko: '-아/어야만 하다', meaning_vi: 'phải làm', usage_note_vi: null, constraints_vi: null, examples: [] },
    ],
  },
  {
    id: 'demo-relation-2', group_key: 'demo-relation-2', title_vi: 'ngay sau khi', category: 'IMMEDIATE_SEQUENCE', context_note_vi: 'Cả hai đều diễn tả hành động xảy ra ngay sau một mốc hoàn tất.',
    members: [
      { sense_id: 'demo-relation-2-a', member_order: 1, member_role: 'HEAD', pattern_ko: '-자마자', meaning_vi: 'ngay khi', usage_note_vi: null, constraints_vi: null, examples: [] },
      { sense_id: 'demo-relation-2-b', member_order: 2, member_role: 'EQUIVALENT', pattern_ko: '-는 대로', meaning_vi: 'ngay khi', usage_note_vi: null, constraints_vi: null, examples: [] },
    ],
  },
];
