
import { create } from 'zustand';
import type { Document, DocumentCategory } from '../types';

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
  addDocument: (file: File, category: string) => void;
  deleteDocument: (id: string) => void;
  setSearchTerm: (term: string) => void;
  setSelectedCategory: (category: string) => void;
  getFilteredDocuments: () => Document[];
}

export const useDocumentStore = create<DocumentState>((set, get) => ({
  documents: MOCK_DOCUMENTS,
  searchTerm: '',
  selectedCategory: 'all',
  categories: MOCK_CATEGORIES,
  addDocument: (file, category) => {
    const newDocument: Document = {
      id: generateId(),
      name: file.name,
      type: file.type,
      size: file.size,
      category: category,
      uploadDate: new Date(),
      file: file,
    };
    set((state) => ({ documents: [newDocument, ...state.documents] }));
  },
  deleteDocument: (id) => {
    set((state) => ({
      documents: state.documents.filter((doc) => doc.id !== id),
    }));
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
}));
