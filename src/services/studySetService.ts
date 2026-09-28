import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { StudySet, Flashcard, FlashcardDraft } from '../types';

const LOCAL_STORAGE_SETS_KEY = 'quizlet_local_study_sets';
const LOCAL_STORAGE_CARDS_KEY = 'quizlet_local_flashcards';

// Initial sample data for demonstration / offline testing
const INITIAL_DEMO_SETS: StudySet[] = [
  {
    id: 'demo-set-1',
    user_id: 'demo-user-1234-5678-90ab-cdef12345678',
    title: 'TOPIK 3 - Unit 1 (Từ vựng Xã hội)',
    description: 'Từ vựng tiếng Hàn TOPIK chủ đề xã hội, môi trường và con người',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'demo-set-2',
    user_id: 'demo-user-1234-5678-90ab-cdef12345678',
    title: 'Oxford 3000 - Từ vựng Công nghệ',
    description: 'Từ vựng tiếng Anh chuyên ngành công nghệ thông tin thông dụng',
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  }
];

const INITIAL_DEMO_CARDS: Flashcard[] = [
  // Set 1
  { id: 'card-1', study_set_id: 'demo-set-1', term: '인간', meaning: 'con người', order_index: 0 },
  { id: 'card-2', study_set_id: 'demo-set-1', term: '도시', meaning: 'thành phố', order_index: 1 },
  { id: 'card-3', study_set_id: 'demo-set-1', term: '환경', meaning: 'môi trường', order_index: 2 },
  { id: 'card-4', study_set_id: 'demo-set-1', term: '발전', meaning: 'phát triển', order_index: 3 },
  { id: 'card-5', study_set_id: 'demo-set-1', term: '사회', meaning: 'xã hội', order_index: 4 },
  { id: 'card-6', study_set_id: 'demo-set-1', term: '기술', meaning: 'công nghệ', order_index: 5 },
  { id: 'card-7', study_set_id: 'demo-set-1', term: '문제', meaning: 'vấn đề', order_index: 6 },
  { id: 'card-8', study_set_id: 'demo-set-1', term: '해결', meaning: 'giải quyết', order_index: 7 },

  // Set 2
  { id: 'card-9', study_set_id: 'demo-set-2', term: 'algorithm', meaning: 'thuật toán', order_index: 0 },
  { id: 'card-10', study_set_id: 'demo-set-2', term: 'artificial intelligence', meaning: 'trí tuệ nhân tạo', order_index: 1 },
  { id: 'card-11', study_set_id: 'demo-set-2', term: 'cloud computing', meaning: 'điện toán đám mây', order_index: 2 },
  { id: 'card-12', study_set_id: 'demo-set-2', term: 'database', meaning: 'cơ sở dữ liệu', order_index: 3 },
  { id: 'card-13', study_set_id: 'demo-set-2', term: 'framework', meaning: 'khuôn khổ phần mềm', order_index: 4 },
  { id: 'card-14', study_set_id: 'demo-set-2', term: 'cybersecurity', meaning: 'an ninh mạng', order_index: 5 },
];

function getLocalSets(): StudySet[] {
  const stored = localStorage.getItem(LOCAL_STORAGE_SETS_KEY);
  if (!stored) {
    localStorage.setItem(LOCAL_STORAGE_SETS_KEY, JSON.stringify(INITIAL_DEMO_SETS));
    return INITIAL_DEMO_SETS;
  }
  return JSON.parse(stored);
}

function saveLocalSets(sets: StudySet[]) {
  localStorage.setItem(LOCAL_STORAGE_SETS_KEY, JSON.stringify(sets));
}

function getLocalCards(): Flashcard[] {
  const stored = localStorage.getItem(LOCAL_STORAGE_CARDS_KEY);
  if (!stored) {
    localStorage.setItem(LOCAL_STORAGE_CARDS_KEY, JSON.stringify(INITIAL_DEMO_CARDS));
    return INITIAL_DEMO_CARDS;
  }
  return JSON.parse(stored);
}

function saveLocalCards(cards: Flashcard[]) {
  localStorage.setItem(LOCAL_STORAGE_CARDS_KEY, JSON.stringify(cards));
}

export const studySetService = {
  async getStudySets(_userId: string, isDemo = false): Promise<StudySet[]> {
    if (isDemo || !isSupabaseConfigured) {
      const sets = getLocalSets();
      const cards = getLocalCards();
      return sets.map(set => ({
        ...set,
        card_count: cards.filter(c => c.study_set_id === set.id).length,
      }));
    }

    // Live Supabase query with card count
    const { data: sets, error } = await supabase
      .from('study_sets')
      .select(`
        id,
        user_id,
        title,
        description,
        created_at,
        updated_at,
        flashcards (id)
      `)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching study sets:', error);
      throw error;
    }

    return (sets || []).map((s: any) => ({
      id: s.id,
      user_id: s.user_id,
      title: s.title,
      description: s.description,
      created_at: s.created_at,
      updated_at: s.updated_at,
      card_count: s.flashcards ? s.flashcards.length : 0,
    }));
  },

  async getStudySetById(id: string, isDemo = false): Promise<StudySet | null> {
    if (isDemo || !isSupabaseConfigured) {
      const sets = getLocalSets();
      const set = sets.find(s => s.id === id);
      if (!set) return null;
      const cards = getLocalCards().filter(c => c.study_set_id === id);
      return {
        ...set,
        card_count: cards.length,
        cards,
      };
    }

    // Live Supabase query
    const { data, error } = await supabase
      .from('study_sets')
      .select(`
        id,
        user_id,
        title,
        description,
        created_at,
        updated_at,
        flashcards (
          id,
          study_set_id,
          term,
          meaning,
          order_index,
          created_at,
          updated_at
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching study set:', error);
      return null;
    }

    const cards = (data.flashcards || []).sort(
      (a: any, b: any) => (a.order_index ?? 0) - (b.order_index ?? 0)
    );

    return {
      id: data.id,
      user_id: data.user_id,
      title: data.title,
      description: data.description,
      created_at: data.created_at,
      updated_at: data.updated_at,
      card_count: cards.length,
      cards,
    };
  },

  async createStudySet(
    userId: string,
    title: string,
    description: string,
    cards: FlashcardDraft[],
    isDemo = false
  ): Promise<StudySet> {
    const validCards = cards.filter(c => c.term.trim() && c.meaning.trim());

    if (isDemo || !isSupabaseConfigured) {
      const sets = getLocalSets();
      const newSetId = 'set-' + Date.now();
      const now = new Date().toISOString();
      const newSet: StudySet = {
        id: newSetId,
        user_id: userId,
        title: title.trim(),
        description: description.trim() || null,
        created_at: now,
        updated_at: now,
        card_count: validCards.length,
      };

      const existingCards = getLocalCards();
      const newCards: Flashcard[] = validCards.map((c, idx) => ({
        id: 'card-' + Date.now() + '-' + idx,
        study_set_id: newSetId,
        term: c.term.trim(),
        meaning: c.meaning.trim(),
        order_index: idx,
        created_at: now,
        updated_at: now,
      }));

      saveLocalSets([newSet, ...sets]);
      saveLocalCards([...existingCards, ...newCards]);

      return {
        ...newSet,
        cards: newCards,
      };
    }

    // 1. Insert study set
    const { data: newSet, error: setError } = await supabase
      .from('study_sets')
      .insert({
        user_id: userId,
        title: title.trim(),
        description: description.trim() || null,
      })
      .select()
      .single();

    if (setError || !newSet) {
      console.error('Error creating study set:', setError);
      throw setError;
    }

    // 2. Insert flashcards if any
    if (validCards.length > 0) {
      const cardInserts = validCards.map((c, idx) => ({
        study_set_id: newSet.id,
        term: c.term.trim(),
        meaning: c.meaning.trim(),
        order_index: idx,
      }));

      const { error: cardError } = await supabase
        .from('flashcards')
        .insert(cardInserts);

      if (cardError) {
        console.error('Error inserting cards:', cardError);
      }
    }

    return newSet;
  },

  async updateStudySet(
    id: string,
    title: string,
    description: string,
    cards: FlashcardDraft[],
    isDemo = false
  ): Promise<void> {
    const validCards = cards.filter(c => c.term.trim() && c.meaning.trim());

    if (isDemo || !isSupabaseConfigured) {
      const sets = getLocalSets();
      const setIndex = sets.findIndex(s => s.id === id);
      if (setIndex !== -1) {
        sets[setIndex] = {
          ...sets[setIndex],
          title: title.trim(),
          description: description.trim() || null,
          updated_at: new Date().toISOString(),
          card_count: validCards.length,
        };
        saveLocalSets(sets);
      }

      // Replace cards for this study set
      const allCards = getLocalCards().filter(c => c.study_set_id !== id);
      const newCards: Flashcard[] = validCards.map((c, idx) => ({
        id: c.id || ('card-' + Date.now() + '-' + idx),
        study_set_id: id,
        term: c.term.trim(),
        meaning: c.meaning.trim(),
        order_index: idx,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));
      saveLocalCards([...allCards, ...newCards]);
      return;
    }

    // 1. Update study set
    const { error: setError } = await supabase
      .from('study_sets')
      .update({
        title: title.trim(),
        description: description.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (setError) {
      console.error('Error updating study set:', setError);
      throw setError;
    }

    // 2. Delete old cards and re-insert new cards (cleanest sync for ordering & batch update)
    const { error: deleteError } = await supabase
      .from('flashcards')
      .delete()
      .eq('study_set_id', id);

    if (deleteError) {
      console.error('Error clearing old cards:', deleteError);
    }

    if (validCards.length > 0) {
      const cardInserts = validCards.map((c, idx) => ({
        study_set_id: id,
        term: c.term.trim(),
        meaning: c.meaning.trim(),
        order_index: idx,
      }));

      const { error: insertError } = await supabase
        .from('flashcards')
        .insert(cardInserts);

      if (insertError) {
        console.error('Error re-inserting cards:', insertError);
        throw insertError;
      }
    }
  },

  async deleteStudySet(id: string, isDemo = false): Promise<void> {
    if (isDemo || !isSupabaseConfigured) {
      const sets = getLocalSets().filter(s => s.id !== id);
      const cards = getLocalCards().filter(c => c.study_set_id !== id);
      saveLocalSets(sets);
      saveLocalCards(cards);
      return;
    }

    // Supabase cascade deletes flashcards
    const { error } = await supabase
      .from('study_sets')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting study set:', error);
      throw error;
    }
  }
};
