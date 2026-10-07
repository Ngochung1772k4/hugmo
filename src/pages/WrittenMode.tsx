import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { studySetService } from '../services/studySetService';
import type {
  StudySet,
  Flashcard,
  WriteDirection,
  QuestionStatus,
  WriteAttemptRecord,
} from '../types';
import { checkAnswer } from '../utils/answerValidation';
import { WrittenPreStudy } from '../components/written/WrittenPreStudy';
import { WrittenQuestion } from '../components/written/WrittenQuestion';
import { WrittenInput } from '../components/written/WrittenInput';
import { WrittenFeedback } from '../components/written/WrittenFeedback';
import { WrittenResult } from '../components/written/WrittenResult';
import { ProgressBar } from '../components/ProgressBar';
import { getStudyCardLimit, selectStudyCards } from '../utils/studySelection';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export const WrittenMode: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { search } = useLocation();
  const { isDemo } = useAuth();

  const [studySet, setStudySet] = useState<StudySet | null>(null);
  const [allCards, setAllCards] = useState<Flashcard[]>([]);
  const [activeCards, setActiveCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Mode settings & phase
  const [phase, setPhase] = useState<'pre_study' | 'learning' | 'result'>('pre_study');
  const [direction, setDirection] = useState<WriteDirection>('meaning_to_term');
  const [roundNumber, setRoundNumber] = useState(1);

  // Question state
  const [userInput, setUserInput] = useState('');
  const [status, setStatus] = useState<QuestionStatus>('idle');
  const [currentAttempts, setCurrentAttempts] = useState<string[]>([]);
  const [isShaking, setIsShaking] = useState(false);

  // History & Results
  const [roundRecords, setRoundRecords] = useState<WriteAttemptRecord[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load study set data
  useEffect(() => {
    if (!id) return;
    const loadSet = async () => {
      try {
        setLoading(true);
        const data = await studySetService.getStudySetById(id, isDemo);
        if (!data || !data.cards || data.cards.length === 0) {
          setError('No vocabulary cards found in this study set.');
          return;
        }
        const selectedCards = selectStudyCards(data.cards, getStudyCardLimit(search, data.cards.length));
        setStudySet(data);
        setAllCards(selectedCards);
        setActiveCards(selectedCards);
      } catch (err: any) {
        setError(err?.message || 'Failed to load study set.');
      } finally {
        setLoading(false);
      }
    };
    loadSet();
  }, [id, isDemo, search]);

  // Current Card targets
  const currentCard = activeCards[currentIndex];
  const promptText = currentCard
    ? direction === 'meaning_to_term'
      ? currentCard.meaning
      : currentCard.term
    : '';
  const targetAnswer = currentCard
    ? direction === 'meaning_to_term'
      ? currentCard.term
      : currentCard.meaning
    : '';

  // Start learning from Pre-study
  const handleStart = () => {
    const shuffled = shuffle(allCards);
    setActiveCards(shuffled);
    setCurrentIndex(0);
    setUserInput('');
    setStatus('idle');
    setCurrentAttempts([]);
    setRoundRecords([]);
    setRoundNumber(1);
    setPhase('learning');
  };

  // Submit Answer Check
  const handleCheck = useCallback(() => {
    if (!userInput.trim() || !currentCard || status === 'correct' || status === 'revealed_failed') {
      return;
    }

    const validation = checkAnswer(userInput, targetAnswer);
    const updatedAttempts = [...currentAttempts, userInput];
    setCurrentAttempts(updatedAttempts);
    const attemptsCount = updatedAttempts.length;

    if (validation.isCorrect) {
      setStatus('correct');
      setRoundRecords((prev) => [
        ...prev,
        {
          card: currentCard,
          userAnswers: updatedAttempts,
          isPassed: true,
          attemptsCount,
        },
      ]);
    } else {
      // Trigger shake animation
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 350);

      if (attemptsCount < 3) {
        setStatus('incorrect_retry');
      } else {
        // Third failure -> reveal answer
        setStatus('revealed_failed');
        setRoundRecords((prev) => [
          ...prev,
          {
            card: currentCard,
            userAnswers: updatedAttempts,
            isPassed: false,
            attemptsCount: 3,
          },
        ]);
      }
    }
  }, [userInput, currentCard, targetAnswer, status, currentAttempts]);

  // User voluntarily reveals answer (Give up)
  const handleReveal = () => {
    if (!currentCard || status === 'correct' || status === 'revealed_failed') return;
    const updatedAttempts = [...currentAttempts, userInput || '(Revealed)'];
    setCurrentAttempts(updatedAttempts);
    setStatus('revealed_failed');
    setRoundRecords((prev) => [
      ...prev,
      {
        card: currentCard,
        userAnswers: updatedAttempts,
        isPassed: false,
        attemptsCount: Math.max(1, updatedAttempts.length),
      },
    ]);
  };

  // Move to next question or complete round
  const handleNext = useCallback(() => {
    if (currentIndex < activeCards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setUserInput('');
      setStatus('idle');
      setCurrentAttempts([]);
    } else {
      // End of round
      setPhase('result');
    }
  }, [currentIndex, activeCards.length]);

  // Handle Retry Wrong Answers (Loop)
  const handleRetryWrong = () => {
    const failedCards = roundRecords.filter((r) => !r.isPassed).map((r) => r.card);
    if (failedCards.length === 0) return;

    setActiveCards(shuffle(failedCards));
    setCurrentIndex(0);
    setUserInput('');
    setStatus('idle');
    setCurrentAttempts([]);
    setRoundRecords([]);
    setRoundNumber((prev) => prev + 1);
    setPhase('learning');
  };

  // Handle Study Again (All Cards)
  const handleStudyAgain = () => {
    setActiveCards(shuffle(allCards));
    setCurrentIndex(0);
    setUserInput('');
    setStatus('idle');
    setCurrentAttempts([]);
    setRoundRecords([]);
    setRoundNumber(1);
    setPhase('learning');
  };

  // Global Enter Key Handler when appropriate
  const handleInputSubmit = () => {
    if (status === 'idle' || status === 'incorrect_retry') {
      handleCheck();
    } else if (status === 'correct' || status === 'revealed_failed') {
      handleNext();
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Loading study set...</p>
      </div>
    );
  }

  if (error || allCards.length === 0) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Cannot start Written Mode</h2>
        <p className="text-sm text-slate-500">{error || 'This set has no vocabulary cards.'}</p>
        <Link
          to={`/study-sets/${id}`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white font-semibold text-sm hover:bg-brand-700"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Study Set
        </Link>
      </div>
    );
  }

  // ==========================================
  // PHASE 1: PRE-STUDY CONFIGURATION
  // ==========================================
  if (phase === 'pre_study') {
    return (
      <WrittenPreStudy
        studySetTitle={studySet?.title || ''}
        cardCount={allCards.length}
        direction={direction}
        onDirectionChange={setDirection}
        onStart={handleStart}
      />
    );
  }

  // ==========================================
  // PHASE 3: RESULT SCREEN
  // ==========================================
  if (phase === 'result') {
    return (
      <WrittenResult
        studySetId={id!}
        records={roundRecords}
        roundNumber={roundNumber}
        direction={direction}
        onRetryWrong={handleRetryWrong}
        onStudyAgain={handleStudyAgain}
      />
    );
  }

  // ==========================================
  // PHASE 2: ACTIVE QUESTION SCREEN
  // ==========================================
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 animate-fadeIn">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <Link
          to={`/study-sets/${id}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Exit
        </Link>

        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Written Answer {roundNumber > 1 ? `(Round ${roundNumber})` : ''}
          </span>
          <div className="text-xs text-brand-600 font-semibold">
            {direction === 'meaning_to_term' ? 'Meaning → Term' : 'Term → Meaning'}
          </div>
        </div>

        <div className="text-xs font-mono font-bold px-3 py-1 bg-slate-100 rounded-full text-slate-600">
          {currentIndex + 1} / {activeCards.length}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <ProgressBar current={currentIndex + 1} total={activeCards.length} showFraction={false} />
      </div>

      {/* Question Prompt Card */}
      <WrittenQuestion promptText={promptText} direction={direction} />

      {/* Answer Input */}
      <div className="mb-2">
        <WrittenInput
          value={userInput}
          onChange={setUserInput}
          onSubmit={handleInputSubmit}
          status={status}
          isShaking={isShaking}
          placeholder={
            direction === 'meaning_to_term'
              ? 'Type the exact vocabulary word...'
              : 'Type the meaning...'
          }
        />
      </div>

      {/* Feedback & Actions */}
      <WrittenFeedback
        status={status}
        attemptsCount={currentAttempts.length}
        targetAnswer={targetAnswer}
        onCheck={handleCheck}
        onNext={handleNext}
        onReveal={handleReveal}
        hasInput={Boolean(userInput.trim())}
      />
    </div>
  );
};
