import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { findIdiomForOption, generateSeedSql, readSeedSource, validateSeedSource } from '../scripts/topikReading2021Seed.mjs';

const seed = readSeedSource();
const report = validateSeedSource(seed);
const migration = readFileSync(new URL('../supabase/migrations/20260929000011_topik_reading_20_21.sql', import.meta.url), 'utf8');

test('canonical Reading 20-21 source passes fidelity validation', () => {
  assert.deepEqual(report.issues, []);
  assert.deepEqual(report.counts, {
    groups: 11,
    idioms: 88,
    priorityS: 7,
    priorityA: 22,
    priorityB: 59,
    needsGloss: 13,
    needsReview: 1,
    q20Exercises: 8,
    q21Exercises: 8,
  });
});

test('Q20 answer key remains exactly as supplied', () => {
  assert.deepEqual(seed.q20.exercises.map((item) => item.q20.answer_index), [2, 1, 1, 4, 3, 3, 1, 4]);
});

test('Q21 answer key links to the expected source idioms', () => {
  const correct = seed.q21.exercises.map((item) => {
    const option = item.q21.options[item.q21.answer_index - 1];
    return findIdiomForOption(seed.q21.idioms, option, item.source_page)?.expression_ko;
  });
  assert.deepEqual(correct, ['머리를 맞대다', '발목을 잡다', '발 벗고 나서다', '손을 떼다', '손에 꼽히다', '눈높이에 맞다', '허리띠를 졸라매다', '발 벗고 나서다']);
});

test('generated SQL is idempotent and protects source content with server-side attempt grading', () => {
  const sql = generateSeedSql(seed);
  assert.match(sql, /on conflict \(expression_ko\) do update/);
  assert.match(sql, /on conflict \(exercise_id, question_no\) do update/);
  assert.match(sql, /READING_19_20_SAMPLE_01/);
  assert.match(sql, /READING_21_22_PRACTICE_05/);
  assert.match(sql, /TOPIK Reading 20-21 seed validation failed/);
  assert.match(migration, /topik_reading_idiom_progress/);
  assert.match(migration, /read own reading 20 21 attempts/);
  assert.match(migration, /topik_reading_record_20_21_attempt/);
  assert.match(migration, /revoke insert, update, delete on public\.topik_reading_20_21_attempts/);
});
