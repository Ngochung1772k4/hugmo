import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const seed = readFileSync(new URL('../supabase/seed/topik_writing_q54_education_personal_seed.sql', import.meta.url), 'utf8');
const mappingMigration = readFileSync(new URL('../supabase/migrations/20260928000009_q54_topic_pattern_mappings.sql', import.meta.url), 'utf8');
const service = readFileSync(new URL('../src/features/topikWriting54/service.ts', import.meta.url), 'utf8');
const questionPage = readFileSync(new URL('../src/features/topikWriting54/pages/Q54QuestionPage.tsx', import.meta.url), 'utf8');

function occurrences(text, expression) {
  return (text.match(expression) || []).length;
}

const ideaSection = seed.slice(seed.indexOf('insert into public.q54_ideas'), seed.indexOf('insert into public.q54_translation_exercises'));
const exerciseSection = seed.slice(seed.indexOf('insert into public.q54_translation_exercises'), seed.indexOf('insert into public.q54_translation_exercise_answer_keys'));
const exampleSection = seed.slice(seed.indexOf('insert into public.q54_pattern_examples'), seed.indexOf('do $$', seed.indexOf('insert into public.q54_pattern_examples')));

test('education and personal-data topics cover every main functional group with curated ideas', () => {
  assert.match(seed, /'education-self-development', '교육 \/ 자기계발'/);
  assert.match(seed, /'personal-data-digital-society', '개인정보 \/ 디지털 사회'/);
  assert.ok(occurrences(ideaSection, /v_education_id, v_education_positive, 'POSITIVE'/g) >= 5);
  assert.ok(occurrences(ideaSection, /v_education_id, v_education_negative, 'NEGATIVE'/g) >= 5);
  assert.ok(occurrences(ideaSection, /v_education_id, v_education_cause, 'CAUSE'/g) >= 4);
  assert.ok(occurrences(ideaSection, /v_education_id, v_education_solution, 'SOLUTION'/g) >= 5);
  assert.ok(occurrences(ideaSection, /v_personal_id, v_personal_positive, 'POSITIVE'/g) >= 5);
  assert.ok(occurrences(ideaSection, /v_personal_id, v_personal_negative, 'NEGATIVE'/g) >= 5);
  assert.ok(occurrences(ideaSection, /v_personal_id, v_personal_cause, 'CAUSE'/g) >= 4);
  assert.ok(occurrences(ideaSection, /v_personal_id, v_personal_solution, 'SOLUTION'/g) >= 5);
});

test('each topic has enough scoped collocations, mapped reusable patterns, examples, and translation exercises', () => {
  assert.ok(occurrences(seed, /'education-self-development'/g) >= 24);
  assert.ok(occurrences(seed, /'personal-data-digital-society'/g) >= 23);
  assert.ok(occurrences(seed, /'education-self-development', '사고력을 기르다'/g) >= 1);
  assert.ok(occurrences(seed, /'personal-data-digital-society', '개인정보를 보호하다'/g) >= 1);
  assert.equal(occurrences(exerciseSection, /\(v_education_id,/g), 12);
  assert.equal(occurrences(exerciseSection, /\(v_personal_id,/g), 12);
  assert.ok(occurrences(exampleSection, /'education-self-development',/g) >= 23);
  assert.ok(occurrences(exampleSection, /'personal-data-digital-society',/g) >= 22);
  assert.match(seed, /if collocation_count < 18/);
  assert.match(seed, /if pattern_count < 10/);
  assert.match(seed, /if exercise_count < 12 or answer_count < 12/);
  assert.match(seed, /where not exists \(\n    select 1 from public\.q54_questions q/);
});

test('patterns are global records mapped per topic, and the Workbench only reads the exact topic mapping', () => {
  assert.match(mappingMigration, /create table if not exists public\.q54_topic_pattern_mappings/);
  assert.match(mappingMigration, /enable row level security/);
  assert.match(seed, /insert into public\.q54_topic_pattern_mappings/);
  assert.ok(occurrences(seed, /N은\/는 V-는 데 도움이 된다\./g) >= 3);
  assert.match(service, /q54_topic_pattern_mappings/);
  assert.match(service, /mappedPatternIds\.size \? availablePatterns\.filter/);
});

test('the question workbench renders Korean-Vietnamese examples for the selected pattern group', () => {
  assert.match(questionPage, /const examples = bundle\.examples\.filter/);
  assert.match(questionPage, /Ví dụ/);
  assert.match(questionPage, /example\.translation_vi/);
});
