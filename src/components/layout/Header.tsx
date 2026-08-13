import React from 'react';
import { HelpCircle, Briefcase } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '../../hooks/useTheme';
import { mockMandate } from '../../data/mockMandates';

interface HeaderProps {
  themeState: ReturnType<typeof useTheme>;
}

export const Header: React.FC<HeaderProps> = ({ themeState }) => {
  return (
    <header className="w-full bg-card border-b border-default sticky top-0 z-40 shadow-sm transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 md:px-6 min-h-[64px] md:h-18 flex flex-wrap md:flex-nowrap items-center justify-between gap-3 py-3 md:py-0">
        {/* Left: Logo & Product Name */}
        <div className="flex items-center gap-2.5">
          {/* <div className="bg-brand-primary text-white p-2 rounded-md flex items-center justify-center shrink-0">
            <Briefcase className="h-5 w-5 md:h-6 md:w-6" />
          </div> */}
          <div className="text-left">
            <h1 className="text-base md:text-lg font-bold text-primary tracking-tight leading-none m-0">
              DEAL SOURCING
            </h1>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-wrap items-center gap-2 md:gap-5 justify-end">
          <a
            href="#help"
            className="flex items-center gap-1 text-sm md:text-base font-semibold text-secondary hover:text-primary transition-colors focus-ring p-1.5 md:p-2 rounded shrink-0"
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
                // Acknowledge strategy automatically too to speed up the demo
                localStorage.setItem('dealsourcing_research_strategy', JSON.stringify({
                  id: 'strategy-101',
                  mandateId: 'mandate-101',
                  status: 'Approved',
                  sources: [
                    { id: 'src-1', name: 'Plastics Industry Pipe Association Members', type: 'Industry Directory', status: 'VALIDATED' },
                    { id: 'src-2', name: 'Vinyl Council of Australia Members', type: 'Industry Directory', status: 'VALIDATED' },
                    { id: 'src-3', name: 'Association of Rotational Moulders Australasia', type: 'Industry Directory', status: 'VALIDATED' },
                    { id: 'src-4', name: 'Australian Plastics Industry Association', type: 'Industry Association', status: 'VALIDATED' },
                    { id: 'src-5', name: 'PIMA Trade Directory', type: 'Trade Directory', status: 'VALIDATED' }
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
            className="group flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 border border-default rounded-full bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-primary text-xs md:text-base font-bold select-none cursor-pointer transition-all hover:scale-105 shrink-0"
          >
            <span className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-brand-primary animate-ping shrink-0" />
            <span className="hidden md:inline">Demo Playback (Autofill)</span>
            <span className="inline md:hidden">Autofill</span>
          </button>

          {/* Reset Flow Button */}
          <button
            onClick={() => {
              if (window.confirm("Do you want to reset the deal sourcing flow? This will clear your current mandate, research acknowledgements, and shortlist candidates.")) {
                localStorage.clear();
                window.location.href = '/mandate';
              }
            }}
            className="text-xs md:text-base font-bold text-red-650 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors border border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20 px-3 py-1.5 md:px-3.5 md:py-1.5 rounded-full cursor-pointer flex items-center justify-center shrink-0"
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
