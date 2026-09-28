function clean(value) {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '';
}

function slugFromTopic(topicKo) {
  if (/환경/.test(topicKo)) return 'environment';
  if (/교육/.test(topicKo)) return 'education';
  if (/개인\s*정보|정보\s*보호/.test(topicKo)) return 'personal-information';
  if (/소비|경제생활|경제\s*생활/.test(topicKo)) return 'consumer-economy';
  return 'other-topic';
}

export function normalizeQ54TopicSuggestion(promptKo, proposedTopic) {
  const prompt = clean(promptKo);
  const proposed = proposedTopic && typeof proposedTopic === 'object' ? proposedTopic : {};
  const raw = proposed;
  let nameKo = clean(raw.topicKo || raw.nameKo);
  let nameVi = clean(raw.topicVi || raw.nameVi);
  let subtopicKo = clean(raw.subtopicKo) || null;

  // Consumption is the central theme even when resource waste is mentioned as one consequence.
  const isConsumptionPrompt = /합리적인\s*소비|소비\s*습관|온라인\s*쇼핑|불필요한\s*(?:물건|지출)|계획적인\s*소비/.test(prompt);
  if (isConsumptionPrompt) {
    nameKo = '소비 / 경제생활';
    nameVi = 'Tiêu dùng / Đời sống kinh tế';
    subtopicKo = /합리적인\s*소비\s*습관/.test(prompt) ? '합리적인 소비 습관' : subtopicKo || '소비 생활';
    return { slug: 'consumer-economy', nameKo, nameVi, subtopicKo };
  }

  if (!nameKo) return null;
  return {
    slug: clean(raw.slug) || slugFromTopic(nameKo),
    nameKo,
    nameVi: nameVi || 'Chủ đề riêng',
    subtopicKo,
  };
}
