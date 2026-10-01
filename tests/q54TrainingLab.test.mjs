import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { getCompositeRequirementComponents, normalizeEvidence, normalizeQ54Assessment } from '../supabase/functions/_shared/q54-assessment-validation.mjs';

const labMigration = readFileSync(new URL('../supabase/migrations/20261002000014_q54_training_lab.sql', import.meta.url), 'utf8');
const groundingMigration = readFileSync(new URL('../supabase/migrations/20261002000015_q54_assessment_grounding.sql', import.meta.url), 'utf8');
const assessor = readFileSync(new URL('../supabase/functions/assess-q54-draft/index.ts', import.meta.url), 'utf8');
const prompt = readFileSync(new URL('../supabase/functions/assess-q54-draft/system-prompt.mjs', import.meta.url), 'utf8');
const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
const lab = readFileSync(new URL('../src/features/topikWriting54/pages/Q54TrainingLabPage.tsx', import.meta.url), 'utf8');
const composition = readFileSync(new URL('../src/features/topikWriting54/pages/Q54CompositionPage.tsx', import.meta.url), 'utf8');
const sprint = readFileSync(new URL('../src/features/topikWriting54/pages/Q54IdeaSprintPage.tsx', import.meta.url), 'utf8');
const logic = readFileSync(new URL('../src/features/topikWriting54/pages/Q54LogicChainPage.tsx', import.meta.url), 'utf8');
const trainingService = readFileSync(new URL('../src/features/topikWriting54/training.ts', import.meta.url), 'utf8');

const content = `환경 보호는 사람들의 건강을 유지하는 데 중요한 역할을 한다.
환경 오염는 줄어들면 질병 발생 위험이 낮아질 수 있다.
이를 통해 건강한 환경에서 생활할 수 있다.`;
const requirement = { id: 'r-health', promptKo: '환경 보호와 자원 절약이 필요한 이유는 무엇인가?' };
const evidence = (value, offset = content.indexOf(value)) => ({ start: offset, end: offset + value.length, text: value });
const groundedProviderResponse = () => ({
  coverage: [{
    requirementId: 'r-health', status: 'COVERED', evidence: [evidence('환경 보호는 사람들의 건강을 유지하는 데 중요한 역할을 한다.')], missingPointVi: null,
    componentCoverage: [
      { component: '환경 보호', status: 'COVERED', evidence: [evidence('환경 보호는 사람들의 건강을 유지하는 데 중요한 역할을 한다.')] },
      { component: '자원 절약', status: 'MISSING', evidence: [] },
    ],
  }],
  sentenceFunctions: [
    { slot: 'MAIN_IDEA', status: 'GOOD', commentVi: 'Ý chính rõ.', evidence: [evidence('환경 보호는 사람들의 건강을 유지하는 데 중요한 역할을 한다.')] },
    { slot: 'WHY', status: 'WEAK', commentVi: 'Chưa giải thích phần tiết kiệm tài nguyên.', evidence: [evidence('환경 오염는 줄어들면 질병 발생 위험이 낮아질 수 있다.')] },
    { slot: 'RESULT', status: 'GOOD', commentVi: 'Kết quả có liên kết.', evidence: [evidence('이를 통해 건강한 환경에서 생활할 수 있다.')] },
  ],
  logic: { status: 'LOGIC_GAP', severity: 'LOW', chain: ['환경 보호', '환경 오염 감소'], explanationVi: 'Thiếu mắt xích từ bảo vệ môi trường đến giảm ô nhiễm môi trường.', missingLink: 'Mối liên hệ bảo vệ môi trường làm giảm ô nhiễm', evidence: [evidence('환경 오염는 줄어들면 질병 발생 위험이 낮아질 수 있다.')] },
  issues: [{ kind: 'ERROR', category: 'SPELLING', severity: 'HIGH', original: '환경 오염는', corrected: '환경 오염이', explanationVi: 'Trợ từ chủ ngữ cần là 이.' }],
  improvements: [{ kind: 'EXPANSION', suggestionVi: 'Mở rộng thêm lý do cần tiết kiệm tài nguyên.', evidence: [evidence('환경 보호는 사람들의 건강을 유지하는 데 중요한 역할을 한다.')] }],
  cohesion: { status: 'GOOD', commentVi: 'Đã dùng từ nối đúng.', evidence: [evidence('이를 통해')] },
  formalStyle: { tone: 'HANDA_CHE', evidence: [evidence('환경 보호는 사람들의 건강을 유지하는 데 중요한 역할을 한다.')] },
  repetition: [],
});

test('Training Lab schema protects owner data, idempotency, and Exam Mode guards', () => {
  for (const table of ['q54_training_sessions', 'q54_skill_attempts', 'q54_writing_drafts', 'q54_error_drill_sets', 'q54_collocation_review_progress']) {
    assert.match(labMigration, new RegExp(`create table if not exists public\\.${table}`));
    assert.match(labMigration, new RegExp(`alter table public\\.${table} enable row level security`));
  }
  assert.match(labMigration, /unique \(user_id, submission_id\)/);
  assert.match(labMigration, /Q54_RATE_LIMIT_SHORT/);
  assert.match(labMigration, /EXAM_TIME_EXPIRED/);
  assert.match(labMigration, /now\(\) \+ interval '30 minutes'/);
  assert.match(labMigration, /correct := p_ordered_nodes = idea\.logic_chain_ko/);
  assert.match(sprint, /remaining === 0/);
  assert.match(logic, /recordLogicChain/);
});

test('new draft claims persist immutable assessment context before the AI call', () => {
  assert.match(groundingMigration, /assessment_context_json jsonb/);
  assert.match(groundingMigration, /questionSnapshot/);
  assert.match(groundingMigration, /requirementsAllowedForAssessment/);
  assert.match(groundingMigration, /pg_advisory_xact_lock\(hashtextextended\(uid::text \|\| ':' \|\| p_submission_id::text, 5401\)\)/);
  assert.match(groundingMigration, /perform public\.claim_q54_ai_request\('DRAFT_ASSESSMENT'\)/);
  assert.match(groundingMigration, /jsonb_array_elements\(p_assessment->'issues'\)/);
  assert.match(groundingMigration, /position\(issue_item->>'original' in draft\.content_ko\) = 0/);
});

test('assessor uses only the claimed draft and immutable context', () => {
  assert.match(assessor, /const submittedContent = typeof draft\.content_ko/);
  assert.match(assessor, /parseAssessmentContext\(draft\.assessment_context_json/);
  assert.doesNotMatch(assessor, /\.from\('q54_questions'\)/);
  assert.doesNotMatch(assessor, /\.from\('q54_question_requirements'\)/);
  assert.match(assessor, /for \(let attempt = 0; attempt < 2/);
  assert.match(assessor, /compositeRequirementComponents/);
  assert.match(prompt, /Evaluate ONLY the exact Korean draft in submittedContent/);
  assert.match(prompt, /Never report an issue unless its original span exists verbatim/);
  assert.match(prompt, /Never mention or mark another requirement missing/i);
  assert.match(prompt, /Never mark a composite requirement COVERED unless every component/);
  assert.match(prompt, /Keep logic separate from grammar/);
});

test('real three-sentence fixture is grounded, scoped, composite-partial, and stylistically valid', () => {
  const assessment = normalizeQ54Assessment(groundedProviderResponse(), { content, allowedRequirements: [requirement], selectedRequirementId: requirement.id, unitType: 'THREE_SENTENCE' });
  assert.ok(assessment);
  assert.deepEqual(getCompositeRequirementComponents(requirement), ['환경 보호', '자원 절약']);
  assert.deepEqual(assessment.coverage.map((item) => item.status), ['PARTIAL']);
  assert.deepEqual(assessment.coverage[0].componentCoverage.map((item) => item.status), ['COVERED', 'MISSING']);
  assert.deepEqual(assessment.issues.map((item) => item.original), ['환경 오염는']);
  assert.equal(assessment.issues[0].category, 'PARTICLE');
  assert.equal(assessment.issues[0].severity, 'MEDIUM');
  assert.equal(assessment.logic?.status, 'LOGIC_GAP');
  assert.deepEqual(assessment.logic?.chain, ['환경 보호', '환경 오염 감소']);
  assert.deepEqual(assessment.sentenceFunctions.map((item) => item.status), ['GOOD', 'WEAK', 'GOOD']);
  assert.equal(assessment.cohesion?.connectors[0].text, '이를 통해');
  assert.equal(assessment.formalStyle?.tone, 'HANDA_CHE');
  assert.equal(assessment.issues.some((item) => item.original === '유지한은' || item.original === '역할을 한다'), false);
});

test('validator drops hallucinated issues, rejects wrong scope, and never lets grammar explain a logic gap', () => {
  const raw = groundedProviderResponse();
  raw.issues.push({ kind: 'ERROR', category: 'GRAMMAR', severity: 'HIGH', original: '유지한은', corrected: '유지하는', explanationVi: 'Không có trong bài.' });
  raw.logic.explanationVi = 'Logic bị hỏng do trợ từ 환경 오염는.';
  const assessment = normalizeQ54Assessment(raw, { content, allowedRequirements: [requirement], selectedRequirementId: requirement.id, unitType: 'THREE_SENTENCE' });
  assert.ok(assessment);
  assert.deepEqual(assessment.issues.map((item) => item.original), ['환경 오염는']);
  assert.equal(assessment.logic, null);
  const wrongScope = { ...groundedProviderResponse(), coverage: [{ requirementId: 'r-other', status: 'COVERED', evidence: [evidence('환경 보호')], missingPointVi: null, componentCoverage: [] }] };
  assert.equal(normalizeQ54Assessment(wrongScope, { content, allowedRequirements: [requirement], selectedRequirementId: requirement.id, unitType: 'THREE_SENTENCE' }), null);
});

test('validator repairs only a unique evidence offset and drops ambiguous evidence', () => {
  const unique = normalizeEvidence({ start: 999, end: 1002, text: '환경 보호' }, content);
  assert.deepEqual(unique, { start: 0, end: '환경 보호'.length, text: '환경 보호' });
  const duplicate = normalizeEvidence({ start: 999, end: 1002, text: '환경' }, content);
  assert.equal(duplicate, null);
});

test('front end exposes the complete practice and review route family', () => {
  for (const route of ['/lab/drills', '/lab/rewrite/:errorId', '/lab/review/:draftId', '/lab/weakness', '/sessions/:sessionId/sprint', '/sessions/:sessionId/logic', '/sessions/:sessionId/sentence', '/sessions/:sessionId/compose/:unit']) assert.match(app, new RegExp(route.replaceAll('/', '\\/')));
  assert.match(lab, /compose\/ESSAY/);
  assert.match(composition, /600.{1,2}700/);
  assert.match(composition, /3.{1,2}5/);
  assert.match(trainingService, /DRAFT_CONTEXT_MISSING/);
});
