import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Q54TrainingSession } from '../types';

export function TrainingPageHeader({ session, title, subtitle }: { session: Q54TrainingSession; title: string; subtitle: string }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!session.ends_at) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [session.ends_at]);
  const minutes = session.ends_at ? Math.max(0, Math.ceil((new Date(session.ends_at).getTime() - now) / 60_000)) : null;
  return <><Link to={`/topik/writing/54/lab/${session.question_id}`} className="text-sm font-semibold text-slate-500 hover:text-slate-900">← Q54 Training Lab</Link><div className="mt-5 flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-wider text-brand-700">{session.mode === 'EXAM' ? 'Exam Mode' : 'Practice Mode'}</p><h1 className="mt-1 text-2xl font-extrabold text-slate-900">{title}</h1><p className="mt-1 text-sm text-slate-600">{subtitle}</p></div>{minutes !== null && <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-bold text-rose-800">Còn {minutes} phút</div>}</div></>;
}
