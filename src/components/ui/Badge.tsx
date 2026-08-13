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
    primary: 'bg-white text-brand-primary border-brand-primary dark:bg-slate-900 dark:border-brand-primary-light/30',
    success: 'bg-white text-brand-success border-brand-success dark:bg-slate-900 dark:border-brand-success/30',
    warning: 'bg-white text-brand-warning border-brand-warning dark:bg-slate-900 dark:border-brand-warning/30',
    danger: 'bg-white text-brand-danger border-brand-danger dark:bg-slate-900 dark:border-brand-danger/30',
    neutral: 'bg-white text-slate-500 border-slate-300 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800'
  };

  return (
    <span
      className={`
        inline-flex items-center px-3 py-1 rounded text-sm font-bold border min-h-[32px]
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
