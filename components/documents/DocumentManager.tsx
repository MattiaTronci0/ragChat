
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
      <header className="flex-shrink-0 animate-fade-in">
        <div className="flex items-center gap-3">
            <FolderKanbanIcon className="w-8 h-8 text-olive-600" />
            <h1 className="text-3xl font-bold font-professional bg-gradient-to-r from-olive-800 to-olive-600 dark:from-olive-100 dark:to-olive-300 bg-clip-text text-transparent">
              Hub Documenti
            </h1>
        </div>
        <p className="text-olive-600 dark:text-olive-300 mt-1 font-classical">Carica documenti sul VPS per l'elaborazione n8n e l'integrazione con il database vettoriale.</p>
      </header>
      
      <div className="flex flex-col lg:flex-row gap-6 flex-grow overflow-hidden">
        {/* Colonna sinistra per caricamento e controlli */}
        <div className="w-full lg:w-1/3 xl:w-1/4 flex-shrink-0 flex flex-col gap-6">
            <div className="animate-slide-up [animation-delay:100ms]">
                <DocumentUpload />
            </div>
             <div className="flex flex-col sm:flex-row lg:flex-col gap-4 animate-slide-up [animation-delay:150ms]">
                <DocumentSearch />
                <CategoryFilter />
            </div>
        </div>
        
        {/* Colonna destra per la lista documenti */}
        <div className="flex-1 bg-white/90 dark:bg-olive-900/50 backdrop-blur-xl rounded-2xl shadow-lg border border-olive-200 dark:border-olive-800 overflow-y-auto p-6 animate-fade-in [animation-delay:300ms]">
          <DocumentList documents={filteredDocs} onDelete={deleteDocument} />
        </div>
      </div>
    </div>
  );
};

export default DocumentManager;
