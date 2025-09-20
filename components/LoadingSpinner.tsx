
import React from 'react';

interface LoadingSpinnerProps {
    text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ text }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-brand-accent"></div>
      {text && <p className="text-brand-primary text-lg font-semibold animate-pulse">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
