import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-md transition-colors focus-ring cursor-pointer disabled:cursor-not-allowed disabled:opacity-50';
  
  const variants = {
    primary: 'bg-brand-primary text-white hover:bg-brand-primary-hover active:bg-brand-primary-dark border border-brand-primary',
    secondary: 'bg-white text-slate-800 border border-default hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700',
    success: 'bg-white text-brand-success border border-brand-success hover:bg-brand-success-light dark:bg-slate-900 dark:hover:bg-brand-success-light/20',
    danger: 'bg-white text-brand-danger border border-brand-danger hover:bg-brand-danger-light dark:bg-slate-900 dark:hover:bg-brand-danger-light/20',
    outline: 'border border-default bg-transparent text-primary hover:bg-slate-50 dark:hover:bg-slate-800'
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm md:text-[15px] min-h-[44px]',
    md: 'px-5 py-3 text-base min-h-[48px]',
    lg: 'px-7 py-4 text-lg min-h-[54px]'
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {!isLoading && leftIcon && <span className="mr-2 inline-flex">{leftIcon}</span>}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="ml-2 inline-flex">{rightIcon}</span>}
    </button>
  );
};
export default Button;
