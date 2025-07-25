
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
  url?: string; // URL for preview/download
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
  color: string; // Tailwind color class e.g., 'green', 'gray', 'amber'
}

// AnythingLLM specific interfaces
export interface AnythingLLMWorkspace {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  lastUpdatedAt: string;
  documents: AnythingLLMDocument[];
}

export interface AnythingLLMDocument {
  id: string;
  filename: string;
  title: string;
  mime: string;
  size: number;
  cached: boolean;
  metadata?: {
    category?: string;
    uploadDate?: string;
  };
  createdAt: string;
  url?: string;
}

export interface AnythingLLMChatResponse {
  textResponse: string;
  id: string;
  type: 'abort' | 'textResponse';
  sources: Array<{
    title: string;
    chunk: string;
    score: number;
  }>;
  close: boolean;
  error?: string;
}

export interface AnythingLLMUploadResponse {
  success: boolean;
  filename: string;
  reason?: string;
  error?: string;
}

export interface AnythingLLMWorkspaceResponse {
  workspace: AnythingLLMWorkspace;
  message?: string;
  error?: string;
}

export interface AnythingLLMSystemInfo {
  version: string;
  storage: {
    used: number;
    total: number;
  };
  supportedFileTypes: string[];
}
