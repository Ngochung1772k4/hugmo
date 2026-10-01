import { isSupabaseConfigured, supabase } from '../../lib/supabase';
import type { Q54BankStage, Q54CollocationReviewProgress, Q54DraftAssessment, Q54DraftUnitType, Q54ErrorDrillItem, Q54ErrorDrillSet, Q54SkillType, Q54TrainingMode, Q54TrainingSession, Q54UserError, Q54WritingDraft } from './types';

const demoKey = 'hugmo_q54_training_lab';
type DemoStore = { sessions: Q54TrainingSession[]; drafts: Q54WritingDraft[]; drills: Q54ErrorDrillSet[]; };
const emptyStore = (): DemoStore => ({ sessions: [], drafts: [], drills: [] });
function readDemo(): DemoStore { try { return { ...emptyStore(), ...JSON.parse(localStorage.getItem(demoKey) || '') } as DemoStore; } catch { return emptyStore(); } }
function writeDemo(value: DemoStore) { localStorage.setItem(demoKey, JSON.stringify(value)); }
function message(error: unknown, fallback: string) { return error instanceof Error ? error.message : fallback; }
async function edgeMessage(error: unknown, fallback: string) {
  const context = (error as { context?: unknown } | null)?.context;
  if (context instanceof Response) {
    try {
      const payload = await context.clone().json() as { code?: string };
      const messages: Record<string, string> = {
        DRAFT_CONTEXT_MISSING: 'The saved draft context is incomplete. Please submit this draft again with a new submission.',
        Q54_RATE_LIMIT_SHORT: 'Bạn đã dùng hết 5 yêu cầu AI trong 5 phút. Hãy thử lại sau ít phút.',
        Q54_RATE_LIMIT_DAILY: 'Bạn đã dùng hết 30 yêu cầu AI hôm nay. Hãy thử lại vào ngày mai.',
        EXAM_TIME_EXPIRED: 'Đã hết giờ Exam Mode nên bài không thể nộp.',
        AI_UPSTREAM_FAILED: 'Groq hiện không phản hồi. Bài viết vẫn được lưu, hãy thử nộp lại với submission mới.',
        INVALID_AI_RESPONSE: 'AI trả về dữ liệu chưa hợp lệ. Bài viết vẫn được lưu, hãy thử lại.',
        DRAFT_SAVE_FAILED: 'AI đã phản hồi nhưng database không thể lưu feedback. Hãy thử lại.',
        DRAFT_CLAIM_FAILED: 'Không thể tạo lượt chấm cho bản viết này.',
        DRAFT_ASSESSOR_NOT_CONFIGURED: 'Dịch vụ chấm AI chưa được cấu hình trên server.',
      };
      if (payload.code) return messages[payload.code] || `Không thể chấm bài (${payload.code}).`;
    } catch { /* Use the normal error message when the response body is unavailable. */ }
  }
  return message(error, fallback);
}

const demoAssessment: Q54DraftAssessment = {
  summaryVi: 'Demo Mode stores the draft and shows a sample rubric. Online assessment validates feedback against the submitted content.',
  summary: { overall: 'Demo Mode stores the draft and shows a sample rubric. Online assessment validates feedback against the submitted content.', strengths: [], nextFocus: ['Check the main idea, reason, and result before submitting again.'] },
  coverage: [], sentenceFunctions: [], logic: null, cohesion: null, formalStyle: null, issues: [], improvements: [], repetition: [],
  nextDraft: { priority1: 'Add a direct explanation for the requirement being practised.', priority2: null, priority3: null },
};

function asSession(value: unknown): Q54TrainingSession { return value as Q54TrainingSession; }
function asDraft(value: unknown): Q54WritingDraft { const raw = value as Q54WritingDraft; return { ...raw, assessment_json: raw.assessment_json || null }; }

export interface Q54TrainingService {
  startSession(questionId: string, mode: Q54TrainingMode): Promise<Q54TrainingSession>;
  getSession(sessionId: string): Promise<Q54TrainingSession>;
  advanceBankStage(sessionId: string, stage: Q54BankStage): Promise<Q54TrainingSession>;
  recordIdeaSprint(input: { sessionId: string; requirementId: string; ideas: string[]; durationMs: number; skipped: boolean }): Promise<void>;
  recordLogicChain(input: { sessionId: string; ideaId: string; orderedNodes: string[]; durationMs: number }): Promise<{ correct: boolean; expected: string[] }>;
  recordSkill(input: { sessionId: string; requirementId?: string | null; ideaId?: string | null; skillType: Extract<Q54SkillType, 'SENTENCE_BUILDER' | 'ERROR_DRILL'>; input: unknown; result: Record<string, unknown>; durationMs?: number }): Promise<void>;
  assessDraft(input: { submissionId: string; sessionId?: string | null; questionId: string; requirementId?: string | null; ideaId?: string | null; unitType: Q54DraftUnitType; contentKo: string; parentDraftId?: string | null; assistanceStage: Q54BankStage }): Promise<{ draftId: string; state: string; assessment: Q54DraftAssessment | null }>;
  getDraft(draftId: string): Promise<Q54WritingDraft>;
  getDrafts(questionId: string): Promise<Q54WritingDraft[]>;
  recordRewrite(errorId: string, answerKo: string): Promise<{ correct: boolean; mastered: boolean; successDays: number }>;
  generateDrill(submissionId: string, errorIds?: string[]): Promise<{ drillId: string; state: string; items: Q54ErrorDrillItem[] | null }>;
  getDrills(): Promise<Q54ErrorDrillSet[]>;
  submitDrill(drillId: string, selectedIndexes: number[]): Promise<{ score: number; total: number }>;
  recallCollocation(collocationId: string, answerKo: string): Promise<{ correct: boolean; expected: string }>;
  getCollocationReviews(): Promise<Q54CollocationReviewProgress[]>;
  getWeakness(): Promise<{ essayCount: number; eligible: boolean; errors: Q54UserError[]; drafts: Q54WritingDraft[] }>;
}

function demoService(): Q54TrainingService {
  return {
    async startSession(questionId, mode) {
      const store = readDemo(); const session: Q54TrainingSession = { id: crypto.randomUUID(), question_id: questionId, mode, status: 'ACTIVE', bank_stage: 'CLOSED', question_snapshot: {}, requirements_snapshot: [], started_at: new Date().toISOString(), ends_at: mode === 'EXAM' ? new Date(Date.now() + 30 * 60_000).toISOString() : null };
      writeDemo({ ...store, sessions: [...store.sessions, session] }); return session;
    },
    async getSession(sessionId) { const session = readDemo().sessions.find((item) => item.id === sessionId); if (!session) throw new Error('Không tìm thấy phiên luyện.'); return session; },
    async advanceBankStage(sessionId, stage) { const store = readDemo(); const session = store.sessions.find((item) => item.id === sessionId); if (!session) throw new Error('Không tìm thấy phiên luyện.'); if (session.mode === 'EXAM') throw new Error('Exam Mode không mở Bank.'); session.bank_stage = stage; writeDemo(store); return session; },
    async recordIdeaSprint() {},
    async recordLogicChain(input) { return { correct: input.orderedNodes.length >= 3, expected: input.orderedNodes }; },
    async recordSkill() {},
    async assessDraft(input) { const store = readDemo(); const draft: Q54WritingDraft = { id: crypto.randomUUID(), session_id: input.sessionId || null, question_id: input.questionId, requirement_id: input.requirementId || null, idea_id: input.ideaId || null, unit_type: input.unitType, draft_number: input.parentDraftId ? 2 : 1, parent_draft_id: input.parentDraftId || null, content_ko: input.contentKo, assistance_stage: input.assistanceStage, state: 'ASSESSED', assessment_json: demoAssessment, created_at: new Date().toISOString() }; writeDemo({ ...store, drafts: [...store.drafts, draft] }); return { draftId: draft.id, state: draft.state, assessment: draft.assessment_json }; },
    async getDraft(draftId) { const draft = readDemo().drafts.find((item) => item.id === draftId); if (!draft) throw new Error('Không tìm thấy bản nháp.'); return draft; },
    async getDrafts(questionId) { return readDemo().drafts.filter((item) => item.question_id === questionId).sort((a, b) => b.created_at.localeCompare(a.created_at)); },
    async recordRewrite() { return { correct: false, mastered: false, successDays: 0 }; },
    async generateDrill() { const store = readDemo(); const items: Q54ErrorDrillItem[] = Array.from({ length: 5 }, (_, index) => ({ promptKo: `문장을 알맞게 고르십시오. (${index + 1})`, promptVi: 'Chọn cách diễn đạt tự nhiên hơn.', options: ['문제를 만들다', '문제를 유발하다', '문제를 쓰다', '문제를 읽다'], correctIndex: 1, explanationVi: '유발하다 tự nhiên hơn trong ngữ cảnh này.', errorKey: 'demo' })); const drill: Q54ErrorDrillSet = { id: crypto.randomUUID(), state: 'READY', items_json: items, created_at: new Date().toISOString() }; writeDemo({ ...store, drills: [drill, ...store.drills] }); return { drillId: drill.id, state: drill.state, items }; },
    async getDrills() { return readDemo().drills; },
    async submitDrill(_drillId, selectedIndexes) { return { score: selectedIndexes.filter((value) => value === 1).length, total: 5 }; },
    async recallCollocation(_id, answerKo) { return { correct: Boolean(answerKo.trim()), expected: '' }; },
    async getCollocationReviews() { return []; },
    async getWeakness() { const drafts = readDemo().drafts; return { essayCount: drafts.filter((draft) => draft.unit_type === 'ESSAY').length, eligible: drafts.filter((draft) => draft.unit_type === 'ESSAY').length >= 20, errors: [], drafts }; },
  };
}

function liveService(): Q54TrainingService {
  return {
    async startSession(questionId, mode) { const { data, error } = await supabase.rpc('start_q54_training_session', { p_question_id: questionId, p_mode: mode }); if (error) throw error; return asSession(data); },
    async getSession(sessionId) { const { data, error } = await supabase.from('q54_training_sessions').select('*').eq('id', sessionId).single(); if (error) throw error; return asSession(data); },
    async advanceBankStage(sessionId, stage) { const { data, error } = await supabase.rpc('advance_q54_training_bank_stage', { p_session_id: sessionId, p_bank_stage: stage }); if (error) throw error; return asSession(data); },
    async recordIdeaSprint(input) { const { error } = await supabase.rpc('record_q54_idea_sprint', { p_session_id: input.sessionId, p_requirement_id: input.requirementId, p_ideas: input.ideas, p_duration_ms: input.durationMs, p_skipped: input.skipped }); if (error) throw error; },
    async recordLogicChain(input) { const { data, error } = await supabase.rpc('record_q54_logic_chain_attempt', { p_session_id: input.sessionId, p_idea_id: input.ideaId, p_ordered_nodes: input.orderedNodes, p_duration_ms: input.durationMs }); if (error) throw error; return { correct: Boolean(data.correct), expected: data.expected || [] }; },
    async recordSkill(input) { const { error } = await supabase.rpc('record_q54_skill_attempt', { p_session_id: input.sessionId, p_requirement_id: input.requirementId || null, p_idea_id: input.ideaId || null, p_skill_type: input.skillType, p_input: input.input, p_result: input.result, p_duration_ms: input.durationMs || null }); if (error) throw error; },
    async assessDraft(input) { const { data, error } = await supabase.functions.invoke('assess-q54-draft', { body: input }); if (error) throw new Error(await edgeMessage(error, 'Không thể chấm bản viết.')); const result = data as { code?: string; draftId?: string; state?: string; assessment?: Q54DraftAssessment | null }; if (result.code || !result.draftId || !result.state) throw new Error(result.code || 'Không thể chấm bản viết.'); return { draftId: result.draftId, state: result.state, assessment: result.assessment || null }; },
    async getDraft(draftId) { const { data, error } = await supabase.from('q54_writing_drafts').select('*').eq('id', draftId).single(); if (error) throw error; return asDraft(data); },
    async getDrafts(questionId) { const { data, error } = await supabase.from('q54_writing_drafts').select('*').eq('question_id', questionId).order('created_at', { ascending: false }); if (error) throw error; return (data || []).map(asDraft); },
    async recordRewrite(errorId, answerKo) { const { data, error } = await supabase.rpc('record_q54_rewrite_attempt', { p_error_id: errorId, p_answer_ko: answerKo }); if (error) throw error; return { correct: Boolean(data.correct), mastered: Boolean(data.mastered), successDays: Number(data.successDays || 0) }; },
    async generateDrill(submissionId, errorIds) { const { data, error } = await supabase.functions.invoke('generate-q54-error-drill', { body: { submissionId, errorIds } }); if (error) throw new Error(error.message); const result = data as { code?: string; drillId?: string; state?: string; items?: Q54ErrorDrillItem[] | null }; if (result.code || !result.drillId || !result.state) throw new Error(result.code || 'Không thể tạo Error Drill.'); return { drillId: result.drillId, state: result.state, items: result.items || null }; },
    async getDrills() { const { data, error } = await supabase.from('q54_error_drill_sets').select('*').order('created_at', { ascending: false }); if (error) throw error; return (data || []) as Q54ErrorDrillSet[]; },
    async submitDrill(drillId, selectedIndexes) { const answers = selectedIndexes.map((selectedIndex) => ({ selectedIndex })); const { data, error } = await supabase.rpc('record_q54_error_drill_attempt', { p_drill_id: drillId, p_answers: answers }); if (error) throw error; return { score: Number(data.score), total: Number(data.total) }; },
    async recallCollocation(collocationId, answerKo) { const { data, error } = await supabase.rpc('record_q54_collocation_recall', { p_collocation_id: collocationId, p_answer_ko: answerKo }); if (error) throw error; return { correct: Boolean(data.correct), expected: String(data.expected || '') }; },
    async getCollocationReviews() { const { data, error } = await supabase.from('q54_collocation_review_progress').select('collocation_id, state, correct_streak, due_at, collocation:q54_collocations(id, expression_ko, meaning_vi, reuse_score, function_group)').lte('due_at', new Date().toISOString()).order('due_at').limit(10); if (error) throw error; return (data || []).map((item) => ({ ...item, collocation: Array.isArray(item.collocation) ? item.collocation[0] : item.collocation })) as Q54CollocationReviewProgress[]; },
    async getWeakness() { const [{ data: drafts, error: draftError }, { data: errors, error: errorError }] = await Promise.all([supabase.from('q54_writing_drafts').select('*').order('created_at', { ascending: false }), supabase.from('q54_user_errors').select('*').order('occurrence_count', { ascending: false }).order('last_seen_at', { ascending: false })]); if (draftError || errorError) throw draftError || errorError; const typedDrafts = (drafts || []).map(asDraft); const essayCount = typedDrafts.filter((draft) => draft.unit_type === 'ESSAY' && draft.state === 'ASSESSED').length; return { essayCount, eligible: essayCount >= 20, errors: (errors || []) as Q54UserError[], drafts: typedDrafts }; },
  };
}

export function getQ54TrainingService(isDemo: boolean): Q54TrainingService { return isDemo || !isSupabaseConfigured ? demoService() : liveService(); }
export { message as q54TrainingErrorMessage };
