
import React, { useState } from 'react';
import { useQueryClient, useMutation, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useChatStore } from '../../stores/chatStore';
import { useHistoryStore } from '../../stores/historyStore';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { BotIcon, SparklesIcon, Trash2Icon } from '../shared/Icons';
import ConfirmDialog from '../shared/ConfirmDialog';
import type { ChatHistory } from '../../types';

const ChatContainer: React.FC = () => {
  const { messages, isLoading, generateMockResponse, clearChat } = useChatStore();
  const { addHistory } = useHistoryStore();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (newMessage: string) => {
      // In a real app, this would be an API call.
      // We are using the Zustand store's mock generator.
      return new Promise<void>(resolve => {
        generateMockResponse(newMessage);
        resolve();
      });
    },
    onSuccess: () => {
      // Invalidate and refetch, etc. if needed
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    }
  });

  const handleSend = (message: string) => {
    mutation.mutate(message);
  };
  
  const generateChatTitle = (messages: typeof messages): string => {
    if (messages.length === 0) return 'New Chat';
    
    const firstUserMessage = messages.find(msg => msg.isUser)?.content || '';
    const words = firstUserMessage.split(' ').slice(0, 4).join(' ');
    return words.length > 0 ? words : 'New Chat';
  };

  const saveChatToHistory = () => {
    if (messages.length === 0) return;
    
    const chatHistory: ChatHistory = {
      id: `chat_${Date.now()}`,
      title: generateChatTitle(messages),
      messages: [...messages],
      timestamp: new Date()
    };
    
    addHistory(chatHistory);
  };

  const handleClearChat = () => {
    if (messages.length > 0) {
      saveChatToHistory();
    }
    clearChat();
    setIsConfirmOpen(false);
  }

  return (
    <div className="flex flex-col h-full bg-white/90 dark:bg-slate-900/50 backdrop-blur-xl m-4 rounded-2xl shadow-lg border border-slate-300 dark:border-slate-800 overflow-hidden">
      <header className="flex items-center justify-between p-4 border-b border-slate-300 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="relative">
            <BotIcon className="w-8 h-8 text-emerald-500" />
            <SparklesIcon className="absolute -top-1 -right-1 w-4 h-4 text-indigo-500 animate-pulse" />
          </div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">AI Financial Assistant</h2>
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => setIsConfirmOpen(true)}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full transition-colors"
            aria-label="Clear chat history"
          >
            <Trash2Icon className="w-5 h-5" />
          </button>
        )}
      </header>

      <MessageList messages={messages} isLoading={isLoading} />
      <MessageInput onSend={handleSend} isLoading={isLoading} />

      <ConfirmDialog 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleClearChat}
        title="Clear Chat"
        message="Are you sure you want to delete this entire conversation? This action cannot be undone."
      />
    </div>
  );
};


const queryClient = new QueryClient();

const ChatContainerWithProvider: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <ChatContainer />
  </QueryClientProvider>
);

export default ChatContainerWithProvider;

