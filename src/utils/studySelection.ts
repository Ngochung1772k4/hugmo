import type { Flashcard } from '../types';

export function getStudyCardLimit(search: string, availableCount: number) {
  const requested = Number.parseInt(new URLSearchParams(search).get('limit') || '', 10);
  if (!Number.isInteger(requested) || requested < 1) return availableCount;
  return Math.min(requested, availableCount);
}

export function selectStudyCards(cards: Flashcard[], limit: number) {
  if (limit >= cards.length) return [...cards];
  const shuffled = [...cards];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled.slice(0, Math.max(1, limit));
}
