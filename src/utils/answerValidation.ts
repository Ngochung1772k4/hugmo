/**
 * Normalizes input string before comparison:
 * - Trims leading and trailing whitespace
 * - Applies Unicode NFC normalization (important for composed Korean Hangul)
 * - Preserves all internal spaces and punctuation
 */
export function normalizeAnswer(text: string): string {
  if (!text) return '';
  return text.trim().normalize('NFC');
}

export interface ValidationResult {
  isCorrect: boolean;
  normalizedUser: string;
  normalizedTarget: string;
}

/**
 * Validates a user's typed answer against the target definition or term.
 * - For Korean Hangul: exact character match after NFC normalization (no casing).
 * - For Latin / English: case-insensitive matching.
 * - No AI guessing, no fuzzy matching, no spell checking.
 */
export function checkAnswer(userAnswer: string, targetAnswer: string): ValidationResult {
  const normalizedUser = normalizeAnswer(userAnswer);
  const normalizedTarget = normalizeAnswer(targetAnswer);

  if (!normalizedUser || !normalizedTarget) {
    return { isCorrect: false, normalizedUser, normalizedTarget };
  }

  // Detect whether target contains Korean Hangul characters
  const hasKorean = /[\uac00-\ud7af\u1100-\u11ff\u3130-\u318f]/.test(normalizedTarget);

  let isCorrect = false;
  if (hasKorean) {
    isCorrect = normalizedUser === normalizedTarget;
  } else {
    isCorrect = normalizedUser.toLowerCase() === normalizedTarget.toLowerCase();
  }

  return {
    isCorrect,
    normalizedUser,
    normalizedTarget,
  };
}

/**
 * Architectural placeholder for future extension with multiple accepted answers
 */
export function checkAnswerWithAlternatives(
  userAnswer: string,
  primaryTarget: string,
  acceptedAnswers: string[] = []
): ValidationResult {
  const primaryResult = checkAnswer(userAnswer, primaryTarget);
  if (primaryResult.isCorrect) return primaryResult;

  for (const alt of acceptedAnswers) {
    const altResult = checkAnswer(userAnswer, alt);
    if (altResult.isCorrect) return altResult;
  }

  return primaryResult;
}
