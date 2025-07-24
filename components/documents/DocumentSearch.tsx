
import React from 'react';
import { useDocumentStore } from '../../stores/documentStore';
import { SearchIcon } from '../shared/Icons';

const DocumentSearch: React.FC = () => {
  const { searchTerm, setSearchTerm } = useDocumentStore();

  return (
    <div className="relative flex-grow">
      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      <input
        type="text"
        value={searchTerm}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
        placeholder="Cerca documenti..."
        className="w-full p-2 pl-10 bg-white/95 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 backdrop-blur-sm"
      />
    </div>
  );
};

export default DocumentSearch;
