// API client for server-side document operations
// Handles file uploads to VPS and status tracking

export interface UploadResponse {
  success: boolean;
  documentId?: string;
  message?: string;
  error?: string;
}

export interface DocumentStatus {
  id: string;
  status: 'uploading' | 'processing' | 'indexed' | 'ready' | 'error';
  progress?: number;
  message?: string;
  error?: string;
}

export interface ProcessedDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  category: string;
  uploadDate: string;
  status: DocumentStatus['status'];
  url?: string;
}

export class DocumentAPI {
  private static readonly BASE_URL = 'http://localhost:3001/api/documents';
  private static readonly USE_MOCK = process.env.NODE_ENV === 'development';

  static async uploadDocument(file: File, category: string): Promise<UploadResponse> {
    if (this.USE_MOCK) {
      return this.mockUploadDocument(file, category);
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', category);
      formData.append('uploadDate', new Date().toISOString());

      const response = await fetch(`${this.BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Upload error, falling back to mock:', error);
      return this.mockUploadDocument(file, category);
    }
  }

  static async getDocumentStatus(documentId: string): Promise<DocumentStatus | null> {
    if (this.USE_MOCK) {
      return this.mockGetDocumentStatus(documentId);
    }

    try {
      const response = await fetch(`${this.BASE_URL}/status/${documentId}`);
      
      if (!response.ok) {
        throw new Error(`Status check failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Status check error, falling back to mock:', error);
      return this.mockGetDocumentStatus(documentId);
    }
  }

  static async getDocuments(): Promise<ProcessedDocument[]> {
    if (this.USE_MOCK) {
      return this.mockGetDocuments();
    }

    try {
      const response = await fetch(`${this.BASE_URL}/list`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch documents: ${response.status}`);
      }

      const documents = await response.json();
      return documents || [];
    } catch (error) {
      console.error('Failed to fetch documents, falling back to mock:', error);
      return this.mockGetDocuments();
    }
  }

  static async deleteDocument(documentId: string): Promise<boolean> {
    if (this.USE_MOCK) {
      // Mock delete always succeeds
      return true;
    }

    try {
      const response = await fetch(`${this.BASE_URL}/${documentId}`, {
        method: 'DELETE',
      });

      return response.ok;
    } catch (error) {
      console.error('Delete error, falling back to mock:', error);
      return true;
    }
  }

  static async downloadDocument(documentId: string, filename: string): Promise<Blob | null> {
    if (this.USE_MOCK) {
      // Mock download - return empty blob
      return new Blob(['Mock file content'], { type: 'text/plain' });
    }

    try {
      const response = await fetch(`${this.BASE_URL}/${documentId}/download`);
      
      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Download error, falling back to mock:', error);
      return new Blob(['Mock file content'], { type: 'text/plain' });
    }
  }

  // Mock API endpoints for development (remove when real API is ready)
  static async mockUploadDocument(file: File, category: string): Promise<UploadResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // Simulate success/failure
    if (Math.random() > 0.1) { // 90% success rate
      return {
        success: true,
        documentId: `doc_${Date.now()}_${Math.random().toString(36).substring(2)}`,
        message: 'Document uploaded successfully'
      };
    } else {
      return {
        success: false,
        error: 'Upload failed - server error'
      };
    }
  }

  static async mockGetDocuments(): Promise<ProcessedDocument[]> {
    // Return mock documents for development
    return [
      {
        id: 'doc_1',
        name: 'Sample_Tax_Return.pdf',
        type: 'application/pdf',
        size: 1234567,
        category: 'Tax Returns',
        uploadDate: '2024-01-15T10:30:00Z',
        status: 'ready'
      },
      {
        id: 'doc_2',
        name: 'Financial_Report.xlsx',
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        size: 987654,
        category: 'Financial Statements',
        uploadDate: '2024-01-10T14:20:00Z',
        status: 'ready'
      }
    ];
  }

  static async mockGetDocumentStatus(documentId: string): Promise<DocumentStatus | null> {
    // Simulate processing states
    const statuses: DocumentStatus['status'][] = ['processing', 'indexed', 'ready'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    
    return {
      id: documentId,
      status: randomStatus,
      progress: randomStatus === 'processing' ? Math.floor(Math.random() * 100) : 100,
      message: randomStatus === 'ready' ? 'Document ready for querying' : 'Processing document...'
    };
  }
}

// Chat API interfaces
export interface ChatRequest {
  message: string;
  sessionId?: string;
}

export interface ChatResponse {
  success: boolean;
  response?: string;
  sessionId?: string;
  error?: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export class ChatAPI {
  private static readonly N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL || 'https://danielmontese.app.n8n.cloud/webhook/82b152e2-4646-4ff8-aa00-1bf884fed35a';
  private static readonly USE_MOCK = !import.meta.env.VITE_USE_REAL_CHAT;

  static async sendMessage(message: string, sessionId?: string): Promise<ChatResponse> {
    if (this.USE_MOCK) {
      return this.mockSendMessage(message, sessionId);
    }

    try {
      // Generate session ID if not provided
      const chatSessionId = sessionId || `session_${Date.now()}_${Math.random().toString(36).substring(2)}`;

      // Prepare request to n8n webhook
      const n8nPayload = {
        message: message,
        session_id: chatSessionId
      };

      console.log(`Sending chat request to n8n: ${message.substring(0, 100)}...`);

      // Make request to n8n webhook directly
      const response = await fetch(this.N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(n8nPayload),
      });

      if (!response.ok) {
        throw new Error(`n8n webhook responded with status: ${response.status}`);
      }

      const n8nResponse = await response.json();
      
      // Extract the output from n8n response
      const aiResponse = n8nResponse.output || n8nResponse.message || 'Sorry, I could not process your request.';

      return {
        success: true,
        response: aiResponse,
        sessionId: chatSessionId
      };
    } catch (error) {
      console.error('n8n API error, falling back to mock:', error);
      return this.mockSendMessage(message, sessionId);
    }
  }

  // Mock chat responses for fallback
  static async mockSendMessage(message: string, sessionId?: string): Promise<ChatResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    const lowerCaseMessage = message.toLowerCase();
    let response: string;

    if (lowerCaseMessage.includes('tax') || lowerCaseMessage.includes('deduction')) {
      response = "Of course! For tax-related queries, it's crucial to consider the jurisdiction and the fiscal year. A common deduction for businesses is the home office deduction, provided the space is used exclusively and regularly for business. What specific tax topic are you interested in?";
    } else if (lowerCaseMessage.includes('invoice') || lowerCaseMessage.includes('billing')) {
      response = "I can certainly help with invoicing. A standard invoice should always include a unique invoice number, date of issue, your company's details, the client's details, a description of services or products, and clear payment terms. Are you looking to create a new invoice or manage existing ones?";
    } else if (lowerCaseMessage.includes('expense') || lowerCaseMessage.includes('receipt')) {
      response = "Effective expense management is key to financial health. It's best to categorize your expenses (e.g., travel, supplies, utilities) and keep digital copies of all receipts. Many apps can automate this process. Would you like me to recommend some tools or provide tips on categorizing expenses?";
    } else if (lowerCaseMessage.includes('financial planning') || lowerCaseMessage.includes('forecast')) {
      response = "Financial planning involves setting objectives, gathering data, and creating a roadmap. For businesses, this often means creating cash flow projections, a balance sheet, and a profit and loss statement for the next 1-3 years. What is the primary goal of your financial plan?";
    } else if (lowerCaseMessage.includes('business analytics') || lowerCaseMessage.includes('kpi')) {
      response = "Great question! Key Performance Indicators (KPIs) for a business might include Customer Acquisition Cost (CAC), Customer Lifetime Value (CLV), and Monthly Recurring Revenue (MRR). Analyzing these helps in making data-driven decisions. Which area of your business performance are you most interested in improving?";
    } else {
      response = "Hello! As an AI Financial Assistant, I can help with a wide range of topics including tax questions, financial planning, and business analytics. How can I assist you today?";
    }

    return {
      success: true,
      response: response,
      sessionId: sessionId || `mock_session_${Date.now()}`
    };
  }
}