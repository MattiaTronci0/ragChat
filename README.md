# RAG Chat - Document Processing System

A React-based RAG (Retrieval-Augmented Generation) chat application with document upload functionality, Google Drive integration, and n8n automation for document processing.

## 🏗️ Architecture Overview

```
User uploads file → Frontend (React) → Backend (Express) → Google Drive → n8n Workflow → Vector Database → Chat System
```

### Components
- **Frontend**: React app with document management and chat interface
- **Backend**: Express.js server with Google Drive API integration
- **Google Drive**: Cloud storage for documents (with local fallback)
- **n8n Integration**: Workflow automation for document processing
- **Vector Database**: Stores document embeddings for RAG functionality

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Google Cloud Platform account (optional, for Google Drive integration)
- n8n instance running (for document processing)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ragChat
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

### Basic Setup (Local Storage)

1. **Start the backend server**
   ```bash
   cd backend
   npm start
   ```
   Server runs on `http://localhost:3001`

2. **Start the frontend** (in a new terminal)
   ```bash
   npm run dev
   ```
   App runs on `http://localhost:5173`

3. **Access the application**
   - Open `http://localhost:5173` in your browser
   - Navigate to the Documents page to upload files
   - Use the Chat page to interact with processed documents

### Google Drive Setup (Recommended)

For production use with Google Drive integration:

1. **Follow the Google Drive setup guide**: [`GOOGLE_DRIVE_SETUP.md`](GOOGLE_DRIVE_SETUP.md)
2. **Configure environment variables** in `backend/.env`
3. **Set up n8n Google Drive Trigger** for document processing
4. **Restart the backend** to enable Google Drive integration

## 📁 Project Structure

```
ragChat/
├── backend/                    # Express.js server
│   ├── server.js              # Main server file with Google Drive integration
│   ├── package.json           # Backend dependencies
│   ├── .env.example           # Environment variables template
│   ├── uploads/               # Local file storage (fallback)
│   └── metadata.json          # Document metadata storage
├── components/                # React components
│   ├── chat/                  # Chat interface components
│   ├── documents/             # Document management components
│   ├── history/               # Chat history components
│   ├── layout/                # Layout components
│   └── shared/                # Shared components
├── pages/                     # Page components
├── stores/                    # Zustand state management
├── types/                     # TypeScript type definitions
├── utils/                     # Utility functions
├── README.md                  # This file
└── GOOGLE_DRIVE_SETUP.md      # Google Drive setup guide
```

## 🔧 Backend API Endpoints

### File Upload
- **POST** `/api/documents/upload`
  - Accepts multipart/form-data
  - Saves files to Google Drive (or local storage as fallback)
  - Returns document ID and status

### Document Management
- **GET** `/api/documents/list` - List all uploaded documents
- **GET** `/api/documents/status/:id` - Check document processing status
- **DELETE** `/api/documents/:id` - Delete a document
- **GET** `/api/documents/:id/download` - Download a document

### Status Updates
- **POST** `/api/documents/:id/status` - Update document status (for n8n webhook)

### Health Check
- **GET** `/health` - Server health and status information

## 📊 Document Processing Flow

1. **Upload**: User drags and drops file in frontend
2. **Storage**: Backend saves file to `/backend/uploads/` folder
3. **Detection**: n8n monitors this folder for new files
4. **Processing**: n8n workflow processes the document:
   - Text extraction
   - Document chunking
   - Embedding generation
   - Vector database storage
5. **Status Update**: n8n calls webhook to update document status
6. **Ready**: Frontend shows document as "ready" for querying

## 🤖 n8n Integration

### Setup Requirements
1. **Configure n8n workflow** to monitor `/backend/uploads/` folder
2. **Set up Local File Trigger** node to watch for new files
3. **Create processing pipeline**:
   - Text extraction (PDF, DOC, etc.)
   - Document chunking
   - Embedding generation
   - Vector database storage
4. **Add webhook** to update document status via:
   ```
   POST http://localhost:3001/api/documents/{documentId}/status
   Body: { "status": "ready" }
   ```

### File Naming Convention
Uploaded files are saved with timestamp prefix:
```
uploads/1641234567890_document.pdf
```

## 🎨 Frontend Features

### Document Management
- **Drag & Drop Upload**: Intuitive file upload interface
- **Category Assignment**: Organize documents by category
- **Status Tracking**: Real-time processing status updates
- **Search & Filter**: Find documents by name or category
- **Preview & Download**: View and download processed documents

### Chat Interface
- **AI Assistant**: Chat with AI about uploaded documents
- **Context Aware**: Responses based on document content
- **Chat History**: Persistent conversation history
- **Dark/Light Mode**: Theme toggle support

### Processing Status
- **Uploading**: File being sent to server
- **Processing**: n8n workflow in progress
- **Indexed**: Document processed and indexed
- **Ready**: Available for chat queries
- **Error**: Processing failed

## 🔒 Security Features

- **File Type Validation**: Only allows specific document types
- **File Size Limits**: 10MB maximum file size
- **CORS Protection**: Configured for frontend domain
- **Input Sanitization**: Prevents malicious uploads

## 🛠️ Development

### Environment Variables
Create `.env.local` file for environment-specific settings:
```
REACT_APP_API_URL=http://localhost:3001
```

### Code Structure

#### State Management (Zustand)
- **Document Store**: Manages document state and operations
- **Chat Store**: Handles chat messages and history
- **Theme Store**: Manages dark/light mode
- **History Store**: Stores chat conversation history

#### API Client
- **DocumentAPI**: Handles all document-related API calls
- **Error Handling**: Comprehensive error handling and user feedback
- **Status Polling**: Automatic status updates for processing documents

## 📱 Usage Examples

### Upload a Document
1. Go to Documents page
2. Select category from dropdown
3. Drag & drop file or click to select
4. Monitor upload progress
5. Wait for processing to complete

### Chat with Documents
1. Upload and process documents
2. Go to Chat page
3. Ask questions about your documents
4. Get AI responses based on document content

### Manage Documents
- **Search**: Type in search box to find documents
- **Filter**: Select category to filter documents
- **Delete**: Click delete button to remove documents
- **Download**: Click download button to get original file

## 🔧 Troubleshooting

### Common Issues

1. **Backend not starting**
   - Check if port 3001 is available
   - Verify Node.js version (18+)
   - Run `npm install` in backend directory

2. **File uploads failing**
   - Check backend server is running
   - Verify CORS configuration
   - Check file size (must be < 10MB)

3. **Documents not processing**
   - Verify n8n workflow is running
   - Check n8n is monitoring `/backend/uploads/` folder
   - Verify webhook endpoint is configured

4. **Frontend not loading**
   - Check if port 5173 is available
   - Run `npm install` in root directory
   - Verify API URL in environment variables

### Debug Commands

```bash
# Check backend health
curl http://localhost:3001/health

# List documents
curl http://localhost:3001/api/documents/list

# Check uploads directory
ls -la backend/uploads/

# Check metadata
cat backend/metadata.json
```

## 🚀 Production Deployment

### Docker Deployment (Recommended)

For production deployment using Docker containers:

```bash
# Quick Docker deployment
git clone <repository-url>
cd ragChat
chmod +x deploy.sh
./deploy.sh
```

**Features:**
- ✅ Containerized frontend and backend
- ✅ Nginx reverse proxy with SSL support
- ✅ Automated deployment script
- ✅ Health monitoring and logging
- ✅ Persistent volume management
- ✅ n8n integration included

See **[DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md)** for detailed instructions.

### Manual VPS Setup

For manual deployment without Docker:

1. **Deploy backend** to VPS server
2. **Configure n8n** on same VPS
3. **Set up reverse proxy** (nginx/apache)
4. **Configure environment variables**
5. **Set up SSL certificates**

### Environment Configuration
```bash
# Production API URL
REACT_APP_API_URL=https://your-domain.com/api

# Backend port
PORT=3001

# Upload directory
UPLOAD_DIR=/var/www/uploads
```

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For questions or support:
- Check the troubleshooting section
- Review the API documentation
- Create an issue in the repository

---

**Note**: This is a development setup. For production use, implement proper authentication, rate limiting, and security measures.