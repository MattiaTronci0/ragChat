const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Google Drive configuration
const GOOGLE_DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID || 'your-folder-id';
const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n') : null;
const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;

// Initialize Google Drive API
let drive;
try {
  if (GOOGLE_PRIVATE_KEY && GOOGLE_CLIENT_EMAIL) {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        type: 'service_account',
        private_key: GOOGLE_PRIVATE_KEY,
        client_email: GOOGLE_CLIENT_EMAIL,
      },
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });

    drive = google.drive({ version: 'v3', auth });
    console.log('Google Drive API initialized successfully');
  } else {
    console.warn('Google Drive credentials not found, falling back to local storage');
  }
} catch (error) {
  console.error('Failed to initialize Google Drive API:', error);
}

// Metadata file for local fallback
const METADATA_FILE = path.join(__dirname, 'metadata.json');
const UPLOAD_DIR = path.join(__dirname, 'uploads');

// Create directories and files if they don't exist
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

if (!fs.existsSync(METADATA_FILE)) {
  fs.writeFileSync(METADATA_FILE, JSON.stringify([], null, 2));
}

// Helper functions
function readMetadata() {
  try {
    const data = fs.readFileSync(METADATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

function writeMetadata(data) {
  fs.writeFileSync(METADATA_FILE, JSON.stringify(data, null, 2));
}

function generateId() {
  return Date.now().toString() + Math.random().toString(36).substring(2);
}

// Google Drive upload function
async function uploadToGoogleDrive(file, originalName) {
  try {
    const fileMetadata = {
      name: `${Date.now()}_${originalName}`,
      parents: [GOOGLE_DRIVE_FOLDER_ID],
    };

    const media = {
      mimeType: file.mimetype,
      body: fs.createReadStream(file.path),
    };

    const response = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id, name, size, mimeType, createdTime',
    });

    // Clean up local temp file
    fs.unlinkSync(file.path);

    return response.data;
  } catch (error) {
    console.error('Error uploading to Google Drive:', error);
    throw error;
  }
}

// Google Drive download function
async function downloadFromGoogleDrive(fileId) {
  try {
    const response = await drive.files.get({
      fileId: fileId,
      alt: 'media',
    });

    return response.data;
  } catch (error) {
    console.error('Error downloading from Google Drive:', error);
    throw error;
  }
}

// Google Drive delete function
async function deleteFromGoogleDrive(fileId) {
  try {
    await drive.files.delete({
      fileId: fileId,
    });
    return true;
  } catch (error) {
    console.error('Error deleting from Google Drive:', error);
    throw error;
  }
}

// Google Drive list function
async function listGoogleDriveFiles() {
  try {
    const response = await drive.files.list({
      q: `'${GOOGLE_DRIVE_FOLDER_ID}' in parents and trashed=false`,
      fields: 'files(id, name, size, mimeType, createdTime)',
      orderBy: 'createdTime desc',
    });

    return response.data.files || [];
  } catch (error) {
    console.error('Error listing Google Drive files:', error);
    throw error;
  }
}

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    // Generate unique filename for temp storage
    const uniqueName = `temp_${Date.now()}_${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common document types
    const allowedTypes = /\.(pdf|doc|docx|txt|xlsx|xls|png|jpg|jpeg|gif)$/i;
    if (allowedTypes.test(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Routes

// Upload file
app.post('/api/documents/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const metadata = readMetadata();
    const documentId = generateId();
    let fileData;

    if (drive) {
      // Upload to Google Drive
      try {
        fileData = await uploadToGoogleDrive(req.file, req.file.originalname);
        console.log(`File uploaded to Google Drive: ${req.file.originalname} -> ${fileData.name}`);
      } catch (error) {
        console.error('Google Drive upload failed, falling back to local storage:', error);
        // Keep the file locally as fallback
        fileData = {
          id: documentId,
          name: req.file.filename,
          size: req.file.size,
          mimeType: req.file.mimetype,
          createdTime: new Date().toISOString(),
          isLocal: true
        };
      }
    } else {
      // Local storage fallback
      fileData = {
        id: documentId,
        name: req.file.filename,
        size: req.file.size,
        mimeType: req.file.mimetype,
        createdTime: new Date().toISOString(),
        isLocal: true
      };
    }

    const newDocument = {
      id: documentId,
      name: req.file.originalname,
      fileName: fileData.name,
      googleDriveId: fileData.isLocal ? null : fileData.id,
      filePath: fileData.isLocal ? req.file.path : null,
      type: req.file.mimetype,
      size: parseInt(fileData.size) || req.file.size,
      category: req.body.category || 'Other',
      uploadDate: fileData.createdTime || new Date().toISOString(),
      status: 'processing',
      isLocal: fileData.isLocal || false
    };

    metadata.push(newDocument);
    writeMetadata(metadata);

    res.json({
      success: true,
      documentId: documentId,
      message: fileData.isLocal ? 'Document uploaded to local storage' : 'Document uploaded to Google Drive successfully'
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get document status
app.get('/api/documents/status/:id', (req, res) => {
  try {
    const metadata = readMetadata();
    const document = metadata.find(doc => doc.id === req.params.id);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    res.json({
      id: document.id,
      status: document.status,
      message: document.status === 'ready' ? 'Document ready for querying' : 'Processing document...'
    });

  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// List all documents
app.get('/api/documents/list', async (req, res) => {
  try {
    const metadata = readMetadata();
    
    // If we have Google Drive, we could also sync with Google Drive files
    // For now, we'll use the local metadata
    const documents = metadata.map(doc => ({
      id: doc.id,
      name: doc.name,
      type: doc.type,
      size: doc.size,
      category: doc.category,
      uploadDate: doc.uploadDate,
      status: doc.status,
      isLocal: doc.isLocal
    }));

    res.json(documents);

  } catch (error) {
    console.error('List error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Delete document
app.delete('/api/documents/:id', async (req, res) => {
  try {
    const metadata = readMetadata();
    const docIndex = metadata.findIndex(doc => doc.id === req.params.id);
    
    if (docIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    const document = metadata[docIndex];
    
    if (document.isLocal) {
      // Delete local file
      if (document.filePath && fs.existsSync(document.filePath)) {
        fs.unlinkSync(document.filePath);
      }
    } else if (document.googleDriveId && drive) {
      // Delete from Google Drive
      try {
        await deleteFromGoogleDrive(document.googleDriveId);
        console.log(`Document deleted from Google Drive: ${document.name}`);
      } catch (error) {
        console.error('Failed to delete from Google Drive:', error);
      }
    }

    // Remove from metadata
    metadata.splice(docIndex, 1);
    writeMetadata(metadata);

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });

  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Download document
app.get('/api/documents/:id/download', async (req, res) => {
  try {
    const metadata = readMetadata();
    const document = metadata.find(doc => doc.id === req.params.id);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    res.setHeader('Content-Disposition', `attachment; filename="${document.name}"`);
    res.setHeader('Content-Type', document.type);

    if (document.isLocal) {
      // Download local file
      if (!fs.existsSync(document.filePath)) {
        return res.status(404).json({
          success: false,
          error: 'File not found on disk'
        });
      }
      
      const fileStream = fs.createReadStream(document.filePath);
      fileStream.pipe(res);
    } else if (document.googleDriveId && drive) {
      // Download from Google Drive
      try {
        const response = await drive.files.get({
          fileId: document.googleDriveId,
          alt: 'media',
        });
        
        response.data.pipe(res);
      } catch (error) {
        console.error('Google Drive download error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to download from Google Drive'
        });
      }
    } else {
      res.status(404).json({
        success: false,
        error: 'File not accessible'
      });
    }

  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update document status (for n8n webhook)
app.post('/api/documents/:id/status', (req, res) => {
  try {
    const metadata = readMetadata();
    const docIndex = metadata.findIndex(doc => doc.id === req.params.id);
    
    if (docIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    metadata[docIndex].status = req.body.status || 'ready';
    writeMetadata(metadata);

    console.log(`Document status updated: ${req.params.id} -> ${req.body.status}`);

    res.json({
      success: true,
      message: 'Status updated successfully'
    });

  } catch (error) {
    console.error('Status update error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    googleDriveEnabled: !!drive,
    googleDriveFolderId: GOOGLE_DRIVE_FOLDER_ID,
    uploadsDir: UPLOAD_DIR,
    documentsCount: readMetadata().length
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File too large. Maximum size is 10MB.'
      });
    }
  }
  
  console.error('Server error:', error);
  res.status(500).json({
    success: false,
    error: error.message
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Google Drive integration: ${drive ? 'ENABLED' : 'DISABLED (using local storage)'}`);
  console.log(`Upload directory: ${UPLOAD_DIR}`);
  console.log(`Metadata file: ${METADATA_FILE}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});