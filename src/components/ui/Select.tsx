import React from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
  helperText?: string;
  error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  options,
  helperText,
  error,
  id,
  className = '',
  ...props
}, ref) => {
  const selectId = id || `select-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className="w-full flex flex-col gap-2">
      <label
        htmlFor={selectId}
        className="text-base font-semibold text-primary"
      >
        {label}
      </label>
      
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          className={`
            w-full px-4 py-3 pr-10 text-base rounded border border-default bg-card text-primary
            focus-ring focus:border-brand-primary transition-all duration-200
            appearance-none min-h-[46px] cursor-pointer
            ${error ? 'border-brand-danger focus-visible:outline-brand-danger' : ''}
            ${className}
          `}
          {...props}
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        
        {/* Custom Chevron Indicator */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-secondary">
          <svg className="h-5 w-5 fill-current" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
      
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

Select.displayName = 'Select';
export default Select;
