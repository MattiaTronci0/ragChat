
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
       <header className="flex-shrink-0 animate-fade-in">
        <div className="flex items-center gap-3">
          <HistoryIcon className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          <h1 className="text-3xl font-bold font-professional bg-gradient-to-r from-amber-800 to-amber-600 dark:from-amber-200 dark:to-amber-400 bg-clip-text text-transparent">
            Cronologia Conversazioni
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-300 mt-1 font-classical">Rivedi e gestisci le tue conversazioni precedenti.</p>
      </header>

      <div className="my-6 flex flex-col md:flex-row items-center justify-between gap-4 animate-slide-up [animation-delay:100ms]">
        <div className="w-full md:w-auto md:flex-grow md:max-w-xs">
          <HistorySearch />
        </div>
        <div className="flex items-center gap-2">
          <ExportButton />
          {filteredHistory.length > 0 && (
            <button
                onClick={() => setIsConfirmOpen(true)}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                title="Cancella tutta la cronologia"
            >
                <Trash2Icon className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

              <div className="flex-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-y-auto p-6 animate-fade-in [animation-delay:200ms]">
        <HistoryList history={filteredHistory} onDelete={deleteHistory} />
      </div>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleClearAll}
        title="Cancella Tutta la Cronologia"
        message="Sei sicuro di voler eliminare l'intera cronologia delle conversazioni? Questa azione è permanente e non può essere annullata."
      />
    </div>
  );
};

export default HistoryContainer;
