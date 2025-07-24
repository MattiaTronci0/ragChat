
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
    <div className="flex items-center justify-between p-4 bg-white/95 backdrop-blur-lg rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-200 animate-[fadeIn_0.6s_ease-out_forwards] opacity-0">
      <div className="flex items-center gap-4 min-w-0">
        <MessageSquareIcon className="w-6 h-6 text-amber-500 flex-shrink-0" />
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 truncate">{item.title}</p>
                      <p className="text-xs text-gray-600">
              {item.messages.length} messaggi - {item.timestamp.toLocaleDateString()}
            </p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button onClick={() => onView(item.id)} className="p-2 text-gray-600 hover:text-green-600 transition-colors">
          Visualizza
        </button>
        <button onClick={() => onDelete(item.id)} className="p-2 text-gray-600 hover:text-red-500 transition-colors">
          <Trash2Icon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default HistoryItem;
