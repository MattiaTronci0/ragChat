
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
  generateMockResponse: (userMessage: string) => void;
  loadHistory: (messages: Message[]) => void;
  setSessionId: (sessionId: string) => void;
}

const generateId = () => Date.now().toString() + Math.random().toString(36).substring(2);

const getMockResponse = (userMessage: string): string => {
  const lowerCaseMessage = userMessage.toLowerCase();
  if (lowerCaseMessage.includes('tax') || lowerCaseMessage.includes('deduction') || lowerCaseMessage.includes('tasse') || lowerCaseMessage.includes('deduzione')) {
    return "Certamente! Per le domande fiscali, è fondamentale considerare la giurisdizione e l'anno fiscale. Una deduzione comune per le aziende è la deduzione per ufficio in casa, a condizione che lo spazio sia utilizzato esclusivamente e regolarmente per il business. Di quale argomento fiscale specifico sei interessato?";
  }
  if (lowerCaseMessage.includes('invoice') || lowerCaseMessage.includes('billing') || lowerCaseMessage.includes('fattura') || lowerCaseMessage.includes('fatturazione')) {
    return "Come Studio Radaelli, posso aiutarti con tutti gli aspetti della fatturazione. Una fattura elettronica deve includere: numero progressivo, data emissione, dati del cedente e cessionario, descrizione beni/servizi, aliquota IVA e totale. Hai bisogno di assistenza per la fatturazione elettronica o la gestione delle fatture?";
  }
  if (lowerCaseMessage.includes('expense') || lowerCaseMessage.includes('receipt') || lowerCaseMessage.includes('spesa') || lowerCaseMessage.includes('ricevuta')) {
    return "Studio Radaelli ti aiuta nella gestione contabile delle spese. È importante conservare tutte le ricevute e documenti fiscali per almeno 5 anni. Le spese devono essere correttamente categorizzate (es. costi di produzione, spese generali, ammortamenti) per una corretta contabilizzazione. Hai bisogno di assistenza per la contabilizzazione di spese specifiche?";
  }
  if (lowerCaseMessage.includes('financial planning') || lowerCaseMessage.includes('forecast') || lowerCaseMessage.includes('pianificazione finanziaria') || lowerCaseMessage.includes('previsione')) {
    return "La pianificazione finanziaria comporta la definizione di obiettivi, la raccolta di dati e la creazione di una roadmap. Per le aziende, questo spesso significa creare proiezioni di flusso di cassa, un bilancio e un conto economico per i prossimi 1-3 anni. Qual è l'obiettivo principale del tuo piano finanziario?";
  }
  if (lowerCaseMessage.includes('business analytics') || lowerCaseMessage.includes('kpi') || lowerCaseMessage.includes('analisi aziendale')) {
    return "Ottima domanda! Gli Indicatori di Performance Chiave (KPI) per un'azienda potrebbero includere il Costo di Acquisizione Cliente (CAC), il Valore del Cliente nel Tempo (CLV) e le Entrate Ricorrenti Mensili (MRR). Analizzare questi aiuta a prendere decisioni basate sui dati. In quale area delle performance aziendali sei più interessato a migliorare?";
  }
  return "Ciao! Sono l'Assistente AI di Studio Radaelli, specializzato in consulenza contabile. Posso aiutarti con domande fiscali, contabilità aziendale, dichiarazioni dei redditi, adempimenti IVA e molto altro. Come posso aiutarti oggi?";
};

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
      // Fallback a risposta mock in caso di errore
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
  },
  
  generateMockResponse: (userMessage: string) => {
    const userMsg: Message = {
        id: generateId(),
        content: userMessage,
        isUser: true,
        timestamp: new Date(),
    };
    get().addMessage(userMsg);
    get().setLoading(true);

    setTimeout(() => {
        const aiResponseContent = getMockResponse(userMessage);
        const aiMsg: Message = {
            id: generateId(),
            content: aiResponseContent,
            isUser: false,
            timestamp: new Date(),
        };
        get().addMessage(aiMsg);
        get().setLoading(false);
    }, 1500 + Math.random() * 1000); // Simulate network delay
  }
}));
