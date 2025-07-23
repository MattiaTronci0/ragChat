import React from 'react';
import type { Document, DocumentCategory } from '../../types';
import { useDocumentStore } from '../../stores/documentStore';
import {
  FileIcon,
  FileTextIcon,
  FileImageIcon,
  FileSpreadsheetIcon,
  EyeIcon,
  DownloadIcon,
  Trash2Icon,
  CheckCircleIcon,
  AlertCircleIcon
} from '../shared/Icons';
import LoadingSpinner from '../shared/LoadingSpinner';

interface DocumentWithStatus extends Document {
  status: 'uploading' | 'processing' | 'indexed' | 'ready' | 'error';
  processingMessage?: string;
}

interface DocumentCardProps {
  document: DocumentWithStatus;
  onDelete: (id: string) => void;
  onPreview: (doc: DocumentWithStatus) => void;
}

const categoryColorMap: { [key: string]: string } = {
  blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
  green: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
  orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
  purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
  red: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
  gray: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
};

const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <FileImageIcon className="w-10 h-10" />;
    if (type.includes('spreadsheet') || type.includes('excel')) return <FileSpreadsheetIcon className="w-10 h-10" />;
    if (type.includes('pdf') || type.includes('word')) return <FileTextIcon className="w-10 h-10" />;
    return <FileIcon className="w-10 h-10" />;
};

const DocumentCard: React.FC<DocumentCardProps> = ({ document, onDelete, onPreview }) => {
  const { categories, getFileContent } = useDocumentStore();
  const categoryInfo = categories.find(c => c.name === document.category);
  const colorClass = categoryInfo ? categoryColorMap[categoryInfo.color] : categoryColorMap['gray'];

  const getStatusIcon = () => {
    switch (document.status) {
      case 'processing':
      case 'indexed':
        return <LoadingSpinner size={16} />;
      case 'ready':
        return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircleIcon className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (document.status) {
      case 'processing':
      case 'indexed':
        return 'text-green-600 dark:text-green-400';
      case 'ready':
        return 'text-green-600 dark:text-green-400';
      case 'error':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const isActionDisabled = document.status !== 'ready';

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };
  
  const handleDownload = async () => {
    try {
      const file = await getFileContent(document);
      if (file) {
        const url = URL.createObjectURL(file);
        const link = window.document.createElement('a');
        link.href = url;
        link.setAttribute('download', document.name);
        window.document.body.appendChild(link);
        link.click();
        window.document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        alert(`Unable to download "${document.name}". File not found.`);
      }
    } catch (error) {
      console.error('Download error:', error);
      alert(`Failed to download "${document.name}". Please try again.`);
    }
  };

  const handlePreview = async () => {
    try {
      const file = await getFileContent(document);
      if (file) {
        onPreview({ ...document, file });
      } else {
        alert(`Unable to preview "${document.name}". File not found.`);
      }
    } catch (error) {
      console.error('Preview error:', error);
      alert(`Failed to preview "${document.name}". Please try again.`);
    }
  };

  const handleDelete = async () => {
    try {
      onDelete(document.id);
    } catch (error) {
      console.error('Delete error:', error);
      alert(`Failed to delete "${document.name}". Please try again.`);
    }
  };


  return (
    <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-2xl p-4 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 flex flex-col animate-[slideUp_0.6s_ease-out_forwards] opacity-0">
      <div className="flex items-start gap-4">
        <div className="text-gray-500 dark:text-gray-400">{getFileIcon(document.type)}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-gray-900 dark:text-gray-100 truncate" title={document.name}>{document.name}</p>
            {getStatusIcon()}
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
            {formatBytes(document.size)} - {document.uploadDate instanceof Date ? document.uploadDate.toLocaleDateString() : new Date(document.uploadDate).toLocaleDateString()}
          </p>
          {document.status !== 'ready' && (
            <p className={`text-xs mt-1 ${getStatusColor()}`}>
              {document.processingMessage || 
                (document.status === 'processing' ? 'Processing with n8n...' : 
                 document.status === 'indexed' ? 'Indexing...' : 
                 document.status === 'error' ? 'Processing failed' : 'Uploading...')}
            </p>
          )}
        </div>
      </div>
      <div className="mt-4 flex-grow">
        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${colorClass}`}>
          {document.category}
        </span>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700/50 flex justify-end items-center gap-2">
        <button 
          onClick={handlePreview} 
          disabled={isActionDisabled}
          className={`p-2 rounded-full transition-colors ${
            isActionDisabled 
              ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed' 
              : 'text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700'
          }`} 
          title={isActionDisabled ? 'Available when processing is complete' : 'Preview'}
        >
          <EyeIcon className="w-5 h-5"/>
        </button>
        <button 
          onClick={handleDownload} 
          disabled={isActionDisabled}
          className={`p-2 rounded-full transition-colors ${
            isActionDisabled 
              ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed' 
              : 'text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700'
          }`} 
          title={isActionDisabled ? 'Available when processing is complete' : 'Download'}
        >
          <DownloadIcon className="w-5 h-5"/>
        </button>
        <button 
          onClick={handleDelete} 
          className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full transition-colors" 
          title="Delete"
        >
          <Trash2Icon className="w-5 h-5"/>
        </button>
      </div>
    </div>
  );
};

export default DocumentCard;