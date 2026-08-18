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
  const baseStyles = 'inline-flex items-center justify-center font-bold rounded-lg transition-all duration-150 focus-ring cursor-pointer disabled:cursor-not-allowed disabled:opacity-50';
  
  const variants = {
    primary: 'bg-[#202A30] text-white hover:bg-[#151D22] active:bg-[#0E1418] border border-[#202A30] dark:bg-[#F4F6F8] dark:text-[#13191D] dark:hover:bg-[#E4E8EB] dark:border-[#F4F6F8] shadow-xs',
    secondary: 'bg-white text-[#202A30] border border-default hover:bg-[#F8F6F1] dark:bg-[#1D272E] dark:text-[#F4F6F8] dark:border-[#2E3D47] dark:hover:bg-[#243038] shadow-xs',
    success: 'bg-[#758A93] text-white border border-[#758A93] hover:bg-[#62767F] dark:bg-[#758A93] dark:text-white dark:hover:bg-[#859CA6] shadow-xs',
    danger: 'bg-white text-[#C66E52] border border-[#F0D5CD] hover:bg-[#F9ECE8] dark:bg-[#1D272E] dark:text-[#E2937C] dark:border-[#52281D]',
    outline: 'border border-default bg-white/90 dark:bg-card text-primary hover:bg-[#F8F6F1] dark:hover:bg-[#243038] shadow-xs'
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
