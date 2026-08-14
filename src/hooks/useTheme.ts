import { useState, useEffect } from 'react';

export type Theme = 'light' | 'dark';

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('dealsourcing_theme');
    if (saved === 'dark' || saved === 'light') {
      return saved;
    }
    // Default to user system color scheme preference
    const systemPrefersDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return systemPrefersDark ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    // Only set item if explicitly set/changed by user or saved
    localStorage.setItem('dealsourcing_theme', theme);
  }, [theme]);

  // Listen to OS system color scheme changes dynamically
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
    const handleChange = (e: MediaQueryListEvent) => {
      const userSaved = localStorage.getItem('dealsourcing_theme');
      // If the user has not explicitly set a manual preference, follow system change
      if (!userSaved) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('dealsourcing_theme', next);
      return next;
    });
  };

  return { theme, toggleTheme, isDark: theme === 'dark' };
};
export type UseThemeReturn = ReturnType<typeof useTheme>;
export default useTheme;
