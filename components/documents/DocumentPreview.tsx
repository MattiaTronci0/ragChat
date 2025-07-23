
import React from 'react';
import type { Document } from '../../types';
import { XIcon, FileIcon } from '../shared/Icons';

interface DocumentPreviewProps {
  document: Document | null;
  onClose: () => void;
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({ document, onClose }) => {
  if (!document) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-[fadeIn_0.3s_ease-out]">
      <div className="relative w-full max-w-3xl h-[80vh] m-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col animate-[slideUp_0.4s_ease-out]">
        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <FileIcon className="w-5 h-5 text-gray-600 dark:text-gray-300 flex-shrink-0" />
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 truncate">{document.name}</h3>
          </div>
          <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 rounded-full transition-colors">
            <XIcon className="w-6 h-6" />
          </button>
        </header>
        <div className="flex-grow p-6 overflow-y-auto">
          <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <p className="font-semibold">Document Preview Unavailable</p>
              <p className="text-sm">This is a mock-up. In a real application, the document content would be rendered here.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentPreview;
