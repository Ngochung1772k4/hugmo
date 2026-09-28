import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowRight, Brain, Loader2, ScanText, Sparkles } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { analyzeQ54Question } from '../ai';
import { getQ54Service } from '../service';
import { q54FunctionGroupByType, q54RequirementTypes } from '../types';
import type { Q54Question, Q54QuestionAnalysis, Q54Requirement, Q54Topic } from '../types';

export function Q54HubPage() {
  const { isDemo } = useAuth();
  const navigate = useNavigate();
  const service = useMemo(() => getQ54Service(isDemo), [isDemo]);
  const [topic, setTopic] = useState<Q54Topic | null>(null);
  const [questions, setQuestions] = useState<Q54Question[]>([]);
  const [requirements, setRequirements] = useState<Q54Requirement[]>([]);
  const [promptKo, setPromptKo] = useState('');
  const [analysis, setAnalysis] = useState<Q54QuestionAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void service.getEnvironment().then((data) => { setTopic(data.topic); setQuestions(data.questions); setRequirements(data.requirements); }).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Không thể tải nội dung Q54.')).finally(() => setLoading(false));
  }, [service]);

  const analyze = async () => {
    if (!promptKo.trim()) return;
    try { setAnalyzing(true); setError(null); setAnalysis(await analyzeQ54Question(promptKo, isDemo)); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Không thể phân tích đề.'); }
    finally { setAnalyzing(false); }
  };

  const saveQuestion = async () => {
    if (!analysis || !analysis.topicSuggestion || analysis.requirements.some((item) => !item.promptKo.trim() || !item.labelVi.trim())) return;
    try {
      setSaving(true); setError(null);
      const question = await service.savePrivateQuestion({ topic: analysis.topicSuggestion, promptKo, requirements: analysis.requirements });
      navigate(`/topik/writing/54/questions/${question.id}`);
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Không thể lưu đề.'); }
    finally { setSaving(false); }
  };

  const updateRequirement = (index: number, patch: Partial<Q54QuestionAnalysis['requirements'][number]>) => {
    setAnalysis((current) => current ? { ...current, requirements: current.requirements.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item) } : current);
  };
  const updateTopicSuggestion = (patch: Partial<NonNullable<Q54QuestionAnalysis['topicSuggestion']>>) => {
    setAnalysis((current) => current?.topicSuggestion ? { ...current, topicSuggestion: { ...current.topicSuggestion, ...patch } } : current);
  };

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center gap-3 text-slate-500"><Loader2 className="w-6 h-6 animate-spin" />Đang chuẩn bị Q54...</div>;
  if (!topic) return <div className="max-w-xl mx-auto px-4 py-14 text-center"><AlertCircle className="w-10 h-10 text-rose-600 mx-auto" /><p className="mt-4 text-sm text-slate-600">{error || 'Chưa có dữ liệu Q54.'}</p></div>;

  return <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 animate-fadeIn">
    <Link to="/topik/reading/1-4" className="text-sm font-semibold text-slate-500 hover:text-slate-900">← TOPIK</Link>
    <div className="mt-5 flex flex-col md:flex-row md:items-end md:justify-between gap-5">
      <div><p className="text-xs font-bold uppercase tracking-wider text-emerald-700">TOPIK II · Writing</p><h1 className="mt-1 text-3xl sm:text-4xl font-extrabold text-slate-900">Câu 54</h1><p className="mt-2 text-sm text-slate-500">Đi từ yêu cầu đề đến câu viết của chính bạn, từng bước một.</p></div>
      <Link to="/topik/writing/54/errors" className="inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:border-brand-400"><Brain className="w-4 h-4" />Error Notebook</Link>
    </div>

    {error && <div className="mt-6 flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"><AlertCircle className="w-5 h-5 shrink-0" /><span>{error}</span></div>}

    <section className="mt-8 border-y border-slate-200 py-6"><p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Topic hiện có</p><div className="mt-2 flex items-center gap-3"><span lang="ko" className="text-2xl font-extrabold text-slate-900">{topic.name_ko}</span><span className="text-sm text-slate-500">{topic.name_vi}</span></div><p className="mt-2 text-sm text-slate-600">{topic.description_vi}</p></section>

    <section className="mt-8"><div className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-brand-600" /><h2 className="text-lg font-bold">Bắt đầu với đề đã biên soạn</h2></div><div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">{questions.map((question) => <Link key={question.id} to={`/topik/writing/54/questions/${question.id}`} className="group border border-slate-200 bg-white p-5 rounded-lg hover:border-brand-400 hover:shadow-sm transition-all"><p lang="ko" className="font-bold leading-7 text-slate-900">{question.prompt_ko}</p><div className="mt-5 flex flex-wrap gap-2">{requirements.filter((item) => item.question_id === question.id).map((item) => <span key={item.id} className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600"><span lang="ko" className="text-emerald-800">{item.requirement_type}</span><span className="text-slate-400">·</span><span>{item.function_group}</span></span>)}</div><span className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-brand-700">Phân tích đề <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" /></span></Link>)}</div></section>

    <section className="mt-10 border-t border-slate-200 pt-8"><div className="flex items-center gap-2"><ScanText className="w-5 h-5 text-indigo-600" /><h2 className="text-lg font-bold">Phân tích đề mới</h2></div><p className="mt-1 text-sm text-slate-500">AI chỉ tách yêu cầu. Bạn kiểm tra và chỉnh lại trước khi lưu.</p><textarea value={promptKo} onChange={(event) => setPromptKo(event.target.value)} placeholder="Dán đề Q54 bằng tiếng Hàn..." className="mt-4 min-h-32 w-full resize-y rounded-lg border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
      <button type="button" disabled={!promptKo.trim() || analyzing} onClick={() => void analyze()} className="mt-3 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-600 disabled:bg-slate-300 text-white text-sm font-semibold"><Sparkles className="w-4 h-4" />{analyzing ? 'Đang phân tích...' : 'Phân tích yêu cầu'}</button>
      {analysis && <div className="mt-6 border border-indigo-200 bg-white rounded-lg p-5"><p className="text-sm font-bold text-slate-900">Xác nhận topic và requirements</p><p className="mt-1 text-xs text-slate-500">Group được suy ra cố định từ semantic type; không thể tự chọn sai group.</p>{analysis.topicSuggestion ? <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 rounded-lg bg-slate-50 p-4"><label className="text-xs font-bold text-slate-600">Topic<input value={analysis.topicSuggestion.nameKo} onChange={(event) => updateTopicSuggestion({ nameKo: event.target.value, kind: 'OTHER' })} lang="ko" className="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20" /></label><label className="text-xs font-bold text-slate-600">Nghĩa tiếng Việt<input value={analysis.topicSuggestion.nameVi} onChange={(event) => updateTopicSuggestion({ nameVi: event.target.value, kind: 'OTHER' })} className="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20" /></label><label className="text-xs font-bold text-slate-600">Subtopic<input value={analysis.topicSuggestion.subtopicKo || ''} onChange={(event) => updateTopicSuggestion({ subtopicKo: event.target.value || null, kind: 'OTHER' })} lang="ko" className="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20" /></label><p className="md:col-span-3 text-xs text-slate-500">{analysis.topicSuggestion.kind === 'OTHER' ? 'Chủ đề này chưa có trong Content Bank. Đề sẽ được lưu dưới topic riêng của bạn, chỉ dùng Global Bank.' : 'Dùng Content Bank của topic đã có.'}</p></div> : <p className="mt-4 rounded-md bg-amber-50 p-3 text-sm text-amber-800">AI chưa xác định được topic. Hãy phân tích lại trước khi lưu để tránh gán sai Bank.</p>}<div className="mt-4 space-y-4">{analysis.requirements.map((item, index) => <div key={`${item.promptKo}-${index}`} className="grid grid-cols-1 md:grid-cols-2 gap-3 border-b border-slate-100 pb-4 last:border-0 last:pb-0"><input value={item.labelVi} onChange={(event) => updateRequirement(index, { labelVi: event.target.value })} placeholder="Nhãn tiếng Việt" className="rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20" /><input value={item.promptKo} onChange={(event) => updateRequirement(index, { promptKo: event.target.value })} placeholder="Yêu cầu tiếng Hàn" lang="ko" className="rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20" /><label className="text-xs font-bold text-slate-600">Type<select value={item.requirementType} onChange={(event) => { const requirementType = event.target.value as Q54QuestionAnalysis['requirements'][number]['requirementType']; updateRequirement(index, { requirementType, functionGroup: q54FunctionGroupByType[requirementType] }); }} className="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20">{q54RequirementTypes.map((type) => <option key={type} value={type}>{type}</option>)}</select></label><div className="text-xs font-bold text-slate-600">Group<p className="mt-1 rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">{q54FunctionGroupByType[item.requirementType]}</p></div></div>)}</div>
        <button type="button" disabled={saving} onClick={() => void saveQuestion()} className="mt-5 px-4 py-2.5 rounded-lg bg-emerald-600 disabled:bg-slate-300 text-white text-sm font-semibold">{saving ? 'Đang lưu...' : 'Lưu đề riêng và bắt đầu'}</button></div>}
    </section>
  </div>;
}
