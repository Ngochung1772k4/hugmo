import seedSource from '../../../supabase/seed/sources/TOPIK_READING_20_21_SEED_DATA.json';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';
import type { IdiomProgressStatus, Reading2021Attempt, Reading2021Exercise, ReadingIdiom, ReadingIdiomGroup, ReadingIdiomProgress, ReadingPairQuestion, TopikReading2021Service } from './types';

const attemptStorageKey = 'hugmo_topik_reading_20_21_attempts';
const progressStorageKey = 'hugmo_topik_reading_20_21_idiom_progress';

function normalizeIdiom(value: string) {
  return value.replaceAll('을 ', ' ').replaceAll('를 ', ' ').replaceAll('췄', '추').replaceAll('섰', '서').replaceAll('었', '').replace(/(고|게|는|은|을|서|야|다)$/u, '').replace(/\s+/gu, ' ').trim();
}

function optionIdiomExpression(option: string, page: number) {
  const optionKey = normalizeIdiom(option);
  const candidates = seedSource.q21.idioms.filter((idiom) => idiom.source_locations.some((location) => location.kind === 'Q21_OPTION' && location.page === page)).map((idiom) => {
    const expressionKey = normalizeIdiom(idiom.expression_ko);
    let score = 0;
    while (score < optionKey.length && score < expressionKey.length && optionKey[score] === expressionKey[score]) score += 1;
    return { expression: idiom.expression_ko, score, floor: Math.min(optionKey.length, expressionKey.length) - 1 };
  }).filter((candidate) => candidate.score >= candidate.floor).sort((left, right) => right.score - left.score);
  return candidates[0]?.expression || null;
}

function demoQuestion(exercise: any, questionNo: 19 | 20 | 21 | 22): ReadingPairQuestion {
  const source = exercise['q' + questionNo];
  const isIdiom = questionNo === 21;
  const optionExpressions = isIdiom ? source.options.map((option: string) => optionIdiomExpression(option, exercise.source_page)) : [];
  return {
    id: exercise.source_key + '-Q' + questionNo,
    questionNo,
    skillCode: questionNo === 19 ? 'CONNECTIVE_IN_CONTEXT' : questionNo === 20 ? 'TOPIC_MAIN_IDEA' : questionNo === 21 ? 'IDIOM_IN_CONTEXT' : 'CONTENT_MATCH',
    promptKo: source.prompt || null,
    options: source.options,
    answerIndex: source.answer_index,
    correctIdiomId: isIdiom ? optionExpressions[source.answer_index - 1] : null,
    optionIdiomIds: optionExpressions,
  };
}

function demoExercises(pair: '19_20' | '21_22'): Reading2021Exercise[] {
  const records = pair === '19_20' ? seedSource.q20.exercises : seedSource.q21.exercises;
  const targetNo = pair === '19_20' ? 20 : 21;
  const companionNo = pair === '19_20' ? 19 : 22;
  return records.map((exercise) => ({
    id: exercise.source_key,
    sourceKey: exercise.source_key,
    questionPair: pair,
    setType: exercise.set as 'SAMPLE' | 'PRACTICE',
    sourcePage: exercise.source_page,
    passageKo: exercise.passage_ko,
    targetQuestion: demoQuestion(exercise, targetNo),
    companionQuestion: demoQuestion(exercise, companionNo),
  }));
}

function readStorage<T>(key: string): T[] {
  try { return JSON.parse(localStorage.getItem(key) || '[]') as T[]; }
  catch { localStorage.removeItem(key); return []; }
}

function writeStorage<T>(key: string, value: T[]) {
  localStorage.setItem(key, JSON.stringify(value));
}

function nextProgressStatus(correctCount: number, wrongCount: number, isCorrect: boolean): IdiomProgressStatus {
  if (!isCorrect) return 'LEARNING';
  if (correctCount >= 4 && correctCount / Math.max(correctCount + wrongCount, 1) >= 0.8) return 'MASTERED';
  if (correctCount >= 2) return 'REVIEW';
  return 'LEARNING';
}

function updateDemoProgress(userId: string, idiomId: string | null, isCorrect: boolean) {
  if (!idiomId) return;
  const all = readStorage<ReadingIdiomProgress & { userId: string }>(progressStorageKey);
  const existing = all.find((item) => item.userId === userId && item.idiomId === idiomId);
  const correctCount = (existing?.correctCount || 0) + (isCorrect ? 1 : 0);
  const wrongCount = (existing?.wrongCount || 0) + (isCorrect ? 0 : 1);
  const next = { userId, idiomId, seenCount: (existing?.seenCount || 0) + 1, correctCount, wrongCount, lastSeenAt: new Date().toISOString(), status: nextProgressStatus(correctCount, wrongCount, isCorrect) };
  writeStorage(progressStorageKey, [...all.filter((item) => item !== existing), next]);
}

function createDemoService(): TopikReading2021Service {
  const q20 = demoExercises('19_20');
  const q21 = demoExercises('21_22');
  const idioms = seedSource.q21.idioms.filter((item) => item.review_status !== 'NEEDS_REVIEW').map((item) => ({
    id: item.expression_ko, expressionKo: item.expression_ko, meaningViSource: item.meaning_vi_source, memoryGroupCode: item.memory_group, bodyPart: item.body_part, coreVerb: item.core_verb, coreVerbViEditorial: item.core_verb_vi_editorial, priority: item.priority, reviewStatus: item.review_status, reviewNote: item.review_note, sourcePages: item.source_locations.map((location) => location.page),
  })) as ReadingIdiom[];
  return {
    async getIdiomGroups() { return seedSource.q21.memory_groups.map((item) => ({ id: item.code, code: item.code, nameKo: item.name_ko, nameVi: item.name_vi, sortOrder: item.sort_order })) as ReadingIdiomGroup[]; },
    async getIdioms() { return idioms; },
    async getQ20Exercises() { return q20; },
    async getQ21Exercises() { return q21; },
    async getAttempts(userId) { return readStorage<Reading2021Attempt>(attemptStorageKey).filter((item) => item.userId === userId).sort((left, right) => right.answeredAt.localeCompare(left.answeredAt)); },
    async getIdiomProgress(userId) { return readStorage<ReadingIdiomProgress & { userId: string }>(progressStorageKey).filter((item) => item.userId === userId).map(({ userId: _userId, ...item }) => item); },
    async recordAttempt(input) {
      const attempts = readStorage<Reading2021Attempt>(attemptStorageKey);
      const existing = attempts.find((item) => item.id === input.attemptId && item.userId === input.userId);
      if (existing) return existing;
      const exercise = [...q20, ...q21].find((item) => item.targetQuestion.id === input.questionId);
      if (!exercise) throw new Error('Không tìm thấy câu hỏi.');
      const question = exercise.targetQuestion;
      const isCorrect = input.selectedIndex === question.answerIndex;
      const attempt = { id: input.attemptId, userId: input.userId, questionId: input.questionId, selectedIndex: input.selectedIndex, isCorrect, mode: input.mode, answeredAt: new Date().toISOString() };
      writeStorage(attemptStorageKey, [...attempts, attempt]);
      if (question.questionNo === 21) {
        updateDemoProgress(input.userId, question.correctIdiomId, isCorrect);
        const selected = question.optionIdiomIds[input.selectedIndex - 1];
        if (selected && selected !== question.correctIdiomId) updateDemoProgress(input.userId, selected, false);
      }
      return attempt;
    },
  };
}

function mapQuestion(row: any): ReadingPairQuestion {
  return { id: row.id, questionNo: row.question_no, skillCode: row.skill_code, promptKo: row.prompt_ko, options: row.options, answerIndex: row.answer_index, correctIdiomId: row.correct_idiom_id, optionIdiomIds: row.option_idiom_ids || [] };
}

function mapExercise(rows: any[], questions: any[], pair: '19_20' | '21_22'): Reading2021Exercise[] {
  const targetNo = pair === '19_20' ? 20 : 21;
  const companionNo = pair === '19_20' ? 19 : 22;
  return rows.filter((row) => row.question_pair === pair).map((row) => {
    const pairQuestions = questions.filter((question) => question.exercise_id === row.id);
    const target = pairQuestions.find((question) => question.question_no === targetNo);
    const companion = pairQuestions.find((question) => question.question_no === companionNo);
    if (!target || !companion) throw new Error('Thiếu dữ liệu câu ' + targetNo + '.');
    return { id: row.id, sourceKey: row.source_key, questionPair: pair, setType: row.set_type, sourcePage: row.source_page, passageKo: row.passage_ko, targetQuestion: mapQuestion(target), companionQuestion: mapQuestion(companion) };
  });
}

function createLiveService(): TopikReading2021Service {
  return {
    async getIdiomGroups() {
      const { data, error } = await supabase.from('topik_reading_idiom_groups').select('*').order('sort_order');
      if (error) throw error;
      return (data || []).map((item: any) => ({ id: item.id, code: item.code, nameKo: item.name_ko, nameVi: item.name_vi, sortOrder: item.sort_order }));
    },
    async getIdioms() {
      const [idiomsResult, locationsResult] = await Promise.all([supabase.from('topik_reading_idioms').select('*').order('priority').order('expression_ko'), supabase.from('topik_reading_source_locations').select('*').eq('entity_type', 'IDIOM').order('source_page')]);
      if (idiomsResult.error || locationsResult.error) throw idiomsResult.error || locationsResult.error;
      return (idiomsResult.data || []).map((item: any) => ({ id: item.id, expressionKo: item.expression_ko, meaningViSource: item.meaning_vi_source, memoryGroupCode: item.memory_group_code, bodyPart: item.body_part, coreVerb: item.core_verb, coreVerbViEditorial: item.core_verb_vi_editorial, priority: item.priority, reviewStatus: item.review_status, reviewNote: item.review_note, sourcePages: (locationsResult.data || []).filter((location: any) => location.entity_id === item.id).map((location: any) => location.source_page) }));
    },
    async getQ20Exercises() {
      const [exercisesResult, questionsResult] = await Promise.all([supabase.from('topik_reading_20_21_exercises').select('*').order('source_page'), supabase.from('topik_reading_mc_questions').select('*').order('question_no')]);
      if (exercisesResult.error || questionsResult.error) throw exercisesResult.error || questionsResult.error;
      return mapExercise(exercisesResult.data || [], questionsResult.data || [], '19_20');
    },
    async getQ21Exercises() {
      const [exercisesResult, questionsResult] = await Promise.all([supabase.from('topik_reading_20_21_exercises').select('*').order('source_page'), supabase.from('topik_reading_mc_questions').select('*').order('question_no')]);
      if (exercisesResult.error || questionsResult.error) throw exercisesResult.error || questionsResult.error;
      return mapExercise(exercisesResult.data || [], questionsResult.data || [], '21_22');
    },
    async getAttempts(userId) {
      const { data, error } = await supabase.from('topik_reading_20_21_attempts').select('*').eq('user_id', userId).order('answered_at', { ascending: false });
      if (error) throw error;
      return (data || []).map((item: any) => ({ id: item.id, userId: item.user_id, questionId: item.question_id, selectedIndex: item.selected_index, isCorrect: item.is_correct, mode: item.mode, answeredAt: item.answered_at }));
    },
    async getIdiomProgress(userId) {
      const { data, error } = await supabase.from('topik_reading_idiom_progress').select('*').eq('user_id', userId);
      if (error) throw error;
      return (data || []).map((item: any) => ({ idiomId: item.idiom_id, seenCount: item.seen_count, correctCount: item.correct_count, wrongCount: item.wrong_count, lastSeenAt: item.last_seen_at, status: item.status }));
    },
    async recordAttempt(input) {
      const { data, error } = await supabase.rpc('topik_reading_record_20_21_attempt', { p_attempt_id: input.attemptId, p_question_id: input.questionId, p_selected_index: input.selectedIndex, p_mode: input.mode });
      if (error) throw error;
      return { id: data.id, userId: data.user_id, questionId: data.question_id, selectedIndex: data.selected_index, isCorrect: data.is_correct, mode: data.mode, answeredAt: data.answered_at };
    },
  };
}

export function getTopikReading2021Service(isDemo: boolean): TopikReading2021Service {
  return isDemo || !isSupabaseConfigured ? createDemoService() : createLiveService();
}
