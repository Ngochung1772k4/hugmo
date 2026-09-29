export type IdiomMemoryGroup =
  | 'EYE'
  | 'MOUTH_TASTE'
  | 'EAR'
  | 'HAND'
  | 'FOOT'
  | 'HEAD_FACE'
  | 'CHEST_MIND'
  | 'TORSO'
  | 'BODY_REACTION'
  | 'ABSTRACT_ACTION'
  | 'PROVERB_METAPHOR';

export type IdiomPriority = 'S' | 'A' | 'B';
export type IdiomReviewStatus = 'VERIFIED' | 'NEEDS_GLOSS' | 'NEEDS_REVIEW';
export type Reading2021Mode = 'GUIDED' | 'PRACTICE' | 'RETRY';
export type IdiomProgressStatus = 'NEW' | 'LEARNING' | 'REVIEW' | 'MASTERED';

export interface ReadingIdiomGroup {
  id: string;
  code: IdiomMemoryGroup;
  nameKo: string;
  nameVi: string;
  sortOrder: number;
}

export interface ReadingIdiom {
  id: string;
  expressionKo: string;
  meaningViSource: string | null;
  meaningViEditorial: string | null;
  memoryGroupCode: IdiomMemoryGroup;
  bodyPart: string | null;
  coreVerb: string | null;
  coreVerbViEditorial: string | null;
  priority: IdiomPriority;
  reviewStatus: IdiomReviewStatus;
  reviewNote: string | null;
  sourcePages: number[];
}

export interface ReadingPairQuestion {
  id: string;
  questionNo: 19 | 20 | 21 | 22;
  skillCode: 'CONNECTIVE_IN_CONTEXT' | 'TOPIC_MAIN_IDEA' | 'IDIOM_IN_CONTEXT' | 'CONTENT_MATCH';
  promptKo: string | null;
  options: string[];
  answerIndex: number;
  correctIdiomId: string | null;
  optionIdiomIds: Array<string | null>;
}

export interface Reading2021Exercise {
  id: string;
  sourceKey: string;
  questionPair: '19_20' | '21_22';
  setType: 'SAMPLE' | 'PRACTICE';
  sourcePage: number;
  passageKo: string;
  targetQuestion: ReadingPairQuestion;
  companionQuestion: ReadingPairQuestion;
}

export interface Reading2021Attempt {
  id: string;
  userId: string;
  questionId: string;
  selectedIndex: number;
  isCorrect: boolean;
  mode: Reading2021Mode;
  answeredAt: string;
}

export interface ReadingIdiomProgress {
  idiomId: string;
  seenCount: number;
  correctCount: number;
  wrongCount: number;
  lastSeenAt: string | null;
  status: IdiomProgressStatus;
}

export interface TopikReading2021Service {
  getIdiomGroups(): Promise<ReadingIdiomGroup[]>;
  getIdioms(): Promise<ReadingIdiom[]>;
  getQ20Exercises(): Promise<Reading2021Exercise[]>;
  getQ21Exercises(): Promise<Reading2021Exercise[]>;
  getAttempts(userId: string): Promise<Reading2021Attempt[]>;
  getIdiomProgress(userId: string): Promise<ReadingIdiomProgress[]>;
  recordAttempt(input: {
    attemptId: string;
    userId: string;
    questionId: string;
    selectedIndex: number;
    mode: Reading2021Mode;
  }): Promise<Reading2021Attempt>;
}
