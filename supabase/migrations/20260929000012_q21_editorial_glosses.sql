-- Optional reviewed learning glosses for Q21 expressions omitted from the book glossary.
-- This table never overwrites topik_reading_idioms.meaning_vi_source.
create table if not exists public.topik_reading_idiom_editorial_glosses (
  idiom_id uuid primary key references public.topik_reading_idioms(id) on delete cascade,
  meaning_vi_editorial text not null,
  source_type text not null default 'EDITORIAL_MANUAL' check (source_type in ('EDITORIAL_MANUAL', 'AI_GENERATED')),
  status text not null default 'PUBLISHED' check (status in ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.topik_reading_idiom_editorial_glosses enable row level security;

drop policy if exists "read published editorial idiom glosses" on public.topik_reading_idiom_editorial_glosses;
create policy "read published editorial idiom glosses" on public.topik_reading_idiom_editorial_glosses for select to authenticated using (status = 'PUBLISHED');

revoke insert, update, delete on public.topik_reading_idiom_editorial_glosses from anon, authenticated;
