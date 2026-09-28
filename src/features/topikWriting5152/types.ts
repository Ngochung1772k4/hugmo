export type SourceType = 'SOURCE_BOOK' | 'MANUAL' | 'AI_GENERATED';
export type Q51IntentCode = 'FUTURE_PLAN' | 'PAST_EXPERIENCE' | 'REQUEST_FAVOR' | 'REQUEST_COMMAND' | 'REQUEST_INFORMATION' | 'REFUSAL_INCONVENIENCE' | 'THANK_APOLOGY_CONGRATS';
export type Q52RelationCode = 'CAUSE' | 'EFFECT' | 'ADDITION' | 'REPORTED_SPEECH' | 'DEFINITION' | 'PURPOSE_CONDITION' | 'PARTIAL_NEGATION' | 'COMPARISON' | 'DEPENDENCY_OTHER';
export type WritingPracticeMode = 'GUIDED' | 'MIXED' | 'WRONG_ONLY';
export type BlankCheckStatus = 'SOURCE_MATCH' | 'NOT_SOURCE_MATCH' | 'EMPTY';

export interface SourceAnswerBlank {
  id: string;
  key: string;
  order: number;
  sourceAnswerVariants: string[];
  reviewNote?: string | null;
}

export interface Q51Intent {
  id: string;
  code: Q51IntentCode;
  nameVi: string;
  nameKo: string | null;
  patterns: Array<{ id: string; patternKo: string; patternKind: 'PREFERRED' | 'ALTERNATIVE' | 'PAIRED'; sortOrder: number }>;
}

export interface Q52Relation {
  id: string;
  code: Q52RelationCode;
  nameVi: string;
  nameKo: string | null;
  patterns: Array<{ id: string; patternKo: string; sortOrder: number }>;
}

interface WritingExerciseBase {
  id: string;
  sourceKey: string;
  titleKo: string | null;
  bodyKo: string;
  blanks: SourceAnswerBlank[];
  sourcePages: number[];
  answerSourcePages: number[];
  reviewStatus: 'VERIFIED' | 'NEEDS_REVIEW';
}

export interface Q51Exercise extends WritingExerciseBase {
  exerciseGroup: 'SECTION_PRACTICE' | 'MIXED_PRACTICE';
  intentCode: Q51IntentCode | null;
}

export interface Q52Exercise extends WritingExerciseBase {}

export interface BlankResult {
  key: string;
  status: BlankCheckStatus;
  matchedVariant: string | null;
}

export interface WritingBlankAttempt {
  id: string;
  userId: string;
  questionNo: 51 | 52;
  exerciseId: string;
  answers: Record<string, string>;
  result: { blanks: BlankResult[] };
  score: number;
  mode: WritingPracticeMode;
  createdAt: string;
}

export interface TopikWriting5152Service {
  getQ51Intents(): Promise<Q51Intent[]>;
  getQ52Relations(): Promise<Q52Relation[]>;
  getQ51Exercises(): Promise<Q51Exercise[]>;
  getQ52Exercises(): Promise<Q52Exercise[]>;
  getAttempts(userId: string, questionNo: 51 | 52): Promise<WritingBlankAttempt[]>;
  recordAttempt(input: { attemptId: string; userId: string; questionNo: 51 | 52; exerciseId: string; answers: Record<string, string>; mode: WritingPracticeMode }): Promise<WritingBlankAttempt>;
}
