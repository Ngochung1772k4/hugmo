export type TopikQuestionKind = 'FILL_GRAMMAR' | 'SIMILAR_GRAMMAR';
export type TopikAttemptMode = 'FILL' | 'SIMILAR' | 'SPRINT' | 'WRONG_RETRY';

export interface TopikOption {
  id: string;
  question_id: string;
  position: number;
  text_ko: string;
  is_correct: boolean;
  why_wrong_vi: string | null;
}

export interface TopikQuestion {
  id: string;
  source_key: string;
  kind: TopikQuestionKind;
  stem_ko: string;
  target_text: string | null;
  explanation_vi: string;
  source_section: string;
  source_item: string;
  options: TopikOption[];
}

export interface TopikExample {
  id: string;
  sentence_ko: string;
  translation_vi: string | null;
}

export interface TopikGrammar {
  id: string;
  slug: string;
  pattern_ko: string;
  form_rule: string | null;
  display_meaning_vi: string;
  primary_category: string;
  question_scope: 'Q1_2' | 'Q3_4' | 'BOTH';
  senses: Array<{
    id: string;
    sense_key: string;
    meaning_vi: string;
    usage_note_vi: string | null;
    constraints_vi: string | null;
    category: string;
    examples: TopikExample[];
  }>;
}

export interface TopikRelationGroup {
  id: string;
  group_key: string;
  title_vi: string;
  category: string;
  context_note_vi: string;
  members: Array<{
    sense_id: string;
    member_order: number;
    member_role: 'HEAD' | 'EQUIVALENT';
    pattern_ko: string;
    meaning_vi: string;
    usage_note_vi: string | null;
    constraints_vi: string | null;
    examples: TopikExample[];
  }>;
}

export interface TopikAttempt {
  id: string;
  user_id: string;
  question_id: string;
  selected_option_id: string | null;
  is_correct: boolean;
  mode: TopikAttemptMode;
  answered_at: string;
  duration_ms: number | null;
}

export interface TopikOverviewProgress {
  totalQuestions: number;
  attemptedQuestions: number;
  correctAttempts: number;
  totalAttempts: number;
  unresolvedWrongQuestionIds: string[];
}

export interface TopikReadingService {
  getGrammar(): Promise<TopikGrammar[]>;
  getRelations(): Promise<TopikRelationGroup[]>;
  getQuestions(kind?: TopikQuestionKind): Promise<TopikQuestion[]>;
  getAttempts(userId: string): Promise<TopikAttempt[]>;
  recordAttempt(input: {
    attemptId: string;
    questionId: string;
    selectedOptionId: string | null;
    mode: TopikAttemptMode;
    durationMs: number | null;
    userId: string;
  }): Promise<TopikAttempt>;
}
