
export interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export interface Document {
  id: string;
  name: string;
  type: string; // e.g., 'application/pdf'
  size: number; // in bytes
  category: string; // e.g., 'Tax Returns'
  uploadDate: Date;
  url?: string; // a mock URL for preview/download
  file?: File;
}

export interface ChatHistory {
  id: string;
  title: string;
  messages: Message[];
  timestamp: Date;
}

export interface DocumentCategory {
  id: string;
  name: string;
  color: string; // Tailwind color class e.g., 'blue'
}
