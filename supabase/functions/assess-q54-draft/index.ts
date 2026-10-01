import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

type ErrorItem = { type: string; original: string; corrected: string; explanationVi: string };
type RequirementFeedback = { requirementId: string; status: 'COVERED' | 'PARTIAL' | 'MISSING'; evidenceKo: string; suggestionVi: string };
type Assessment = {
  verdict: 'ACCEPTABLE' | 'NEEDS_REVISION';
  summaryVi: string;
  requirements: RequirementFeedback[];
  structure: Array<{ label: string; status: 'GOOD' | 'NEEDS_REVISION'; messageVi: string }>;
  logic: { status: 'COHERENT' | 'NEEDS_REVISION'; messageVi: string };
  collocations: Array<{ original: string; suggestion: string; explanationVi: string }>;
  repetition: Array<{ expression: string; count: number; alternatives: string[] }>;
  cohesion: { status: 'GOOD' | 'NEEDS_REVISION'; messageVi: string };
  formalStyle: { status: 'GOOD' | 'NEEDS_REVISION'; messageVi: string };
  errors: ErrorItem[];
  usedPatterns: string[];
  rewriteFocus: string[];
};

const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
const headers = { ...corsHeaders, 'Content-Type': 'application/json' };
const text = (value: unknown) => typeof value === 'string' ? value.trim() : '';
const list = (value: unknown, max = 8) => Array.isArray(value) ? value.map(text).filter(Boolean).slice(0, max) : [];
const oneOf = <T extends string>(value: unknown, allowed: readonly T[], fallback: T) => allowed.includes(value as T) ? value as T : fallback;

function occurrences(content: string, expression: string) { return content.split(expression).length - 1; }

function deterministicRepetition(content: string) {
  return ['수 있다', '도움이 되다', '문제가 있다', '중요하다'].flatMap((expression) => {
    const count = occurrences(content, expression);
    return count > 2 ? [{ expression, count, alternatives: expression === '수 있다' ? ['~게 되다', '~로 이어지다', '~할 가능성이 크다'] : expression === '도움이 되다' ? ['기여하다', '긍정적인 영향을 미치다', '향상시키다'] : ['다른 구체적 표현을 사용하다'] }] : [];
  });
}

function normalize(rawValue: unknown, requirements: Array<{ id: string }>, content: string): Assessment | null {
  if (!rawValue || typeof rawValue !== 'object') return null;
  const raw = rawValue as Record<string, unknown>;
  const feedback = new Map<string, RequirementFeedback>();
  if (Array.isArray(raw.requirements)) {
    for (const item of raw.requirements) {
      if (!item || typeof item !== 'object') continue;
      const value = item as Record<string, unknown>;
      const requirementId = text(value.requirementId);
      if (!requirements.some((requirement) => requirement.id === requirementId)) continue;
      const evidenceKo = text(value.evidenceKo);
      feedback.set(requirementId, { requirementId, status: oneOf(value.status, ['COVERED', 'PARTIAL', 'MISSING'] as const, 'MISSING'), evidenceKo: evidenceKo && content.includes(evidenceKo) ? evidenceKo : '', suggestionVi: text(value.suggestionVi) || 'Bổ sung một ý trực tiếp trả lời yêu cầu này.' });
    }
  }
  const requirementFeedback = requirements.map((requirement) => feedback.get(requirement.id) || { requirementId: requirement.id, status: 'MISSING' as const, evidenceKo: '', suggestionVi: 'Bổ sung một ý trực tiếp trả lời yêu cầu này.' });
  const errors = Array.isArray(raw.errors) ? raw.errors.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const value = item as Record<string, unknown>;
    const type = oneOf(value.type, ['PARTICLE', 'GRAMMAR', 'VOCABULARY', 'COLLOCATION', 'SPELLING', 'LOGIC', 'REPETITION', 'QUESTION_RELEVANCE'] as const, 'GRAMMAR');
    const original = text(value.original); const corrected = text(value.corrected); const explanationVi = text(value.explanationVi);
    return original && content.includes(original) && corrected && explanationVi ? [{ type, original, corrected, explanationVi }] : [];
  }).slice(0, 12) : [];
  const repetitionFromAi = Array.isArray(raw.repetition) ? raw.repetition.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const value = item as Record<string, unknown>; const expression = text(value.expression); const count = Number(value.count);
    return expression && content.includes(expression) && Number.isInteger(count) && count > 2 ? [{ expression, count, alternatives: list(value.alternatives, 4) }] : [];
  }) : [];
  const repetition = repetitionFromAi.length ? repetitionFromAi : deterministicRepetition(content);
  const structure = Array.isArray(raw.structure) ? raw.structure.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const value = item as Record<string, unknown>; const label = text(value.label); const messageVi = text(value.messageVi);
    return label && messageVi ? [{ label, status: oneOf(value.status, ['GOOD', 'NEEDS_REVISION'] as const, 'NEEDS_REVISION'), messageVi }] : [];
  }).slice(0, 5) : [];
  const logicValue = raw.logic && typeof raw.logic === 'object' ? raw.logic as Record<string, unknown> : {};
  const cohesionValue = raw.cohesion && typeof raw.cohesion === 'object' ? raw.cohesion as Record<string, unknown> : {};
  const styleValue = raw.formalStyle && typeof raw.formalStyle === 'object' ? raw.formalStyle as Record<string, unknown> : {};
  const collocations = Array.isArray(raw.collocations) ? raw.collocations.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const value = item as Record<string, unknown>; const original = text(value.original); const suggestion = text(value.suggestion); const explanationVi = text(value.explanationVi);
    return original && content.includes(original) && suggestion && explanationVi ? [{ original, suggestion, explanationVi }] : [];
  }).slice(0, 6) : [];
  const summaryVi = text(raw.summaryVi);
  if (!summaryVi) return null;
  return {
    verdict: oneOf(raw.verdict, ['ACCEPTABLE', 'NEEDS_REVISION'] as const, 'NEEDS_REVISION'),
    summaryVi,
    requirements: requirementFeedback,
    structure,
    logic: { status: oneOf(logicValue.status, ['COHERENT', 'NEEDS_REVISION'] as const, 'NEEDS_REVISION'), messageVi: text(logicValue.messageVi) || 'Kiểm tra lại thứ tự nguyên nhân, hành động và kết quả.' },
    collocations,
    repetition,
    cohesion: { status: oneOf(cohesionValue.status, ['GOOD', 'NEEDS_REVISION'] as const, 'NEEDS_REVISION'), messageVi: text(cohesionValue.messageVi) || 'Dùng từ nối để liên kết ý rõ hơn.' },
    formalStyle: { status: oneOf(styleValue.status, ['GOOD', 'NEEDS_REVISION'] as const, 'NEEDS_REVISION'), messageVi: text(styleValue.messageVi) || 'Duy trì văn phong viết trang trọng, rõ ràng.' },
    errors,
    usedPatterns: list(raw.usedPatterns),
    rewriteFocus: list(raw.rewriteFocus, 5),
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return new Response(JSON.stringify({ code: 'METHOD_NOT_ALLOWED' }), { status: 405, headers });
  const url = Deno.env.get('SUPABASE_URL') || '';
  const anon = Deno.env.get('SUPABASE_ANON_KEY') || '';
  const serviceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  const apiKey = Deno.env.get('GROQ_API_KEY') || '';
  const auth = req.headers.get('Authorization') || '';
  if (!url || !anon || !serviceRole || !apiKey || !auth) return new Response(JSON.stringify({ code: 'DRAFT_ASSESSOR_NOT_CONFIGURED' }), { status: 503, headers });
  const userClient = createClient(url, anon, { global: { headers: { Authorization: auth } } });
  const adminClient = createClient(url, serviceRole);
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) return new Response(JSON.stringify({ code: 'UNAUTHORIZED' }), { status: 401, headers });
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return new Response(JSON.stringify({ code: 'INVALID_JSON' }), { status: 400, headers }); }
  const submissionId = text(body.submissionId); const sessionId = text(body.sessionId) || null; const questionId = text(body.questionId); const requirementId = text(body.requirementId) || null; const ideaId = text(body.ideaId) || null; const parentDraftId = text(body.parentDraftId) || null;
  const unitType = oneOf(body.unitType, ['THREE_SENTENCE', 'PARAGRAPH', 'ESSAY'] as const, 'ESSAY');
  const assistanceStage = oneOf(body.assistanceStage, ['CLOSED', 'IDEA', 'PATTERN'] as const, 'CLOSED');
  const contentKo = text(body.contentKo);
  if (!/^[0-9a-f-]{36}$/i.test(submissionId) || !/^[0-9a-f-]{36}$/i.test(questionId) || !contentKo) return new Response(JSON.stringify({ code: 'INVALID_REQUEST' }), { status: 400, headers });
  const { data: claim, error: claimError } = await userClient.rpc('claim_q54_draft_submission', { p_submission_id: submissionId, p_session_id: sessionId, p_question_id: questionId, p_requirement_id: requirementId, p_idea_id: ideaId, p_unit_type: unitType, p_content_ko: contentKo, p_parent_draft_id: parentDraftId, p_assistance_stage: assistanceStage });
  if (claimError) {
    const code = claimError.message.includes('Q54_RATE_LIMIT') || claimError.message.includes('EXAM_TIME_EXPIRED') ? claimError.message : 'DRAFT_CLAIM_FAILED';
    return new Response(JSON.stringify({ code }), { status: code === 'EXAM_TIME_EXPIRED' ? 409 : code.includes('Q54_RATE_LIMIT') ? 429 : 400, headers });
  }
  const draft = claim?.draft as { id: string; state: string; assessment_json: Assessment | null } | undefined;
  if (!draft) return new Response(JSON.stringify({ code: 'DRAFT_CLAIM_FAILED' }), { status: 400, headers });
  if (!claim.claimed) return new Response(JSON.stringify({ draftId: draft.id, state: draft.state, assessment: draft.assessment_json }), { headers });
  const [{ data: question }, { data: requirements }, { data: idea }] = await Promise.all([
    userClient.from('q54_questions').select('prompt_ko, subtopic_ko, topic:q54_topics(name_ko, name_vi)').eq('id', questionId).single(),
    userClient.from('q54_question_requirements').select('id, prompt_ko, label_vi, requirement_type, function_group').eq('question_id', questionId).order('order_index'),
    ideaId ? userClient.from('q54_ideas').select('keyword_ko, keyword_vi, reason_ko, result_ko, logic_chain_ko').eq('id', ideaId).single() : Promise.resolve({ data: null }),
  ]);
  const selectedRequirement = requirementId ? (requirements || []).find((item: { id: string }) => item.id === requirementId) : null;
  const scopedRequirements = unitType === 'ESSAY' ? requirements || [] : selectedRequirement ? [selectedRequirement] : [];
  const model = Deno.env.get('GROQ_Q54_MODEL') || Deno.env.get('GROQ_KOREAN_MODEL') || 'qwen/qwen3.8-27b';
  const prompt = `Return JSON only. You are a formative TOPIK II Writing Q54 coach for Vietnamese learners. Never write a full replacement essay. Analyze ONLY the submitted Korean draft below. Do not use previous drafts, conversation history, Error Notebook, examples, or reference answers as current-draft errors. CRITICAL GROUNDING: never report any error unless its original span occurs verbatim in the submitted draft. Every grammar or collocation issue must include original copied exactly from that draft. If a span cannot be quoted verbatim, omit the issue. Unit: ${unitType}. ${unitType === 'ESSAY' ? 'Assess every requirement in scope.' : 'Assess only the selected requirement in scope; do not mark any other requirement missing.'} Coverage means only whether the submitted draft semantically answers that requirement. Do not add criteria such as urgency, seriousness, examples, or social importance unless the requirement explicitly asks for them. For a paragraph, check 3-5 sentence development. Required JSON: {"verdict":"ACCEPTABLE|NEEDS_REVISION","summaryVi":"...","requirements":[{"requirementId":"uuid","status":"COVERED|PARTIAL|MISSING","evidenceKo":"verbatim short quote or empty","suggestionVi":"..."}],"structure":[{"label":"...","status":"GOOD|NEEDS_REVISION","messageVi":"..."}],"logic":{"status":"COHERENT|NEEDS_REVISION","messageVi":"..."},"collocations":[{"original":"verbatim draft span","suggestion":"...","explanationVi":"..."}],"repetition":[{"expression":"verbatim draft span","count":3,"alternatives":["..."]}],"cohesion":{"status":"GOOD|NEEDS_REVISION","messageVi":"..."},"formalStyle":{"status":"GOOD|NEEDS_REVISION","messageVi":"..."},"errors":[{"type":"PARTICLE|GRAMMAR|VOCABULARY|COLLOCATION|SPELLING|LOGIC|REPETITION|QUESTION_RELEVANCE","original":"verbatim draft span","corrected":"...","explanationVi":"..."}],"usedPatterns":["..."],"rewriteFocus":["..."]}. Do not give a numerical TOPIK score. Topic/question: ${JSON.stringify(question)}. Requirements in scope: ${JSON.stringify(scopedRequirements)}. Selected requirement: ${JSON.stringify(selectedRequirement)}. Selected idea: ${JSON.stringify(idea || null)}. Submitted learner draft: ${JSON.stringify(contentKo)}.`;
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` }, body: JSON.stringify({ model, max_completion_tokens: 2600, response_format: { type: 'json_object' }, messages: [{ role: 'system', content: 'Return valid JSON only. Be specific, concise, and pedagogical.' }, { role: 'user', content: prompt }] }) });
    if (!response.ok) throw new Error('AI_UPSTREAM_FAILED');
    const payload = await response.json();
    const assessment = normalize(JSON.parse(payload?.choices?.[0]?.message?.content || ''), scopedRequirements, contentKo);
    if (!assessment) throw new Error('INVALID_AI_RESPONSE');
    const { data: completed, error: completeError } = await adminClient.rpc('complete_q54_draft_assessment', { p_draft_id: draft.id, p_assessment: assessment, p_provider: 'groq', p_model: model, p_prompt_version: 'q54-training-lab-assessment/v1', p_schema_version: 'q54-draft-assessment/v1' });
    if (completeError) {
      console.error('Q54 draft assessment could not be stored', { draftId: draft.id, message: completeError.message, code: completeError.code });
      throw new Error('DRAFT_SAVE_FAILED');
    }
    return new Response(JSON.stringify({ draftId: draft.id, state: completed.state, assessment }), { headers });
  } catch (error) {
    const code = error instanceof Error ? error.message : 'DRAFT_ASSESSMENT_FAILED';
    console.error('Q54 draft assessment failed', { draftId: draft.id, code });
    await adminClient.rpc('fail_q54_draft_assessment', { p_draft_id: draft.id, p_failure_code: code });
    return new Response(JSON.stringify({ code, draftId: draft.id }), { status: 502, headers });
  }
});
