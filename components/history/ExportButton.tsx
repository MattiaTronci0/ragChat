
import React from 'react';
import { DownloadIcon } from '../shared/Icons';

const ExportButton: React.FC = () => {
  const handleExport = () => {
    alert('Export functionality is not implemented in this mock.');
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300"
    >
      <DownloadIcon className="w-5 h-5" />
      <span>Export All</span>
    </button>
  );
};

export default ExportButton;
