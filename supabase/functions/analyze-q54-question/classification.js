const requirementTypes = new Set(['장점', '필요성', '중요성', '긍정적인 영향', '문제점', '부정적인 영향', '부작용', '어려운 이유', '원인', '배경', '노력', '해결 방안', '방법', '바람직한 태도', '역할', '특징', '고려 사항', '기타']);
const typeAliases = {
  '좋은 점': '장점', '효과': '긍정적인 영향', '도움': '긍정적인 영향', '얻을 수 있는 성과': '긍정적인 영향',
  '단점': '문제점', '어려움': '문제점', '이유': '원인', '많아진 이유': '원인', '발생한 이유': '원인',
  '긍정적 영향': '긍정적인 영향', '부정적 영향': '부정적인 영향', '해결방안': '해결 방안', '고려사항': '고려 사항',
  '올바른 태도': '바람직한 태도', '방향': '방법',
};
const groupByType = {
  '장점': 'POSITIVE', '필요성': 'POSITIVE', '중요성': 'POSITIVE', '긍정적인 영향': 'POSITIVE',
  '문제점': 'NEGATIVE', '부정적인 영향': 'NEGATIVE', '부작용': 'NEGATIVE',
  '원인': 'CAUSE', '배경': 'CAUSE', '어려운 이유': 'CAUSE',
  '노력': 'SOLUTION', '해결 방안': 'SOLUTION', '방법': 'SOLUTION', '바람직한 태도': 'SOLUTION',
  '역할': 'SPECIAL', '특징': 'SPECIAL', '고려 사항': 'SPECIAL', '기타': 'SPECIAL',
};

function clean(value) { return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : ''; }

function semanticType(promptKo, proposedType) {
  const prompt = clean(promptKo);
  const type = typeAliases[clean(proposedType)] || clean(proposedType);
  const asksForAttitude = /(?:바람직한|올바른)\s*태도|어떤\s*태도가?\s*필요|태도를?\s*(?:가져야|갖춰야)|태도가?\s*필요/.test(prompt);
  if (asksForAttitude) return '바람직한 태도';
  if (/필요한\s*이유/.test(prompt)) return '필요성';
  if (/중요한\s*이유/.test(prompt)) return '중요성';
  if (/어려운\s*이유/.test(prompt)) return '어려운 이유';
  if (/역할/.test(prompt)) return '역할';
  if (/특징/.test(prompt)) return '특징';
  if (/고려\s*사항/.test(prompt)) return '고려 사항';
  if (/해결\s*방안/.test(prompt) || type === '해결 방안') return '해결 방안';
  if (/어떤\s*노력|노력이?\s*필요/.test(prompt) || type === '노력') return '노력';
  if (/어떻게\s*해야|어떤\s*방법|방향/.test(prompt) || type === '방법') return '방법';
  return requirementTypes.has(type) ? type : '기타';
}

// The AI proposes one semantic type; group is always derived here, never trusted from model output.
export function classifyQ54Requirement({ promptKo, requirementType }) {
  const type = semanticType(promptKo, requirementType);
  return { requirementType: type, functionGroup: groupByType[type] || 'SPECIAL' };
}
