import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { studySetService } from '../services/studySetService';
import type { FlashcardDraft } from '../types';
import { VocabularyRow } from '../components/VocabularyRow';
import { QuickAddModal } from '../components/QuickAddModal';
import { Plus, Sparkles, Save, ArrowLeft, AlertCircle } from 'lucide-react';

export const CreateStudySet: React.FC = () => {
  const { user, isDemo } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [cards, setCards] = useState<FlashcardDraft[]>([
    { term: '', meaning: '' },
    { term: '', meaning: '' },
    { term: '', meaning: '' },
    { term: '', meaning: '' },
  ]);

  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCardChange = (index: number, field: 'term' | 'meaning', value: string) => {
    setCards((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleAddCard = () => {
    setCards((prev) => [...prev, { term: '', meaning: '' }]);
  };

  const handleDeleteCard = (index: number) => {
    setCards((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleImportCards = (imported: FlashcardDraft[], replace: boolean) => {
    if (replace) {
      setCards(imported);
    } else {
      // Filter out empty rows and append
      const nonEmpty = cards.filter((c) => c.term.trim() || c.meaning.trim());
      setCards([...nonEmpty, ...imported]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!title.trim()) {
      setError('Please provide a title for this study set.');
      return;
    }

    const validCards = cards.filter((c) => c.term.trim() && c.meaning.trim());
    if (validCards.length === 0) {
      setError('Please add at least one vocabulary card with both Term and Meaning.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const newSet = await studySetService.createStudySet(
        user.id,
        title,
        description,
        validCards,
        isDemo
      );
      navigate(`/study-sets/${newSet.id}`);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to create study set. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Top Breadcrumb & Action */}
      <div className="flex items-center justify-between mb-6">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Header Title & Description Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Create a new study set
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Enter your title, description, and list of vocabulary words
              </p>
            </div>

            {/* Quick Add Button */}
            <button
              type="button"
              onClick={() => setIsQuickAddOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 font-semibold text-sm border border-brand-200 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-brand-600" />
              <span>Quick Paste (Batch Add)</span>
            </button>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-700 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. TOPIK 3 - Unit 1 (Xã hội) or Oxford 3000"
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-semibold text-lg transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Description (Optional)
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description to help you remember what this set is about..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-sm transition-all"
              />
            </div>
          </div>
        </div>

        {/* Cards Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-lg font-bold text-slate-800">
              Vocabulary Cards ({cards.length})
            </h2>
            <button
              type="button"
              onClick={() => setIsQuickAddOpen(true)}
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 hover:underline"
            >
              Paste multiple words
            </button>
          </div>

          <div className="space-y-4">
            {cards.map((card, index) => (
              <VocabularyRow
                key={index}
                index={index}
                card={card}
                onChange={handleCardChange}
                onDelete={handleDeleteCard}
                canDelete={cards.length > 1}
              />
            ))}
          </div>

          {/* Add Row Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleAddCard}
              className="w-full py-4 rounded-2xl border-2 border-dashed border-slate-300 hover:border-brand-500 hover:bg-brand-50/40 text-slate-600 hover:text-brand-700 font-semibold text-sm transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Card</span>
            </button>
          </div>
        </div>

        {/* Floating Bottom Sticky Bar */}
        <div className="sticky bottom-6 z-20 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-xl flex items-center justify-between gap-4">
          <div className="text-sm font-medium text-slate-500">
            {cards.filter((c) => c.term.trim() && c.meaning.trim()).length} valid cards ready
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-md shadow-brand-500/25 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save All'}
            </button>
          </div>
        </div>
      </form>

      {/* Quick Add Batch Modal */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onImport={handleImportCards}
      />
    </div>
  );
};
