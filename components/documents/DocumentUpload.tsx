
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useDocumentStore } from '../../stores/documentStore';
import { UploadCloudIcon, FileIcon, CheckCircleIcon, AlertCircleIcon } from '../shared/Icons';
import LoadingSpinner from '../shared/LoadingSpinner';

const DocumentUpload: React.FC = () => {
  const { addDocument, categories } = useDocumentStore();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.name || 'Other');
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setIsUploading(true);
      setUploadProgress(0);
      setUploadStatus('uploading');
      setStatusMessage('Uploading to server...');
      
      const file = acceptedFiles[0];
      
      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90; // Stop at 90% to handle actual save
          }
          return prev + 10;
        });
      }, 100);

      try {
        const success = await addDocument(file, selectedCategory);
        clearInterval(interval);
        setUploadProgress(100);
        
        if (success) {
          setUploadStatus('success');
          setStatusMessage('Document uploaded successfully! Processing will begin shortly.');
        } else {
          setUploadStatus('error');
          setStatusMessage('Failed to upload document. Please try again.');
        }
        
        setTimeout(() => {
          setIsUploading(false);
          setUploadProgress(0);
          setUploadStatus('idle');
          setStatusMessage('');
        }, 3000);
      } catch (error) {
        clearInterval(interval);
        setIsUploading(false);
        setUploadProgress(0);
        setUploadStatus('error');
        setStatusMessage('Upload failed. Please try again.');
        console.error('Upload error:', error);
        
        setTimeout(() => {
          setUploadStatus('idle');
          setStatusMessage('');
        }, 3000);
      }
    }
  }, [addDocument, selectedCategory]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'text/plain': ['.txt'],
    },
    maxFiles: 1,
    disabled: isUploading,
  });

  return (
    <div className="p-4 bg-white/95 dark:bg-slate-800/60 backdrop-blur-lg rounded-2xl shadow-md border border-slate-300 dark:border-slate-700">
      <div {...getRootProps()} className={`relative p-6 border-2 border-dashed rounded-xl cursor-pointer transition-colors duration-300 ${isDragActive ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' : 'border-slate-400 dark:border-slate-600 hover:border-indigo-400'}`}>
        <input {...getInputProps()} />
        {isUploading ? (
          <div className="flex flex-col items-center justify-center text-center">
            <LoadingSpinner size={40} />
            <p className="mt-4 text-sm font-semibold text-slate-700 dark:text-slate-100">
              {uploadStatus === 'uploading' ? 'Uploading to VPS...' : 'Processing...'}
            </p>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 mt-2">
                <div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300" style={{width: `${uploadProgress}%`}}></div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center">
            <UploadCloudIcon className="w-12 h-12 text-slate-500 dark:text-slate-300" />
            <p className="mt-4 text-sm font-semibold text-slate-700 dark:text-slate-100">
              {isDragActive ? "Drop the file here..." : "Drag & drop a file here, or click to select"}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-300 mt-1">
              Files will be uploaded to VPS for n8n processing
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-300 mt-1">PDF, Excel, Word, Image, or Text</p>
          </div>
        )}
      </div>
      
      {/* Status Message */}
      {statusMessage && (
        <div className={`mt-3 p-3 rounded-lg flex items-center gap-2 ${
          uploadStatus === 'success' 
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
            : uploadStatus === 'error'
            ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
            : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
        }`}>
          {uploadStatus === 'success' && <CheckCircleIcon className="w-4 h-4 text-green-600 dark:text-green-400" />}
          {uploadStatus === 'error' && <AlertCircleIcon className="w-4 h-4 text-red-600 dark:text-red-400" />}
          <p className={`text-sm font-medium ${
            uploadStatus === 'success' 
              ? 'text-green-800 dark:text-green-200' 
              : uploadStatus === 'error'
              ? 'text-red-800 dark:text-red-200'
              : 'text-blue-800 dark:text-blue-200'
          }`}>
            {statusMessage}
          </p>
        </div>
      )}
      
      <div className="mt-4">
        <label htmlFor="category-select" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
          Assign Category
        </label>
        <select
          id="category-select"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          disabled={isUploading}
          className="w-full p-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
        </select>
      </div>
    </div>
  );
};

export default DocumentUpload;
