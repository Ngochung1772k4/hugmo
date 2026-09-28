import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
  className?: string;
  showFraction?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  total,
  className = '',
  showFraction = true,
}) => {
  const percentage = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;

  return (
    <div className={`w-full ${className}`}>
      {showFraction && (
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1.5">
          <span>Progress</span>
          <span className="text-brand-600 font-mono">
            {current} / {total} ({percentage}%)
          </span>
        </div>
      )}
      <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-brand-500 to-indigo-600 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
