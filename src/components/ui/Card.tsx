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
        bg-card border border-default rounded p-6 shadow-none
        transition-all duration-200
        ${hoverable ? 'hover:border-slate-350 dark:hover:border-slate-700' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};
export default Card;
