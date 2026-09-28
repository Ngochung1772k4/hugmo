import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { getTopikWriting5152Service } from '../service';
import type { Q51Intent } from '../types';

const labels = { PREFERRED: 'Ưu tiên', ALTERNATIVE: 'Thay thế', PAIRED: 'Cặp biểu hiện' };

export function Writing51LearnPage() {
  const { isDemo } = useAuth();
  const service = useMemo(() => getTopikWriting5152Service(isDemo), [isDemo]);
  const [intents, setIntents] = useState<Q51Intent[]>([]);
  useEffect(() => { void service.getQ51Intents().then(setIntents); }, [service]);
  if (!intents.length) return <div className="min-h-[60vh] flex items-center justify-center gap-3 text-slate-500"><Loader2 className="w-6 h-6 animate-spin" />Đang tải công thức...</div>;
  return <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
    <Link to="/topik/writing/51" className="text-sm font-semibold text-slate-500 hover:text-slate-900">← Câu 51</Link>
    <h1 className="mt-5 text-2xl sm:text-3xl font-extrabold">Intent & công thức câu 51</h1>
    <p className="mt-2 text-sm text-slate-500">Nhận diện mục đích giao tiếp trước, rồi mới chọn biểu hiện phù hợp với văn phong thông báo/đề nghị.</p>
    <div className="mt-8 space-y-5">{intents.map((intent) => <section key={intent.id} className="border border-slate-200 bg-white rounded-lg p-5"><div className="flex flex-wrap items-baseline justify-between gap-2"><h2 lang="ko" className="text-lg font-bold">{intent.nameKo}</h2><p className="text-sm text-slate-500">{intent.nameVi}</p></div><div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">{(['PREFERRED', 'ALTERNATIVE', 'PAIRED'] as const).map((kind) => <div key={kind}><p className="text-xs font-bold uppercase tracking-wider text-slate-500">{labels[kind]}</p><div className="mt-2 space-y-2">{intent.patterns.filter((pattern) => pattern.patternKind === kind).map((pattern) => <p key={pattern.id} lang="ko" className="rounded-md bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800">{pattern.patternKo}</p>)}{!intent.patterns.some((pattern) => pattern.patternKind === kind) && <p className="text-sm text-slate-400">Không có</p>}</div></div>)}</div></section>)}</div>
  </div>;
}
