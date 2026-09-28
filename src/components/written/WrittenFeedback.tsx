import React from 'react';
import type { QuestionStatus } from '../../types';
import { CheckCircle, XCircle, ArrowRight, HelpCircle } from 'lucide-react';

interface WrittenFeedbackProps {
  status: QuestionStatus;
  attemptsCount: number;
  targetAnswer: string;
  onCheck: () => void;
  onNext: () => void;
  onReveal: () => void;
  hasInput: boolean;
}

export const WrittenFeedback: React.FC<WrittenFeedbackProps> = ({
  status,
  attemptsCount,
  targetAnswer,
  onCheck,
  onNext,
  onReveal,
  hasInput,
}) => {
  const remainingAttempts = Math.max(0, 3 - attemptsCount);

  return (
    <div className="mt-6 space-y-4">
      {/* 1. STATE: Idle */}
      {status === 'idle' && (
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={onCheck}
            disabled={!hasInput}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-base shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-98"
          >
            <span>Check</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 bg-brand-700/60 rounded text-xs font-mono text-white/90">
              Enter
            </kbd>
          </button>
        </div>
      )}

      {/* 2. STATE: Incorrect - Retry Mode (Attempt 1 or 2) */}
      {status === 'incorrect_retry' && (
        <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 animate-fadeIn space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-100 text-rose-600 flex-shrink-0">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-rose-900 text-sm">
                Incorrect. Try again.
              </p>
              <p className="text-xs text-rose-600 mt-0.5">
                Attempt {attemptsCount} of 3 ({remainingAttempts} {remainingAttempts === 1 ? 'attempt' : 'attempts'} remaining)
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-1 border-t border-rose-100">
            <button
              type="button"
              onClick={onReveal}
              className="w-full sm:w-auto text-xs font-semibold text-rose-700 hover:text-rose-900 hover:bg-rose-100/60 px-4 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Reveal Answer</span>
            </button>

            <button
              type="button"
              onClick={onCheck}
              disabled={!hasInput}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-98"
            >
              <span>Check Again</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 bg-rose-700/60 rounded text-xs font-mono text-white/90">
                Enter
              </kbd>
            </button>
          </div>
        </div>
      )}

      {/* 3. STATE: Correct (Attempts 1, 2, or 3) */}
      {status === 'correct' && (
        <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 animate-fadeIn flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 flex-shrink-0">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-emerald-950 text-base">
                Correct! Well done.
              </p>
              <p className="text-xs text-emerald-700 mt-0.5">
                Solved on attempt {attemptsCount} of 3
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onNext}
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 active:scale-98"
          >
            <span>Next Question</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 bg-emerald-700/60 rounded text-xs font-mono text-white/90">
              Enter
            </kbd>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 4. STATE: Revealed / Failed (After 3 attempts or user clicked Reveal) */}
      {status === 'revealed_failed' && (
        <div className="p-5 rounded-2xl bg-slate-900 text-white animate-fadeIn flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="text-left space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
              Correct Answer
            </span>
            <div className="text-xl sm:text-2xl font-black text-white tracking-wide">
              {targetAnswer}
            </div>
          </div>

          <button
            type="button"
            onClick={onNext}
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-lg shadow-brand-500/30 transition-all flex items-center justify-center gap-2 active:scale-98"
          >
            <span>Next Question</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 bg-brand-700 rounded text-xs font-mono text-white/90">
              Enter
            </kbd>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
