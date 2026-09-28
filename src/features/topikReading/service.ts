import { isSupabaseConfigured, supabase } from '../../lib/supabase';
import { demoGrammar, demoQuestions, demoRelations } from './data/demoFixture';
import type {
  TopikAttempt,
  TopikGrammar,
  TopikQuestion,
  TopikQuestionKind,
  TopikReadingService,
  TopikRelationGroup,
} from './types';

const DEMO_ATTEMPTS_KEY = 'hugmo_topik_reading_v1_attempts';

function readDemoAttempts(): TopikAttempt[] {
  try {
    return JSON.parse(localStorage.getItem(DEMO_ATTEMPTS_KEY) || '[]') as TopikAttempt[];
  } catch {
    localStorage.removeItem(DEMO_ATTEMPTS_KEY);
    return [];
  }
}

function writeDemoAttempts(attempts: TopikAttempt[]) {
  localStorage.setItem(DEMO_ATTEMPTS_KEY, JSON.stringify(attempts));
}

function buildGrammar(rows: any[], senses: any[], examples: any[]): TopikGrammar[] {
  return rows.map((grammar) => ({
    ...grammar,
    senses: senses.filter((sense) => sense.grammar_id === grammar.id).map((sense) => ({
      ...sense,
      examples: examples.filter((example) => example.sense_id === sense.id),
    })),
  }));
}

function buildQuestions(rows: any[], options: any[]): TopikQuestion[] {
  return rows.map((question) => ({
    ...question,
    options: options
      .filter((option) => option.question_id === question.id)
      .sort((left, right) => left.position - right.position),
  }));
}

function createDemoService(): TopikReadingService {
  return {
    async getGrammar() { return demoGrammar; },
    async getRelations() { return demoRelations; },
    async getQuestions(kind?: TopikQuestionKind) {
      return kind ? demoQuestions.filter((question) => question.kind === kind) : demoQuestions;
    },
    async getAttempts(userId: string) {
      return readDemoAttempts().filter((attempt) => attempt.user_id === userId);
    },
    async recordAttempt(input) {
      const attempts = readDemoAttempts();
      const existing = attempts.find((attempt) => attempt.id === input.attemptId && attempt.user_id === input.userId);
      if (existing) return existing;
      const question = demoQuestions.find((item) => item.id === input.questionId);
      const selected = question?.options.find((option) => option.id === input.selectedOptionId);
      if (!question || (input.selectedOptionId && !selected)) {
        throw new Error('Selected option does not belong to this question.');
      }
      const attempt: TopikAttempt = {
        id: input.attemptId,
        user_id: input.userId,
        question_id: input.questionId,
        selected_option_id: input.selectedOptionId,
        is_correct: selected?.is_correct ?? false,
        mode: input.mode,
        answered_at: new Date().toISOString(),
        duration_ms: input.durationMs,
      };
      writeDemoAttempts([...attempts, attempt]);
      return attempt;
    },
  };
}

function createSupabaseService(): TopikReadingService {
  return {
    async getGrammar() {
      const [grammarResult, sensesResult, examplesResult] = await Promise.all([
        supabase.from('topik_grammar').select('*').order('pattern_ko'),
        supabase.from('topik_grammar_senses').select('*').order('category'),
        supabase.from('topik_examples').select('*').order('sentence_ko'),
      ]);
      const error = grammarResult.error || sensesResult.error || examplesResult.error;
      if (error) throw error;
      return buildGrammar(grammarResult.data || [], sensesResult.data || [], examplesResult.data || []);
    },
    async getRelations() {
      const [groupsResult, membersResult, sensesResult, grammarResult, examplesResult] = await Promise.all([
        supabase.from('topik_grammar_relation_groups').select('*').order('source_page_printed'),
        supabase.from('topik_grammar_relation_group_members').select('*').order('member_order'),
        supabase.from('topik_grammar_senses').select('*'),
        supabase.from('topik_grammar').select('*'),
        supabase.from('topik_examples').select('*'),
      ]);
      const error = groupsResult.error || membersResult.error || sensesResult.error || grammarResult.error || examplesResult.error;
      if (error) throw error;
      const senses = sensesResult.data || [];
      const grammar = grammarResult.data || [];
      const examples = examplesResult.data || [];
      const toMember = (member: any) => {
        const senseId = member.sense_id;
        const sense = senses.find((item: any) => item.id === senseId);
        const grammarItem = grammar.find((item: any) => item.id === sense?.grammar_id);
        return {
          sense_id: senseId,
          member_order: member.member_order,
          member_role: member.member_role,
          pattern_ko: grammarItem?.pattern_ko || 'N/A',
          meaning_vi: sense?.meaning_vi || '',
          usage_note_vi: sense?.usage_note_vi || null,
          constraints_vi: sense?.constraints_vi || null,
          examples: examples.filter((item: any) => item.sense_id === senseId),
        };
      };
      return (groupsResult.data || []).map((group: any): TopikRelationGroup => ({
        id: group.id,
        group_key: group.group_key,
        title_vi: group.title_vi,
        category: group.category,
        context_note_vi: group.context_note_vi,
        members: (membersResult.data || [])
          .filter((member: any) => member.group_id === group.id)
          .sort((left: any, right: any) => left.member_order - right.member_order)
          .map(toMember),
      }));
    },
    async getQuestions(kind?: TopikQuestionKind) {
      let questionQuery = supabase.from('topik_questions').select('*').order('source_key');
      if (kind) questionQuery = questionQuery.eq('kind', kind);
      const { data: questions, error: questionError } = await questionQuery;
      if (questionError) throw questionError;
      const ids = (questions || []).map((question: any) => question.id);
      if (ids.length === 0) return [];
      const { data: options, error: optionError } = await supabase
        .from('topik_question_options')
        .select('*')
        .in('question_id', ids)
        .order('position');
      if (optionError) throw optionError;
      return buildQuestions(questions || [], options || []);
    },
    async getAttempts(userId: string) {
      const { data, error } = await supabase
        .from('topik_question_attempts')
        .select('*')
        .eq('user_id', userId)
        .order('answered_at', { ascending: false });
      if (error) throw error;
      return (data || []) as TopikAttempt[];
    },
    async recordAttempt(input) {
      const { data, error } = await supabase.rpc('topik_record_attempt', {
        p_attempt_id: input.attemptId,
        p_question_id: input.questionId,
        p_selected_option_id: input.selectedOptionId,
        p_mode: input.mode,
        p_duration_ms: input.durationMs,
      });
      if (error) throw error;
      return data as TopikAttempt;
    },
  };
}

export function getTopikReadingService(isDemo: boolean): TopikReadingService {
  return isDemo || !isSupabaseConfigured ? createDemoService() : createSupabaseService();
}
