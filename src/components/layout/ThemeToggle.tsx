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
      className="flex items-center gap-2 px-3 py-2 rounded-md border border-default bg-card text-primary hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-150 focus-ring cursor-pointer text-base font-semibold min-h-[40px]"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <>
          <Sun className="h-5 w-5 text-amber-500" />
          <span>☀ Light</span>
        </>
      ) : (
        <>
          <Moon className="h-5 w-5 text-indigo-400" />
          <span>🌙 Dark</span>
        </>
      )}
    </button>
  );
};
export default ThemeToggle;
