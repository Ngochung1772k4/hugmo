import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const migration = readFileSync(new URL('../supabase/migrations/20260928000008_q54_translation_workbench.sql', import.meta.url), 'utf8');
const generator = readFileSync(new URL('../supabase/functions/generate-q54-translation-exercise/index.ts', import.meta.url), 'utf8');
const hintGenerator = readFileSync(new URL('../supabase/functions/generate-q54-translation-hint/index.ts', import.meta.url), 'utf8');
const checker = readFileSync(new URL('../supabase/functions/check-q54-sentence/index.ts', import.meta.url), 'utf8');

test('manual translation exercise is private, normal, and does not require a reference answer', () => {
  assert.match(migration, /create_q54_manual_translation_exercise/);
  assert.match(migration, /'PRIVATE', 'USER_ENTERED', 'NORMAL'/);
  assert.match(migration, /reference_answer_ko drop not null/);
  assert.match(migration, /between 1 and 250/);
  assert.match(migration, /q54_translation_exercise_answer_keys/);
});

test('AI mode creates cached hints while manual hints have a dedicated lazy generator', () => {
  assert.match(generator, /generation_mode: 'AI_GENERATED'/);
  assert.match(generator, /hint_cache: \{ logic: generated\.logic \}/);
  assert.match(hintGenerator, /TRANSLATION_HINT/);
  assert.match(hintGenerator, /cached: true/);
});

test('sentence assessment supports a manual exercise without a reference answer', () => {
  assert.match(checker, /When no reference exists, assess translation accuracy directly from the Vietnamese source and context/);
  assert.match(checker, /q54_translation_exercise_answer_keys/);
  assert.match(migration, /\(visibility = 'PUBLIC'\) or created_by = uid/);
});
