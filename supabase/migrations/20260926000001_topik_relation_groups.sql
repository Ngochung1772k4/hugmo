-- Multi-member similar-grammar groups. Keep topik_grammar_relations for compatibility only.
create table if not exists public.topik_grammar_relation_groups (
  id uuid primary key default gen_random_uuid(),
  group_key text not null unique,
  title_vi text not null,
  category text not null,
  context_note_vi text not null,
  source_id uuid references public.topik_sources(id),
  source_page_printed text,
  source_item text,
  status text not null default 'PUBLISHED' check (status in ('DRAFT', 'REVIEWED', 'PUBLISHED'))
);

create table if not exists public.topik_grammar_relation_group_members (
  group_id uuid not null references public.topik_grammar_relation_groups(id) on delete cascade,
  sense_id uuid not null references public.topik_grammar_senses(id) on delete cascade,
  member_order smallint not null check (member_order > 0),
  member_role text not null check (member_role in ('HEAD', 'EQUIVALENT')),
  primary key (group_id, sense_id),
  unique (group_id, member_order)
);

create index if not exists idx_topik_relation_groups_category on public.topik_grammar_relation_groups(category, status);
create index if not exists idx_topik_relation_members_sense on public.topik_grammar_relation_group_members(sense_id);

alter table public.topik_grammar_relation_groups enable row level security;
alter table public.topik_grammar_relation_group_members enable row level security;

drop policy if exists "read published topik relation groups" on public.topik_grammar_relation_groups;
create policy "read published topik relation groups"
  on public.topik_grammar_relation_groups for select to authenticated using (status = 'PUBLISHED');
drop policy if exists "read members of published topik groups" on public.topik_grammar_relation_group_members;
create policy "read members of published topik groups"
  on public.topik_grammar_relation_group_members for select to authenticated using (
    exists (
      select 1 from public.topik_grammar_relation_groups group_record
      where group_record.id = group_id and group_record.status = 'PUBLISHED'
    )
  );
