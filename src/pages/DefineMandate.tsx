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
        <span className="text-[11px] font-bold text-[#7D8589] dark:text-[#6E7E88] uppercase tracking-wider bg-[#F8F6F1] dark:bg-[#1D272E] px-2 py-0.5 rounded border border-[#DED9D0] dark:border-[#2E3D47]">
          Not Provided
        </span>
      );
    }
    if (confirmedCriteria[field]) {
      return (
        <span className="text-[11px] font-extrabold text-[#53666F] dark:text-[#A4BCC7] uppercase tracking-wider bg-[#E8EEEF] dark:bg-[#203038] px-2.5 py-0.5 rounded border border-[#758A93]/50 dark:border-[#758A93] flex items-center gap-1">
          <Check className="h-3.5 w-3.5 stroke-[3px] text-[#758A93] dark:text-[#A4BCC7]" />
          Confirmed
        </span>
      );
    }
    return (
      <span className="text-[11px] font-extrabold text-[#997017] dark:text-[#E8C062] uppercase tracking-wider bg-[#FDF7E8] dark:bg-[#332B18] px-2.5 py-0.5 rounded border border-[#E9B63B]/40 dark:border-[#6E5A2A]">
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
          <h2 className="text-base md:text-lg font-black text-[#202A30] dark:text-[#F4F6F8] tracking-tight leading-tight">
            Define Your Acquisition Mandate
          </h2>
          <p className="text-[11.5px] text-[#5F6B72] dark:text-[#A4B2BA]">
            Chat with our Research Agent to refine parameters. All 9 criteria update live on the right.
          </p>
        </div>
        <div className="hidden lg:flex items-center gap-1.5 bg-[#E8EEEF] dark:bg-[#203038] border border-[#758A93]/40 dark:border-[#758A93] px-2.5 py-0.5 rounded-md text-[#53666F] dark:text-[#A4BCC7] text-xs font-bold shrink-0">
          <ShieldCheck className="h-3.5 w-3.5 text-[#758A93] dark:text-[#A4BCC7]" />
          <span>{confirmedCount}/9 Criteria Confirmed</span>
        </div>
      </div>

      {/* Main Content: Desktop Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
        
        {/* Left Side: Clean Chat Workspace (42% width / lg:col-span-5) */}
        <div className="lg:col-span-5 border border-[#DED9D0] dark:border-[#2E3D47] rounded-lg bg-white dark:bg-[#1D272E] flex flex-col min-h-[480px] lg:h-[545px] shadow-xs overflow-hidden">
          
          {/* Header Panel */}
          <div className="px-3.5 py-2 border-b border-[#DED9D0] dark:border-[#2E3D47] bg-[#F8F6F1] dark:bg-[#172025] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-[#E8EEEF] dark:bg-[#203038] text-[#758A93] dark:text-[#A4BCC7] flex items-center justify-center font-black text-xs shrink-0 border border-[#758A93]/40">
                <Sparkles className="h-2.5 w-2.5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#202A30] dark:text-[#F4F6F8] leading-tight">Research Agent</h3>
                <p className="text-[9.5px] text-[#5F6B72] dark:text-[#A4B2BA]">Interactive criteria assistant</p>
              </div>
            </div>
            <button
              onClick={() => alert("The Research Agent analyzes your text inputs, structures them into 9 key criteria dimensions, and verifies matching target companies.")}
              className="text-[10px] font-semibold text-[#5F6B72] dark:text-[#A4B2BA] hover:text-[#202A30] dark:hover:text-white border border-[#DED9D0] dark:border-[#2E3D47] hover:bg-[#F8F6F1] dark:hover:bg-[#243038] px-2 py-0.5 rounded transition-colors cursor-pointer bg-white dark:bg-[#1D272E]"
            >
              How it works
            </button>
          </div>

          {/* Messages Log Panel - Internal Scroll with smooth wheel pass-through */}
          <div ref={chatContainerRef} className="flex-1 min-h-0 px-3 pt-2 pb-2 overflow-y-auto flex flex-col gap-2 bg-[#F8F6F1]/60 dark:bg-[#13191D]">
            {messages.map((msg) => {
              const isAgent = msg.sender === 'agent';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col max-w-[90%] ${isAgent ? 'self-start items-start text-left' : 'self-end items-end text-right'}`}
                >
                  {/* Sender Tag Label */}
                  <span className={`text-[9px] font-extrabold tracking-wider uppercase mb-0.5 ${isAgent ? 'text-[#5F6B72] dark:text-[#A4B2BA]' : 'text-[#758A93] dark:text-[#A4BCC7]'}`}>
                    {isAgent ? 'RESEARCH AGENT' : 'YOU'}
                  </span>

                  {/* Rectangular Content Box */}
                  <div
                    className={`px-2.5 py-1.5 rounded-lg text-xs md:text-[12.5px] leading-relaxed whitespace-pre-line border shadow-xs
                      ${isAgent 
                        ? 'bg-[#ECD5BC]/20 text-[#202A30] dark:bg-[#2A231C]/60 dark:text-[#F4F6F8] border-[#ECD5BC]/70 dark:border-[#524132]' 
                        : 'bg-white text-[#202A30] border-[#DED9D0] dark:bg-[#243038] dark:text-[#F4F6F8] dark:border-[#3E515E]'
                      }
                    `}
                  >
                    {msg.text}
                  </div>
                  
                  {/* Timestamp */}
                  <span className="text-[8.5px] text-[#7D8589] dark:text-[#6E7E88] mt-0.5 block">
                    {msg.timestamp}
                  </span>
                </div>
              );
            })}

            {/* Agent Typing Indicator */}
            {isLoading && (
              <div className="flex flex-col self-start max-w-[85%] items-start animate-pulse">
                <span className="text-[9px] font-extrabold tracking-wider text-[#5F6B72] dark:text-[#A4B2BA] uppercase mb-0.5">
                  RESEARCH AGENT
                </span>
                <div className="bg-white dark:bg-[#1D272E] border border-[#DED9D0] dark:border-[#2E3D47] text-[#5F6B72] dark:text-[#A4B2BA] text-xs px-2.5 py-1 rounded-lg shadow-xs">
                  Analyzing criteria and updating mandate...
                </div>
              </div>
            )}
          </div>

          {/* Chat Form Input panel - Pinned at bottom */}
          <form onSubmit={handleSend} className="px-2.5 py-2 border-t border-[#DED9D0] dark:border-[#2E3D47] bg-white dark:bg-[#1D272E] flex items-center gap-2 shrink-0">
            <div className="relative flex-1">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isLoading}
                placeholder="Type requirements..."
                className="w-full pl-2.5 pr-7 py-1.5 text-xs md:text-sm border border-[#DED9D0] dark:border-[#2E3D47] bg-white dark:bg-[#13191D] text-[#202A30] dark:text-[#F4F6F8] placeholder-[#7D8589] dark:placeholder-[#6E7E88] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#758A93] dark:focus:ring-[#758A93] disabled:bg-[#F8F6F1] dark:disabled:bg-[#13191D] disabled:text-[#7D8589]"
              />
              <button
                type="button"
                className="absolute right-2 inset-y-0 flex items-center text-[#7D8589] hover:text-[#202A30] dark:text-[#A4B2BA] dark:hover:text-white cursor-pointer"
                onClick={() => alert("Upload criteria document attachment (feature placeholder)")}
                title="Attach document"
              >
                <Paperclip className="h-3.5 w-3.5" />
              </button>
            </div>
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="px-3.5 py-1.5 rounded-lg transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 text-xs font-bold shrink-0 bg-[#202A30] hover:bg-[#151D22] text-white dark:bg-[#F4F6F8] dark:text-[#13191D] dark:hover:bg-[#E4E8EB] shadow-xs"
              aria-label="Send message to agent"
            >
              <Send className="h-3 w-3" />
              <span>Send</span>
            </button>
          </form>
        </div>

        {/* Right Side: Mandate Summary (58% width / lg:col-span-7) — Same height as chat panel */}
        <div className="lg:col-span-7 flex flex-col min-h-[480px] lg:h-[545px] border border-[#DED9D0] dark:border-[#2E3D47] rounded-lg bg-white dark:bg-[#1D272E] shadow-xs overflow-hidden">
          
          {/* Mobile Accordion Toggle Trigger */}
          <button
            onClick={() => setMobileSummaryOpen(!mobileSummaryOpen)}
            className="w-full flex lg:hidden items-center justify-between p-2.5 bg-[#F8F6F1] dark:bg-[#172025] border-b border-[#DED9D0] dark:border-[#2E3D47] font-bold text-[#202A30] dark:text-[#F4F6F8] text-xs shrink-0"
          >
            <span>Acquisition Mandate ({confirmedCount}/9 Complete)</span>
            {mobileSummaryOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {/* Panel Card Header */}
          <div className={`px-4 py-2 border-b border-[#DED9D0] dark:border-[#2E3D47] bg-white dark:bg-[#1D272E] flex flex-col gap-1 shrink-0 ${mobileSummaryOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="flex items-center justify-between">
              <h3 className="text-xs md:text-sm font-black text-[#202A30] dark:text-[#F4F6F8] uppercase tracking-wider">ACQUISITION MANDATE</h3>
              <span className="text-xs md:text-sm font-black text-[#202A30] dark:text-[#F4F6F8]">{confirmedCount}/9 ({Math.round((confirmedCount / 9) * 100)}%)</span>
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
          <div className={`flex-1 min-h-0 overflow-y-auto p-2.5 bg-white dark:bg-[#1D272E] flex flex-col ${mobileSummaryOpen ? 'block' : 'hidden lg:flex'}`}>
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
                    className={`px-3 py-2 rounded-lg border border-[#DED9D0] dark:border-[#2E3D47] bg-[#F8F6F1]/40 dark:bg-[#172025] hover:bg-[#FAF3EC]/60 dark:hover:bg-[#243038] transition-all text-left shadow-xs flex flex-col justify-between ${
                      span2 ? 'sm:col-span-2' : ''
                    }`}
                  >
                    <div className="flex justify-between items-center gap-1 pb-1 border-b border-[#DED9D0]/70 dark:border-[#2E3D47]">
                      <span className="text-[10.5px] md:text-[11px] font-bold text-[#5F6B72] dark:text-[#A4B2BA] uppercase tracking-wider block truncate">
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
                            className="w-full px-2 py-1 text-xs md:text-sm border border-[#DED9D0] dark:border-[#2E3D47] bg-white dark:bg-[#13191D] text-[#202A30] dark:text-[#F4F6F8] rounded focus:outline-none focus:ring-1 focus:ring-[#758A93] min-h-[32px] resize-y font-medium"
                          />
                        ) : (
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-full px-2 py-1 text-xs md:text-sm border border-[#DED9D0] dark:border-[#2E3D47] bg-white dark:bg-[#13191D] text-[#202A30] dark:text-[#F4F6F8] rounded focus:outline-none focus:ring-1 focus:ring-[#758A93] font-medium"
                          />
                        )}
                        <button
                          onClick={() => handleSaveEdit(key)}
                          className="bg-[#758A93] hover:bg-[#62767F] text-white p-1.5 rounded transition-colors cursor-pointer shrink-0 self-end shadow-xs"
                          title="Save value"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="mt-1 flex items-center justify-between gap-1.5 min-h-[18px]">
                        <span className={`text-xs md:text-[13px] font-bold leading-snug truncate ${val === 'Not specified' ? 'text-[#7D8589] dark:text-[#6E7E88] font-normal italic' : 'text-[#202A30] dark:text-[#F4F6F8]'}`}>
                          {val}
                        </span>
                        
                        {/* Action buttons */}
                        <div className="shrink-0 flex items-center gap-1.5">
                          {val !== 'Not specified' && !isConfirmed && (
                            <>
                              <button
                                onClick={() => confirmField(key)}
                                className="px-2 py-0.5 text-[10px] font-bold text-white bg-[#202A30] hover:bg-[#151D22] dark:bg-[#F4F6F8] dark:text-[#13191D] rounded transition-all cursor-pointer shadow-xs"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => handleStartEdit(key)}
                                className="px-2 py-0.5 text-[10px] font-semibold text-[#5F6B72] dark:text-[#A4B2BA] border border-[#DED9D0] dark:border-[#2E3D47] bg-white hover:bg-[#F8F6F1] dark:bg-[#1D272E] dark:hover:bg-[#243038] rounded transition-all cursor-pointer"
                              >
                                Edit
                              </button>
                            </>
                          )}

                          {val !== 'Not specified' && isConfirmed && (
                            <div className="flex items-center gap-1 text-[10.5px] text-[#7D8589] dark:text-[#A4B2BA] font-medium">
                              <button
                                onClick={() => unconfirmField(key)}
                                className="hover:text-[#202A30] dark:text-[#758A93] dark:hover:text-[#A4BCC7] transition-all cursor-pointer underline"
                              >
                                Unconfirm
                              </button>
                              <span>•</span>
                              <button
                                onClick={() => handleStartEdit(key)}
                                className="hover:text-[#202A30] dark:text-[#758A93] dark:hover:text-[#A4BCC7] transition-all cursor-pointer underline"
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
          <div className={`px-4 py-2.5 border-t border-[#DED9D0] dark:border-[#2E3D47] bg-white dark:bg-[#1D272E] flex flex-col gap-1.5 shrink-0 ${mobileSummaryOpen ? 'block' : 'hidden lg:block'}`}>
            {confirmedCount < 9 ? (
              <div className="text-[11.5px] font-bold text-[#997017] dark:text-[#E8C062] bg-[#FDF7E8] dark:bg-[#332B18] border border-[#E9B63B]/30 dark:border-[#6E5A2A] py-1 px-2.5 rounded text-center">
                {9 - confirmedCount} criteria still need your confirmation.
              </div>
            ) : (
              <div className="text-[11.5px] font-bold text-[#53666F] dark:text-[#A4BCC7] bg-[#E8EEEF] dark:bg-[#203038] border border-[#758A93]/50 dark:border-[#758A93] py-1 px-2.5 rounded text-center">
                ✓ All 9 criteria confirmed. Ready to approve!
              </div>
            )}

            <button
              onClick={handleContinue}
              disabled={confirmedCount < 9}
              className="w-full bg-[#202A30] hover:bg-[#151D22] dark:bg-[#F4F6F8] dark:text-[#13191D] dark:hover:bg-[#E4E8EB] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs md:text-sm min-h-[38px] px-3 py-1.5 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs"
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
