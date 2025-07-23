
import React, { useState } from 'react';
import { useQueryClient, useMutation, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useChatStore } from '../../stores/chatStore';
import { useHistoryStore } from '../../stores/historyStore';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { BotIcon, SparklesIcon, Trash2Icon } from '../shared/Icons';
import ConfirmDialog from '../shared/ConfirmDialog';
import type { ChatHistory, Message } from '../../types';

const ChatContainer: React.FC = () => {
  const { messages, isLoading, sendMessage, clearChat } = useChatStore();
  const { addHistory } = useHistoryStore();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (newMessage: string) => {
      // Usa il nuovo metodo sendMessage che chiama l'API reale
      await sendMessage(newMessage);
    },
    onSuccess: () => {
      // Invalida e ricarica, ecc. se necessario
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    }
  });

  const handleSend = (message: string) => {
    mutation.mutate(message);
  };
  
  const generateChatTitle = (messages: Message[]): string => {
    if (messages.length === 0) return 'Nuova Chat';
    
    const firstUserMessage = messages.find(msg => msg.isUser)?.content || '';
    const words = firstUserMessage.split(' ').slice(0, 4).join(' ');
    return words.length > 0 ? words : 'Nuova Chat';
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
    <div className="flex flex-col h-full bg-white/90 dark:bg-blue-900/50 backdrop-blur-xl m-4 rounded-2xl shadow-lg border border-blue-200 dark:border-blue-800 overflow-hidden">
      <header className="flex items-center justify-between p-4 border-b border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-3">
          <div className="relative">
            <BotIcon className="w-8 h-8 text-blue-600" />
            <SparklesIcon className="absolute -top-1 -right-1 w-4 h-4 text-blue-500 animate-pulse" />
          </div>
          <h2 className="text-lg font-bold text-blue-800 dark:text-blue-100">Assistente AI Finanziario</h2>
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => setIsConfirmOpen(true)}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full transition-colors"
            aria-label="Cancella cronologia chat"
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
        title="Cancella Chat"
        message="Sei sicuro di voler eliminare l'intera conversazione? Questa azione non può essere annullata."
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

