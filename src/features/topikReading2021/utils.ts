const stopWords = new Set(['그리고', '그러나', '하지만', '때문에', '위해서', '것이다', '있는', '있는지', '있다', '하다', '된다', '이번', '이런', '그런', '것을', '것이', '에서', '으로', '에게', '대한']);

export function repeatedCoreTerms(passageKo: string) {
  const counts = new Map<string, number>();
  for (const token of passageKo.match(/[가-힣]{2,}/g) || []) {
    if (stopWords.has(token)) continue;
    counts.set(token, (counts.get(token) || 0) + 1);
  }
  return [...counts.entries()].filter(([, count]) => count > 1).sort((left, right) => right[1] - left[1]).slice(0, 6).map(([term]) => term);
}

export function idiomMeaning(item: { meaningViSource: string | null; meaningViEditorial: string | null }) {
  if (item.meaningViSource) return { label: 'Nghĩa sách', value: item.meaningViSource };
  if (item.meaningViEditorial) return { label: 'Giải nghĩa bổ sung', value: item.meaningViEditorial };
  return { label: 'Nghĩa sách', value: 'Chưa có nghĩa Việt được chú giải trong nguồn seed.' };
}
