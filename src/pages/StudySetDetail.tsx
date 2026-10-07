import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { studySetService } from '../services/studySetService';
import type { StudySet } from '../types';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { flashcardReaderContexts } from '../features/topikReader/service';
import {
  Layers,
  ArrowLeft,
  Edit3,
  Trash2,
  Volume2,
  HelpCircle,
  Loader2,
  PenTool,
} from 'lucide-react';

export const StudySetDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isDemo } = useAuth();
  const navigate = useNavigate();

  const [studySet, setStudySet] = useState<StudySet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [studyCardCount, setStudyCardCount] = useState(0);
  const [readerContexts, setReaderContexts] = useState<Array<{ flashcardId: string; passageId: string; annotationId: string; title: string; context: string }>>([]);

  useEffect(() => {
    if (!id) return;
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await studySetService.getStudySetById(id, isDemo);
        if (!data) {
          setError('Study set not found.');
          return;
        }
        setStudySet(data);
        setStudyCardCount(Math.min(10, data.cards?.length || 0));
      } catch (err: any) {
        setError(err?.message || 'Error loading study set.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, isDemo]);

  useEffect(() => {
    if (!studySet?.cards) return;
    flashcardReaderContexts(studySet.cards.map((card) => card.id), isDemo).then(setReaderContexts).catch(() => setReaderContexts([]));
  }, [isDemo, studySet]);

  const handleDelete = async () => {
    if (!id) return;
    setIsDeleting(true);
    try {
      await studySetService.deleteStudySet(id, isDemo);
      navigate('/dashboard');
    } catch (err: any) {
      alert('Failed to delete: ' + (err?.message || 'Unknown error'));
    } finally {
      setIsDeleting(false);
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      if (/[\uac00-\ud7af]/.test(text)) {
        utterance.lang = 'ko-KR';
      } else {
        utterance.lang = 'en-US';
      }
      window.speechSynthesis.speak(utterance);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Loading study set...</p>
      </div>
    );
  }

  if (error || !studySet) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <Trash2 className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Study Set Not Found</h2>
        <p className="text-sm text-slate-500">{error || 'This study set may have been removed.'}</p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white font-semibold text-sm hover:bg-brand-700"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>
    );
  }

  const cardCount = studySet.cards?.length || 0;
  const selectedCardCount = Math.min(Math.max(studyCardCount || cardCount, 1), cardCount);
  const studyQuery = `?limit=${selectedCardCount}`;
  const canTakeQuiz = selectedCardCount >= 4;
  const canWrite = selectedCardCount >= 1;
  const quickCounts = [...new Set([5, 10, 20, cardCount])].filter((count) => count <= cardCount);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-6">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> All Sets
        </Link>

        <div className="flex items-center gap-2">
          <Link
            to={`/study-sets/${id}/edit`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-xl text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-sm transition-colors"
          >
            <Edit3 className="w-4 h-4 text-slate-500" />
            <span>Edit Set</span>
          </Link>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-xl text-rose-600 bg-white border border-slate-200 hover:bg-rose-50 hover:border-rose-200 shadow-sm transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Set Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm mb-8">
        <div className="flex items-center gap-2 text-xs font-semibold text-brand-600 uppercase tracking-wider mb-2">
          <Layers className="w-4 h-4" />
          <span>{cardCount} {cardCount === 1 ? 'card' : 'cards'} in this set</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
          {studySet.title}
        </h1>
        {studySet.description && (
          <p className="text-base text-slate-600 leading-relaxed max-w-2xl">
            {studySet.description}
          </p>
        )}
      </div>

      {cardCount > 0 && <section className="mb-8 border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold text-slate-900">Số từ cho lượt học</p>
            <p className="mt-1 text-sm text-slate-500">Chọn số thẻ muốn ôn trong lần này. Hệ thống lấy ngẫu nhiên từ set.</p>
          </div>
          <label className="text-sm font-semibold text-slate-700">
            <span className="sr-only">Số thẻ muốn học</span>
            <input
              type="number"
              min="1"
              max={cardCount}
              value={selectedCardCount}
              onChange={(event) => setStudyCardCount(Math.min(Math.max(Number(event.target.value) || 1, 1), cardCount))}
              className="w-24 rounded-lg border border-slate-300 px-3 py-2 text-center font-bold text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
              aria-label="Số thẻ muốn học"
            />
            <span className="ml-2 text-slate-500">/ {cardCount} thẻ</span>
          </label>
        </div>
        <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Chọn nhanh số thẻ">
          {quickCounts.map((count) => <button key={count} type="button" onClick={() => setStudyCardCount(count)} aria-pressed={selectedCardCount === count} className={`min-w-12 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${selectedCardCount === count ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-brand-300 hover:bg-brand-50'}`}>{count === cardCount ? 'Tất cả' : count}</button>)}
        </div>
      </section>}

      {/* Study Modes Selection Grid */}
      <div className="mb-10">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">
          Choose a Study Mode
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Mode 1: Flashcards */}
          <Link
            to={`/study-sets/${id}/flashcards${studyQuery}`}
            className="group relative bg-gradient-to-br from-white to-slate-50 rounded-2xl p-6 border-2 border-slate-200 hover:border-brand-500 shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-brand-600 group-hover:text-white transition-all duration-200 shadow-sm">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-brand-600 transition-colors mb-1.5">
                Flashcards
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Flip cards with 3D animation, keyboard controls, and pronunciation audio.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs font-bold text-brand-600">
              <span>Start Flashcards ({selectedCardCount}) →</span>
            </div>
          </Link>

          {/* Mode 2: Multiple Choice Quiz */}
          <Link
            to={canTakeQuiz ? `/study-sets/${id}/quiz${studyQuery}` : '#'}
            onClick={(e) => {
              if (!canTakeQuiz) {
                e.preventDefault();
                alert('Hãy chọn ít nhất 4 thẻ để học bằng Multiple Choice.');
              }
            }}
            className={`group relative bg-gradient-to-br from-white to-slate-50 rounded-2xl p-6 border-2 ${
              canTakeQuiz
                ? 'border-slate-200 hover:border-indigo-500 shadow-sm hover:shadow-lg cursor-pointer'
                : 'border-slate-200/60 opacity-70 cursor-not-allowed'
            } transition-all duration-200 flex flex-col justify-between`}
          >
            <div>
              <div
                className={`w-12 h-12 rounded-2xl ${
                  canTakeQuiz
                    ? 'bg-indigo-50 text-indigo-600 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white'
                    : 'bg-slate-100 text-slate-400'
                } flex items-center justify-center mb-4 transition-all duration-200 shadow-sm`}
              >
                <HelpCircle className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  Multiple Choice
                </h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Test your memory with 4-choice questions and instant feedback.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs font-bold text-indigo-600">
              <span>{canTakeQuiz ? `Start Quiz (${selectedCardCount}) →` : 'Chọn ít nhất 4 thẻ'}</span>
            </div>
          </Link>

          {/* Mode 3: Written Answer */}
          <Link
            to={canWrite ? `/study-sets/${id}/write${studyQuery}` : '#'}
            className={`group relative bg-gradient-to-br from-white to-slate-50 rounded-2xl p-6 border-2 ${
              canWrite
                ? 'border-slate-200 hover:border-emerald-500 shadow-sm hover:shadow-lg cursor-pointer'
                : 'border-slate-200/60 opacity-70 cursor-not-allowed'
            } transition-all duration-200 flex flex-col justify-between`}
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-200 shadow-sm">
                <PenTool className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-2 mb-1.5">
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                  Written Answer
                </h3>
                <span className="text-[9px] uppercase font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full">
                  Recall
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Type the vocabulary word from memory. Supports 3 attempts & Retry wrong words.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs font-bold text-emerald-600">
              <span>Start Written ({selectedCardCount}) →</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Vocabulary List Overview */}
      {readerContexts.length > 0 && (
        <div className="mb-10">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Xuất hiện trong bài đọc ({readerContexts.length})</h2>
          <div className="bg-white border border-slate-200 rounded-xl divide-y">
            {readerContexts.map((context) => (
              <Link key={`${context.flashcardId}-${context.annotationId}`} to={`/topik/reader/${context.passageId}?annotation=${context.annotationId}`} className="block p-4 hover:bg-slate-50">
                <p className="text-sm font-semibold text-brand-700">{context.title}</p>
                <p className="mt-1 text-sm text-slate-600 line-clamp-2">“…{context.context}”</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">
            Terms in this set ({cardCount})
          </h2>
          <Link
            to={`/study-sets/${id}/edit`}
            className="text-xs font-semibold text-brand-600 hover:underline"
          >
            + Add or edit terms
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-sm">
          {studySet.cards && studySet.cards.length > 0 ? (
            studySet.cards.map((card, idx) => (
              <div
                key={card.id || idx}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <span className="text-xs font-bold text-slate-400 font-mono w-6">
                    {idx + 1}
                  </span>
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-6">
                    <span className="text-base font-bold text-slate-900">{card.term}</span>
                    <span className="text-sm text-slate-600 font-medium">{card.meaning}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => speakText(card.term)}
                  title="Pronounce"
                  className="self-end sm:self-center p-2 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-400 text-sm">
              No cards in this set yet.{' '}
              <Link to={`/study-sets/${id}/edit`} className="text-brand-600 font-semibold underline">
                Add cards now
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={showDeleteModal}
        title="Delete this study set?"
        message={`Are you sure you want to delete "${studySet.title}"? This will permanently delete all ${cardCount} cards inside it.`}
        confirmText="Delete Set"
        isDangerous={true}
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
};
