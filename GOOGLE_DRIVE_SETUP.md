# Google Drive Integration Setup Guide

This guide will help you configure Google Drive integration for your RAG Chat application.

## 🚀 Quick Overview

With Google Drive integration, your uploaded documents will be:
- **Stored in Google Drive** instead of local VPS storage
- **Monitored by n8n** using Google Drive Trigger node
- **Accessible from anywhere** via Google Drive
- **Automatically backed up** by Google's infrastructure

## 📋 Prerequisites

- Google Cloud Platform account
- Access to Google Drive
- n8n instance (for document processing)

## 🔧 Step 1: Google Cloud Project Setup

### 1.1 Create a New Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name (e.g., "ragchat-drive")
4. Click "Create"

### 1.2 Enable Google Drive API

1. In the Google Cloud Console, go to **APIs & Services** → **Library**
2. Search for "Google Drive API"
3. Click on "Google Drive API" and click **Enable**

### 1.3 Create Service Account

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **Service Account**
3. Enter service account details:
   - **Name**: `ragchat-drive-service`
   - **Description**: `Service account for RAG Chat Google Drive integration`
4. Click **Create and Continue**
5. Skip role assignment for now (click **Continue** then **Done**)

### 1.4 Generate Service Account Key

1. Click on the newly created service account
2. Go to **Keys** tab
3. Click **Add Key** → **Create New Key**
4. Select **JSON** format
5. Click **Create** and download the JSON file
6. **Keep this file secure** - it contains your credentials

## 📁 Step 2: Google Drive Setup

### 2.1 Create Documents Folder

1. Go to [Google Drive](https://drive.google.com/)
2. Create a new folder (e.g., "RAG Chat Documents")
3. Right-click the folder → **Get link**
4. Copy the folder ID from the URL:
   ```
   https://drive.google.com/drive/folders/[FOLDER_ID]
   ```

### 2.2 Share Folder with Service Account

1. Right-click the folder → **Share**
2. Enter the service account email (from the JSON file: `client_email` field)
3. Set permission to **Editor**
4. Click **Share**

## ⚙️ Step 3: Backend Configuration

### 3.1 Install Dependencies

```bash
cd backend
npm install googleapis multer-drive
```

### 3.2 Set Environment Variables

Create a `.env` file in the `backend` directory:

```bash
# Google Drive Configuration
GOOGLE_DRIVE_FOLDER_ID=your-folder-id-from-step-2.1
GOOGLE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"

# Server Configuration
PORT=3001
```

### 3.3 Configure Private Key

From your downloaded JSON file, copy the `private_key` field:

```json
{
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
}
```

**Important**: Replace `\n` with actual newlines in the `.env` file, or keep them as `\n` (the code handles both).

## 🤖 Step 4: n8n Configuration

### 4.1 Add Google Drive Trigger Node

1. Create a new workflow in n8n
2. Add **Google Drive Trigger** node
3. Configure authentication:
   - **Authentication**: Service Account
   - **Service Account Email**: Same as in your `.env` file
   - **Private Key**: Same as in your `.env` file

### 4.2 Configure Trigger Settings

1. **Trigger On**: `File Created`
2. **Drive**: Select your Google Drive account
3. **Folder**: Select the folder you created (or use folder ID)
4. **Watch For**: `File Created` and `File Updated`

### 4.3 Add Processing Pipeline

Create your document processing workflow:

```
Google Drive Trigger → Text Extraction → Chunking → Vectorization → Database Storage → Webhook
```

### 4.4 Add Status Update Webhook

Add an HTTP Request node at the end of your workflow:

```
Method: POST
URL: http://localhost:3001/api/documents/{document_id}/status
Headers: Content-Type: application/json
Body: { "status": "ready" }
```

## 🧪 Step 5: Testing

### 5.1 Test Backend Connection

```bash
cd backend
npm start
```

Check the health endpoint:
```bash
curl http://localhost:3001/health
```

You should see:
```json
{
  "status": "ok",
  "googleDriveEnabled": true,
  "googleDriveFolderId": "your-folder-id"
}
```

### 5.2 Test File Upload

1. Start your frontend: `npm run dev`
2. Go to Documents page
3. Upload a test file
4. Check your Google Drive folder - the file should appear
5. Check n8n - the workflow should trigger

## 🔍 Troubleshooting

### Common Issues

#### 1. "Google Drive credentials not found"
- Check your `.env` file exists in the `backend` directory
- Verify all environment variables are set correctly
- Ensure private key format is correct

#### 2. "Permission denied" errors
- Verify the service account has access to the folder
- Check that the folder is shared with the service account email
- Ensure the service account has "Editor" permissions

#### 3. "Folder not found"
- Verify the `GOOGLE_DRIVE_FOLDER_ID` is correct
- Check that the folder exists and is accessible
- Ensure the folder is not in the trash

#### 4. n8n workflow not triggering
- Check that the Google Drive Trigger node is properly configured
- Verify the service account credentials in n8n
- Ensure the workflow is active (not paused)

### Debug Commands

```bash
# Check server logs
npm start

# Test API health
curl http://localhost:3001/health

# Check if file was uploaded
curl http://localhost:3001/api/documents/list

# Check Google Drive folder directly
# Go to https://drive.google.com/drive/folders/YOUR_FOLDER_ID
```

## 📊 Benefits After Setup

Once configured, you'll have:

✅ **Unlimited Storage**: No VPS storage limitations
✅ **Automatic Backup**: Google's infrastructure reliability
✅ **Easy Access**: Files accessible from Google Drive UI
✅ **Team Collaboration**: Share folders with team members
✅ **Version History**: Google Drive's built-in version control
✅ **Mobile Access**: Access files from mobile devices
✅ **Cost Effective**: No additional storage costs on VPS

## 🔒 Security Notes

- **Never commit** your service account JSON file to version control
- **Use environment variables** for all sensitive data
- **Regularly rotate** service account keys
- **Monitor access logs** in Google Cloud Console
- **Set appropriate permissions** on shared folders

## 🚀 Production Deployment

For production deployment:

1. **Use secrets management** (like AWS Secrets Manager or HashiCorp Vault)
2. **Set up monitoring** for Google Drive API usage
3. **Configure rate limiting** to avoid API quotas
4. **Use different folders** for different environments
5. **Set up alerting** for upload failures

---

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify your Google Cloud project settings
3. Test the Google Drive API connection manually
4. Review server logs for detailed error messages

With this setup, your RAG Chat application will use Google Drive for scalable, reliable document storage with seamless n8n integration!