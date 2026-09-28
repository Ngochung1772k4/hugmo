import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Loader2, RotateCcw, WandSparkles } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { getTopikWriting5152Service } from '../service';
import type { Q51Exercise, Q51Intent, WritingBlankAttempt } from '../types';

export function Writing51HubPage() {
  const { user, isDemo } = useAuth();
  const service = useMemo(() => getTopikWriting5152Service(isDemo), [isDemo]);
  const [intents, setIntents] = useState<Q51Intent[]>([]);
  const [exercises, setExercises] = useState<Q51Exercise[]>([]);
  const [attempts, setAttempts] = useState<WritingBlankAttempt[]>([]);

  useEffect(() => {
    if (!user) return;
    void Promise.all([service.getQ51Intents(), service.getQ51Exercises(), service.getAttempts(user.id, 51)]).then(([nextIntents, nextExercises, nextAttempts]) => {
      setIntents(nextIntents); setExercises(nextExercises); setAttempts(nextAttempts);
    });
  }, [service, user]);

  if (!intents.length) return <div className="min-h-[60vh] flex items-center justify-center gap-3 text-slate-500"><Loader2 className="w-6 h-6 animate-spin" />Đang tải Writing 51...</div>;
  const sectionExercise = exercises.find((item) => item.exerciseGroup === 'SECTION_PRACTICE');
  const mixedExercise = exercises.find((item) => item.exerciseGroup === 'MIXED_PRACTICE');
  const wrongIds = new Set(attempts.filter((attempt) => attempt.score < (exercises.find((exercise) => exercise.id === attempt.exerciseId)?.blanks.length || 0)).map((attempt) => attempt.exerciseId));
  const wrongExercise = exercises.find((item) => wrongIds.has(item.id));

  return <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 animate-fadeIn">
    <Link to="/dashboard" className="text-sm font-semibold text-slate-500 hover:text-slate-900">← Dashboard</Link>
    <p className="mt-5 text-xs font-bold uppercase tracking-wider text-emerald-700">TOPIK II · Writing</p>
    <h1 className="mt-1 text-3xl sm:text-4xl font-extrabold text-slate-900">Câu 51</h1>
    <p className="mt-2 max-w-2xl text-sm text-slate-500">Đọc tình huống giao tiếp, nhận diện ý định, nhìn clue rồi mới chọn công thức để điền.</p>

    <section className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
      <Link to="/topik/writing/51/learn" className="border border-emerald-200 bg-white p-5 rounded-lg hover:border-emerald-400"><BookOpen className="w-5 h-5 text-emerald-700" /><h2 className="mt-3 font-bold">Học intent</h2><p className="mt-1 text-sm text-slate-500">7 nhóm tình huống và công thức từ sách.</p></Link>
      {sectionExercise && <Link to={'/topik/writing/51/practice/' + sectionExercise.id + '?mode=GUIDED'} className="border border-indigo-200 bg-white p-5 rounded-lg hover:border-indigo-400"><WandSparkles className="w-5 h-5 text-indigo-700" /><h2 className="mt-3 font-bold">Luyện có hướng dẫn</h2><p className="mt-1 text-sm text-slate-500">Chọn intent, xem pattern rồi tự điền.</p></Link>}
      {mixedExercise && <Link to={'/topik/writing/51/practice/' + mixedExercise.id + '?mode=MIXED'} className="border border-amber-200 bg-white p-5 rounded-lg hover:border-amber-400"><ArrowRight className="w-5 h-5 text-amber-700" /><h2 className="mt-3 font-bold">Mixed practice</h2><p className="mt-1 text-sm text-slate-500">Không tiết lộ intent trước khi trả lời.</p></Link>}
    </section>

    {wrongExercise && <Link to={'/topik/writing/51/practice/' + wrongExercise.id + '?mode=WRONG_ONLY'} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-rose-700 hover:text-rose-800"><RotateCcw className="w-4 h-4" />Ôn lại câu chưa khớp đáp án sách</Link>}

    <section className="mt-10"><h2 className="text-lg font-bold">7 intent cần nhận diện</h2><div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">{intents.map((intent) => <Link key={intent.id} to="/topik/writing/51/learn" className="border border-slate-200 bg-white p-4 rounded-lg hover:border-brand-400"><p lang="ko" className="font-bold text-slate-900">{intent.nameKo}</p><p className="mt-1 text-sm text-slate-500">{intent.nameVi}</p><p lang="ko" className="mt-3 text-sm font-semibold text-brand-700">{intent.patterns.filter((pattern) => pattern.patternKind === 'PREFERRED').map((pattern) => pattern.patternKo).join(' · ')}</p></Link>)}</div></section>
  </div>;
}
