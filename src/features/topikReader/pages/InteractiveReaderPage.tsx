import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { BookMarked, FolderPlus, Languages, Loader2, PenLine, Save, X } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { analyze } from '../analysis';
import { getOrCreateReadingStudySet, readerService } from '../service';
import { blocks, segments, sentenceFor } from '../utils';
import type { Annotation, KoreanAnalysis, Passage, PassageVersion } from '../types';

type SelectionMode = 'WORD' | 'SENTENCE';
type Picked = {
  block_index: number;
  start_offset: number;
  end_offset: number;
  selected_text: string;
  sentence_context: string;
  sentenceStart: number;
  sentenceEnd: number;
  mode: SelectionMode;
  analysis?: KoreanAnalysis;
};

export function InteractiveReaderPage() {
  const { id = '' } = useParams();
  const [params] = useSearchParams();
  const { user, isDemo } = useAuth();
  const service = useMemo(() => readerService(isDemo), [isDemo]);
  const root = useRef<HTMLDivElement>(null);
  const [passage, setPassage] = useState<Passage | null>(null);
  const [version, setVersion] = useState<PassageVersion | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [picked, setPicked] = useState<Picked | null>(null);
  const [readingSet, setReadingSet] = useState<{ id: string; title: string } | null>(null);
  const [term, setTerm] = useState('');
  const [meaning, setMeaning] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    service.get(id, params.get('version') || undefined)
      .then((result) => {
        setPassage(result.passage);
        setVersion(result.version);
        setAnnotations(result.annotations);
      })
      .catch((error) => setMessage(error.message));
  }, [id, params, service]);

  const select = async () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !root.current || !version) return;
    const range = selection.getRangeAt(0);
    const startBlock = range.startContainer.parentElement?.closest('[data-block-index]') as HTMLElement | null;
    const endBlock = range.endContainer.parentElement?.closest('[data-block-index]') as HTMLElement | null;
    if (!startBlock || startBlock !== endBlock) {
      setMessage('Chỉ chọn text trong cùng một đoạn.');
      return;
    }

    const full = startBlock.textContent || '';
    const before = range.cloneRange();
    before.selectNodeContents(startBlock);
    before.setEnd(range.startContainer, range.startOffset);
    const rawText = range.toString();
    const text = rawText.trim();
    const start = before.toString().length + rawText.length - rawText.trimStart().length;
    const end = start + text.length;
    const sentence = sentenceFor(full, start, end);
    const mode: SelectionMode = text === sentence.sentence.trim() ? 'SENTENCE' : 'WORD';
    const maxLength = mode === 'SENTENCE' ? 500 : 40;
    if (!text || text.length > maxLength || !/[\p{L}\p{Script=Hangul}\p{N}]/u.test(text) || full.slice(start, end) !== text) {
      setMessage('Chọn một từ tối đa 40 ký tự, hoặc bôi đen trọn một câu để dịch.');
      return;
    }

    const next: Picked = { block_index: Number(startBlock.dataset.blockIndex), start_offset: start, end_offset: end, selected_text: text, sentence_context: sentence.sentence, sentenceStart: sentence.start, sentenceEnd: sentence.end, mode };
    setPicked(next);
    setTerm(text);
    setMeaning('');
    setBusy(true);
    try {
      const result = await analyze(text, sentence.sentence, sentence.start, sentence.end, isDemo, mode);
      setPicked({ ...next, analysis: result });
      setTerm(result.lemma);
      setMeaning(result.meaningVi);
    } catch (error: any) {
      setMessage(error.message);
    } finally {
      setBusy(false);
      selection.removeAllRanges();
    }
  };

  const createReadingSet = async () => {
    if (!passage || !user) return;
    setBusy(true);
    try {
      const set = await getOrCreateReadingStudySet(passage, isDemo);
      setReadingSet({ id: set.id, title: set.title });
      setMessage('Đã tạo set riêng cho bài đọc này.');
    } catch (error: any) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {
    if (!picked || picked.mode === 'SENTENCE' || !picked.analysis || !version || !user || !readingSet) return;
    setBusy(true);
    try {
      const result = await service.save({ userId: user.id, version, selection: picked, analysis: { ...picked.analysis, lemma: term, meaningVi: meaning }, studySetId: readingSet.id, term, meaning });
      setAnnotations((current) => [...current, result.annotation]);
      setPicked(null);
      setMessage('Đã lưu vào set của bài đọc.');
    } catch (error: any) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  };

  if (!passage || !version) return <div className="min-h-[60vh] flex justify-center items-center"><Loader2 className="animate-spin" /></div>;
  const isSentence = picked?.mode === 'SENTENCE';

  return <div className="max-w-5xl mx-auto px-4 py-7">
    <div className="flex justify-between items-center gap-3">
      <div>
        <Link to="/topik/reader" className="text-sm font-semibold text-slate-500">&larr; Bài đọc</Link>
        <h1 className="mt-3 text-2xl font-extrabold">{passage.title}</h1>
      </div>
      <div className="flex gap-2">
        <Link to={`/topik/reader/${id}/vocabulary`} className="p-2 border rounded-lg" title="Từ đã lưu"><BookMarked className="w-4 h-4" /></Link>
        <Link to={`/topik/reader/${id}/edit`} className="p-2 border rounded-lg" title="Sửa bài"><PenLine className="w-4 h-4" /></Link>
      </div>
    </div>
    {message && <p className="mt-4 text-sm text-amber-700">{message}</p>}
    <article ref={root} onMouseUp={select} onTouchEnd={select} className="mt-6 bg-white border rounded-xl p-6 sm:p-8 select-text">
      {blocks(version.content).map((block, index) => <p key={index} data-block-index={index} className="text-lg leading-loose text-slate-900 mb-6" lang="ko">
        {segments(block, annotations.filter((annotation) => annotation.block_index === index)).map((part, partIndex) => part.annotation
          ? <mark key={partIndex} id={`annotation-${part.annotation.id}`} className="bg-amber-100 underline decoration-brand-500 rounded px-0.5" title={`${part.annotation.lemma}: ${part.annotation.meaning_vi}`}>{part.text}</mark>
          : <span key={partIndex}>{part.text}</span>)}
      </p>)}
    </article>
    {picked && <div className="fixed inset-x-4 bottom-4 z-50 max-w-xl mx-auto bg-white border shadow-xl rounded-xl p-5">
      <button onClick={() => setPicked(null)} className="absolute top-3 right-3" title="Đóng"><X className="w-4 h-4" /></button>
      <div className="flex items-center gap-2 pr-8">
        {isSentence && <Languages className="w-5 h-5 text-brand-600" />}
        <p lang="ko" className="font-bold text-lg">{picked.selected_text}</p>
      </div>
      {busy ? <p className="mt-2 text-sm">Đang phân tích...</p> : isSentence ? <div className="mt-4 border-l-4 border-brand-500 pl-4">
        <p className="text-xs font-bold uppercase text-slate-500">Bản dịch tiếng Việt</p>
        <p className="mt-1 text-base leading-relaxed text-slate-900">{picked.analysis?.sentenceTranslationVi || picked.analysis?.meaningVi || 'Không thể dịch câu này. Thử lại sau.'}</p>
      </div> : <div className="mt-3 grid gap-3">
        <input value={term} onChange={(event) => setTerm(event.target.value)} placeholder="Dạng từ điển" className="p-2 border rounded" />
        <input value={meaning} onChange={(event) => setMeaning(event.target.value)} placeholder="Nghĩa tiếng Việt" className="p-2 border rounded" />
        {readingSet ? <div className="border-l-4 border-brand-500 pl-3"><p className="text-xs font-bold uppercase text-slate-500">Set của bài đọc</p><p className="mt-1 text-sm font-semibold">{readingSet.title}</p></div> : <button onClick={createReadingSet} disabled={busy} className="inline-flex justify-center items-center gap-2 p-3 border border-brand-600 text-brand-700 font-semibold rounded-lg disabled:text-slate-400 disabled:border-slate-300"><FolderPlus className="w-4 h-4" />Tạo set cho bài đọc</button>}
        {picked.analysis?.confidence === 'LOW' && <p className="text-xs text-amber-700">Cần kiểm tra kết quả phân tích.</p>}
        <button disabled={!picked.analysis || !readingSet || busy} onClick={save} className="inline-flex justify-center gap-2 p-3 rounded-lg bg-brand-600 text-white font-semibold disabled:bg-slate-300"><Save className="w-4 h-4" />Lưu vào set bài đọc</button>
      </div>}
    </div>}
  </div>;
}
