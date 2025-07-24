import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Document, DocumentCategory } from '../types';
import { DocumentAPI, type ProcessedDocument, type DocumentStatus } from '../utils/apiClient';

const generateId = () => Date.now().toString() + Math.random().toString(36).substring(2);

const CATEGORIES: DocumentCategory[] = [
  { id: '1', name: 'Tax Returns', color: 'green' },
  { id: '2', name: 'Financial Statements', color: 'green' },
  { id: '3', name: 'Receipts', color: 'orange' },
  { id: '4', name: 'Invoices', color: 'purple' },
  { id: '5', name: 'Legal Documents', color: 'red' },
  { id: '6', name: 'Other', color: 'gray' },
];

interface DocumentWithStatus extends Document {
  status: DocumentStatus['status'];
  uploadProgress?: number;
  processingMessage?: string;
}

interface UploadingDocument {
  progress: number;
  file: File;
  category: string;
}

interface DocumentState {
  documents: DocumentWithStatus[];
  searchTerm: string;
  selectedCategory: string;
  categories: DocumentCategory[];
  isLoading: boolean;
  uploadingDocuments: Record<string, UploadingDocument>;
  
  // Actions
  addDocument: (file: File, category: string) => Promise<boolean>;
  deleteDocument: (id: string) => Promise<boolean>;
  setSearchTerm: (term: string) => void;
  setSelectedCategory: (category: string) => void;
  getFilteredDocuments: () => DocumentWithStatus[];
  loadDocuments: () => Promise<void>;
  refreshDocumentStatus: (id: string) => Promise<void>;
  getFileContent: (document: DocumentWithStatus) => Promise<File | null>;
  
  // Status polling
  startStatusPolling: (documentId: string) => void;
  stopStatusPolling: (documentId: string) => void;
  clearAllPolling: () => void;
}

// Status polling management - moved outside of store to prevent memory leaks
class PollingManager {
  private intervals = new Map<string, NodeJS.Timeout>();
  
  start(documentId: string, callback: () => Promise<void>) {
    this.stop(documentId);
    
    const interval = setInterval(async () => {
      try {
        await callback();
      } catch (error) {
        console.error('Polling error:', error);
        this.stop(documentId);
      }
    }, 3000);
    
    this.intervals.set(documentId, interval);
  }
  
  stop(documentId: string) {
    const interval = this.intervals.get(documentId);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(documentId);
    }
  }
  
  clear() {
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals.clear();
  }
}

const pollingManager = new PollingManager();

export const useDocumentStore = create<DocumentState>()(
  persist(
    (set, get) => ({
      documents: [],
      searchTerm: '',
      selectedCategory: 'all',
      categories: CATEGORIES,
      isLoading: false,
      uploadingDocuments: {},

      addDocument: async (file, category) => {
        const tempId = generateId();
        
        // Add to uploading documents
        set(state => ({
          uploadingDocuments: {
            ...state.uploadingDocuments,
            [tempId]: {
              progress: 0,
              file,
              category
            }
          }
        }));

        try {
          // Use real API for file upload
          const result = await DocumentAPI.uploadDocument(file, category);
          
          // Remove from uploading documents
          set(state => {
            const { [tempId]: removed, ...uploadingDocuments } = state.uploadingDocuments;
            return { uploadingDocuments };
          });

          if (result.success && result.documentId) {
            // Add document to the list with processing status
            const newDocument: DocumentWithStatus = {
              id: result.documentId,
              name: file.name,
              type: file.type,
              size: file.size,
              category,
              uploadDate: new Date(),
              status: 'processing',
              processingMessage: 'Document uploaded, processing...'
            };

            set(state => ({
              documents: [newDocument, ...state.documents]
            }));

            // Start polling for status updates
            get().startStatusPolling(result.documentId);
            
            return true;
          } else {
            console.error('Upload failed:', result.error);
            return false;
          }
        } catch (error) {
          // Remove from uploading documents on error
          set(state => {
            const { [tempId]: removed, ...uploadingDocuments } = state.uploadingDocuments;
            return { uploadingDocuments };
          });
          
          console.error('Upload error:', error);
          return false;
        }
      },

      deleteDocument: async (id) => {
        try {
          const success = await DocumentAPI.deleteDocument(id);
          
          if (success) {
            set(state => ({
              documents: state.documents.filter(doc => doc.id !== id)
            }));
            
            // Stop polling for this document
            get().stopStatusPolling(id);
            
            return true;
          }
          
          return false;
        } catch (error) {
          console.error('Delete error:', error);
          return false;
        }
      },

      setSearchTerm: (term) => set({ searchTerm: term }),
      
      setSelectedCategory: (category) => set({ selectedCategory: category }),

      getFilteredDocuments: () => {
        const { documents, searchTerm, selectedCategory } = get();
        return documents
          .filter((doc) => {
            if (selectedCategory === 'all') return true;
            return doc.category === selectedCategory;
          })
          .filter((doc) => {
            if (!searchTerm) return true;
            return doc.name.toLowerCase().includes(searchTerm.toLowerCase());
          });
      },

      loadDocuments: async () => {
        set({ isLoading: true });
        
        try {
          // Use real API for document list
          const processedDocs = await DocumentAPI.getDocuments();
          
          const documents: DocumentWithStatus[] = processedDocs.map(doc => ({
            id: doc.id,
            name: doc.name,
            type: doc.type,
            size: doc.size,
            category: doc.category,
            uploadDate: new Date(doc.uploadDate),
            status: doc.status,
            url: doc.url
          }));

          set({ documents, isLoading: false });
          
          // Start polling for documents that are still processing
          documents.forEach(doc => {
            if (doc.status === 'processing' || doc.status === 'indexed') {
              get().startStatusPolling(doc.id);
            }
          });
          
        } catch (error) {
          console.error('Failed to load documents:', error);
          set({ isLoading: false });
        }
      },

      refreshDocumentStatus: async (id) => {
        try {
          const status = await DocumentAPI.getDocumentStatus(id);
          
          if (status) {
            set(state => ({
              documents: state.documents.map(doc => 
                doc.id === id 
                  ? { 
                      ...doc, 
                      status: status.status,
                      processingMessage: status.message 
                    }
                  : doc
              )
            }));

            // Stop polling if document is ready or has error
            if (status.status === 'ready' || status.status === 'error') {
              get().stopStatusPolling(id);
            }
          }
        } catch (error) {
          console.error('Failed to refresh document status:', error);
        }
      },

      getFileContent: async (document) => {
        try {
          const blob = await DocumentAPI.downloadDocument(document.id, document.name);
          
          if (blob) {
            // Convert blob to File object
            return new File([blob], document.name, { type: document.type });
          }
          
          return null;
        } catch (error) {
          console.error('Failed to get file content:', error);
          return null;
        }
      },

      startStatusPolling: (documentId) => {
        pollingManager.start(documentId, () => get().refreshDocumentStatus(documentId));
      },

      stopStatusPolling: (documentId) => {
        pollingManager.stop(documentId);
      },

      clearAllPolling: () => {
        pollingManager.clear();
      }
    }),
    {
      name: 'document-storage',
      partialize: (state) => ({
        documents: state.documents,
        selectedCategory: state.selectedCategory,
        // Don't persist uploadingDocuments to avoid memory issues
      }),
    }
  )
);

// Initialize the store
const initializeStore = async () => {
  try {
    const store = useDocumentStore.getState();
    await store.loadDocuments();
  } catch (error) {
    console.error('Failed to initialize document store:', error);
  }
};

// Cleanup on page unload
if (typeof window !== 'undefined') {
  initializeStore();
  
  // Multiple cleanup event listeners for better reliability
  const cleanup = () => {
    useDocumentStore.getState().clearAllPolling();
  };
  
  window.addEventListener('beforeunload', cleanup);
  window.addEventListener('unload', cleanup);
  
  // Cleanup on page visibility change (when tab is hidden)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      cleanup();
    }
  });
}