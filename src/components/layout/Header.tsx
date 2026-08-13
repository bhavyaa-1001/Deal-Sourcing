import { HelpCircle } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '../../hooks/useTheme';
import { mockMandate } from '../../data/mockMandates';

interface HeaderProps {
  themeState: ReturnType<typeof useTheme>;
}

export const Header: React.FC<HeaderProps> = ({ themeState }) => {
  return (
    <header className="w-full bg-card border-b border-default sticky top-0 z-40 shadow-none transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 md:px-6 min-h-[64px] md:h-18 flex flex-wrap md:flex-nowrap items-center justify-between gap-3 py-3 md:py-0">
        {/* Left: Logo & Product Name */}
        <div className="flex items-center gap-2.5">
          {/* <div className="bg-brand-primary text-white p-2 rounded-md flex items-center justify-center shrink-0">
            <Briefcase className="h-5 w-5 md:h-6 md:w-6" />
          </div> */}
          <div className="text-left">
            <h1 className="text-lg md:text-xl font-bold text-primary tracking-tight leading-none m-0">
              DEAL SOURCING
            </h1>
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

          {/* Demo Playback Area */}
          <button
            onClick={() => {
              if (window.confirm("Do you want to run the Demo Playback? This will automatically pre-fill the mandate with demo data and redirect you to the company discovery page.")) {
                // Write fully completed mockMandate to localStorage
                localStorage.setItem('dealsourcing_mandate', JSON.stringify({
                  ...mockMandate,
                  status: 'Approved' // mark approved
                }));
                // Write validated strategy to localStorage
                localStorage.setItem('dealsourcing_strategy', JSON.stringify({
                  status: 'Approved',
                  sources: [
                    { id: 'industry-directories', name: 'Australian Plastics Association', type: 'Directory', status: 'VALIDATED' },
                    { id: 'national-registries', name: 'ASIC Registry Search', type: 'Government', status: 'VALIDATED' },
                    { id: 'trade-associations', name: 'Manufacturing Guild', type: 'Association', status: 'VALIDATED' }
                  ],
                  gaps: [
                    { id: 'financial-transparency', description: 'Limited financial disclosure...', acknowledged: true },
                    { id: 'ownership-succession', description: 'Succession status of founder...', acknowledged: true }
                  ],
                  lastUpdated: new Date().toISOString()
                }));
                // Redirect to discover page
                window.location.href = '/discover';
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-default rounded bg-slate-50/50 dark:bg-slate-900 text-slate-700 dark:text-slate-350 text-sm font-bold select-none cursor-pointer transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-brand-success shrink-0 animate-pulse" />
            <span>Environment: Demo (Autofill)</span>
          </button>

          {/* Reset Flow Button */}
          <button
            onClick={() => {
              if (window.confirm("Do you want to reset the deal sourcing flow? This will clear your current mandate, research acknowledgements, and shortlist candidates.")) {
                localStorage.clear();
                window.location.href = '/mandate';
              }
            }}
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
