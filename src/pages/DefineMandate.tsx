import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import useResearchAgent from '../hooks/useResearchAgent';
import type { LayoutContextType } from '../components/layout/AppLayout';
import ProgressBar from '../components/ui/ProgressBar';
import { Send, Paperclip, Check, ChevronDown, ChevronUp, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import type { MandateCriteria } from '../api/researchAgent';
import { useMandateHistory } from '../context/MandateHistoryContext';

export const DefineMandate: React.FC = () => {
  const navigate = useNavigate();
  const { refreshApprovals } = useOutletContext<LayoutContextType>();
  const { mandates, createNewMandate, updateActiveMandate } = useMandateHistory();
  
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

    // Navigate to next step: Discover Companies
    navigate('/discover');
  };

  // Calculate confirmed criteria count
  const confirmedCount = Object.values(confirmedCriteria).filter(Boolean).length;

  const getStatusBadge = (field: keyof MandateCriteria) => {
    if (!mandate[field] || mandate[field] === 'Not specified') {
      return (
        <span className="text-[11px] font-bold text-[#899093] dark:text-[#7F8D9B] uppercase tracking-wider bg-[#F1EFEA] dark:bg-[#141F2C] px-2 py-0.5 rounded border border-[#D8D5CE] dark:border-[#2D4053]">
          Not Provided
        </span>
      );
    }
    if (confirmedCriteria[field]) {
      return (
        <span className="text-[11px] font-extrabold text-[#35624A] dark:text-[#8FBEA1] uppercase tracking-wider bg-[#E3ECE6] dark:bg-[#173529] px-2.5 py-0.5 rounded border border-[#B7CCBC] dark:border-[#39634D] flex items-center gap-1">
          <Check className="h-3.5 w-3.5 stroke-[3px] text-[#35624A] dark:text-[#8FBEA1]" />
          Confirmed
        </span>
      );
    }
    return (
      <span className="text-[11px] font-extrabold text-[#9A7535] dark:text-[#D5C76E] uppercase tracking-wider bg-[#F5EDDA] dark:bg-[#3A3520] px-2.5 py-0.5 rounded border border-[#E3D4B3] dark:border-[#625A2F]">
        Suggested
      </span>
    );
  };

  if (mandates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center select-none py-12 px-6">
        <div className="w-16 h-16 rounded-full bg-[#EDEBE5] dark:bg-[#182536] flex items-center justify-center text-[#626A6D] mb-5 border border-[#D8D5CE] dark:border-[#2D4053] shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-plus-2"><path d="M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M3 15h6"/><path d="M6 12v6"/></svg>
        </div>
        <h2 className="text-2xl font-black text-[#202A2E] dark:text-[#F1F5F9] tracking-tight">No Acquisition Mandate Found</h2>
        <p className="text-base text-[#626A6D] dark:text-[#9AA9B8] mt-2 max-w-md leading-relaxed">
          You don't have any acquisition mandates. Create a new search mandate to get started with the M&A research agent.
        </p>
        <button
          onClick={createNewMandate}
          className="mt-6 bg-[#202A2E] hover:bg-[#141B1E] dark:bg-[#E6E9E5] dark:text-[#101820] dark:hover:bg-[#FFFFFF] text-white font-extrabold px-6 py-3 rounded-lg shadow-premium cursor-pointer transition-all hover:scale-[1.01]"
        >
          Create New Mandate
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 text-left w-full">
      {/* Page Title & Subtitle - Clean */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 shrink-0">
        <div>
          <h2 className="text-base md:text-lg font-black text-[#202A2E] dark:text-[#F1F5F9] tracking-tight leading-tight">
            Define Your Acquisition Mandate
          </h2>
          <p className="text-[11.5px] text-[#626A6D] dark:text-[#9AA9B8]">
            Chat with our Research Agent to refine parameters. All 9 criteria update live on the right.
          </p>
        </div>
        <div className="hidden lg:flex items-center gap-1.5 bg-[#E3ECE6] dark:bg-[#173529] border border-[#B7CCBC] dark:border-[#39634D] px-2.5 py-0.5 rounded-md text-[#35624A] dark:text-[#8FBEA1] text-xs font-bold shrink-0">
          <ShieldCheck className="h-3.5 w-3.5 text-[#35624A] dark:text-[#8FBEA1]" />
          <span>{confirmedCount}/9 Criteria Confirmed</span>
        </div>
      </div>

      {/* Main Content: Desktop Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
        
        {/* Left Side: Clean Chat Workspace (42% width / lg:col-span-5) */}
        <div className="lg:col-span-5 border border-[#D8D5CE] dark:border-[#2F4254] rounded-xl bg-white dark:bg-[#182536] flex flex-col min-h-[480px] lg:h-[545px] shadow-[0_1px_3px_rgba(32,42,46,0.04)] overflow-hidden">
          
          {/* Header Panel */}
          <div className="px-3 py-1.5 border-b border-[#D8D5CE] dark:border-[#344658] bg-[#F1EFEA] dark:bg-[#1D2B3A] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-[#F4E8E2] dark:bg-[#3A281F] text-[#A65F3F] dark:text-[#C27A56] flex items-center justify-center font-black text-xs shrink-0 border border-[#A65F3F]/20 dark:border-[#C27A56]/30">
                <Sparkles className="h-2.5 w-2.5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#202A2E] dark:text-[#F1F5F9] leading-tight">Research Agent</h3>
                <p className="text-[9.5px] text-[#626A6D] dark:text-[#9AA9B8]">Interactive criteria assistant</p>
              </div>
            </div>
            <button
              onClick={() => alert("The Research Agent analyzes your text inputs, structures them into 9 key criteria dimensions, and verifies matching target companies.")}
              className="text-[10px] font-semibold text-[#202A2E] dark:text-[#D7DEE6] border border-[#D8D5CE] dark:border-[#344658] hover:bg-[#F1EFEA] hover:border-[#A65F3F]/60 dark:hover:bg-[#233447] px-2 py-0.5 rounded transition-colors cursor-pointer bg-white dark:bg-[#182536]"
            >
              How it works
            </button>
          </div>

          {/* Messages Log Panel - Internal Scroll with smooth wheel pass-through */}
          <div ref={chatContainerRef} className="flex-1 min-h-0 px-3 pt-2 pb-2 overflow-y-auto flex flex-col gap-2 bg-[#F1EFEA]/40 dark:bg-[#111B27]">
            {messages.map((msg) => {
              const isAgent = msg.sender === 'agent';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col max-w-[90%] ${isAgent ? 'self-start items-start text-left' : 'self-end items-end text-right'}`}
                >
                  {/* Sender Tag Label */}
                  <span className={`text-[9px] font-extrabold tracking-wider uppercase mb-0.5 ${isAgent ? 'text-[#626A6D] dark:text-[#9AA9B8]' : 'text-[#626A6D] dark:text-[#C5B76A]'}`}>
                    {isAgent ? 'RESEARCH AGENT' : 'YOU'}
                  </span>

                  {/* Rectangular Content Box */}
                  <div
                    className={`px-2.5 py-1.5 rounded-lg text-xs md:text-[12.5px] leading-relaxed whitespace-pre-line border shadow-[0_1px_2px_rgba(32,42,46,0.04)]
                      ${isAgent 
                        ? 'bg-white text-[#202A2E] dark:bg-[#1D2B3A] dark:text-[#F1F5F9] border-[#D8D5CE] dark:border-[#344658]' 
                        : 'bg-[#EDEBE5] text-[#202A2E] border-[#D8D5CE] dark:bg-[#26384A] dark:text-[#F1F5F9] dark:border-[#40566A]'
                      }
                    `}
                  >
                    {msg.text}
                  </div>
                  
                  {/* Timestamp */}
                  <span className="text-[8.5px] text-[#899093] dark:text-[#7F8D9B] mt-0.5 block">
                    {msg.timestamp}
                  </span>
                </div>
              );
            })}

            {/* Agent Typing Indicator */}
            {isLoading && (
              <div className="flex flex-col self-start max-w-[85%] items-start animate-pulse">
                <span className="text-[9px] font-extrabold tracking-wider text-[#626A6D] dark:text-[#9AA9B8] uppercase mb-0.5">
                  RESEARCH AGENT
                </span>
                <div className="bg-white dark:bg-[#1D2B3A] border border-[#D8D5CE] dark:border-[#344658] text-[#626A6D] dark:text-[#9AA9B8] text-xs px-2.5 py-1 rounded-lg shadow-sm">
                  Analyzing criteria and updating mandate...
                </div>
              </div>
            )}
          </div>

          {/* Chat Form Input panel - Pinned at bottom */}
          <form onSubmit={handleSend} className="px-2.5 py-1.5 border-t border-[#D8D5CE] dark:border-[#344658] bg-white dark:bg-[#1D2B3A] flex items-center gap-2 shrink-0">
            <div className="relative flex-1">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isLoading}
                placeholder="Type requirements..."
                className="w-full pl-2.5 pr-7 py-1 text-xs md:text-sm border border-[#D8D5CE] dark:border-[#344658] bg-white dark:bg-[#141F2C] text-[#202A2E] dark:text-[#F1F5F9] placeholder-[#899093] dark:placeholder-[#7F8D9B] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#A65F3F] dark:focus:ring-[#C5B76A] disabled:bg-[#F1EFEA] dark:disabled:bg-[#0F1720] disabled:text-[#899093]"
              />
              <button
                type="button"
                className="absolute right-2 inset-y-0 flex items-center text-[#899093] hover:text-[#A65F3F] dark:text-[#AFA85D] dark:hover:text-[#C5B76A] cursor-pointer"
                onClick={() => alert("Upload criteria document attachment (feature placeholder)")}
                title="Attach document"
              >
                <Paperclip className="h-3.5 w-3.5" />
              </button>
            </div>
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 text-xs font-bold shrink-0 shadow-sm
                ${inputText.trim()
                  ? 'bg-[#202A2E] hover:bg-[#141B1E] text-white dark:bg-[#6C7044] dark:hover:bg-[#7D824E] dark:text-[#FFFFFF]'
                  : 'bg-[#202A2E] text-white dark:bg-[#344252] dark:text-[#E2E8F0]'
                }
              `}
              aria-label="Send message to agent"
            >
              <Send className="h-3 w-3" />
              <span>Send</span>
            </button>
          </form>
        </div>

        {/* Right Side: Mandate Summary (58% width / lg:col-span-7) — Same height as chat panel */}
        <div className="lg:col-span-7 flex flex-col min-h-[480px] lg:h-[545px] border border-[#D8D5CE] dark:border-[#2F4254] rounded-xl bg-white dark:bg-[#182536] shadow-[0_1px_3px_rgba(32,42,46,0.04)] overflow-hidden">
          
          {/* Mobile Accordion Toggle Trigger */}
          <button
            onClick={() => setMobileSummaryOpen(!mobileSummaryOpen)}
            className="w-full flex lg:hidden items-center justify-between p-2 bg-[#F1EFEA] dark:bg-[#1D2B3A] border-b border-[#D8D5CE] dark:border-[#344658] font-bold text-[#202A2E] dark:text-[#F1F5F9] text-xs shrink-0"
          >
            <span>Acquisition Mandate ({confirmedCount}/9 Complete)</span>
            {mobileSummaryOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {/* Panel Card Header */}
          <div className={`px-3.5 py-1.5 border-b border-[#D8D5CE] dark:border-[#344658] bg-white dark:bg-[#1D2B3A] flex flex-col gap-0.5 shrink-0 ${mobileSummaryOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="flex items-center justify-between">
              <h3 className="text-xs md:text-sm font-black text-[#626A6D] dark:text-[#9AA9B8] uppercase tracking-wider">ACQUISITION MANDATE</h3>
              <span className="text-xs md:text-sm font-black text-[#202A2E] dark:text-[#F1F5F9]">{confirmedCount}/9 ({Math.round((confirmedCount / 9) * 100)}%)</span>
            </div>

            {/* Checklist progress meter */}
            <div className="w-full">
              <ProgressBar
                value={confirmedCount}
                max={9}
                size="sm"
              />
            </div>
          </div>

          {/* Criteria List — 2-COLUMN GRID, scrollable to match chat height */}
          <div className={`flex-1 min-h-0 overflow-y-auto p-2.5 bg-white dark:bg-[#182536] flex flex-col ${mobileSummaryOpen ? 'block' : 'hidden lg:flex'}`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1 auto-rows-fr">
              {([
                { key: 'targetIndustry', label: 'TARGET INDUSTRY' },
                { key: 'primaryActivities', label: 'PRIMARY ACTIVITIES' },
                { key: 'geography', label: 'GEOGRAPHY' },
                { key: 'revenueRange', label: 'REVENUE RANGE' },
                { key: 'companySize', label: 'COMPANY SIZE' },
                { key: 'ownershipProfile', label: 'OWNERSHIP PROFILE' },
                { key: 'successionPreference', label: 'SUCCESSION' },
                { key: 'exclusions', label: 'EXCLUSIONS' },
                { key: 'additionalDetails', label: 'ADDITIONAL DETAILS', span2: true }
              ] as { key: keyof MandateCriteria; label: string; span2?: boolean }[]).map(({ key, label, span2 }) => {
                const isEditing = editingField === key;
                const val = mandate[key];
                const isConfirmed = confirmedCriteria[key];

                return (
                  <div
                    key={key}
                    className={`px-3 py-1.5 rounded-lg border border-[#D8D5CE] dark:border-[#344658] bg-white dark:bg-[#1D2B3A] dark:hover:bg-[#233447] transition-all text-left shadow-[0_1px_2px_rgba(32,42,46,0.02)] flex flex-col justify-between ${
                      span2 ? 'sm:col-span-2' : ''
                    }`}
                  >
                    <div className="flex justify-between items-center gap-1 pb-0.5 border-b border-[#E5E2DC]/80 dark:border-[#263544]">
                      <span className="text-[10.5px] md:text-[11px] font-bold text-[#626A6D] dark:text-[#94A3B8] uppercase tracking-wider block truncate">
                        {label}
                      </span>
                      <div className="shrink-0">
                        {getStatusBadge(key)}
                      </div>
                    </div>
                    
                    {isEditing ? (
                      <div className="flex items-center gap-1.5 mt-1 w-full">
                        {key === 'additionalDetails' ? (
                          <textarea
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            placeholder="Describe transition preference, certification needs..."
                            className="w-full px-2 py-0.5 text-xs md:text-sm border border-[#D8D5CE] dark:border-[#344658] bg-white dark:bg-[#141F2C] text-[#202A2E] dark:text-[#F1F5F9] rounded focus:outline-none focus:ring-1 focus:ring-[#A65F3F] dark:focus:ring-[#C5B76A] min-h-[30px] resize-y font-medium"
                          />
                        ) : (
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-full px-2 py-0.5 text-xs md:text-sm border border-[#D8D5CE] dark:border-[#344658] bg-white dark:bg-[#141F2C] text-[#202A2E] dark:text-[#F1F5F9] rounded focus:outline-none focus:ring-1 focus:ring-[#A65F3F] dark:focus:ring-[#C5B76A] font-medium"
                          />
                        )}
                        <button
                          onClick={() => handleSaveEdit(key)}
                          className="bg-[#35624A] hover:bg-[#284C39] dark:bg-[#173529] dark:hover:bg-[#204938] text-white dark:text-[#8FBEA1] p-1 rounded transition-colors cursor-pointer shrink-0 self-end shadow-sm"
                          title="Save value"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="mt-0.5 flex items-center justify-between gap-1.5 min-h-[18px]">
                        <span className={`text-xs md:text-[13px] font-bold leading-snug truncate ${val === 'Not specified' ? 'text-[#899093] dark:text-[#7F8D9B] font-normal italic' : 'text-[#202A2E] dark:text-[#F1F5F9]'}`}>
                          {val}
                        </span>
                        
                        {/* Action buttons */}
                        <div className="shrink-0 flex items-center gap-1.5">
                          {val !== 'Not specified' && !isConfirmed && (
                            <>
                              <button
                                onClick={() => confirmField(key)}
                                className="px-2 py-0.5 text-[10px] font-bold text-white bg-[#202A2E] hover:bg-[#141B1E] dark:bg-[#30483B] dark:hover:bg-[#3B5848] dark:text-[#F1F5F9] rounded transition-all cursor-pointer shadow-sm"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => handleStartEdit(key)}
                                className="px-2 py-0.5 text-[10px] font-semibold text-[#202A2E] dark:text-[#D7DEE6] border border-[#D8D5CE] dark:border-[#344658] bg-white hover:bg-[#F1EFEA] dark:bg-[#182536] dark:hover:bg-[#233447] rounded transition-all cursor-pointer"
                              >
                                Edit
                              </button>
                            </>
                          )}

                          {val !== 'Not specified' && isConfirmed && (
                            <div className="flex items-center gap-1 text-[10.5px] text-[#899093] dark:text-[#9AA9B8] font-medium">
                              <button
                                onClick={() => unconfirmField(key)}
                                className="hover:text-[#202A2E] dark:text-[#C5B76A] dark:hover:text-[#D5C76E] transition-all cursor-pointer underline"
                              >
                                Unconfirm
                              </button>
                              <span>•</span>
                              <button
                                onClick={() => handleStartEdit(key)}
                                className="hover:text-[#202A2E] dark:text-[#C5B76A] dark:hover:text-[#D5C76E] transition-all cursor-pointer underline"
                              >
                                Edit
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Panel Card Footer - Pinned Action Bar at Bottom */}
          <div className={`px-3.5 py-1.5 border-t border-[#D8D5CE] dark:border-[#344658] bg-white dark:bg-[#1D2B3A] flex flex-col gap-1 shrink-0 ${mobileSummaryOpen ? 'block' : 'hidden lg:block'}`}>
            {confirmedCount < 9 ? (
              <div className="text-[11.5px] font-bold text-[#9A7535] dark:text-[#D5C76E] bg-[#F5EDDA] dark:bg-[#3A3520] border border-[#E3D4B3] dark:border-[#625A2F] py-0.5 px-2 rounded text-center">
                {9 - confirmedCount} criteria still need your confirmation.
              </div>
            ) : (
              <div className="text-[11.5px] font-bold text-[#35624A] dark:text-[#8FBEA1] bg-[#E3ECE6] dark:bg-[#173529] border border-[#B7CCBC] dark:border-[#39634D] py-0.5 px-2 rounded text-center">
                ✓ All 9 criteria confirmed. Ready to approve!
              </div>
            )}

            <button
              onClick={handleContinue}
              disabled={confirmedCount < 9}
              className="w-full bg-[#202A2E] hover:bg-[#141B1E] dark:bg-[#E6E9E5] dark:text-[#101820] dark:hover:bg-[#FFFFFF] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs md:text-sm min-h-[34px] px-3 py-1 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-all shadow-[0_1px_3px_rgba(32,42,46,0.06)]"
            >
              <span>Approve Mandate & Continue</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default DefineMandate;
