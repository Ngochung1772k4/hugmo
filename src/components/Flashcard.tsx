import React from 'react';
import { Volume2, RotateCw } from 'lucide-react';

interface FlashcardProps {
  term: string;
  meaning: string;
  isFlipped: boolean;
  onFlip: () => void;
}

export const Flashcard: React.FC<FlashcardProps> = ({
  term,
  meaning,
  isFlipped,
  onFlip,
}) => {
  const speakText = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      // Auto-detect Korean or English if possible
      if (/[\uac00-\ud7af]/.test(text)) {
        utterance.lang = 'ko-KR';
      } else {
        utterance.lang = 'en-US';
      }
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div
      onClick={onFlip}
      className="w-full max-w-2xl h-80 sm:h-96 mx-auto cursor-pointer perspective-1000 select-none"
    >
      <div
        className={`relative w-full h-full duration-500 transform-style-3d transition-transform ease-out ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* FRONT SIDE (Term) */}
        <div className="absolute inset-0 w-full h-full bg-white rounded-3xl p-8 flex flex-col justify-between items-center shadow-xl border border-slate-200/90 backface-hidden hover:border-brand-300 transition-colors">
          {/* Top Bar */}
          <div className="w-full flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-slate-100 text-slate-600">
              Term
            </span>
            <button
              onClick={(e) => speakText(term, e)}
              title="Pronounce word"
              className="p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-brand-600 transition-colors"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>

          {/* Center Word */}
          <div className="text-center px-4">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {term}
            </h2>
          </div>

          {/* Bottom Prompt */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <RotateCw className="w-3.5 h-3.5" />
            <span>Click or press <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded text-slate-700 font-mono">Space</kbd> to reveal</span>
          </div>
        </div>

        {/* BACK SIDE (Meaning) */}
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-brand-600 to-indigo-700 text-white rounded-3xl p-8 flex flex-col justify-between items-center shadow-xl rotate-y-180 backface-hidden">
          {/* Top Bar */}
          <div className="w-full flex items-center justify-between text-brand-200">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-white/20 text-white">
              Meaning / Definition
            </span>
            <button
              onClick={(e) => speakText(meaning, e)}
              title="Pronounce meaning"
              className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>

          {/* Center Meaning */}
          <div className="text-center px-4">
            <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight leading-relaxed">
              {meaning}
            </h2>
          </div>

          {/* Bottom Prompt */}
          <div className="flex items-center gap-1.5 text-xs text-brand-200 font-medium">
            <RotateCw className="w-3.5 h-3.5" />
            <span>Click or press <kbd className="px-1.5 py-0.5 bg-white/20 border border-white/30 rounded text-white font-mono">Space</kbd> to flip back</span>
          </div>
        </div>
      </div>
    </div>
  );
};
