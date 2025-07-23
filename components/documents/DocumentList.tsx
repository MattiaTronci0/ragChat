
import React, { useState } from 'react';
import type { Document } from '../../types';
import DocumentCard from './DocumentCard';
import ConfirmDialog from '../shared/ConfirmDialog';
import DocumentPreview from './DocumentPreview';

interface DocumentListProps {
  documents: Document[];
  onDelete: (id: string) => void;
}

const DocumentList: React.FC<DocumentListProps> = ({ documents, onDelete }) => {
  const [docToDelete, setDocToDelete] = useState<string | null>(null);
  const [docToPreview, setDocToPreview] = useState<Document | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  if (documents.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500 dark:text-gray-400 animate-[fadeIn_0.6s_ease-out]">
        <h3 className="text-xl font-semibold">No Documents Found</h3>
        <p>Try adjusting your search or filters, or upload a new document.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {documents.map((doc, i) => (
          <div key={doc.id} style={{ animationDelay: `${i * 50}ms` }}>
            <DocumentCard 
              document={{ ...doc, status: 'ready' as const }} 
              onDelete={() => setDocToDelete(doc.id)} 
              onPreview={setDocToPreview}
            />
          </div>
        ))}
      </div>
      <ConfirmDialog
        isOpen={!!docToDelete}
        onClose={() => !isDeleting && setDocToDelete(null)}
        onConfirm={async () => {
          if (docToDelete && !isDeleting) {
            setIsDeleting(true);
            try {
              await onDelete(docToDelete);
              setDocToDelete(null);
            } catch (error) {
              console.error('Failed to delete document:', error);
              alert('Failed to delete document. Please try again.');
            } finally {
              setIsDeleting(false);
            }
          }
        }}
        title="Delete Document"
        message="Are you sure you want to delete this document? This action cannot be undone."
      />
      <DocumentPreview 
        document={docToPreview}
        onClose={() => setDocToPreview(null)}
      />
    </>
  );
};

export default DocumentList;
