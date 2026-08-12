import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import useResearchAgent from '../hooks/useResearchAgent';
import type { LayoutContextType } from '../components/layout/AppLayout';
import Button from '../components/ui/Button';
import ProgressBar from '../components/ui/ProgressBar';
import Badge from '../components/ui/Badge';
import { Send, Paperclip, Check, Edit2, ChevronDown, ChevronUp, ArrowRight, Bot, User, CheckCircle2 } from 'lucide-react';
import type { MandateCriteria } from '../api/researchAgent';

export const DefineMandate: React.FC = () => {
  const navigate = useNavigate();
  const { refreshApprovals } = useOutletContext<LayoutContextType>();
  
  const {
    messages,
    mandate,
    quickPrompts,
    activeField,
    isLoading,
    isComplete,
    sendMessage,
    updateSummaryFieldDirectly,
    saveDraft
  } = useResearchAgent();

  const [inputText, setInputText] = useState('');
  const [editingField, setEditingField] = useState<keyof MandateCriteria | null>(null);
  const [editValue, setEditValue] = useState('');
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);

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

  const handlePromptClick = async (promptText: string) => {
    if (isLoading) return;
    await sendMessage(promptText);
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
    // Save to storage
    const mandateObj = {
      id: 'mandate-101',
      title: 'Deal Sourcing Mandate',
      status: 'Approved', // Mark approved to unlock step 2
      rawInput: `Plastics Manufacturing in Australia. Size: ${mandate.companySize}. Revenue: ${mandate.revenueRange}.`,
      objective: `Acquire target matching ${mandate.targetIndustry} in ${mandate.geography}`,
      geography: mandate.geography,
      targetIndustry: mandate.targetIndustry,
      targetActivity: mandate.primaryActivities,
      revenueRange: { min: 15000000, max: 50000000, label: mandate.revenueRange },
      employeeRange: { min: 50, max: 150, label: mandate.companySize },
      ownershipPreference: mandate.ownershipProfile,
      successionPreference: mandate.successionPreference,
      industryExclusions: mandate.exclusions !== 'Not specified' ? [mandate.exclusions] : [],
      otherRequirements: '',
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem('dealsourcing_mandate', JSON.stringify(mandateObj));

    // Refresh approvals in Layout context to unlock step 2 path
    await refreshApprovals();

    // Navigate to next step
    navigate('/research');
  };

  // Calculate filled criteria for progress meter
  const confirmedCount = Object.values(mandate).filter(v => v !== 'Not specified').length;

  const getStatusBadge = (field: keyof MandateCriteria) => {
    const val = mandate[field];
    if (val === 'Not specified') {
      return <Badge variant="neutral" className="text-xs uppercase scale-95 border-none">To be confirmed</Badge>;
    }
    if (activeField === field) {
      return <Badge variant="primary" className="text-xs uppercase scale-95 border-none">Considering</Badge>;
    }
    return (
      <Badge variant="success" className="text-xs uppercase scale-95 border-none flex items-center gap-1">
        <Check className="h-3 w-3 stroke-[3px]" />
        Confirmed
      </Badge>
    );
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      {/* Page Title & Subtitle */}
      <div className="mb-2">
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Define Your Acquisition Mandate
        </h2>
        <p className="text-lg text-slate-500 dark:text-slate-400 mt-2">
          Chat with our Research Agent to define what kind of business you want to acquire.
        </p>
      </div>

      {/* Main Content: Split Grid for Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Clean Chat Workspace (65% width) */}
        <div className="lg:col-span-8 flex flex-col border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm min-h-[580px]">
          {/* Chat Workspace Header */}
          <div className="flex justify-between items-center px-6 py-4.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Research Agent Workspace</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Active mandate definition session</p>
            </div>
            <button
              onClick={() => alert("The Research Agent analyzes your text inputs, structures them into 8 key criteria dimensions, and verifies matching target companies.")}
              className="text-sm font-semibold text-slate-600 dark:text-slate-350 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 px-3 py-1.5 rounded-lg transition-colors cursor-pointer bg-white dark:bg-slate-900"
            >
              How it works
            </button>
          </div>

          {/* Messages Log Panel */}
          <div ref={chatContainerRef} className="flex-1 px-6 py-5 overflow-y-auto max-h-[420px] min-h-[350px] flex flex-col gap-5 bg-white dark:bg-slate-900">
            {messages.map((msg) => {
              const isAgent = msg.sender === 'agent';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 max-w-[85%] ${isAgent ? 'self-start text-left' : 'self-end flex-row-reverse text-right'}`}
                >
                  {/* Avatar box */}
                  <div className={`h-9 w-9 rounded-full shrink-0 flex items-center justify-center border ${isAgent ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-100 dark:border-blue-900 text-blue-600 dark:text-blue-400' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}>
                    {isAgent ? <Bot className="h-5 w-5" /> : <User className="h-5 w-5" />}
                  </div>

                  {/* Bubble text wrapper */}
                  <div className="flex flex-col gap-1">
                    <div
                      className={`px-4.5 py-3 rounded-2xl text-base leading-relaxed whitespace-pre-line border
                        ${isAgent 
                          ? 'bg-slate-50 dark:bg-slate-950/30 text-slate-800 dark:text-slate-200 border-slate-100 dark:border-slate-800 rounded-tl-none' 
                          : 'bg-blue-50/75 dark:bg-blue-950/20 text-slate-900 dark:text-slate-100 border-blue-100/50 dark:border-blue-900 rounded-tr-none'
                        }
                      `}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 px-1 mt-0.5 block">
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Agent Typing Indicator */}
            {isLoading && (
              <div className="flex gap-3 self-start max-w-[80%] items-center animate-pulse">
                <div className="h-9 w-9 rounded-full shrink-0 flex items-center justify-center border bg-blue-50 dark:bg-blue-950/40 border-blue-100 dark:border-blue-900 text-blue-600 dark:text-blue-400">
                  <Bot className="h-5 w-5" />
                </div>
                <div className="bg-slate-50 dark:bg-slate-950/30 border border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-sm px-4.5 py-3 rounded-2xl rounded-tl-none">
                  Research Agent is typing...
                </div>
              </div>
            )}
          </div>

          {/* Quick suggestions area */}
          {quickPrompts.length > 0 && (
            <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/10 flex flex-wrap gap-2 animate-fadeIn">
              {quickPrompts.map((p) => (
                <button
                  key={p}
                  onClick={() => handlePromptClick(p)}
                  disabled={isLoading}
                  className="px-3.5 py-2 text-sm font-semibold text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 rounded-full transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-slate-900"
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* Chat Form Input panel */}
          <form onSubmit={handleSend} className="px-6 py-4.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/20 flex items-center gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isLoading}
                placeholder="Type your answer or describe your requirements..."
                className="w-full pl-4 pr-10 py-3.5 text-base border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-slate-50 dark:disabled:bg-slate-900 disabled:text-slate-400"
              />
              <button
                type="button"
                className="absolute right-3 inset-y-0 flex items-center text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer"
                onClick={() => alert("Upload criteria document attachment (feature placeholder)")}
              >
                <Paperclip className="h-5 w-5" />
              </button>
            </div>
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="bg-brand-primary hover:bg-brand-primary-hover active:bg-brand-primary-dark text-white p-3.5 rounded-xl transition-all cursor-pointer shadow-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center shrink-0"
              aria-label="Send message to agent"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
          <div className="px-6 pb-4 text-xs text-slate-400 dark:text-slate-500 text-center font-medium">
            The more details you provide, the better we can find the right opportunities.
          </div>
        </div>

        {/* Right Side: Mandate Summary (35% width) - Desktop (sticky) */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 flex flex-col gap-4">
          
          {/* Mobile Accordion Toggle Trigger */}
          <button
            onClick={() => setMobileSummaryOpen(!mobileSummaryOpen)}
            className="w-full flex lg:hidden items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-slate-800 dark:text-slate-200 text-base"
          >
            <span>Live Mandate Summary ({confirmedCount}/8 Complete)</span>
            {mobileSummaryOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>

          {/* Summary Panel Card content */}
          <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col gap-6 text-left ${mobileSummaryOpen ? 'block' : 'hidden lg:flex'}`}>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">MANDATE SUMMARY</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Live interpretation of your acquisition criteria.</p>
            </div>

            {/* Checklist progress meter */}
            <div className="flex flex-col gap-1 bg-slate-50/50 dark:bg-slate-950/20 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
              <ProgressBar
                value={confirmedCount}
                max={8}
                label={`${confirmedCount} of 8 criteria confirmed`}
                size="sm"
              />
            </div>

            {/* Criteria List */}
            <div className="flex-1 flex flex-col gap-4 border-t border-slate-100 dark:border-slate-800 pt-4">
              {/* Field mapping array helper */}
              {([
                { key: 'targetIndustry', label: 'Target Industry' },
                { key: 'primaryActivities', label: 'Primary Activities' },
                { key: 'geography', label: 'Geography' },
                { key: 'revenueRange', label: 'Revenue Range' },
                { key: 'companySize', label: 'Company Size' },
                { key: 'ownershipProfile', label: 'Ownership Profile' },
                { key: 'successionPreference', label: 'Succession Preference' },
                { key: 'exclusions', label: 'Exclusions' }
              ] as const).map(({ key, label }) => {
                const isEditing = editingField === key;
                return (
                  <div key={key} className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-3 last:border-0 last:pb-0">
                    <div className="flex-1 pr-4 text-left">
                      <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                        {label}
                      </span>
                      {isEditing ? (
                        <div className="flex items-center gap-2 mt-1.5 w-full">
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                          <button
                            onClick={() => handleSaveEdit(key)}
                            className="bg-emerald-500 text-white p-1 rounded hover:bg-emerald-600 transition-colors"
                          >
                            <Check className="h-4.5 w-4.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-base font-bold text-slate-800 dark:text-slate-200">
                            {mandate[key]}
                          </span>
                          <button
                            onClick={() => handleStartEdit(key)}
                            className="text-slate-350 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-350 p-0.5 rounded transition-colors cursor-pointer"
                            aria-label={`Edit ${label}`}
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="shrink-0 pt-0.5">
                      {getStatusBadge(key)}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer timestamp & Actions */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex flex-col gap-3">
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 italic">
                Last updated: Just now
              </span>
              <Button
                variant="primary"
                onClick={handleContinue}
                disabled={!isComplete}
                rightIcon={<ArrowRight className="h-5 w-5" />}
                className="w-full"
              >
                Looks good, continue to Research Strategy
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  saveDraft();
                  setShowToast(true);
                  setTimeout(() => setShowToast(false), 3000);
                }}
                className="w-full"
              >
                Save Draft
              </Button>
            </div>

          </div>

        </div>

      </div>

      {/* Success Save Draft Toast Alert */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-fadeIn border border-emerald-500 text-base font-semibold">
          <CheckCircle2 className="h-5 w-5" />
          <span>Mandate draft saved successfully!</span>
        </div>
      )}

    </div>
  );
};
export default DefineMandate;
