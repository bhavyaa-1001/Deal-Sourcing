import React from 'react';
import { AlertCircle } from 'lucide-react';
import Button from './Button';

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  onAction,
  icon
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-10 border border-dashed border-default rounded-lg text-center bg-card shadow-premium py-16">
      <div className="text-secondary mb-4 p-4 rounded-full bg-slate-50 dark:bg-slate-800">
        {icon || <AlertCircle className="h-10 w-10 text-slate-400" />}
      </div>
      <h3 className="text-xl font-bold text-primary mb-2">{title}</h3>
      <p className="text-base text-secondary max-w-md mb-6">{description}</p>
      {actionText && onAction && (
        <Button variant="outline" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};
export default EmptyState;
