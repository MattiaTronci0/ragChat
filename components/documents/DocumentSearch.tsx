
import React from 'react';
import { useDocumentStore } from '../../stores/documentStore';
import { SearchIcon } from '../shared/Icons';

const DocumentSearch: React.FC = () => {
  const { searchTerm, setSearchTerm } = useDocumentStore();

  return (
    <div className="relative flex-grow">
      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-300" />
      <input
        type="text"
        value={searchTerm}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
        placeholder="Cerca documenti..."
        className="w-full p-2 pl-10 bg-white/95 dark:bg-gray-700/80 border border-gray-400 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 backdrop-blur-sm"
      />
    </div>
  );
};

export default DocumentSearch;
