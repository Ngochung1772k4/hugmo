import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, Lightbulb, Loader2, XCircle } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { ReadingSourceOptions } from '../components/ReadingSourceOptions';
import { getTopikReading2021Service } from '../service';
import type { Reading2021Attempt, Reading2021Exercise } from '../types';
import { repeatedCoreTerms } from '../utils';

export function Reading20PracticePage() {
  const { id = '' } = useParams();
  const { user, isDemo } = useAuth();
  const service = useMemo(() => getTopikReading2021Service(isDemo), [isDemo]);
  const [exercise, setExercise] = useState<Reading2021Exercise | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [attempt, setAttempt] = useState<Reading2021Attempt | null>(null);
  const [hint, setHint] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { void service.getQ20Exercises().then((items) => setExercise(items.find((item) => item.id === id) || null)).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Không thể tải bài luyện.')); }, [id, service]);
  if (error) return <div className="max-w-xl mx-auto px-4 py-14 text-center text-rose-700">{error}</div>;
  if (!exercise) return <div className="min-h-[60vh] flex items-center justify-center gap-3 text-slate-500"><Loader2 className="w-6 h-6 animate-spin" />Đang tải bài luyện...</div>;
  const question = exercise.targetQuestion;
  const submit = async () => {
    if (!user || !selectedIndex || saving || attempt) return;
    try { setSaving(true); setAttempt(await service.recordAttempt({ attemptId: crypto.randomUUID(), userId: user.id, questionId: question.id, selectedIndex, mode: 'GUIDED' })); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Không thể lưu đáp án.'); }
    finally { setSaving(false); }
  };
  const correctOption = question.options[question.answerIndex - 1];
  return <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10 animate-fadeIn">
    <Link to="/topik/reading/20" className="text-sm font-semibold text-slate-500 hover:text-slate-900">← Câu 20</Link>
    <p className="mt-5 text-xs font-bold uppercase tracking-wider text-indigo-700">Câu 20 · {exercise.setType === 'SAMPLE' ? 'Mẫu' : 'Luyện tập'} · tr. {exercise.sourcePage}</p>
    <h1 className="mt-2 text-xl sm:text-2xl font-extrabold">Đọc đáp án trước, rồi tìm ý trung tâm</h1>
    <section className="mt-7"><h2 className="font-bold">1. Câu hỏi và các lựa chọn</h2><p lang="ko" className="mt-2 text-sm font-semibold text-slate-700">{question.promptKo}</p><div className="mt-4"><ReadingSourceOptions options={question.options} selectedIndex={selectedIndex} answerIndex={attempt ? question.answerIndex : undefined} answered={Boolean(attempt)} onSelect={setSelectedIndex} /></div></section>
    <section className="mt-7 rounded-lg border border-slate-200 bg-white p-5 sm:p-6"><h2 className="font-bold">2. Đọc đoạn</h2><p lang="ko" className="mt-4 whitespace-pre-wrap leading-8 text-slate-900">{exercise.passageKo}</p></section>
    {!attempt && <section className="mt-5"><button type="button" onClick={() => setHint(true)} className="inline-flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-900"><Lightbulb className="w-4 h-4" />Tìm từ hoặc ý lặp lại</button>{hint && <div className="mt-3 rounded-lg bg-amber-50 p-4 text-sm"><p className="font-semibold">Từ được lặp lại theo cách tách từ đơn giản</p><div className="mt-2 flex flex-wrap gap-2">{repeatedCoreTerms(exercise.passageKo).map((term) => <span key={term} lang="ko" className="rounded-md bg-white px-2.5 py-1 font-semibold text-amber-900">{term}</span>) || <span>Không có từ lặp rõ ràng; hãy theo ý bao quát của đoạn.</span>}</div></div>}</section>}
    {!attempt && <button type="button" disabled={!selectedIndex || saving} onClick={() => void submit()} className="mt-7 rounded-lg bg-brand-600 px-5 py-3 text-sm font-semibold text-white disabled:bg-slate-300">{saving ? 'Đang kiểm tra...' : 'Kiểm tra chủ đề chính'}</button>}
    {attempt && <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5"><div className="flex gap-3">{attempt.isCorrect ? <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" /> : <XCircle className="w-6 h-6 text-rose-600 shrink-0" />}<div><p className="font-bold">{attempt.isCorrect ? 'Đúng' : 'Chưa đúng'}</p><p className="mt-1 text-sm text-slate-600">Đáp án nguồn:</p><p lang="ko" className="mt-1 font-bold text-slate-900">{correctOption}</p><p className="mt-3 text-sm text-slate-600">Đối chiếu lại lựa chọn này với ý bao quát toàn đoạn, không chỉ một câu chi tiết.</p></div></div></section>}
  </div>;
}
