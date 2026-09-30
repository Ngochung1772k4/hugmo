import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

type DrillItem = { promptKo: string; promptVi: string; options: string[]; correctIndex: number; explanationVi: string; errorKey: string };
const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
const headers = { ...corsHeaders, 'Content-Type': 'application/json' };
const text = (value: unknown) => typeof value === 'string' ? value.trim() : '';

function normalize(value: unknown, allowedKeys: Set<string>): DrillItem[] | null {
  if (!value || typeof value !== 'object' || !Array.isArray((value as Record<string, unknown>).items)) return null;
  const items = (value as { items: unknown[] }).items.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const raw = item as Record<string, unknown>; const options = Array.isArray(raw.options) ? raw.options.map(text).filter(Boolean).slice(0, 4) : [];
    const promptKo = text(raw.promptKo); const promptVi = text(raw.promptVi); const explanationVi = text(raw.explanationVi); const errorKey = text(raw.errorKey); const correctIndex = Number(raw.correctIndex);
    return promptKo && promptVi && explanationVi && allowedKeys.has(errorKey) && options.length === 4 && new Set(options).size === 4 && Number.isInteger(correctIndex) && correctIndex >= 0 && correctIndex < 4 ? [{ promptKo, promptVi, options, correctIndex, explanationVi, errorKey }] : [];
  }).slice(0, 5);
  return items.length === 5 ? items : null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return new Response(JSON.stringify({ code: 'METHOD_NOT_ALLOWED' }), { status: 405, headers });
  const url = Deno.env.get('SUPABASE_URL') || ''; const anon = Deno.env.get('SUPABASE_ANON_KEY') || ''; const serviceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''; const apiKey = Deno.env.get('GROQ_API_KEY') || ''; const auth = req.headers.get('Authorization') || '';
  if (!url || !anon || !serviceRole || !apiKey || !auth) return new Response(JSON.stringify({ code: 'ERROR_DRILL_NOT_CONFIGURED' }), { status: 503, headers });
  const userClient = createClient(url, anon, { global: { headers: { Authorization: auth } } }); const adminClient = createClient(url, serviceRole);
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) return new Response(JSON.stringify({ code: 'UNAUTHORIZED' }), { status: 401, headers });
  let body: Record<string, unknown>; try { body = await req.json(); } catch { return new Response(JSON.stringify({ code: 'INVALID_JSON' }), { status: 400, headers }); }
  const submissionId = text(body.submissionId);
  if (!/^[0-9a-f-]{36}$/i.test(submissionId)) return new Response(JSON.stringify({ code: 'INVALID_REQUEST' }), { status: 400, headers });
  const errorIds = Array.isArray(body.errorIds) ? body.errorIds.filter((id) => typeof id === 'string' && /^[0-9a-f-]{36}$/i.test(id)).slice(0, 5) : null;
  const { data: claim, error: claimError } = await userClient.rpc('claim_q54_error_drill', { p_submission_id: submissionId, p_error_ids: errorIds });
  if (claimError) { const code = claimError.message.includes('Q54_RATE_LIMIT') ? claimError.message : 'DRILL_CLAIM_FAILED'; return new Response(JSON.stringify({ code }), { status: code.includes('Q54_RATE_LIMIT') ? 429 : 400, headers }); }
  const drill = claim?.drill as { id: string; state: string; items_json: DrillItem[] | null; error_ids: string[] } | undefined;
  if (!drill) return new Response(JSON.stringify({ code: 'DRILL_CLAIM_FAILED' }), { status: 400, headers });
  if (!claim.claimed) return new Response(JSON.stringify({ drillId: drill.id, state: drill.state, items: drill.items_json }), { headers });
  const { data: errors } = await userClient.from('q54_user_errors').select('id, error_key, error_type, original_text, corrected_text, explanation_vi').in('id', drill.error_ids);
  if (!errors?.length) return new Response(JSON.stringify({ code: 'NO_ERRORS_AVAILABLE' }), { status: 400, headers });
  const model = Deno.env.get('GROQ_Q54_MODEL') || Deno.env.get('GROQ_KOREAN_MODEL') || 'qwen/qwen3.8-27b';
  const prompt = `Return JSON only. Create exactly five concise TOPIK Korean error-repair multiple choice drills from this learner's errors. Never write an essay. Required shape: {"items":[{"promptKo":"Korean blank/correction question","promptVi":"Vietnamese instruction","options":["A","B","C","D"],"correctIndex":0,"explanationVi":"short explanation","errorKey":"must exactly match one supplied error_key"}]}. Use four distinct options and correctIndex 0-3. Errors: ${JSON.stringify(errors)}.`;
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` }, body: JSON.stringify({ model, max_completion_tokens: 1500, response_format: { type: 'json_object' }, messages: [{ role: 'system', content: 'Return valid JSON only.' }, { role: 'user', content: prompt }] }) });
    if (!response.ok) throw new Error('AI_UPSTREAM_FAILED');
    const payload = await response.json(); const items = normalize(JSON.parse(payload?.choices?.[0]?.message?.content || ''), new Set(errors.map((error) => error.error_key)));
    if (!items) throw new Error('INVALID_AI_RESPONSE');
    const { data: completed, error: completeError } = await adminClient.rpc('complete_q54_error_drill', { p_drill_id: drill.id, p_items: items, p_provider: 'groq', p_model: model, p_prompt_version: 'q54-error-drill/v1', p_schema_version: 'q54-error-drill/v1' });
    if (completeError) throw new Error('DRILL_SAVE_FAILED');
    return new Response(JSON.stringify({ drillId: drill.id, state: completed.state, items }), { headers });
  } catch (error) {
    await adminClient.rpc('fail_q54_error_drill', { p_drill_id: drill.id, p_failure_code: error instanceof Error ? error.message : 'UNKNOWN' });
    return new Response(JSON.stringify({ code: error instanceof Error ? error.message : 'ERROR_DRILL_FAILED', drillId: drill.id }), { status: 502, headers });
  }
});
