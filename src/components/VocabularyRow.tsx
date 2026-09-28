import React from 'react';
import { Trash2, GripVertical } from 'lucide-react';
import type { FlashcardDraft } from '../types';

interface VocabularyRowProps {
  index: number;
  card: FlashcardDraft;
  onChange: (index: number, field: 'term' | 'meaning', value: string) => void;
  onDelete: (index: number) => void;
  canDelete: boolean;
}

export const VocabularyRow: React.FC<VocabularyRowProps> = ({
  index,
  card,
  onChange,
  onDelete,
  canDelete,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm hover:border-slate-300 transition-all group">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
          <GripVertical className="w-4 h-4 text-slate-300" />
          <span>CARD #{index + 1}</span>
        </div>
        {canDelete && (
          <button
            type="button"
            onClick={() => onDelete(index)}
            title="Delete this card"
            className="text-slate-400 hover:text-rose-600 p-1 rounded-md hover:bg-rose-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Term Input */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
            Term (Từ vựng) <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={card.term}
            onChange={(e) => onChange(index, 'term', e.target.value)}
            placeholder="e.g. 인간 or algorithm"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium"
          />
        </div>

        {/* Meaning Input */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
            Meaning (Định nghĩa / Nghĩa) <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={card.meaning}
            onChange={(e) => onChange(index, 'meaning', e.target.value)}
            placeholder="e.g. con người or thuật toán"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium"
          />
        </div>
      </div>
    </div>
  );
};
