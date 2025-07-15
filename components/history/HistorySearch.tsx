
import React from 'react';
import { useHistoryStore } from '../../stores/historyStore';
import { SearchIcon } from '../shared/Icons';

const HistorySearch: React.FC = () => {
  const { searchTerm, setSearchTerm } = useHistoryStore();

  return (
    <div className="relative w-full">
      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search history..."
        className="w-full p-2 pl-10 bg-white/80 dark:bg-slate-700/80 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 backdrop-blur-sm"
      />
    </div>
  );
};

export default HistorySearch;
