import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

type HintKey = 'vocabulary' | 'pattern' | 'logic' | 'sample';
const keys: HintKey[] = ['vocabulary', 'pattern', 'logic', 'sample'];
const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
const headers = { ...corsHeaders, 'Content-Type': 'application/json' };
const text = (value: unknown) => typeof value === 'string' ? value.trim() : '';

function normalize(value: unknown, key: HintKey) {
  if (!value || typeof value !== 'object') return null;
  const raw = value as Record<string, unknown>;
  if (key === 'vocabulary') {
    const vocabulary = Array.isArray(raw.vocabulary) ? raw.vocabulary.map(text).filter(Boolean).slice(0, 5) : [];
    return vocabulary.length ? vocabulary : null;
  }
  const hint = text(raw.hint);
  return hint || null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return new Response(JSON.stringify({ code: 'METHOD_NOT_ALLOWED' }), { status: 405, headers });
  const url = Deno.env.get('SUPABASE_URL') || '';
  const anon = Deno.env.get('SUPABASE_ANON_KEY') || '';
  const service = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  const apiKey = Deno.env.get('GROQ_API_KEY') || '';
  const auth = req.headers.get('Authorization') || '';
  if (!url || !anon || !service || !apiKey || !auth) return new Response(JSON.stringify({ code: 'HINT_GENERATOR_NOT_CONFIGURED' }), { status: 503, headers });
  const userClient = createClient(url, anon, { global: { headers: { Authorization: auth } } });
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) return new Response(JSON.stringify({ code: 'UNAUTHORIZED' }), { status: 401, headers });
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return new Response(JSON.stringify({ code: 'INVALID_JSON' }), { status: 400, headers }); }
  const exerciseId = text(body.exerciseId);
  const key = text(body.hintKey) as HintKey;
  if (!/^[0-9a-f-]{36}$/i.test(exerciseId) || !keys.includes(key)) return new Response(JSON.stringify({ code: 'INVALID_REQUEST' }), { status: 400, headers });
  const { data: exercise } = await userClient.from('q54_translation_exercises').select('id, created_by, prompt_vi, vocabulary_hint, pattern_hint, sample_sentence_ko, hint_cache, generation_context_json').eq('id', exerciseId).single();
  if (!exercise) return new Response(JSON.stringify({ code: 'EXERCISE_NOT_FOUND' }), { status: 404, headers });
  const cache = exercise.hint_cache && typeof exercise.hint_cache === 'object' ? exercise.hint_cache as Record<string, unknown> : {};
  const cached = key === 'vocabulary' ? exercise.vocabulary_hint : key === 'pattern' ? exercise.pattern_hint : key === 'sample' ? exercise.sample_sentence_ko : cache.logic;
  if (cached && (!Array.isArray(cached) || cached.length)) return new Response(JSON.stringify({ hintKey: key, hint: cached, cached: true }), { headers });
  const { error: rateError } = await userClient.rpc('claim_q54_ai_request', { p_request_kind: 'TRANSLATION_HINT' });
  if (rateError) return new Response(JSON.stringify({ code: rateError.message.includes('Q54_RATE_LIMIT') ? rateError.message : 'RATE_LIMIT_FAILED' }), { status: 429, headers });
  const model = Deno.env.get('GROQ_Q54_MODEL') || Deno.env.get('GROQ_KOREAN_MODEL') || 'qwen/qwen3.8-27b';
  const fields = key === 'vocabulary' ? '{"vocabulary":["Korean vocabulary or expression"]}' : '{"hint":"..."}';
  const instruction = key === 'pattern' ? 'Give one useful Korean grammar pattern.' : key === 'logic' ? 'Give a brief Vietnamese logic hint, not a Korean answer.' : key === 'sample' ? 'Give one related Korean sample sentence, not a direct translation.' : 'Give 3 to 5 Korean vocabulary items or expressions.';
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` }, body: JSON.stringify({ model, max_completion_tokens: 450, response_format: { type: 'json_object' }, messages: [
    { role: 'system', content: 'You are a Korean writing coach. Return valid JSON only. Do not give the complete target translation unless a related sample is requested.' },
    { role: 'user', content: `Return exactly ${fields}. ${instruction} Exercise context: ${JSON.stringify(exercise.generation_context_json)}. Vietnamese source: ${JSON.stringify(exercise.prompt_vi)}.` },
  ] }) });
  if (!response.ok) return new Response(JSON.stringify({ code: 'AI_UPSTREAM_FAILED' }), { status: 502, headers });
  let hint: unknown = null;
  try { hint = normalize(JSON.parse((await response.json())?.choices?.[0]?.message?.content || ''), key); } catch { hint = null; }
  if (!hint) return new Response(JSON.stringify({ code: 'INVALID_AI_RESPONSE' }), { status: 502, headers });
  const admin = createClient(url, service);
  const update = key === 'vocabulary' ? { vocabulary_hint: hint } : key === 'pattern' ? { pattern_hint: hint } : key === 'sample' ? { sample_sentence_ko: hint } : { hint_cache: { ...cache, logic: hint } };
  if (exercise.created_by === user.id) {
    const { error } = await admin.from('q54_translation_exercises').update(update).eq('id', exerciseId).eq('created_by', user.id);
    if (error) return new Response(JSON.stringify({ code: 'PERSIST_FAILED' }), { status: 500, headers });
  }
  return new Response(JSON.stringify({ hintKey: key, hint, cached: false }), { headers });
});
