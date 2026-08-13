import { HelpCircle, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '../../hooks/useTheme';
import { useMandateHistory } from '../../context/MandateHistoryContext';

interface HeaderProps {
  themeState: ReturnType<typeof useTheme>;
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ themeState, sidebarCollapsed, onToggleSidebar }) => {
  const { activeMandate, resetActiveMandate } = useMandateHistory();
  const navigate = useNavigate();

  const handleResetFlow = () => {
    const name = activeMandate?.title ?? 'this mandate';
    if (window.confirm(`Reset "${name}"?\n\nThis will clear all criteria, chat history, and research progress for this mandate only. Other mandates will not be affected.`)) {
      resetActiveMandate();
      navigate('/mandate');
    }
  };

  return (
    <header className="w-full bg-card border-b border-default sticky top-0 z-40 shadow-none transition-all duration-200">
      <div className="w-full px-4 md:px-6 min-h-[64px] md:h-18 flex flex-wrap md:flex-nowrap items-center justify-between gap-3 py-3 md:py-0">
        {/* Left: Hamburger + Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="flex items-center justify-center w-10 h-10 border border-[#D9DDE1] dark:border-slate-700 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800 text-[#172A3A] dark:text-slate-200 transition-all cursor-pointer rounded-[6px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
            aria-label={sidebarCollapsed ? "Open mandates sidebar" : "Close mandates sidebar"}
          >
            <Menu className="h-5 w-5 stroke-[2.5px]" />
          </button>
          <div className="text-left">
            <h1 className="text-lg md:text-xl font-bold text-primary tracking-tight leading-none m-0">
              DEAL SOURCING
            </h1>
            <p className="text-[11px] text-secondary font-medium tracking-wide mt-1">
              Deal Sourcing Platform
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-wrap items-center gap-2 md:gap-5 justify-end">
          <a
            href="#help"
            className="flex items-center gap-1 text-base md:text-[17px] font-semibold text-secondary hover:text-primary transition-colors focus-ring p-1.5 md:p-2 rounded shrink-0"
          >
            <HelpCircle className="h-4.5 w-4.5 md:h-5 md:w-5" />
            <span>Help</span>
          </a>

          <ThemeToggle themeState={themeState} />

          {/* Reset Active Mandate Button */}
          <button
            onClick={handleResetFlow}
            className="text-xs md:text-sm font-bold text-red-650 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors border border-red-200 dark:border-red-900 bg-red-50/30 dark:bg-red-950/20 px-3 py-1.5 rounded cursor-pointer flex items-center justify-center shrink-0 min-h-[32px]"
          >
            <span className="hidden sm:inline">Reset Flow</span>
            <span className="inline sm:hidden">Reset</span>
          </button>
        </div>
      </div>
    </header>
  );
};
export default Header;
