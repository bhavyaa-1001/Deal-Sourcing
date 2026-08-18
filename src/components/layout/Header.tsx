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
    <header className="w-full bg-[#1E293B] dark:bg-[#0F172A] border-b border-[#334155] sticky top-0 z-40 shadow-[0_2px_8px_rgba(0,0,0,0.12)] transition-colors duration-200 text-white">
      <div className="w-full px-4 md:px-6 min-h-[60px] md:h-16 flex flex-wrap md:flex-nowrap items-center justify-between gap-3 py-2.5 md:py-0">
        {/* Left: Hamburger + Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="flex items-center justify-center w-9 h-9 border border-[#334155] bg-[#334155]/60 hover:bg-[#334155] text-white transition-all cursor-pointer rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white shadow-xs"
            aria-label={sidebarCollapsed ? "Open mandates sidebar" : "Close mandates sidebar"}
          >
            <Menu className="h-4.5 w-4.5 stroke-[2.2px]" />
          </button>
          <div className="text-left flex items-baseline gap-2.5">
            <h1 className="text-base md:text-lg font-black text-white tracking-wider leading-none m-0 flex items-center gap-2">
              <span>DEAL SOURCING</span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#94A3B8] px-2 py-0.5 rounded bg-[#334155] border border-[#475569] hidden sm:inline-block">Terminal</span>
            </h1>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-wrap items-center gap-2 md:gap-3 justify-end">
          <a
            href="#help"
            className="flex items-center gap-1.5 text-xs md:text-sm font-bold text-[#94A3B8] hover:text-white hover:bg-[#334155]/60 transition-colors focus-ring px-2.5 py-1.5 rounded-lg shrink-0 border border-transparent hover:border-[#334155]"
          >
            <HelpCircle className="h-4 w-4 text-[#94A3B8]" />
            <span>Help</span>
          </a>

          <ThemeToggle themeState={themeState} />

          {/* Reset Active Mandate Button */}
          <button
            onClick={handleResetFlow}
            className="text-xs font-bold text-[#E2937C] hover:text-white transition-colors border border-[#C66E52]/40 hover:border-[#C66E52] bg-[#C66E52]/15 hover:bg-[#C66E52]/30 px-2.5 py-1.5 rounded-lg cursor-pointer flex items-center justify-center shrink-0 shadow-xs"
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




