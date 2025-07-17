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
  private static readonly BASE_URL = '/api/documents';

  static async uploadDocument(file: File, category: string): Promise<UploadResponse> {
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
      console.error('Upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  }

  static async getDocumentStatus(documentId: string): Promise<DocumentStatus | null> {
    try {
      const response = await fetch(`${this.BASE_URL}/status/${documentId}`);
      
      if (!response.ok) {
        throw new Error(`Status check failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Status check error:', error);
      return null;
    }
  }

  static async getDocuments(): Promise<ProcessedDocument[]> {
    try {
      const response = await fetch(`${this.BASE_URL}/list`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch documents: ${response.status}`);
      }

      const documents = await response.json();
      return documents || [];
    } catch (error) {
      console.error('Failed to fetch documents:', error);
      return [];
    }
  }

  static async deleteDocument(documentId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.BASE_URL}/${documentId}`, {
        method: 'DELETE',
      });

      return response.ok;
    } catch (error) {
      console.error('Delete error:', error);
      return false;
    }
  }

  static async downloadDocument(documentId: string, filename: string): Promise<Blob | null> {
    try {
      const response = await fetch(`${this.BASE_URL}/${documentId}/download`);
      
      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Download error:', error);
      return null;
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