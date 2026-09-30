import { ChevronDown, Pin, PinOff } from 'lucide-react';
import type { Q54Idea } from '../types';

type Props = {
  idea: Q54Idea;
  revealLevel: number;
  pinned: boolean;
  pinDisabled: boolean;
  onReveal: () => void;
  onTogglePin: () => void;
};

const nextLabel = ['Mở rộng ý', 'Xem lý do', 'Xem kết quả', 'Xem collocation'];

export function ExpandedIdeaCard({ idea, revealLevel, pinned, pinDisabled, onReveal, onTogglePin }: Props) {
  const logicKo = idea.logic_chain_ko?.length ? idea.logic_chain_ko : idea.logic_steps;
  const logicVi = idea.logic_chain_vi || [];
  const collocations = idea.recommended_collocations || [];
  const hasMore = revealLevel < 4;

  return <article className={`border px-4 py-4 ${pinned ? 'border-amber-300 bg-amber-50/40' : 'border-slate-200 bg-white'}`}>
    <div className="flex items-start justify-between gap-3">
      <div>
        <p lang="ko" className="font-bold text-slate-900">{idea.keyword_ko}</p>
        <p className="mt-1 text-sm text-slate-600">{idea.keyword_vi}</p>
      </div>
      <button type="button" onClick={onTogglePin} disabled={pinDisabled && !pinned} title={pinned ? 'Bỏ ghim ý này' : 'Ghim ý này'} className="shrink-0 rounded-md p-2 text-amber-700 hover:bg-amber-100 disabled:cursor-not-allowed disabled:text-slate-300">
        {pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
      </button>
    </div>
    {revealLevel >= 1 && <div className="mt-4"><p className="text-xs font-bold uppercase tracking-wider text-slate-500">Logic</p><ol className="mt-2 flex flex-wrap items-center gap-2">{logicKo.map((step, index) => <li key={`${step}-${index}`} className="flex items-center gap-2"><span lang="ko" className="rounded-md bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-900">{step}</span>{index < logicKo.length - 1 && <span className="text-amber-500">→</span>}</li>)}</ol>{logicVi.length > 0 && <p className="mt-2 text-xs text-slate-500">{logicVi.join(' → ')}</p>}</div>}
    {revealLevel >= 2 && idea.reason_ko && <div className="mt-4 border-l-2 border-sky-400 pl-3"><p className="text-xs font-bold uppercase tracking-wider text-sky-700">Why</p><p lang="ko" className="mt-1 text-sm font-medium text-slate-800">{idea.reason_ko}</p><p className="mt-1 text-sm text-slate-600">{idea.reason_vi}</p></div>}
    {revealLevel >= 3 && idea.result_ko && <div className="mt-4 border-l-2 border-emerald-400 pl-3"><p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Result</p><p lang="ko" className="mt-1 text-sm font-medium text-slate-800">{idea.result_ko}</p><p className="mt-1 text-sm text-slate-600">{idea.result_vi}</p></div>}
    {revealLevel >= 4 && <div className="mt-4"><p className="text-xs font-bold uppercase tracking-wider text-slate-500">Useful collocations</p>{collocations.length > 0 && <div className="mt-2 flex flex-wrap gap-2">{collocations.map((collocation) => <span key={collocation} lang="ko" className="rounded-md bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-900">{collocation}</span>)}</div>}{idea.expansion_ko && <><p className="mt-3 text-xs font-bold uppercase tracking-wider text-slate-500">Mở rộng</p><p lang="ko" className="mt-1 text-sm font-medium text-slate-800">{idea.expansion_ko}</p><p className="mt-1 text-sm text-slate-600">{idea.expansion_vi}</p></>}</div>}
    {hasMore && <button type="button" onClick={onReveal} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-800"><ChevronDown className="h-4 w-4" />{nextLabel[revealLevel]}</button>}
  </article>;
}
