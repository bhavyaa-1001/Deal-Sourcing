import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverable = false,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`
        bg-card border border-default rounded-lg p-6 shadow-premium
        transition-all duration-200
        ${hoverable ? 'hover:shadow-premium-lg hover:border-slate-300 dark:hover:border-slate-600' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};
export default Card;
