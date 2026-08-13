import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import useResearchAgent from '../hooks/useResearchAgent';
import type { LayoutContextType } from '../components/layout/AppLayout';
import Button from '../components/ui/Button';
import ProgressBar from '../components/ui/ProgressBar';
import { Send, Paperclip, Check, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';
import type { MandateCriteria } from '../api/researchAgent';
import { useMandateHistory } from '../context/MandateHistoryContext';

export const DefineMandate: React.FC = () => {
  const navigate = useNavigate();
  const { refreshApprovals } = useOutletContext<LayoutContextType>();
  const { updateActiveMandate } = useMandateHistory();
  
  const {
    messages,
    mandate,
    confirmedCriteria,
    isLoading,
    sendMessage,
    confirmField,
    unconfirmField,
    updateSummaryFieldDirectly
  } = useResearchAgent();

  const [inputText, setInputText] = useState('');
  const [editingField, setEditingField] = useState<keyof MandateCriteria | null>(null);
  const [editValue, setEditValue] = useState('');
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat container to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || isLoading) return;
    const textToSend = inputText;
    setInputText('');
    await sendMessage(textToSend);
  };

  const handleStartEdit = (field: keyof MandateCriteria) => {
    setEditingField(field);
    setEditValue(mandate[field]);
  };

  const handleSaveEdit = (field: keyof MandateCriteria) => {
    updateSummaryFieldDirectly(field, editValue);
    setEditingField(null);
  };

  // Maps chat criteria back to standard App storage so subsequent steps load correctly
  const handleContinue = async () => {
    // Update active mandate status to Approved/Confirmed
    updateActiveMandate({
      status: 'Approved',
      currentWorkflowStep: 2
    });

    // Refresh approvals in Layout context to unlock step 2 path
    await refreshApprovals();

    // Navigate to next step
    navigate('/research');
  };

  // Calculate confirmed criteria count
  const confirmedCount = Object.values(confirmedCriteria).filter(Boolean).length;

  const getStatusBadge = (field: keyof MandateCriteria) => {
    const val = mandate[field];
    if (val === 'Not specified') {
      return (
        <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-slate-150/40 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
          Not Provided
        </span>
      );
    }
    if (confirmedCriteria[field]) {
      return (
        <span className="text-[11px] font-bold text-brand-success uppercase tracking-wider bg-brand-success-light px-2 py-0.5 rounded border border-brand-success/30 flex items-center gap-0.5">
          <Check className="h-3 w-3 stroke-[3.5px]" />
          Confirmed
        </span>
      );
    }
    return (
      <span className="text-[11px] font-bold text-[#B0925A] uppercase tracking-wider bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-900/40">
        Suggested
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      {/* Page Title & Subtitle */}
      <div className="mb-2">
        <h2 className="text-3xl font-bold md:text-[32px] text-primary tracking-tight">
          Define Your Acquisition Mandate
        </h2>
        <p className="text-base md:text-lg text-secondary mt-2 leading-relaxed">
          Chat with our Research Agent to define what kind of business you want to acquire.
        </p>
      </div>

      {/* Main Content: Split Grid for Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Clean Chat Workspace (58% width / lg:col-span-7) */}
        <div className="lg:col-span-7 border border-default rounded bg-white dark:bg-slate-900 flex flex-col min-h-[500px] overflow-hidden">
          
          {/* Header Panel */}
          <div className="px-6 py-4.5 border-b border-default bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-primary">Research Agent</h3>
              <p className="text-xs text-secondary mt-0.5">Define alignment parameters dynamically via interactive logging.</p>
            </div>
            <button
              onClick={() => alert("The Research Agent analyzes your text inputs, structures them into 9 key criteria dimensions, and verifies matching target companies.")}
              className="text-sm font-semibold text-slate-600 dark:text-slate-350 border border-default hover:bg-slate-50 dark:hover:bg-slate-800 px-3.5 py-2 rounded transition-colors cursor-pointer bg-white dark:bg-slate-900 min-h-[38px]"
            >
              How it works
            </button>
          </div>

          {/* Messages Log Panel */}
          <div ref={chatContainerRef} className="flex-1 px-6 py-5 overflow-y-auto max-h-[420px] min-h-[350px] flex flex-col gap-6 bg-white dark:bg-slate-900">
            {messages.map((msg) => {
              const isAgent = msg.sender === 'agent';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col max-w-[85%] ${isAgent ? 'self-start items-start text-left' : 'self-end items-end text-right'}`}
                >
                  {/* Sender Tag Label */}
                  <span className="text-[13px] font-bold tracking-wider text-slate-550 dark:text-slate-400 uppercase mb-1">
                    {isAgent ? 'RESEARCH AGENT' : 'YOUR INPUT'}
                  </span>

                  {/* Rectangular Content Box */}
                  <div
                    className={`px-4 py-2.5 rounded-md text-base md:text-[17px] leading-relaxed whitespace-pre-line border
                      ${isAgent 
                        ? 'bg-slate-50 dark:bg-slate-950/20 text-slate-800 dark:text-slate-200 border-slate-250/60 dark:border-slate-800' 
                        : 'bg-blue-50/30 dark:bg-blue-950/15 text-slate-900 dark:text-slate-100 border-blue-100 dark:border-blue-900/40'
                      }
                    `}
                  >
                    {msg.text}
                  </div>
                  
                  {/* Timestamp */}
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">
                    {msg.timestamp}
                  </span>
                </div>
              );
            })}

            {/* Agent Typing Indicator */}
            {isLoading && (
              <div className="flex flex-col self-start max-w-[80%] items-start animate-pulse">
                <span className="text-[13px] font-bold tracking-wider text-slate-555 dark:text-slate-400 uppercase mb-1">
                  RESEARCH AGENT
                </span>
                <div className="bg-slate-50 dark:bg-slate-950/20 border border-slate-250/60 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-base px-4 py-2.5 rounded-md">
                  Research Agent is typing...
                </div>
              </div>
            )}
          </div>

          {/* Pre-defined suggestion button prompts removed per specifications */}

          {/* Chat Form Input panel */}
          <form onSubmit={handleSend} className="px-6 py-4 border-t border-default bg-slate-50/40 dark:bg-slate-900/20 flex items-center gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isLoading}
                placeholder="Type your answer or describe your requirements..."
                className="w-full pl-4 pr-10 py-3 text-base border border-default bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary disabled:bg-slate-50 dark:disabled:bg-slate-900 disabled:text-slate-400 min-h-[48px]"
              />
              <button
                type="button"
                className="absolute right-3 inset-y-0 flex items-center text-slate-400 hover:text-slate-655 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer"
                onClick={() => alert("Upload criteria document attachment (feature placeholder)")}
              >
                <Paperclip className="h-5 w-5" />
              </button>
            </div>
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="bg-brand-primary hover:bg-brand-primary-hover active:bg-brand-primary-dark text-white p-3 rounded-md transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center shrink-0 min-h-[48px] min-w-[48px]"
              aria-label="Send message to agent"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
          <div className="px-6 pb-4 text-xs text-slate-400 dark:text-slate-500 text-center font-medium">
            The more details you provide, the better we can find the right opportunities.
          </div>
        </div>

        {/* Right Side: Mandate Summary (42% width / lg:col-span-5) - Desktop (sticky) */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 flex flex-col gap-4">
          
          {/* Mobile Accordion Toggle Trigger */}
          <button
            onClick={() => setMobileSummaryOpen(!mobileSummaryOpen)}
            className="w-full flex lg:hidden items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 border border-default rounded font-bold text-slate-800 dark:text-slate-200 text-base"
          >
            <span>Acquisition Mandate ({confirmedCount}/9 Complete)</span>
            {mobileSummaryOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>

          {/* Summary Panel Card content */}
          <div className={`bg-white dark:bg-slate-900 border border-default rounded p-6 shadow-none flex flex-col gap-5 text-left ${mobileSummaryOpen ? 'block' : 'hidden lg:flex'}`}>
            <div>
              <h3 className="text-sm font-bold text-slate-555 dark:text-slate-400 uppercase tracking-wider">ACQUISITION MANDATE</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Live interpretation of your acquisition criteria.</p>
            </div>

            {/* Checklist progress meter */}
            <div className="flex flex-col gap-1 bg-slate-50/50 dark:bg-slate-950/20 p-4 rounded border border-default">
              <ProgressBar
                value={confirmedCount}
                max={9}
                label={`${confirmedCount} of 9 criteria confirmed`}
                size="sm"
              />
            </div>

            {/* Criteria List - 2 Column Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 border-t border-default pt-4">
              {/* Field mapping array helper */}
              {([
                { key: 'targetIndustry', label: 'Target Industry' },
                { key: 'primaryActivities', label: 'Primary Activities' },
                { key: 'geography', label: 'Geography' },
                { key: 'revenueRange', label: 'Revenue Range' },
                { key: 'companySize', label: 'Company Size' },
                { key: 'ownershipProfile', label: 'Ownership Profile' },
                { key: 'successionPreference', label: 'Succession' },
                { key: 'exclusions', label: 'Exclusions' },
                { key: 'additionalDetails', label: 'Additional Details', fullWidth: true }
              ] as { key: keyof MandateCriteria; label: string; fullWidth?: boolean }[]).map(({ key, label, fullWidth }) => {
                const isEditing = editingField === key;
                const val = mandate[key];
                const isConfirmed = confirmedCriteria[key];

                return (
                  <div key={key} className={`flex flex-col justify-between items-stretch border-b border-default pb-3 last:border-0 last:pb-0 ${fullWidth ? 'md:col-span-2 border-b-0 pb-0' : ''}`}>
                    <div className="flex-1 text-left">
                      <div className="flex justify-between items-start gap-1">
                        <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider block">
                          {label}
                        </span>
                        <div className="shrink-0 pt-0.5">
                          {getStatusBadge(key)}
                        </div>
                      </div>
                      
                      {isEditing ? (
                        <div className="flex items-center gap-2 mt-1.5 w-full">
                          {key === 'additionalDetails' ? (
                            <textarea
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              placeholder="Describe founder transition preference, certification needs, customer concentration details..."
                              className="w-full px-2 py-1.5 text-sm border border-default bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-primary min-h-[70px] resize-y"
                            />
                          ) : (
                            <input
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-default bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-primary"
                            />
                          )}
                          <button
                            onClick={() => handleSaveEdit(key)}
                            className="bg-brand-success text-white p-1.5 rounded-md hover:bg-brand-success/80 transition-colors cursor-pointer shrink-0 self-end"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="mt-1 flex flex-col gap-1.5">
                          <span className={`text-base font-bold leading-tight whitespace-pre-line ${val === 'Not specified' ? 'text-slate-400 dark:text-slate-500 font-medium' : 'text-primary'}`}>
                            {val}
                          </span>
                          
                          {/* Confirm / Edit Suggestions actions */}
                          {val !== 'Not specified' && !isConfirmed && (
                            <div className="flex items-center gap-2 mt-1">
                              <button
                                onClick={() => confirmField(key)}
                                className="px-2.5 py-1 text-xs font-bold text-white bg-brand-primary hover:bg-brand-primary/95 rounded transition-all cursor-pointer min-h-[28px]"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => handleStartEdit(key)}
                                className="px-2.5 py-1 text-xs font-semibold text-secondary border border-default hover:bg-slate-50 dark:hover:bg-slate-800 rounded transition-all cursor-pointer min-h-[28px]"
                              >
                                Edit
                              </button>
                            </div>
                          )}

                          {/* Unconfirm / Edit Confirmed actions */}
                          {val !== 'Not specified' && isConfirmed && (
                            <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400 dark:text-slate-500 font-medium">
                              <button
                                onClick={() => unconfirmField(key)}
                                className="hover:text-primary transition-all cursor-pointer underline text-[11px]"
                              >
                                Unconfirm
                              </button>
                              <span>•</span>
                              <button
                                onClick={() => handleStartEdit(key)}
                                className="hover:text-primary transition-all cursor-pointer underline text-[11px]"
                              >
                                Edit
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer Actions */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex flex-col gap-3">
              {confirmedCount < 9 && (
                <span className="text-xs font-bold text-brand-warning bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 p-2.5 rounded text-center">
                  {9 - confirmedCount} criteria still need your confirmation.
                </span>
              )}
              {confirmedCount === 9 && (
                <span className="text-xs font-bold text-brand-success bg-brand-success-light border border-brand-success/30 p-2.5 rounded text-center">
                  All criteria confirmed. Ready to approve.
                </span>
              )}
              <Button
                variant="primary"
                onClick={handleContinue}
                disabled={confirmedCount < 9}
                rightIcon={<ArrowRight className="h-5 w-5" />}
                className="w-full"
              >
                Approve Mandate & Continue
              </Button>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
export default DefineMandate;
