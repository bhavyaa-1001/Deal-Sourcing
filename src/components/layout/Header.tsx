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
    <header className="w-full bg-[#EDEBE5] dark:bg-[#111B27] border-b border-[#D8D5CE] dark:border-[#263544] sticky top-0 z-40 shadow-[0_1px_3px_rgba(32,42,46,0.04)] transition-colors duration-200">
      <div className="w-full px-4 md:px-6 min-h-[60px] md:h-16 flex flex-wrap md:flex-nowrap items-center justify-between gap-3 py-2.5 md:py-0">
        {/* Left: Hamburger + Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="flex items-center justify-center w-9 h-9 border border-[#D8D5CE] dark:border-[#344658] bg-white dark:bg-[#1B2A3A] hover:bg-[#F1EFEA] dark:hover:bg-[#24384C] text-[#202A2E] dark:text-[#E2E8F0] transition-all cursor-pointer rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary shadow-[0_1px_2px_rgba(32,42,46,0.04)]"
            aria-label={sidebarCollapsed ? "Open mandates sidebar" : "Close mandates sidebar"}
          >
            <Menu className="h-4.5 w-4.5 stroke-[2.2px]" />
          </button>
          <div className="text-left flex items-baseline gap-2.5">
            <h1 className="text-base md:text-lg font-black text-[#202A2E] dark:text-[#F3F5F7] tracking-tight leading-none m-0">
              DEAL SOURCING
            </h1>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-wrap items-center gap-2 md:gap-3 justify-end">
          <a
            href="#help"
            className="flex items-center gap-1.5 text-xs md:text-sm font-bold text-[#626A6D] dark:text-[#D7DEE6] hover:text-[#202A2E] dark:hover:text-[#FFFFFF] hover:bg-white/80 dark:hover:bg-[#1B2A3A] transition-colors focus-ring px-2.5 py-1.5 rounded-lg shrink-0"
          >
            <HelpCircle className="h-4 w-4 text-[#626A6D] dark:text-[#94A3B8]" />
            <span>Help</span>
          </a>

          <ThemeToggle themeState={themeState} />

          {/* Reset Active Mandate Button */}
          <button
            onClick={handleResetFlow}
            className="text-xs font-bold text-[#A44A42] dark:text-[#E89E9A] hover:text-[#823932] dark:hover:text-[#F1B5B2] transition-colors border border-[#E3C4C0] dark:border-[#4A2E30] bg-[#F4E4E1] hover:bg-[#EED9D5] dark:bg-[#2A1E20] dark:hover:bg-[#382427] px-2.5 py-1.5 rounded-lg cursor-pointer flex items-center justify-center shrink-0 shadow-[0_1px_2px_rgba(32,42,46,0.04)]"
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




