
import React from 'react';
import type { ChatHistory } from '../../types';
import { MessageSquareIcon, Trash2Icon } from '../shared/Icons';

interface HistoryItemProps {
  item: ChatHistory;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
}

const HistoryItem: React.FC<HistoryItemProps> = ({ item, onDelete, onView }) => {
  return (
    <div className="flex items-center justify-between p-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-slate-200 dark:border-slate-700 animate-[fadeIn_0.6s_ease-out_forwards] opacity-0">
      <div className="flex items-center gap-4 min-w-0">
        <MessageSquareIcon className="w-6 h-6 text-orange-500 flex-shrink-0" />
        <div className="min-w-0">
          <p className="font-semibold text-slate-800 dark:text-slate-100 truncate">{item.title}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {item.messages.length} messages - {item.timestamp.toLocaleDateString()}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button onClick={() => onView(item.id)} className="p-2 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors">
          View
        </button>
        <button onClick={() => onDelete(item.id)} className="p-2 text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 transition-colors">
          <Trash2Icon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default HistoryItem;
