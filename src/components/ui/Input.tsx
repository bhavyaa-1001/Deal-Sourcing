import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  helperText?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  label,
  helperText,
  error,
  id,
  className = '',
  ...props
}, ref) => {
  const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className="w-full flex flex-col gap-2">
      <label
        htmlFor={inputId}
        className="text-base font-semibold text-primary"
      >
        {label}
      </label>
      
      <input
        ref={ref}
        id={inputId}
        className={`
          w-full px-4 py-3 text-base rounded border border-default bg-card text-primary
          focus-ring focus:border-brand-primary transition-all duration-200
          min-h-[46px] placeholder-slate-400 dark:placeholder-slate-500
          ${error ? 'border-brand-danger focus-visible:outline-brand-danger' : ''}
          ${className}
        `}
        {...props}
      />
      
      {error && (
        <span className="text-sm font-medium text-brand-danger">
          {error}
        </span>
      )}
      
      {!error && helperText && (
        <span className="text-sm text-secondary">
          {helperText}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
