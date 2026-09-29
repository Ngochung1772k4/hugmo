import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { generateEditorialGlossesSql, readEditorialGlosses, validateEditorialGlosses } from '../scripts/topikReading21EditorialGlossesSeed.mjs';

const data = readEditorialGlosses();
const migration = readFileSync(new URL('../supabase/migrations/20260929000012_q21_editorial_glosses.sql', import.meta.url), 'utf8');

test('Q21 editorial glosses are separate, complete, and clearly manual', () => {
  assert.deepEqual(validateEditorialGlosses(data), { issues: [], count: 13 });
  assert.ok(data.glosses.some((item) => item.expression_ko === '손에 꼽히다'));
  assert.ok(data.glosses.some((item) => item.expression_ko === '눈높이에 맞다'));
});

test('editorial gloss SQL never updates source-book meanings', () => {
  const sql = generateEditorialGlossesSql(data);
  assert.match(sql, /topik_reading_idiom_editorial_glosses/);
  assert.match(sql, /EDITORIAL_MANUAL/);
  assert.doesNotMatch(sql, /meaning_vi_source/);
  assert.match(migration, /meaning_vi_editorial/);
  assert.match(migration, /revoke insert, update, delete/);
});
