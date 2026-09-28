import React, { useRef, useEffect } from 'react';
import type { QuestionStatus } from '../../types';
import { Check, X } from 'lucide-react';

interface WrittenInputProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
  status: QuestionStatus;
  isShaking: boolean;
  placeholder?: string;
}

export const WrittenInput: React.FC<WrittenInputProps> = ({
  value,
  onChange,
  onSubmit,
  status,
  isShaking,
  placeholder = 'Type your answer here...',
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep input focused automatically
  useEffect(() => {
    if (status === 'idle' || status === 'incorrect_retry') {
      inputRef.current?.focus();
    }
  }, [status]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSubmit();
    }
  };

  const isLocked = status === 'correct' || status === 'revealed_failed';

  let borderStyle = 'border-slate-300 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 bg-white';
  if (status === 'correct') {
    borderStyle = 'border-emerald-500 bg-emerald-50/40 text-emerald-950 font-bold';
  } else if (status === 'incorrect_retry' || status === 'revealed_failed') {
    borderStyle = 'border-rose-500 bg-rose-50/40 text-rose-950 font-medium';
  }

  return (
    <div className={`relative w-full ${isShaking ? 'animate-shake' : ''}`}>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isLocked}
        placeholder={placeholder}
        autoComplete="off"
        autoCorrect="off"
        spellCheck="false"
        className={`w-full px-5 py-4 rounded-2xl border-2 text-lg sm:text-xl transition-all outline-none ${borderStyle} ${
          isLocked ? 'cursor-default' : ''
        }`}
      />

      {status === 'correct' && (
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-emerald-600">
          <Check className="w-6 h-6 stroke-[3]" />
        </div>
      )}

      {(status === 'incorrect_retry' || status === 'revealed_failed') && (
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-rose-600">
          <X className="w-6 h-6 stroke-[3]" />
        </div>
      )}
    </div>
  );
};
