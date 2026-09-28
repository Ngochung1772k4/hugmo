import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Loader2, ScanSearch } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { getTopikReading2021Service } from '../service';
import type { Reading2021Exercise } from '../types';

export function Reading20HubPage() {
  const { isDemo } = useAuth();
  const service = useMemo(() => getTopikReading2021Service(isDemo), [isDemo]);
  const [exercises, setExercises] = useState<Reading2021Exercise[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { void service.getQ20Exercises().then(setExercises).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Không thể tải Câu 20.')); }, [service]);
  if (error) return <div className="max-w-xl mx-auto px-4 py-14 text-center text-rose-700">{error}</div>;
  if (!exercises.length) return <div className="min-h-[60vh] flex items-center justify-center gap-3 text-slate-500"><Loader2 className="w-6 h-6 animate-spin" />Đang chuẩn bị Câu 20...</div>;

  return <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 animate-fadeIn">
    <Link to="/dashboard" className="text-sm font-semibold text-slate-500 hover:text-slate-900">← Dashboard</Link>
    <p className="mt-5 text-xs font-bold uppercase tracking-wider text-indigo-700">TOPIK II · Reading</p>
    <h1 className="mt-1 text-3xl sm:text-4xl font-extrabold">Câu 20</h1>
    <p className="mt-2 max-w-2xl text-sm text-slate-500">Chọn chủ đề hoặc nội dung trọng tâm, không bị kéo theo một chi tiết nhỏ trong đoạn.</p>
    <section className="mt-8 border-y border-slate-200 py-6">
      <div className="flex items-center gap-2"><ScanSearch className="w-5 h-5 text-indigo-600" /><h2 className="font-bold">Cách đọc từ nguồn sách</h2></div>
      <ol className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-700">
        <li className="rounded-lg bg-indigo-50 p-4">1. Đọc câu hỏi và bốn đáp án trước.</li>
        <li className="rounded-lg bg-indigo-50 p-4">2. Đọc đoạn, tìm ý lặp lại hoặc ý bao quát nhất.</li>
        <li className="rounded-lg bg-indigo-50 p-4">3. Loại lựa chọn quá hẹp hoặc chỉ đúng một chi tiết.</li>
        <li className="rounded-lg bg-indigo-50 p-4">4. Đối chiếu ai, việc gì, ở đâu, khi nào, tại sao, như thế nào nếu cần.</li>
      </ol>
    </section>
    <section className="mt-8">
      <h2 className="text-lg font-bold">Bài nguồn 19–20</h2>
      <p className="mt-1 text-sm text-slate-500">Câu 19 vẫn được lưu cùng passage để bảo toàn ngữ cảnh, nhưng bài này chỉ luyện kỹ năng Câu 20.</p>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">{exercises.map((exercise, index) => <Link key={exercise.id} to={'/topik/reading/20/practice/' + exercise.id} className="group border border-slate-200 bg-white p-5 rounded-lg hover:border-indigo-400 hover:shadow-sm">
        <p className="text-xs font-bold text-indigo-700">{exercise.setType === 'SAMPLE' ? 'Mẫu' : 'Luyện tập'} · tr. {exercise.sourcePage}</p>
        <p lang="ko" className="mt-2 line-clamp-3 font-semibold leading-7 text-slate-900">{exercise.targetQuestion.options[exercise.targetQuestion.answerIndex - 1]}</p>
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-brand-700">Bài {index + 1} <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" /></span>
      </Link>)}</div>
    </section>
  </div>;
}
