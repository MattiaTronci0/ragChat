import React, { useState } from 'react';
import { useDocumentStore } from '../../stores/documentStore';
import { FolderIcon, CheckCircleIcon, AlertCircleIcon } from '../shared/Icons';

const DirectoryPicker: React.FC = () => {
  const { 
    isFileSystemSupported, 
    hasDirectoryAccess, 
    directoryName, 
    requestDirectoryAccess 
  } = useDocumentStore();
  
  const [isRequesting, setIsRequesting] = useState(false);

  const handleRequestAccess = async () => {
    setIsRequesting(true);
    try {
      const success = await requestDirectoryAccess();
      if (!success) {
        alert('Failed to get directory access. Please try again.');
      }
    } catch (error) {
      console.error('Directory access error:', error);
      alert('Failed to get directory access. Please ensure you\'re using a supported browser.');
    } finally {
      setIsRequesting(false);
    }
  };

  if (!isFileSystemSupported) {
    return (
      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-200 dark:border-amber-800">
        <div className="flex items-center gap-3">
          <AlertCircleIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          <div className="flex-1">
            <h3 className="font-medium text-amber-800 dark:text-amber-200">
              File System Access Limited
            </h3>
            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
              Your browser doesn't support direct file system access. Documents will be managed in browser memory.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (hasDirectoryAccess) {
    return (
      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-200 dark:border-green-800">
        <div className="flex items-center gap-3">
          <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
          <div className="flex-1">
            <h3 className="font-medium text-green-800 dark:text-green-200">
              Connected to Directory
            </h3>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
              Documents are saved to: <span className="font-mono">{directoryName}</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
      <div className="flex items-center gap-3">
        <FolderIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <div className="flex-1">
          <h3 className="font-medium text-blue-800 dark:text-blue-200">
            Choose Documents Folder
          </h3>
          <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
            Select a folder on your computer to save uploaded documents.
          </p>
        </div>
        <button
          onClick={handleRequestAccess}
          disabled={isRequesting}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
        >
          {isRequesting ? 'Requesting...' : 'Choose Folder'}
        </button>
      </div>
    </div>
  );
};

export default DirectoryPicker;