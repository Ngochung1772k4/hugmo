import { AlertTriangle, CheckCircle2, Lightbulb, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Q54DraftAssessment, Q54Requirement } from '../types';

type Props = { assessment: Q54DraftAssessment; requirements: Q54Requirement[]; draftId: string };
const coverageLabel = { COVERED: 'Đã trả lời', PARTIAL: 'Chưa đủ', MISSING: 'Chưa trả lời' };
const sentenceLabel = { MAIN_IDEA: 'Ý chính', WHY: 'Lý do', RESULT: 'Kết quả' };

export function DraftAssessmentPanel({ assessment, requirements, draftId }: Props) {
  if (!assessment.summary || !Array.isArray(assessment.coverage) || !Array.isArray(assessment.issues)) {
    return <section className="mt-7 border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">Feedback này được tạo bởi phiên bản assessment cũ nên không đủ bằng chứng để hiển thị. Hãy gửi lại bài sau khi server Q54 được cập nhật.</section>;
  }
  const requirementById = new Map(requirements.map((requirement) => [requirement.id, requirement]));
  const hasConcerns = assessment.issues.length > 0 || assessment.coverage.some((item) => item.status !== 'COVERED') || assessment.logic?.status !== 'LOGIC_OK';
  const priorities = [assessment.nextDraft.priority1, assessment.nextDraft.priority2, assessment.nextDraft.priority3].filter((value): value is string => Boolean(value));
  return <section className="mt-7 border border-slate-200 bg-white p-5 sm:p-6">
    <div className="flex items-start gap-3"><CheckCircle2 className={`mt-0.5 h-5 w-5 ${hasConcerns ? 'text-amber-600' : 'text-emerald-600'}`} /><div><h2 className="font-bold text-slate-900">Feedback đã được kiểm chứng</h2><p className="mt-1 text-sm text-slate-600">{assessment.summary.overall}</p></div></div>

    <div className="mt-6"><h3 className="text-sm font-bold text-slate-800">Requirement coverage</h3><div className="mt-3 space-y-2">{assessment.coverage.map((item) => <article key={item.requirementId} className="border-l-2 border-slate-200 px-3 py-2"><div className="flex flex-wrap items-center gap-2"><p className="font-medium text-slate-900">{requirementById.get(item.requirementId)?.label_vi || 'Requirement'}</p><span className={`rounded-md px-2 py-0.5 text-xs font-bold ${item.status === 'COVERED' ? 'bg-emerald-100 text-emerald-800' : item.status === 'PARTIAL' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'}`}>{coverageLabel[item.status]}</span></div>{item.evidence.map((evidence) => <p key={`${evidence.start}-${evidence.end}`} lang="ko" className="mt-1 text-sm text-slate-700">{evidence.text}</p>)}{item.missingPointVi && <p className="mt-1 text-sm text-slate-500">{item.missingPointVi}</p>}</article>)}</div></div>

    {assessment.sentenceFunctions.length > 0 && <div className="mt-6"><h3 className="text-sm font-bold text-slate-800">Three-sentence structure</h3><div className="mt-2 grid gap-2 md:grid-cols-3">{assessment.sentenceFunctions.map((item) => <article key={item.slot} className="border-l-2 border-sky-500 bg-sky-50/40 p-3"><p className="text-xs font-bold text-sky-800">{sentenceLabel[item.slot]} · {item.status}</p><p className="mt-1 text-sm text-slate-700">{item.commentVi}</p>{item.evidence.map((evidence) => <p key={`${evidence.start}-${evidence.end}`} lang="ko" className="mt-2 text-xs text-slate-600">{evidence.text}</p>)}</article>)}</div></div>}

    {assessment.logic && <article className="mt-6 border-l-2 border-violet-500 bg-violet-50/40 p-3"><p className="text-xs font-bold uppercase tracking-wider text-violet-800">Logic · {assessment.logic.status}</p><p className="mt-1 text-sm text-slate-700">{assessment.logic.explanationVi}</p>{assessment.logic.missingLink && <p className="mt-1 text-sm text-slate-600">{assessment.logic.missingLink}</p>}</article>}

    {assessment.issues.length > 0 && <div className="mt-6"><h3 className="flex items-center gap-2 text-sm font-bold text-slate-800"><AlertTriangle className="h-4 w-4 text-rose-600" />Điểm cần sửa</h3><div className="mt-2 space-y-3">{assessment.issues.map((item, index) => <article key={`${item.original}-${index}`} className="border border-rose-100 bg-rose-50/30 p-3"><p className="text-xs font-bold text-rose-700">{item.category} · {item.severity}</p><p lang="ko" className="mt-1 text-sm text-rose-800">{item.original}</p><p lang="ko" className="mt-1 text-sm font-semibold text-emerald-800">{item.corrected}</p><p className="mt-1 text-sm text-slate-600">{item.explanationVi}</p></article>)}</div></div>}

    {assessment.repetition.length > 0 && <div className="mt-6"><h3 className="text-sm font-bold text-slate-800">Repetition detector</h3>{assessment.repetition.map((item) => <p key={item.expression} className="mt-2 text-sm text-slate-700"><span lang="ko" className="font-semibold">{item.expression}</span> × {item.count}{item.alternatives.length > 0 && <span className="text-slate-500"> · thử: {item.alternatives.join(', ')}</span>}</p>)}</div>}

    {priorities.length > 0 && <div className="mt-6 flex items-start gap-2 border-l-2 border-amber-400 bg-amber-50/50 p-3"><Lightbulb className="mt-0.5 h-4 w-4 text-amber-700" /><div><p className="text-sm font-bold text-amber-900">Trọng tâm bản tiếp theo</p><ul className="mt-1 space-y-1 text-sm text-slate-700">{priorities.map((focus) => <li key={focus}>{focus}</li>)}</ul></div></div>}
    <Link to={`/topik/writing/54/lab/review/${draftId}`} className="mt-6 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white"><RefreshCw className="h-4 w-4" />Viết Draft 2</Link>
  </section>;
}
