import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { generateExpandedIdeaSeedSql, readSeedSource, validateExpandedIdeaSeed } from '../scripts/topikQ54ExpandedIdeaBankSeed.mjs';

const migration = readFileSync(new URL('../supabase/migrations/20261001000013_q54_expanded_idea_bank.sql', import.meta.url), 'utf8');
const service = readFileSync(new URL('../src/features/topikWriting54/service.ts', import.meta.url), 'utf8');
const page = readFileSync(new URL('../src/features/topikWriting54/pages/Q54QuestionPage.tsx', import.meta.url), 'utf8');
const retrieval = readFileSync(new URL('../src/features/topikWriting54/ideaBank.ts', import.meta.url), 'utf8');
const edgeFunction = readFileSync(new URL('../supabase/functions/generate-q54-ideas/index.ts', import.meta.url), 'utf8');
const seed = readSeedSource();

test('canonical expanded Idea Bank seed validates all required counts and fields', () => {
  const report = validateExpandedIdeaSeed(seed);
  assert.deepEqual(report.issues, []);
  assert.deepEqual(report.counts, { GLOBAL: 24, ENVIRONMENT: 24, EDUCATION: 24, PRIVACY_DIGITAL: 24 });
  assert.equal(seed.ideas.filter((idea) => idea.functional_group === 'POSITIVE').length, 24);
  assert.equal(seed.ideas.filter((idea) => idea.functional_group === 'NEGATIVE').length, 24);
  assert.equal(seed.ideas.filter((idea) => idea.functional_group === 'CAUSE').length, 24);
  assert.equal(seed.ideas.filter((idea) => idea.functional_group === 'SOLUTION').length, 24);
  assert.ok(seed.ideas.every((idea) => idea.source_type === 'MANUAL' && idea.status === 'PUBLISHED'));
});

test('generated seed is idempotent and maps the three curated topic codes without cross-topic fallbacks', () => {
  const sql = generateExpandedIdeaSeedSql(seed);
  assert.match(sql, /on conflict \(seed_key\) where seed_key is not null do update/);
  assert.match(sql, /'environment'/);
  assert.match(sql, /'education-self-development'/);
  assert.match(sql, /'personal-data-digital-society'/);
  assert.match(sql, /total_count <> 96/);
});

test('schema extends q54_ideas, keeps static content read-only, and protects private AI ideas by owner', () => {
  assert.match(migration, /alter table public\.q54_ideas alter column topic_id drop not null/);
  assert.match(migration, /uq_q54_ideas_seed_key/);
  assert.match(migration, /scope in \('GLOBAL', 'TOPIC'\)/);
  assert.match(migration, /visibility = 'PRIVATE' and created_by = auth\.uid\(\)/);
  assert.match(migration, /create_q54_private_generated_ideas/);
});

test('retrieval loads exact topic or global ideas only, and the UI has progressive reveal plus two idea pins', () => {
  assert.match(service, /scope\.eq\.GLOBAL,topic_id\.eq\.\$\{question\.topic_id\}/);
  assert.match(retrieval, /isExactTopic\(idea\) && matchesType\(idea\)/);
  assert.match(retrieval, /isGlobal\(idea\) && matchesType\(idea\)/);
  assert.match(page, /current\.length < 2/);
  assert.match(page, /Mở dần logic, lý do và kết quả/);
  assert.match(page, /ExpandedIdeaCard/);
});

test('AI generation produces exactly three extended private idea units and never asks for a full essay', () => {
  assert.match(edgeFunction, /Return exactly 3 distinct ideas/);
  assert.match(edgeFunction, /create_q54_private_generated_ideas/);
  assert.match(edgeFunction, /IDEA_GENERATION/);
  assert.match(edgeFunction, /never a model paragraph or complete essay/);
});
