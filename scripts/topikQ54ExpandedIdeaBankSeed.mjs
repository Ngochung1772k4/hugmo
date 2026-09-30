import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
export const sourcePath = resolve(root, 'supabase/seed/sources/TOPIK_Q54_IDEA_BANK_SEED_DATA.json');
export const outputPath = resolve(root, 'supabase/seed/topik_writing_q54_expanded_idea_bank_seed.sql');

const topicSlugByCode = { ENVIRONMENT: 'environment', EDUCATION: 'education-self-development', PRIVACY_DIGITAL: 'personal-data-digital-society' };
const groups = ['POSITIVE', 'NEGATIVE', 'CAUSE', 'SOLUTION'];

export function readSeedSource() { return JSON.parse(readFileSync(sourcePath, 'utf8')); }

export function validateExpandedIdeaSeed(seed) {
  const ideas = seed.ideas || [];
  const issues = [];
  const assert = (condition, message) => { if (!condition) issues.push(message); };
  const expectedScopes = ['GLOBAL', 'ENVIRONMENT', 'EDUCATION', 'PRIVACY_DIGITAL'];
  assert(seed.meta?.expected_total === 96, 'meta.expected_total must be 96');
  assert(ideas.length === 96, 'Expected 96 ideas');
  assert(new Set(ideas.map((idea) => idea.seed_key)).size === ideas.length, 'Duplicate seed_key');
  for (const scope of expectedScopes) {
    const scopeIdeas = scope === 'GLOBAL' ? ideas.filter((idea) => idea.scope === 'GLOBAL' && idea.topic_code === null) : ideas.filter((idea) => idea.scope === 'TOPIC' && idea.topic_code === scope);
    assert(scopeIdeas.length === 24, scope + ': expected 24 ideas');
    for (const group of groups) assert(scopeIdeas.filter((idea) => idea.functional_group === group).length === 6, scope + '/' + group + ': expected 6 ideas');
  }
  for (const idea of ideas) {
    assert(idea.source_type === 'MANUAL' && idea.status === 'PUBLISHED', idea.seed_key + ': must be MANUAL/PUBLISHED');
    assert(Boolean(idea.keyword_ko?.trim()) && Boolean(idea.keyword_vi?.trim()), idea.seed_key + ': missing keyword');
    assert(Boolean(idea.reason_ko?.trim()) && Boolean(idea.reason_vi?.trim()), idea.seed_key + ': missing reason');
    assert(Boolean(idea.result_ko?.trim()) && Boolean(idea.result_vi?.trim()), idea.seed_key + ': missing result');
    assert(Array.isArray(idea.logic_chain_ko) && idea.logic_chain_ko.length >= 3 && idea.logic_chain_ko.length <= 4, idea.seed_key + ': invalid Korean logic chain');
    assert(Array.isArray(idea.logic_chain_vi) && idea.logic_chain_vi.length === idea.logic_chain_ko?.length, idea.seed_key + ': mismatched Vietnamese logic chain');
    assert(Array.isArray(idea.recommended_collocations) && idea.recommended_collocations.length >= 2 && idea.recommended_collocations.length <= 4, idea.seed_key + ': invalid collocations');
    assert(Number.isInteger(idea.reuse_score) && idea.reuse_score >= 1 && idea.reuse_score <= 5, idea.seed_key + ': invalid reuse score');
    assert(['EASY', 'NORMAL', 'ADVANCED'].includes(idea.difficulty), idea.seed_key + ': invalid difficulty');
    assert(groups.includes(idea.functional_group), idea.seed_key + ': invalid functional group');
    assert(Array.isArray(idea.requirement_types) && idea.requirement_types.length > 0, idea.seed_key + ': missing requirement types');
    assert(idea.scope === 'GLOBAL' ? idea.topic_code === null : Object.hasOwn(topicSlugByCode, idea.topic_code), idea.seed_key + ': invalid scope/topic mapping');
  }
  return { issues, counts: Object.fromEntries(expectedScopes.map((scope) => [scope, scope === 'GLOBAL' ? ideas.filter((idea) => idea.scope === 'GLOBAL').length : ideas.filter((idea) => idea.topic_code === scope).length])) };
}

const sql = (value) => value === null || value === undefined ? 'null' : "'" + String(value).replaceAll("'", "''") + "'";
const json = (value) => sql(JSON.stringify(value)) + '::jsonb';
const array = (values) => 'array[' + values.map(sql).join(', ') + ']::text[]';
const topicRef = (code) => code ? "(select id from public.q54_topics where slug = " + sql(topicSlugByCode[code]) + ')' : 'null';

export function generateExpandedIdeaSeedSql(seed) {
  const values = seed.ideas.map((idea) => [sql(idea.seed_key), sql(idea.scope), topicRef(idea.topic_code), 'null', sql(idea.functional_group), array(idea.requirement_types), sql(idea.keyword_ko), sql(idea.keyword_vi), sql(idea.reason_ko), sql(idea.reason_vi), sql(idea.result_ko), sql(idea.result_vi), sql(idea.expansion_ko), sql(idea.expansion_vi), json(idea.logic_chain_ko), json(idea.logic_chain_vi), json(idea.recommended_collocations), idea.reuse_score, sql(idea.difficulty), json(idea.subtopic_tags), sql('PUBLIC'), sql(idea.status), sql(idea.source_type)].join(', ')).map((row) => '  (' + row + ')').join(',\n');
  return [
    '-- Generated from seed/sources/TOPIK_Q54_IDEA_BANK_SEED_DATA.json. Do not hand-edit canonical source data.',
    '-- Regenerate with: node scripts/topikQ54ExpandedIdeaBankSeed.mjs',
    'begin;',
    "do $$ begin if (select count(*) from public.q54_topics where slug in ('environment', 'education-self-development', 'personal-data-digital-society')) <> 3 then raise exception 'Q54 Expanded Idea Bank requires the three curated topics'; end if; end $$;",
    'insert into public.q54_ideas(seed_key, scope, topic_id, requirement_id, function_group, requirement_types, keyword_ko, keyword_vi, reason_ko, reason_vi, result_ko, result_vi, expansion_ko, expansion_vi, logic_chain_ko, logic_chain_vi, recommended_collocations, reuse_score, difficulty, subtopic_tags, visibility, status, source_type) values',
    values,
    'on conflict (seed_key) where seed_key is not null do update set scope = excluded.scope, topic_id = excluded.topic_id, requirement_id = excluded.requirement_id, function_group = excluded.function_group, requirement_types = excluded.requirement_types, keyword_ko = excluded.keyword_ko, keyword_vi = excluded.keyword_vi, reason_ko = excluded.reason_ko, reason_vi = excluded.reason_vi, result_ko = excluded.result_ko, result_vi = excluded.result_vi, expansion_ko = excluded.expansion_ko, expansion_vi = excluded.expansion_vi, logic_steps = excluded.logic_chain_ko, logic_chain_ko = excluded.logic_chain_ko, logic_chain_vi = excluded.logic_chain_vi, recommended_collocations = excluded.recommended_collocations, reuse_score = excluded.reuse_score, difficulty = excluded.difficulty, subtopic_tags = excluded.subtopic_tags, visibility = excluded.visibility, status = excluded.status, source_type = excluded.source_type, updated_at = now();',
    "update public.q54_ideas set logic_steps = logic_chain_ko where seed_key is not null and logic_chain_ko is not null;",
    "do $$ declare total_count integer; global_count integer; environment_count integer; education_count integer; privacy_count integer; invalid_group_count integer; begin select count(*) into total_count from public.q54_ideas where seed_key is not null; select count(*) into global_count from public.q54_ideas where seed_key is not null and scope = 'GLOBAL'; select count(*) into environment_count from public.q54_ideas i join public.q54_topics t on t.id = i.topic_id where i.seed_key is not null and t.slug = 'environment'; select count(*) into education_count from public.q54_ideas i join public.q54_topics t on t.id = i.topic_id where i.seed_key is not null and t.slug = 'education-self-development'; select count(*) into privacy_count from public.q54_ideas i join public.q54_topics t on t.id = i.topic_id where i.seed_key is not null and t.slug = 'personal-data-digital-society'; select count(*) into invalid_group_count from (select scope, coalesce(topic_id::text, 'GLOBAL') as bucket, function_group, count(*) as item_count from public.q54_ideas where seed_key is not null group by scope, coalesce(topic_id::text, 'GLOBAL'), function_group) counts where item_count <> 6; if total_count <> 96 or global_count <> 24 or environment_count <> 24 or education_count <> 24 or privacy_count <> 24 or invalid_group_count <> 0 then raise exception 'Q54 Expanded Idea Bank validation failed: total %, global %, environment %, education %, privacy %, invalid groups %', total_count, global_count, environment_count, education_count, privacy_count, invalid_group_count; end if; end $$;",
    'commit;',
    '',
  ].join('\n');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const seed = readSeedSource();
  const report = validateExpandedIdeaSeed(seed);
  if (report.issues.length) throw new Error(report.issues.join('\n'));
  writeFileSync(outputPath, generateExpandedIdeaSeedSql(seed), 'utf8');
  console.log(JSON.stringify(report.counts));
}
