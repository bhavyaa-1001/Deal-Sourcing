import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import WorkflowStepper from './WorkflowStepper';
import { useTheme } from '../../hooks/useTheme';
import { mandatesApi } from '../../api/mandates';
import { researchApi } from '../../api/research';

export const AppLayout: React.FC = () => {
  const themeState = useTheme();
  const location = useLocation();
  
  const [mandateApproved, setMandateApproved] = useState(false);
  const [researchApproved, setResearchApproved] = useState(false);

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
    </div>
  );
};
export default AppLayout;
export interface LayoutContextType {
  refreshApprovals: () => Promise<void>;
}
