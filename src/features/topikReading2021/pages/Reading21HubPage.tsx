import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpenText, Loader2, MessagesSquare } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { getTopikReading2021Service } from '../service';
import type { Reading2021Exercise, ReadingIdiom } from '../types';

export function Reading21HubPage() {
  const { isDemo } = useAuth();
  const service = useMemo(() => getTopikReading2021Service(isDemo), [isDemo]);
  const [exercises, setExercises] = useState<Reading2021Exercise[]>([]);
  const [idioms, setIdioms] = useState<ReadingIdiom[]>([]);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { void Promise.all([service.getQ21Exercises(), service.getIdioms()]).then(([nextExercises, nextIdioms]) => { setExercises(nextExercises); setIdioms(nextIdioms); }).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Không thể tải Câu 21.')); }, [service]);
  if (error) return <div className="max-w-xl mx-auto px-4 py-14 text-center text-rose-700">{error}</div>;
  if (!exercises.length) return <div className="min-h-[60vh] flex items-center justify-center gap-3 text-slate-500"><Loader2 className="w-6 h-6 animate-spin" />Đang chuẩn bị Câu 21...</div>;
  const priorityS = idioms.filter((item) => item.priority === 'S').length;
  return <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 animate-fadeIn">
    <Link to="/dashboard" className="text-sm font-semibold text-slate-500 hover:text-slate-900">← Dashboard</Link>
    <p className="mt-5 text-xs font-bold uppercase tracking-wider text-rose-700">TOPIK II · Reading</p>
    <h1 className="mt-1 text-3xl sm:text-4xl font-extrabold">Câu 21</h1>
    <p className="mt-2 max-w-2xl text-sm text-slate-500">관용 표현 trong ngữ cảnh: hình thức, hình ảnh gợi nhớ, nghĩa nguồn và câu văn phải đi cùng nhau.</p>
    <section className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
      <Link to="/topik/reading/21/idioms" className="group border border-rose-200 bg-white p-6 rounded-lg hover:border-rose-400 hover:shadow-sm"><BookOpenText className="w-6 h-6 text-rose-700" /><h2 className="mt-4 text-lg font-bold">Idiom Bank</h2><p className="mt-1 text-sm text-slate-500">Học theo bộ phận cơ thể và nhóm hình ảnh. Ưu tiên S trước, sau đó A và B.</p><p className="mt-4 text-sm font-bold text-rose-700">{idioms.length} expressions · {priorityS} S priority <ArrowRight className="ml-1 inline w-4 h-4 group-hover:translate-x-0.5 transition-transform" /></p></Link>
      <Link to={'/topik/reading/21/practice/' + exercises[0].id} className="group border border-indigo-200 bg-white p-6 rounded-lg hover:border-indigo-400 hover:shadow-sm"><MessagesSquare className="w-6 h-6 text-indigo-700" /><h2 className="mt-4 text-lg font-bold">Source Context</h2><p className="mt-1 text-sm text-slate-500">Đọc ngữ cảnh quanh blank, so sánh 4 관용 표현 rồi mới chọn.</p><p className="mt-4 text-sm font-bold text-indigo-700">8 passages nguồn <ArrowRight className="ml-1 inline w-4 h-4 group-hover:translate-x-0.5 transition-transform" /></p></Link>
    </section>
    <section className="mt-10"><h2 className="text-lg font-bold">Bài nguồn 21–22</h2><p className="mt-1 text-sm text-slate-500">Câu 22 được giữ trong database cùng passage để không mất nội dung gốc; route này chỉ thực hành Câu 21.</p><div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">{exercises.map((exercise, index) => <Link key={exercise.id} to={'/topik/reading/21/practice/' + exercise.id} className="group border border-slate-200 bg-white p-5 rounded-lg hover:border-indigo-400 hover:shadow-sm"><p className="text-xs font-bold text-indigo-700">{exercise.setType === 'SAMPLE' ? 'Mẫu' : 'Luyện tập'} · tr. {exercise.sourcePage}</p><p lang="ko" className="mt-2 font-bold text-slate-900">{exercise.targetQuestion.options[exercise.targetQuestion.answerIndex - 1]}</p><span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-brand-700">Ngữ cảnh {index + 1} <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" /></span></Link>)}</div></section>
  </div>;
}
