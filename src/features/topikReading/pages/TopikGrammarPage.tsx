import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Loader2, Search } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { getTopikReadingService } from '../service';
import type { TopikGrammar } from '../types';

export function TopikGrammarPage() {
  const { isDemo } = useAuth();
  const service = useMemo(() => getTopikReadingService(isDemo), [isDemo]);
  const [grammar, setGrammar] = useState<TopikGrammar[]>([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    service.getGrammar().then(setGrammar).catch((reason: any) => setError(reason?.message || 'Không thể tải ngữ pháp.')).finally(() => setLoading(false));
  }, [service]);

  const categories = [...new Set(grammar.map((item) => item.primary_category))];
  const visible = grammar.filter((item) => {
    const content = `${item.pattern_ko} ${item.form_rule || ''} ${item.display_meaning_vi} ${item.senses.map((sense) => sense.meaning_vi).join(' ')}`.toLowerCase();
    return (category === 'ALL' || item.primary_category === category) && content.includes(query.toLowerCase());
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      <Link to="/topik/reading/1-4" className="text-sm font-semibold text-slate-500 hover:text-slate-900">← TOPIK Reading 1-4</Link>
      <h1 className="mt-5 text-3xl font-extrabold text-slate-900">Học ngữ pháp</h1>
      <p className="mt-2 text-sm text-slate-500">Các cấu trúc phục vụ câu 1-2, có thể tìm theo mẫu hoặc nghĩa tiếng Việt.</p>
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <label className="relative flex-1"><Search className="w-4 h-4 absolute top-3.5 left-3 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm cấu trúc hoặc nghĩa..." className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20" /></label>
        <select value={category} onChange={(event) => setCategory(event.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm focus:outline-none">
          <option value="ALL">Tất cả nhóm</option>{categories.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </div>
      {loading && <div className="py-16 flex justify-center gap-2 text-slate-500"><Loader2 className="w-5 h-5 animate-spin" />Đang tải...</div>}
      {error && <div className="mt-6 p-4 rounded-lg bg-rose-50 text-rose-700 text-sm flex gap-2"><AlertCircle className="w-5 h-5 shrink-0" />{error}</div>}
      {!loading && !error && visible.length === 0 && <div className="mt-6 p-8 bg-white border border-dashed border-slate-300 rounded-xl text-center text-sm text-slate-500">Không có cấu trúc phù hợp.</div>}
      <div className="mt-6 space-y-4">
        {visible.map((item) => <article key={item.id} className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-xl font-extrabold text-slate-900">{item.pattern_ko}</h2><p className="mt-1 text-sm font-medium text-brand-700">{item.display_meaning_vi}</p></div><span className="px-2.5 py-1 bg-slate-100 rounded-full text-xs font-semibold text-slate-600">{item.primary_category}</span></div>
          {item.form_rule && <p className="mt-4 text-sm"><span className="font-bold text-slate-700">Công thức: </span>{item.form_rule}</p>}
          {item.senses.map((sense) => <div key={sense.id} className="mt-4 pt-4 border-t border-slate-100 text-sm text-slate-600 space-y-2"><p><span className="font-semibold text-slate-800">Cách dùng: </span>{sense.usage_note_vi || sense.meaning_vi}</p>{sense.constraints_vi && <p><span className="font-semibold text-slate-800">Lưu ý: </span>{sense.constraints_vi}</p>}{sense.examples.map((example) => <p key={example.id} className="rounded-lg bg-slate-50 p-3"><span lang="ko" className="font-medium text-slate-900">{example.sentence_ko}</span>{example.translation_vi && <span className="block mt-1 text-slate-500">{example.translation_vi}</span>}</p>)}</div>)}
        </article>)}
      </div>
    </div>
  );
}
