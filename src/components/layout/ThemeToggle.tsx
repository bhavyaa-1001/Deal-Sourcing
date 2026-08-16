import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

interface ThemeToggleProps {
  themeState: ReturnType<typeof useTheme>;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ themeState }) => {
  const { theme, toggleTheme } = themeState;

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#D8D5CE] dark:border-[#344658] bg-white dark:bg-[#1B2A3A] text-[#202A2E] dark:text-[#F1F5F9] hover:bg-[#F1EFEA] dark:hover:bg-[#24384C] transition-colors duration-150 focus-ring cursor-pointer text-xs md:text-sm font-bold shrink-0 shadow-[0_1px_2px_rgba(32,42,46,0.04)]"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <>
          <Sun className="h-4 w-4 text-amber-500" />
          <span className="hidden sm:inline">Light</span>
        </>
      ) : (
        <>
          <Moon className="h-4 w-4 text-[#C5B76A]" />
          <span className="hidden sm:inline">Dark</span>
        </>
      )}
    </button>
  );
};
export default ThemeToggle;
