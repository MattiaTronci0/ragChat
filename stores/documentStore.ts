
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Document, DocumentCategory } from '../types';
import { FileSystemManager, FallbackFileManager } from '../utils/fileSystem';

const generateId = () => Date.now().toString() + Math.random().toString(36).substring(2);

const MOCK_CATEGORIES: DocumentCategory[] = [
  { id: '1', name: 'Tax Returns', color: 'blue' },
  { id: '2', name: 'Financial Statements', color: 'green' },
  { id: '3', name: 'Receipts', color: 'orange' },
  { id: '4', name: 'Invoices', color: 'purple' },
  { id: '5', name: 'Legal Documents', color: 'red' },
  { id: '6', name: 'Other', color: 'gray' },
];

const MOCK_DOCUMENTS: Document[] = [
  { id: generateId(), name: 'Q4_2023_Tax_Return.pdf', type: 'application/pdf', size: 2345678, category: 'Tax Returns', uploadDate: new Date('2024-01-15') },
  { id: generateId(), name: 'Annual_Financial_Report_2023.xlsx', type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', size: 543210, category: 'Financial Statements', uploadDate: new Date('2024-02-20') },
  { id: generateId(), name: 'Software_Subscription_Receipt.png', type: 'image/png', size: 123456, category: 'Receipts', uploadDate: new Date('2024-03-05') },
  { id: generateId(), name: 'Client_Invoice_ACME_Corp.docx', type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', size: 98765, category: 'Invoices', uploadDate: new Date('2024-03-10') },
  { id: generateId(), name: 'Partnership_Agreement.pdf', type: 'application/pdf', size: 1234567, category: 'Legal Documents', uploadDate: new Date('2023-11-22') },
  { id: generateId(), name: 'Marketing_Plan_2024.txt', type: 'text/plain', size: 45678, category: 'Other', uploadDate: new Date('2024-01-05') },
];


interface DocumentState {
  documents: Document[];
  searchTerm: string;
  selectedCategory: string; // 'all' or category name
  categories: DocumentCategory[];
  isFileSystemSupported: boolean;
  hasDirectoryAccess: boolean;
  directoryName: string;
  addDocument: (file: File, category: string) => Promise<boolean>;
  deleteDocument: (id: string) => Promise<boolean>;
  setSearchTerm: (term: string) => void;
  setSelectedCategory: (category: string) => void;
  getFilteredDocuments: () => Document[];
  requestDirectoryAccess: () => Promise<boolean>;
  loadDocuments: () => Promise<void>;
  getFileContent: (document: Document) => Promise<File | null>;
}

export const useDocumentStore = create<DocumentState>()(
  persist(
    (set, get) => ({
      documents: [],
      searchTerm: '',
      selectedCategory: 'all',
      categories: MOCK_CATEGORIES,
      isFileSystemSupported: false,
      hasDirectoryAccess: false,
      directoryName: '',

      addDocument: async (file, category) => {
        const id = generateId();
        const fileName = `${id}_${file.name}`;
        
        const { isFileSystemSupported } = get();
        
        if (isFileSystemSupported) {
          const success = await FileSystemManager.saveFile(file, fileName);
          if (!success) return false;
        } else {
          FallbackFileManager.saveFile(file, id, { category, uploadDate: new Date() });
        }

        const newDocument: Document = {
          id,
          name: file.name,
          type: file.type,
          size: file.size,
          category,
          uploadDate: new Date(),
          file: isFileSystemSupported ? undefined : file,
          url: isFileSystemSupported ? fileName : undefined,
        };

        set((state) => ({ documents: [newDocument, ...state.documents] }));
        return true;
      },

      deleteDocument: async (id) => {
        const { documents, isFileSystemSupported } = get();
        const document = documents.find(doc => doc.id === id);
        if (!document) return false;

        if (isFileSystemSupported && document.url) {
          const success = await FileSystemManager.deleteFile(document.url);
          if (!success) return false;
        } else {
          FallbackFileManager.deleteFile(id);
        }

        set((state) => ({
          documents: state.documents.filter((doc) => doc.id !== id),
        }));
        return true;
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

      requestDirectoryAccess: async () => {
        const handle = await FileSystemManager.requestDirectoryAccess();
        if (handle) {
          set({ 
            hasDirectoryAccess: true, 
            directoryName: handle.name,
            documents: [] // Clear existing documents when switching directories
          });
          await get().loadDocuments();
          return true;
        }
        return false;
      },

      loadDocuments: async () => {
        const { isFileSystemSupported } = get();
        
        if (isFileSystemSupported) {
          const fileNames = await FileSystemManager.listFiles();
          const documents: Document[] = [];
          
          for (const fileName of fileNames) {
            if (fileName.includes('_')) {
              const [id, ...nameParts] = fileName.split('_');
              const originalName = nameParts.join('_');
              
              try {
                const file = await FileSystemManager.readFile(fileName);
                if (file) {
                  documents.push({
                    id,
                    name: originalName,
                    type: file.type,
                    size: file.size,
                    category: 'Other', // Default category, could be enhanced
                    uploadDate: new Date(file.lastModified),
                    url: fileName,
                  });
                }
              } catch (error) {
                console.error(`Failed to load file ${fileName}:`, error);
              }
            }
          }
          
          set({ documents });
        } else {
          const fallbackDocs = FallbackFileManager.getDocuments();
          const documents = Object.entries(fallbackDocs).map(([id, data]: [string, any]) => ({
            id,
            name: data.name,
            type: data.type,
            size: data.size,
            category: data.metadata.category,
            uploadDate: new Date(data.metadata.uploadDate),
            file: data.file,
          }));
          
          set({ documents });
        }
      },

      getFileContent: async (document) => {
        const { isFileSystemSupported } = get();
        
        if (isFileSystemSupported && document.url) {
          return await FileSystemManager.readFile(document.url);
        } else if (document.file) {
          return document.file;
        }
        
        return null;
      },
    }),
    {
      name: 'document-storage',
      partialize: (state) => ({
        documents: state.documents.map(doc => ({
          ...doc,
          file: undefined // Don't persist File objects
        })),
        selectedCategory: state.selectedCategory,
        hasDirectoryAccess: state.hasDirectoryAccess,
        directoryName: state.directoryName,
      }),
    }
  )
);

// Initialize the store
(async () => {
  const store = useDocumentStore.getState();
  const isSupported = await FileSystemManager.isSupported();
  const hasAccess = await FileSystemManager.getDirectoryHandle() !== null;
  
  useDocumentStore.setState({
    isFileSystemSupported: isSupported,
    hasDirectoryAccess: hasAccess,
  });

  if (hasAccess) {
    await store.loadDocuments();
  } else {
    // Load fallback documents or show mock data
    await store.loadDocuments();
  }
})();
