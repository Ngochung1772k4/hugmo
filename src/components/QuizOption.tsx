import React from 'react';
import { Check, X } from 'lucide-react';

interface QuizOptionProps {
  index: number;
  text: string;
  isAnswered: boolean;
  isSelected: boolean;
  isCorrectOption: boolean;
  onSelect: () => void;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

export const QuizOption: React.FC<QuizOptionProps> = ({
  index,
  text,
  isAnswered,
  isSelected,
  isCorrectOption,
  onSelect,
}) => {
  const letter = OPTION_LETTERS[index] || `${index + 1}`;

  let stateStyles = 'bg-white border-slate-200 text-slate-800 hover:border-brand-400 hover:bg-brand-50/30';
  let badgeStyles = 'bg-slate-100 text-slate-700 border-slate-200';

  if (isAnswered) {
    if (isSelected && isCorrectOption) {
      // User picked correctly
      stateStyles = 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/20';
      badgeStyles = 'bg-emerald-600 text-white border-emerald-600';
    } else if (isSelected && !isCorrectOption) {
      // User picked wrongly
      stateStyles = 'bg-rose-50 border-rose-500 text-rose-950 ring-2 ring-rose-500/20';
      badgeStyles = 'bg-rose-600 text-white border-rose-600';
    } else if (!isSelected && isCorrectOption) {
      // Show which one was correct
      stateStyles = 'bg-emerald-50/60 border-emerald-400 text-emerald-900 border-dashed';
      badgeStyles = 'bg-emerald-500 text-white border-emerald-500';
    } else {
      // Unselected other options
      stateStyles = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
      badgeStyles = 'bg-slate-200 text-slate-400 border-slate-200';
    }
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={isAnswered}
      className={`w-full p-4 sm:p-5 rounded-2xl border-2 text-left flex items-center justify-between gap-4 transition-all duration-150 ${stateStyles} ${
        !isAnswered ? 'cursor-pointer active:scale-[0.99]' : 'cursor-default'
      }`}
    >
      <div className="flex items-center gap-3.5">
        <span
          className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm border flex-shrink-0 transition-colors ${badgeStyles}`}
        >
          {letter}
        </span>
        <span className="font-medium text-base sm:text-lg leading-relaxed">
          {text}
        </span>
      </div>

      {isAnswered && (
        <div className="flex-shrink-0">
          {isSelected && isCorrectOption && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
              <Check className="w-3.5 h-3.5" /> Correct
            </span>
          )}
          {isSelected && !isCorrectOption && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-100 px-2.5 py-1 rounded-full">
              <X className="w-3.5 h-3.5" /> Incorrect
            </span>
          )}
          {!isSelected && isCorrectOption && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
              Correct answer
            </span>
          )}
        </div>
      )}
    </button>
  );
};
