import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { ReadingSourceOptions } from '../components/ReadingSourceOptions';
import { getTopikReading2021Service } from '../service';
import type { Reading2021Attempt, Reading2021Exercise, ReadingIdiom } from '../types';
import { sourceMeaningOrFallback } from '../utils';

export function Reading21PracticePage() {
  const { id = '' } = useParams();
  const { user, isDemo } = useAuth();
  const service = useMemo(() => getTopikReading2021Service(isDemo), [isDemo]);
  const [exercise, setExercise] = useState<Reading2021Exercise | null>(null);
  const [idioms, setIdioms] = useState<ReadingIdiom[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [attempt, setAttempt] = useState<Reading2021Attempt | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { void Promise.all([service.getQ21Exercises(), service.getIdioms()]).then(([items, nextIdioms]) => { setExercise(items.find((item) => item.id === id) || null); setIdioms(nextIdioms); }).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Không thể tải bài luyện.')); }, [id, service]);
  if (error) return <div className="max-w-xl mx-auto px-4 py-14 text-center text-rose-700">{error}</div>;
  if (!exercise) return <div className="min-h-[60vh] flex items-center justify-center gap-3 text-slate-500"><Loader2 className="w-6 h-6 animate-spin" />Đang tải bài luyện...</div>;
  const question = exercise.targetQuestion;
  const idiomById = new Map(idioms.map((item) => [item.id, item]));
  const correctIdiom = question.correctIdiomId ? idiomById.get(question.correctIdiomId) : null;
  const submit = async () => {
    if (!user || !selectedIndex || saving || attempt) return;
    try { setSaving(true); setAttempt(await service.recordAttempt({ attemptId: crypto.randomUUID(), userId: user.id, questionId: question.id, selectedIndex, mode: 'PRACTICE' })); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Không thể lưu đáp án.'); }
    finally { setSaving(false); }
  };
  return <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10 animate-fadeIn">
    <Link to="/topik/reading/21" className="text-sm font-semibold text-slate-500 hover:text-slate-900">← Câu 21</Link>
    <p className="mt-5 text-xs font-bold uppercase tracking-wider text-rose-700">Câu 21 · {exercise.setType === 'SAMPLE' ? 'Mẫu' : 'Luyện tập'} · tr. {exercise.sourcePage}</p>
    <h1 className="mt-2 text-xl sm:text-2xl font-extrabold">Ngữ cảnh → hình thức → nghĩa → chọn 관용 표현</h1>
    <section className="mt-7 rounded-lg border border-slate-200 bg-white p-5 sm:p-6"><h2 className="font-bold">1. Đọc câu quanh blank</h2><p lang="ko" className="mt-4 whitespace-pre-wrap leading-8 text-slate-900">{exercise.passageKo}</p></section>
    <section className="mt-7"><h2 className="font-bold">2. So sánh bốn biểu hiện</h2><p className="mt-1 text-sm text-slate-500">Quan sát sắc thái tích cực, tiêu cực hoặc hành động; đồng thời kiểm tra hình thức ngữ pháp trong câu.</p><div className="mt-4"><ReadingSourceOptions options={question.options} selectedIndex={selectedIndex} answerIndex={attempt ? question.answerIndex : undefined} answered={Boolean(attempt)} onSelect={setSelectedIndex} /></div></section>
    {!attempt && <button type="button" disabled={!selectedIndex || saving} onClick={() => void submit()} className="mt-7 rounded-lg bg-brand-600 px-5 py-3 text-sm font-semibold text-white disabled:bg-slate-300">{saving ? 'Đang kiểm tra...' : 'Kiểm tra ngữ cảnh'}</button>}
    {attempt && <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5"><div className="flex gap-3">{attempt.isCorrect ? <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" /> : <XCircle className="w-6 h-6 text-rose-600 shrink-0" />}<div><p className="font-bold">{attempt.isCorrect ? 'Đúng' : 'Chưa đúng'}</p><p className="mt-1 text-sm text-slate-600">Đáp án nguồn:</p><p lang="ko" className="mt-1 font-bold text-slate-900">{question.options[question.answerIndex - 1]}</p>{correctIdiom && <p className="mt-2 text-sm text-slate-600">Nghĩa nguồn: {sourceMeaningOrFallback(correctIdiom.meaningViSource)}</p>}</div></div><div className="mt-5 border-t border-slate-100 pt-5"><p className="font-bold">Bốn lựa chọn trong ngữ cảnh này</p><div className="mt-3 space-y-2">{question.options.map((option, index) => { const idiom = question.optionIdiomIds[index] ? idiomById.get(question.optionIdiomIds[index] || '') : null; return <div key={option} className="rounded-md bg-slate-50 px-3 py-2 text-sm"><span lang="ko" className="font-bold text-slate-900">{option}</span><span className="ml-2 text-slate-600">· {sourceMeaningOrFallback(idiom?.meaningViSource || null)}</span></div>; })}</div></div></section>}
  </div>;
}
