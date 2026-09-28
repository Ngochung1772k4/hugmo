import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Lightbulb, Loader2 } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { AttemptResult } from '../components/AttemptResult';
import { BlankPassage } from '../components/BlankPassage';
import { getTopikWriting5152Service } from '../service';
import type { Q51Exercise, Q51Intent, WritingBlankAttempt, WritingPracticeMode } from '../types';

function modeFrom(value: string | null): WritingPracticeMode {
  return value === 'MIXED' || value === 'WRONG_ONLY' ? value : 'GUIDED';
}

export function Writing51PracticePage() {
  const { id = '' } = useParams();
  const [searchParams] = useSearchParams();
  const { user, isDemo } = useAuth();
  const service = useMemo(() => getTopikWriting5152Service(isDemo), [isDemo]);
  const mode = modeFrom(searchParams.get('mode'));
  const [exercise, setExercise] = useState<Q51Exercise | null>(null);
  const [intents, setIntents] = useState<Q51Intent[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [chosenIntent, setChosenIntent] = useState<string | null>(null);
  const [hintLevel, setHintLevel] = useState(0);
  const [attempt, setAttempt] = useState<WritingBlankAttempt | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void Promise.all([service.getQ51Exercises(), service.getQ51Intents()]).then(([exercises, nextIntents]) => {
      setExercise(exercises.find((item) => item.id === id) || null); setIntents(nextIntents);
    }).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Không thể tải bài luyện.'));
  }, [id, service]);

  if (error) return <div className="max-w-xl mx-auto px-4 py-14 text-center text-rose-700">{error}</div>;
  if (!exercise) return <div className="min-h-[60vh] flex items-center justify-center gap-3 text-slate-500"><Loader2 className="w-6 h-6 animate-spin" />Đang tải bài luyện...</div>;
  const expectedIntent = intents.find((intent) => intent.code === exercise.intentCode);
  const selectedIntent = intents.find((intent) => intent.code === chosenIntent);
  const showPatterns = mode !== 'MIXED' && Boolean(chosenIntent);

  const submit = async () => {
    if (!user || submitting || attempt) return;
    try {
      setSubmitting(true);
      setAttempt(await service.recordAttempt({ attemptId: crypto.randomUUID(), userId: user.id, questionNo: 51, exerciseId: exercise.id, answers, mode }));
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Không thể chấm đáp án.'); }
    finally { setSubmitting(false); }
  };

  return <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
    <Link to="/topik/writing/51" className="text-sm font-semibold text-slate-500 hover:text-slate-900">← Câu 51</Link>
    <div className="mt-5 flex flex-wrap items-center gap-3"><p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Writing 51 · {mode}</p>{exercise.titleKo && <p lang="ko" className="text-sm font-bold text-slate-700">{exercise.titleKo}</p>}</div>
    <h1 className="mt-2 text-xl sm:text-2xl font-extrabold">Tình huống → intent → pattern → đáp án</h1>
    <p className="mt-2 text-sm text-slate-500">Nguồn tr. {exercise.sourcePages.join(', ')} · đáp án tr. {exercise.answerSourcePages.join(', ')}</p>

    {mode !== 'MIXED' && !attempt && <section className="mt-7 rounded-lg border border-emerald-200 bg-emerald-50/50 p-5"><h2 className="font-bold">1. Đây là tình huống giao tiếp nào?</h2><p className="mt-1 text-sm text-slate-600">Chọn trước khi xem family pattern.</p><div className="mt-4 flex flex-wrap gap-2">{intents.map((intent) => <button key={intent.id} type="button" onClick={() => setChosenIntent(intent.code)} className={'rounded-md border px-3 py-2 text-sm font-semibold ' + (chosenIntent === intent.code ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-200 bg-white text-slate-700')}><span lang="ko">{intent.nameKo}</span></button>)}</div>{showPatterns && selectedIntent && <div className="mt-4"><p className="text-xs font-bold uppercase tracking-wider text-slate-500">Pattern bạn đã chọn</p><div className="mt-2 flex flex-wrap gap-2">{selectedIntent.patterns.filter((pattern) => pattern.patternKind === 'PREFERRED').map((pattern) => <span key={pattern.id} lang="ko" className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-emerald-800">{pattern.patternKo}</span>)}</div></div>}</section>}

    <section className="mt-7"><h2 className="font-bold">{mode === 'MIXED' ? 'Đọc và tự suy luận' : '2. Điền biểu hiện phù hợp'}</h2><div className="mt-3"><BlankPassage body={exercise.bodyKo} blanks={exercise.blanks} answers={answers} onAnswerChange={(key, value) => setAnswers((current) => ({ ...current, [key]: value }))} disabled={Boolean(attempt)} /></div></section>

    {!attempt && <section className="mt-6"><button type="button" onClick={() => setHintLevel((current) => Math.min(4, current + 1))} disabled={hintLevel === 4} className="inline-flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-900 disabled:opacity-60"><Lightbulb className="w-4 h-4" />{hintLevel === 4 ? 'Đã mở hết gợi ý' : 'Mở gợi ý tiếp'}</button>{hintLevel >= 1 && expectedIntent && <p className="mt-3 rounded-md bg-slate-100 p-3 text-sm">Intent hint: <span lang="ko" className="font-bold">{expectedIntent.nameKo}</span> · {expectedIntent.nameVi}</p>}{hintLevel >= 2 && expectedIntent && <div className="mt-3 rounded-md bg-slate-100 p-3 text-sm"><p className="font-semibold">Preferred patterns</p><p lang="ko" className="mt-1">{expectedIntent.patterns.filter((pattern) => pattern.patternKind === 'PREFERRED').map((pattern) => pattern.patternKo).join(' · ')}</p></div>}{hintLevel >= 3 && <p className="mt-3 rounded-md bg-slate-100 p-3 text-sm">Clue: đọc câu ngay trước và sau chỗ trống, rồi kiểm tra mức độ trang trọng của cả thông báo.</p>}{hintLevel >= 4 && <div className="mt-3 rounded-md bg-amber-50 p-3 text-sm"><p className="font-semibold">Một đáp án sách</p>{exercise.blanks.map((blank) => <p key={blank.id} lang="ko" className="mt-1">{blank.key}: {blank.sourceAnswerVariants[0]}</p>)}</div>}</section>}
    {!attempt && <button type="button" disabled={submitting || (mode !== 'MIXED' && !chosenIntent)} onClick={() => void submit()} className="mt-7 rounded-lg bg-brand-600 px-5 py-3 text-sm font-semibold text-white disabled:bg-slate-300">{submitting ? 'Đang kiểm tra...' : 'Kiểm tra đáp án'}</button>}
    {attempt && <><AttemptResult attempt={attempt} blanks={exercise.blanks} />{mode !== 'MIXED' && expectedIntent && <p className="mt-4 rounded-md bg-emerald-50 p-3 text-sm">Intent theo source: <span lang="ko" className="font-bold">{expectedIntent.nameKo}</span>{chosenIntent && chosenIntent !== expectedIntent.code ? ' · Bạn đã chọn một intent khác, hãy so lại clue và văn phong.' : ''}</p>}<Link to="/topik/writing/51" className="mt-5 inline-block text-sm font-semibold text-brand-700">Chọn bài khác →</Link></>}
  </div>;
}
