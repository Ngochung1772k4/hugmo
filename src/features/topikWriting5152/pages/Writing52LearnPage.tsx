import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { getTopikWriting5152Service } from '../service';
import type { Q52Relation } from '../types';

export function Writing52LearnPage() {
  const { isDemo } = useAuth();
  const service = useMemo(() => getTopikWriting5152Service(isDemo), [isDemo]);
  const [relations, setRelations] = useState<Q52Relation[]>([]);
  useEffect(() => { void service.getQ52Relations().then(setRelations); }, [service]);
  if (!relations.length) return <div className="min-h-[60vh] flex items-center justify-center gap-3 text-slate-500"><Loader2 className="w-6 h-6 animate-spin" />Đang tải pattern...</div>;
  return <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
    <Link to="/topik/writing/52" className="text-sm font-semibold text-slate-500 hover:text-slate-900">← Câu 52</Link>
    <h1 className="mt-5 text-2xl sm:text-3xl font-extrabold">Quan hệ logic & pattern câu 52</h1>
    <p className="mt-2 text-sm text-slate-500">Từ nội dung đoạn văn, tìm quan hệ giữa các ý thay vì chỉ chọn một cấu trúc quen mắt.</p>
    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">{relations.map((relation) => <section key={relation.id} className="border border-slate-200 bg-white rounded-lg p-5"><h2 lang="ko" className="font-bold text-lg">{relation.nameKo}</h2><p className="mt-1 text-sm text-slate-500">{relation.nameVi}</p><div className="mt-4 space-y-2">{relation.patterns.map((pattern) => <p key={pattern.id} lang="ko" className="rounded-md bg-sky-50 px-3 py-2 text-sm font-semibold text-sky-950">{pattern.patternKo}</p>)}</div></section>)}</div>
  </div>;
}
