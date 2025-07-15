
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useDocumentStore } from '../../stores/documentStore';
import { UploadCloudIcon, FileIcon } from '../shared/Icons';
import LoadingSpinner from '../shared/LoadingSpinner';

const DocumentUpload: React.FC = () => {
  const { addDocument, categories } = useDocumentStore();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.name || 'Other');
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setIsUploading(true);
      setUploadProgress(0);
      
      const file = acceptedFiles[0];
      
      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            addDocument(file, selectedCategory);
            setIsUploading(false);
            return 100;
          }
          return prev + 10;
        });
      }, 100);
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
    <div className="p-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg rounded-2xl shadow-md border border-slate-200 dark:border-slate-700">
      <div {...getRootProps()} className={`relative p-6 border-2 border-dashed rounded-xl cursor-pointer transition-colors duration-300 ${isDragActive ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' : 'border-slate-300 dark:border-slate-600 hover:border-indigo-400'}`}>
        <input {...getInputProps()} />
        {isUploading ? (
          <div className="flex flex-col items-center justify-center text-center">
            <LoadingSpinner size={40} />
            <p className="mt-4 text-sm font-semibold text-slate-700 dark:text-slate-200">Uploading...</p>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 mt-2">
                <div className="bg-indigo-600 h-2.5 rounded-full" style={{width: `${uploadProgress}%`}}></div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center">
            <UploadCloudIcon className="w-12 h-12 text-slate-500 dark:text-slate-400" />
            <p className="mt-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
              {isDragActive ? "Drop the file here..." : "Drag & drop a file here, or click to select"}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">PDF, Excel, Word, Image, or Text</p>
          </div>
        )}
      </div>
      <div className="mt-4">
        <label htmlFor="category-select" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
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
