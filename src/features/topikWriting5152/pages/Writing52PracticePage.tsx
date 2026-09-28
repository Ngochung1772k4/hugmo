import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Lightbulb, Loader2 } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { AttemptResult } from '../components/AttemptResult';
import { BlankPassage } from '../components/BlankPassage';
import { getTopikWriting5152Service } from '../service';
import type { Q52Exercise, Q52Relation, WritingBlankAttempt, WritingPracticeMode } from '../types';
import { nearbySentences } from '../utils';

function modeFrom(value: string | null): WritingPracticeMode {
  return value === 'MIXED' || value === 'WRONG_ONLY' ? value : 'GUIDED';
}

export function Writing52PracticePage() {
  const { id = '' } = useParams();
  const [searchParams] = useSearchParams();
  const { user, isDemo } = useAuth();
  const service = useMemo(() => getTopikWriting5152Service(isDemo), [isDemo]);
  const mode = modeFrom(searchParams.get('mode'));
  const [exercise, setExercise] = useState<Q52Exercise | null>(null);
  const [relations, setRelations] = useState<Q52Relation[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [relationChoices, setRelationChoices] = useState<Record<string, string>>({});
  const [hintLevel, setHintLevel] = useState(0);
  const [attempt, setAttempt] = useState<WritingBlankAttempt | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void Promise.all([service.getQ52Exercises(), service.getQ52Relations()])
      .then(([exercises, nextRelations]) => {
        setExercise(exercises.find((item) => item.id === id) || null);
        setRelations(nextRelations);
      })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Khong the tai bai luyen.'));
  }, [id, service]);

  if (error) return <div className="max-w-xl mx-auto px-4 py-14 text-center text-rose-700">{error}</div>;
  if (!exercise) return <div className="min-h-[60vh] flex items-center justify-center gap-3 text-slate-500"><Loader2 className="w-6 h-6 animate-spin" />Dang tai bai luyen...</div>;

  const selectedRelations = Object.fromEntries(exercise.blanks.map((blank) => [
    blank.key,
    relations.find((relation) => relation.code === relationChoices[blank.key]),
  ])) as Record<string, Q52Relation | undefined>;
  const hasSelectedRelations = exercise.blanks.every((blank) => Boolean(selectedRelations[blank.key]));

  const submit = async () => {
    if (!user || submitting || attempt) return;
    try {
      setSubmitting(true);
      setAttempt(await service.recordAttempt({
        attemptId: crypto.randomUUID(),
        userId: user.id,
        questionNo: 52,
        exerciseId: exercise.id,
        answers,
        mode,
      }));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Khong the cham dap an.');
    } finally {
      setSubmitting(false);
    }
  };

  return <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
    <Link to="/topik/writing/52" className="text-sm font-semibold text-slate-500 hover:text-slate-900">Back to Cau 52</Link>
    <p className="mt-5 text-xs font-bold uppercase tracking-wider text-sky-700">Writing 52 · {mode}</p>
    <h1 className="mt-2 text-xl sm:text-2xl font-extrabold">Doan van → relation → pattern → dap an</h1>
    <p className="mt-2 text-sm text-slate-500">Nguon tr. {exercise.sourcePages.join(', ')} · dap an tr. {exercise.answerSourcePages.join(', ')}</p>

    <section className="mt-7">
      <h2 className="font-bold">1. Doc toan doan</h2>
      <div className="mt-3"><BlankPassage body={exercise.bodyKo} blanks={exercise.blanks} answers={answers} onAnswerChange={(key, value) => setAnswers((current) => ({ ...current, [key]: value }))} disabled={Boolean(attempt)} /></div>
    </section>

    {mode !== 'MIXED' && !attempt && <section className="mt-6 rounded-lg border border-sky-200 bg-sky-50/50 p-5">
      <h2 className="font-bold">2. Quan he logic tung blank</h2>
      <p className="mt-1 text-sm text-slate-600">Source khong gan relation chuan cho tung blank, nen day la buoc tu phan tich cua ban.</p>
      {exercise.blanks.map((blank, index) => {
        const selectedRelation = selectedRelations[blank.key];
        return <div key={blank.id} className="mt-5 border-t border-sky-100 pt-5 first:mt-4 first:border-t-0 first:pt-0">
          <p className="text-sm font-bold">Blank {blank.key} · quan he {index + 1}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {relations.map((relation) => <button key={relation.id} type="button" onClick={() => setRelationChoices((current) => ({ ...current, [blank.key]: relation.code }))} className={'rounded-md border px-3 py-2 text-sm font-semibold ' + (selectedRelation?.code === relation.code ? 'border-sky-600 bg-sky-600 text-white' : 'border-slate-200 bg-white text-slate-700')}><span lang="ko">{relation.nameKo}</span></button>)}
          </div>
          {selectedRelation && <div className="mt-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Pattern family ban chon</p>
            <div className="mt-2 flex flex-wrap gap-2">{selectedRelation.patterns.map((pattern) => <span key={pattern.id} lang="ko" className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-sky-900">{pattern.patternKo}</span>)}</div>
          </div>}
        </div>;
      })}
    </section>}

    {!attempt && <section className="mt-6">
      <button type="button" onClick={() => setHintLevel((current) => Math.min(4, current + 1))} disabled={hintLevel === 4} className="inline-flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-900 disabled:opacity-60"><Lightbulb className="w-4 h-4" />{hintLevel === 4 ? 'Da mo het goi y' : 'Mo goi y tiep'}</button>
      {hintLevel >= 1 && <div className="mt-3 rounded-md bg-slate-100 p-3 text-sm">
        <p className="font-semibold">Clue truoc/sau tung blank</p>
        {exercise.blanks.map((blank) => {
          const clue = nearbySentences(exercise.bodyKo, blank.key);
          return <div key={blank.id} className="mt-3"><p className="font-semibold">{blank.key}</p><p lang="ko" className="mt-1">{clue.previous}</p><p lang="ko" className="mt-1 font-semibold">{clue.current}</p><p lang="ko" className="mt-1">{clue.next}</p></div>;
        })}
      </div>}
      {hintLevel >= 2 && <p className="mt-3 rounded-md bg-slate-100 p-3 text-sm">Hay chon relation family phu hop voi y truoc va y sau cua tung blank. Source khong gan mot relation chuan cho cac blank nay.</p>}
      {hintLevel >= 3 && hasSelectedRelations && <div className="mt-3 rounded-md bg-slate-100 p-3 text-sm"><p className="font-semibold">Pattern candidates theo lua chon cua ban</p>{exercise.blanks.map((blank) => <p key={blank.id} lang="ko" className="mt-2">{blank.key}: {selectedRelations[blank.key]?.patterns.map((pattern) => pattern.patternKo).join(' · ')}</p>)}</div>}
      {hintLevel >= 4 && <div className="mt-3 rounded-md bg-amber-50 p-3 text-sm"><p className="font-semibold">Mot dap an sach</p>{exercise.blanks.map((blank) => <p key={blank.id} lang="ko" className="mt-1">{blank.key}: {blank.sourceAnswerVariants[0]}</p>)}</div>}
    </section>}

    {!attempt && <button type="button" disabled={submitting || (mode !== 'MIXED' && !hasSelectedRelations)} onClick={() => void submit()} className="mt-7 rounded-lg bg-brand-600 px-5 py-3 text-sm font-semibold text-white disabled:bg-slate-300">{submitting ? 'Dang kiem tra...' : 'Kiem tra dap an'}</button>}
    {attempt && <><AttemptResult attempt={attempt} blanks={exercise.blanks} /><Link to="/topik/writing/52" className="mt-5 inline-block text-sm font-semibold text-brand-700">Chon bai khac →</Link></>}
  </div>;
}
