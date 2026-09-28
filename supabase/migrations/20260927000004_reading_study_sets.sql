create table public.reading_study_sets (
  passage_id uuid primary key references public.reading_passages(id) on delete cascade,
  study_set_id uuid not null unique references public.study_sets(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.reading_study_sets enable row level security;
create policy "read own reading study sets" on public.reading_study_sets for select to authenticated using (auth.uid() = user_id);
revoke insert, update, delete on public.reading_study_sets from anon, authenticated;

create or replace function public.get_or_create_reading_study_set(p_passage_id uuid)
returns jsonb language plpgsql security definer set search_path=public as $$
declare uid uuid := auth.uid(); passage public.reading_passages; linked_set public.study_sets;
begin
  select * into passage from reading_passages where id = p_passage_id and user_id = uid for update;
  if not found then raise exception 'Reading passage not found'; end if;
  select s.* into linked_set from reading_study_sets rs join study_sets s on s.id = rs.study_set_id where rs.passage_id = passage.id and rs.user_id = uid;
  if found then return to_jsonb(linked_set); end if;
  insert into study_sets(user_id, title, description) values (uid, 'Tu vung - ' || passage.title, 'Vocabulary saved from this reading.') returning * into linked_set;
  insert into reading_study_sets(passage_id, study_set_id, user_id) values (passage.id, linked_set.id, uid);
  return to_jsonb(linked_set);
end $$;

create or replace function public.save_reading_word_to_passage_set(
  p_version_id uuid, p_block_index integer, p_start_offset integer, p_end_offset integer,
  p_selected_text text, p_sentence_context text, p_lemma text, p_part_of_speech text,
  p_meaning_vi text, p_context_meaning_vi text, p_pronunciation text, p_morphemes jsonb,
  p_grammar_note_vi text, p_confidence text, p_provider text, p_provider_version text,
  p_term text, p_meaning text
) returns jsonb language plpgsql security definer set search_path=public as $$
declare uid uuid := auth.uid(); version public.reading_passage_versions; passage public.reading_passages; annotation public.reading_annotations; card public.flashcards; block_text text; next_order integer; linked_set_id uuid;
begin
  select v.* into version from reading_passage_versions v join reading_passages p on p.id = v.passage_id where v.id = p_version_id and p.user_id = uid;
  if not found then raise exception 'Reading version not found'; end if;
  select * into passage from reading_passages where id = version.passage_id;
  select study_set_id into linked_set_id from reading_study_sets where passage_id = passage.id and user_id = uid;
  if linked_set_id is null then raise exception 'Reading study set not found'; end if;
  if p_start_offset < 0 or p_end_offset <= p_start_offset or char_length(p_selected_text) not between 1 and 40 then raise exception 'Invalid annotation range'; end if;
  block_text := (regexp_split_to_array(version.content, E'\\n\\s*\\n'))[p_block_index + 1];
  if block_text is null or substring(block_text from p_start_offset + 1 for p_end_offset - p_start_offset) <> p_selected_text then raise exception 'Selection does not match passage content'; end if;
  insert into reading_annotations(user_id, passage_id, passage_version_id, block_index, start_offset, end_offset, selected_text, sentence_context, lemma, part_of_speech, meaning_vi, context_meaning_vi, pronunciation, morphemes, grammar_note_vi, confidence, analysis_provider, analysis_provider_version)
  values (uid, passage.id, version.id, p_block_index, p_start_offset, p_end_offset, p_selected_text, p_sentence_context, p_lemma, p_part_of_speech, p_meaning_vi, p_context_meaning_vi, p_pronunciation, coalesce(p_morphemes, '[]'::jsonb), p_grammar_note_vi, p_confidence, p_provider, p_provider_version)
  returning * into annotation;
  perform 1 from study_sets where id = linked_set_id and user_id = uid for update;
  select coalesce(max(order_index), -1) + 1 into next_order from flashcards where study_set_id = linked_set_id;
  insert into flashcards(study_set_id, term, meaning, order_index) values (linked_set_id, p_term, p_meaning, next_order) returning * into card;
  insert into reading_flashcard_links(annotation_id, flashcard_id) values (annotation.id, card.id);
  return jsonb_build_object('annotation', to_jsonb(annotation), 'flashcard', to_jsonb(card), 'passage', jsonb_build_object('id', passage.id, 'title', passage.title));
end $$;

revoke all on function public.get_or_create_reading_study_set(uuid) from public;
revoke all on function public.save_reading_word_to_passage_set(uuid,integer,integer,integer,text,text,text,text,text,text,text,jsonb,text,text,text,text,text,text) from public;
grant execute on function public.get_or_create_reading_study_set(uuid), public.save_reading_word_to_passage_set(uuid,integer,integer,integer,text,text,text,text,text,text,text,jsonb,text,text,text,text,text,text) to authenticated;
