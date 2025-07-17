import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Document, DocumentCategory } from '../types';
import { DocumentAPI, type ProcessedDocument, type DocumentStatus } from '../utils/apiClient';

const generateId = () => Date.now().toString() + Math.random().toString(36).substring(2);

const CATEGORIES: DocumentCategory[] = [
  { id: '1', name: 'Tax Returns', color: 'blue' },
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

interface DocumentState {
  documents: DocumentWithStatus[];
  searchTerm: string;
  selectedCategory: string;
  categories: DocumentCategory[];
  isLoading: boolean;
  uploadingDocuments: Map<string, { progress: number; file: File; category: string }>;
  
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

// Status polling management
const statusPollingIntervals = new Map<string, NodeJS.Timeout>();

export const useDocumentStore = create<DocumentState>()(
  persist(
    (set, get) => ({
      documents: [],
      searchTerm: '',
      selectedCategory: 'all',
      categories: CATEGORIES,
      isLoading: false,
      uploadingDocuments: new Map(),

      addDocument: async (file, category) => {
        const tempId = generateId();
        
        // Add to uploading documents
        set(state => ({
          uploadingDocuments: new Map(state.uploadingDocuments).set(tempId, {
            progress: 0,
            file,
            category
          })
        }));

        try {
          // Use real API for file upload
          const result = await DocumentAPI.uploadDocument(file, category);
          
          // Remove from uploading documents
          set(state => {
            const newUploading = new Map(state.uploadingDocuments);
            newUploading.delete(tempId);
            return { uploadingDocuments: newUploading };
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
            const newUploading = new Map(state.uploadingDocuments);
            newUploading.delete(tempId);
            return { uploadingDocuments: newUploading };
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
        // Clear existing interval if any
        get().stopStatusPolling(documentId);
        
        const interval = setInterval(async () => {
          await get().refreshDocumentStatus(documentId);
        }, 3000); // Poll every 3 seconds
        
        statusPollingIntervals.set(documentId, interval);
      },

      stopStatusPolling: (documentId) => {
        const interval = statusPollingIntervals.get(documentId);
        if (interval) {
          clearInterval(interval);
          statusPollingIntervals.delete(documentId);
        }
      },

      clearAllPolling: () => {
        statusPollingIntervals.forEach((interval) => clearInterval(interval));
        statusPollingIntervals.clear();
      }
    }),
    {
      name: 'document-storage',
      partialize: (state) => ({
        documents: state.documents,
        selectedCategory: state.selectedCategory,
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
  
  window.addEventListener('beforeunload', () => {
    useDocumentStore.getState().clearAllPolling();
  });
}