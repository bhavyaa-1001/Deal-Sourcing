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
            className="group flex items-center gap-2 px-4 py-2 border border-default rounded-full bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-primary text-base font-bold select-none cursor-pointer transition-all hover:scale-105"
          >
            <span className="h-2 w-2 rounded-full bg-brand-primary animate-ping shrink-0" />
            <span>Demo Playback (Autofill)</span>
          </button>

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
