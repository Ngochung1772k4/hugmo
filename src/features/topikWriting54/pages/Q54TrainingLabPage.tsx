import { useEffect, useMemo, useState } from 'react';
import { Brain, ChevronRight, Clock3, FileText, Loader2, PenLine, ShieldCheck, Target } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { getQ54Service } from '../service';
import { getQ54TrainingService } from '../training';
import type { Q54QuestionBundle } from '../types';

const steps = [
  ['1', 'Idea Sprint', 'Tự nghĩ ý trong 60 giây trước khi mở Bank.'],
  ['2', 'Logic Chain', 'Sắp xếp nguyên nhân, hành động và kết quả.'],
  ['3', 'Sentence Builder', 'Xây câu theo ba mức hỗ trợ.'],
  ['4', 'One Idea → 3 Sentences', 'Ý chính, giải thích, kết quả.'],
  ['5', 'Paragraph Practice', 'Phát triển một requirement thành 3–5 câu.'],
  ['6', 'Full Essay', 'Trả lời toàn bộ yêu cầu trong 600–700 ký tự Hàn.'],
];

export function Q54TrainingLabPage() {
  const { id = '' } = useParams(); const { isDemo } = useAuth(); const navigate = useNavigate();
  const contentService = useMemo(() => getQ54Service(isDemo), [isDemo]); const trainingService = useMemo(() => getQ54TrainingService(isDemo), [isDemo]);
  const [bundle, setBundle] = useState<Q54QuestionBundle | null>(null); const [error, setError] = useState<string | null>(null); const [starting, setStarting] = useState<'PRACTICE' | 'EXAM' | null>(null);
  useEffect(() => { void contentService.getQuestionBundle(id).then(setBundle).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Không thể tải Training Lab.')); }, [contentService, id]);
  const start = async (mode: 'PRACTICE' | 'EXAM') => {
    if (!bundle || starting) return;
    try { setStarting(mode); const session = await trainingService.startSession(bundle.question.id, mode); navigate(mode === 'EXAM' ? `/topik/writing/54/lab/sessions/${session.id}/compose/ESSAY` : `/topik/writing/54/lab/sessions/${session.id}/sprint`); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Không thể bắt đầu phiên luyện.'); }
    finally { setStarting(null); }
  };
  if (error) return <div className="mx-auto max-w-xl px-4 py-14 text-center text-rose-700">{error}</div>;
  if (!bundle) return <div className="flex min-h-[60vh] items-center justify-center gap-3 text-slate-500"><Loader2 className="h-6 w-6 animate-spin" />Đang tải Training Lab...</div>;
  return <div className="mx-auto max-w-5xl animate-fadeIn px-4 py-8 sm:px-6 lg:px-8"><Link to={`/topik/writing/54/questions/${bundle.question.id}`} className="text-sm font-semibold text-slate-500 hover:text-slate-900">← Quay lại Workbench</Link><div className="mt-6 border-b border-slate-200 pb-6"><p className="text-xs font-bold uppercase tracking-wider text-brand-700">{bundle.topic.name_ko} · {bundle.topic.name_vi}</p><h1 className="mt-2 text-3xl font-extrabold text-slate-900">Q54 Training Lab</h1><p lang="ko" className="mt-3 max-w-4xl font-semibold text-slate-700">{bundle.question.prompt_ko}</p></div><div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{steps.map(([number, title, description]) => <article key={number} className="border border-slate-200 bg-white p-4"><span className="text-xs font-bold text-brand-700">{number}</span><h2 className="mt-2 font-bold text-slate-900">{title}</h2><p className="mt-1 text-sm text-slate-600">{description}</p></article>)}</div><section className="mt-8 grid gap-4 border-y border-slate-200 py-6 md:grid-cols-2"><div><div className="flex items-center gap-2"><Brain className="h-5 w-5 text-brand-600" /><h2 className="font-bold">Practice Mode</h2></div><p className="mt-2 text-sm text-slate-600">Mở dần Idea/Pattern Bank khi bạn cần. Các phần đều mở tự do nhưng Lab gợi ý học theo trình tự.</p><button type="button" onClick={() => void start('PRACTICE')} disabled={!!starting} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"><ChevronRight className="h-4 w-4" />{starting === 'PRACTICE' ? 'Đang bắt đầu...' : 'Bắt đầu Practice'}</button></div><div><div className="flex items-center gap-2"><Clock3 className="h-5 w-5 text-rose-600" /><h2 className="font-bold">Exam Mode · 30 phút</h2></div><p className="mt-2 text-sm text-slate-600">Khóa Bank, hint và AI đến khi nộp. Phân tích chỉ mở sau khi bài được gửi.</p><button type="button" onClick={() => void start('EXAM')} disabled={!!starting} className="mt-4 inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-800 disabled:opacity-60"><ShieldCheck className="h-4 w-4" />{starting === 'EXAM' ? 'Đang bắt đầu...' : 'Thi thử 30 phút'}</button></div></section><div className="mt-6 flex flex-wrap gap-3"><Link to="/topik/writing/54/lab/drills" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700"><Target className="h-4 w-4" />Error Training</Link><Link to="/topik/writing/54/lab/weakness" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700"><FileText className="h-4 w-4" />Personal Weakness</Link><Link to="/topik/writing/54/errors" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700"><PenLine className="h-4 w-4" />Error Notebook</Link></div></div>;
}
