import type { BlankResult, SourceAnswerBlank } from './types';

export function normalizeSourceAnswer(value: string) {
  return value.normalize('NFC').trim().replace(/\s+/g, ' ').replace(/[.!?…]+$/u, '');
}

export function checkSourceAnswers(blanks: SourceAnswerBlank[], answers: Record<string, string>): { blanks: BlankResult[]; score: number } {
  const result = blanks.map((blank) => {
    const answer = answers[blank.key] || '';
    if (!answer.trim()) return { key: blank.key, status: 'EMPTY' as const, matchedVariant: null };
    const matchedVariant = blank.sourceAnswerVariants.find((variant) => normalizeSourceAnswer(variant) === normalizeSourceAnswer(answer)) || null;
    return { key: blank.key, status: matchedVariant ? 'SOURCE_MATCH' as const : 'NOT_SOURCE_MATCH' as const, matchedVariant };
  });
  return { blanks: result, score: result.filter((item) => item.status === 'SOURCE_MATCH').length };
}

export function renderBlankSegments(body: string, blankKeys: string[]) {
  const escape = (key: string) => key.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
  return body.split(new RegExp('(' + blankKeys.map(escape).join('|') + ')', 'g')).filter(Boolean);
}

export function nearbySentences(body: string, blankKey: string) {
  const sentences = body.match(/[^.!?]+[.!?]?/gu)?.map((item) => item.trim()).filter(Boolean) || [body];
  const index = sentences.findIndex((sentence) => sentence.includes(blankKey));
  return {
    previous: sentences[Math.max(0, index - 1)] || null,
    current: sentences[index] || body,
    next: sentences[Math.min(sentences.length - 1, index + 1)] || null,
  };
}
