import assert from 'node:assert/strict';
import test from 'node:test';
import { classifyQ54Requirement } from '../supabase/functions/analyze-q54-question/classification.js';
import { normalizeQ54TopicSuggestion } from '../supabase/functions/analyze-q54-question/topic.js';

const cases = [
  ['인터넷 정보를 올바르게 이용하는 것이 필요한 이유는 무엇인가?', '필요성', 'POSITIVE'],
  ['창의력이 필요한 이유는 무엇인가?', '필요성', 'POSITIVE'],
  ['직업 선택이 중요한 이유는 무엇인가?', '중요성', 'POSITIVE'],
  ['다양한 경험을 쌓기 어려운 이유는 무엇인가?', '어려운 이유', 'CAUSE'],
  ['SNS를 올바르게 이용하기 위해 어떤 태도가 필요한가?', '바람직한 태도', 'SOLUTION'],
  ['부모의 가장 중요한 역할은 무엇인가?', '역할', 'SPECIAL'],
  ['합리적인 소비 습관이 중요한 이유는 무엇인가?', '중요성', 'POSITIVE'],
  ['사람들이 합리적인 소비를 실천하기 어려운 이유는 무엇인가?', '어려운 이유', 'CAUSE'],
  ['합리적인 소비 습관을 형성하기 위해 어떤 노력이 필요한가?', '노력', 'SOLUTION'],
];

for (const [promptKo, requirementType, functionGroup] of cases) {
  test(`${promptKo} -> ${requirementType}/${functionGroup}`, () => {
    assert.deepEqual(classifyQ54Requirement({ promptKo, requirementType: '기타' }), { requirementType, functionGroup });
  });
}

test('deterministic mapping ignores an inconsistent AI group', () => {
  assert.deepEqual(classifyQ54Requirement({ promptKo: '인터넷 정보를 올바르게 이용하는 것이 필요한 이유는 무엇인가?', requirementType: '필요성', functionGroup: 'SPECIAL' }), { requirementType: '필요성', functionGroup: 'POSITIVE' });
});

test('consumption prompt remains a consumer-economy topic when resource waste is mentioned', () => {
  const promptKo = '현대 사회에서는 온라인 쇼핑과 다양한 광고의 영향으로 필요하지 않은 물건까지 구매하는 경우가 많아지고 있다. 이로 인해 자원 낭비 문제도 커지고 있다. 합리적인 소비 습관이 중요한 이유는 무엇인가? 사람들이 합리적인 소비를 실천하기 어려운 이유는 무엇인가? 합리적인 소비 습관을 형성하기 위해 어떤 노력이 필요한가?';
  assert.deepEqual(normalizeQ54TopicSuggestion(promptKo, { slug: 'environment', topicKo: '환경', topicVi: 'Môi trường', subtopicKo: '자원 낭비' }), {
    slug: 'consumer-economy',
    nameKo: '소비 / 경제생활',
    nameVi: 'Tiêu dùng / Đời sống kinh tế',
    subtopicKo: '합리적인 소비 습관',
  });
});
