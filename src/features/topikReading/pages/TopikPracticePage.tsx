import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AlertCircle, CheckCircle2, ChevronRight, Clock3, Loader2, RotateCcw, XCircle } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { TopikOption } from '../components/TopikOption';
import { getTopikReadingService } from '../service';
import { getProgress, highlightTarget, isTypingTarget, modeToKind, selectQuestions } from '../utils';
import type { TopikAttempt, TopikAttemptMode, TopikQuestion } from '../types';

type PracticeMode = 'fill' | 'similar' | 'sprint' | 'wrong';

function validMode(value: string | null): value is PracticeMode {
  return value === 'fill' || value === 'similar' || value === 'sprint' || value === 'wrong';
}

export function TopikPracticePage() {
  const { user, isDemo } = useAuth();
  const [params] = useSearchParams();
  const mode = validMode(params.get('mode')) ? params.get('mode') : null;
  const service = useMemo(() => getTopikReadingService(isDemo), [isDemo]);
  const [questions, setQuestions] = useState<TopikQuestion[]>([]);
  const [phase, setPhase] = useState<'loading' | 'active' | 'finished' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [attemptSaved, setAttemptSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [records, setRecords] = useState<TopikAttempt[]>([]);
  const [secondsLeft, setSecondsLeft] = useState(180);
  const [finishedByTimeout, setFinishedByTimeout] = useState(false);
  const attemptIds = useRef(new Map<string, string>());
  const savedIds = useRef(new Set<string>());
  const inFlight = useRef(new Map<string, Promise<TopikAttempt>>());
  const recordsByQuestion = useRef(new Map<string, TopikAttempt>());
  const answerLocks = useRef(new Set<string>());
  const finishing = useRef(false);
  const sprintEndsAt = useRef<number | null>(null);
  const startedAt = useRef(0);
  const questionStartedAt = useRef(0);

  const attemptMode: TopikAttemptMode = mode === 'sprint' ? 'SPRINT' : mode === 'wrong' ? 'WRONG_RETRY' : mode === 'similar' ? 'SIMILAR' : 'FILL';
  const current = questions[index];

  const persist = useCallback(async (question: TopikQuestion, optionId: string | null) => {
    if (!user || !mode) throw new Error('Bạn cần đăng nhập để lưu tiến độ.');
    if (savedIds.current.has(question.id)) return recordsByQuestion.current.get(question.id)!;
    const pending = inFlight.current.get(question.id);
    if (pending) return pending;
    const attemptId = attemptIds.current.get(question.id) || crypto.randomUUID();
    attemptIds.current.set(question.id, attemptId);
    const durationMs = mode === 'sprint'
      ? Math.max(0, Date.now() - startedAt.current)
      : Math.max(0, Date.now() - questionStartedAt.current);
    const task = service.recordAttempt({ attemptId, questionId: question.id, selectedOptionId: optionId, mode: attemptMode, durationMs, userId: user.id })
      .then((attempt) => {
        savedIds.current.add(question.id);
        recordsByQuestion.current.set(question.id, attempt);
        setRecords([...recordsByQuestion.current.values()]);
        return attempt;
      })
      .finally(() => inFlight.current.delete(question.id));
    inFlight.current.set(question.id, task);
    return task;
  }, [attemptMode, mode, service, user]);

  const completeSprint = useCallback(async () => {
    if (finishing.current) return;
    finishing.current = true;
    const pendingQuestions = [...questions];
    try {
      await Promise.all(pendingQuestions.map(async (question) => {
        const pending = inFlight.current.get(question.id);
        if (pending) await pending.catch(() => undefined);
        if (!savedIds.current.has(question.id)) await persist(question, null);
      }));
      setFinishedByTimeout(true);
      setPhase('finished');
    } catch (reason: any) {
      setError(reason?.message || 'Không thể lưu đầy đủ kết quả Sprint.');
      setPhase('error');
    }
  }, [persist, questions]);

  useEffect(() => {
    if (!user || !mode) return;
    const load = async () => {
      try {
        setPhase('loading');
        const all = await service.getQuestions();
        let selected: TopikQuestion[];
        if (mode === 'sprint') {
          const fill = all.filter((question) => question.kind === 'FILL_GRAMMAR');
          const similar = all.filter((question) => question.kind === 'SIMILAR_GRAMMAR');
          if (fill.length < 2 || similar.length < 2) throw new Error(`Sprint cần ít nhất 2 câu mỗi dạng. Hiện có ${fill.length} câu 1-2 và ${similar.length} câu 3-4.`);
          selected = selectQuestions([...selectQuestions(fill, 2), ...selectQuestions(similar, 2)], 4);
          sprintEndsAt.current = Date.now() + 180_000;
        } else if (mode === 'wrong') {
          const attempts = await service.getAttempts(user.id);
          const wrongIds = new Set(getProgress(all.length, attempts).unresolvedWrongQuestionIds);
          selected = all.filter((question) => wrongIds.has(question.id));
          if (selected.length === 0) throw new Error('Bạn chưa có câu sai cần ôn.');
        } else {
          const kind = modeToKind(mode);
          selected = selectQuestions(all.filter((question) => question.kind === kind), all.length);
          if (selected.length === 0) throw new Error('Chưa có câu hỏi được xuất bản cho dạng này.');
        }
        if (selected.some((question) => question.options.length !== 4 || question.options.filter((option) => option.is_correct).length !== 1)) throw new Error('Dữ liệu câu hỏi không hợp lệ.');
        setQuestions(selected);
        startedAt.current = Date.now();
        questionStartedAt.current = Date.now();
        setPhase('active');
      } catch (reason: any) {
        setError(reason?.message || 'Không thể bắt đầu lượt luyện tập.');
        setPhase('error');
      }
    };
    void load();
  }, [mode, service, user]);

  useEffect(() => {
    if (mode !== 'sprint' || phase !== 'active' || !sprintEndsAt.current) return;
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((sprintEndsAt.current! - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining === 0) void completeSprint();
    };
    window.setTimeout(tick, 0);
    const timer = window.setInterval(tick, 250);
    return () => window.clearInterval(timer);
  }, [completeSprint, mode, phase]);

  useEffect(() => { questionStartedAt.current = Date.now(); }, [index]);

  const choose = useCallback((optionId: string) => {
    if (!current || answered || answerLocks.current.has(current.id) || finishing.current) return;
    answerLocks.current.add(current.id);
    setSelectedOptionId(optionId);
    setAnswered(true);
    setAttemptSaved(false);
    setSaveError(null);
    setSaving(true);
    void persist(current, optionId).then(() => setAttemptSaved(true)).catch((reason: any) => setSaveError(reason?.message || 'Không thể lưu câu trả lời.')).finally(() => setSaving(false));
  }, [answered, current, persist]);

  const retrySave = () => {
    if (!current || !selectedOptionId) return;
    setSaveError(null);
    setSaving(true);
    void persist(current, selectedOptionId).then(() => setAttemptSaved(true)).catch((reason: any) => setSaveError(reason?.message || 'Không thể lưu câu trả lời.')).finally(() => setSaving(false));
  };

  const next = useCallback(() => {
    if (!attemptSaved) return;
    if (index === questions.length - 1) { setPhase('finished'); return; }
    setIndex((value) => value + 1);
    setSelectedOptionId(null);
    setAnswered(false);
    setAttemptSaved(false);
    setSaveError(null);
  }, [attemptSaved, index, questions.length]);

  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target) || phase !== 'active' || !current || finishing.current) return;
      const choice = Number(event.key);
      if (choice >= 1 && choice <= 4 && !answered) choose(current.options[choice - 1]?.id || '');
      if (event.key === 'Enter' && answered && attemptSaved) next();
    };
    window.addEventListener('keydown', keydown);
    return () => window.removeEventListener('keydown', keydown);
  }, [answered, attemptSaved, choose, current, next, phase]);

  if (!user || !mode) return <div className="max-w-xl mx-auto p-8 my-16 bg-white border border-rose-200 rounded-2xl text-center"><AlertCircle className="w-9 h-9 text-rose-600 mx-auto mb-3" /><h1 className="font-bold text-lg">Không thể bắt đầu</h1><p className="text-sm text-slate-500 mt-2">{mode ? 'Bạn cần đăng nhập để làm bài.' : 'Chế độ luyện tập không hợp lệ.'}</p><Link className="inline-block mt-5 text-sm font-semibold text-brand-700" to="/topik/reading/1-4">Về TOPIK Reading</Link></div>;
  if (phase === 'loading') return <div className="min-h-[60vh] flex items-center justify-center gap-3 text-slate-500"><Loader2 className="w-6 h-6 animate-spin" />Đang chuẩn bị câu hỏi...</div>;
  if (phase === 'error') return <div className="max-w-xl mx-auto p-8 my-16 bg-white border border-rose-200 rounded-2xl text-center"><AlertCircle className="w-9 h-9 text-rose-600 mx-auto mb-3" /><h1 className="font-bold text-lg">Không thể bắt đầu</h1><p className="text-sm text-slate-500 mt-2">{error}</p><Link className="inline-block mt-5 text-sm font-semibold text-brand-700" to="/topik/reading/1-4">Về TOPIK Reading</Link></div>;

  if (phase === 'finished') {
    const result = new Map(records.map((attempt) => [attempt.question_id, attempt]));
    const correct = [...result.values()].filter((attempt) => attempt.is_correct).length;
    const unanswered = [...result.values()].filter((attempt) => attempt.selected_option_id === null).length;
    const wrong = questions.length - correct - unanswered;
    const accuracy = questions.length ? Math.round((correct / questions.length) * 100) : 0;
    return <div className="max-w-2xl mx-auto px-4 py-10 animate-fadeIn"><div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 text-center shadow-sm"><CheckCircle2 className="w-12 h-12 text-brand-600 mx-auto" /><h1 className="mt-4 text-2xl font-extrabold">{finishedByTimeout ? 'Sprint đã hết giờ' : 'Hoàn thành lượt luyện tập'}</h1><p className="mt-2 text-sm text-slate-500">Độ chính xác được tính trên toàn bộ {questions.length} câu đã xuất hiện.</p><div className="mt-7 grid grid-cols-3 gap-3 text-left"><div className="rounded-xl bg-emerald-50 p-4"><p className="text-xs font-bold text-emerald-700">Đúng</p><p className="mt-1 text-2xl font-extrabold">{correct}</p></div><div className="rounded-xl bg-rose-50 p-4"><p className="text-xs font-bold text-rose-700">Sai</p><p className="mt-1 text-2xl font-extrabold">{wrong}</p></div><div className="rounded-xl bg-slate-100 p-4"><p className="text-xs font-bold text-slate-600">Chưa trả lời</p><p className="mt-1 text-2xl font-extrabold">{unanswered}</p></div></div><p className="mt-6 text-4xl font-black text-brand-700">{accuracy}%</p><div className="mt-7 flex flex-col sm:flex-row justify-center gap-3"><Link to="/topik/reading/1-4/wrong" className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-brand-600 text-white text-sm font-semibold"><RotateCcw className="w-4 h-4" />Ôn câu sai</Link><Link to="/topik/reading/1-4" className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-slate-100 text-slate-700 text-sm font-semibold">Về tổng quan</Link></div></div></div>;
  }

  const highlighted = current ? highlightTarget(current.stem_ko, current.target_text) : null;
  const chosen = current?.options.find((option) => option.id === selectedOptionId);
  return <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 animate-fadeIn">
    <div className="flex items-center justify-between gap-4 mb-6"><Link to="/topik/reading/1-4" className="text-sm font-semibold text-slate-500 hover:text-slate-900">← Thoát</Link><div className="flex items-center gap-3"><span className="text-xs font-semibold rounded-full bg-slate-100 px-3 py-1.5">Câu {index + 1} / {questions.length}</span>{mode === 'sprint' && <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-100 rounded-full px-3 py-1.5"><Clock3 className="w-3.5 h-3.5" />{Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, '0')}</span>}</div></div>
    <div className="h-2 rounded-full bg-slate-200 overflow-hidden mb-6"><div className="h-full bg-brand-600 transition-all" style={{ width: `${((index + 1) / questions.length) * 100}%` }} /></div>
    {current && <><section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 text-center"><p className="text-xs font-bold uppercase tracking-wider text-brand-600">{current.kind === 'FILL_GRAMMAR' ? 'Chọn ngữ pháp phù hợp' : 'Chọn cách diễn đạt gần nghĩa'}</p><p lang="ko" className="mt-5 text-xl sm:text-2xl font-bold text-slate-900 leading-loose break-keep">{highlighted?.matched ? <>{highlighted.before}<mark className="font-extrabold underline decoration-2 underline-offset-4 bg-amber-100 text-slate-950 px-1 rounded">{highlighted.target}</mark>{highlighted.after}</> : current.stem_ko}</p>{current.kind === 'SIMILAR_GRAMMAR' && !highlighted?.matched && current.target_text && <p className="mt-3 text-xs text-slate-500">Phần cần so sánh: <span lang="ko" className="font-bold text-slate-700">{current.target_text}</span></p>}</section>
    <section className="mt-5 space-y-3">{current.options.map((option, optionIndex) => <TopikOption key={option.id} option={option} index={optionIndex} selected={selectedOptionId === option.id} answered={answered} onSelect={() => choose(option.id)} />)}</section>
    {answered && <section className="mt-5 bg-white border border-slate-200 rounded-xl p-5"><div className="flex gap-3">{chosen?.is_correct ? <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" /> : <XCircle className="w-6 h-6 text-rose-600 shrink-0" />}<div><p className="font-bold">{chosen?.is_correct ? 'Đúng' : 'Chưa đúng'}</p><p className="mt-1 text-sm leading-relaxed text-slate-600">{current.explanation_vi}</p></div></div>{saveError ? <div className="mt-4 text-sm text-rose-700">{saveError}<button onClick={retrySave} className="ml-2 font-bold underline">Thử lưu lại</button></div> : <button disabled={!attemptSaved || saving} onClick={next} className="mt-5 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-brand-600 disabled:bg-slate-300 text-white text-sm font-semibold">{saving ? 'Đang lưu...' : index === questions.length - 1 ? 'Xem kết quả' : 'Câu tiếp theo'}<ChevronRight className="w-4 h-4" /></button>}</section>}</>}
  </div>;
}
