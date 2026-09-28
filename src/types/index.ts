export interface StudySet {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  card_count?: number;
  cards?: Flashcard[];
}

export interface Flashcard {
  id: string;
  study_set_id: string;
  term: string;
  meaning: string;
  order_index?: number;
  created_at?: string;
  updated_at?: string;
}

export interface FlashcardDraft {
  id?: string;
  term: string;
  meaning: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  display_name: string;
  created_at: string;
}

export interface QuizQuestion {
  cardId: string;
  term: string;
  correctMeaning: string;
  options: string[];
  correctIndex: number;
}

export interface QuizAnswerRecord {
  question: QuizQuestion;
  selectedIndex: number;
  isCorrect: boolean;
}

export interface StudyProgress {
  id: string;
  user_id: string;
  flashcard_id: string;
  correct_count: number;
  incorrect_count: number;
  last_reviewed_at: string;
}

// ==========================================
// WRITTEN ANSWER MODE TYPES
// ==========================================

export type WriteDirection = 'meaning_to_term' | 'term_to_meaning';

export type QuestionStatus = 'idle' | 'incorrect_retry' | 'correct' | 'revealed_failed';

export interface WriteAttemptRecord {
  card: Flashcard;
  userAnswers: string[];
  isPassed: boolean;
  attemptsCount: number;
}
