import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, BookOpen, Brain, Clock3, ListX, Loader2, Sparkles, ScanText } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { getTopikReadingService } from '../service';
import { getProgress } from '../utils';
import type { TopikOverviewProgress } from '../types';

const activities = [
  { to: '/topik/reader', title: 'Interactive Reader', copy: 'Đọc bài, bôi chọn từ và lưu thẻ theo ngữ cảnh.', icon: ScanText, tone: 'text-teal-700 bg-teal-50' },
  { to: '/topik/reading/1-4/grammar', title: 'Học ngữ pháp', copy: 'Công thức, cách dùng và ví dụ.', icon: BookOpen, tone: 'text-brand-700 bg-brand-50' },
  { to: '/topik/reading/1-4/practice?mode=fill', title: 'Luyện câu 1-2', copy: 'Chọn cấu trúc phù hợp cho chỗ trống.', icon: Brain, tone: 'text-indigo-700 bg-indigo-50' },
  { to: '/topik/reading/1-4/similar', title: 'Học gần nghĩa', copy: 'So sánh trong đúng ngữ cảnh sử dụng.', icon: Sparkles, tone: 'text-violet-700 bg-violet-50' },
  { to: '/topik/reading/1-4/practice?mode=similar', title: 'Luyện câu 3-4', copy: 'Nhận diện cách diễn đạt tương đương.', icon: Brain, tone: 'text-sky-700 bg-sky-50' },
  { to: '/topik/reading/1-4/practice?mode=sprint', title: 'Sprint 4 câu', copy: '2 câu điền và 2 câu gần nghĩa trong 3 phút.', icon: Clock3, tone: 'text-amber-700 bg-amber-50' },
  { to: '/topik/reading/1-4/wrong', title: 'Ôn câu sai', copy: 'Làm lại các câu có lần trả lời gần nhất là sai.', icon: ListX, tone: 'text-rose-700 bg-rose-50' },
];

export function TopikOverviewPage() {
  const { user, isDemo } = useAuth();
  const service = useMemo(() => getTopikReadingService(isDemo), [isDemo]);
  const [progress, setProgress] = useState<TopikOverviewProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const [questions, attempts] = await Promise.all([service.getQuestions(), service.getAttempts(user.id)]);
        setProgress(getProgress(questions.length, attempts));
      } catch (reason: any) {
        setError(reason?.message || 'Không thể tải dữ liệu TOPIK.');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [service, user]);

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center gap-3 text-slate-500"><Loader2 className="w-6 h-6 animate-spin" />Đang tải TOPIK...</div>;
  if (error) return <div className="max-w-xl mx-auto p-8 my-16 bg-white border border-rose-200 rounded-2xl text-center"><AlertCircle className="w-9 h-9 text-rose-600 mx-auto mb-3" /><h1 className="font-bold text-lg">Không thể tải TOPIK</h1><p className="text-sm text-slate-500 mt-2">{error}</p></div>;

  const accuracy = progress && progress.totalAttempts ? Math.round((progress.correctAttempts / progress.totalAttempts) * 100) : 0;
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 animate-fadeIn">
      <div className="mb-8">
        <Link to="/dashboard" className="text-sm font-semibold text-slate-500 hover:text-slate-900">← Dashboard</Link>
        <p className="mt-5 text-xs font-bold uppercase tracking-wider text-brand-600">TOPIK II · Reading</p>
        <h1 className="mt-1 text-3xl sm:text-4xl font-extrabold text-slate-900">Câu 1-4</h1>
        <p className="mt-2 text-sm text-slate-500">Học ngữ pháp và luyện các dạng mở đầu phần Đọc hiểu.</p>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8" aria-label="Tiến độ TOPIK">
        <div className="bg-white border border-slate-200 rounded-xl p-5"><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Đã làm</p><p className="mt-2 text-2xl font-extrabold">{progress?.attemptedQuestions ?? 0}<span className="text-base text-slate-400"> / {progress?.totalQuestions ?? 0}</span></p></div>
        <div className="bg-white border border-slate-200 rounded-xl p-5"><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Độ chính xác</p><p className="mt-2 text-2xl font-extrabold">{accuracy}%</p></div>
        <div className="bg-white border border-slate-200 rounded-xl p-5"><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Cần ôn</p><p className="mt-2 text-2xl font-extrabold text-rose-600">{progress?.unresolvedWrongQuestionIds.length ?? 0}</p></div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activities.map(({ to, title, copy, icon: Icon, tone }) => (
          <Link key={to} to={to} className="group bg-white border border-slate-200 rounded-xl p-5 hover:border-brand-400 hover:shadow-md transition-all">
            <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${tone}`}><Icon className="w-5 h-5" /></div>
            <h2 className="mt-5 text-lg font-bold text-slate-900 group-hover:text-brand-700">{title}</h2>
            <p className="mt-1 text-sm leading-relaxed text-slate-500">{copy}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
