import { CheckCircle2, XCircle } from 'lucide-react';
import type { TopikOption as Option } from '../types';

interface TopikOptionProps {
  option: Option;
  index: number;
  selected: boolean;
  answered: boolean;
  onSelect: () => void;
}

export function TopikOption({ option, index, selected, answered, onSelect }: TopikOptionProps) {
  const state = !answered
    ? 'border-slate-200 bg-white hover:border-brand-400 hover:bg-brand-50/30'
    : option.is_correct
      ? 'border-emerald-500 bg-emerald-50 text-emerald-950'
      : selected
        ? 'border-rose-500 bg-rose-50 text-rose-950'
        : 'border-slate-200 bg-slate-50 text-slate-400';
  const label = option.is_correct ? 'Đáp án đúng' : selected ? 'Đáp án đã chọn, chưa đúng' : '';

  return (
    <button
      type="button"
      disabled={answered}
      onClick={onSelect}
      className={`w-full min-h-16 border-2 rounded-xl px-4 py-3 flex items-center gap-3 text-left transition-colors ${state}`}
      aria-label={`${index + 1}. ${option.text_ko}${label ? `. ${label}` : ''}`}
    >
      <span className="h-8 w-8 shrink-0 rounded-lg border border-current/20 bg-white/70 flex items-center justify-center text-sm font-bold">
        {index + 1}
      </span>
      <span className="flex-1 text-base sm:text-lg font-medium leading-relaxed">{option.text_ko}</span>
      {answered && option.is_correct && <CheckCircle2 className="w-5 h-5 shrink-0" aria-label="Đúng" />}
      {answered && selected && !option.is_correct && <XCircle className="w-5 h-5 shrink-0" aria-label="Sai" />}
    </button>
  );
}
