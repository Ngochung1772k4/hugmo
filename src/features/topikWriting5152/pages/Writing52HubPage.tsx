import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Loader2, RotateCcw, ScanText } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { getTopikWriting5152Service } from '../service';
import type { Q52Exercise, Q52Relation, WritingBlankAttempt } from '../types';

export function Writing52HubPage() {
  const { user, isDemo } = useAuth();
  const service = useMemo(() => getTopikWriting5152Service(isDemo), [isDemo]);
  const [relations, setRelations] = useState<Q52Relation[]>([]);
  const [exercises, setExercises] = useState<Q52Exercise[]>([]);
  const [attempts, setAttempts] = useState<WritingBlankAttempt[]>([]);

  useEffect(() => {
    if (!user) return;
    void Promise.all([service.getQ52Relations(), service.getQ52Exercises(), service.getAttempts(user.id, 52)]).then(([nextRelations, nextExercises, nextAttempts]) => {
      setRelations(nextRelations); setExercises(nextExercises); setAttempts(nextAttempts);
    });
  }, [service, user]);

  if (!relations.length) return <div className="min-h-[60vh] flex items-center justify-center gap-3 text-slate-500"><Loader2 className="w-6 h-6 animate-spin" />Đang tải Writing 52...</div>;
  const first = exercises[0];
  const wrongIds = new Set(attempts.filter((attempt) => attempt.score < (exercises.find((exercise) => exercise.id === attempt.exerciseId)?.blanks.length || 0)).map((attempt) => attempt.exerciseId));
  const wrong = exercises.find((exercise) => wrongIds.has(exercise.id));

  return <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 animate-fadeIn">
    <Link to="/dashboard" className="text-sm font-semibold text-slate-500 hover:text-slate-900">← Dashboard</Link>
    <p className="mt-5 text-xs font-bold uppercase tracking-wider text-sky-700">TOPIK II · Writing</p>
    <h1 className="mt-1 text-3xl sm:text-4xl font-extrabold text-slate-900">Câu 52</h1>
    <p className="mt-2 max-w-2xl text-sm text-slate-500">Đọc cả đoạn, xác định quan hệ logic giữa các câu rồi chọn biểu hiện phù hợp để điền.</p>

    <section className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
      <Link to="/topik/writing/52/learn" className="border border-sky-200 bg-white p-5 rounded-lg hover:border-sky-400"><BookOpen className="w-5 h-5 text-sky-700" /><h2 className="mt-3 font-bold">Học quan hệ logic</h2><p className="mt-1 text-sm text-slate-500">9 relation families và pattern từ sách.</p></Link>
      {first && <Link to={'/topik/writing/52/practice/' + first.id + '?mode=GUIDED'} className="border border-indigo-200 bg-white p-5 rounded-lg hover:border-indigo-400"><ScanText className="w-5 h-5 text-indigo-700" /><h2 className="mt-3 font-bold">Luyện logic có hướng dẫn</h2><p className="mt-1 text-sm text-slate-500">Xem câu trước/sau blank rồi nhận diện relation.</p></Link>}
      {first && <Link to={'/topik/writing/52/practice/' + first.id + '?mode=MIXED'} className="border border-amber-200 bg-white p-5 rounded-lg hover:border-amber-400"><ArrowRight className="w-5 h-5 text-amber-700" /><h2 className="mt-3 font-bold">Mixed practice</h2><p className="mt-1 text-sm text-slate-500">Tự tìm keyword và relation trước khi điền.</p></Link>}
    </section>
    {wrong && <Link to={'/topik/writing/52/practice/' + wrong.id + '?mode=WRONG_ONLY'} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-rose-700 hover:text-rose-800"><RotateCcw className="w-4 h-4" />Ôn lại câu chưa khớp đáp án sách</Link>}
    <section className="mt-10"><h2 className="text-lg font-bold">9 relation families</h2><div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">{relations.map((relation) => <Link key={relation.id} to="/topik/writing/52/learn" className="border border-slate-200 bg-white p-4 rounded-lg hover:border-brand-400"><p lang="ko" className="font-bold">{relation.nameKo}</p><p className="mt-1 text-sm text-slate-500">{relation.nameVi}</p><p lang="ko" className="mt-3 text-sm font-semibold text-brand-700">{relation.patterns[0]?.patternKo}</p></Link>)}</div></section>
  </div>;
}
