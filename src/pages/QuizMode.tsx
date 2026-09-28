import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { studySetService } from '../services/studySetService';
import type { StudySet, Flashcard, QuizQuestion, QuizAnswerRecord } from '../types';
import { QuizOption } from '../components/QuizOption';
import { ProgressBar } from '../components/ProgressBar';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  RotateCcw,
  BookOpen,
  Award,
  AlertTriangle,
  Loader2,
  ChevronRight
} from 'lucide-react';

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Generate 4 distinct options (1 correct + 3 distractors from the study set)
function generateQuestions(cards: Flashcard[]): QuizQuestion[] {
  if (cards.length < 4) return [];

  const shuffledCards = shuffleArray(cards);

  return shuffledCards.map((currentCard) => {
    const correctMeaning = currentCard.meaning;

    // Get candidate distractors from all other cards with different meanings
    const distractorCandidates = Array.from(
      new Set(
        cards
          .filter((c) => c.id !== currentCard.id && c.meaning.trim() !== correctMeaning.trim())
          .map((c) => c.meaning.trim())
      )
    );

    // Shuffle distractors and pick 3
    const shuffledDistractors = shuffleArray(distractorCandidates).slice(0, 3);

    // Combine 1 correct + 3 distractors
    const rawOptions = [correctMeaning, ...shuffledDistractors];

    // Shuffle the 4 options so the correct answer is randomly at A, B, C, or D
    const options = shuffleArray(rawOptions);
    const correctIndex = options.indexOf(correctMeaning);

    return {
      cardId: currentCard.id,
      term: currentCard.term,
      correctMeaning,
      options,
      correctIndex,
    };
  });
}

export const QuizMode: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isDemo } = useAuth();

  const [studySet, setStudySet] = useState<StudySet | null>(null);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // State for current question answer
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  // History / Results
  const [records, setRecords] = useState<QuizAnswerRecord[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initQuiz = (cardsList: Flashcard[]) => {
    if (cardsList.length < 4) {
      setError('Study Set needs at least 4 cards for Multiple Choice mode.');
      return;
    }
    const generated = generateQuestions(cardsList);
    setQuestions(generated);
    setCurrentIndex(0);
    setSelectedIndex(null);
    setIsAnswered(false);
    setRecords([]);
    setIsFinished(false);
    setError(null);
  };

  useEffect(() => {
    if (!id) return;
    const loadSet = async () => {
      try {
        setLoading(true);
        const data = await studySetService.getStudySetById(id, isDemo);
        if (!data || !data.cards || data.cards.length === 0) {
          setError('No cards found in this study set.');
          return;
        }
        setStudySet(data);
        setCards(data.cards);
        initQuiz(data.cards);
      } catch (err: any) {
        setError(err?.message || 'Failed to load study set.');
      } finally {
        setLoading(false);
      }
    };
    loadSet();
  }, [id, isDemo]);

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;

    setSelectedIndex(idx);
    setIsAnswered(true);

    const currentQ = questions[currentIndex];
    const isCorrect = idx === currentQ.correctIndex;

    setRecords((prev) => [
      ...prev,
      {
        question: currentQ,
        selectedIndex: idx,
        isCorrect,
      },
    ]);
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedIndex(null);
      setIsAnswered(false);
    } else {
      // Quiz complete!
      setIsFinished(true);
      // Trigger confetti if scored well
      const correctTotal = records.filter((r) => r.isCorrect).length;
      if (correctTotal / questions.length >= 0.7) {
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {
          // ignore if canvas not supported
        }
      }
    }
  };

  const handleRestart = () => {
    if (cards.length >= 4) {
      initQuiz(cards);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Generating quiz questions...</p>
      </div>
    );
  }

  // Handle graceful case when < 4 cards
  if (error || questions.length < 4) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4 shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">
          Cannot start Multiple Choice
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          {error || 'Study Set needs at least 4 cards for Multiple Choice mode.'}
        </p>
        <div className="pt-2 flex flex-col gap-2">
          <Link
            to={`/study-sets/${id}/flashcards`}
            className="w-full py-2.5 px-4 rounded-xl bg-brand-600 text-white font-semibold text-sm hover:bg-brand-700 transition-colors"
          >
            Study with Flashcards instead
          </Link>
          <Link
            to={`/study-sets/${id}/edit`}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-100 text-slate-700 font-semibold text-sm hover:bg-slate-200 transition-colors"
          >
            Add more cards (+ Add Card)
          </Link>
        </div>
      </div>
    );
  }

  // ==========================================
  // MÀN HÌNH KẾT QUẢ (Quiz Result Screen)
  // ==========================================
  if (isFinished) {
    const total = questions.length;
    const correctCount = records.filter((r) => r.isCorrect).length;
    const incorrectCount = total - correctCount;
    const accuracy = Math.round((correctCount / total) * 100);

    const missedRecords = records.filter((r) => !r.isCorrect);

    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 animate-fadeIn">
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/90 shadow-xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white flex items-center justify-center mx-auto mb-5 shadow-lg shadow-brand-500/25">
            <Award className="w-8 h-8" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            Quiz Complete!
          </h1>
          <p className="text-sm text-slate-500 mb-8">
            Great work! Here is your score for <span className="font-semibold text-slate-800">{studySet?.title}</span>
          </p>

          {/* Score Circle & Stats */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-50 to-slate-100/70 border border-slate-200/80 mb-8">
            <div className="text-5xl sm:text-6xl font-black text-brand-600 tracking-tight font-mono mb-2">
              {accuracy}%
            </div>
            <div className="text-sm font-semibold text-slate-600 mb-6">
              Score: {correctCount} / {total}
            </div>

            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
              <div className="p-3.5 bg-white rounded-xl border border-slate-200 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="text-xs text-slate-400 font-semibold">Correct</div>
                  <div className="text-lg font-bold text-slate-900 font-mono">{correctCount}</div>
                </div>
              </div>

              <div className="p-3.5 bg-white rounded-xl border border-slate-200 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-rose-100 text-rose-700">
                  <XCircle className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="text-xs text-slate-400 font-semibold">Incorrect</div>
                  <div className="text-lg font-bold text-slate-900 font-mono">{incorrectCount}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Review Incorrect Items if any */}
          {missedRecords.length > 0 && (
            <div className="text-left mb-8">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">
                Review Missed Cards ({missedRecords.length})
              </h3>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                {missedRecords.map((item, idx) => (
                  <div key={idx} className="p-3.5 sm:p-4 bg-white text-xs sm:text-sm">
                    <div className="font-bold text-slate-900 mb-1">{item.question.term}</div>
                    <div className="flex items-center gap-2">
                      <span className="text-rose-600 line-through">
                        {item.question.options[item.selectedIndex]}
                      </span>
                      <span className="text-slate-400">&rarr;</span>
                      <span className="text-emerald-700 font-semibold">
                        {item.question.correctMeaning}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleRestart}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-md shadow-brand-500/20 transition-all active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Try Again</span>
            </button>

            <Link
              to={`/study-sets/${id}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-all"
            >
              <BookOpen className="w-4 h-4" />
              <span>Back to Study Set</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // MÀN HÌNH CÂU HỎI TRẮC NGHIỆM (Active Question)
  // ==========================================
  const currentQuestion = questions[currentIndex];
  const isSelectedCorrect = selectedIndex === currentQuestion.correctIndex;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <Link
          to={`/study-sets/${id}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Exit Quiz
        </Link>
        <div className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
          Question {currentIndex + 1} of {questions.length}
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <ProgressBar current={currentIndex + 1} total={questions.length} />
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-lg mb-6 text-center">
        <p className="text-xs font-bold uppercase tracking-wider text-brand-600 mb-2">
          What does this word mean?
        </p>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight py-4">
          {currentQuestion.term}
        </h2>
      </div>

      {/* 4 Choices */}
      <div className="space-y-3 mb-6">
        {currentQuestion.options.map((optionText, idx) => (
          <QuizOption
            key={idx}
            index={idx}
            text={optionText}
            isAnswered={isAnswered}
            isSelected={selectedIndex === idx}
            isCorrectOption={idx === currentQuestion.correctIndex}
            onSelect={() => handleSelectOption(idx)}
          />
        ))}
      </div>

      {/* Feedback Banner & Next Button after answering */}
      {isAnswered && (
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-md animate-fadeIn flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {isSelectedCorrect ? (
              <div className="p-2 rounded-full bg-emerald-100 text-emerald-700">
                <CheckCircle className="w-6 h-6" />
              </div>
            ) : (
              <div className="p-2 rounded-full bg-rose-100 text-rose-700">
                <XCircle className="w-6 h-6" />
              </div>
            )}
            <div className="text-left">
              <div
                className={`font-bold text-sm ${
                  isSelectedCorrect ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                {isSelectedCorrect ? '✓ Correct! Well done.' : '✗ Incorrect'}
              </div>
              {!isSelectedCorrect && (
                <div className="text-xs text-slate-500 mt-0.5">
                  Correct answer: <span className="font-semibold text-slate-900">{currentQuestion.correctMeaning}</span>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleNextQuestion}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-md shadow-brand-500/20 transition-all active:scale-95"
          >
            <span>{currentIndex < questions.length - 1 ? 'Next Question' : 'View Results'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
