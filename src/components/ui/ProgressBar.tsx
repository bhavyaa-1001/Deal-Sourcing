import React from 'react';

interface ProgressBarProps {
  value: number; // 0 to 100
  max?: number; // defaults to 100
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'success' | 'warning';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  size = 'md',
  variant = 'primary',
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-3',
    lg: 'h-5'
  };

  const variants = {
    primary: 'bg-[#202A2E] dark:bg-[#5F8F70]',
    success: 'bg-[#35624A] dark:bg-[#5F8F70]',
    warning: 'bg-[#9A7535] dark:bg-[#D5C76E]'
  };

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <div className="flex justify-between items-center text-sm font-semibold text-primary">
          <span>{label}</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={`w-full bg-[#E5E2DC] dark:bg-[#293746] rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div
          className={`rounded-full transition-all duration-500 ease-out ${variants[variant]} ${sizeClasses[size]}`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  );
};
export default ProgressBar;
