import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { studySetService } from '../services/studySetService';
import type { StudySet } from '../types';
import { StudySetCard } from '../components/StudySetCard';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Plus, Search, BookOpen, AlertCircle, Languages, PenLine } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user, isDemo } = useAuth();
  const [studySets, setStudySets] = useState<StudySet[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Deletion modal state
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchSets = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const sets = await studySetService.getStudySets(user.id, isDemo);
      setStudySets(sets);
    } catch (err: any) {
      console.error(err);
      setError('Could not load your study sets. Please check your connection or database schema.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSets();
  }, [user, isDemo]);

  // Search filter
  const filteredSets = useMemo(() => {
    if (!searchQuery.trim()) return studySets;
    const q = searchQuery.toLowerCase();
    return studySets.filter((s) => s.title.toLowerCase().includes(q));
  }, [studySets, searchQuery]);

  // Handle Delete Confirmation
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await studySetService.deleteStudySet(deleteTarget.id, isDemo);
      setStudySets((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err: any) {
      alert('Failed to delete study set: ' + (err?.message || 'Unknown error'));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 animate-fadeIn">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Study Sets
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Organize your vocabulary, study with flashcards, and test your memory
          </p>
        </div>

        <Link
          to="/study-sets/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-md shadow-brand-500/20 hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Create Study Set</span>
        </Link>
      </div>

      <Link
        to="/topik/reading/1-4"
        className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-indigo-200 bg-white px-5 py-4 shadow-sm hover:border-brand-400 hover:shadow-md transition-all"
      >
        <div className="flex items-center gap-4">
          <span className="h-11 w-11 shrink-0 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
            <Languages className="w-5 h-5" />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-700">TOPIK II · Reading</p>
            <h2 className="mt-0.5 text-lg font-bold text-slate-900">Luyện câu 1-4</h2>
            <p className="mt-1 text-sm text-slate-500">Ngữ pháp, cấu trúc gần nghĩa, Sprint và ôn câu sai.</p>
          </div>
        </div>
        <span className="text-sm font-semibold text-brand-700">Mở TOPIK →</span>
      </Link>

      <Link
        to="/topik/writing/54"
        className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-emerald-200 bg-white px-5 py-4 shadow-sm hover:border-emerald-400 hover:shadow-md transition-all"
      >
        <div className="flex items-center gap-4">
          <span className="h-11 w-11 shrink-0 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <PenLine className="w-5 h-5" />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">TOPIK II · Writing</p>
            <h2 className="mt-0.5 text-lg font-bold text-slate-900">Luyện câu 54</h2>
            <p className="mt-1 text-sm text-slate-500">Phân tích đề, idea, collocation và luyện viết câu theo từng gợi ý.</p>
          </div>
        </div>
        <span className="text-sm font-semibold text-emerald-700">Mở Writing →</span>
      </Link>

      {/* Search & Filter Bar */}
      <div className="relative mb-8">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
          <Search className="w-5 h-5" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search study sets by title..."
          className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-sm shadow-sm transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-xs text-slate-400 hover:text-slate-600"
          >
            Clear
          </button>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="mb-8 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between text-rose-700 text-sm">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchSets}
            className="font-semibold underline hover:no-underline text-xs"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse space-y-4 shadow-sm"
            >
              <div className="flex justify-between items-center">
                <div className="h-5 w-20 bg-slate-200 rounded-full" />
                <div className="h-4 w-16 bg-slate-100 rounded" />
              </div>
              <div className="h-6 w-3/4 bg-slate-200 rounded-lg" />
              <div className="h-4 w-full bg-slate-100 rounded" />
              <div className="h-10 w-full bg-slate-100 rounded-xl pt-4" />
            </div>
          ))}
        </div>
      ) : filteredSets.length === 0 ? (
        /* Empty State */
        <div className="text-center py-16 px-4 bg-white rounded-3xl border border-dashed border-slate-300 shadow-sm max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">
            {searchQuery ? 'No matching study sets found' : 'No study sets yet'}
          </h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
            {searchQuery
              ? `We couldn't find any sets matching "${searchQuery}". Try a different search term.`
              : 'Create your first study set to start learning vocabulary with flashcards and quizzes.'}
          </p>
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="px-4 py-2 text-sm font-semibold text-brand-600 hover:bg-brand-50 rounded-lg"
            >
              Clear search
            </button>
          ) : (
            <Link
              to="/study-sets/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold shadow-md shadow-brand-500/20"
            >
              <Plus className="w-4 h-4" />
              Create your first set
            </Link>
          )}
        </div>
      ) : (
        /* Study Sets Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSets.map((set) => (
            <StudySetCard
              key={set.id}
              set={set}
              onDelete={(id, title) => setDeleteTarget({ id, title })}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete this study set?"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This will also permanently delete all vocabulary cards inside it.`}
        confirmText="Delete Set"
        cancelText="Cancel"
        isDangerous={true}
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
