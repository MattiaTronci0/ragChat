
import React from 'react';
import { useHistoryStore } from '../../stores/historyStore';
import { SearchIcon } from '../shared/Icons';

const HistorySearch: React.FC = () => {
  const { searchTerm, setSearchTerm } = useHistoryStore();

  return (
    <div className="relative w-full">
      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-300" />
      <input
        type="text"
        value={searchTerm}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
        placeholder="Cerca nella cronologia..."
        className="w-full p-2 pl-10 bg-white/95 dark:bg-gray-700/80 border border-gray-400 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-green-500 backdrop-blur-sm"
      />
    </div>
  );
};

export default HistorySearch;
