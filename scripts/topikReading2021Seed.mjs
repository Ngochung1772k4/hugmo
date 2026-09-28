import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
export const sourcePath = resolve(root, 'supabase/seed/sources/TOPIK_READING_20_21_SEED_DATA.json');
export const outputPath = resolve(root, 'supabase/seed/topik_reading_20_21_seed.sql');

export function readSeedSource() {
  return JSON.parse(readFileSync(sourcePath, 'utf8'));
}

function duplicateValues(values) {
  return values.filter((value, index) => values.indexOf(value) !== index);
}

function sourceLocations(item, kind) {
  return (item.source_locations || []).filter((location) => location.kind === kind);
}

function normalizeForIdiomMatch(value) {
  return String(value).replaceAll('을 ', ' ').replaceAll('를 ', ' ').replaceAll('췄', '추').replaceAll('섰', '서').replaceAll('었', '').replace(/(고|게|는|은|을|서|야|다)$/u, '').replace(/\s+/gu, ' ').trim();
}

function commonPrefixLength(left, right) {
  let index = 0;
  while (index < left.length && index < right.length && left[index] === right[index]) index += 1;
  return index;
}

export function findIdiomForOption(idioms, option, sourcePage) {
  const optionKey = normalizeForIdiomMatch(option);
  const candidates = idioms.filter((idiom) => sourceLocations(idiom, 'Q21_OPTION').some((location) => location.page === sourcePage)).map((idiom) => {
    const expressionKey = normalizeForIdiomMatch(idiom.expression_ko);
    return { idiom, score: commonPrefixLength(optionKey, expressionKey), floor: Math.min(optionKey.length, expressionKey.length) - 1 };
  }).filter((candidate) => candidate.score >= candidate.floor).sort((left, right) => right.score - left.score);
  return candidates[0]?.idiom || null;
}

export function validateSeedSource(seed) {
  const issues = [];
  const assert = (condition, message) => { if (!condition) issues.push(message); };
  const q20 = seed.q20?.exercises || [];
  const q21 = seed.q21?.exercises || [];
  const idioms = seed.q21?.idioms || [];
  const counts = {
    groups: seed.q21?.memory_groups?.length || 0,
    idioms: idioms.length,
    priorityS: idioms.filter((item) => item.priority === 'S').length,
    priorityA: idioms.filter((item) => item.priority === 'A').length,
    priorityB: idioms.filter((item) => item.priority === 'B').length,
    needsGloss: idioms.filter((item) => item.review_status === 'NEEDS_GLOSS').length,
    needsReview: idioms.filter((item) => item.review_status === 'NEEDS_REVIEW').length,
    q20Exercises: q20.length,
    q21Exercises: q21.length,
  };
  assert(seed.meta?.source_type === 'SOURCE_BOOK', 'meta.source_type must be SOURCE_BOOK');
  assert(seed.q20?.skill_code === 'TOPIC_MAIN_IDEA', 'Q20 skill code mismatch');
  assert(seed.q21?.skill_code === 'IDIOM_IN_CONTEXT', 'Q21 skill code mismatch');
  assert(counts.groups === 11, 'Expected 11 idiom memory groups');
  assert(counts.idioms === 88, 'Expected 88 idioms');
  assert(counts.priorityS === 7 && counts.priorityA === 22 && counts.priorityB === 59, 'Unexpected S/A/B idiom priority counts');
  assert(counts.needsGloss === 13, 'Expected 13 NEEDS_GLOSS idioms');
  assert(counts.needsReview === 1, 'Expected 1 NEEDS_REVIEW idiom');
  assert(q20.length === 8 && q21.length === 8, 'Expected eight source sets for each question pair');
  assert(duplicateValues(seed.q21.memory_groups.map((group) => group.code)).length === 0, 'Duplicate memory-group code');
  assert(duplicateValues(idioms.map((idiom) => idiom.expression_ko)).length === 0, 'Duplicate idiom expression');
  assert(duplicateValues([...q20, ...q21].map((exercise) => exercise.source_key)).length === 0, 'Duplicate source exercise key');
  for (const idiom of idioms) {
    assert((idiom.source_locations || []).length > 0, idiom.expression_ko + ': missing source location');
    if (idiom.review_status === 'NEEDS_GLOSS') assert(idiom.meaning_vi_source === null, idiom.expression_ko + ': NEEDS_GLOSS must not have source meaning');
    if (idiom.priority === 'B') assert(sourceLocations(idiom, 'IDIOM_GLOSSARY').length > 0, idiom.expression_ko + ': B idiom must occur in glossary');
  }
  const validatePair = (exercise, firstNo, targetNo) => {
    assert(Number.isInteger(exercise.source_page), exercise.source_key + ': missing source page');
    for (const [questionNo, question] of [[firstNo, exercise['q' + firstNo]], [targetNo, exercise['q' + targetNo]]]) {
      assert(Array.isArray(question?.options) && question.options.length === 4, exercise.source_key + ' Q' + questionNo + ': must have four options');
      assert(Number.isInteger(question?.answer_index) && question.answer_index >= 1 && question.answer_index <= 4, exercise.source_key + ' Q' + questionNo + ': invalid answer index');
    }
  };
  q20.forEach((exercise) => validatePair(exercise, 19, 20));
  q21.forEach((exercise) => validatePair(exercise, 21, 22));
  for (const exercise of q21) {
    const correctOption = exercise.q21.options[exercise.q21.answer_index - 1];
    assert(Boolean(findIdiomForOption(idioms, correctOption, exercise.source_page)), exercise.source_key + ': correct Q21 option is not linked to an idiom');
    for (const option of exercise.q21.options) assert(Boolean(findIdiomForOption(idioms, option, exercise.source_page)), exercise.source_key + ': Q21 option is not linked to an idiom');
  }
  const expectedQ20 = [2, 1, 1, 4, 3, 3, 1, 4];
  const expectedQ21 = [2, 3, 3, 2, 2, 4, 4, 2];
  assert(q20.every((exercise, index) => exercise.q20.answer_index === expectedQ20[index]), 'Q20 source answer key mismatch');
  assert(q21.every((exercise, index) => exercise.q21.answer_index === expectedQ21[index]), 'Q21 source answer key mismatch');
  const q21CorrectExpressions = q21.map((exercise) => findIdiomForOption(idioms, exercise.q21.options[exercise.q21.answer_index - 1], exercise.source_page)?.expression_ko);
  for (const idiom of idioms.filter((item) => item.priority === 'S')) assert(q21CorrectExpressions.includes(idiom.expression_ko), idiom.expression_ko + ': S idiom must be a correct Q21 answer');
  for (const idiom of idioms.filter((item) => item.priority === 'A')) assert(sourceLocations(idiom, 'Q21_OPTION').length > 0, idiom.expression_ko + ': A idiom must occur in a Q21 option');
  return { issues, counts };
}

function sql(value) {
  if (value === null || value === undefined) return 'null';
  return "'" + String(value).replaceAll("'", "''") + "'";
}

function json(value) {
  return sql(JSON.stringify(value)) + '::jsonb';
}

function rows(values) {
  return values.map((value) => '  (' + value.join(', ') + ')').join(',\n');
}

function exerciseRef(sourceKey) {
  return "(select id from public.topik_reading_20_21_exercises where source_key = " + sql(sourceKey) + ")";
}

function idiomRef(expressionKo) {
  return expressionKo ? "(select id from public.topik_reading_idioms where expression_ko = " + sql(expressionKo) + ")" : 'null';
}

function uuidArray(expressions) {
  return 'array[' + expressions.map(idiomRef).join(', ') + ']::uuid[]';
}

function questionRows(seed, exercises, firstNo, targetNo) {
  const targetSkill = targetNo === 20 ? 'TOPIC_MAIN_IDEA' : 'IDIOM_IN_CONTEXT';
  const firstSkill = firstNo === 19 ? 'CONNECTIVE_IN_CONTEXT' : 'CONTENT_MATCH';
  return exercises.flatMap((exercise) => {
    const target = exercise['q' + targetNo];
    const first = exercise['q' + firstNo];
    const mappedIdioms = targetNo === 21 ? target.options.map((option) => findIdiomForOption(seed.q21.idioms, option, exercise.source_page)?.expression_ko || null) : [];
    return [
      [exerciseRef(exercise.source_key), firstNo, sql(firstSkill), sql(first.prompt || null), json(first.options), first.answer_index, 'null', 'array[]::uuid[]'],
      [exerciseRef(exercise.source_key), targetNo, sql(targetSkill), sql(target.prompt || null), json(target.options), target.answer_index, targetNo === 21 ? idiomRef(mappedIdioms[target.answer_index - 1]) : 'null', targetNo === 21 ? uuidArray(mappedIdioms) : 'array[]::uuid[]'],
    ];
  });
}

function validationBlock() {
  return [
    'do $$',
    'declare group_count integer; idiom_count integer; s_count integer; a_count integer; b_count integer; gloss_count integer; review_count integer; q20_set_count integer; q21_set_count integer; invalid_question_count integer;',
    'begin',
    '  select count(*) into group_count from public.topik_reading_idiom_groups;',
    "  select count(*) into idiom_count from public.topik_reading_idioms where source_type = 'SOURCE_BOOK';",
    "  select count(*) filter (where priority = 'S'), count(*) filter (where priority = 'A'), count(*) filter (where priority = 'B'), count(*) filter (where review_status = 'NEEDS_GLOSS'), count(*) filter (where review_status = 'NEEDS_REVIEW') into s_count, a_count, b_count, gloss_count, review_count from public.topik_reading_idioms where source_type = 'SOURCE_BOOK';",
    "  select count(*) into q20_set_count from public.topik_reading_20_21_exercises where question_pair = '19_20' and source_type = 'SOURCE_BOOK';",
    "  select count(*) into q21_set_count from public.topik_reading_20_21_exercises where question_pair = '21_22' and source_type = 'SOURCE_BOOK';",
    '  select count(*) into invalid_question_count from public.topik_reading_mc_questions where jsonb_array_length(options) <> 4 or answer_index not between 1 and 4;',
    "  if group_count <> 11 or idiom_count <> 88 or s_count <> 7 or a_count <> 22 or b_count <> 59 or gloss_count <> 13 or review_count <> 1 or q20_set_count <> 8 or q21_set_count <> 8 or invalid_question_count <> 0 then raise exception 'TOPIK Reading 20-21 seed validation failed: groups %, idioms %, S/A/B %/%/%, gloss %, review %, Q20 %, Q21 %, invalid questions %', group_count, idiom_count, s_count, a_count, b_count, gloss_count, review_count, q20_set_count, q21_set_count, invalid_question_count; end if;",
    'end $$;',
  ].join('\n');
}

export function generateSeedSql(seed) {
  const sourceKey = 'TOPIK_3_4_PHUONG_ANH_READING_20_21';
  const q20 = seed.q20.exercises;
  const q21 = seed.q21.exercises;
  const aliases = seed.q21.idioms.flatMap((idiom) => (idiom.aliases_ko || []).map((alias) => [idiomRef(idiom.expression_ko), sql(alias)]));
  const lines = [
    '-- Generated from seed/sources/TOPIK_READING_20_21_SEED_DATA.json. Do not hand-edit canonical source data.',
    '-- Regenerate with: node scripts/topikReading2021Seed.mjs',
    'begin;',
    "insert into public.topik_sources(source_key, title, edition, scope, notes) values (" + sql(sourceKey) + ', ' + sql(seed.meta.source_title) + ', ' + sql(seed.meta.source_file) + ", 'TOPIK II Reading 20-21', " + sql(seed.meta.scope_note) + ') on conflict (source_key) do update set title = excluded.title, edition = excluded.edition, scope = excluded.scope, notes = excluded.notes;',
    '',
    'insert into public.topik_reading_idiom_groups(code, name_ko, name_vi, sort_order) values',
    rows(seed.q21.memory_groups.map((group) => [sql(group.code), sql(group.name_ko), sql(group.name_vi), group.sort_order])),
    'on conflict (code) do update set name_ko = excluded.name_ko, name_vi = excluded.name_vi, sort_order = excluded.sort_order;',
    '',
    'insert into public.topik_reading_idioms(expression_ko, meaning_vi_source, memory_group_code, body_part, core_verb, core_verb_vi_editorial, priority, source_type, review_status, review_note, status) values',
    rows(seed.q21.idioms.map((idiom) => [sql(idiom.expression_ko), sql(idiom.meaning_vi_source), sql(idiom.memory_group), sql(idiom.body_part), sql(idiom.core_verb), sql(idiom.core_verb_vi_editorial), sql(idiom.priority), sql(idiom.source_type), sql(idiom.review_status), sql(idiom.review_note), sql('PUBLISHED')])),
    'on conflict (expression_ko) do update set meaning_vi_source = excluded.meaning_vi_source, memory_group_code = excluded.memory_group_code, body_part = excluded.body_part, core_verb = excluded.core_verb, core_verb_vi_editorial = excluded.core_verb_vi_editorial, priority = excluded.priority, source_type = excluded.source_type, review_status = excluded.review_status, review_note = excluded.review_note, status = excluded.status;',
    '',
    aliases.length ? 'insert into public.topik_reading_idiom_aliases(idiom_id, alias_ko) values\n' + rows(aliases) + '\non conflict (idiom_id, alias_ko) do nothing;' : '-- Canonical source has no idiom aliases.',
    '',
    'insert into public.topik_reading_source_locations(entity_type, entity_id, source_page, source_kind) values',
    rows(seed.q21.idioms.flatMap((idiom) => idiom.source_locations.map((location) => [sql('IDIOM'), idiomRef(idiom.expression_ko), location.page, sql(location.kind)]))),
    'on conflict (entity_type, entity_id, source_page, source_kind) do nothing;',
    '',
    'insert into public.topik_reading_20_21_exercises(source_key, source_id, question_pair, set_type, source_page, passage_ko, status, source_type) values',
    rows([...q20.map((exercise) => [sql(exercise.source_key), "(select id from public.topik_sources where source_key = " + sql(sourceKey) + ')', sql('19_20'), sql(exercise.set), exercise.source_page, sql(exercise.passage_ko), sql('PUBLISHED'), sql(seed.meta.source_type)]), ...q21.map((exercise) => [sql(exercise.source_key), "(select id from public.topik_sources where source_key = " + sql(sourceKey) + ')', sql('21_22'), sql(exercise.set), exercise.source_page, sql(exercise.passage_ko), sql('PUBLISHED'), sql(seed.meta.source_type)])]),
    'on conflict (source_key) do update set source_id = excluded.source_id, question_pair = excluded.question_pair, set_type = excluded.set_type, source_page = excluded.source_page, passage_ko = excluded.passage_ko, status = excluded.status, source_type = excluded.source_type;',
    '',
    'insert into public.topik_reading_mc_questions(exercise_id, question_no, skill_code, prompt_ko, options, answer_index, correct_idiom_id, option_idiom_ids) values',
    rows([...questionRows(seed, q20, 19, 20), ...questionRows(seed, q21, 21, 22)]),
    'on conflict (exercise_id, question_no) do update set skill_code = excluded.skill_code, prompt_ko = excluded.prompt_ko, options = excluded.options, answer_index = excluded.answer_index, correct_idiom_id = excluded.correct_idiom_id, option_idiom_ids = excluded.option_idiom_ids;',
    '',
    validationBlock(),
    'commit;',
    '',
  ];
  return lines.join('\n');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const seed = readSeedSource();
  const report = validateSeedSource(seed);
  if (report.issues.length) throw new Error(report.issues.join('\n'));
  writeFileSync(outputPath, generateSeedSql(seed), 'utf8');
  console.log(JSON.stringify(report.counts));
}
