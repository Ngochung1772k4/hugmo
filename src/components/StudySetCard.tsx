import React from 'react';
import { Link } from 'react-router-dom';
import type { StudySet } from '../types';
import { Layers, Edit3, Trash2, Clock, Play } from 'lucide-react';

interface StudySetCardProps {
  set: StudySet;
  onDelete: (id: string, title: string) => void;
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
  return date.toLocaleDateString();
}

export const StudySetCard: React.FC<StudySetCardProps> = ({ set, onDelete }) => {
  return (
    <div className="group bg-white rounded-2xl border border-slate-200/90 hover:border-brand-300 shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col overflow-hidden">
      {/* Top Content */}
      <div className="p-6 flex-1">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-100">
            <Layers className="w-3.5 h-3.5" />
            {set.card_count ?? 0} {set.card_count === 1 ? 'card' : 'cards'}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            {formatTimeAgo(set.updated_at || set.created_at)}
          </span>
        </div>

        <Link to={`/study-sets/${set.id}`} className="block group-hover:text-brand-600 transition-colors">
          <h3 className="text-xl font-bold text-slate-900 line-clamp-1 mb-2">
            {set.title}
          </h3>
        </Link>

        {set.description ? (
          <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
            {set.description}
          </p>
        ) : (
          <p className="text-sm text-slate-400 italic">No description provided</p>
        )}
      </div>

      {/* Bottom Action Footer */}
      <div className="px-6 py-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
        <Link
          to={`/study-sets/${set.id}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors"
        >
          <Play className="w-4 h-4 fill-brand-600" />
          Study Set
        </Link>

        <div className="flex items-center gap-1">
          <Link
            to={`/study-sets/${set.id}/edit`}
            title="Edit Study Set"
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <Edit3 className="w-4 h-4" />
          </Link>

          <button
            onClick={() => onDelete(set.id, set.title)}
            title="Delete Study Set"
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
