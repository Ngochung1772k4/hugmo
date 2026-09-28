import seedSource from '../../../supabase/seed/sources/TOPIK_Q51_Q52_SEED_DATA.json';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';
import type { Q51Exercise, Q51Intent, Q51IntentCode, Q52Exercise, Q52Relation, Q52RelationCode, SourceAnswerBlank, TopikWriting5152Service, WritingBlankAttempt } from './types';
import { checkSourceAnswers } from './utils';

const demoAttemptsKey = 'hugmo_topik_writing_51_52_attempts';

function demoBlanks(answers: Record<string, string[]>, reviewNote?: string | null): SourceAnswerBlank[] {
  return Object.entries(answers).map(([key, sourceAnswerVariants], order) => ({ id: key, key, order, sourceAnswerVariants, reviewNote: reviewNote || null }));
}

function buildDemoQ51Exercises(): Q51Exercise[] {
  const sections = seedSource.q51.section_practice.flatMap((group) => group.items.map((item) => ({
    id: group.source_key + '_' + item.no,
    sourceKey: group.source_key + '_' + item.no,
    exerciseGroup: 'SECTION_PRACTICE' as const,
    intentCode: group.intent_code as Q51IntentCode,
    titleKo: null,
    bodyKo: item.body_ko,
    blanks: demoBlanks(item.answers as Record<string, string[]>, 'review_note' in item ? item.review_note : null),
    sourcePages: group.source_pages,
    answerSourcePages: group.answer_source_pages,
    reviewStatus: item.review_status as 'VERIFIED' | 'NEEDS_REVIEW',
  })));
  const mixed = seedSource.q51.mixed_practice.map((item) => ({
    id: item.source_key,
    sourceKey: item.source_key,
    exerciseGroup: 'MIXED_PRACTICE' as const,
    intentCode: null,
    titleKo: item.title_ko || null,
    bodyKo: item.body_ko,
    blanks: demoBlanks(item.answers as Record<string, string[]>, 'review_note' in item ? item.review_note : null),
    sourcePages: item.source_pages,
    answerSourcePages: item.answer_source_pages,
    reviewStatus: item.review_status as 'VERIFIED' | 'NEEDS_REVIEW',
  }));
  return [...sections, ...mixed].filter((item) => item.reviewStatus === 'VERIFIED');
}

function buildDemoQ52Exercises(): Q52Exercise[] {
  return seedSource.q52.practice
    .map((item) => ({
      id: item.source_key,
      sourceKey: item.source_key,
      titleKo: null,
      bodyKo: item.body_ko,
      blanks: demoBlanks(item.answers as Record<string, string[]>, 'review_note' in item ? item.review_note as string : null),
      sourcePages: item.source_pages,
      answerSourcePages: item.answer_source_pages,
      reviewStatus: item.review_status as 'VERIFIED' | 'NEEDS_REVIEW',
    }))
    .filter((item) => item.reviewStatus === 'VERIFIED');
}

function readDemoAttempts(): WritingBlankAttempt[] {
  try { return JSON.parse(localStorage.getItem(demoAttemptsKey) || '[]') as WritingBlankAttempt[]; }
  catch { localStorage.removeItem(demoAttemptsKey); return []; }
}

function writeDemoAttempts(attempts: WritingBlankAttempt[]) {
  localStorage.setItem(demoAttemptsKey, JSON.stringify(attempts));
}

function mapBlanks(rows: any[], exerciseId: string): SourceAnswerBlank[] {
  return rows.filter((item) => item.exercise_id === exerciseId).sort((left, right) => left.blank_order - right.blank_order).map((item) => ({
    id: item.id,
    key: item.blank_key,
    order: item.blank_order,
    sourceAnswerVariants: item.source_answer_variants,
    reviewNote: item.review_note,
  }));
}

function mapAttempt(row: any): WritingBlankAttempt {
  return {
    id: row.id,
    userId: row.user_id,
    questionNo: row.question_no,
    exerciseId: row.exercise_id,
    answers: row.answers,
    result: row.result_json,
    score: row.score,
    mode: row.mode,
    createdAt: row.created_at,
  };
}

function createDemoService(): TopikWriting5152Service {
  const q51Exercises = buildDemoQ51Exercises();
  const q52Exercises = buildDemoQ52Exercises();
  return {
    async getQ51Intents() {
      return seedSource.q51.intent_types.map((item, index) => ({
        id: item.code,
        code: item.code as Q51IntentCode,
        nameVi: item.name_vi,
        nameKo: item.name_ko,
        patterns: [
          ...item.preferred_patterns.map((patternKo, sortOrder) => ({ id: item.code + '-preferred-' + sortOrder, patternKo, patternKind: 'PREFERRED' as const, sortOrder })),
          ...item.alternative_patterns.map((patternKo, sortOrder) => ({ id: item.code + '-alternative-' + sortOrder, patternKo, patternKind: 'ALTERNATIVE' as const, sortOrder })),
          ...item.paired_patterns.map((patternKo, sortOrder) => ({ id: item.code + '-paired-' + sortOrder, patternKo, patternKind: 'PAIRED' as const, sortOrder })),
        ],
        sortOrder: index,
      })).map(({ sortOrder: _sortOrder, ...item }) => item);
    },
    async getQ52Relations() {
      return seedSource.q52.relation_types.map((item) => ({
        id: item.code,
        code: item.code as Q52RelationCode,
        nameVi: item.name_vi,
        nameKo: item.name_ko,
        patterns: item.patterns.map((patternKo, sortOrder) => ({ id: item.code + '-' + sortOrder, patternKo, sortOrder })),
      }));
    },
    async getQ51Exercises() { return q51Exercises; },
    async getQ52Exercises() { return q52Exercises; },
    async getAttempts(userId, questionNo) { return readDemoAttempts().filter((item) => item.userId === userId && item.questionNo === questionNo).sort((left, right) => right.createdAt.localeCompare(left.createdAt)); },
    async recordAttempt(input) {
      const existing = readDemoAttempts().find((item) => item.id === input.attemptId && item.userId === input.userId);
      if (existing) return existing;
      const exercise = (input.questionNo === 51 ? q51Exercises : q52Exercises).find((item) => item.id === input.exerciseId);
      if (!exercise) throw new Error('Không tìm thấy bài luyện.');
      const checked = checkSourceAnswers(exercise.blanks, input.answers);
      const attempt: WritingBlankAttempt = { id: input.attemptId, userId: input.userId, questionNo: input.questionNo, exerciseId: input.exerciseId, answers: input.answers, result: { blanks: checked.blanks }, score: checked.score, mode: input.mode, createdAt: new Date().toISOString() };
      writeDemoAttempts([...readDemoAttempts(), attempt]);
      return attempt;
    },
  };
}

function createLiveService(): TopikWriting5152Service {
  return {
    async getQ51Intents() {
      const [intentsResult, patternsResult] = await Promise.all([
        supabase.from('topik_writing_51_intents').select('*').order('sort_order'),
        supabase.from('topik_writing_51_patterns').select('*').order('sort_order'),
      ]);
      if (intentsResult.error || patternsResult.error) throw intentsResult.error || patternsResult.error;
      return (intentsResult.data || []).map((item: any): Q51Intent => ({
        id: item.id, code: item.code, nameVi: item.name_vi, nameKo: item.name_ko,
        patterns: (patternsResult.data || []).filter((pattern: any) => pattern.intent_id === item.id).map((pattern: any) => ({ id: pattern.id, patternKo: pattern.pattern_ko, patternKind: pattern.pattern_kind, sortOrder: pattern.sort_order })),
      }));
    },
    async getQ52Relations() {
      const [relationsResult, patternsResult] = await Promise.all([
        supabase.from('topik_writing_52_relations').select('*').order('sort_order'),
        supabase.from('topik_writing_52_patterns').select('*').order('sort_order'),
      ]);
      if (relationsResult.error || patternsResult.error) throw relationsResult.error || patternsResult.error;
      return (relationsResult.data || []).map((item: any): Q52Relation => ({
        id: item.id, code: item.code, nameVi: item.name_vi, nameKo: item.name_ko,
        patterns: (patternsResult.data || []).filter((pattern: any) => pattern.relation_id === item.id).map((pattern: any) => ({ id: pattern.id, patternKo: pattern.pattern_ko, sortOrder: pattern.sort_order })),
      }));
    },
    async getQ51Exercises() {
      const [exercisesResult, blanksResult] = await Promise.all([
        supabase.from('topik_writing_51_exercises').select('*').order('source_key'),
        supabase.from('topik_writing_51_blanks').select('*').order('blank_order'),
      ]);
      if (exercisesResult.error || blanksResult.error) throw exercisesResult.error || blanksResult.error;
      return (exercisesResult.data || []).map((item: any): Q51Exercise => ({
        id: item.id, sourceKey: item.source_key, exerciseGroup: item.exercise_group, intentCode: item.intent_code, titleKo: item.title_ko, bodyKo: item.body_ko,
        blanks: mapBlanks(blanksResult.data || [], item.id), sourcePages: item.source_pages, answerSourcePages: item.answer_source_pages, reviewStatus: item.review_status,
      }));
    },
    async getQ52Exercises() {
      const [exercisesResult, blanksResult] = await Promise.all([
        supabase.from('topik_writing_52_exercises').select('*').order('source_key'),
        supabase.from('topik_writing_52_blanks').select('*').order('blank_order'),
      ]);
      if (exercisesResult.error || blanksResult.error) throw exercisesResult.error || blanksResult.error;
      return (exercisesResult.data || []).map((item: any): Q52Exercise => ({
        id: item.id, sourceKey: item.source_key, titleKo: item.title_ko, bodyKo: item.body_ko,
        blanks: mapBlanks(blanksResult.data || [], item.id), sourcePages: item.source_pages, answerSourcePages: item.answer_source_pages, reviewStatus: item.review_status,
      }));
    },
    async getAttempts(userId, questionNo) {
      const { data, error } = await supabase.from('topik_writing_blank_attempts').select('*').eq('user_id', userId).eq('question_no', questionNo).order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map(mapAttempt);
    },
    async recordAttempt(input) {
      const { data, error } = await supabase.rpc('topik_writing_record_attempt', {
        p_attempt_id: input.attemptId,
        p_question_no: input.questionNo,
        p_exercise_id: input.exerciseId,
        p_answers: input.answers,
        p_mode: input.mode,
      });
      if (error) throw error;
      return mapAttempt(data);
    },
  };
}

export function getTopikWriting5152Service(isDemo: boolean): TopikWriting5152Service {
  return isDemo || !isSupabaseConfigured ? createDemoService() : createLiveService();
}
