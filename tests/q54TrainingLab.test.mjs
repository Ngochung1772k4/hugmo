import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const migration = readFileSync(new URL('../supabase/migrations/20261002000014_q54_training_lab.sql', import.meta.url), 'utf8');
const assessor = readFileSync(new URL('../supabase/functions/assess-q54-draft/index.ts', import.meta.url), 'utf8');
const drillGenerator = readFileSync(new URL('../supabase/functions/generate-q54-error-drill/index.ts', import.meta.url), 'utf8');
const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
const lab = readFileSync(new URL('../src/features/topikWriting54/pages/Q54TrainingLabPage.tsx', import.meta.url), 'utf8');
const composition = readFileSync(new URL('../src/features/topikWriting54/pages/Q54CompositionPage.tsx', import.meta.url), 'utf8');
const sprint = readFileSync(new URL('../src/features/topikWriting54/pages/Q54IdeaSprintPage.tsx', import.meta.url), 'utf8');
const logic = readFileSync(new URL('../src/features/topikWriting54/pages/Q54LogicChainPage.tsx', import.meta.url), 'utf8');

test('Training Lab schema protects owner data and records all private learning entities', () => {
  for (const table of ['q54_training_sessions', 'q54_skill_attempts', 'q54_writing_drafts', 'q54_error_drill_sets', 'q54_collocation_review_progress']) {
    assert.match(migration, new RegExp(`create table if not exists public\\.${table}`));
    assert.match(migration, new RegExp(`alter table public\\.${table} enable row level security`));
  }
  assert.match(migration, /unique \(user_id, submission_id\)/);
  assert.match(migration, /unique index if not exists uq_q54_skill_attempts_submission/);
  assert.match(migration, /error_key, error_type/);
  assert.match(migration, /occurrence_count = public\.q54_user_errors\.occurrence_count \+ 1/);
});

test('Sprint, deterministic logic, and Exam Mode have their required server guards', () => {
  assert.match(migration, /between 0 and 60000/);
  assert.match(migration, /correct := p_ordered_nodes = idea\.logic_chain_ko/);
  assert.match(migration, /now\(\) \+ interval '30 minutes'/);
  assert.match(migration, /EXAM_TIME_EXPIRED/);
  assert.match(migration, /Assistance is locked in exam mode/);
  assert.match(migration, /status = 'SUBMITTED', submitted_at = now\(\)/);
  assert.match(sprint, /remaining === 0/);
  assert.match(logic, /recordLogicChain/);
});

test('claims are idempotent before quota and only Edge Functions can persist assessment', () => {
  assert.match(migration, /pg_advisory_xact_lock\(hashtextextended\(uid::text \|\| ':' \|\| p_submission_id::text, 5401\)\)/);
  assert.match(migration, /pg_advisory_xact_lock\(hashtextextended\(uid::text \|\| ':' \|\| p_submission_id::text, 5402\)\)/);
  assert.match(migration, /perform public\.claim_q54_ai_request\('DRAFT_ASSESSMENT'\)/);
  assert.match(migration, /coalesce\(auth\.jwt\(\)->>'role', ''\) <> 'service_role'/);
  assert.match(assessor, /claim_q54_draft_submission/);
  assert.match(assessor, /adminClient\.rpc\('complete_q54_draft_assessment'/);
  assert.match(assessor, /Never write a full replacement essay/);
  assert.match(assessor, /Do not give a numerical TOPIK score/);
});

test('draft feedback covers requirements and deterministic repetition while drill generation produces exactly five items', () => {
  assert.match(assessor, /COVERED' \| 'PARTIAL' \| 'MISSING/);
  assert.match(assessor, /return count > 2/);
  for (const dimension of ['logic:', 'collocations:', 'repetition:', 'cohesion:', 'formalStyle:']) assert.match(assessor, new RegExp(dimension));
  assert.match(drillGenerator, /Create exactly five concise TOPIK Korean error-repair multiple choice drills/);
  assert.match(drillGenerator, /items\.length === 5/);
  assert.match(drillGenerator, /claim_q54_error_drill/);
});

test('draft assessment is grounded in the submitted content and scopes coverage by unit type', () => {
  assert.match(assessor, /content\.includes\(original\)/);
  assert.match(assessor, /content\.includes\(expression\)/);
  assert.match(assessor, /content\.includes\(evidenceKo\)/);
  assert.match(assessor, /Every grammar or collocation issue must include original copied exactly from that draft/);
  assert.match(assessor, /Do not use previous drafts, conversation history, Error Notebook, examples, or reference answers as current-draft errors/);
  assert.match(assessor, /const scopedRequirements = unitType === 'ESSAY' \? requirements \|\| \[\] : selectedRequirement \? \[selectedRequirement\] : \[\]/);
  assert.match(assessor, /do not mark any other requirement missing/);
  assert.match(assessor, /normalize\([^\n]+scopedRequirements, contentKo\)/);
});

test('the front end exposes the complete practice and review route family', () => {
  for (const route of ['/lab/drills', '/lab/rewrite/:errorId', '/lab/review/:draftId', '/lab/weakness', '/sessions/:sessionId/sprint', '/sessions/:sessionId/logic', '/sessions/:sessionId/sentence', '/sessions/:sessionId/compose/:unit']) {
    assert.match(app, new RegExp(route.replaceAll('/', '\\/')));
  }
  assert.match(lab, /compose\/ESSAY/);
  assert.match(composition, /600.{1,2}700/);
  assert.match(composition, /3.{1,2}5/);
});
