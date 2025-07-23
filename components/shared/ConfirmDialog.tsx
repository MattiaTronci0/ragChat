
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
      <div className="relative w-full max-w-md p-6 m-4 bg-white/80 dark:bg-olive-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-olive-200 dark:border-olive-700 animate-[slideUp_0.4s_ease-out]">
        <h3 className="text-lg font-bold font-professional text-olive-800 dark:text-olive-100">{title}</h3>
        <p className="mt-2 text-sm text-olive-600 dark:text-olive-300 font-classical">{message}</p>
        <div className="flex justify-end mt-6 space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-olive-700 bg-olive-200/80 dark:bg-olive-700/80 dark:text-olive-200 rounded-lg hover:bg-olive-300/80 dark:hover:bg-olive-600/80 transition-colors"
          >
            Annulla
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-lg transition-colors"
          >
            Conferma
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
