import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AlertCircle, CheckCircle2, ChevronRight, Lightbulb, Loader2, RefreshCw, Send, XCircle } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { checkQ54Sentence, generateQ54TranslationHint } from '../ai';
import { getQ54Service } from '../service';
import type { Q54Assessment, Q54Exercise, Q54HintKey } from '../types';

const hintKeys: Q54HintKey[] = ['vocabulary', 'pattern', 'logic', 'sample'];

function existingHint(exercise: Q54Exercise, key: Q54HintKey): string[] | string | null {
  if (key === 'vocabulary') return exercise.vocabulary_hint.length ? exercise.vocabulary_hint : null;
  if (key === 'pattern') return exercise.pattern_hint;
  if (key === 'logic') return exercise.hint_cache?.logic || null;
  return exercise.sample_sentence_ko;
}

function withHint(exercise: Q54Exercise, key: Q54HintKey, hint: string[] | string): Q54Exercise {
  if (key === 'vocabulary') return { ...exercise, vocabulary_hint: Array.isArray(hint) ? hint : [hint] };
  if (key === 'pattern') return { ...exercise, pattern_hint: Array.isArray(hint) ? hint.join(' · ') : hint };
  if (key === 'sample') return { ...exercise, sample_sentence_ko: Array.isArray(hint) ? hint.join(' ') : hint };
  return { ...exercise, hint_cache: { ...exercise.hint_cache, logic: Array.isArray(hint) ? hint.join(' ') : hint } };
}

export function Q54PracticePage() {
  const { id = '' } = useParams();
  const { isDemo } = useAuth();
  const service = useMemo(() => getQ54Service(isDemo), [isDemo]);
  const [exercise, setExercise] = useState<Q54Exercise | null>(null);
  const [answerKo, setAnswerKo] = useState('');
  const [hintLevel, setHintLevel] = useState(0);
  const [hintsUsed, setHintsUsed] = useState<Q54HintKey[]>([]);
  const [assessment, setAssessment] = useState<Q54Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [generatingHint, setGeneratingHint] = useState<Q54HintKey | null>(null);
  const [error, setError] = useState<string | null>(null);
  const submissionId = useRef(crypto.randomUUID());
  const inFlight = useRef<Promise<void> | null>(null);

  useEffect(() => {
    void service.getExercise(id).then(setExercise).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Không thể tải bài dịch.')).finally(() => setLoading(false));
  }, [id, service]);

  const revealHint = async () => {
    const key = hintKeys[hintLevel];
    if (!exercise || !key || generatingHint) return;
    try {
      setGeneratingHint(key);
      setError(null);
      let hint = existingHint(exercise, key);
      if (!hint) hint = await generateQ54TranslationHint({ exerciseId: exercise.id, hintKey: key, isDemo });
      setExercise((current) => current ? withHint(current, key, hint) : current);
      setHintsUsed((current) => current.includes(key) ? current : [...current, key]);
      setHintLevel((current) => Math.min(4, current + 1));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Không thể tạo gợi ý này.');
    } finally {
      setGeneratingHint(null);
    }
  };

  const retry = () => { submissionId.current = crypto.randomUUID(); setAssessment(null); setError(null); };
  const submit = () => {
    if (!exercise || !answerKo.trim() || inFlight.current) return;
    setSubmitting(true);
    setError(null);
    const task = checkQ54Sentence({ exerciseId: exercise.id, answerKo, hintLevel, hintsUsed, referenceAnswer: exercise.reference_answer_ko, submissionId: submissionId.current, isDemo })
      .then((result) => {
        if (result.state === 'ASSESSED' && result.assessment) setAssessment(result.assessment);
        else if (result.state === 'PROCESSING') setError('Bài đang được chấm. Hãy đợi một chút rồi tải lại trang.');
        else setError('AI chưa thể chấm bài này. Bạn có thể thử lại bằng nút bên dưới.');
      })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Không thể gửi bài.'))
      .finally(() => { inFlight.current = null; setSubmitting(false); });
    inFlight.current = task;
  };

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center gap-3 text-slate-500"><Loader2 className="w-6 h-6 animate-spin" />Đang tải bài luyện...</div>;
  if (!exercise) return <div className="max-w-xl mx-auto px-4 py-14 text-center text-rose-700">{error || 'Không tìm thấy bài luyện.'}</div>;
  return <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10 animate-fadeIn">
    <Link to="/topik/writing/54" className="text-sm font-semibold text-slate-500 hover:text-slate-900">← TOPIK Writing 54</Link>
    <p className="mt-5 text-xs font-bold uppercase tracking-wider text-emerald-700">Việt → Hàn · Luyện câu</p>
    <h1 className="mt-2 text-2xl font-extrabold text-slate-900">Tự viết trước, nhận gợi ý dần</h1>
    <section className="mt-7 border-y border-slate-200 py-6"><p className="text-sm text-slate-500">Dịch câu sau sang tiếng Hàn:</p><p className="mt-3 text-xl sm:text-2xl font-bold leading-9 text-slate-900">{exercise.prompt_vi}</p></section>
    {!assessment && <><section className="mt-6"><label htmlFor="q54-answer" className="text-sm font-bold text-slate-800">Câu tiếng Hàn của bạn</label><textarea id="q54-answer" lang="ko" value={answerKo} onChange={(event) => setAnswerKo(event.target.value)} placeholder="Viết câu tiếng Hàn ở đây..." className="mt-2 min-h-36 w-full resize-y rounded-lg border border-slate-200 bg-white p-4 text-base leading-7 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" /><p className="mt-2 text-xs text-slate-500">{answerKo.length} / 1.000 ký tự</p></section>
      <section className="mt-6 border-t border-slate-200 pt-5"><div className="flex items-center gap-2"><Lightbulb className="w-5 h-5 text-amber-500" /><h2 className="font-bold">Gợi ý từng mức</h2></div><p className="mt-1 text-sm text-slate-500">Đã mở: {hintsUsed.length}/4. Mức gợi ý này sẽ được lưu cùng bài làm.</p>{hintsUsed.length > 0 && <div className="mt-4 space-y-3 text-sm">{hintsUsed.includes('vocabulary') && <div className="border-l-2 border-amber-400 pl-3"><b>Từ vựng:</b> {exercise.vocabulary_hint.join(' · ')}</div>}{hintsUsed.includes('pattern') && <div className="border-l-2 border-amber-400 pl-3"><b>Pattern:</b> <span lang="ko">{exercise.pattern_hint}</span></div>}{hintsUsed.includes('logic') && <div className="border-l-2 border-amber-400 pl-3"><b>Logic:</b> {exercise.hint_cache?.logic}</div>}{hintsUsed.includes('sample') && <div className="border-l-2 border-amber-400 pl-3"><b>Ví dụ liên quan:</b> <span lang="ko">{exercise.sample_sentence_ko}</span></div>}</div>}{hintLevel < 4 && <button type="button" disabled={!!generatingHint} onClick={() => void revealHint()} className="mt-4 text-sm font-bold text-amber-800 hover:underline disabled:opacity-60">{generatingHint ? 'Đang tạo gợi ý...' : 'Mở gợi ý tiếp theo'} <ChevronRight className="inline w-4 h-4" /></button>}</section>
      {error && <div className="mt-6 flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"><AlertCircle className="w-5 h-5 shrink-0" /><span>{error}</span></div>}
      <button type="button" disabled={!answerKo.trim() || submitting} onClick={submit} className="mt-7 inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-brand-600 px-5 py-3 text-sm font-semibold text-white disabled:bg-slate-300"><Send className="w-4 h-4" />{submitting ? 'Đang chấm...' : 'Nộp để nhận xét'}</button></>}
    {assessment && <section className="mt-7"><div className={`border rounded-lg p-5 ${assessment.verdict === 'ACCEPTABLE' ? 'border-emerald-200 bg-emerald-50' : 'border-rose-200 bg-rose-50'}`}><div className="flex gap-3">{assessment.verdict === 'ACCEPTABLE' ? <CheckCircle2 className="w-6 h-6 shrink-0 text-emerald-600" /> : <XCircle className="w-6 h-6 shrink-0 text-rose-600" />}<div><p className="font-bold">{assessment.verdict === 'ACCEPTABLE' ? 'Câu có thể dùng được' : 'Cần chỉnh một chút'}</p><p className="mt-1 text-sm leading-6">{assessment.summaryVi}</p></div></div></div>
      <div className="mt-6 border-y border-slate-200 py-5"><p className="text-xs font-bold uppercase tracking-wider text-slate-500">Bản chỉnh gợi ý</p><p lang="ko" className="mt-2 text-lg font-bold leading-8 text-slate-900">{assessment.correctedSentence}</p></div>
      {assessment.errors.length > 0 && <div className="mt-6"><h2 className="font-bold">Lỗi cần nhớ</h2><div className="mt-3 space-y-4">{assessment.errors.map((item, index) => <article key={`${item.original}-${index}`} className="border-b border-slate-200 pb-4"><p className="text-xs font-bold text-rose-700">{item.type}</p><p lang="ko" className="mt-2 text-sm text-rose-800">{item.original}</p><p lang="ko" className="mt-1 text-sm font-bold text-emerald-800">{item.corrected}</p><p className="mt-2 text-sm leading-6 text-slate-600">{item.explanationVi}</p></article>)}</div></div>}
      {assessment.naturalAlternatives.length > 0 && <div className="mt-6"><h2 className="font-bold">Cách diễn đạt tự nhiên khác</h2><ul className="mt-3 space-y-2 text-sm text-slate-700">{assessment.naturalAlternatives.map((item) => <li key={item} lang="ko">{item}</li>)}</ul></div>}
      <div className="mt-8 flex flex-col sm:flex-row gap-3"><button type="button" onClick={retry} className="inline-flex justify-center items-center gap-2 rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700"><RefreshCw className="w-4 h-4" />Viết lại</button><Link to="/topik/writing/54/errors" className="inline-flex justify-center items-center rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white">Mở Error Notebook</Link></div></section>}
  </div>;
}
