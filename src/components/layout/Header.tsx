import React from 'react';
import { HelpCircle, Briefcase } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '../../hooks/useTheme';

interface HeaderProps {
  themeState: ReturnType<typeof useTheme>;
}

export const Header: React.FC<HeaderProps> = ({ themeState }) => {
  return (
    <header className="w-full bg-card border-b border-default sticky top-0 z-40 shadow-premium transition-all duration-200">
      <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
        {/* Left: Logo & Product Name */}
        <div className="flex items-center gap-3">
          <div className="bg-brand-primary text-white p-2.5 rounded-md flex items-center justify-center">
            <Briefcase className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-primary tracking-tight leading-none m-0">
              DEAL SOURCING
            </h1>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-5">
          <a
            href="#help"
            className="flex items-center gap-1.5 text-base font-semibold text-secondary hover:text-primary transition-colors focus-ring p-2 rounded"
          >
            <HelpCircle className="h-5 w-5" />
            <span className="hidden sm:inline">Help</span>
          </a>

          <ThemeToggle themeState={themeState} />

          {/* Demo Playback Area */}
          <div className="flex items-center gap-2 px-4 py-2 border border-default rounded-full bg-slate-50 dark:bg-slate-900 text-primary text-base font-bold select-none cursor-default">
            <span className="h-2 w-2 rounded-full bg-brand-primary animate-ping shrink-0" />
            <span>Demo Playback</span>
          </div>

          {/* Reset Flow Button */}
          <button
            onClick={() => {
              if (window.confirm("Do you want to reset the deal sourcing flow? This will clear your current mandate, research acknowledgements, and shortlist candidates.")) {
                localStorage.clear();
                window.location.href = '/mandate';
              }
            }}
            className="text-base font-bold text-red-650 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors border border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20 px-3.5 py-1.5 rounded-full cursor-pointer flex items-center justify-center"
          >
            Reset Flow
          </button>
        </div>
      </div>
    </header>
  );
};
export default Header;
