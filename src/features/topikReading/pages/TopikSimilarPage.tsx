import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { getTopikReadingService } from '../service';
import type { TopikRelationGroup } from '../types';

export function TopikSimilarPage() {
  const { isDemo } = useAuth();
  const service = useMemo(() => getTopikReadingService(isDemo), [isDemo]);
  const [relations, setRelations] = useState<TopikRelationGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { service.getRelations().then(setRelations).catch((reason: any) => setError(reason?.message || 'Không thể tải dữ liệu gần nghĩa.')).finally(() => setLoading(false)); }, [service]);
  return <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
    <Link to="/topik/reading/1-4" className="text-sm font-semibold text-slate-500 hover:text-slate-900">← TOPIK Reading 1-4</Link>
    <h1 className="mt-5 text-3xl font-extrabold text-slate-900">Ngữ pháp gần nghĩa</h1>
    <p className="mt-2 text-sm text-slate-500">Mỗi nhóm liệt kê toàn bộ cấu trúc theo đúng thứ tự học liệu; chúng chỉ gần nghĩa trong ngữ cảnh ghi chú.</p>
    {loading && <div className="py-16 flex justify-center gap-2 text-slate-500"><Loader2 className="w-5 h-5 animate-spin" />Đang tải...</div>}
    {error && <div className="mt-6 p-4 rounded-lg bg-rose-50 text-rose-700 text-sm flex gap-2"><AlertCircle className="w-5 h-5 shrink-0" />{error}</div>}
    {!loading && !error && relations.length === 0 && <div className="mt-6 p-8 bg-white border border-dashed border-slate-300 rounded-xl text-center text-sm text-slate-500">Chưa có cặp ngữ pháp được xuất bản.</div>}
    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">{relations.map((relation) => <article key={relation.id} className="bg-white border border-slate-200 rounded-xl p-5"><div className="flex items-start justify-between gap-3"><div><h2 className="font-extrabold text-lg text-slate-900">{relation.title_vi}</h2><p className="mt-1 text-xs font-semibold text-brand-700">{relation.members.length} cấu trúc · {relation.category}</p></div></div><ol className="mt-5 space-y-3">{relation.members.map((member) => <li key={member.sense_id} className="border-l-2 border-slate-200 pl-3"><div className="flex items-center gap-2"><span className="text-xs font-bold text-slate-400">{member.member_order}</span><p lang="ko" className="font-extrabold text-base text-slate-900">{member.pattern_ko}</p>{member.member_role === 'HEAD' && <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-700">Mục chính</span>}</div><p className="mt-1 text-sm text-slate-600">{member.meaning_vi}</p>{member.constraints_vi && <p className="mt-1 text-xs leading-relaxed text-slate-500">{member.constraints_vi}</p>}</li>)}</ol><p className="mt-5 pt-4 border-t border-slate-100 text-sm leading-relaxed text-slate-600"><span className="font-semibold text-slate-900">Trong ngữ cảnh: </span>{relation.context_note_vi}</p></article>)}</div>
  </div>;
}
