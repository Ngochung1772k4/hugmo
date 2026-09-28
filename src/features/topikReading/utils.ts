import type { TopikAttempt, TopikOverviewProgress, TopikQuestion, TopikQuestionKind } from './types';

export function selectQuestions(questions: TopikQuestion[], count: number): TopikQuestion[] {
  const copy = [...questions];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[target]] = [copy[target], copy[index]];
  }
  return copy.slice(0, count);
}

export function getProgress(totalQuestions: number, attempts: TopikAttempt[]): TopikOverviewProgress {
  const latestByQuestion = new Map<string, TopikAttempt>();
  attempts.forEach((attempt) => {
    const current = latestByQuestion.get(attempt.question_id);
    if (!current || new Date(attempt.answered_at) > new Date(current.answered_at)) {
      latestByQuestion.set(attempt.question_id, attempt);
    }
  });
  return {
    totalQuestions,
    attemptedQuestions: latestByQuestion.size,
    correctAttempts: attempts.filter((attempt) => attempt.is_correct).length,
    totalAttempts: attempts.length,
    unresolvedWrongQuestionIds: [...latestByQuestion.values()]
      .filter((attempt) => !attempt.is_correct)
      .map((attempt) => attempt.question_id),
  };
}

export function modeToKind(mode: string): TopikQuestionKind | undefined {
  return mode === 'fill' ? 'FILL_GRAMMAR' : mode === 'similar' ? 'SIMILAR_GRAMMAR' : undefined;
}

export function highlightTarget(sentence: string, target: string | null): { before: string; target: string; after: string; matched: boolean } {
  if (!target) return { before: sentence, target: '', after: '', matched: false };
  const first = sentence.indexOf(target);
  if (first === -1 || sentence.indexOf(target, first + target.length) !== -1) {
    return { before: sentence, target, after: '', matched: false };
  }
  return { before: sentence.slice(0, first), target, after: sentence.slice(first + target.length), matched: true };
}

export function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable;
}
