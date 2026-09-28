import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { WriteAttemptRecord, WriteDirection } from '../../types';
import confetti from 'canvas-confetti';
import {
  Award,
  CheckCircle2,
  XCircle,
  RotateCcw,
  BookOpen,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface WrittenResultProps {
  studySetId: string;
  records: WriteAttemptRecord[];
  roundNumber: number;
  direction: WriteDirection;
  onRetryWrong: () => void;
  onStudyAgain: () => void;
}

export const WrittenResult: React.FC<WrittenResultProps> = ({
  studySetId,
  records,
  roundNumber,
  direction,
  onRetryWrong,
  onStudyAgain,
}) => {
  const total = records.length;
  const passedRecords = records.filter((r) => r.isPassed);
  const failedRecords = records.filter((r) => !r.isPassed);
  const passedCount = passedRecords.length;
  const failedCount = failedRecords.length;
  const accuracy = total > 0 ? Math.round((passedCount / total) * 100) : 0;

  const isAllMastered = failedCount === 0;

  useEffect(() => {
    if (isAllMastered) {
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore if canvas not supported
      }
    }
  }, [isAllMastered]);

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 sm:px-6 animate-fadeIn">
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/90 shadow-xl text-center">
        {/* Top Badge & Header */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white flex items-center justify-center mx-auto mb-5 shadow-lg shadow-brand-500/25">
          {isAllMastered ? (
            <Sparkles className="w-8 h-8" />
          ) : (
            <Award className="w-8 h-8" />
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
          {isAllMastered ? '🎉 All words mastered!' : `Round ${roundNumber} Complete`}
        </h1>
        <p className="text-sm text-slate-500 mb-8">
          {isAllMastered
            ? 'Congratulations! You have successfully recalled and typed all vocabulary words.'
            : 'Review the words you missed and retry to master them.'}
        </p>

        {/* Score Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-50 to-slate-100/70 border border-slate-200/80 mb-8">
          <div className="text-5xl sm:text-6xl font-black text-brand-600 tracking-tight font-mono mb-2">
            {accuracy}%
          </div>
          <div className="text-sm font-semibold text-slate-600 mb-6">
            Score: {passedCount} / {total} Passed
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
            <div className="p-3.5 bg-white rounded-xl border border-slate-200 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-xs text-slate-400 font-semibold">Passed</div>
                <div className="text-lg font-bold text-slate-900 font-mono">{passedCount}</div>
              </div>
            </div>

            <div className="p-3.5 bg-white rounded-xl border border-slate-200 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-rose-100 text-rose-700">
                <XCircle className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-xs text-slate-400 font-semibold">Need Review</div>
                <div className="text-lg font-bold text-slate-900 font-mono">{failedCount}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Need Review Section (Only for failed cards) */}
        {failedRecords.length > 0 && (
          <div className="text-left mb-8 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Cards to Review ({failedRecords.length})
              </h3>
              <span className="text-xs text-slate-400">
                Will be included in Retry
              </span>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
              {failedRecords.map((record, idx) => {
                const targetText =
                  direction === 'meaning_to_term' ? record.card.term : record.card.meaning;
                const promptText =
                  direction === 'meaning_to_term' ? record.card.meaning : record.card.term;
                const lastAttempt = record.userAnswers[record.userAnswers.length - 1] || '(Empty)';

                return (
                  <div key={idx} className="p-4 sm:p-5 text-xs sm:text-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-extrabold text-slate-900 text-base">
                        {promptText}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                        {record.attemptsCount} attempts
                      </span>
                    </div>

                    <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200/60 font-mono">
                      <div className="text-rose-600 flex items-center gap-2">
                        <span className="text-slate-400 text-xs font-sans">Your answer:</span>
                        <span className="line-through">{lastAttempt}</span>
                      </div>
                      <div className="text-emerald-700 font-bold flex items-center gap-2">
                        <span className="text-slate-400 text-xs font-sans">Correct answer:</span>
                        <span>{targetText}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {/* Main Action: Retry Wrong Answers if any failed */}
          {failedCount > 0 && (
            <button
              type="button"
              onClick={onRetryWrong}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md shadow-brand-500/25 transition-all active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retry Wrong Answers ({failedCount})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={onStudyAgain}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Study Again (All Cards)</span>
          </button>

          <Link
            to={`/study-sets/${studySetId}`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-sm transition-all"
          >
            <BookOpen className="w-4 h-4" />
            <span>Back to Set</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
