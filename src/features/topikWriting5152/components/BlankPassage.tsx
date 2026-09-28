import type { SourceAnswerBlank } from '../types';
import { renderBlankSegments } from '../utils';

interface BlankPassageProps {
  body: string;
  blanks: SourceAnswerBlank[];
  answers: Record<string, string>;
  onAnswerChange: (key: string, value: string) => void;
  disabled?: boolean;
}

export function BlankPassage({ body, blanks, answers, onAnswerChange, disabled = false }: BlankPassageProps) {
  const byKey = new Map(blanks.map((blank) => [blank.key, blank]));
  return (
    <div lang="ko" className="whitespace-pre-line rounded-lg border border-slate-200 bg-white p-5 text-base leading-9 text-slate-900">
      {renderBlankSegments(body, blanks.map((blank) => blank.key)).map((segment, index) => {
        const blank = byKey.get(segment);
        if (!blank) return <span key={index}>{segment}</span>;
        return <label key={blank.id} className="mx-1 inline-flex max-w-full items-center gap-2 align-middle">
          <span className="text-sm font-bold text-brand-700">{blank.key}</span>
          <input
            value={answers[blank.key] || ''}
            onChange={(event) => onAnswerChange(blank.key, event.target.value)}
            disabled={disabled}
            aria-label={'Đáp án ' + blank.key}
            className="w-48 max-w-[56vw] border-b-2 border-brand-400 bg-brand-50 px-2 py-1 text-sm font-semibold text-slate-900 outline-none focus:border-brand-700 disabled:bg-slate-100"
          />
        </label>;
      })}
    </div>
  );
}
