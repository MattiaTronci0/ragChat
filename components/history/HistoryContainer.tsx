
import React, { useState } from 'react';
import { useHistoryStore } from '../../stores/historyStore';
import HistoryList from './HistoryList';
import HistorySearch from './HistorySearch';
import ExportButton from './ExportButton';
import { HistoryIcon, Trash2Icon } from '../shared/Icons';
import ConfirmDialog from '../shared/ConfirmDialog';

const HistoryContainer: React.FC = () => {
  const { deleteHistory, clearHistory, getFilteredHistory } = useHistoryStore();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const filteredHistory = getFilteredHistory();

  const handleClearAll = () => {
    clearHistory();
    setIsConfirmOpen(false);
  }

  return (
    <div className="flex flex-col h-full overflow-hidden p-4 md:p-6">
       <header className="flex-shrink-0 animate-[fadeIn_0.6s_ease-out]">
        <div className="flex items-center gap-3">
          <HistoryIcon className="w-8 h-8 text-orange-500" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
            Conversation History
          </h1>
        </div>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Review and manage your past conversations.</p>
      </header>

      <div className="my-6 flex flex-col md:flex-row items-center justify-between gap-4 animate-[slideUp_0.6s_ease-out] [animation-delay:100ms] opacity-0">
        <div className="w-full md:w-auto md:flex-grow md:max-w-xs">
          <HistorySearch />
        </div>
        <div className="flex items-center gap-2">
          <ExportButton />
          {filteredHistory.length > 0 && (
            <button
                onClick={() => setIsConfirmOpen(true)}
                className="p-2 text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                title="Clear all history"
            >
                <Trash2Icon className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-y-auto p-6 animate-[fadeIn_0.6s_ease-out] [animation-delay:200ms]">
        <HistoryList history={filteredHistory} onDelete={deleteHistory} />
      </div>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleClearAll}
        title="Clear All History"
        message="Are you sure you want to delete your entire conversation history? This action is permanent and cannot be undone."
      />
    </div>
  );
};

export default HistoryContainer;
