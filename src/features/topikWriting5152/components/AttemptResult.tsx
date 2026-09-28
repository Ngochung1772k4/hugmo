import type { SourceAnswerBlank, WritingBlankAttempt } from '../types';

export function AttemptResult({ attempt, blanks }: { attempt: WritingBlankAttempt; blanks: SourceAnswerBlank[] }) {
  const blankByKey = new Map(blanks.map((blank) => [blank.key, blank]));
  return (
    <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5">
      <p className="text-sm font-bold text-slate-900">Kết quả: {attempt.score}/{blanks.length} đáp án theo sách</p>
      <div className="mt-4 space-y-3">
        {attempt.result.blanks.map((result) => {
          const blank = blankByKey.get(result.key);
          const isCorrect = result.status === 'SOURCE_MATCH';
          return <article key={result.key} className={'border-l-2 px-3 py-2 ' + (isCorrect ? 'border-emerald-500 bg-emerald-50/60' : 'border-rose-500 bg-rose-50/60')}>
            <p className="text-sm font-bold text-slate-900">{result.key} · {isCorrect ? 'Khớp đáp án sách' : result.status === 'EMPTY' ? 'Chưa trả lời' : 'Chưa khớp đáp án sách'}</p>
            {!isCorrect && <p className="mt-1 text-sm text-slate-600">Đáp án sách: <span lang="ko" className="font-semibold">{blank?.sourceAnswerVariants.join(' / ')}</span></p>}
            {isCorrect && result.matchedVariant && <p lang="ko" className="mt-1 text-sm text-emerald-800">{result.matchedVariant}</p>}
          </article>;
        })}
      </div>
      <p className="mt-4 text-xs text-slate-500">Kết quả chỉ so khớp chính xác với các biến thể đáp án được cung cấp trong sách.</p>
    </section>
  );
}
