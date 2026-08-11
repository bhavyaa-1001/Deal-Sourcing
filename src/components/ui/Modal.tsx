import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import Button from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footerActions?: React.ReactNode;
  size?: 'md' | 'lg' | 'xl' | 'full';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footerActions,
  size = 'md',
}) => {
  // Prevent background scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    md: 'max-w-xl',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl',
    full: 'max-w-full h-full rounded-none'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm transition-opacity duration-300 animate-fadeIn">
      {/* Backdrop click closer */}
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      {/* Modal Container */}
      <div
        className={`
          relative w-full ${sizeClasses[size]} bg-card border border-default rounded-lg shadow-premium-lg
          flex flex-col max-h-[90vh] overflow-hidden transform transition-all duration-300 scale-100
        `}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-default">
          <h3 id="modal-title" className="text-xl font-bold text-primary">
            {title}
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1 rounded-full min-h-0 border-none hover:bg-slate-100 dark:hover:bg-slate-800 text-secondary"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 px-6 py-5 overflow-y-auto text-base text-primary">
          {children}
        </div>

        {/* Footer */}
        {footerActions && (
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-default bg-slate-50 dark:bg-slate-900/40">
            {footerActions}
          </div>
        )}
      </div>
    </div>
  );
};
export default Modal;
