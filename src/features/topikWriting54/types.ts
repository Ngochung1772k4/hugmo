export type Q54ContentStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type Q54SourceType = 'MANUAL' | 'AI_GENERATED' | 'OFFICIAL';
export type Q54FunctionGroup = 'POSITIVE' | 'NEGATIVE' | 'CAUSE' | 'SOLUTION' | 'SPECIAL';
export type Q54IdeaScope = 'GLOBAL' | 'TOPIC';
export type Q54IdeaDifficulty = 'EASY' | 'NORMAL' | 'ADVANCED';
export type Q54RequirementType =
  | '장점'
  | '필요성'
  | '중요성'
  | '긍정적인 영향'
  | '문제점'
  | '부정적인 영향'
  | '부작용'
  | '어려운 이유'
  | '원인'
  | '배경'
  | '노력'
  | '해결 방안'
  | '방법'
  | '바람직한 태도'
  | '역할'
  | '특징'
  | '고려 사항'
  | '기타';
export const q54RequirementTypes: readonly Q54RequirementType[] = ['장점', '필요성', '중요성', '긍정적인 영향', '문제점', '부정적인 영향', '부작용', '어려운 이유', '원인', '배경', '노력', '해결 방안', '방법', '바람직한 태도', '역할', '특징', '고려 사항', '기타'];
export const q54FunctionGroups: readonly Q54FunctionGroup[] = ['POSITIVE', 'NEGATIVE', 'CAUSE', 'SOLUTION', 'SPECIAL'];
export const q54FunctionGroupByType: Record<Q54RequirementType, Q54FunctionGroup> = {
  '장점': 'POSITIVE', '필요성': 'POSITIVE', '중요성': 'POSITIVE', '긍정적인 영향': 'POSITIVE',
  '문제점': 'NEGATIVE', '부정적인 영향': 'NEGATIVE', '부작용': 'NEGATIVE',
  '어려운 이유': 'CAUSE', '원인': 'CAUSE', '배경': 'CAUSE',
  '노력': 'SOLUTION', '해결 방안': 'SOLUTION', '방법': 'SOLUTION', '바람직한 태도': 'SOLUTION',
  '역할': 'SPECIAL', '특징': 'SPECIAL', '고려 사항': 'SPECIAL', '기타': 'SPECIAL',
};
export type Q54ErrorType = 'PARTICLE' | 'GRAMMAR' | 'VOCABULARY' | 'COLLOCATION' | 'SPELLING' | 'LOGIC' | 'REPETITION' | 'QUESTION_RELEVANCE';

export interface Q54Topic { id: string; slug: string; name_ko: string; name_vi: string; description_vi: string | null; visibility?: 'PUBLIC' | 'PRIVATE'; status: Q54ContentStatus; source_type: Q54SourceType; }
export interface Q54Question { id: string; topic_id: string | null; subtopic_ko: string | null; prompt_ko: string; visibility: 'PUBLIC' | 'PRIVATE'; status: Q54ContentStatus; source_type: Q54SourceType; }
export interface Q54Requirement { id: string; question_id: string; order_index: number; prompt_ko: string; label_vi: string; requirement_type: Q54RequirementType; function_group: Q54FunctionGroup; }
export interface Q54Idea {
  id: string;
  topic_id: string | null;
  requirement_id: string | null;
  seed_key?: string | null;
  scope?: Q54IdeaScope;
  requirement_types?: string[];
  subtopic_tags?: string[];
  function_group: Q54FunctionGroup;
  keyword_ko: string;
  keyword_vi: string;
  reason_ko?: string | null;
  reason_vi?: string | null;
  result_ko?: string | null;
  result_vi?: string | null;
  expansion_ko?: string | null;
  expansion_vi?: string | null;
  logic_steps: string[];
  logic_chain_ko?: string[] | null;
  logic_chain_vi?: string[] | null;
  recommended_collocations?: string[] | null;
  reuse_score?: number | null;
  difficulty?: Q54IdeaDifficulty | null;
  visibility?: 'PUBLIC' | 'PRIVATE';
  created_by?: string | null;
}
export interface Q54Collocation { id: string; expression_ko: string; meaning_vi: string; reuse_score: number; function_group: Q54FunctionGroup | null; }
export interface Q54Pattern { id: string; function_group: Q54FunctionGroup; pattern_ko: string; meaning_vi: string; difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'; reuse_score: number; }
export interface Q54PatternExample { id: string; pattern_id: string; topic_id: string | null; sentence_ko: string; translation_vi: string; }
export type Q54HintKey = 'vocabulary' | 'pattern' | 'logic' | 'sample';
export interface Q54ExerciseHints { vocabulary?: string[]; pattern?: string; logic?: string; sample?: string; }
export interface Q54Exercise { id: string; topic_id: string; requirement_id: string; prompt_vi: string; reference_answer_ko: string | null; vocabulary_hint: string[]; pattern_hint: string | null; sample_sentence_ko: string | null; created_by?: string | null; visibility?: 'PUBLIC' | 'PRIVATE'; generation_mode?: 'CURATED' | 'AI_GENERATED' | 'USER_ENTERED'; difficulty?: 'NORMAL'; generation_context_json?: Record<string, unknown>; hint_cache?: Q54ExerciseHints; created_at?: string; }
export interface Q54QuestionBundle { topic: Q54Topic; question: Q54Question; requirements: Q54Requirement[]; ideas: Q54Idea[]; collocations: Q54Collocation[]; globalCollocations: Q54Collocation[]; patterns: Q54Pattern[]; examples: Q54PatternExample[]; exercises: Q54Exercise[]; }
export interface Q54TopicSuggestion { kind: 'EXISTING' | 'OTHER'; slug: string; nameKo: string; nameVi: string; subtopicKo: string | null; }
export interface Q54QuestionAnalysis { requirements: Array<{ promptKo: string; labelVi: string; requirementType: Q54RequirementType; functionGroup: Q54FunctionGroup }>; topicSuggestion: Q54TopicSuggestion | null; }
export interface Q54GeneratedIdea {
  id?: string;
  keywordKo: string;
  keywordVi: string;
  reasonKo: string;
  reasonVi: string;
  resultKo: string;
  resultVi: string;
  expansionKo?: string | null;
  expansionVi?: string | null;
  logicChainKo: string[];
  logicChainVi: string[];
  recommendedCollocations: string[];
}
export interface Q54Assessment { verdict: 'ACCEPTABLE' | 'NEEDS_REVISION'; summaryVi: string; correctedSentence: string; errors: Array<{ type: Q54ErrorType; original: string; corrected: string; explanationVi: string }>; naturalAlternatives: string[]; usedPatterns: string[]; usedVocabulary: string[]; }
export interface Q54SentenceAttempt { id: string; state: 'PROCESSING' | 'ASSESSED' | 'FAILED'; assessment_json: Q54Assessment | null; hint_level: number; hints_used: string[]; created_at: string; }
export interface Q54UserError { id: string; error_key: string; error_type: Q54ErrorType; original_text: string; corrected_text: string; explanation_vi: string; occurrence_count: number; first_seen_at: string; last_seen_at: string; mastered: boolean; }
