import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Header from './Header';
import WorkflowStepper from './WorkflowStepper';
import { useTheme } from '../../hooks/useTheme';
import { mandatesApi } from '../../api/mandates';
import { researchApi } from '../../api/research';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { FileText, Settings, Search, CheckSquare } from 'lucide-react';

export const AppLayout: React.FC = () => {
  const themeState = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [mandateApproved, setMandateApproved] = useState(false);
  const [researchApproved, setResearchApproved] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  // Function to query the mock API and update stepper navigation locks
  const checkApprovals = useCallback(async () => {
    try {
      const mandate = await mandatesApi.getMandate('mandate-101');
      setMandateApproved(mandate.status === 'Approved');
      
      const research = await researchApi.getResearchStrategy('mandate-101');
      setResearchApproved(research.status === 'Approved');
    } catch (err) {
      console.error('Error fetching stepper approvals status:', err);
    }
  }, []);

  // Check state on mount and when location changes
  useEffect(() => {
    checkApprovals();
  }, [location.pathname, checkApprovals]);

  // Monitor URL hash changes to trigger help modal
  useEffect(() => {
    if (location.hash === '#help') {
      setHelpOpen(true);
    }
  }, [location.hash]);

  const handleCloseHelp = () => {
    setHelpOpen(false);
    // Remove the #help hash from URL path without reloading page
    navigate(location.pathname, { replace: true });
  };

  return (
    <div className="min-h-screen bg-app flex flex-col text-primary">
      {/* Top Header */}
      <Header themeState={themeState} />

      {/* Horizontal Workflow Stepper */}
      <WorkflowStepper
        mandateApproved={mandateApproved}
        researchApproved={researchApproved}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 flex flex-col gap-6">
        <Outlet context={{ refreshApprovals: checkApprovals }} />
      </main>
      
      {/* Footer */}
      <footer className="w-full py-6 border-t border-default bg-card text-center text-secondary text-sm">
        <div className="max-w-7xl mx-auto px-6">
          &copy; {new Date().getFullYear()} DEAL SOURCING. All rights reserved. Deal Sourcing Platform.
        </div>
      </footer>

      {/* 4-Step Sourcing Workflow Help Modal */}
      <Modal
        isOpen={helpOpen}
        onClose={handleCloseHelp}
        title="Deal Sourcing Workflow Guide"
        size="lg"
        footerActions={
          <Button variant="primary" onClick={handleCloseHelp}>
            Got it, Let's start!
          </Button>
        }
      >
        <div className="flex flex-col gap-6 text-left">
          <p className="text-secondary text-base leading-relaxed">
            Welcome to the Deal Sourcing platform. This application guides you through a premium, 4-stage business intelligence pipeline to target, research, discover, and shortlist acquisition candidates:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Step 1 */}
            <div className="flex gap-4 p-4 border border-default rounded-xl bg-slate-50/50 dark:bg-slate-900/30">
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-950/40 text-brand-primary flex items-center justify-center shrink-0">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-primary flex items-center gap-1.5">
                  1. Define Mandate
                </h4>
                <p className="text-sm text-secondary mt-1.5 leading-relaxed">
                  Chat directly with our interactive AI Research Agent. The agent interprets your raw search goals and dynamically fills the 8 criteria dimensions live.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4 p-4 border border-default rounded-xl bg-slate-50/50 dark:bg-slate-900/30">
              <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <Settings className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-primary flex items-center gap-1.5">
                  2. Research Strategy
                </h4>
                <p className="text-sm text-secondary mt-1.5 leading-relaxed">
                  Review the search strategy mapped for your mandate. Review source yields, duplicate rates, and acknowledge information gaps to launch candidate indexing.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4 p-4 border border-default rounded-xl bg-slate-50/50 dark:bg-slate-900/30">
              <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Search className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-primary flex items-center gap-1.5">
                  3. Discover Companies
                </h4>
                <p className="text-sm text-secondary mt-1.5 leading-relaxed">
                  Browse list or card views of matching target businesses. Use the multi-select filters to find matching locations or sizes, and click "Add to Shortlist".
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-4 p-4 border border-default rounded-xl bg-slate-50/50 dark:bg-slate-900/30">
              <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-brand-success flex items-center justify-center shrink-0">
                <CheckSquare className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-primary flex items-center gap-1.5">
                  4. Review Results
                </h4>
                <p className="text-sm text-secondary mt-1.5 leading-relaxed">
                  Compare shortlisted companies side-by-side using the matrix tool, review succession risks, and export candidate dossiers as formatted PDF reports.
                </p>
              </div>
            </div>

          </div>

          <div className="mt-2 p-4 border border-blue-200 dark:border-blue-900 bg-blue-50/40 dark:bg-blue-950/15 rounded-xl flex items-center gap-3">
            <span className="h-2.5 w-2.5 rounded-full bg-brand-primary animate-ping shrink-0" />
            <span className="text-sm font-semibold text-primary">
              Tip: You can always access this guide at any time by clicking "Help" in the top header.
            </span>
          </div>
        </div>
      </Modal>
    </div>
  );
};
export default AppLayout;
export interface LayoutContextType {
  refreshApprovals: () => Promise<void>;
}
