import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHistoryStore } from '../../stores/historyStore';
import { useChatStore } from '../../stores/chatStore';
import { MessageSquareIcon, Trash2Icon, SearchIcon } from '../shared/Icons';
import ConfirmDialog from '../shared/ConfirmDialog';
import type { ChatHistory } from '../../types';

const SidebarHistory: React.FC = () => {
  const { history, deleteHistory, searchTerm, setSearchTerm, getFilteredHistory } = useHistoryStore();
  const { loadHistory } = useChatStore();
  const navigate = useNavigate();
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);

  const filteredHistory = getFilteredHistory().slice(0, 8); // Mostra solo le prime 8 conversazioni

  const handleView = (historyItem: ChatHistory) => {
    loadHistory(historyItem.messages);
    navigate('/');
  };

  const handleDelete = (id: string) => {
    setItemToDelete(id);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      deleteHistory(itemToDelete);
      setItemToDelete(null);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header con ricerca */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700">Cronologia Recente</h3>
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <SearchIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Campo di ricerca */}
      {showSearch && (
        <div className="mb-4">
          <input
            type="text"
            placeholder="Cerca conversazioni..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 text-xs bg-white/80 border border-gray-300 rounded-lg focus:ring-1 focus:ring-green-500 focus:border-green-500"
          />
        </div>
      )}

      {/* Lista cronologia */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {filteredHistory.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-xs">Nessuna conversazione</p>
          </div>
        ) : (
          filteredHistory.map((item) => (
            <div
              key={item.id}
              className="group p-3 bg-white/60 backdrop-blur-sm rounded-lg border border-gray-200 hover:bg-white/80 hover:border-gray-300 transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <MessageSquareIcon className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <button
                    onClick={() => handleView(item)}
                    className="w-full text-left"
                  >
                    <p className="text-xs font-medium text-gray-900 truncate hover:text-green-700 transition-colors">
                      {item.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {item.messages.length} messaggi • {item.timestamp.toLocaleDateString('it-IT', { 
                        day: '2-digit', 
                        month: '2-digit' 
                      })}
                    </p>
                  </button>
                </div>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all duration-200"
                >
                  <Trash2Icon className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Dialog di conferma eliminazione */}
      <ConfirmDialog
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={confirmDelete}
        title="Elimina Conversazione"
        message="Sei sicuro di voler eliminare questa conversazione? Questa azione non può essere annullata."
      />
    </div>
  );
};

export default SidebarHistory; 