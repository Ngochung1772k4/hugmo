import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const sourcePath = resolve(root, 'supabase/seed/TOPIK_READING_21_EDITORIAL_GLOSSES.json');
const outputPath = resolve(root, 'supabase/seed/topik_reading_21_editorial_glosses.sql');

export function readEditorialGlosses() {
  return JSON.parse(readFileSync(sourcePath, 'utf8'));
}

export function validateEditorialGlosses(data) {
  const expressions = data.glosses.map((item) => item.expression_ko);
  const issues = [];
  if (data.source_type !== 'EDITORIAL_MANUAL') issues.push('Editorial source type must be EDITORIAL_MANUAL');
  if (data.glosses.length !== 13) issues.push('Expected 13 editorial Q21 glosses');
  if (new Set(expressions).size !== expressions.length) issues.push('Duplicate editorial gloss expression');
  if (data.glosses.some((item) => !item.meaning_vi_editorial?.trim())) issues.push('Editorial meaning must not be empty');
  return { issues, count: data.glosses.length };
}

function sql(value) {
  return "'" + String(value).replaceAll("'", "''") + "'";
}

export function generateEditorialGlossesSql(data) {
  const values = data.glosses.map((item) => "  ((select id from public.topik_reading_idioms where expression_ko = " + sql(item.expression_ko) + '), ' + sql(item.meaning_vi_editorial) + ", 'EDITORIAL_MANUAL', 'PUBLISHED', " + sql(data.note) + ')').join(',\n');
  return [
    '-- Generated from TOPIK_READING_21_EDITORIAL_GLOSSES.json.',
    '-- Editorial meanings are deliberately separate from source-book meanings.',
    'begin;',
    'insert into public.topik_reading_idiom_editorial_glosses(idiom_id, meaning_vi_editorial, source_type, status, note) values',
    values,
    'on conflict (idiom_id) do update set meaning_vi_editorial = excluded.meaning_vi_editorial, source_type = excluded.source_type, status = excluded.status, note = excluded.note, updated_at = now();',
    "do $$ begin if (select count(*) from public.topik_reading_idiom_editorial_glosses where source_type = 'EDITORIAL_MANUAL' and status = 'PUBLISHED') <> 13 then raise exception 'Expected 13 published Q21 editorial glosses'; end if; end $$;",
    'commit;',
    '',
  ].join('\n');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const data = readEditorialGlosses();
  const report = validateEditorialGlosses(data);
  if (report.issues.length) throw new Error(report.issues.join('\n'));
  writeFileSync(outputPath, generateEditorialGlossesSql(data), 'utf8');
  console.log(JSON.stringify(report));
}
