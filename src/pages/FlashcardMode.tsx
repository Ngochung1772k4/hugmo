import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { studySetService } from '../services/studySetService';
import type { Flashcard as FlashcardType, StudySet } from '../types';
import { Flashcard } from '../components/Flashcard';
import { ProgressBar } from '../components/ProgressBar';
import { getStudyCardLimit, selectStudyCards } from '../utils/studySelection';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  RotateCcw,
  Loader2,
  AlertCircle
} from 'lucide-react';

export const FlashcardMode: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { search } = useLocation();
  const { isDemo } = useAuth();

  const [studySet, setStudySet] = useState<StudySet | null>(null);
  const [cards, setCards] = useState<FlashcardType[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const loadCards = async () => {
      try {
        setLoading(true);
        const data = await studySetService.getStudySetById(id, isDemo);
        if (!data || !data.cards || data.cards.length === 0) {
          setError('No flashcards found in this study set.');
          return;
        }
        setStudySet(data);
        setCards(selectStudyCards(data.cards, getStudyCardLimit(search, data.cards.length)));
        setCurrentIndex(0);
        setIsFlipped(false);
      } catch (err: any) {
        setError(err?.message || 'Failed to load flashcards.');
      } finally {
        setLoading(false);
      }
    };
    loadCards();
  }, [id, isDemo, search]);

  const handleNext = useCallback(() => {
    if (cards.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev < cards.length - 1 ? prev + 1 : 0));
  }, [cards.length]);

  const handlePrev = useCallback(() => {
    if (cards.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : cards.length - 1));
  }, [cards.length]);

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const handleShuffle = () => {
    setIsFlipped(false);
    setCards((prev) => [...prev].sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
  };

  const handleRestart = () => {
    setIsFlipped(false);
    setCurrentIndex(0);
  };

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlip, handleNext, handlePrev]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Loading cards...</p>
      </div>
    );
  }

  if (error || cards.length === 0) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Cannot study with Flashcards</h2>
        <p className="text-sm text-slate-500">{error || 'This set has no cards.'}</p>
        <Link
          to={`/study-sets/${id}`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white font-semibold text-sm hover:bg-brand-700"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Study Set
        </Link>
      </div>
    );
  }

  const currentCard = cards[currentIndex];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <Link
          to={`/study-sets/${id}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Set
        </Link>

        <div className="text-center">
          <h1 className="text-base font-bold text-slate-900 line-clamp-1">
            {studySet?.title}
          </h1>
          <span className="text-xs text-slate-400">Flashcard Mode · {cards.length} thẻ</span>
        </div>

        {/* Quick actions (Shuffle, Restart) */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleShuffle}
            title="Shuffle cards"
            className="p-2 rounded-xl text-slate-500 hover:text-brand-600 hover:bg-slate-100 transition-colors"
          >
            <Shuffle className="w-4 h-4" />
          </button>
          <button
            onClick={handleRestart}
            title="Restart from beginning"
            className="p-2 rounded-xl text-slate-500 hover:text-brand-600 hover:bg-slate-100 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8 max-w-2xl mx-auto">
        <ProgressBar current={currentIndex + 1} total={cards.length} />
      </div>

      {/* 3D Flashcard Display */}
      <div className="mb-8">
        <Flashcard
          term={currentCard.term}
          meaning={currentCard.meaning}
          isFlipped={isFlipped}
          onFlip={handleFlip}
        />
      </div>

      {/* Controls: Previous / Counter / Next */}
      <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
        <button
          onClick={handlePrev}
          className="flex-1 py-3.5 px-5 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2 active:scale-95"
        >
          <ChevronLeft className="w-5 h-5 text-slate-400" />
          <span>Previous</span>
        </button>

        {/* Current / Total Indicator */}
        <div className="px-6 py-3 bg-slate-100/90 rounded-2xl font-mono text-sm font-bold text-slate-700 select-none">
          {currentIndex + 1} / {cards.length}
        </div>

        <button
          onClick={handleNext}
          className="flex-1 py-3.5 px-5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-2 active:scale-95"
        >
          <span>Next</span>
          <ChevronRight className="w-5 h-5 text-white/80" />
        </button>
      </div>

      {/* Keyboard Hint Footer */}
      <div className="mt-8 text-center text-xs text-slate-400 flex items-center justify-center gap-4 flex-wrap">
        <span><kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded font-mono text-slate-600">Space</kbd> Flip</span>
        <span><kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded font-mono text-slate-600">&larr;</kbd> Previous</span>
        <span><kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded font-mono text-slate-600">&rarr;</kbd> Next</span>
      </div>
    </div>
  );
};
