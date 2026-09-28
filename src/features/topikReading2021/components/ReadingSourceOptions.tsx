interface ReadingSourceOptionsProps {
  options: string[];
  selectedIndex: number | null;
  answerIndex?: number;
  answered: boolean;
  onSelect: (index: number) => void;
}

export function ReadingSourceOptions({ options, selectedIndex, answerIndex, answered, onSelect }: ReadingSourceOptionsProps) {
  return <div className="space-y-3">
    {options.map((option, index) => {
      const optionNumber = index + 1;
      const selected = selectedIndex === optionNumber;
      const correct = answered && answerIndex === optionNumber;
      const wrong = answered && selected && !correct;
      const state = correct ? 'border-emerald-500 bg-emerald-50 text-emerald-950' : wrong ? 'border-rose-500 bg-rose-50 text-rose-950' : selected ? 'border-brand-500 bg-brand-50 text-slate-950' : 'border-slate-200 bg-white text-slate-800 hover:border-brand-300';
      return <button key={option} type="button" disabled={answered} onClick={() => onSelect(optionNumber)} className={'flex w-full items-start gap-3 rounded-lg border p-4 text-left text-sm font-semibold transition-colors disabled:cursor-default ' + state}>
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-current/20 bg-white/70 text-xs">{optionNumber}</span>
        <span lang="ko" className="leading-6">{option}</span>
      </button>;
    })}
  </div>;
}
