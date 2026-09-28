-- Reuse global Q54 patterns without copying them into each content topic.

create table if not exists public.q54_topic_pattern_mappings (
  topic_id uuid not null references public.q54_topics(id) on delete cascade,
  pattern_id uuid not null references public.q54_sentence_patterns(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (topic_id, pattern_id)
);

alter table public.q54_topic_pattern_mappings enable row level security;

drop policy if exists "read scoped q54 topic pattern mappings" on public.q54_topic_pattern_mappings;
create policy "read scoped q54 topic pattern mappings" on public.q54_topic_pattern_mappings
  for select to authenticated
  using (
    exists (
      select 1 from public.q54_topics t
      where t.id = topic_id
        and ((t.visibility = 'PUBLIC' and t.status = 'PUBLISHED') or t.created_by = auth.uid())
    )
    and exists (
      select 1 from public.q54_sentence_patterns p
      where p.id = pattern_id and p.status = 'PUBLISHED'
    )
  );

revoke insert, update, delete on public.q54_topic_pattern_mappings from anon, authenticated;
