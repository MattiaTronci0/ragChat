
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
      <div className="relative w-full max-w-3xl h-[80vh] m-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col animate-[slideUp_0.4s_ease-out]">
        <header className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <FileIcon className="w-5 h-5 text-slate-600 dark:text-slate-300 flex-shrink-0" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 truncate">{document.name}</h3>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700 rounded-full transition-colors">
            <XIcon className="w-6 h-6" />
          </button>
        </header>
        <div className="flex-grow p-6 overflow-y-auto">
          <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-lg">
            <div className="text-center text-slate-500 dark:text-slate-400">
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
