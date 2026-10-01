import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { normalizeQ54Assessment } from '../_shared/q54-assessment-validation.mjs';
import { Q54_ASSESSMENT_PROMPT_VERSION, Q54_ASSESSMENT_SCHEMA_VERSION, q54AssessmentSystemPrompt } from './system-prompt.mjs';

const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
const headers = { ...corsHeaders, 'Content-Type': 'application/json' };
const text = (value: unknown) => typeof value === 'string' ? value.trim() : '';
const oneOf = <T extends string>(value: unknown, allowed: readonly T[], fallback: T) => allowed.includes(value as T) ? value as T : fallback;
const isRecord = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

type UnitType = 'THREE_SENTENCE' | 'PARAGRAPH' | 'ESSAY';
type RequirementSnapshot = { id: string; promptKo?: string; labelVi?: string; requirementType?: string; functionGroup?: string };
type AssessmentContext = { questionSnapshot: Record<string, unknown>; selectedRequirement: RequirementSnapshot | null; requirementsAllowedForAssessment: RequirementSnapshot[] };
type ClaimedDraft = { id: string; state: string; content_ko: string; assessment_context_json: AssessmentContext | null; assessment_json: Record<string, unknown> | null };

function parseAssessmentContext(value: unknown, unitType: UnitType, requirementId: string | null): AssessmentContext | null {
  if (!isRecord(value) || !isRecord(value.questionSnapshot) || !Array.isArray(value.requirementsAllowedForAssessment)) return null;
  const requirements = value.requirementsAllowedForAssessment.flatMap((item) => {
    if (!isRecord(item) || !text(item.id)) return [];
    return [{ id: text(item.id), promptKo: text(item.promptKo), labelVi: text(item.labelVi), requirementType: text(item.requirementType), functionGroup: text(item.functionGroup) }];
  });
  if (requirements.length === 0 || requirements.length !== value.requirementsAllowedForAssessment.length) return null;
  const selectedRaw = isRecord(value.selectedRequirement) ? value.selectedRequirement : null;
  const selectedRequirement = selectedRaw && text(selectedRaw.id) ? { id: text(selectedRaw.id), promptKo: text(selectedRaw.promptKo), labelVi: text(selectedRaw.labelVi), requirementType: text(selectedRaw.requirementType), functionGroup: text(selectedRaw.functionGroup) } : null;
  if (unitType === 'ESSAY') {
    if (requirementId !== null || selectedRequirement !== null) return null;
  } else if (!requirementId || requirements.length !== 1 || requirements[0].id !== requirementId || selectedRequirement?.id !== requirementId) return null;
  return { questionSnapshot: value.questionSnapshot, selectedRequirement, requirementsAllowedForAssessment: requirements };
}

async function requestGroqAssessment(apiKey: string, model: string, payload: Record<string, unknown>, retry: boolean) {
  const repair = retry ? 'Your previous response did not satisfy the JSON schema or grounding rules. Return a corrected JSON object only. Every evidence span and issue original must be an exact substring of submittedContent.' : null;
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      max_completion_tokens: 2600,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: q54AssessmentSystemPrompt },
        { role: 'user', content: JSON.stringify(payload) },
        ...(repair ? [{ role: 'user', content: repair }] : []),
      ],
    }),
  });
  if (!response.ok) throw new Error('AI_UPSTREAM_FAILED');
  const result = await response.json();
  const content = result?.choices?.[0]?.message?.content;
  if (typeof content !== 'string') return null;
  try { return JSON.parse(content); } catch { return null; }
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
  const submissionId = text(body.submissionId);
  const sessionId = text(body.sessionId) || null;
  const questionId = text(body.questionId);
  const requirementId = text(body.requirementId) || null;
  const ideaId = text(body.ideaId) || null;
  const parentDraftId = text(body.parentDraftId) || null;
  const unitType = oneOf(body.unitType, ['THREE_SENTENCE', 'PARAGRAPH', 'ESSAY'] as const, 'ESSAY');
  const assistanceStage = oneOf(body.assistanceStage, ['CLOSED', 'IDEA', 'PATTERN'] as const, 'CLOSED');
  const submittedFromRequest = text(body.contentKo);
  if (!/^[0-9a-f-]{36}$/i.test(submissionId) || !/^[0-9a-f-]{36}$/i.test(questionId) || !submittedFromRequest) return new Response(JSON.stringify({ code: 'INVALID_REQUEST' }), { status: 400, headers });

  const startedAt = Date.now();
  const { data: claim, error: claimError } = await userClient.rpc('claim_q54_draft_submission', {
    p_submission_id: submissionId, p_session_id: sessionId, p_question_id: questionId, p_requirement_id: requirementId,
    p_idea_id: ideaId, p_unit_type: unitType, p_content_ko: submittedFromRequest, p_parent_draft_id: parentDraftId, p_assistance_stage: assistanceStage,
  });
  if (claimError) {
    const code = claimError.message.includes('Q54_RATE_LIMIT') || claimError.message.includes('EXAM_TIME_EXPIRED') ? claimError.message : 'DRAFT_CLAIM_FAILED';
    return new Response(JSON.stringify({ code }), { status: code === 'EXAM_TIME_EXPIRED' ? 409 : code.includes('Q54_RATE_LIMIT') ? 429 : 400, headers });
  }
  const draft = claim?.draft as ClaimedDraft | undefined;
  if (!draft) return new Response(JSON.stringify({ code: 'DRAFT_CLAIM_FAILED' }), { status: 400, headers });
  if (!claim.claimed) return new Response(JSON.stringify({ draftId: draft.id, state: draft.state, assessment: draft.assessment_json }), { headers });

  const submittedContent = typeof draft.content_ko === 'string' ? draft.content_ko : '';
  const context = parseAssessmentContext(draft.assessment_context_json, unitType, requirementId);
  if (!submittedContent || !context) {
    await adminClient.rpc('fail_q54_draft_assessment', { p_draft_id: draft.id, p_failure_code: 'DRAFT_CONTEXT_MISSING' });
    return new Response(JSON.stringify({ code: 'DRAFT_CONTEXT_MISSING', draftId: draft.id }), { status: 502, headers });
  }

  const model = Deno.env.get('GROQ_Q54_MODEL') || Deno.env.get('GROQ_KOREAN_MODEL') || 'qwen/qwen3.8-27b';
  const payload = {
    unitType,
    submittedContent,
    questionSnapshot: context.questionSnapshot,
    selectedRequirement: context.selectedRequirement,
    requirementsAllowedForAssessment: context.requirementsAllowedForAssessment,
  };

  try {
    let assessment: Record<string, unknown> | null = null;
    for (let attempt = 0; attempt < 2 && !assessment; attempt += 1) {
      const raw = await requestGroqAssessment(apiKey, model, payload, attempt === 1);
      assessment = normalizeQ54Assessment(raw, {
        content: submittedContent,
        allowedRequirements: context.requirementsAllowedForAssessment,
        selectedRequirementId: context.selectedRequirement?.id || null,
        unitType,
      });
    }
    if (!assessment) throw new Error('INVALID_AI_RESPONSE');
    const { data: completed, error: completeError } = await adminClient.rpc('complete_q54_draft_assessment', {
      p_draft_id: draft.id, p_assessment: assessment, p_provider: 'groq', p_model: model,
      p_prompt_version: Q54_ASSESSMENT_PROMPT_VERSION, p_schema_version: Q54_ASSESSMENT_SCHEMA_VERSION,
    });
    if (completeError) throw new Error('DRAFT_SAVE_FAILED');
    const validation = isRecord(assessment.validation) ? assessment.validation : {};
    console.info('q54_draft_assessed', {
      draftId: draft.id, submissionId, unitType, provider: 'groq', model,
      promptVersion: Q54_ASSESSMENT_PROMPT_VERSION, schemaVersion: Q54_ASSESSMENT_SCHEMA_VERSION,
      latencyMs: Date.now() - startedAt, dropped: validation.dropped || {},
    });
    return new Response(JSON.stringify({ draftId: draft.id, state: completed.state, assessment }), { headers });
  } catch (error) {
    const code = error instanceof Error ? error.message : 'DRAFT_ASSESSMENT_FAILED';
    console.error('q54_draft_assessment_failed', { draftId: draft.id, submissionId, unitType, code, latencyMs: Date.now() - startedAt });
    await adminClient.rpc('fail_q54_draft_assessment', { p_draft_id: draft.id, p_failure_code: code });
    return new Response(JSON.stringify({ code, draftId: draft.id }), { status: 502, headers });
  }
});
