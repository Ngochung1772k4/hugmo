import { isSupabaseConfigured, supabase } from '../../lib/supabase';
import { environmentBundle, environmentQuestion, environmentRequirements, environmentTopic } from './data/demoFixture';
import type { Q54Collocation, Q54Exercise, Q54Idea, Q54Pattern, Q54PatternExample, Q54Question, Q54QuestionBundle, Q54Requirement, Q54RequirementType, Q54Topic, Q54TopicSuggestion, Q54UserError } from './types';

const demoQuestionsKey = 'hugmo_q54_demo_questions';
const demoTopicsKey = 'hugmo_q54_demo_topics';
const demoErrorsKey = 'hugmo_q54_demo_errors';

function read<T>(key: string, fallback: T): T { try { return JSON.parse(localStorage.getItem(key) || '') as T; } catch { return fallback; } }
function write(key: string, value: unknown) { localStorage.setItem(key, JSON.stringify(value)); }
function saveQuestionError(error: { message?: string }) {
  if (error.message?.includes('save_q54_private_question_with_topic')) {
    return new Error('Database Q54 chưa được cập nhật. Hãy chạy migration 20260928000007_q54_custom_topics_and_global_banks.sql trong Supabase SQL Editor, rồi tải lại trang.');
  }
  return error;
}

export interface Q54Service {
  getEnvironment(): Promise<{ topic: Q54Topic; questions: Q54Question[]; requirements: Q54Requirement[] }>;
  getQuestionBundle(questionId: string): Promise<Q54QuestionBundle>;
  getExercise(exerciseId: string): Promise<Q54Exercise>;
  savePrivateQuestion(input: { topic: Q54TopicSuggestion; promptKo: string; requirements: Array<{ promptKo: string; labelVi: string; requirementType: Q54RequirementType; functionGroup: Q54Requirement['function_group'] }> }): Promise<Q54Question>;
  getErrors(userId: string): Promise<Q54UserError[]>;
}

const globalDemoCollocations: Q54Collocation[] = [
  { id: 'global-positive-help', expression_ko: '~는 데 도움이 된다', meaning_vi: 'giúp ích cho việc ~', reuse_score: 5, function_group: 'POSITIVE' },
  { id: 'global-positive-role', expression_ko: '~는 데 중요한 역할을 한다', meaning_vi: 'đóng vai trò quan trọng trong việc ~', reuse_score: 5, function_group: 'POSITIVE' },
  { id: 'global-cause-because', expression_ko: '~기 때문이다', meaning_vi: 'bởi vì ~', reuse_score: 5, function_group: 'CAUSE' },
  { id: 'global-cause-influence', expression_ko: '~의 영향으로', meaning_vi: 'do ảnh hưởng của ~', reuse_score: 4, function_group: 'CAUSE' },
  { id: 'global-solution-need', expression_ko: '~할 필요가 있다', meaning_vi: 'cần phải ~', reuse_score: 5, function_group: 'SOLUTION' },
  { id: 'global-solution-strengthen', expression_ko: '~을 강화하다', meaning_vi: 'tăng cường ~', reuse_score: 4, function_group: 'SOLUTION' },
];

function demoBundle(question: Q54Question, requirements: Q54Requirement[], topic: Q54Topic): Q54QuestionBundle {
  if (question.id === environmentQuestion.id) return environmentBundle;
  return { topic, question, requirements, ideas: [], collocations: [], globalCollocations: globalDemoCollocations, patterns: environmentBundle.patterns, examples: [], exercises: [] };
}

function demoService(): Q54Service {
  return {
    async getEnvironment() { const questions = [environmentQuestion, ...read<Q54Question[]>(demoQuestionsKey, [])]; const requirements = [...environmentRequirements, ...read<Q54Requirement[]>(`${demoQuestionsKey}:requirements`, [])]; return { topic: environmentTopic, questions, requirements }; },
    async getQuestionBundle(questionId) {
      if (questionId === environmentQuestion.id) return environmentBundle;
      const question = read<Q54Question[]>(demoQuestionsKey, []).find((item) => item.id === questionId);
      if (!question) throw new Error('Không tìm thấy đề Q54.');
      const topic = [...read<Q54Topic[]>(demoTopicsKey, []), environmentTopic].find((item) => item.id === question.topic_id);
      if (!topic) throw new Error('Không tìm thấy topic của đề Q54.');
      return demoBundle(question, read<Q54Requirement[]>(`${demoQuestionsKey}:requirements`, []).filter((item) => item.question_id === questionId), topic);
    },
    async getExercise(exerciseId) { const exercise = environmentBundle.exercises.find((item) => item.id === exerciseId); if (!exercise) throw new Error('Không tìm thấy bài dịch.'); return exercise; },
    async savePrivateQuestion(input) {
      const id = `demo-q54-${crypto.randomUUID()}`;
      const savedTopics = read<Q54Topic[]>(demoTopicsKey, []);
      const existingTopic = input.topic.kind === 'EXISTING' && input.topic.slug === environmentTopic.slug ? environmentTopic : savedTopics.find((item) => item.slug === input.topic.slug);
      const savedTopic = existingTopic || { id: `demo-q54-topic-${crypto.randomUUID()}`, slug: input.topic.slug, name_ko: input.topic.nameKo, name_vi: input.topic.nameVi, description_vi: null, visibility: 'PRIVATE' as const, status: 'PUBLISHED' as const, source_type: 'AI_GENERATED' as const };
      if (!existingTopic) write(demoTopicsKey, [...savedTopics, savedTopic]);
      const question: Q54Question = { id, topic_id: savedTopic.id, subtopic_ko: input.topic.subtopicKo, prompt_ko: input.promptKo, visibility: 'PRIVATE', status: 'PUBLISHED', source_type: 'AI_GENERATED' };
      const questions = read<Q54Question[]>(demoQuestionsKey, []);
      const requirements = input.requirements.map((item, index): Q54Requirement => ({ id: `demo-q54-requirement-${crypto.randomUUID()}`, question_id: id, order_index: index, prompt_ko: item.promptKo, label_vi: item.labelVi, requirement_type: item.requirementType, function_group: item.functionGroup }));
      write(demoQuestionsKey, [...questions, question]);
      write(`${demoQuestionsKey}:requirements`, [...read<Q54Requirement[]>(`${demoQuestionsKey}:requirements`, []), ...requirements]);
      return question;
    },
    async getErrors() { return read<Q54UserError[]>(demoErrorsKey, []).sort((left, right) => right.last_seen_at.localeCompare(left.last_seen_at)); },
  };
}

function liveService(): Q54Service {
  return {
    async getEnvironment() {
      const { data: topic, error: topicError } = await supabase.from('q54_topics').select('*').eq('slug', 'environment').single();
      if (topicError) throw topicError;
      const { data: questions, error: questionError } = await supabase.from('q54_questions').select('*').eq('topic_id', topic.id).order('created_at');
      if (questionError) throw questionError;
      const ids = (questions || []).map((item: { id: string }) => item.id);
      const { data: requirements, error: requirementError } = ids.length ? await supabase.from('q54_question_requirements').select('*').in('question_id', ids).order('order_index') : { data: [], error: null };
      if (requirementError) throw requirementError;
      return { topic: topic as Q54Topic, questions: (questions || []) as Q54Question[], requirements: (requirements || []) as Q54Requirement[] };
    },
    async getQuestionBundle(questionId) {
      const { data: question, error: questionError } = await supabase.from('q54_questions').select('*').eq('id', questionId).single();
      if (questionError) throw questionError;
      if (!question.topic_id) throw new Error('Đề này chưa có topic.');
      const [{ data: topic, error: topicError }, { data: requirements, error: requirementError }, { data: patterns, error: patternError }, { data: examples, error: exampleError }, { data: links, error: linkError }, { data: allCollocations, error: collocationError }] = await Promise.all([
        supabase.from('q54_topics').select('*').eq('id', question.topic_id).single(),
        supabase.from('q54_question_requirements').select('*').eq('question_id', questionId).order('order_index'),
        supabase.from('q54_sentence_patterns').select('*').order('reuse_score', { ascending: false }),
        supabase.from('q54_pattern_examples').select('*').eq('topic_id', question.topic_id),
        supabase.from('q54_collocation_topics').select('collocation_id, topic_id'),
        supabase.from('q54_collocations').select('*').order('reuse_score', { ascending: false }),
      ]);
      const error = topicError || requirementError || patternError || exampleError || linkError || collocationError;
      if (error) throw error;
      const requirementIds = (requirements || []).map((item: { id: string }) => item.id);
      const scopedCollocationIds = new Set((links || []).map((item: { collocation_id: string }) => item.collocation_id));
      const exactCollocationIds = new Set((links || []).filter((item: { topic_id: string }) => item.topic_id === question.topic_id).map((item: { collocation_id: string }) => item.collocation_id));
      const [{ data: ideas, error: ideaError }, { data: exercises, error: exerciseError }] = await Promise.all([
        supabase.from('q54_ideas').select('*').eq('topic_id', question.topic_id),
        requirementIds.length ? supabase.from('q54_translation_exercises').select('*').in('requirement_id', requirementIds).order('created_at') : Promise.resolve({ data: [], error: null }),
      ]);
      if (ideaError || exerciseError) throw ideaError || exerciseError;
      const collocations = (allCollocations || []) as Q54Collocation[];
      return { topic: topic as Q54Topic, question: question as Q54Question, requirements: (requirements || []) as Q54Requirement[], ideas: (ideas || []) as Q54Idea[], collocations: collocations.filter((item) => exactCollocationIds.has(item.id)), globalCollocations: collocations.filter((item) => !scopedCollocationIds.has(item.id)), patterns: (patterns || []) as Q54Pattern[], examples: (examples || []) as Q54PatternExample[], exercises: (exercises || []) as Q54Exercise[] };
    },
    async getExercise(exerciseId) { const { data, error } = await supabase.from('q54_translation_exercises').select('*').eq('id', exerciseId).single(); if (error) throw error; return data as Q54Exercise; },
    async savePrivateQuestion(input) {
      const { data, error } = await supabase.rpc('save_q54_private_question_with_topic', { p_topic_slug: input.topic.slug, p_topic_name_ko: input.topic.nameKo, p_topic_name_vi: input.topic.nameVi, p_subtopic_ko: input.topic.subtopicKo, p_prompt_ko: input.promptKo, p_requirements: input.requirements, p_source_type: 'AI_GENERATED' });
      if (error) throw saveQuestionError(error);
      return data.question as Q54Question;
    },
    async getErrors() { const { data, error } = await supabase.from('q54_user_errors').select('*').order('last_seen_at', { ascending: false }); if (error) throw error; return (data || []) as Q54UserError[]; },
  };
}

export function getQ54Service(isDemo: boolean): Q54Service { return isDemo || !isSupabaseConfigured ? demoService() : liveService(); }

export function saveDemoError(error: Omit<Q54UserError, 'id' | 'occurrence_count' | 'first_seen_at' | 'last_seen_at' | 'mastered'>) {
  const now = new Date().toISOString();
  const errors = read<Q54UserError[]>(demoErrorsKey, []);
  const index = errors.findIndex((item) => item.error_key === error.error_key);
  if (index >= 0) errors[index] = { ...errors[index], occurrence_count: errors[index].occurrence_count + 1, last_seen_at: now, explanation_vi: error.explanation_vi };
  else errors.push({ ...error, id: crypto.randomUUID(), occurrence_count: 1, first_seen_at: now, last_seen_at: now, mastered: false });
  write(demoErrorsKey, errors);
}
