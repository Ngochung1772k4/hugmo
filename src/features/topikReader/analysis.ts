import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import type { KoreanAnalysis } from './types';

type SelectionMode = 'WORD' | 'SENTENCE';

export async function analyze(selectedText: string, sentence: string, start: number, end: number, isDemo: boolean, mode: SelectionMode = 'WORD') {
  if (!isDemo && isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.functions.invoke('analyze-korean-selection', {
        body: { selectedText, sentence, selectionStartInSentence: start, selectionEndInSentence: end, locale: 'vi', mode },
      });
      if (!error && data) return data as KoreanAnalysis;
    } catch {
      // Keep the manual form usable if the analyzer is temporarily unavailable.
    }
  }

  return {
    surface: selectedText,
    lemma: selectedText,
    partOfSpeech: 'OTHER',
    meaningVi: '',
    sentenceTranslationVi: '',
    morphemes: [],
    confidence: 'LOW',
    alternatives: [],
    provider: 'manual',
    providerVersion: '1',
    grammarNoteVi: 'Analyzer chưa sẵn sàng. Hãy nhập và kiểm tra thông tin thủ công.',
  } satisfies KoreanAnalysis;
}
