import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import ts from 'typescript';

const source = readFileSync(new URL('../src/utils/studySelection.ts', import.meta.url), 'utf8');
const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { getStudyCardLimit, selectStudyCards } = await import(`data:text/javascript,${encodeURIComponent(output)}`);

const cards = [
  { id: 'one', study_set_id: 'set', term: 'one', meaning: 'one' },
  { id: 'two', study_set_id: 'set', term: 'two', meaning: 'two' },
  { id: 'three', study_set_id: 'set', term: 'three', meaning: 'three' },
];

test('study limit uses the whole set by default and clamps invalid values', () => {
  assert.equal(getStudyCardLimit('', 33), 33);
  assert.equal(getStudyCardLimit('?limit=10', 33), 10);
  assert.equal(getStudyCardLimit('?limit=99', 33), 33);
  assert.equal(getStudyCardLimit('?limit=0', 33), 33);
});

test('study selection returns exactly the requested number of unique cards', () => {
  const selected = selectStudyCards(cards, 2);
  assert.equal(selected.length, 2);
  assert.equal(new Set(selected.map((card) => card.id)).size, 2);
  assert.deepEqual(selectStudyCards(cards, 3).map((card) => card.id), ['one', 'two', 'three']);
});
