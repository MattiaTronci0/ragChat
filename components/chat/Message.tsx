
import React from 'react';
import { BotIcon } from '../shared/Icons';
import type { Message as MessageType } from '../../types';

interface MessageProps {
  message: MessageType;
}

const Message: React.FC<MessageProps> = ({ message }) => {
  const { content, isUser, timestamp } = message;

  const animationClass = isUser ? 'animate-[messageSlideRight_0.3s_ease-out_forwards]' : 'animate-[messageSlideLeft_0.3s_ease-out_forwards]';

  return (
    <div className={`flex items-end gap-2 ${isUser ? 'justify-end' : ''} ${animationClass}`}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white mb-4">
          <BotIcon className="w-5 h-5" />
        </div>
      )}
      <div className={`relative max-w-lg lg:max-w-xl xl:max-w-2xl px-4 py-3 rounded-2xl shadow-md transition-shadow duration-300 hover:shadow-lg ${
          isUser
            ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-br-none'
            : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-bl-none'
        }`}
      >
        <p className="text-sm break-words whitespace-pre-wrap">{content}</p>
        <div className={`text-xs mt-2 ${isUser ? 'text-blue-100/80' : 'text-slate-400 dark:text-slate-500'}`}>
          {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} {!isUser && " - AI"}
        </div>
         {/* Message Tail */}
        <div className={`absolute bottom-0 w-4 h-4 ${
            isUser 
            ? 'right-[-7px] bg-purple-600' 
            : 'left-[-7px] bg-white dark:bg-slate-700'
        }`} style={{
            clipPath: isUser
                ? 'polygon(100% 100%, 0 0, 100% 0)'
                : 'polygon(0 0, 100% 0, 0 100%)',
        }}></div>
      </div>
    </div>
  );
};

export default Message;
