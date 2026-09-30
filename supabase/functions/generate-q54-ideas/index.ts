import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

type Idea = {
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
};

const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
const headers = { ...corsHeaders, 'Content-Type': 'application/json' };
const text = (value: unknown) => typeof value === 'string' ? value.trim() : '';
const textList = (value: unknown, max: number) => Array.isArray(value) ? value.map(text).filter(Boolean).slice(0, max) : [];

function normalize(value: unknown): Idea[] | null {
  if (!value || typeof value !== 'object' || !Array.isArray((value as Record<string, unknown>).ideas)) return null;
  const ideas = (value as { ideas: unknown[] }).ideas.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const raw = item as Record<string, unknown>;
    const keywordKo = text(raw.keywordKo);
    const keywordVi = text(raw.keywordVi);
    const reasonKo = text(raw.reasonKo);
    const reasonVi = text(raw.reasonVi);
    const resultKo = text(raw.resultKo);
    const resultVi = text(raw.resultVi);
    const logicChainKo = textList(raw.logicChainKo, 4);
    const logicChainVi = textList(raw.logicChainVi, 4);
    const recommendedCollocations = textList(raw.recommendedCollocations, 4);
    if (!keywordKo || !keywordVi || !reasonKo || !reasonVi || !resultKo || !resultVi || logicChainKo.length < 3 || logicChainVi.length !== logicChainKo.length || recommendedCollocations.length < 2) return [];
    return [{ keywordKo, keywordVi, reasonKo, reasonVi, resultKo, resultVi, expansionKo: text(raw.expansionKo) || null, expansionVi: text(raw.expansionVi) || null, logicChainKo, logicChainVi, recommendedCollocations }];
  }).slice(0, 3);
  return ideas.length === 3 ? ideas : null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return new Response(JSON.stringify({ code: 'METHOD_NOT_ALLOWED' }), { status: 405, headers });
  const url = Deno.env.get('SUPABASE_URL') || '';
  const anon = Deno.env.get('SUPABASE_ANON_KEY') || '';
  const apiKey = Deno.env.get('GROQ_API_KEY') || '';
  const auth = req.headers.get('Authorization') || '';
  if (!url || !anon || !apiKey || !auth) return new Response(JSON.stringify({ code: 'IDEA_GENERATOR_NOT_CONFIGURED' }), { status: 503, headers });

  const userClient = createClient(url, anon, { global: { headers: { Authorization: auth } } });
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) return new Response(JSON.stringify({ code: 'UNAUTHORIZED' }), { status: 401, headers });
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return new Response(JSON.stringify({ code: 'INVALID_JSON' }), { status: 400, headers }); }
  const questionId = text(body.questionId);
  const requirementId = text(body.requirementId);
  if (!/^[0-9a-f-]{36}$/i.test(questionId) || !/^[0-9a-f-]{36}$/i.test(requirementId)) return new Response(JSON.stringify({ code: 'INVALID_REQUEST' }), { status: 400, headers });

  const [{ data: question }, { data: requirement }] = await Promise.all([
    userClient.from('q54_questions').select('id, topic_id, subtopic_ko, prompt_ko').eq('id', questionId).single(),
    userClient.from('q54_question_requirements').select('question_id, prompt_ko, label_vi, requirement_type, function_group').eq('id', requirementId).eq('question_id', questionId).single(),
  ]);
  if (!question || !requirement || !question.topic_id) return new Response(JSON.stringify({ code: 'CONTENT_NOT_FOUND' }), { status: 404, headers });
  const [{ data: topic }, { data: existing }] = await Promise.all([
    userClient.from('q54_topics').select('name_ko, name_vi').eq('id', question.topic_id).single(),
    userClient.from('q54_ideas').select('keyword_ko').or(`scope.eq.GLOBAL,topic_id.eq.${question.topic_id}`),
  ]);
  const { error: rateError } = await userClient.rpc('claim_q54_ai_request', { p_request_kind: 'IDEA_GENERATION' });
  if (rateError) {
    const code = rateError.message.includes('Q54_RATE_LIMIT') ? rateError.message : 'RATE_LIMIT_FAILED';
    return new Response(JSON.stringify({ code }), { status: code.includes('Q54_RATE_LIMIT') ? 429 : 400, headers });
  }

  const model = Deno.env.get('GROQ_Q54_MODEL') || Deno.env.get('GROQ_KOREAN_MODEL') || 'qwen/qwen3.8-27b';
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model, max_completion_tokens: 1500, response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: 'You are a careful TOPIK II Writing Q54 idea coach for Vietnamese learners. Return valid JSON only. Produce compact idea units, never a model paragraph or complete essay.' },
        { role: 'user', content: `Return exactly {"ideas":[{"keywordKo":"Korean core idea","keywordVi":"Vietnamese meaning","reasonKo":"Korean why","reasonVi":"Vietnamese why","resultKo":"Korean result","resultVi":"Vietnamese result","expansionKo":null,"expansionVi":null,"logicChainKo":["node 1","node 2","node 3"],"logicChainVi":["nút 1","nút 2","nút 3"],"recommendedCollocations":["Korean collocation 1","Korean collocation 2"]}]}. Return exactly 3 distinct ideas. Every logic chain must have 3 or 4 matching Korean/Vietnamese nodes; include 2 to 4 collocations. Do not repeat these existing keywords: ${JSON.stringify((existing || []).map((idea) => idea.keyword_ko))}. Topic: ${JSON.stringify(topic?.name_ko || 'Custom topic')} (${JSON.stringify(topic?.name_vi || '')}). Subtopic: ${JSON.stringify(question.subtopic_ko || '')}. Full question: ${JSON.stringify(question.prompt_ko)}. Requirement: ${JSON.stringify(requirement.prompt_ko)}. Semantic type/group: ${requirement.requirement_type}/${requirement.function_group}.` },
      ],
    }),
  });
  if (!response.ok) return new Response(JSON.stringify({ code: 'AI_UPSTREAM_FAILED' }), { status: 502, headers });
  const payload = await response.json();
  let ideas: Idea[] | null = null;
  try { ideas = normalize(JSON.parse(payload?.choices?.[0]?.message?.content || '')); } catch { ideas = null; }
  if (!ideas) return new Response(JSON.stringify({ code: 'INVALID_AI_RESPONSE' }), { status: 502, headers });
  const { error: storeError } = await userClient.rpc('create_q54_private_generated_ideas', { p_question_id: questionId, p_requirement_id: requirementId, p_ideas: ideas });
  if (storeError) return new Response(JSON.stringify({ code: 'IDEA_SAVE_FAILED' }), { status: 500, headers });
  return new Response(JSON.stringify({ ideas, provider: 'groq', model, promptVersion: 'q54-expanded-idea-generation/v1' }), { headers });
});
