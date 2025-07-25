
import { create } from 'zustand';
import type { Message } from '../types';
import { ChatAPI } from '../utils/apiClient';

interface ChatState {
  messages: Message[];
  isLoading: boolean;
  sessionId: string | null;
  addMessage: (message: Message) => void;
  clearChat: () => void;
  setLoading: (loading: boolean) => void;
  sendMessage: (userMessage: string) => Promise<void>;
  loadHistory: (messages: Message[]) => void;
  setSessionId: (sessionId: string) => void;
}

const generateId = () => Date.now().toString() + Math.random().toString(36).substring(2);

// Session management utilities
const SESSION_STORAGE_KEY = 'ragchat_session_id';

const getStoredSessionId = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(SESSION_STORAGE_KEY);
};

const setStoredSessionId = (sessionId: string | null): void => {
  if (typeof window === 'undefined') return;
  if (sessionId) {
    localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
  } else {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  }
};

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isLoading: false,
  sessionId: getStoredSessionId(),
  addMessage: (message) => {
    set((state) => ({ messages: [...state.messages, message] }));
  },
  clearChat: () => {
    setStoredSessionId(null);
    set({ messages: [], sessionId: null });
  },
  setLoading: (loading) => set({ isLoading: loading }),
  loadHistory: (messages) => set({ messages }),
  setSessionId: (sessionId) => {
    setStoredSessionId(sessionId);
    set({ sessionId });
  },
  
  sendMessage: async (userMessage: string) => {
    const userMsg: Message = {
      id: generateId(),
      content: userMessage,
      isUser: true,
      timestamp: new Date(),
    };
    
    get().addMessage(userMsg);
    get().setLoading(true);

    try {
      const response = await ChatAPI.sendMessage(userMessage, get().sessionId || undefined);
      
      if (response.success && response.response) {
        // Update session ID if returned from API
        if (response.sessionId && response.sessionId !== get().sessionId) {
          get().setSessionId(response.sessionId);
        }
        
        const aiMsg: Message = {
          id: generateId(),
          content: response.response,
          isUser: false,
          timestamp: new Date(),
        };
        get().addMessage(aiMsg);
      } else {
        throw new Error(response.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Errore chat:', error);
      const aiMsg: Message = {
        id: generateId(),
        content: 'Mi dispiace, ho riscontrato un errore. Riprova.',
        isUser: false,
        timestamp: new Date(),
      };
      get().addMessage(aiMsg);
    } finally {
      get().setLoading(false);
    }
  }
}));
