import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ListX, Loader2 } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { getTopikReadingService } from '../service';
import { getProgress } from '../utils';
import type { TopikQuestion } from '../types';

export function TopikWrongPage() {
  const { user, isDemo } = useAuth();
  const service = useMemo(() => getTopikReadingService(isDemo), [isDemo]);
  const [questions, setQuestions] = useState<TopikQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { if (!user) return; Promise.all([service.getQuestions(), service.getAttempts(user.id)]).then(([all, attempts]) => { const wrong = new Set(getProgress(all.length, attempts).unresolvedWrongQuestionIds); setQuestions(all.filter((question) => wrong.has(question.id))); }).catch((reason: any) => setError(reason?.message || 'Không thể tải câu sai.')).finally(() => setLoading(false)); }, [service, user]);
  return <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-fadeIn"><Link to="/topik/reading/1-4" className="text-sm font-semibold text-slate-500 hover:text-slate-900">← TOPIK Reading 1-4</Link><h1 className="mt-5 text-3xl font-extrabold">Ôn câu sai</h1><p className="mt-2 text-sm text-slate-500">Danh sách dựa trên lần trả lời gần nhất. Lịch sử sai trước đó vẫn được lưu để thống kê.</p>{loading && <div className="py-16 flex justify-center gap-2 text-slate-500"><Loader2 className="w-5 h-5 animate-spin" />Đang tải...</div>}{error && <div className="mt-6 p-4 rounded-lg bg-rose-50 text-rose-700 text-sm flex gap-2"><AlertCircle className="w-5 h-5 shrink-0" />{error}</div>}{!loading && !error && (questions.length ? <><div className="mt-6 space-y-3">{questions.map((question) => <div key={question.id} className="bg-white border border-slate-200 rounded-xl p-4"><p className="text-xs font-bold text-rose-700">{question.kind === 'FILL_GRAMMAR' ? 'Câu 1-2' : 'Câu 3-4'}</p><p lang="ko" className="mt-2 font-medium leading-relaxed">{question.stem_ko}</p></div>)}</div><Link to="/topik/reading/1-4/practice?mode=wrong" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white"><ListX className="w-4 h-4" />Làm lại {questions.length} câu</Link></> : <div className="mt-8 bg-white border border-dashed border-slate-300 rounded-xl p-10 text-center"><ListX className="w-10 h-10 text-slate-400 mx-auto" /><p className="mt-3 font-bold">Chưa có câu sai cần ôn</p><p className="mt-1 text-sm text-slate-500">Hãy thử một lượt luyện tập trước.</p></div>)}</div>;
}
