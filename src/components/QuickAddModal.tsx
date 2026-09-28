import React, { useState, useMemo } from 'react';
import { X, Sparkles, AlertCircle, Plus, Layers } from 'lucide-react';
import type { FlashcardDraft } from '../types';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (cards: FlashcardDraft[], replace: boolean) => void;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  onImport,
}) => {
  const [rawText, setRawText] = useState('');
  const [replaceMode, setReplaceMode] = useState(false);

  // Parse lines dynamically
  const parsedCards: FlashcardDraft[] = useMemo(() => {
    if (!rawText.trim()) return [];

    const lines = rawText.split('\n');
    const results: FlashcardDraft[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      let term = '';
      let meaning = '';

      // Try TAB first (from Excel / Google Sheets)
      if (trimmed.includes('\t')) {
        const parts = trimmed.split('\t');
        term = parts[0]?.trim() || '';
        meaning = parts.slice(1).join(' ').trim();
      }
      // Try '='
      else if (trimmed.includes('=')) {
        const parts = trimmed.split('=');
        term = parts[0]?.trim() || '';
        meaning = parts.slice(1).join('=').trim();
      }
      // Try ':'
      else if (trimmed.includes(':')) {
        const parts = trimmed.split(':');
        term = parts[0]?.trim() || '';
        meaning = parts.slice(1).join(':').trim();
      }
      // Try ' - '
      else if (trimmed.includes(' - ')) {
        const parts = trimmed.split(' - ');
        term = parts[0]?.trim() || '';
        meaning = parts.slice(1).join(' - ').trim();
      }

      if (term && meaning) {
        results.push({ term, meaning });
      }
    }

    return results;
  }, [rawText]);

  if (!isOpen) return null;

  const handleApply = () => {
    if (parsedCards.length === 0) return;
    onImport(parsedCards, replaceMode);
    setRawText('');
    onClose();
  };

  const sampleKorean = `인간 = con người\n도시 = thành phố\n환경 = môi trường\n발전 = phát triển\n사회 = xã hội\n기술 = công nghệ\n문제 = vấn đề\n해결 = giải quyết`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform animate-popIn flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-brand-50 text-brand-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Quick Add Vocabulary</h3>
              <p className="text-xs text-slate-500">Paste multiple words at once (supports = , tab, : , -)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Instructions and Sample Button */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <span className="text-slate-600">
              Supported format: <code className="text-brand-600 font-semibold font-mono">Word = Meaning</code> or copied from Excel (<code className="text-brand-600 font-semibold font-mono">Word [TAB] Meaning</code>)
            </span>
            <button
              type="button"
              onClick={() => setRawText(sampleKorean)}
              className="text-brand-600 hover:text-brand-700 font-semibold hover:underline"
            >
              Insert sample TOPIK list
            </button>
          </div>

          {/* Text Area */}
          <div>
            <textarea
              rows={8}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder={`인간 = con người\n도시 = thành phố\n환경 = môi trường\n발전 = phát triển`}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-mono text-sm leading-relaxed"
            />
          </div>

          {/* Parsed Preview */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 bg-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-brand-600" />
                Parsed Cards Preview ({parsedCards.length} cards detected)
              </span>
              {parsedCards.length === 0 && rawText.trim() && (
                <span className="flex items-center gap-1 text-amber-600 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  No valid pairs detected
                </span>
              )}
            </div>

            <div className="max-h-40 overflow-y-auto divide-y divide-slate-100 bg-white">
              {parsedCards.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 italic">
                  Paste text above to preview parsed cards
                </div>
              ) : (
                parsedCards.map((card, idx) => (
                  <div key={idx} className="px-4 py-2 text-xs grid grid-cols-2 gap-4">
                    <span className="font-semibold text-slate-800 truncate">{card.term}</span>
                    <span className="text-slate-600 truncate">{card.meaning}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Options */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="replaceMode"
              checked={replaceMode}
              onChange={(e) => setReplaceMode(e.target.checked)}
              className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
            />
            <label htmlFor="replaceMode" className="text-xs text-slate-600 select-none cursor-pointer">
              Replace existing cards in form (uncheck to append to current cards)
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={parsedCards.length === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            Import {parsedCards.length} {parsedCards.length === 1 ? 'Card' : 'Cards'}
          </button>
        </div>
      </div>
    </div>
  );
};
