import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpenText, Loader2, PanelTopOpen } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { getTopikReading2021Service } from '../service';
import type { IdiomMemoryGroup, IdiomPriority, ReadingIdiom, ReadingIdiomGroup } from '../types';
import { sourceMeaningOrFallback } from '../utils';

const priorities: Array<IdiomPriority | 'ALL'> = ['ALL', 'S', 'A', 'B'];

export function Reading21IdiomBankPage() {
  const { isDemo } = useAuth();
  const service = useMemo(() => getTopikReading2021Service(isDemo), [isDemo]);
  const [groups, setGroups] = useState<ReadingIdiomGroup[]>([]);
  const [idioms, setIdioms] = useState<ReadingIdiom[]>([]);
  const [groupCode, setGroupCode] = useState<IdiomMemoryGroup | 'ALL'>('ALL');
  const [priority, setPriority] = useState<IdiomPriority | 'ALL'>('ALL');
  const [contrastOpen, setContrastOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { void Promise.all([service.getIdiomGroups(), service.getIdioms()]).then(([nextGroups, nextIdioms]) => { setGroups(nextGroups); setIdioms(nextIdioms); }).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Không thể tải Idiom Bank.')); }, [service]);
  if (error) return <div className="max-w-xl mx-auto px-4 py-14 text-center text-rose-700">{error}</div>;
  if (!groups.length) return <div className="min-h-[60vh] flex items-center justify-center gap-3 text-slate-500"><Loader2 className="w-6 h-6 animate-spin" />Đang tải Idiom Bank...</div>;
  const visible = idioms.filter((item) => (groupCode === 'ALL' || item.memoryGroupCode === groupCode) && (priority === 'ALL' || item.priority === priority));
  const contrastGroup = groupCode === 'ALL' ? groups.find((group) => group.code === 'HAND') || groups[0] : groups.find((group) => group.code === groupCode) || groups[0];
  const contrastIdioms = idioms.filter((item) => item.memoryGroupCode === contrastGroup.code).slice(0, 5);
  return <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 animate-fadeIn">
    <Link to="/topik/reading/21" className="text-sm font-semibold text-slate-500 hover:text-slate-900">← Câu 21</Link>
    <div className="mt-5 flex items-start gap-3"><BookOpenText className="mt-1 w-7 h-7 text-rose-700" /><div><p className="text-xs font-bold uppercase tracking-wider text-rose-700">TOPIK II · Reading</p><h1 className="mt-1 text-3xl font-extrabold">Idiom Bank</h1><p className="mt-2 text-sm text-slate-500">Nghĩa Việt chỉ hiển thị khi có trong glossary nguồn. Mục cần kiểm tra đã được ẩn mặc định.</p></div></div>
    <section className="mt-7"><p className="text-xs font-bold uppercase tracking-wider text-slate-500">Nhóm ghi nhớ</p><div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={() => setGroupCode('ALL')} className={'rounded-md px-3 py-2 text-sm font-semibold ' + (groupCode === 'ALL' ? 'bg-rose-700 text-white' : 'bg-slate-100 text-slate-700')}>Tất cả</button>{groups.map((group) => <button key={group.id} type="button" onClick={() => setGroupCode(group.code)} className={'rounded-md px-3 py-2 text-sm font-semibold ' + (groupCode === group.code ? 'bg-rose-700 text-white' : 'bg-slate-100 text-slate-700')}><span lang="ko">{group.nameKo}</span></button>)}</div></section>
    <section className="mt-5 flex flex-wrap items-center gap-2"><p className="mr-1 text-xs font-bold uppercase tracking-wider text-slate-500">Ưu tiên</p>{priorities.map((item) => <button key={item} type="button" onClick={() => setPriority(item)} className={'rounded-md border px-3 py-1.5 text-sm font-bold ' + (priority === item ? 'border-rose-600 bg-rose-50 text-rose-800' : 'border-slate-200 bg-white text-slate-600')}>{item === 'ALL' ? 'Tất cả' : item}</button>)}</section>
    <section className="mt-7 rounded-lg border border-amber-200 bg-amber-50/60 p-5"><button type="button" onClick={() => setContrastOpen((value) => !value)} className="flex items-center gap-2 font-bold text-amber-900"><PanelTopOpen className="w-5 h-5" />Contrast: <span lang="ko">{contrastGroup.nameKo}</span></button>{contrastOpen && <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">{contrastIdioms.map((idiom) => <div key={idiom.id} className="bg-white p-3 rounded-md"><p lang="ko" className="font-bold">{idiom.expressionKo}</p><p className="mt-2 text-xs text-slate-600">{sourceMeaningOrFallback(idiom.meaningViSource)}</p></div>)}</div>}</section>
    <section className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{visible.map((idiom) => { const group = groups.find((item) => item.code === idiom.memoryGroupCode); return <article key={idiom.id} className="border border-slate-200 bg-white p-5 rounded-lg"><div className="flex items-start justify-between gap-3"><p lang="ko" className="text-lg font-extrabold text-slate-900">{idiom.expressionKo}</p><span className={'rounded-md px-2 py-1 text-xs font-black ' + (idiom.priority === 'S' ? 'bg-rose-100 text-rose-800' : idiom.priority === 'A' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600')}>{idiom.priority}</span></div><p className="mt-3 text-sm text-slate-700">{sourceMeaningOrFallback(idiom.meaningViSource)}</p><dl className="mt-4 space-y-2 text-xs text-slate-500"><div><dt className="font-bold uppercase tracking-wider">Nhóm</dt><dd lang="ko" className="mt-0.5 text-sm text-slate-700">{group?.nameKo}</dd></div>{idiom.coreVerb && <div><dt className="font-bold uppercase tracking-wider">Động từ</dt><dd lang="ko" className="mt-0.5 text-sm text-slate-700">{idiom.coreVerb}{idiom.coreVerbViEditorial ? ' · ' + idiom.coreVerbViEditorial : ''}</dd></div>}<div><dt className="font-bold uppercase tracking-wider">Hình ảnh bề mặt</dt><dd lang="ko" className="mt-0.5 text-sm text-slate-700">{idiom.expressionKo}</dd><dd className="mt-0.5">Nguồn seed chưa có chú giải hình ảnh riêng.</dd></div></dl></article>; })}</section>
  </div>;
}
