import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Header from './Header';
import WorkflowStepper from './WorkflowStepper';
import { useTheme } from '../../hooks/useTheme';
import { mandatesApi } from '../../api/mandates';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import ResearchStrategyModal from '../research/ResearchStrategyModal';
import { FileText, Settings, Search, CheckSquare, Trash2, Compass } from 'lucide-react';
import { useMandateHistory } from '../../context/MandateHistoryContext';

interface SidebarContentProps {
  onClose?: () => void;
  savedOutreachList: any[];
  onDeleteSaved: (id: string) => void;
  onOpenStrategy: (id: string, title: string) => void;
}

const SidebarContent: React.FC<SidebarContentProps> = ({
  onClose,
  savedOutreachList,
  onDeleteSaved,
  onOpenStrategy
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
    <div className="flex flex-col h-full text-left select-none text-primary">
      <div className="mb-3">
        <span className="text-[11px] font-black text-[#626A6D] dark:text-[#9AA9B8] uppercase tracking-widest block">
          MANDATES
        </span>
      </div>

      <button
        onClick={handleNew}
        className="w-full flex items-center justify-center gap-2 px-3.5 py-2 border border-[#D8D5CE] hover:border-[#BDB9B0] dark:border-[#38516A] dark:hover:border-[#4E6E8E] text-[#202A2E] dark:text-[#F1F5F9] bg-white hover:bg-[#F1EFEA] dark:bg-[#1D3044] dark:hover:bg-[#253D54] rounded-lg font-bold text-[13px] cursor-pointer transition-all mb-4 min-h-[36px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-primary shadow-[0_1px_3px_rgba(32,42,46,0.04)]"
      >
        <span className="text-[#5F735F] dark:text-[#C5B76A] font-black text-sm">+</span>
        <span>New Mandate</span>
      </button>

      <span className="text-[10px] font-black text-[#626A6D] dark:text-[#9AA9B8] uppercase tracking-widest block mb-2">
        RECENT MANDATES
      </span>

      <div className="flex flex-col gap-2.5 pr-0.5">
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
              className={`group relative w-full p-3.5 rounded-xl border text-left transition-all flex flex-col gap-1.5
                ${isActive
                  ? 'border-[#202A2E] dark:border-[#7E8350] dark:border-l-[3px] dark:border-l-[#C5B76A] bg-white dark:bg-[#1D2B3A] text-primary shadow-[0_2px_8px_rgba(32,42,46,0.08)]'
                  : 'border-[#D8D5CE] dark:border-[#2D4053] bg-white dark:bg-[#182536] text-secondary hover:border-[#BDB9B0] dark:hover:bg-[#1D2B3A] dark:hover:border-[#40566A] shadow-[0_1px_3px_rgba(32,42,46,0.04)]'
                }
              `}
            >
              {/* Clickable Card Body Area */}
              <div 
                onClick={() => handleSelect(m.id)}
                className="flex-1 cursor-pointer"
              >
                <div className="flex justify-between items-center gap-2 pr-2">
                  <span className={`font-bold text-[14px] leading-tight block truncate text-[#202A2E] dark:text-[#F1F5F9] ${isActive ? 'font-black' : ''}`}>
                    {m.title}
                  </span>
                  {isActive && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#F4E8E2] dark:bg-[#3A3520] text-[#A65F3F] dark:text-[#D5C76E] border border-[#A65F3F]/20 dark:border-[#625A2F] font-black uppercase tracking-wider shrink-0">
                      Active
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-[#626A6D] dark:text-[#9AA9B8] mt-1 leading-snug pr-2 font-medium">
                  <span>{m.criteria.targetIndustry || 'Unspecified Industry'}</span>
                  {m.criteria.geography && m.criteria.geography !== 'Not specified' && (
                    <span> · {m.criteria.geography}</span>
                  )}
                </div>

                <div className="flex justify-between items-center text-[10px] text-[#899093] dark:text-[#9AA9B8] mt-2 font-semibold">
                  <span>{dateStr}</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider border shrink-0
                      ${m.status === 'Approved' || m.status === 'Confirmed'
                        ? 'border-[#B7CCBC] bg-[#E3ECE6] text-[#35624A] dark:bg-[#173529] dark:text-[#8FBEA1] dark:border-[#39634D]'
                        : 'border-[#D8D5CE] bg-[#F1EFEA] text-[#626A6D] dark:bg-[#141F2C] dark:text-[#9AA9B8] dark:border-[#2D4053]'
                      }
                    `}>
                      {m.status === 'Approved' || m.status === 'Confirmed' ? 'Confirmed' : 'Draft'}
                    </span>
                    <span>•</span>
                    <span>{confirmedCount}/9</span>
                  </div>
                </div>
              </div>

              {/* Hover Action Cluster: Strategy button + Delete button */}
              <div className="absolute top-2.5 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 dark:bg-[#182536]/90 p-0.5 rounded-md backdrop-blur-xs border border-[#D8D5CE]/60 dark:border-[#344658]/60 shadow-sm">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenStrategy(m.id, m.title);
                  }}
                  className="px-1.5 py-0.5 rounded text-[10px] font-bold text-[#A65F3F] dark:text-[#C5B76A] hover:bg-[#F4E8E2] dark:hover:bg-[#3A3520] cursor-pointer transition-colors flex items-center gap-1"
                  title="View Research Strategy for this mandate"
                  aria-label={`View research strategy for ${m.title}`}
                >
                  <Compass className="h-3 w-3" />
                  <span>Strategy</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (mandates.length <= 1) {
                      alert("You cannot delete the only remaining mandate.");
                      return;
                    }
                    if (window.confirm(`Delete mandate "${m.title}"?`)) {
                      deleteMandate(m.id);
                    }
                  }}
                  className="p-1 rounded text-[#899093] hover:text-[#A44A42] dark:hover:text-red-400 cursor-pointer transition-colors"
                  title="Delete mandate"
                  aria-label={`Delete mandate ${m.title}`}
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Saved Outreach Section in Sidebar */}
      <div className="mt-6 pt-4 border-t border-[#D8D5CE] dark:border-[#263544]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-black text-[#626A6D] dark:text-[#9AA9B8] uppercase tracking-widest block">
            SAVED OUTREACH
          </span>
          <span className="text-[10px] font-bold text-[#899093] dark:text-[#7F8D9B]">
            {savedOutreachList.length}
          </span>
        </div>

        <div className="flex flex-col gap-2">
          {savedOutreachList.length === 0 ? (
            <p className="text-[11px] text-[#899093] dark:text-[#7F8D9B] italic">No saved outreach yet.</p>
          ) : (
            savedOutreachList.map((item) => (
              <div
                key={item.id}
                className="group relative p-2.5 rounded-lg border border-[#D8D5CE] dark:border-[#2D4053] bg-white dark:bg-[#182536] hover:border-[#BDB9B0] dark:hover:border-[#40566A] text-left transition-all shadow-[0_1px_2px_rgba(32,42,46,0.02)]"
              >
                <div className="flex items-center justify-between pr-5 mb-1">
                  <span className="font-bold text-[12px] text-[#202A2E] dark:text-[#F1F5F9] truncate block">
                    {item.title}
                  </span>
                  <button
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to delete this saved outreach: "${item.title}"?`)) {
                        onDeleteSaved(item.id);
                      }
                    }}
                    className="absolute right-2 top-2 p-1 rounded text-[#899093] hover:text-[#A44A42] dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    title="Delete saved outreach"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>

                {/* Nested clickable prospects list */}
                <div className="flex flex-col gap-1 pl-0.5">
                  {item.prospects && item.prospects.map((p: any) => (
                    <button
                      key={p.companyId}
                      onClick={() => handleSavedProspectClick(item.mandateId || 'mandate-101', p.companyId)}
                      className="w-full text-left py-0.5 text-[11px] font-semibold text-[#626A6D] hover:text-[#202A2E] dark:text-[#9AA9B8] dark:hover:text-[#F1F5F9] focus:outline-none cursor-pointer truncate flex items-center gap-1.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#5F735F] dark:bg-[#C5B76A] shrink-0" />
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
  const [helpOpen, setHelpOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem('dealsourcing_sidebar_collapsed') === 'true';
  });

  // Saved outreach list state
  const [savedOutreachList, setSavedOutreachList] = useState<any[]>([]);
  const [selectedSavedItem, setSelectedSavedItem] = useState<any | null>(null);

  // Research strategy modal state (opened from mandate card in sidebar)
  const [strategyModalOpen, setStrategyModalOpen] = useState(false);
  const [selectedStrategyMandate, setSelectedStrategyMandate] = useState<{ id: string; title: string } | null>(null);

  const handleOpenStrategy = useCallback((id: string, title: string) => {
    setSelectedStrategyMandate({ id, title });
    setStrategyModalOpen(true);
  }, []);

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
          return;
        }
      }
      
      // Fallback
      const mandate = await mandatesApi.getMandate(activeId);
      setMandateApproved(mandate.status === 'Approved');
    } catch (err) {
      console.error('Error fetching stepper approvals status:', err);
    }
  }, []);

  // Check state on mount and when location or active mandate changes
  useEffect(() => {
    checkApprovals();
  }, [location.pathname, refreshTrigger, checkApprovals]);

  // Auto-close the mandate sidebar when entering Outreach for optimal full-width spacing
  useEffect(() => {
    if (location.pathname.startsWith('/outreach')) {
      setSidebarCollapsed(true);
      setMobileDrawerOpen(false);
    }
  }, [location.pathname]);

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
          <aside className="hidden md:flex flex-col w-64 lg:w-72 shrink-0 border-r border-[#D8D5CE] dark:border-[#263544] bg-[#EDEBE5] dark:bg-[#141F2C] p-4.5 fixed top-[60px] md:top-[64px] left-0 bottom-0 z-30 overflow-y-auto transition-all duration-200">
            <SidebarContent
              savedOutreachList={savedOutreachList}
              onDeleteSaved={deleteSavedOutreach}
              onOpenStrategy={handleOpenStrategy}
            />
          </aside>
        )}

        {/* Workspace content block — shifts right when sidebar is open */}
        <div className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ${!sidebarCollapsed ? 'md:ml-64 lg:ml-72' : ''}`}>
          {/* Horizontal Workflow Stepper - Sticky beneath header on scroll */}
          <div className="sticky top-[60px] md:top-16 z-30 shrink-0 bg-[#EDEBE5] dark:bg-[#111B27]">
            <WorkflowStepper
              mandateApproved={mandateApproved}
            />
          </div>

          {/* Main Content Area — full width across all sections */}
          <main className="flex-1 w-full px-4 md:px-6 py-4 md:py-6 flex flex-col gap-4">
            <Outlet context={{
              refreshApprovals: checkApprovals,
              refreshSavedOutreach: loadSavedOutreach
            }} />
          </main>

          {/* Footer - Visible upon scrolling */}
          <footer className="w-full py-6 border-t border-[#D8D5CE] dark:border-[#263544] bg-[#EDEBE5]/70 dark:bg-[#141F2C] text-center text-secondary text-sm mt-auto">
            <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#626A6D] dark:text-[#9AA9B8]">
              <div className="flex items-center gap-2 font-bold text-[#202A2E] dark:text-[#F1F5F9]">
                <span>&copy; {new Date().getFullYear()} DEAL SOURCING</span>
                <span>&bull;</span>
                <span className="text-secondary font-normal">All rights reserved.</span>
              </div>
              <div className="flex items-center gap-3 font-semibold">
                <span>Enterprise M&A Platform</span>
                <span>&bull;</span>
                <span className="text-brand-primary font-bold">Confidential & Verified</span>
              </div>
            </div>
          </footer>
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
          <div className="relative w-80 max-w-[85vw] h-full bg-[#EDEBE5] dark:bg-[#141F2C] border-r border-[#D8D5CE] dark:border-[#263544] flex flex-col p-6 animate-slideIn text-left shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <span className="text-base font-black text-primary">DEAL SOURCING</span>
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
              onOpenStrategy={handleOpenStrategy}
            />
          </div>
        </div>
      )}

      {/* Research Strategy Modal accessible from any mandate card */}
      <ResearchStrategyModal
        isOpen={strategyModalOpen}
        mandateId={selectedStrategyMandate?.id || null}
        mandateTitle={selectedStrategyMandate?.title}
        onClose={() => setStrategyModalOpen(false)}
      />

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
