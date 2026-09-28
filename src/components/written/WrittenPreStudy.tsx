import React from 'react';
import type { WriteDirection } from '../../types';
import { PenTool, ArrowRight, BookOpen, Layers } from 'lucide-react';

interface WrittenPreStudyProps {
  studySetTitle: string;
  cardCount: number;
  direction: WriteDirection;
  onDirectionChange: (dir: WriteDirection) => void;
  onStart: () => void;
}

export const WrittenPreStudy: React.FC<WrittenPreStudyProps> = ({
  studySetTitle,
  cardCount,
  direction,
  onDirectionChange,
  onStart,
}) => {
  return (
    <div className="max-w-xl mx-auto py-10 px-4 sm:px-6 animate-fadeIn">
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/90 shadow-xl text-center">
        {/* Header Icon */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white flex items-center justify-center mx-auto mb-5 shadow-lg shadow-brand-500/25">
          <PenTool className="w-8 h-8" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
          Written Answer Mode
        </h1>
        <p className="text-sm text-slate-500 mb-6">
          Practice active recall by typing each vocabulary word.
        </p>

        {/* Study Set Info */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 mb-8 flex items-center justify-between text-left">
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-brand-600 flex-shrink-0" />
            <div>
              <div className="font-bold text-slate-900 text-sm line-clamp-1">{studySetTitle}</div>
              <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <Layers className="w-3.5 h-3.5" />
                <span>{cardCount} cards in this set</span>
              </div>
            </div>
          </div>
        </div>

        {/* Direction Selection */}
        <div className="text-left mb-8 space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Choose Study Direction
          </label>

          {/* Option 1: Meaning -> Term */}
          <div
            onClick={() => onDirectionChange('meaning_to_term')}
            className={`p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all ${
              direction === 'meaning_to_term'
                ? 'border-brand-600 bg-brand-50/50 ring-2 ring-brand-500/20'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="flex items-start gap-3.5">
              <input
                type="radio"
                name="write_direction"
                checked={direction === 'meaning_to_term'}
                onChange={() => onDirectionChange('meaning_to_term')}
                className="mt-1 w-4 h-4 text-brand-600 focus:ring-brand-500"
              />
              <div>
                <div className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <span>Meaning &rarr; Term</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full">
                    Recommended
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  See the meaning and type the exact vocabulary word from memory.
                </p>
              </div>
            </div>
          </div>

          {/* Option 2: Term -> Meaning */}
          <div
            onClick={() => onDirectionChange('term_to_meaning')}
            className={`p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all ${
              direction === 'term_to_meaning'
                ? 'border-brand-600 bg-brand-50/50 ring-2 ring-brand-500/20'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="flex items-start gap-3.5">
              <input
                type="radio"
                name="write_direction"
                checked={direction === 'term_to_meaning'}
                onChange={() => onDirectionChange('term_to_meaning')}
                className="mt-1 w-4 h-4 text-brand-600 focus:ring-brand-500"
              />
              <div>
                <div className="font-bold text-slate-900 text-base">
                  Term &rarr; Meaning
                </div>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  See the vocabulary word and type its corresponding definition.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Start Button */}
        <button
          type="button"
          onClick={onStart}
          className="w-full py-4 px-6 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-base shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center gap-2 active:scale-98"
        >
          <span>Start Learning</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
