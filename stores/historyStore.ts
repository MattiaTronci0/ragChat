
import { create } from 'zustand';
import type { ChatHistory } from '../types';

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
  history: [],
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
