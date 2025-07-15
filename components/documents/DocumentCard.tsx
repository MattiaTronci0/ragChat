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
  Trash2Icon
} from '../shared/Icons';

interface DocumentCardProps {
  document: Document;
  onDelete: (id: string) => void;
  onPreview: (doc: Document) => void;
}

const categoryColorMap: { [key: string]: string } = {
  blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
  green: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
  orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
  purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
  red: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
  gray: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300',
};

const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <FileImageIcon className="w-10 h-10" />;
    if (type.includes('spreadsheet') || type.includes('excel')) return <FileSpreadsheetIcon className="w-10 h-10" />;
    if (type.includes('pdf') || type.includes('word')) return <FileTextIcon className="w-10 h-10" />;
    return <FileIcon className="w-10 h-10" />;
};

const DocumentCard: React.FC<DocumentCardProps> = ({ document, onDelete, onPreview }) => {
  const { categories } = useDocumentStore();
  const categoryInfo = categories.find(c => c.name === document.category);
  const colorClass = categoryInfo ? categoryColorMap[categoryInfo.color] : categoryColorMap['gray'];

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };
  
  const handleDownload = () => {
    if (document.file) {
      const url = URL.createObjectURL(document.file);
      const link = window.document.createElement('a');
      link.href = url;
      link.setAttribute('download', document.name);
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      alert(`Download for "${document.name}" is not available as it's mock data without a file object.`);
    }
  };


  return (
    <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg rounded-2xl p-4 shadow-md hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-700 flex flex-col animate-[slideUp_0.6s_ease-out_forwards] opacity-0">
      <div className="flex items-start gap-4">
        <div className="text-slate-500 dark:text-slate-400">{getFileIcon(document.type)}</div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-800 dark:text-slate-100 truncate" title={document.name}>{document.name}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {formatBytes(document.size)} - {document.uploadDate.toLocaleDateString()}
          </p>
        </div>
      </div>
      <div className="mt-4 flex-grow">
        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${colorClass}`}>
          {document.category}
        </span>
      </div>
      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700/50 flex justify-end items-center gap-2">
        <button onClick={() => onPreview(document)} className="p-2 text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700 rounded-full transition-colors" title="Preview"><EyeIcon className="w-5 h-5"/></button>
        <button onClick={handleDownload} className="p-2 text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700 rounded-full transition-colors" title="Download"><DownloadIcon className="w-5 h-5"/></button>
        <button onClick={() => onDelete(document.id)} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full transition-colors" title="Delete"><Trash2Icon className="w-5 h-5"/></button>
      </div>
    </div>
  );
};

export default DocumentCard;