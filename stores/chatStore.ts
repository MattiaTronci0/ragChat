
import { create } from 'zustand';
import type { Message } from '../types';

interface ChatState {
  messages: Message[];
  isLoading: boolean;
  addMessage: (message: Message) => void;
  clearChat: () => void;
  setLoading: (loading: boolean) => void;
  generateMockResponse: (userMessage: string) => void;
}

const generateId = () => Date.now().toString() + Math.random().toString(36).substring(2);

const getMockResponse = (userMessage: string): string => {
  const lowerCaseMessage = userMessage.toLowerCase();
  if (lowerCaseMessage.includes('tax') || lowerCaseMessage.includes('deduction')) {
    return "Of course! For tax-related queries, it's crucial to consider the jurisdiction and the fiscal year. A common deduction for businesses is the home office deduction, provided the space is used exclusively and regularly for business. What specific tax topic are you interested in?";
  }
  if (lowerCaseMessage.includes('invoice') || lowerCaseMessage.includes('billing')) {
    return "I can certainly help with invoicing. A standard invoice should always include a unique invoice number, date of issue, your company's details, the client's details, a description of services or products, and clear payment terms. Are you looking to create a new invoice or manage existing ones?";
  }
  if (lowerCaseMessage.includes('expense') || lowerCaseMessage.includes('receipt')) {
    return "Effective expense management is key to financial health. It's best to categorize your expenses (e.g., travel, supplies, utilities) and keep digital copies of all receipts. Many apps can automate this process. Would you like me to recommend some tools or provide tips on categorizing expenses?";
  }
  if (lowerCaseMessage.includes('financial planning') || lowerCaseMessage.includes('forecast')) {
    return "Financial planning involves setting objectives, gathering data, and creating a roadmap. For businesses, this often means creating cash flow projections, a balance sheet, and a profit and loss statement for the next 1-3 years. What is the primary goal of your financial plan?";
  }
  if (lowerCaseMessage.includes('business analytics') || lowerCaseMessage.includes('kpi')) {
    return "Great question! Key Performance Indicators (KPIs) for a business might include Customer Acquisition Cost (CAC), Customer Lifetime Value (CLV), and Monthly Recurring Revenue (MRR). Analyzing these helps in making data-driven decisions. Which area of your business performance are you most interested in improving?";
  }
  return "Hello! As an AI Financial Assistant, I can help with a wide range of topics including tax questions, financial planning, and business analytics. How can I assist you today?";
};

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isLoading: false,
  addMessage: (message) => {
    set((state) => ({ messages: [...state.messages, message] }));
  },
  clearChat: () => set({ messages: [] }),
  setLoading: (loading) => set({ isLoading: loading }),
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
