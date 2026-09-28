import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
export const sourcePath = resolve(root, 'supabase/seed/sources/TOPIK_Q51_Q52_SEED_DATA.json');
export const outputPath = resolve(root, 'supabase/seed/topik_writing_51_52_seed.sql');

export function readSeedSource() {
  return JSON.parse(readFileSync(sourcePath, 'utf8'));
}

export function blankEntries(answers) {
  return Object.entries(answers || {}).map(([key, variants], index) => ({ key, order: index, variants }));
}

function assertCondition(issues, condition, message) {
  if (!condition) issues.push(message);
}

function validateExercise(item, issues) {
  assertCondition(issues, Boolean(item.source_key), 'Exercise missing source_key');
  assertCondition(issues, Boolean(item.body_ko?.trim()), item.source_key + ': missing body_ko');
  assertCondition(issues, Array.isArray(item.source_pages) && item.source_pages.length > 0, item.source_key + ': missing source_pages');
  assertCondition(issues, Array.isArray(item.answer_source_pages) && item.answer_source_pages.length > 0, item.source_key + ': missing answer_source_pages');
  assertCondition(issues, item.source_type === 'SOURCE_BOOK', item.source_key + ': source_type must be SOURCE_BOOK');
  assertCondition(issues, item.review_status === 'VERIFIED' || item.review_status === 'NEEDS_REVIEW', item.source_key + ': invalid review_status');
  assertCondition(issues, item.source_pages.every((page) => Number.isInteger(page) && page >= 228 && page <= 259), item.source_key + ': invalid source page');
  assertCondition(issues, item.answer_source_pages.every((page) => Number.isInteger(page) && page >= 341 && page <= 349), item.source_key + ': invalid answer source page');
  for (const blank of blankEntries(item.answers)) {
    assertCondition(issues, Array.isArray(blank.variants) && blank.variants.length > 0 && blank.variants.every((variant) => String(variant).trim()), item.source_key + ' ' + blank.key + ': missing source answer variant');
  }
}

export function exerciseRows51(seed) {
  return [
    ...seed.q51.section_practice.flatMap((group) => group.items.map((item) => ({
      ...item,
      source_key: group.source_key + '_' + item.no,
      exercise_group: 'SECTION_PRACTICE',
      intent_code: group.intent_code,
      title_ko: null,
      source_pages: group.source_pages,
      answer_source_pages: group.answer_source_pages,
    }))),
    ...seed.q51.mixed_practice.map((item) => ({ ...item, exercise_group: 'MIXED_PRACTICE', intent_code: null })),
  ];
}

export function validateSeedSource(seed) {
  const issues = [];
  const q51Exercises = exerciseRows51(seed);
  const q52Exercises = seed.q52.practice;
  const duplicates = (items) => items.filter((item, index) => items.indexOf(item) !== index);
  assertCondition(issues, seed.meta?.source_type === 'SOURCE_BOOK', 'meta.source_type must be SOURCE_BOOK');
  assertCondition(issues, seed.q51.intent_types.length === 7, 'Expected 7 Q51 intent groups');
  assertCondition(issues, seed.q51.section_practice.length === 7, 'Expected 7 Q51 section practice groups');
  assertCondition(issues, seed.q51.mixed_practice.length === 21, 'Expected 21 Q51 mixed exercises');
  assertCondition(issues, seed.q52.relation_types.length === 9, 'Expected 9 Q52 relation groups');
  assertCondition(issues, seed.q52.practice.length === 31, 'Expected 31 Q52 practice exercises');
  assertCondition(issues, duplicates(seed.q51.intent_types.map((item) => item.code)).length === 0, 'Duplicate Q51 intent code');
  assertCondition(issues, duplicates(seed.q52.relation_types.map((item) => item.code)).length === 0, 'Duplicate Q52 relation code');
  assertCondition(issues, duplicates([...q51Exercises, ...q52Exercises].map((item) => item.source_key)).length === 0, 'Duplicate exercise source_key');
  for (const item of q51Exercises) validateExercise(item, issues);
  for (const item of q52Exercises) validateExercise(item, issues);
  for (const intent of seed.q51.intent_types) {
    for (const [kind, patterns] of [['PREFERRED', intent.preferred_patterns], ['ALTERNATIVE', intent.alternative_patterns], ['PAIRED', intent.paired_patterns]]) {
      for (const pattern of patterns) assertCondition(issues, Boolean(pattern?.trim()), 'Empty Q51 pattern in ' + intent.code);
      assertCondition(issues, duplicates(patterns).length === 0, 'Duplicate ' + kind + ' Q51 pattern in ' + intent.code);
    }
  }
  for (const relation of seed.q52.relation_types) {
    for (const pattern of relation.patterns) assertCondition(issues, Boolean(pattern?.trim()), 'Empty Q52 pattern in ' + relation.code);
    assertCondition(issues, duplicates(relation.patterns).length === 0, 'Duplicate Q52 pattern in ' + relation.code);
  }
  return {
    issues,
    counts: {
      q51Intents: seed.q51.intent_types.length,
      q51SectionGroups: seed.q51.section_practice.length,
      q51SectionExercises: q51Exercises.filter((item) => item.exercise_group === 'SECTION_PRACTICE').length,
      q51MixedExercises: seed.q51.mixed_practice.length,
      q51Blanks: q51Exercises.reduce((total, item) => total + blankEntries(item.answers).length, 0),
      q52Relations: seed.q52.relation_types.length,
      q52Exercises: q52Exercises.length,
      q52Blanks: q52Exercises.reduce((total, item) => total + blankEntries(item.answers).length, 0),
    },
  };
}

function sql(value) {
  if (value === null || value === undefined) return 'null';
  if (Array.isArray(value)) return 'array[' + value.map(sql).join(', ') + ']';
  return "'" + String(value).replaceAll("'", "''") + "'";
}

function json(value) {
  return sql(JSON.stringify(value)) + '::jsonb';
}

function values(rows) {
  return rows.map((row) => '  (' + row.join(', ') + ')').join(',\n');
}

function pages(item) {
  return 'array[' + item.source_pages.map(Number).join(', ') + ']';
}

function answerPages(item) {
  return 'array[' + item.answer_source_pages.map(Number).join(', ') + ']';
}

function sourceReference(sourceKey) {
  return '(select id from public.topik_sources where source_key = ' + sql(sourceKey) + ')';
}

function exerciseReference(questionNo, sourceKey) {
  return '(select id from public.topik_writing_' + questionNo + '_exercises where source_key = ' + sql(sourceKey) + ')';
}

function validationBlock() {
  return [
    'do $$',
    'declare q51_intent_count integer; q51_section_group_count integer; q51_mixed_count integer; q52_relation_count integer; q52_exercise_count integer; invalid_blank_count integer;',
    'begin',
    "  select count(*) into q51_intent_count from public.topik_writing_51_intents where source_type = 'SOURCE_BOOK';",
    "  select count(distinct intent_code) into q51_section_group_count from public.topik_writing_51_exercises where exercise_group = 'SECTION_PRACTICE' and source_type = 'SOURCE_BOOK';",
    "  select count(*) into q51_mixed_count from public.topik_writing_51_exercises where exercise_group = 'MIXED_PRACTICE' and source_type = 'SOURCE_BOOK';",
    "  select count(*) into q52_relation_count from public.topik_writing_52_relations where source_type = 'SOURCE_BOOK';",
    "  select count(*) into q52_exercise_count from public.topik_writing_52_exercises where source_type = 'SOURCE_BOOK';",
    "  select count(*) into invalid_blank_count from (select e.id from public.topik_writing_51_exercises e left join public.topik_writing_51_blanks b on b.exercise_id = e.id where e.source_type = 'SOURCE_BOOK' group by e.id, e.blank_count having e.blank_count <> count(b.id) union all select e.id from public.topik_writing_52_exercises e left join public.topik_writing_52_blanks b on b.exercise_id = e.id where e.source_type = 'SOURCE_BOOK' group by e.id, e.blank_count having e.blank_count <> count(b.id)) invalid;",
    "  if q51_intent_count <> 7 or q51_section_group_count <> 7 or q51_mixed_count <> 21 or q52_relation_count <> 9 or q52_exercise_count <> 31 or invalid_blank_count <> 0 then raise exception 'TOPIK Writing 51-52 seed validation failed: intents %, section groups %, mixed %, relations %, q52 %, invalid blanks %', q51_intent_count, q51_section_group_count, q51_mixed_count, q52_relation_count, q52_exercise_count, invalid_blank_count; end if;",
    'end $$;',
  ].join('\n');
}

export function generateSeedSql(seed) {
  const sourceKey = 'TOPIK_3_4_PHUONG_ANH_B11_2';
  const q51Exercises = exerciseRows51(seed);
  const q52Exercises = seed.q52.practice;
  const lines = [
    '-- Generated from seed/sources/TOPIK_Q51_Q52_SEED_DATA.json. Do not hand-edit source answers.',
    '-- Regenerate with: node scripts/topikWriting5152Seed.mjs',
    'begin;',
    '',
    "insert into public.topik_sources(source_key, title, edition, scope, notes) values (" + sql(sourceKey) + ', ' + sql(seed.meta.source_title) + ', ' + sql(seed.meta.source_file) + ", 'TOPIK II Writing 51-52', " + sql(seed.meta.fidelity_note) + ') on conflict (source_key) do update set title = excluded.title, edition = excluded.edition, scope = excluded.scope, notes = excluded.notes;',
    '',
    'insert into public.topik_writing_51_intents(code, name_vi, name_ko, sort_order, source_type, source_pages, status) values',
    values(seed.q51.intent_types.map((item, index) => [sql(item.code), sql(item.name_vi), sql(item.name_ko), index, sql(seed.meta.source_type), pages(item), sql('PUBLISHED')])),
    'on conflict (code) do update set name_vi = excluded.name_vi, name_ko = excluded.name_ko, sort_order = excluded.sort_order, source_type = excluded.source_type, source_pages = excluded.source_pages, status = excluded.status;',
    '',
    "delete from public.topik_writing_51_patterns where source_type = 'SOURCE_BOOK';",
    'insert into public.topik_writing_51_patterns(intent_id, pattern_ko, pattern_kind, sort_order, source_type, source_pages, status)',
    "select i.id, source.pattern_ko, source.pattern_kind, source.sort_order, 'SOURCE_BOOK', source.source_pages, 'PUBLISHED'",
    'from (values',
    values(seed.q51.intent_types.flatMap((intent) => [
      ...intent.preferred_patterns.map((pattern, index) => [sql(intent.code), sql(pattern), sql('PREFERRED'), index, pages(intent)]),
      ...intent.alternative_patterns.map((pattern, index) => [sql(intent.code), sql(pattern), sql('ALTERNATIVE'), index, pages(intent)]),
      ...intent.paired_patterns.map((pattern, index) => [sql(intent.code), sql(pattern), sql('PAIRED'), index, pages(intent)]),
    ])),
    ') as source(intent_code, pattern_ko, pattern_kind, sort_order, source_pages)',
    'join public.topik_writing_51_intents i on i.code = source.intent_code;',
    '',
    'insert into public.topik_writing_52_relations(code, name_vi, name_ko, sort_order, source_type, source_pages, status) values',
    values(seed.q52.relation_types.map((item, index) => [sql(item.code), sql(item.name_vi), sql(item.name_ko), index, sql(seed.meta.source_type), pages(item), sql('PUBLISHED')])),
    'on conflict (code) do update set name_vi = excluded.name_vi, name_ko = excluded.name_ko, sort_order = excluded.sort_order, source_type = excluded.source_type, source_pages = excluded.source_pages, status = excluded.status;',
    '',
    "delete from public.topik_writing_52_patterns where source_type = 'SOURCE_BOOK';",
    'insert into public.topik_writing_52_patterns(relation_id, pattern_ko, sort_order, source_type, source_pages, status)',
    "select r.id, source.pattern_ko, source.sort_order, 'SOURCE_BOOK', source.source_pages, 'PUBLISHED'",
    'from (values',
    values(seed.q52.relation_types.flatMap((relation) => relation.patterns.map((pattern, index) => [sql(relation.code), sql(pattern), index, pages(relation)]))),
    ') as source(relation_code, pattern_ko, sort_order, source_pages)',
    'join public.topik_writing_52_relations r on r.code = source.relation_code;',
    '',
    'insert into public.topik_writing_51_exercises(source_key, source_id, exercise_group, intent_code, title_ko, body_ko, blank_count, source_pages, answer_source_pages, source_type, status, review_status) values',
    values(q51Exercises.map((item) => [sql(item.source_key), sourceReference(sourceKey), sql(item.exercise_group), sql(item.intent_code), sql(item.title_ko), sql(item.body_ko), blankEntries(item.answers).length, pages(item), answerPages(item), sql(item.source_type), sql('PUBLISHED'), sql(item.review_status)])),
    'on conflict (source_key) do update set source_id = excluded.source_id, exercise_group = excluded.exercise_group, intent_code = excluded.intent_code, title_ko = excluded.title_ko, body_ko = excluded.body_ko, blank_count = excluded.blank_count, source_pages = excluded.source_pages, answer_source_pages = excluded.answer_source_pages, source_type = excluded.source_type, status = excluded.status, review_status = excluded.review_status;',
    '',
    "delete from public.topik_writing_51_blanks b using public.topik_writing_51_exercises e where e.id = b.exercise_id and e.source_type = 'SOURCE_BOOK';",
    'insert into public.topik_writing_51_blanks(exercise_id, blank_key, blank_order, source_answer_variants, review_note) values',
    values(q51Exercises.flatMap((item) => blankEntries(item.answers).map((blank) => [exerciseReference(51, item.source_key), sql(blank.key), blank.order, json(blank.variants), sql(item.review_note)]))),
    ';',
    '',
    'insert into public.topik_writing_52_exercises(source_key, source_id, title_ko, body_ko, blank_count, source_pages, answer_source_pages, source_type, status, review_status) values',
    values(q52Exercises.map((item) => [sql(item.source_key), sourceReference(sourceKey), sql(item.title_ko), sql(item.body_ko), blankEntries(item.answers).length, pages(item), answerPages(item), sql(item.source_type), sql('PUBLISHED'), sql(item.review_status)])),
    'on conflict (source_key) do update set source_id = excluded.source_id, title_ko = excluded.title_ko, body_ko = excluded.body_ko, blank_count = excluded.blank_count, source_pages = excluded.source_pages, answer_source_pages = excluded.answer_source_pages, source_type = excluded.source_type, status = excluded.status, review_status = excluded.review_status;',
    '',
    "delete from public.topik_writing_52_blanks b using public.topik_writing_52_exercises e where e.id = b.exercise_id and e.source_type = 'SOURCE_BOOK';",
    'insert into public.topik_writing_52_blanks(exercise_id, blank_key, blank_order, source_answer_variants, relation_code, relation_tag_origin, review_note) values',
    values(q52Exercises.flatMap((item) => blankEntries(item.answers).map((blank) => [exerciseReference(52, item.source_key), sql(blank.key), blank.order, json(blank.variants), 'null', 'null', sql(item.review_note)]))),
    ';',
    '',
    validationBlock(),
    '',
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
