
import React, { useState, useRef, useEffect } from 'react';
import { SendIcon } from '../shared/Icons';

interface MessageInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSend, isLoading }) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleSend = () => {
    if (message.trim() && !isLoading) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="relative p-4">
      <div className="relative bg-white/95 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-300 dark:border-slate-700 flex items-end p-2 gap-2">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a financial question..."
          className="flex-1 bg-transparent p-2 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-500 focus:outline-none resize-none max-h-48"
          rows={1}
          disabled={isLoading}
        />
        <div className="text-sm text-slate-400 dark:text-slate-300 hidden sm:block self-center pr-2">
          ↵ to send
        </div>
        <button
          onClick={handleSend}
          disabled={!message.trim() || isLoading}
          className="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-800"
          aria-label="Send message"
        >
          <SendIcon className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default MessageInput;
