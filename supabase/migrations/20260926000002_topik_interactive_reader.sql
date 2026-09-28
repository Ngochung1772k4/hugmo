create extension if not exists pgcrypto;

create table public.reading_passages (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 150), source_name text, source_url text,
  topik_level text not null default 'UNKNOWN' check (topik_level in ('BEGINNER','INTERMEDIATE','ADVANCED','UNKNOWN')),
  notes text, current_version_id uuid, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.reading_passage_versions (
  id uuid primary key default gen_random_uuid(), passage_id uuid not null references public.reading_passages(id) on delete cascade,
  version_number integer not null check (version_number > 0), content text not null check (char_length(content) between 1 and 20000),
  content_hash text not null, created_by uuid not null references auth.users(id), created_at timestamptz not null default now(),
  unique (passage_id, version_number)
);
alter table public.reading_passages add constraint reading_passages_current_version_fkey foreign key (current_version_id) references public.reading_passage_versions(id) on delete set null;
create table public.reading_annotations (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  passage_id uuid not null references public.reading_passages(id) on delete cascade,
  passage_version_id uuid not null references public.reading_passage_versions(id) on delete cascade,
  block_index integer not null check (block_index >= 0), start_offset integer not null check (start_offset >= 0),
  end_offset integer not null check (end_offset > start_offset), selected_text text not null check (char_length(selected_text) between 1 and 40),
  sentence_context text not null check (char_length(sentence_context) between 1 and 500), lemma text not null, part_of_speech text not null check (part_of_speech in ('NOUN','VERB','ADJECTIVE','ADVERB','PRONOUN','DETERMINER','PARTICLE','ENDING','EXPRESSION','OTHER')),
  meaning_vi text not null, context_meaning_vi text, pronunciation text, morphemes jsonb not null default '[]'::jsonb,
  grammar_note_vi text, confidence text not null check (confidence in ('LOW','MEDIUM','HIGH')), user_corrected boolean not null default false,
  analysis_provider text, analysis_provider_version text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.reading_flashcard_links (
  id uuid primary key default gen_random_uuid(), annotation_id uuid not null references public.reading_annotations(id) on delete cascade,
  flashcard_id uuid not null references public.flashcards(id) on delete cascade, created_at timestamptz not null default now(), unique(annotation_id, flashcard_id)
);
create table public.korean_analysis_cache (
  id uuid primary key default gen_random_uuid(), request_hash text not null unique, selected_text text not null,
  sentence_hash text not null, response jsonb not null, provider text not null, provider_version text not null,
  created_at timestamptz not null default now(), expires_at timestamptz not null
);
create index idx_reading_passages_user_updated on public.reading_passages(user_id, updated_at desc);
create index idx_reading_versions_passage_number on public.reading_passage_versions(passage_id, version_number desc);
create index idx_reading_annotations_version_range on public.reading_annotations(passage_version_id, block_index, start_offset);
create index idx_reading_annotations_user_lemma on public.reading_annotations(user_id, lemma);
create index idx_reading_links_flashcard on public.reading_flashcard_links(flashcard_id);

create or replace function public.reading_updated_at() returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end $$;
create trigger reading_passages_updated_at before update on public.reading_passages for each row execute function public.reading_updated_at();
create trigger reading_annotations_updated_at before update on public.reading_annotations for each row execute function public.reading_updated_at();
create or replace function public.prevent_annotation_anchor_change() returns trigger language plpgsql as $$
begin
  if new.passage_id <> old.passage_id or new.passage_version_id <> old.passage_version_id or new.block_index <> old.block_index or new.start_offset <> old.start_offset or new.end_offset <> old.end_offset or new.selected_text <> old.selected_text then
    raise exception 'Annotation location is immutable';
  end if;
  if new.lemma is distinct from old.lemma or new.meaning_vi is distinct from old.meaning_vi or new.part_of_speech is distinct from old.part_of_speech then new.user_corrected = true; end if;
  return new;
end $$;
create trigger reading_annotations_anchor_immutable before update on public.reading_annotations for each row execute function public.prevent_annotation_anchor_change();

alter table public.reading_passages enable row level security;
alter table public.reading_passage_versions enable row level security;
alter table public.reading_annotations enable row level security;
alter table public.reading_flashcard_links enable row level security;
alter table public.korean_analysis_cache enable row level security;
create policy "manage own passages" on public.reading_passages for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "read own passage versions" on public.reading_passage_versions for select to authenticated using (exists(select 1 from public.reading_passages p where p.id=passage_id and p.user_id=auth.uid()));
create policy "read own annotations" on public.reading_annotations for select to authenticated using (auth.uid()=user_id);
create policy "update own annotation details" on public.reading_annotations for update to authenticated using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "delete own annotations" on public.reading_annotations for delete to authenticated using (auth.uid()=user_id);
create policy "read own reading links" on public.reading_flashcard_links for select to authenticated using (exists(select 1 from public.reading_annotations a where a.id=annotation_id and a.user_id=auth.uid()));
revoke all on public.korean_analysis_cache from anon, authenticated;
revoke insert on public.reading_annotations from anon, authenticated;
revoke insert, update, delete on public.reading_flashcard_links from anon, authenticated;

create or replace function public.create_reading_passage(p_title text, p_content text, p_source_name text default null, p_source_url text default null, p_topik_level text default 'UNKNOWN', p_notes text default null)
returns jsonb language plpgsql security definer set search_path=public as $$
declare uid uuid:=auth.uid(); passage public.reading_passages; version public.reading_passage_versions;
begin
 if uid is null then raise exception 'Authentication is required'; end if;
 insert into reading_passages(user_id,title,source_name,source_url,topik_level,notes) values(uid,trim(p_title),p_source_name,p_source_url,p_topik_level,p_notes) returning * into passage;
 insert into reading_passage_versions(passage_id,version_number,content,content_hash,created_by) values(passage.id,1,p_content,md5(p_content),uid) returning * into version;
 update reading_passages set current_version_id=version.id where id=passage.id returning * into passage;
 return jsonb_build_object('passage',to_jsonb(passage),'version',to_jsonb(version));
end $$;
create or replace function public.create_reading_passage_version(p_passage_id uuid, p_content text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare uid uuid:=auth.uid(); passage public.reading_passages; version public.reading_passage_versions; next_number integer;
begin
 select * into passage from reading_passages where id=p_passage_id and user_id=uid for update;
 if not found then raise exception 'Passage not found'; end if;
 select coalesce(max(version_number),0)+1 into next_number from reading_passage_versions where passage_id=passage.id;
 insert into reading_passage_versions(passage_id,version_number,content,content_hash,created_by) values(passage.id,next_number,p_content,md5(p_content),uid) returning * into version;
 update reading_passages set current_version_id=version.id where id=passage.id returning * into passage;
 return jsonb_build_object('passage',to_jsonb(passage),'version',to_jsonb(version));
end $$;
create or replace function public.save_reading_word_to_set(p_version_id uuid,p_block_index integer,p_start_offset integer,p_end_offset integer,p_selected_text text,p_sentence_context text,p_lemma text,p_part_of_speech text,p_meaning_vi text,p_context_meaning_vi text,p_pronunciation text,p_morphemes jsonb,p_grammar_note_vi text,p_confidence text,p_provider text,p_provider_version text,p_study_set_id uuid,p_term text,p_meaning text,p_reuse_flashcard_id uuid default null)
returns jsonb language plpgsql security definer set search_path=public as $$
declare uid uuid:=auth.uid(); version public.reading_passage_versions; passage public.reading_passages; annotation public.reading_annotations; card public.flashcards; block_text text; next_order integer;
begin
 select v.* into version from reading_passage_versions v join reading_passages p on p.id=v.passage_id where v.id=p_version_id and p.user_id=uid;
 if not found then raise exception 'Reading version not found'; end if;
 select * into passage from reading_passages where id=version.passage_id;
 if p_start_offset<0 or p_end_offset<=p_start_offset or char_length(p_selected_text) not between 1 and 40 then raise exception 'Invalid annotation range'; end if;
 block_text := (regexp_split_to_array(version.content,E'\\n\\s*\\n'))[p_block_index+1];
 if block_text is null or substring(block_text from p_start_offset+1 for p_end_offset-p_start_offset) <> p_selected_text then raise exception 'Selection does not match passage content'; end if;
 if not exists(select 1 from study_sets s where s.id=p_study_set_id and s.user_id=uid) then raise exception 'Study set not found'; end if;
 insert into reading_annotations(user_id,passage_id,passage_version_id,block_index,start_offset,end_offset,selected_text,sentence_context,lemma,part_of_speech,meaning_vi,context_meaning_vi,pronunciation,morphemes,grammar_note_vi,confidence,analysis_provider,analysis_provider_version) values(uid,passage.id,version.id,p_block_index,p_start_offset,p_end_offset,p_selected_text,p_sentence_context,p_lemma,p_part_of_speech,p_meaning_vi,p_context_meaning_vi,p_pronunciation,coalesce(p_morphemes,'[]'::jsonb),p_grammar_note_vi,p_confidence,p_provider,p_provider_version) returning * into annotation;
 if p_reuse_flashcard_id is not null then select f.* into card from flashcards f join study_sets s on s.id=f.study_set_id where f.id=p_reuse_flashcard_id and s.user_id=uid; if not found then raise exception 'Flashcard not found'; end if;
 else perform 1 from study_sets where id=p_study_set_id for update; select coalesce(max(order_index),-1)+1 into next_order from flashcards where study_set_id=p_study_set_id; insert into flashcards(study_set_id,term,meaning,order_index) values(p_study_set_id,p_term,p_meaning,next_order) returning * into card; end if;
 insert into reading_flashcard_links(annotation_id,flashcard_id) values(annotation.id,card.id);
 return jsonb_build_object('annotation',to_jsonb(annotation),'flashcard',to_jsonb(card),'passage',jsonb_build_object('id',passage.id,'title',passage.title));
end $$;
revoke all on function public.create_reading_passage(text,text,text,text,text,text) from public;
revoke all on function public.create_reading_passage_version(uuid,text) from public;
revoke all on function public.save_reading_word_to_set(uuid,integer,integer,integer,text,text,text,text,text,text,text,jsonb,text,text,text,text,uuid,text,text,uuid) from public;
grant execute on function public.create_reading_passage(text,text,text,text,text,text), public.create_reading_passage_version(uuid,text), public.save_reading_word_to_set(uuid,integer,integer,integer,text,text,text,text,text,text,text,jsonb,text,text,text,text,uuid,text,text,uuid) to authenticated;
