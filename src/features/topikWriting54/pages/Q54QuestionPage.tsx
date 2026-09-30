import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, BookOpen, Lightbulb, Loader2, PenLine, Sparkles } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { generateQ54Ideas, generateQ54TranslationExercise } from '../ai';
import { ExpandedIdeaCard } from '../components/ExpandedIdeaCard';
import { getIdeasForRequirement } from '../ideaBank';
import { getQ54Service } from '../service';
import type { Q54GeneratedIdea, Q54Idea, Q54QuestionBundle, Q54Requirement } from '../types';

const groupLabel: Record<Q54Requirement['function_group'], string> = { POSITIVE: 'Tích cực / tầm quan trọng', NEGATIVE: 'Vấn đề / tác động xấu', CAUSE: 'Nguyên nhân', SOLUTION: 'Giải pháp', SPECIAL: 'Góc nhìn khác' };

function generatedIdeaCard(idea: Q54GeneratedIdea, topicId: string, requirement: Q54Requirement, index: number): Q54Idea {
  return {
    id: idea.id || `generated-${requirement.id}-${index}-${idea.keywordKo}`,
    topic_id: topicId,
    requirement_id: requirement.id,
    scope: 'TOPIC',
    requirement_types: [requirement.requirement_type],
    function_group: requirement.function_group,
    keyword_ko: idea.keywordKo,
    keyword_vi: idea.keywordVi,
    reason_ko: idea.reasonKo,
    reason_vi: idea.reasonVi,
    result_ko: idea.resultKo,
    result_vi: idea.resultVi,
    expansion_ko: idea.expansionKo || null,
    expansion_vi: idea.expansionVi || null,
    logic_steps: idea.logicChainKo,
    logic_chain_ko: idea.logicChainKo,
    logic_chain_vi: idea.logicChainVi,
    recommended_collocations: idea.recommendedCollocations,
    reuse_score: 3,
    difficulty: 'NORMAL',
    visibility: 'PRIVATE',
  };
}

export function Q54QuestionPage() {
  const { id = '' } = useParams();
  const { isDemo } = useAuth();
  const navigate = useNavigate();
  const service = useMemo(() => getQ54Service(isDemo), [isDemo]);
  const [bundle, setBundle] = useState<Q54QuestionBundle | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generatedIdeas, setGeneratedIdeas] = useState<Record<string, Q54GeneratedIdea[]>>({});
  const [generatingRequirementId, setGeneratingRequirementId] = useState<string | null>(null);
  const [ideaError, setIdeaError] = useState<string | null>(null);
  const [revealedLevels, setRevealedLevels] = useState<Record<string, number>>({});
  const [pinnedIdeaIds, setPinnedIdeaIds] = useState<string[]>([]);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualPromptVi, setManualPromptVi] = useState('');
  const [creatingExercise, setCreatingExercise] = useState<'AI' | 'MANUAL' | null>(null);
  const [exerciseError, setExerciseError] = useState<string | null>(null);

  useEffect(() => {
    void service.getQuestionBundle(id).then((data) => { setBundle(data); setSelectedId(data.requirements[0]?.id || null); }).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Không thể tải đề.'));
  }, [id, service]);

  if (error) return <div className="mx-auto max-w-xl px-4 py-14 text-center text-rose-700">{error}</div>;
  if (!bundle) return <div className="flex min-h-[60vh] items-center justify-center gap-3 text-slate-500"><Loader2 className="h-6 w-6 animate-spin" />Đang tải đề...</div>;
  const selected = bundle.requirements.find((item) => item.id === selectedId) || bundle.requirements[0];
  const seededIdeas = selected ? getIdeasForRequirement(bundle.ideas, bundle.topic.id, selected) : [];
  const generatedIdeaCards = selected ? (generatedIdeas[selected.id] || []).map((idea, index) => generatedIdeaCard(idea, bundle.topic.id, selected, index)) : [];
  const ideas = [...seededIdeas, ...generatedIdeaCards];
  const patterns = bundle.patterns.filter((item) => item.function_group === selected?.function_group);
  const examples = bundle.examples.filter((item) => patterns.some((pattern) => pattern.id === item.pattern_id));
  const topicCollocations = bundle.collocations.filter((item) => item.function_group === selected?.function_group);
  const globalCollocations = bundle.globalCollocations.filter((item) => item.function_group === selected?.function_group);
  const exercises = bundle.exercises.filter((item) => item.requirement_id === selected?.id);
  const activeExercise = exercises.find((item) => item.id === selectedExerciseId) || exercises[0];
  const pinnedIdeas = ideas.filter((idea) => pinnedIdeaIds.includes(idea.id));

  const selectRequirement = (requirementId: string) => { setSelectedId(requirementId); setSelectedExerciseId(null); setExerciseError(null); setIdeaError(null); };
  const revealIdea = (ideaId: string) => setRevealedLevels((current) => ({ ...current, [ideaId]: Math.min(4, (current[ideaId] || 0) + 1) }));
  const togglePin = (ideaId: string) => setPinnedIdeaIds((current) => current.includes(ideaId) ? current.filter((idValue) => idValue !== ideaId) : current.length < 2 ? [...current, ideaId] : current);
  const createIdeas = async () => {
    if (!selected || generatingRequirementId) return;
    try {
      setGeneratingRequirementId(selected.id);
      setIdeaError(null);
      const newIdeas = await generateQ54Ideas({ questionId: bundle.question.id, requirementId: selected.id, functionGroup: selected.function_group, isDemo });
      setGeneratedIdeas((current) => ({ ...current, [selected.id]: newIdeas }));
    } catch (reason) { setIdeaError(reason instanceof Error ? reason.message : 'Không thể tạo thêm ý lúc này.'); }
    finally { setGeneratingRequirementId(null); }
  };
  const createAiExercise = async () => {
    if (!selected || creatingExercise) return;
    try { setCreatingExercise('AI'); setExerciseError(null); const exerciseId = await generateQ54TranslationExercise({ questionId: bundle.question.id, requirementId: selected.id, isDemo }); navigate(`/topik/writing/54/practice/${exerciseId}`); }
    catch (reason) { setExerciseError(reason instanceof Error ? reason.message : 'Không thể tạo bài luyện bằng AI.'); }
    finally { setCreatingExercise(null); }
  };
  const createManualExercise = async () => {
    if (!selected || creatingExercise || !manualPromptVi.trim()) return;
    try { setCreatingExercise('MANUAL'); setExerciseError(null); const exercise = await service.createManualExercise({ questionId: bundle.question.id, requirementId: selected.id, promptVi: manualPromptVi }); navigate(`/topik/writing/54/practice/${exercise.id}`); }
    catch (reason) { setExerciseError(reason instanceof Error ? reason.message : 'Không thể lưu câu tiếng Việt.'); }
    finally { setCreatingExercise(null); }
  };

  return <div className="mx-auto max-w-6xl animate-fadeIn px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
    <Link to="/topik/writing/54" className="text-sm font-semibold text-slate-500 hover:text-slate-900">← TOPIK Writing 54</Link>
    <p className="mt-5 text-xs font-bold uppercase tracking-wider text-emerald-700">{bundle.topic.name_ko} · {bundle.topic.name_vi}</p>
    {bundle.question.subtopic_ko && <p lang="ko" className="mt-2 text-sm font-bold text-slate-600">{bundle.question.subtopic_ko}</p>}
    <h1 lang="ko" className="mt-2 max-w-4xl text-xl font-extrabold leading-9 text-slate-900 sm:text-2xl">{bundle.question.prompt_ko}</h1>

    <section className="mt-8"><h2 className="text-lg font-bold">Chọn một yêu cầu để luyện</h2><div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">{bundle.requirements.map((requirement, index) => <button key={requirement.id} type="button" onClick={() => selectRequirement(requirement.id)} className={`min-h-32 rounded-lg border p-4 text-left transition-colors ${selected?.id === requirement.id ? 'border-brand-500 bg-brand-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}><span className="text-xs font-bold text-brand-700">Yêu cầu {index + 1}</span><div className="mt-2 flex flex-wrap gap-2"><span lang="ko" className="rounded-md bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-800">{requirement.requirement_type}</span><span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">{requirement.function_group}</span></div><p className="mt-3 font-bold text-slate-900">{requirement.label_vi}</p><p lang="ko" className="mt-2 text-sm text-slate-600">{requirement.prompt_ko}</p></button>)}</div></section>

    {selected && <><section className="mt-9 grid grid-cols-1 gap-8 lg:grid-cols-2"><div><div className="flex items-center gap-2"><Lightbulb className="h-5 w-5 text-amber-500" /><h2 className="text-lg font-bold">Idea Bank</h2></div><p className="mt-1 text-sm text-slate-500">{groupLabel[selected.function_group]}. Mở dần logic, lý do và kết quả để tự viết câu của bạn.</p><button type="button" onClick={() => void createIdeas()} disabled={generatingRequirementId === selected.id} className="mt-4 inline-flex items-center gap-2 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-sm font-semibold text-brand-700 disabled:cursor-wait disabled:opacity-60"><Sparkles className="h-4 w-4" />{generatingRequirementId === selected.id ? 'Đang tạo...' : 'Tạo thêm 3 ý bằng AI'}</button>{ideaError && <p className="mt-3 text-sm text-rose-700">{ideaError}</p>}{pinnedIdeas.length > 0 && <aside className="mt-4 border-l-2 border-amber-400 bg-amber-50/50 px-3 py-3"><p className="text-xs font-bold uppercase tracking-wider text-amber-800">Ý tôi sẽ dùng</p><ol className="mt-2 space-y-1">{pinnedIdeas.map((idea, index) => <li key={idea.id} lang="ko" className="text-sm font-medium text-slate-800">{index + 1}. {idea.keyword_ko}</li>)}</ol></aside>}<div className="mt-4 space-y-3">{ideas.map((idea) => <ExpandedIdeaCard key={idea.id} idea={idea} revealLevel={revealedLevels[idea.id] || 0} pinned={pinnedIdeaIds.includes(idea.id)} pinDisabled={pinnedIdeaIds.length >= 2} onReveal={() => revealIdea(idea.id)} onTogglePin={() => togglePin(idea.id)} />)}{!ideas.length && <p className="text-sm text-slate-500">Chưa có dữ liệu chuyên biệt cho chủ đề này. Hệ thống chỉ hiển thị Idea Bank dùng chung khi phù hợp yêu cầu.</p>}</div></div><div><div className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-sky-600" /><h2 className="text-lg font-bold">Collocation & pattern</h2></div>{topicCollocations.length ? <div className="mt-4 divide-y border-y border-slate-200">{topicCollocations.map((item) => <div key={item.id} className="flex items-start justify-between gap-4 py-3"><div><p lang="ko" className="font-bold">{item.expression_ko}</p><p className="mt-1 text-sm text-slate-500">{item.meaning_vi}</p></div><span className="shrink-0 text-xs font-bold text-amber-700">{'★'.repeat(item.reuse_score)}</span></div>)}</div> : <p className="mt-4 text-sm text-slate-500">Chưa có dữ liệu chuyên biệt cho chủ đề này.</p>}<div className="mt-5"><p className="text-xs font-bold uppercase tracking-wider text-slate-500">Global reusable</p><div className="mt-2 divide-y border-y border-slate-200">{globalCollocations.map((item) => <div key={item.id} className="py-3"><p lang="ko" className="font-bold">{item.expression_ko}</p><p className="mt-1 text-sm text-slate-500">{item.meaning_vi}</p></div>)}{!globalCollocations.length && <p className="py-3 text-sm text-slate-500">Chưa có collocation dùng chung cho nhóm này.</p>}</div></div><div className="mt-5 space-y-3">{patterns.map((pattern) => <div key={pattern.id} className="border-l-2 border-brand-500 pl-4"><p lang="ko" className="font-bold text-slate-900">{pattern.pattern_ko}</p><p className="mt-1 text-sm text-slate-500">{pattern.meaning_vi}</p></div>)}</div>{examples.length > 0 && <div className="mt-6"><p className="text-xs font-bold uppercase tracking-wider text-slate-500">Ví dụ</p><div className="mt-2 space-y-3">{examples.map((example) => <article key={example.id} className="border-l-2 border-emerald-500 bg-emerald-50/40 px-3 py-2"><p lang="ko" className="font-semibold text-slate-900">{example.sentence_ko}</p><p className="mt-1 text-sm text-slate-600">{example.translation_vi}</p></article>)}</div></div>}</div></section>
      <section className="mt-10 border-t border-slate-200 pt-7"><div className="flex items-center gap-2"><PenLine className="h-5 w-5 text-emerald-600" /><h2 className="font-bold">Luyện một câu trước</h2></div><p className="mt-1 text-sm text-slate-500">Dịch Việt → Hàn, rồi nhận xét cấu trúc sau khi nộp.</p>{exercises.length > 1 && <label className="mt-4 block text-sm font-semibold text-slate-700">Câu luyện đã tạo<select value={activeExercise?.id || ''} onChange={(event) => setSelectedExerciseId(event.target.value)} className="mt-2 block w-full max-w-xl rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20">{exercises.map((item) => <option key={item.id} value={item.id}>{item.prompt_vi}</option>)}</select></label>}<div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">{activeExercise && <Link to={`/topik/writing/54/practice/${activeExercise.id}`} className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-5 py-3 text-sm font-semibold text-white"><ArrowRight className="h-4 w-4" />Bắt đầu luyện câu</Link>}<button type="button" onClick={() => void createAiExercise()} disabled={!!creatingExercise} className="inline-flex items-center justify-center gap-2 rounded-lg border border-brand-200 bg-brand-50 px-5 py-3 text-sm font-semibold text-brand-700 disabled:opacity-60"><Sparkles className="h-4 w-4" />{creatingExercise === 'AI' ? 'Đang tạo...' : 'AI tạo câu luyện'}</button><button type="button" onClick={() => setShowManualInput((current) => !current)} disabled={!!creatingExercise} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700"><PenLine className="h-4 w-4" />Nhập câu tiếng Việt</button></div>{showManualInput && <div className="mt-5 max-w-2xl"><label htmlFor="q54-manual-prompt" className="text-sm font-semibold text-slate-800">Câu tiếng Việt</label><textarea id="q54-manual-prompt" value={manualPromptVi} maxLength={250} onChange={(event) => setManualPromptVi(event.target.value)} className="mt-2 min-h-28 w-full resize-y rounded-lg border border-slate-200 bg-white p-3 text-sm leading-6 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" /><p className="mt-2 text-xs text-slate-500">{manualPromptVi.length}/250 ký tự</p><button type="button" disabled={!manualPromptVi.trim() || !!creatingExercise} onClick={() => void createManualExercise()} className="mt-3 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white disabled:bg-slate-300">{creatingExercise === 'MANUAL' ? 'Đang lưu...' : 'Tạo bài luyện'}</button></div>}{exerciseError && <p className="mt-4 text-sm text-rose-700">{exerciseError}</p>}</section></>}
  </div>;
}
