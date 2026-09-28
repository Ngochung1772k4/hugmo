import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, BookMarked, Loader2 } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { getQ54Service } from '../service';
import type { Q54ErrorType, Q54UserError } from '../types';

const types: Array<Q54ErrorType | 'ALL'> = ['ALL', 'PARTICLE', 'GRAMMAR', 'VOCABULARY', 'COLLOCATION', 'SPELLING', 'LOGIC', 'REPETITION', 'QUESTION_RELEVANCE'];

export function Q54ErrorNotebookPage() {
  const { user, isDemo } = useAuth();
  const service = useMemo(() => getQ54Service(isDemo), [isDemo]);
  const [items, setItems] = useState<Q54UserError[]>([]);
  const [filter, setFilter] = useState<Q54ErrorType | 'ALL'>('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { if (!user) return; void service.getErrors(user.id).then(setItems).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Không thể tải Error Notebook.')).finally(() => setLoading(false)); }, [service, user]);
  const filtered = filter === 'ALL' ? items : items.filter((item) => item.error_type === filter);
  return <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10 animate-fadeIn"><Link to="/topik/writing/54" className="text-sm font-semibold text-slate-500 hover:text-slate-900">← TOPIK Writing 54</Link><div className="mt-5 flex items-center gap-3"><BookMarked className="w-8 h-8 text-brand-600" /><div><h1 className="text-3xl font-extrabold">Error Notebook</h1><p className="mt-1 text-sm text-slate-500">Lỗi lặp lại được gom vào một thẻ và đếm số lần xuất hiện.</p></div></div>{error && <div className="mt-6 flex gap-3 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"><AlertCircle className="w-5 h-5 shrink-0" />{error}</div>}<label className="mt-7 block text-sm font-semibold text-slate-700">Lọc lỗi<select value={filter} onChange={(event) => setFilter(event.target.value as Q54ErrorType | 'ALL')} className="mt-2 block w-full sm:w-64 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20">{types.map((type) => <option key={type} value={type}>{type === 'ALL' ? 'Tất cả lỗi' : type}</option>)}</select></label>{loading ? <div className="min-h-52 flex items-center justify-center gap-3 text-slate-500"><Loader2 className="w-5 h-5 animate-spin" />Đang tải lỗi...</div> : <div className="mt-6 divide-y border-y border-slate-200">{filtered.map((item) => <article key={item.id} className="py-5"><div className="flex flex-wrap items-center justify-between gap-3"><span className="text-xs font-bold text-rose-700">{item.error_type}</span><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">Lặp lại {item.occurrence_count} lần</span></div><p lang="ko" className="mt-3 text-sm text-rose-800">{item.original_text}</p><p lang="ko" className="mt-1 font-bold text-emerald-800">{item.corrected_text}</p><p className="mt-2 text-sm leading-6 text-slate-600">{item.explanation_vi}</p><p className="mt-3 text-xs text-slate-400">Lần gần nhất: {new Date(item.last_seen_at).toLocaleDateString('vi-VN')}</p></article>)}{!filtered.length && <p className="py-10 text-center text-sm text-slate-500">Chưa có lỗi nào được lưu. Hãy làm một bài dịch trước.</p>}</div>}</div>;
}
