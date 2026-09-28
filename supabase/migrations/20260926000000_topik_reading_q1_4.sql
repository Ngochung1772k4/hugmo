-- TOPIK II Reading questions 1-4 catalog and learner attempts.
create extension if not exists pgcrypto;

create table if not exists public.topik_sources (
  id uuid primary key default gen_random_uuid(),
  source_key text not null unique,
  title text not null,
  edition text,
  scope text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.topik_grammar (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  pattern_ko text not null,
  form_rule text,
  display_meaning_vi text not null,
  primary_category text not null,
  question_scope text not null check (question_scope in ('Q1_2', 'Q3_4', 'BOTH')),
  status text not null default 'PUBLISHED' check (status in ('DRAFT', 'REVIEWED', 'PUBLISHED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.topik_grammar_senses (
  id uuid primary key default gen_random_uuid(),
  grammar_id uuid not null references public.topik_grammar(id) on delete cascade,
  sense_key text not null unique,
  meaning_vi text not null,
  usage_note_vi text,
  constraints_vi text,
  category text not null,
  status text not null default 'PUBLISHED' check (status in ('DRAFT', 'REVIEWED', 'PUBLISHED'))
);

create table if not exists public.topik_examples (
  id uuid primary key default gen_random_uuid(),
  sense_id uuid not null references public.topik_grammar_senses(id) on delete cascade,
  sentence_ko text not null,
  translation_vi text,
  source_id uuid references public.topik_sources(id),
  source_page_printed text,
  source_item text,
  origin text not null check (origin in ('BOOK', 'ORIGINAL')),
  status text not null default 'PUBLISHED' check (status in ('DRAFT', 'REVIEWED', 'PUBLISHED')),
  unique (sense_id, sentence_ko)
);

create table if not exists public.topik_grammar_relations (
  id uuid primary key default gen_random_uuid(),
  left_sense_id uuid not null references public.topik_grammar_senses(id) on delete cascade,
  right_sense_id uuid not null references public.topik_grammar_senses(id) on delete cascade,
  relation_type text not null default 'SIMILAR_IN_CONTEXT',
  context_note_vi text not null,
  source_id uuid references public.topik_sources(id),
  source_page_printed text,
  source_item text,
  status text not null default 'PUBLISHED' check (status in ('DRAFT', 'REVIEWED', 'PUBLISHED')),
  check (left_sense_id <> right_sense_id),
  unique (left_sense_id, right_sense_id, relation_type)
);

create table if not exists public.topik_questions (
  id uuid primary key default gen_random_uuid(),
  source_key text not null unique,
  kind text not null check (kind in ('FILL_GRAMMAR', 'SIMILAR_GRAMMAR')),
  stem_ko text not null,
  target_text text,
  explanation_vi text not null,
  source_id uuid references public.topik_sources(id),
  source_page_printed text,
  source_section text not null,
  source_item text not null,
  status text not null default 'PUBLISHED' check (status in ('DRAFT', 'REVIEWED', 'PUBLISHED'))
);

create table if not exists public.topik_question_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.topik_questions(id) on delete cascade,
  position smallint not null check (position between 1 and 4),
  text_ko text not null,
  grammar_sense_id uuid references public.topik_grammar_senses(id),
  is_correct boolean not null default false,
  why_wrong_vi text,
  unique (question_id, position),
  unique (id, question_id)
);

create table if not exists public.topik_question_attempts (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id uuid not null references public.topik_questions(id) on delete cascade,
  selected_option_id uuid,
  is_correct boolean not null,
  mode text not null check (mode in ('FILL', 'SIMILAR', 'SPRINT', 'WRONG_RETRY')),
  answered_at timestamptz not null default now(),
  duration_ms integer check (duration_ms is null or duration_ms >= 0),
  constraint topik_attempt_selected_option_matches_question
    foreign key (selected_option_id, question_id)
    references public.topik_question_options(id, question_id)
    on delete restrict
);

create index if not exists idx_topik_grammar_scope on public.topik_grammar(question_scope, primary_category, status);
create index if not exists idx_topik_questions_kind on public.topik_questions(kind, status);
create index if not exists idx_topik_options_question on public.topik_question_options(question_id, position);
create index if not exists idx_topik_attempts_user_question on public.topik_question_attempts(user_id, question_id, answered_at desc);

alter table public.topik_sources enable row level security;
alter table public.topik_grammar enable row level security;
alter table public.topik_grammar_senses enable row level security;
alter table public.topik_examples enable row level security;
alter table public.topik_grammar_relations enable row level security;
alter table public.topik_questions enable row level security;
alter table public.topik_question_options enable row level security;
alter table public.topik_question_attempts enable row level security;

drop policy if exists "read published topik sources" on public.topik_sources;
create policy "read published topik sources" on public.topik_sources for select to authenticated using (true);
drop policy if exists "read published topik grammar" on public.topik_grammar;
create policy "read published topik grammar" on public.topik_grammar for select to authenticated using (status = 'PUBLISHED');
drop policy if exists "read published topik senses" on public.topik_grammar_senses;
create policy "read published topik senses" on public.topik_grammar_senses for select to authenticated using (status = 'PUBLISHED');
drop policy if exists "read published topik examples" on public.topik_examples;
create policy "read published topik examples" on public.topik_examples for select to authenticated using (status = 'PUBLISHED');
drop policy if exists "read published topik relations" on public.topik_grammar_relations;
create policy "read published topik relations" on public.topik_grammar_relations for select to authenticated using (status = 'PUBLISHED');
drop policy if exists "read published topik questions" on public.topik_questions;
create policy "read published topik questions" on public.topik_questions for select to authenticated using (status = 'PUBLISHED');
drop policy if exists "read options of published questions" on public.topik_question_options;
create policy "read options of published questions" on public.topik_question_options for select to authenticated using (
  exists (select 1 from public.topik_questions q where q.id = question_id and q.status = 'PUBLISHED')
);
drop policy if exists "users read own topik attempts" on public.topik_question_attempts;
create policy "users read own topik attempts" on public.topik_question_attempts for select to authenticated using (auth.uid() = user_id);

-- Attempts can only be created by the RPC below, so clients cannot submit is_correct.
revoke insert, update, delete on public.topik_question_attempts from anon, authenticated;

create or replace function public.topik_record_attempt(
  p_attempt_id uuid,
  p_question_id uuid,
  p_selected_option_id uuid,
  p_mode text,
  p_duration_ms integer default null
)
returns public.topik_question_attempts
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  option_is_correct boolean := false;
  saved_attempt public.topik_question_attempts;
begin
  if current_user_id is null then
    raise exception 'Authentication is required' using errcode = '42501';
  end if;
  if p_attempt_id is null then
    raise exception 'Attempt id is required' using errcode = '22023';
  end if;
  if p_mode not in ('FILL', 'SIMILAR', 'SPRINT', 'WRONG_RETRY') then
    raise exception 'Invalid TOPIK attempt mode' using errcode = '22023';
  end if;
  if p_duration_ms is not null and p_duration_ms < 0 then
    raise exception 'Duration must be non-negative' using errcode = '22023';
  end if;

  select * into saved_attempt
  from public.topik_question_attempts
  where id = p_attempt_id and user_id = current_user_id;
  if found then
    return saved_attempt;
  end if;

  if not exists (
    select 1 from public.topik_questions where id = p_question_id and status = 'PUBLISHED'
  ) then
    raise exception 'Question is not available' using errcode = '22023';
  end if;

  if p_selected_option_id is not null then
    select o.is_correct into option_is_correct
    from public.topik_question_options o
    where o.id = p_selected_option_id and o.question_id = p_question_id;
    if not found then
      raise exception 'Selected option does not belong to this question' using errcode = '23503';
    end if;
  end if;

  insert into public.topik_question_attempts (
    id, user_id, question_id, selected_option_id, is_correct, mode, duration_ms
  ) values (
    p_attempt_id, current_user_id, p_question_id, p_selected_option_id,
    coalesce(option_is_correct, false), p_mode, p_duration_ms
  ) on conflict (id) do nothing
  returning * into saved_attempt;

  if not found then
    select * into saved_attempt
    from public.topik_question_attempts
    where id = p_attempt_id and user_id = current_user_id;
  end if;
  return saved_attempt;
end;
$$;

revoke all on function public.topik_record_attempt(uuid, uuid, uuid, text, integer) from public;
grant execute on function public.topik_record_attempt(uuid, uuid, uuid, text, integer) to authenticated;
