import React from 'react';

interface LoadingStateProps {
  message?: string;
  type?: 'spinner' | 'skeleton';
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading details...',
  type = 'spinner'
}) => {
  if (type === 'skeleton') {
    return (
      <div className="w-full space-y-5 animate-pulse p-4">
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
        <div className="space-y-3">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-4/5"></div>
        </div>
        <div className="grid grid-cols-3 gap-4 pt-4">
          <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded col-span-1"></div>
          <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded col-span-1"></div>
          <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded col-span-1"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-12 py-20 text-center">
      <svg className="animate-spin h-12 w-12 text-brand-primary mb-4" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
      <span className="text-lg font-semibold text-primary">{message}</span>
    </div>
  );
};
export default LoadingState;
