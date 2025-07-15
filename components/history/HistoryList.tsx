
import React, { useState } from 'react';
import type { ChatHistory } from '../../types';
import HistoryItem from './HistoryItem';
import ConfirmDialog from '../shared/ConfirmDialog';

interface HistoryListProps {
  history: ChatHistory[];
  onDelete: (id: string) => void;
}

const HistoryList: React.FC<HistoryListProps> = ({ history, onDelete }) => {
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const handleView = (id: string) => {
    // In a real app, this would navigate to the chat page with the loaded history
    alert(`Viewing history item ${id} is not implemented in this mock.`);
  };

  if (history.length === 0) {
    return (
      <div className="text-center py-16 text-slate-500 dark:text-slate-400 animate-[fadeIn_0.6s_ease-out]">
        <h3 className="text-xl font-semibold">No History Found</h3>
        <p>Your past conversations will appear here.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {history.map((item, i) => (
           <div key={item.id} style={{ animationDelay: `${i * 50}ms` }}>
            <HistoryItem
              item={item}
              onDelete={() => setItemToDelete(item.id)}
              onView={handleView}
            />
          </div>
        ))}
      </div>
      <ConfirmDialog
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={() => {
          if (itemToDelete) onDelete(itemToDelete);
        }}
        title="Delete History Item"
        message="Are you sure you want to delete this conversation from your history? This action cannot be undone."
      />
    </>
  );
};

export default HistoryList;
