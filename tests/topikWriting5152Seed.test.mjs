import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { generateSeedSql, readSeedSource, validateSeedSource } from '../scripts/topikWriting5152Seed.mjs';

const seed = readSeedSource();
const report = validateSeedSource(seed);
const migration = readFileSync(new URL('../supabase/migrations/20260929000010_topik_writing_51_52.sql', import.meta.url), 'utf8');

test('canonical Q51-Q52 source JSON passes fidelity validation', () => {
  assert.deepEqual(report.issues, []);
  assert.deepEqual(report.counts, {
    q51Intents: 7,
    q51SectionGroups: 7,
    q51SectionExercises: 39,
    q51MixedExercises: 21,
    q51Blanks: 84,
    q52Relations: 9,
    q52Exercises: 31,
    q52Blanks: 62,
  });
});

test('generated SQL retains all canonical exercise stable keys and review states', () => {
  const sql = generateSeedSql(seed);
  assert.match(sql, /Q51_SECTION_FUTURE_PLAN_1/);
  assert.match(sql, /Q51_MIXED_21/);
  assert.match(sql, /Q52_PRACTICE_31/);
  assert.match(sql, /'NEEDS_REVIEW'/);
  assert.match(sql, /source_answer_variants/);
  assert.match(sql, /q51_intent_count <> 7/);
  assert.match(sql, /q52_exercise_count <> 31/);
});

test('migration protects source content and grades attempts through a deterministic RPC', () => {
  assert.match(migration, /enable row level security/);
  assert.match(migration, /read verified writing 51 exercises/);
  assert.match(migration, /read own writing blank attempts/);
  assert.match(migration, /revoke insert, update, delete on public\.topik_writing_51_intents/);
  assert.match(migration, /topik_writing_record_attempt/);
  assert.match(migration, /SOURCE_MATCH/);
  assert.match(migration, /topik_writing_normalize_source_answer/);
});
