
import React from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ isOpen, onClose, onConfirm, title, message }: ConfirmDialogProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-[fadeIn_0.3s_ease-out]">
      <div className="relative w-full max-w-md p-6 m-4 bg-white/80 dark:bg-blue-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-blue-200 dark:border-blue-700 animate-[slideUp_0.4s_ease-out]">
        <h3 className="text-lg font-bold text-blue-800 dark:text-blue-100">{title}</h3>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{message}</p>
        <div className="flex justify-end mt-6 space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-200/80 dark:bg-gray-700/80 dark:text-gray-200 rounded-lg hover:bg-gray-300/80 dark:hover:bg-gray-600/80 transition-colors"
          >
            Annulla
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 text-sm font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
          >
            Conferma
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
