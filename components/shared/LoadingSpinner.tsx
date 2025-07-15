
import React from 'react';

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 24, className = '' }) => {
  return (
    <div
      style={{ width: size, height: size }}
      className={`animate-spin rounded-full border-2 border-slate-400 border-t-transparent dark:border-slate-500 dark:border-t-transparent ${className}`}
      role="status"
      aria-label="loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;
