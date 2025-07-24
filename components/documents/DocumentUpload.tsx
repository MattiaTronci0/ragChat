
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useDocumentStore } from '../../stores/documentStore';
import { UploadCloudIcon, FileIcon, CheckCircleIcon, AlertCircleIcon } from '../shared/Icons';
import LoadingSpinner from '../shared/LoadingSpinner';

const DocumentUpload: React.FC = () => {
  const { addDocument, categories } = useDocumentStore();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.name || 'Altro');
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setIsUploading(true);
      setUploadProgress(0);
      setUploadStatus('uploading');
      setStatusMessage('Caricamento sul server...');
      
      const file = acceptedFiles[0];
      
              // Simula il progresso di caricamento
        const interval = setInterval(() => {
          setUploadProgress((prev: number) => {
            if (prev >= 90) {
              clearInterval(interval);
              return 90; // Ferma al 90% per gestire il salvataggio effettivo
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
          setStatusMessage('Documento caricato con successo! L\'elaborazione inizierà a breve.');
        } else {
          setUploadStatus('error');
          setStatusMessage('Impossibile caricare il documento. Riprova.');
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
        setStatusMessage('Caricamento fallito. Riprova.');
        console.error('Errore di caricamento:', error);
        
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
    <div className="p-4 bg-white/95 backdrop-blur-lg rounded-2xl shadow-md border border-gray-200">
      <div {...getRootProps()} className={`relative p-6 border-2 border-dashed rounded-xl cursor-pointer transition-colors duration-300 ${isDragActive ? 'border-green-500 bg-green-50' : 'border-gray-400 hover:border-green-400'}`}>
        <input {...getInputProps()} />
        {isUploading ? (
          <div className="flex flex-col items-center justify-center text-center">
            <LoadingSpinner size={40} />
            <p className="mt-4 text-sm font-semibold text-gray-700 dark:text-gray-100">
              {uploadStatus === 'uploading' ? 'Caricamento sul VPS...' : 'Elaborazione...'}
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div className="bg-green-600 h-2.5 rounded-full transition-all duration-300" style={{width: `${uploadProgress}%`}}></div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center">
            <UploadCloudIcon className="w-12 h-12 text-gray-500" />
                          <p className="mt-4 text-sm font-semibold text-gray-700">
                {isDragActive ? "Rilascia il file qui..." : "Trascina e rilascia un file qui, o clicca per selezionare"}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                I file verranno caricati sul VPS per l'elaborazione n8n
              </p>
              <p className="text-xs text-gray-500 mt-1">PDF, Excel, Word, Immagine o Testo</p>
          </div>
        )}
      </div>
      
      {/* Messaggio di Stato */}
      {statusMessage && (
        <div className={`mt-3 p-3 rounded-lg flex items-center gap-2 ${
          uploadStatus === 'success' 
            ? 'bg-green-50 border border-green-200' 
            : uploadStatus === 'error'
            ? 'bg-red-50 border border-red-200'
            : 'bg-gray-50 border border-gray-200'
        }`}>
          {uploadStatus === 'success' && <CheckCircleIcon className="w-4 h-4 text-green-600" />}
          {uploadStatus === 'error' && <AlertCircleIcon className="w-4 h-4 text-red-600" />}
          <p className={`text-sm font-medium ${
            uploadStatus === 'success' 
              ? 'text-green-800' 
              : uploadStatus === 'error'
              ? 'text-red-800'
              : 'text-gray-800'
          }`}>
            {statusMessage}
          </p>
        </div>
      )}
      
      <div className="mt-4">
        <label htmlFor="category-select" className="block text-sm font-medium text-gray-700 mb-1">
          Assegna Categoria
        </label>
        <select
          id="category-select"
          value={selectedCategory}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedCategory(e.target.value)}
          disabled={isUploading}
          className="w-full p-2 bg-white border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-green-500 focus:border-green-500"
        >
          {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
        </select>
      </div>
    </div>
  );
};

export default DocumentUpload;
