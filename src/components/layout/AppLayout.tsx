import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Header from './Header';
import WorkflowStepper from './WorkflowStepper';
import { useTheme } from '../../hooks/useTheme';
import { mandatesApi } from '../../api/mandates';
import { researchApi } from '../../api/research';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { FileText, Settings, Search, CheckSquare, Trash2 } from 'lucide-react';
import { useMandateHistory } from '../../context/MandateHistoryContext';

interface SidebarContentProps {
  onClose?: () => void;
  savedOutreachList: any[];
  onDeleteSaved: (id: string) => void;
}

const SidebarContent: React.FC<SidebarContentProps> = ({
  onClose,
  savedOutreachList,
  onDeleteSaved
}) => {
  const { mandates, activeId, selectMandate, createNewMandate, deleteMandate } = useMandateHistory();
  const navigate = useNavigate();

  const handleSelect = (id: string) => {
    selectMandate(id);
    navigate('/mandate');
    if (onClose) onClose();
  };

  const handleNew = () => {
    createNewMandate();
    navigate('/mandate');
    if (onClose) onClose();
  };

  const handleSavedProspectClick = (mandateId: string, companyId: string) => {
    let originalMandateId = mandateId;
    
    // If mandateId is missing or invalid, scan recent mandates to see where this company is selected/enriched
    const mandateExists = mandates.some(m => m.id === originalMandateId);
    if (!originalMandateId || !mandateExists) {
      for (const m of mandates) {
        try {
          const selectedStored = localStorage.getItem(`dealsourcing_selected_ids_${m.id}`);
          if (selectedStored) {
            const ids = JSON.parse(selectedStored);
            if (ids.includes(companyId)) {
              originalMandateId = m.id;
              break;
            }
          }
          const enrichedStored = localStorage.getItem(`dealsourcing_enriched_ids_${m.id}`);
          if (enrichedStored) {
            const ids = JSON.parse(enrichedStored);
            if (ids.includes(companyId)) {
              originalMandateId = m.id;
              break;
            }
          }
        } catch (e) {
          console.error(e);
        }
      }
    }

    const currentActiveId = localStorage.getItem('dealsourcing_mandates_active_id') || 'mandate-101';
    const targetMandateId = mandates.some(m => m.id === originalMandateId) ? originalMandateId : currentActiveId;
    
    selectMandate(targetMandateId);
    navigate(`/outreach?companyId=${companyId}`);
    if (onClose) onClose();
  };

  return (
    <div className="flex flex-col h-full text-left select-none">
      <div className="mb-4">
        <span className="text-[13px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
          MANDATES
        </span>
      </div>

      <button
        onClick={handleNew}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-[#D9DDE1] hover:border-slate-400 dark:border-slate-700 dark:hover:border-slate-500 text-[#172A3A] dark:text-slate-200 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md font-bold text-[14px] cursor-pointer transition-all mb-5 min-h-[38px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-primary"
      >
        <span>+ New Mandate</span>
      </button>

      <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2.5">
        RECENT MANDATES
      </span>

      <div className="flex flex-col gap-3 pr-1">
        {mandates.map((m) => {
          const isActive = m.id === activeId;
          const dateStr = new Date(m.createdAt).toLocaleDateString([], {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          });
          
          const confirmedCount = Object.values(m.confirmedCriteria).filter(Boolean).length;
          
          return (
            <div
              key={m.id}
              className={`group relative w-full p-4 rounded-md border text-left transition-all flex flex-col gap-1.5
                ${isActive
                  ? 'border-brand-primary bg-purple-50/50 dark:bg-purple-950/20 text-primary shadow-md'
                  : 'border-default bg-card text-secondary hover:bg-slate-50/50 dark:hover:bg-slate-800/40'
                }
              `}
            >
              {/* Clickable Card Body Area */}
              <div 
                onClick={() => handleSelect(m.id)}
                className="flex-1 cursor-pointer"
              >
                <div className="flex justify-between items-center gap-2 pr-6">
                  <span className={`font-bold text-[15px] leading-tight block truncate text-primary ${isActive ? 'font-extrabold text-brand-primary' : ''}`}>
                    {m.title}
                  </span>
                  {isActive && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-brand-primary-light text-brand-primary border border-brand-primary/20 font-extrabold uppercase shrink-0">
                      Selected
                    </span>
                  )}
                </div>

                <div className="text-xs text-secondary mt-0.5 leading-snug pr-6">
                  <span>{m.criteria.targetIndustry || 'Unspecified Industry'}</span>
                  {m.criteria.geography && m.criteria.geography !== 'Not specified' && (
                    <span> · {m.criteria.geography}</span>
                  )}
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-400 dark:text-slate-500 mt-2 font-medium">
                  <span>{dateStr}</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider border shrink-0
                      ${m.status === 'Approved' || m.status === 'Confirmed'
                        ? 'border-brand-success/30 bg-brand-success-light text-brand-success'
                        : 'border-slate-300 bg-slate-100 text-slate-600 dark:bg-slate-850 dark:text-slate-400 dark:border-slate-700'
                      }
                    `}>
                      {m.status === 'Approved' || m.status === 'Confirmed' ? 'Confirmed' : 'Draft'}
                    </span>
                    <span>•</span>
                    <span>{confirmedCount}/9 Confirmed</span>
                  </div>
                </div>
              </div>

              {/* Absolute Delete Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm(`Are you sure you want to delete this mandate: "${m.title}"?`)) {
                    deleteMandate(m.id);
                  }
                }}
                className="absolute right-3 top-3.5 p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-455 hover:text-red-655 dark:hover:text-red-400 cursor-pointer md:opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
                title="Delete mandate"
                aria-label="Delete mandate"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* SAVED OUTREACH section */}
      <div className="mt-6 mb-2 border-t border-default pt-5">
        <span className="text-[13px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-3">
          SAVED OUTREACH
        </span>
        <div className="flex flex-col gap-2.5 pr-1">
          {savedOutreachList.length === 0 ? (
            <span className="text-xs text-slate-455 italic block py-1.5">No saved outreach yet.</span>
          ) : (
            savedOutreachList.map((item) => (
              <div
                key={item.id}
                className="w-full flex flex-col gap-1.5 p-3 rounded border border-default bg-card hover:bg-slate-50/50 dark:hover:bg-slate-800/40 text-xs font-semibold transition-all"
              >
                <div className="flex items-center justify-between gap-2 border-b border-default pb-1.5 select-none">
                  <div
                    className="flex-1 text-left truncate text-primary font-bold text-[13px]"
                    title={item.title}
                  >
                    {item.title}
                  </div>
                  
                  <button
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to delete this saved outreach: "${item.title}"?`)) {
                        onDeleteSaved(item.id);
                      }
                    }}
                    className="p-1 rounded text-slate-400 hover:text-red-500 dark:hover:text-red-400 cursor-pointer transition-opacity"
                    title="Delete saved outreach"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Nested clickable prospects list */}
                <div className="flex flex-col gap-1 pl-1">
                  {item.prospects && item.prospects.map((p: any) => (
                    <button
                      key={p.companyId}
                      onClick={() => handleSavedProspectClick(item.mandateId || 'mandate-101', p.companyId)}
                      className="w-full text-left py-1 text-[11px] font-semibold text-secondary hover:text-brand-primary focus:outline-none cursor-pointer truncate flex items-center gap-1.5"
                    >
                      <span className="w-1 h-1 rounded-full bg-[#A855F7] shrink-0" />
                      <span className="truncate">{p.contactName} ({p.companyName})</span>
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export const AppLayout: React.FC = () => {
  const themeState = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { refreshTrigger } = useMandateHistory();
  
  const [mandateApproved, setMandateApproved] = useState(false);
  const [researchApproved, setResearchApproved] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem('dealsourcing_sidebar_collapsed') === 'true';
  });

  // Saved outreach list state
  const [savedOutreachList, setSavedOutreachList] = useState<any[]>([]);
  const [selectedSavedItem, setSelectedSavedItem] = useState<any | null>(null);

  const loadSavedOutreach = useCallback(() => {
    const stored = localStorage.getItem('dealsourcing_saved_outreach');
    if (stored) {
      try {
        setSavedOutreachList(JSON.parse(stored));
      } catch (e) {
        console.error(e);
      }
    } else {
      setSavedOutreachList([]);
    }
  }, []);

  const deleteSavedOutreach = useCallback((id: string) => {
    const stored = localStorage.getItem('dealsourcing_saved_outreach');
    if (stored) {
      try {
        const list = JSON.parse(stored);
        const filtered = list.filter((item: any) => item.id !== id);
        localStorage.setItem('dealsourcing_saved_outreach', JSON.stringify(filtered));
        loadSavedOutreach();
      } catch (e) {
        console.error(e);
      }
    }
  }, [loadSavedOutreach]);

  // Load saved outreach items on mount
  useEffect(() => {
    loadSavedOutreach();
  }, [loadSavedOutreach]);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('dealsourcing_sidebar_collapsed', String(next));
      return next;
    });
  }, []);

  const handleHeaderToggle = useCallback(() => {
    if (window.innerWidth < 768) {
      setMobileDrawerOpen(prev => !prev);
    } else {
      toggleSidebar();
    }
  }, [toggleSidebar]);
 
  // Function to query the mock API and update stepper navigation locks
  const checkApprovals = useCallback(async () => {
    try {
      const activeId = localStorage.getItem('dealsourcing_mandates_active_id') || 'mandate-101';
      
      const storedHistory = localStorage.getItem('dealsourcing_mandates_history');
      if (storedHistory) {
        const historyList = JSON.parse(storedHistory);
        const activeMandate = historyList.find((m: any) => m.id === activeId);
        if (activeMandate) {
          setMandateApproved(activeMandate.status === 'Approved' || activeMandate.status === 'Confirmed');
          
          const strategyKey = `dealsourcing_strategy_${activeId}`;
          const storedStrategy = localStorage.getItem(strategyKey);
          if (storedStrategy) {
            const parsedStrategy = JSON.parse(storedStrategy);
            setResearchApproved(parsedStrategy.status === 'Approved');
          } else {
            // Seed a default strategy for mandate-101, draft for others
            setResearchApproved(activeId === 'mandate-101');
          }
          return;
        }
      }
      
      // Fallback
      const mandate = await mandatesApi.getMandate(activeId);
      setMandateApproved(mandate.status === 'Approved');
      
      const research = await researchApi.getResearchStrategy(activeId);
      setResearchApproved(research.status === 'Approved');
    } catch (err) {
      console.error('Error fetching stepper approvals status:', err);
    }
  }, []);

  // Check state on mount and when location or active mandate changes
  useEffect(() => {
    checkApprovals();
  }, [location.pathname, refreshTrigger, checkApprovals]);

  // Monitor URL hash changes to trigger help modal
  useEffect(() => {
    if (location.hash === '#help') {
      setHelpOpen(true);
    }
  }, [location.hash]);

  const handleCloseHelp = () => {
    setHelpOpen(false);
    navigate(location.pathname, { replace: true });
  };

  return (
    <div className="min-h-screen bg-app flex flex-col text-primary">
      {/* Top Header with Integrated Hamburger Sidebar Toggle */}
      <Header
        themeState={themeState}
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={handleHeaderToggle}
      />

      {/* Main layout splitting sidebar and content */}
      <div className="flex-1 flex flex-row items-stretch relative">
        
        {/* Desktop & Tablet Sidebar — fixed, does not scroll with content */}
        {!sidebarCollapsed && (
          <aside className="hidden md:flex flex-col w-64 lg:w-72 shrink-0 border-r border-default bg-white dark:bg-slate-900 p-5 fixed top-[57px] left-0 bottom-0 z-30 overflow-y-auto transition-all duration-200">
            <SidebarContent
              savedOutreachList={savedOutreachList}
              onDeleteSaved={deleteSavedOutreach}
            />
          </aside>
        )}

        {/* Workspace content block — shifts right when sidebar is open */}
        <div className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ${!sidebarCollapsed ? 'md:ml-64 lg:ml-72' : ''}`}>
          {/* Horizontal Workflow Stepper */}
          <WorkflowStepper
            mandateApproved={mandateApproved}
            researchApproved={researchApproved}
          />

          {/* Main Content Area */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 flex flex-col gap-6">
            <Outlet context={{
              refreshApprovals: checkApprovals,
              refreshSavedOutreach: loadSavedOutreach
            }} />
          </main>
        </div>
      </div>
      
      {/* Mobile Drawer Overlay */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileDrawerOpen(false)}
          />
          {/* Drawer content panel */}
          <div className="relative w-80 max-w-[85vw] h-full bg-white dark:bg-slate-900 border-r border-default flex flex-col p-6 animate-slideIn text-left">
            <div className="flex justify-between items-center mb-6">
              <span className="text-base font-bold text-primary">DEAL SOURCING</span>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="text-secondary hover:text-primary font-bold text-xl cursor-pointer p-1"
                aria-label="Close mandates drawer"
              >
                ✕
              </button>
            </div>
            <SidebarContent
              onClose={() => setMobileDrawerOpen(false)}
              savedOutreachList={savedOutreachList}
              onDeleteSaved={deleteSavedOutreach}
            />
          </div>
        </div>
      )}

      {/* Saved Outreach Details Modal */}
      {selectedSavedItem && (
        <Modal
          isOpen={selectedSavedItem !== null}
          onClose={() => setSelectedSavedItem(null)}
          title={`Saved Outreach: ${selectedSavedItem.title}`}
          size="lg"
          footerActions={
            <Button variant="outline" onClick={() => setSelectedSavedItem(null)}>Close</Button>
          }
        >
          <div className="flex flex-col gap-6 text-left max-h-[70vh] overflow-y-auto pr-2">
            {selectedSavedItem.prospects.map((p: any, idx: number) => (
              <div key={p.companyId} className="border border-default rounded-xl p-5 bg-card flex flex-col gap-4">
                <div className="flex items-center gap-2 border-b border-default pb-3">
                  <span className="h-6 w-6 rounded-full bg-brand-primary-light text-brand-primary flex items-center justify-center font-bold text-xs">
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="text-sm font-extrabold text-primary">{p.contactName}</h4>
                    <p className="text-xs text-secondary mt-0.5">{p.companyName}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {p.scripts.map((script: any) => (
                    <div key={script.type} className="border border-default rounded-lg p-3.5 bg-slate-50 dark:bg-slate-900/40">
                      <div className="flex items-center justify-between gap-2 mb-2 border-b border-default pb-1.5">
                        <span className="text-xs font-bold text-brand-primary uppercase tracking-wider">{script.label}</span>
                        <button
                          onClick={async () => {
                            const text = script.subject ? `Subject: ${script.subject}\n\n${script.body}` : script.body;
                            try {
                              await navigator.clipboard.writeText(text);
                              alert('Copied to clipboard!');
                            } catch (e) {
                              console.error(e);
                            }
                          }}
                          className="text-[10px] font-bold text-secondary hover:text-primary border border-default rounded px-2 py-0.5 bg-card hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          Copy
                        </button>
                      </div>
                      {script.subject && (
                        <p className="text-xs text-primary mb-2">
                          <span className="font-bold">Subject:</span> {script.subject}
                        </p>
                      )}
                      <pre className="text-xs text-secondary leading-relaxed font-sans whitespace-pre-wrap">{script.body}</pre>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Modal>
      )}
      
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
