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
  private static readonly BASE_URL = import.meta.env.VITE_ANYTHINGLLM_URL || 'http://localhost:3001/api/v1';
  private static readonly API_KEY = import.meta.env.VITE_ANYTHINGLLM_API_KEY || 'ETVXYEN-K9CMYY4-K3X6WRJ-XSS8SXQ';
  private static readonly WORKSPACE = import.meta.env.VITE_ANYTHINGLLM_WORKSPACE || 'prova';
  private static readonly USE_MOCK = false;

  private static getHeaders(): HeadersInit {
    return {
      'Authorization': `Bearer ${this.API_KEY}`,
      'Accept': 'application/json'
    };
  }

  static async uploadDocument(file: File, category: string): Promise<UploadResponse> {
    // Valida dimensione file (limite 100MB)
    if (file.size > 100 * 1024 * 1024) {
      return {
        success: false,
        error: 'File troppo grande. Dimensione massima 100MB.'
      };
    }

    // Valida tipo file
    const allowedTypes = /\.(pdf|doc|docx|txt|xlsx|xls|png|jpg|jpeg|gif|csv|json|xml|html|md|rtf)$/i;
    if (!allowedTypes.test(file.name)) {
      return {
        success: false,
        error: 'Tipo di file non valido. Sono consentiti solo documenti e immagini.'
      };
    }

    const maxRetries = 3;
    let lastError;

    for (let i = 0; i < maxRetries; i++) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('addToWorkspaces', this.WORKSPACE);

        const response = await fetch(`${this.BASE_URL}/document/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.API_KEY}`
          },
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Upload failed: ${response.status}`);
        }

        const result = await response.json();
        return {
          success: result.success,
          documentId: result.documents?.[0]?.id,
          message: 'Document uploaded successfully'
        };
      } catch (error: any) {

        lastError = error;
        
        // Non riprovare su errori client o errori di validazione
        if (error.message && (error.message.includes('Tipo di file non valido') || error.message.includes('File troppo grande'))) {
          break;
        }
        
        // Riprova su errori di rete
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
          continue;
        }
      }
    }

    throw new Error(`Upload failed after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`);
  }

  static async getDocumentStatus(documentId: string): Promise<DocumentStatus | null> {
    try {
      const response = await fetch(`${this.BASE_URL}/workspace/${this.WORKSPACE}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`Status check failed: ${response.status}`);
      }

      const data = await response.json();
      const documents = data.workspace?.[0]?.documents || [];
      const document = documents.find(doc => doc.docpath && doc.docpath.includes(documentId));
      
      if (!document) return null;
      
      return {
        id: documentId,
        status: document.cached ? 'ready' : 'processing',
        progress: document.cached ? 100 : 50,
        message: document.cached ? 'Document ready for querying' : 'Processing document...'
      };
    } catch (error) {
      console.error('Status check error:', error);
      throw error;
    }
  }

  static async getDocuments(): Promise<ProcessedDocument[]> {
    try {
      const response = await fetch(`${this.BASE_URL}/workspace/${this.WORKSPACE}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch documents: ${response.status}`);
      }

      const data = await response.json();
      const documents = data.workspace?.[0]?.documents || [];
      
      return documents.map(doc => ({
        id: doc.docpath || doc.id,
        name: JSON.parse(doc.metadata || '{}').title || doc.filename,
        type: doc.mime || 'application/octet-stream',
        size: JSON.parse(doc.metadata || '{}').wordCount || 0,
        category: 'Other',
        uploadDate: doc.createdAt || new Date().toISOString(),
        status: 'ready'
      }));
    } catch (error) {
      console.error('Failed to fetch documents:', error);
      throw error;
    }
  }

  static async deleteDocument(documentId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.BASE_URL}/workspace/${this.WORKSPACE}/update-embeddings`, {
        method: 'POST',
        headers: {
          ...this.getHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          deletes: [documentId]
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Delete error:', error);
      throw error;
    }
  }

  static async downloadDocument(documentId: string, filename: string): Promise<Blob | null> {
    try {
      // AnythingLLM doesn't provide direct document download, 
      // so we'll return a simple text representation
      const response = await fetch(`${this.BASE_URL}/system/local-files`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`);
      }

      // This is a simplified approach - in practice, you might want to 
      // extract text content from the document for download
      return new Blob([`Document: ${filename}\nContent available through chat interface only.`], { 
        type: 'text/plain' 
      });
    } catch (error) {
      console.error('Download error:', error);
      throw error;
    }
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
  private static readonly BASE_URL = import.meta.env.VITE_ANYTHINGLLM_URL || 'http://localhost:3001/api/v1';
  private static readonly API_KEY = import.meta.env.VITE_ANYTHINGLLM_API_KEY || 'ETVXYEN-K9CMYY4-K3X6WRJ-XSS8SXQ';
  private static readonly WORKSPACE = import.meta.env.VITE_ANYTHINGLLM_WORKSPACE || 'prova';
  private static readonly USE_MOCK = false;

  private static getHeaders(): HeadersInit {
    return {
      'Authorization': `Bearer ${this.API_KEY}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  static async sendMessage(message: string, sessionId?: string): Promise<ChatResponse> {
    try {
      const response = await fetch(`${this.BASE_URL}/workspace/${this.WORKSPACE}/chat`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          message: message,
          mode: 'chat',
          sessionId: sessionId || `session_${Date.now()}_${Math.random().toString(36).substring(2)}`
        }),
      });

      if (!response.ok) {
        throw new Error(`Chat API responded with status: ${response.status}`);
      }

      const result = await response.json();
      return {
        success: true,
        response: result.textResponse || result.response || 'Sorry, I could not process your request.',
        sessionId: sessionId || `session_${Date.now()}_${Math.random().toString(36).substring(2)}`
      };
    } catch (error) {
      console.error('Chat API error:', error);
      throw error;
    }
  }
}