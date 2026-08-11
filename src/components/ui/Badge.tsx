import React from 'react';

type BadgeVariant = 'primary' | 'success' | 'warning' | 'danger' | 'neutral';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  className = '',
  ...props
}) => {
  const styles = {
    primary: 'bg-brand-primary-light text-brand-primary-dark border-brand-primary-hover',
    success: 'bg-brand-success-light text-brand-success border-brand-success',
    warning: 'bg-brand-warning-light text-brand-warning border-brand-warning',
    danger: 'bg-brand-danger-light text-brand-danger border-brand-danger',
    neutral: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
  };

  return (
    <span
      className={`
        inline-flex items-center px-3 py-1 rounded text-sm font-semibold border
        ${styles[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </span>
  );
};
export default Badge;
