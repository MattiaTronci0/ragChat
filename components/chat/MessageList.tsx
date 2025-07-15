
import React, { useEffect, useRef } from 'react';
import type { Message as MessageType } from '../../types';
import Message from './Message';
import TypingIndicator from './TypingIndicator';
import { BotIcon } from '../shared/Icons';

interface MessageListProps {
  messages: MessageType[];
  isLoading: boolean;
}

const WelcomeCard: React.FC<{ title: string; description: string }> = ({ title, description }) => (
    <div className="bg-white/50 dark:bg-slate-800/50 p-4 rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300 backdrop-blur-sm border border-slate-200 dark:border-slate-700 cursor-pointer">
        <h3 className="font-bold text-slate-800 dark:text-slate-100">{title}</h3>
        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{description}</p>
    </div>
)

const WelcomeScreen: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-8 animate-[fadeIn_0.6s_ease-out]">
        <BotIcon className="w-16 h-16 text-emerald-500 mb-4" />
        <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent mb-2">Welcome to your AI Financial Assistant</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-lg">
            Start by asking a question, or explore some of these common topics.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl">
            <WelcomeCard title="Tax Questions" description="Ask about deductions, deadlines, or complex tax situations."/>
            <WelcomeCard title="Financial Planning" description="Get help with forecasting, budgeting, and investment strategies."/>
            <WelcomeCard title="Business Analytics" description="Analyze your financial data and uncover key performance insights."/>
        </div>
    </div>
)

const MessageList: React.FC<MessageListProps> = ({ messages, isLoading }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  if (messages.length === 0) {
      return <WelcomeScreen />;
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {messages.map((msg, index) => (
        <Message key={msg.id} message={msg} />
      ))}
      {isLoading && (
        <div className="flex items-end gap-2">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white mb-4">
                <BotIcon className="w-5 h-5" />
            </div>
            <div className="bg-white dark:bg-slate-700 rounded-2xl rounded-bl-none shadow-md">
                <TypingIndicator />
            </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
