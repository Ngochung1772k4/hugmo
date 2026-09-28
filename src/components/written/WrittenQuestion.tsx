import React from 'react';
import { Volume2 } from 'lucide-react';
import type { WriteDirection } from '../../types';

interface WrittenQuestionProps {
  promptText: string;
  direction: WriteDirection;
}

export const WrittenQuestion: React.FC<WrittenQuestionProps> = ({
  promptText,
  direction,
}) => {
  const speak = (e: React.MouseEvent) => {
    e.stopPropagation();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(promptText);
      if (/[\uac00-\ud7af]/.test(promptText)) {
        utterance.lang = 'ko-KR';
      } else {
        utterance.lang = 'en-US';
      }
      window.speechSynthesis.speak(utterance);
    }
  };

  const label = direction === 'meaning_to_term' ? 'Meaning' : 'Term';

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-md mb-6 text-center relative overflow-hidden">
      {/* Label and Audio */}
      <div className="flex items-center justify-between text-slate-400 mb-2">
        <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-slate-100 text-slate-600">
          {label}
        </span>
        <button
          type="button"
          onClick={speak}
          title="Pronounce"
          className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-slate-100 transition-colors"
        >
          <Volume2 className="w-4 h-4" />
        </button>
      </div>

      {/* Main Prompt Word */}
      <div className="py-4">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-snug">
          {promptText}
        </h2>
      </div>
    </div>
  );
};
