
import { create } from 'zustand';
import type { ChatHistory } from '../types';

const MOCK_HISTORY: ChatHistory[] = [
    {
        id: 'hist_1',
        title: 'Q1 Tax Planning Discussion',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        messages: [
            { id: '1', content: 'What are the key tax deadlines for Q1?', isUser: true, timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 - 20000) },
            { id: '2', content: 'For most businesses, the key Q1 deadline is April 15th for filing annual returns or extensions. Estimated tax payments are also due then.', isUser: false, timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 - 10000) }
        ]
    },
    {
        id: 'hist_2',
        title: 'Invoice Generation Help',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        messages: [
            { id: '3', content: 'How do I create a professional invoice?', isUser: true, timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 - 20000) },
            { id: '4', content: 'A professional invoice should include your business name and logo, client details, a unique invoice number, itemized services, payment terms, and the total amount due. I can help you draft one.', isUser: false, timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 - 10000) }
        ]
    },
    {
        id: 'hist_3',
        title: 'Expense Categorization',
        timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        messages: [
             { id: '5', content: 'How should I categorize my software subscriptions?', isUser: true, timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000 - 20000) },
             { id: '6', content: 'Software subscriptions are typically categorized under "Software" or "Tools and Subscriptions" as an operating expense. This is fully deductible.', isUser: false, timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000 - 10000) }
        ]
    }
];


interface HistoryState {
  history: ChatHistory[];
  searchTerm: string;
  addHistory: (chat: ChatHistory) => void;
  deleteHistory: (id: string) => void;
  clearHistory: () => void;
  setSearchTerm: (term: string) => void;
  getFilteredHistory: () => ChatHistory[];
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  history: MOCK_HISTORY,
  searchTerm: '',
  addHistory: (chat) => set((state) => ({ history: [chat, ...state.history] })),
  deleteHistory: (id) => set((state) => ({ history: state.history.filter(h => h.id !== id) })),
  clearHistory: () => set({ history: [] }),
  setSearchTerm: (term) => set({ searchTerm: term }),
  getFilteredHistory: () => {
    const { history, searchTerm } = get();
    if (!searchTerm) return history;
    return history.filter(h => h.title.toLowerCase().includes(searchTerm.toLowerCase()));
  }
}));
