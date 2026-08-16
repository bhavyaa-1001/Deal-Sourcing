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
    primary: 'bg-[#EDEBE5] text-[#202A2E] border-[#D8D5CE] dark:bg-[#182536] dark:text-[#F1F5F9] dark:border-[#344658]',
    success: 'bg-[#E3ECE6] text-[#35624A] border-[#B7CCBC] dark:bg-[#173529] dark:text-[#8FBEA1] dark:border-[#39634D]',
    warning: 'bg-[#F5EDDA] text-[#9A7535] border-[#E3D4B3] dark:bg-[#3A3520] dark:text-[#D5C76E] dark:border-[#625A2F]',
    danger: 'bg-[#F4E4E1] text-[#A44A42] border-[#E3C4C0] dark:bg-[#381E21] dark:text-[#E89E9A] dark:border-[#54282B]',
    neutral: 'bg-[#F1EFEA] text-[#626A6D] border-[#D8D5CE] dark:bg-[#141F2C] dark:text-[#9AA9B8] dark:border-[#2D4053]'
  };

  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold border
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

