const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const FormData = require('form-data');

const app = express();
const PORT = process.env.PORT || 3002;

// Fiducia del proxy per il rilevamento corretto dell'IP dietro nginx
app.set('trust proxy', 1);

// Middleware di sicurezza
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost',
  credentials: true
}));

// Limitazione del tasso
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuti
  max: 100, // limita ogni IP a 100 richieste per windowMs
  message: 'Troppe richieste da questo IP, riprova più tardi.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', limiter);

// Parsing del body
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configurazione caricamento file
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // limite 100MB
  },
  fileFilter: (req, file, cb) => {
    // Consenti tipi di documento comuni
    const allowedTypes = /\.(pdf|doc|docx|txt|xlsx|xls|png|jpg|jpeg|gif|csv|json|xml|html|md|rtf)$/i;
    if (allowedTypes.test(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo di file non valido. Sono consentiti solo documenti e immagini.'));
    }
  }
});

// Configurazione AnythingLLM
const ANYTHINGLLM_BASE_URL = process.env.ANYTHINGLLM_BASE_URL || 'http://anythingllm:3001';
const ANYTHINGLLM_API_KEY = process.env.ANYTHINGLLM_API_KEY;
const ANYTHINGLLM_WORKSPACE = process.env.ANYTHINGLLM_WORKSPACE || 'default-workspace';

// Middleware di validazione
const validateApiKey = (req, res, next) => {
  if (!ANYTHINGLLM_API_KEY || ANYTHINGLLM_API_KEY === 'your-api-key-will-be-generated-after-first-setup') {
    return res.status(500).json({ 
      success: false, 
      error: 'Chiave API AnythingLLM non configurata' 
    });
  }
  next();
};

// Funzione helper per fare richieste a AnythingLLM
async function makeAnythingLLMRequest(endpoint, options = {}) {
  const url = `${ANYTHINGLLM_BASE_URL}${endpoint}`;
  const headers = {
    'Authorization': `Bearer ${ANYTHINGLLM_API_KEY}`,
    'Accept': 'application/json',
    ...options.headers
  };

  const maxRetries = 3;
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers,
        timeout: 30000 // 30 second timeout
      });

      if (!response.ok) {
        const errorText = await response.text();
        
        // Non riprovare su errori client (4xx)
        if (response.status >= 400 && response.status < 500) {
          throw new Error(`Errore API AnythingLLM: ${response.status} - ${errorText}`);
        }
        
        // Riprova su errori server (5xx)
        if (i === maxRetries - 1) {
          throw new Error(`Errore API AnythingLLM: ${response.status} - ${errorText}`);
        }
        
        // Attendi prima di riprovare (backoff esponenziale)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        continue;
      }

      return response.json();
    } catch (error) {
      lastError = error;
      
      // Non riprovare su errori di rete se è l'ultimo tentativo
      if (i === maxRetries - 1) {
        throw error;
      }
      
      // Attendi prima di riprovare
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }

  throw lastError;
}

// Endpoint controllo salute
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    anythingllm_configured: !!ANYTHINGLLM_API_KEY && ANYTHINGLLM_API_KEY !== 'your-api-key-will-be-generated-after-first-setup'
  });
});

// Endpoint caricamento documenti
app.post('/api/documents/upload', 
  validateApiKey, 
  upload.single('file'),
  [
    body('category').optional().isString().trim().isLength({ min: 1, max: 50 }),
  ],
  async (req, res) => {
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid input data',
          details: errors.array()
        });
      }

      if (!req.file) {
        return res.status(400).json({ 
          success: false, 
          error: 'No file uploaded' 
        });
      }

      const category = req.body.category || 'Other';

      // Create FormData for AnythingLLM API
      const formData = new FormData();
      formData.append('file', req.file.buffer, {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
      });
      formData.append('addToWorkspaces', ANYTHINGLLM_WORKSPACE);

      // Upload to AnythingLLM using proper FormData
      const uploadResult = await makeAnythingLLMRequest('/api/v1/document/upload', {
        method: 'POST',
        body: formData,
        headers: {
          ...formData.getHeaders(),
        }
      });

      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Upload failed');
      }

      // Document is automatically added to workspace via addToWorkspaces parameter
      const document = uploadResult.documents[0];
      
      res.json({
        success: true,
        documentId: document.id,
        message: 'Document uploaded and added to workspace successfully',
        document: {
          id: document.id,
          name: document.title,
          location: document.location,
          wordCount: document.wordCount,
          tokenCount: document.token_count_estimate
        }
      });

    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Upload failed',
        details: error.message 
      });
    }
  }
);

// Get documents endpoint
app.get('/api/documents', validateApiKey, async (req, res) => {
  try {
    const workspaceData = await makeAnythingLLMRequest(`/api/v1/workspace/${ANYTHINGLLM_WORKSPACE}`);
    const documents = workspaceData.workspace?.documents || [];
    
    const processedDocuments = documents.map(doc => ({
      id: doc.filename || doc.id,
      name: doc.title || doc.filename,
      type: doc.mime || 'application/octet-stream',
      size: doc.size || 0,
      category: doc.metadata?.category || 'Other',
      uploadDate: doc.metadata?.uploadDate || doc.createdAt || new Date().toISOString(),
      status: doc.cached ? 'ready' : 'processing',
      url: doc.url
    }));

    res.json(processedDocuments);
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch documents',
      details: error.message 
    });
  }
});

// Get document status endpoint
app.get('/api/documents/:id/status', validateApiKey, async (req, res) => {
  try {
    const { id } = req.params;
    
    const workspaceData = await makeAnythingLLMRequest(`/api/v1/workspace/${ANYTHINGLLM_WORKSPACE}`);
    const documents = workspaceData.workspace?.documents || [];
    
    const document = documents.find(doc => doc.docpath && doc.docpath.includes(id));
    
    if (!document) {
      return res.status(404).json({ 
        success: false, 
        error: 'Document not found' 
      });
    }

    res.json({
      id: id,
      status: document.cached ? 'ready' : 'processing',
      progress: document.cached ? 100 : 50,
      message: document.cached ? 'Document ready for querying' : 'Processing document...'
    });
  } catch (error) {
    console.error('Get document status error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to check document status',
      details: error.message 
    });
  }
});

// Delete document endpoint
app.delete('/api/documents/:id', validateApiKey, async (req, res) => {
  try {
    const { id } = req.params;
    
    // First, get the document details to find its system name
    const workspaceData = await makeAnythingLLMRequest(`/api/v1/workspace/${ANYTHINGLLM_WORKSPACE}`);
    const documents = workspaceData.workspace?.documents || [];
    
    const document = documents.find(doc => doc.docpath && doc.docpath.includes(id));
    
    if (!document) {
      return res.status(404).json({ 
        success: false, 
        error: 'Document not found' 
      });
    }

    // Use the workspace embeddings update endpoint with deletes parameter
    await makeAnythingLLMRequest(`/api/v1/workspace/${ANYTHINGLLM_WORKSPACE}/update-embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        deletes: [document.docpath]
      })
    });

    res.json({ 
      success: true, 
      message: 'Document deleted successfully' 
    });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete document',
      details: error.message 
    });
  }
});

// Chat endpoint
app.post('/api/chat', 
  validateApiKey,
  [
    body('message').isString().trim().isLength({ min: 1, max: 4000 }),
    body('sessionId').optional().isString().trim().isLength({ min: 1, max: 100 }),
  ],
  async (req, res) => {
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid input data',
          details: errors.array()
        });
      }

      const { message, sessionId } = req.body;
      const chatSessionId = sessionId || `session_${Date.now()}_${Math.random().toString(36).substring(2)}`;

      const chatResponse = await makeAnythingLLMRequest(`/api/v1/workspace/${ANYTHINGLLM_WORKSPACE}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          mode: 'chat',
          sessionId: chatSessionId
        })
      });

      const aiResponse = chatResponse.textResponse || chatResponse.response || 'Sorry, I could not process your request.';

      res.json({
        success: true,
        response: aiResponse,
        sessionId: chatSessionId
      });

    } catch (error) {
      console.error('Chat error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Chat request failed',
        details: error.message 
      });
    }
  }
);

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File too large. Maximum size is 100MB.'
      });
    }
  }
  
  console.error('Server error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`Server API Proxy in esecuzione sulla porta ${PORT}`);
  console.log(`AnythingLLM configurato: ${!!ANYTHINGLLM_API_KEY && ANYTHINGLLM_API_KEY !== 'your-api-key-will-be-generated-after-first-setup'}`);
  console.log(`Controllo salute: http://localhost:${PORT}/health`);
});