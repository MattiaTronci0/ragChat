
import React from 'react';
import { useDocumentStore } from '../../stores/documentStore';
import DocumentUpload from './DocumentUpload';
import DocumentList from './DocumentList';
import DocumentSearch from './DocumentSearch';
import CategoryFilter from './CategoryFilter';
import { FolderKanbanIcon } from '../shared/Icons';

const DocumentManager: React.FC = () => {
  const { deleteDocument, getFilteredDocuments } = useDocumentStore();
  const filteredDocs = getFilteredDocuments();

  return (
    <div className="flex flex-col h-full overflow-hidden p-4 md:p-6 gap-6">
      <header className="flex-shrink-0 animate-[fadeIn_0.6s_ease-out]">
        <div className="flex items-center gap-3">
            <FolderKanbanIcon className="w-8 h-8 text-emerald-500" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
              Document Hub
            </h1>
        </div>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Upload, manage, and analyze your financial documents.</p>
      </header>
      
      <div className="flex flex-col lg:flex-row gap-6 flex-grow overflow-hidden">
        {/* Left column for upload and controls */}
        <div className="w-full lg:w-1/3 xl:w-1/4 flex-shrink-0 flex flex-col gap-6">
            <div className="animate-[slideUp_0.6s_ease-out] opacity-0 [animation-delay:100ms]">
                <DocumentUpload />
            </div>
             <div className="flex flex-col sm:flex-row lg:flex-col gap-4 animate-[slideUp_0.6s_ease-out] opacity-0 [animation-delay:200ms]">
                <DocumentSearch />
                <CategoryFilter />
            </div>
        </div>
        
        {/* Right column for document list */}
        <div className="flex-1 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-y-auto p-6 animate-[fadeIn_0.6s_ease-out] [animation-delay:300ms]">
          <DocumentList documents={filteredDocs} onDelete={deleteDocument} />
        </div>
      </div>
    </div>
  );
};

export default DocumentManager;
