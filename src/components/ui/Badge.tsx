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
    primary: 'bg-[#E8EEEF] text-[#53666F] border-[#758A93]/40 dark:bg-[#203038] dark:text-[#A4BCC7] dark:border-[#3E5664]',
    success: 'bg-[#E8EEEF] text-[#53666F] border-[#758A93]/50 dark:bg-[#203038] dark:text-[#A4BCC7] dark:border-[#3E5664]',
    warning: 'bg-[#FDF7E8] text-[#997017] border-[#E9B63B]/40 dark:bg-[#332B18] dark:text-[#E8C062] dark:border-[#6E5A2A]',
    danger: 'bg-[#F9ECE8] text-[#C66E52] border-[#F0D5CD] dark:bg-[#34201B] dark:text-[#E2937C] dark:border-[#5E3226]',
    neutral: 'bg-[#F8F6F1] text-[#5F6B72] border-[#DED9D0] dark:bg-[#1D272E] dark:text-[#A4B2BA] dark:border-[#2E3D47]'
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

