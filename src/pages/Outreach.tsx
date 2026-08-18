import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate, useOutletContext, useLocation } from 'react-router-dom';
import { useCompanies } from '../hooks/useCompanies';
import { useMandate } from '../hooks/useMandate';
import { useMandateHistory } from '../context/MandateHistoryContext';
import { regenerateOutreachMessage, generateOutreachScriptsSync } from '../api/outreach';
import type {
  OutreachChannel,
  OutreachScriptType,
  OutreachScript,
  OutreachSet,
  Mandate,
} from '../types';

import LoadingState from '../components/ui/LoadingState';
import Button from '../components/ui/Button';
import CompanyKanban from '../components/companies/CompanyKanban';
import CompanyDetails from '../components/companies/CompanyDetails';
import GmailConnectModal, { type ConnectedEmailAccount } from '../components/outreach/GmailConnectModal';
import SendEmailModal from '../components/outreach/SendEmailModal';
import AutomateCampaignModal from '../components/outreach/AutomateCampaignModal';
import Badge from '../components/ui/Badge';
import { MOCK_ENRICHMENT_DATA } from '../api/enrichment';
import {
  ArrowLeft, Sparkles, AlertTriangle, Users, Search,
  Target, Mail, Link2, MessageSquare, Copy, CheckCheck,
  RefreshCw, ChevronRight, ChevronDown, Pencil, Kanban,
  Send, CheckCircle2, Building2
} from 'lucide-react';

// STEP_LABELS removed because it is unused

// ── Icon map for each script type (channel card) ─────────────────────────────
const CHANNEL_ICONS: Record<string, React.ReactNode> = {
  email:         <Mail className="h-5 w-5" />,
  linkedin:      <Link2 className="h-5 w-5" />,
  followup:      <MessageSquare className="h-5 w-5" />,
  professional:  <Mail className="h-5 w-5" />,
  founder:       <Mail className="h-5 w-5" />,
  direct:        <Link2 className="h-5 w-5" />,
};

const CHANNEL_COLORS: Record<string, string> = {
  email:        'bg-[#E8EEEF] text-[#53666F] dark:bg-[#203038] dark:text-[#A4BCC7]',
  linkedin:     'bg-[#F8F6F1] text-[#5F6B72] dark:bg-[#243038] dark:text-[#A4B2BA]',
  direct:       'bg-[#F8F6F1] text-[#5F6B72] dark:bg-[#243038] dark:text-[#A4B2BA]',
  followup:     'bg-[#FDF7E8] text-[#997017] dark:bg-[#332B18] dark:text-[#E8C062]',
  professional: 'bg-[#E8EEEF] text-[#53666F] dark:bg-[#203038] dark:text-[#A4BCC7]',
  founder:      'bg-[#E8EEEF] text-[#53666F] dark:bg-[#203038] dark:text-[#A4BCC7]',
};

// ── Inline editable message card ─────────────────────────────────────────────
interface MessageCardProps {
  script: OutreachScript;
  channel: OutreachChannel;
  label: string;
  angleNote?: string;
  sourceNote?: string;
  ctaNote?: string;
  iconKey: string;
  isRegenerating: boolean;
  onRegenerate: () => void;
  onEdit: (subject: string, body: string) => void;
  onSendEmail?: (subject: string, body: string) => void;
  isSent?: boolean;
}

const MessageCard: React.FC<MessageCardProps> = ({
  script, channel, label, angleNote, sourceNote, ctaNote,
  iconKey, isRegenerating, onRegenerate, onEdit, onSendEmail, isSent,
}) => {
  const [subject, setSubject] = useState(script.subject);
  const [body, setBody]       = useState(script.body);
  const [copied, setCopied]   = useState(false);
  const [editing, setEditing] = useState(false);

  // Sync when script changes
  React.useEffect(() => {
    setSubject(script.subject);
    setBody(script.body);
    setEditing(false);
  }, [script.subject, script.body]);

  const handleCopy = async () => {
    const text = channel === 'email' && subject ? `Subject: ${subject}\n\n${body}` : body;
    try { await navigator.clipboard.writeText(text); } catch { /* ignore */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleBodyChange = (val: string) => {
    setBody(val);
    onEdit(subject, val);
  };
  const handleSubjectChange = (val: string) => {
    setSubject(val);
    onEdit(val, body);
  };

  const iconColorClass = CHANNEL_COLORS[iconKey] ?? CHANNEL_COLORS.email;
  const iconNode       = CHANNEL_ICONS[iconKey] ?? <Mail className="h-5 w-5" />;

  return (
    <div className="border border-default rounded-xl overflow-hidden bg-card">
      {/* Card header */}
      <div className="flex items-start gap-3 px-5 pt-4 pb-3">
        <div className={`p-2 rounded-lg shrink-0 ${iconColorClass}`}>
          {iconNode}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-primary leading-tight">{label}</p>
          {angleNote && (
            <p className="text-xs text-secondary mt-0.5 italic">{angleNote}</p>
          )}
          {channel === 'email' && subject && !angleNote && (
            <p className="text-xs text-secondary mt-0.5">
              <span className="font-semibold text-primary">Subject:</span>{' '}
              <span className="text-brand-primary">{subject}</span>
            </p>
          )}
        </div>
      </div>

      {/* Subject field (email, editable mode) */}
      {channel === 'email' && editing && (
        <div className="px-5 pb-2">
          <input
            type="text"
            value={subject}
            onChange={e => handleSubjectChange(e.target.value)}
            disabled={isRegenerating}
            className="w-full px-3 py-2 border border-default rounded-lg bg-card text-primary font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/40 dark:bg-slate-900 dark:border-slate-700"
            placeholder="Subject line..."
          />
        </div>
      )}

      {/* Message body */}
      <div className="px-5 pb-3">
        <div className="bg-slate-50 dark:bg-slate-900/50 border border-default rounded-lg p-4">
          {isRegenerating ? (
            <div className="flex items-center gap-3 py-6 justify-center">
              <RefreshCw className="h-5 w-5 text-brand-primary animate-spin" />
              <span className="text-sm text-secondary font-semibold">Regenerating...</span>
            </div>
          ) : editing ? (
            <textarea
              value={body}
              onChange={e => handleBodyChange(e.target.value)}
              rows={10}
              className="w-full bg-transparent text-sm text-primary leading-relaxed resize-y focus:outline-none font-normal"
            />
          ) : (
            <pre className="text-sm text-primary leading-relaxed whitespace-pre-wrap font-sans">{body}</pre>
          )}
        </div>

        {/* Source / CTA note */}
        {sourceNote && !editing && (
          <p className="text-xs text-secondary italic mt-2 flex items-start gap-1.5">
            <span className="font-bold text-slate-400 mt-0.5">„„</span>
            {sourceNote}
          </p>
        )}
        {ctaNote && !editing && (
          <p className="text-xs text-brand-primary mt-2 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 shrink-0" />
            <span className="font-semibold">{ctaNote}</span>
          </p>
        )}
      </div>

      {/* Footer actions */}
      <div className="flex items-center gap-2 px-5 pb-4 border-t border-default pt-3">
        <button
          onClick={handleCopy}
          disabled={isRegenerating || !body}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-default bg-card hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-primary transition-colors disabled:opacity-40"
        >
          {copied ? <CheckCheck className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'Copied!' : 'Copy'}
        </button>

        {editing ? (
          <button
            onClick={() => setEditing(false)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand-primary bg-brand-primary-light text-brand-primary text-xs font-semibold transition-colors"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Done
          </button>
        ) : (
          <button
            onClick={() => setEditing(true)}
            disabled={isRegenerating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-default bg-card hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-primary transition-colors disabled:opacity-40"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </button>
        )}

        {/* ── Direct Gmail Send Action ── */}
        {onSendEmail && channel === 'email' && (
          <button
            onClick={() => onSendEmail(subject, body)}
            disabled={isRegenerating || !body}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border text-xs font-extrabold transition-all cursor-pointer ${
              isSent
                ? 'border-[#35624A] bg-[#E3ECE6] text-[#35624A] dark:bg-[#173529] dark:text-[#8FBEA1]'
                : 'border-[#35624A] bg-[#35624A] text-white hover:bg-[#274A37] shadow-xs'
            }`}
          >
            {isSent ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-[#35624A] dark:text-[#8FBEA1]" />
                <span>Dispatched via Gmail</span>
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                <span>Send via Gmail</span>
              </>
            )}
          </button>
        )}

        <button
          onClick={onRegenerate}
          disabled={isRegenerating}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-default bg-card hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-secondary transition-colors disabled:opacity-40 ml-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
          Regenerate
        </button>
      </div>
    </div>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────
const Outreach: React.FC = () => {
  const navigate = useNavigate();
  const { search } = useLocation();
  const queryParams = useMemo(() => new URLSearchParams(search), [search]);
  const urlCompanyId = queryParams.get('companyId');

  const { companies, allCompaniesRaw, enrichedIds, selectedIds, loading: companiesLoading } = useCompanies();
  const { activeId } = useMandateHistory();
  const activeMandateId = activeId || localStorage.getItem('dealsourcing_mandates_active_id') || 'mandate-101';
  const { mandate, loading: mandateLoading } = useMandate(activeMandateId);

  const displayCompanies = allCompaniesRaw.length > 0 ? allCompaniesRaw : companies;
  const selectedCompanies = useMemo(
    () => displayCompanies.filter(c => selectedIds.includes(c.id)),
    [displayCompanies, selectedIds]
  );

  const { refreshSavedOutreach } = useOutletContext<any>() || {};

  const [activeCompanyId, setActiveCompanyId] = useState<string | null>(null);

  // Set activeCompanyId from URL param (when navigating from saved outreach)
  // or default to first enriched/selected company
  useEffect(() => {
    if (urlCompanyId) {
      setActiveCompanyId(urlCompanyId);
    }
  }, [urlCompanyId]);

  useEffect(() => {
    if (!urlCompanyId && selectedCompanies.length > 0 && !activeCompanyId) {
      const enrichedFirst = selectedCompanies.find(c => enrichedIds.includes(c.id));
      setActiveCompanyId(enrichedFirst?.id ?? selectedCompanies[0]?.id ?? null);
    }
  }, [urlCompanyId, selectedCompanies, enrichedIds, activeCompanyId]);
  const channel: OutreachChannel = 'email';
  const [activeScriptType, setActiveScriptType] = useState<OutreachScriptType>('professional');
  const [outreachSets, setOutreachSets] = useState<Record<string, OutreachSet>>({});
  const [editedScripts, setEditedScripts] = useState<Record<string, Record<OutreachScriptType, { subject: string; body: string }>>>({});
  const [regenerating, setRegenerating] = useState(false);
  const [researchOpen, setResearchOpen] = useState(false);
  const [saveDropdownOpen, setSaveDropdownOpen] = useState(false);
  const [outreachViewMode, setOutreachViewMode] = useState<'kanban' | 'scripts'>('scripts');
  const [selectedModalCompanyId, setSelectedModalCompanyId] = useState<string | null>(null);

  // ── Connected Gmail Account State ──
  const [connectedAccount, setConnectedAccount] = useState<ConnectedEmailAccount | null>(() => {
    const saved = localStorage.getItem('dealsourcing_connected_email');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return {
      email: 'bhavya.acquisitions@gmail.com',
      senderName: 'Bhavya — M&A Partner',
      provider: 'gmail',
      connectedAt: new Date().toISOString(),
      dailyQuotaRemaining: 492,
    };
  });

  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [sendEmailModalConfig, setSendEmailModalConfig] = useState<{
    company: any;
    subject: string;
    body: string;
  } | null>(null);
  const [automateCampaignModalOpen, setAutomateCampaignModalOpen] = useState(false);
  const [sentCompanyIds, setSentCompanyIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('dealsourcing_sent_emails');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return [];
  });
  const [outreachToast, setOutreachToast] = useState<string | null>(null);

  const handleConnectAccount = (account: ConnectedEmailAccount) => {
    setConnectedAccount(account);
    localStorage.setItem('dealsourcing_connected_email', JSON.stringify(account));
    setOutreachToast(`Connected Gmail: ${account.email}`);
    setTimeout(() => setOutreachToast(null), 3500);
  };

  const handleDisconnectAccount = () => {
    setConnectedAccount(null);
    localStorage.removeItem('dealsourcing_connected_email');
    setOutreachToast('Disconnected email account.');
    setTimeout(() => setOutreachToast(null), 3500);
  };

  const handleSendEmailSuccess = (companyId: string, isAutomatedSequence: boolean) => {
    const updatedSent = Array.from(new Set([...sentCompanyIds, companyId]));
    setSentCompanyIds(updatedSent);
    localStorage.setItem('dealsourcing_sent_emails', JSON.stringify(updatedSent));

    // Update Kanban stage to 'contacted'
    const savedStages = localStorage.getItem('dealsourcing_kanban_stages');
    let stagesObj: Record<string, string> = {};
    if (savedStages) {
      try { stagesObj = JSON.parse(savedStages); } catch { /* ignore */ }
    }
    stagesObj[companyId] = 'contacted';
    localStorage.setItem('dealsourcing_kanban_stages', JSON.stringify(stagesObj));

    setOutreachToast(
      isAutomatedSequence
        ? '3-Touch Automated Cadence launched via Gmail!'
        : 'Email dispatched successfully via Gmail!'
    );
    setTimeout(() => setOutreachToast(null), 4000);
  };

  const handleBulkCampaignSuccess = (companyIds: string[]) => {
    const updatedSent = Array.from(new Set([...sentCompanyIds, ...companyIds]));
    setSentCompanyIds(updatedSent);
    localStorage.setItem('dealsourcing_sent_emails', JSON.stringify(updatedSent));

    // Update Kanban stage for all to 'contacted'
    const savedStages = localStorage.getItem('dealsourcing_kanban_stages');
    let stagesObj: Record<string, string> = {};
    if (savedStages) {
      try { stagesObj = JSON.parse(savedStages); } catch { /* ignore */ }
    }
    companyIds.forEach(id => { stagesObj[id] = 'contacted'; });
    localStorage.setItem('dealsourcing_kanban_stages', JSON.stringify(stagesObj));

    setOutreachToast(`Automated acquisition sequence launched for ${companyIds.length} target companies!`);
    setTimeout(() => setOutreachToast(null), 4500);
  };

  const activeCompany    = displayCompanies.find(c => c.id === activeCompanyId) ?? null;
  const activeOutreachSet = activeCompanyId ? outreachSets[activeCompanyId] : undefined;
  const hasScripts       = !!activeOutreachSet?.scripts?.length;

  // When coming from saved outreach (urlCompanyId present), include that company
  // even if it's not in selectedCompanies for this mandate
  const urlCompany = urlCompanyId ? displayCompanies.find(c => c.id === urlCompanyId) ?? null : null;
  const companiesToProcess = useMemo(() => {
    if (urlCompany && !selectedCompanies.some(c => c.id === urlCompany.id)) {
      return [...selectedCompanies, urlCompany];
    }
    return selectedCompanies;
  }, [selectedCompanies, urlCompany]);

  // Auto-generate scripts for all companies to process (selected + url company)
  useEffect(() => {
    const allToProcess = companiesToProcess;
    if (allToProcess.length > 0) {
      const finalMandate = (mandate || {
        id: activeMandateId,
        title: 'Plastics Manufacturing Mandate',
        status: 'Approved',
        rawInput: '',
        objective: 'Search for plastics businesses',
        geography: 'Australia',
        targetIndustry: 'Plastics Manufacturing',
      }) as Mandate;
      setOutreachSets(prev => {
        let changed = false;
        const next = { ...prev };
        allToProcess.forEach(c => {
          if (!next[c.id]) {
            next[c.id] = {
              companyId: c.id,
              channel: 'email',
              scripts: generateOutreachScriptsSync(c, finalMandate, 'email'),
              generatedAt: new Date().toISOString()
            };
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    }
  }, [companiesToProcess, mandate, activeMandateId]);

  const getScript = useCallback((type: OutreachScriptType): OutreachScript | null => {
    if (!hasScripts || !activeCompanyId) return null;
    const base = activeOutreachSet!.scripts.find(s => s.type === type) ?? activeOutreachSet!.scripts[0];
    const edited = editedScripts[activeCompanyId]?.[base.type];
    return edited ? { ...base, subject: edited.subject, body: edited.body } : base;
  }, [hasScripts, activeOutreachSet, editedScripts, activeCompanyId]);

  const handleCompanySelect = useCallback((id: string) => {
    setActiveCompanyId(id);
    setActiveScriptType('professional');
    setResearchOpen(false);
  }, []);

  const handleSaveAction = (actionType: 'single-new' | 'single-add' | 'full-new' | 'full-overwrite') => {
    if (!activeCompany) return;

    const savedKey = 'dealsourcing_saved_outreach';
    const stored = localStorage.getItem(savedKey);
    let list: any[] = [];
    if (stored) {
      try {
        list = JSON.parse(stored);
      } catch (e) {
        console.error(e);
      }
    }

    const finalMandate = (mandate || {
      id: activeMandateId,
      title: 'Plastics Manufacturing Mandate',
    }) as Mandate;

    const buildProspectItem = (comp: any) => {
      const set = outreachSets[comp.id] || {
        scripts: generateOutreachScriptsSync(comp, finalMandate, 'email')
      };
      return {
        companyId: comp.id,
        companyName: comp.name,
        contactName: comp.enrichmentData?.contactPerson || comp.enrichmentData?.founderName || comp.name,
        scripts: set.scripts.map(s => ({
          type: s.type,
          label: s.label,
          subject: editedScripts[comp.id]?.[s.type]?.subject || s.subject,
          body: editedScripts[comp.id]?.[s.type]?.body || s.body,
        }))
      };
    };

    if (actionType === 'single-new') {
      const prospectName = activeCompany.enrichmentData?.contactPerson || activeCompany.name;
      const newItem = {
        id: `save-${Date.now()}`,
        title: `Outreach - ${prospectName} (${new Date().toLocaleDateString()})`,
        savedAt: new Date().toISOString(),
        mandateId: activeMandateId,
        prospects: [buildProspectItem(activeCompany)]
      };
      list.unshift(newItem);
      alert(`Saved outreach for ${prospectName} as a new entry!`);
    } else if (actionType === 'single-add') {
      if (list.length === 0) {
        handleSaveAction('single-new');
        return;
      }
      const lastItem = list[0];
      if (!lastItem.prospects.some((p: any) => p.companyId === activeCompany.id)) {
        lastItem.prospects.push(buildProspectItem(activeCompany));
        lastItem.savedAt = new Date().toISOString();
        alert(`Added ${activeCompany.name} to "${lastItem.title}"!`);
      } else {
        alert(`${activeCompany.name} is already in the current save!`);
      }
    } else if (actionType === 'full-new') {
      const newItem = {
        id: `save-${Date.now()}`,
        title: `Full Analysis - ${selectedCompanies.length} targets (${new Date().toLocaleDateString()})`,
        savedAt: new Date().toISOString(),
        mandateId: activeMandateId,
        prospects: selectedCompanies.map(c => buildProspectItem(c))
      };
      list.unshift(newItem);
      alert(`Saved full analysis with ${selectedCompanies.length} prospects!`);
    } else if (actionType === 'full-overwrite') {
      if (list.length === 0) {
        handleSaveAction('full-new');
        return;
      }
      const lastItem = list[0];
      lastItem.prospects = selectedCompanies.map(c => buildProspectItem(c));
      lastItem.savedAt = new Date().toISOString();
      lastItem.title = `Full Analysis - ${selectedCompanies.length} targets (Updated)`;
      alert(`Overwrote current save "${lastItem.title}" with full analysis!`);
    }

    localStorage.setItem(savedKey, JSON.stringify(list));
    if (refreshSavedOutreach) {
      refreshSavedOutreach();
    }
  };

  const handleRegenerate = useCallback(async (type: OutreachScriptType) => {
    if (!activeCompany) return;
    const finalMandate = (mandate || {
      id: activeMandateId,
      title: 'Plastics Manufacturing Mandate',
      status: 'Approved',
      rawInput: '',
      objective: 'Search for plastics businesses',
      geography: 'Australia',
      targetIndustry: 'Plastics Manufacturing',
    }) as Mandate;
    setRegenerating(true);
    try {
      const refreshed = await regenerateOutreachMessage(activeCompany, finalMandate, type, channel);
      setOutreachSets(prev => {
        const existing = prev[activeCompany.id];
        if (!existing) return prev;
        return {
          ...prev,
          [activeCompany.id]: {
            ...existing,
            scripts: existing.scripts.map(s => s.type === type ? refreshed : s),
          },
        };
      });
      setEditedScripts(prev => {
        const companyEdits = { ...(prev[activeCompany.id] ?? {}) };
        delete companyEdits[type];
        return { ...prev, [activeCompany.id]: companyEdits };
      });
    } finally {
      setRegenerating(false);
    }
  }, [activeCompany, mandate, channel, activeMandateId]);

  const handleEdit = useCallback((type: OutreachScriptType, subject: string, body: string) => {
    if (!activeCompanyId) return;
    setEditedScripts(prev => ({
      ...prev,
      [activeCompanyId]: { ...(prev[activeCompanyId] ?? {}), [type]: { subject, body } },
    }));
  }, [activeCompanyId]);

  if (companiesLoading || mandateLoading) return <LoadingState message="Loading outreach workspace..." />;

  if (companiesToProcess.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-20 text-center">
        <div className="p-4 bg-amber-100 dark:bg-amber-950/30 rounded-full">
          <AlertTriangle className="h-10 w-10 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-primary mb-2">No Companies Selected</h2>
          <p className="text-secondary text-base max-w-md">
            Please return to Enrich Leads and select at least one company to continue to outreach.
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate('/review')} leftIcon={<ArrowLeft className="h-4 w-4" />}>
          Back to Enrich Leads
        </Button>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6 text-left">

      {/* View Mode Toggle: Kanban Deal Tracker vs Script Generator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D8D5CE] dark:border-[#263544] pb-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-primary tracking-tight">
            {outreachViewMode === 'kanban' ? 'Deal Pipeline & Stage Tracking' : 'Outreach Communications Plan'}
          </h2>
          <p className="text-sm text-secondary mt-1">
            {outreachViewMode === 'kanban'
              ? 'Track each selected candidate across M&A stages and mark priority tiers (HIGH, MEDIUM, LOW).'
              : 'Ultra-personalized messages for each selected prospect, based on verified founder research.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* View toggle */}
          <div className="flex bg-[#F1EFEA] dark:bg-[#141F2C] p-1 rounded-lg border border-[#D8D5CE] dark:border-[#2D4053] select-none">
            <button
              onClick={() => setOutreachViewMode('scripts')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-md cursor-pointer transition-colors ${
                outreachViewMode === 'scripts'
                  ? 'bg-white dark:bg-[#1D2B3A] text-primary shadow-xs'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              <Mail className="h-3.5 w-3.5" />
              <span>Outreach Scripts</span>
            </button>
            <button
              onClick={() => setOutreachViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-md cursor-pointer transition-colors ${
                outreachViewMode === 'kanban'
                  ? 'bg-white dark:bg-[#1D2B3A] text-primary shadow-xs'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              <Kanban className="h-3.5 w-3.5" />
              <span>Deal Kanban</span>
            </button>
          </div>

          {/* Dropdown save container */}
          <div className="relative shrink-0 z-40">
            <button
              onClick={() => setSaveDropdownOpen(v => !v)}
              className="flex items-center gap-1.5 px-3 py-2 border border-default bg-card hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-semibold rounded-lg text-primary cursor-pointer transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
              title="Save options"
            >
              <svg className="h-4 w-4 text-[#A855F7]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8m-5 5h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293h3.172a1 1 0 00.707-.293l2.414-2.414a1 1 0 01.707-.293H20" />
              </svg>
              <ChevronDown className="h-4 w-4 text-[#A855F7]" />
            </button>

            {saveDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setSaveDropdownOpen(false)} />
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-default rounded-xl shadow-xl z-50 py-1.5 text-left divide-y divide-default animate-fadeIn">
                  <div className="py-1">
                    <button
                      onClick={() => { handleSaveAction('single-new'); setSaveDropdownOpen(false); }}
                      className="w-full px-4 py-2 text-xs font-semibold text-primary hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer text-left"
                    >
                      <svg className="h-4 w-4 text-[#A855F7]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m-9 1V4a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                      </svg>
                      Save this prospect only (new save)
                    </button>
                    <button
                      onClick={() => { handleSaveAction('single-add'); setSaveDropdownOpen(false); }}
                      className="w-full px-4 py-2 text-xs font-semibold text-primary hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer text-left"
                    >
                      <svg className="h-4 w-4 text-[#A855F7]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Add this prospect to current save
                    </button>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => { handleSaveAction('full-new'); setSaveDropdownOpen(false); }}
                      className="w-full px-4 py-2 text-xs font-semibold text-primary hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer text-left"
                    >
                      <svg className="h-4 w-4 text-[#A855F7]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                      </svg>
                      Save full analysis (new save)
                    </button>
                    <button
                      onClick={() => { handleSaveAction('full-overwrite'); setSaveDropdownOpen(false); }}
                      className="w-full px-4 py-2 text-xs font-semibold text-primary hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer text-left"
                    >
                      <svg className="h-4 w-4 text-[#A855F7]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H17m-6 3a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Overwrite current save with full analysis
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {outreachViewMode === 'kanban' ? (
        <CompanyKanban
          companies={companiesToProcess}
          onView={(id) => setSelectedModalCompanyId(id)}
        />
      ) : (
        <>
          {/* ── Company selector tabs ────────────────────────────────────────── */}
          <div className="flex flex-wrap gap-2">
            {companiesToProcess.map(company => {
              const isActive   = company.id === activeCompanyId;
              const isEnriched = enrichedIds.includes(company.id);
              return (
                <button
                  key={company.id}
                  onClick={() => handleCompanySelect(company.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg border text-xs md:text-sm font-bold transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'border-[#202A2E] dark:border-[#C5B76A] bg-[#EDEBE5] dark:bg-slate-800 text-[#202A2E] dark:text-white shadow-xs'
                      : 'border-[#D8D5CE] dark:border-[#344658] bg-white dark:bg-card text-[#202A2E] dark:text-slate-200 hover:bg-[#F1EFEA] dark:hover:bg-slate-800/50'
                  }`}
                >
                  <Building2 className={`h-3.5 w-3.5 shrink-0 ${isActive ? 'text-[#202A2E] dark:text-[#C5B76A]' : isEnriched ? 'text-[#35624A] dark:text-[#8FBEA1]' : 'text-[#9A7535]'}`} />
                  <span>{company.name}</span>
                </button>
              );
            })}
          </div>

          {/* ── Main content ─────────────────────────────────────────────────── */}
          {!activeCompany ? (
            <div className="border border-[#D8D5CE] dark:border-slate-800 rounded-xl p-10 text-center text-[#626A6D] bg-white dark:bg-card">
              Select a company above to begin.
            </div>
          ) : (
            <div className="flex flex-col gap-4 animate-fadeIn">

              {/* Contact card */}
              <div className="border border-[#D8D5CE] dark:border-slate-800 rounded-xl px-5 py-4 bg-white dark:bg-card flex items-center justify-between gap-4 shadow-[0_1px_3px_rgba(32,42,46,0.04)] flex-wrap">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-lg bg-[#EDEBE5] dark:bg-slate-800 shrink-0">
                    <Users className="h-5 w-5 text-[#202A2E] dark:text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-primary">
                      {activeCompany.enrichmentData?.contactPerson || activeCompany.enrichmentData?.founderName || MOCK_ENRICHMENT_DATA[activeCompany.id]?.founderName || activeCompany.name}
                    </p>
                    <p className="text-xs text-secondary mt-0.5">
                      <span>{activeCompany.enrichmentData?.founderRole || MOCK_ENRICHMENT_DATA[activeCompany.id]?.founderRole || 'Founder & Principal'} · </span>
                      <span className="text-brand-primary font-semibold">{activeCompany.name}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {enrichedIds.includes(activeCompany.id) ? (
                    <Badge variant="success" className="text-xs">ENRICHED</Badge>
                  ) : (
                    <Badge variant="neutral" className="text-xs">PUBLIC INTEL</Badge>
                  )}
                </div>
              </div>

          {/* Research Insights — collapsible */}
          <div className="border border-default rounded-xl overflow-hidden bg-card">
            <button
              onClick={() => setResearchOpen(v => !v)}
              className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
            >
              <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 shrink-0">
                <Search className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <span className="flex-1 text-sm font-bold text-primary">Research Insights</span>
              {researchOpen
                ? <ChevronDown className="h-4 w-4 text-secondary" />
                : <ChevronRight className="h-4 w-4 text-secondary" />
              }
            </button>
            {researchOpen && (
              <div className="px-5 pb-4 border-t border-default">
                <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Company</p>
                    <p className="font-semibold text-primary">{activeCompany.name}</p>
                    <p className="text-secondary text-xs mt-0.5">{activeCompany.industry} · {activeCompany.location}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Revenue / Employees</p>
                    <p className="font-semibold text-primary">{activeCompany.revenueRange}</p>
                    <p className="text-secondary text-xs mt-0.5">{activeCompany.employeeRange} employees</p>
                  </div>
                  {activeCompany.enrichmentData?.bio && (
                    <div className="sm:col-span-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Founder Background</p>
                      <p className="text-secondary text-xs leading-relaxed italic">"{activeCompany.enrichmentData.bio}"</p>
                    </div>
                  )}
                  {activeCompany.whyItMatches && (
                    <div className="sm:col-span-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Why It Matches</p>
                      <p className="text-secondary text-xs leading-relaxed">{activeCompany.whyItMatches}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Chosen Angle */}
          <div className="border border-default rounded-xl px-5 py-4 bg-card flex items-start gap-3">
            <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/30 shrink-0 mt-0.5">
              <Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-primary">Chosen Angle</p>
              <p className="text-xs text-secondary mt-0.5 leading-relaxed">{activeCompany.whyItMatches}</p>
            </div>
          </div>

          {/* ── Generated scripts (displayed automatically without generate button) ── */}
          {hasScripts && activeOutreachSet && (
            <div className="flex flex-col gap-4">
              {activeOutreachSet.scripts.map(script => {
                const scriptObj = getScript(script.type);
                if (!scriptObj) return null;

                let iconKey = 'email';
                let cardLabel = script.label;
                let angleNote: string | undefined;
                let ctaNote: string | undefined;
                let cardChannel: OutreachChannel = 'email';

                if (script.type === 'professional') {
                  iconKey = 'email';
                  cardLabel = 'Email';
                  cardChannel = 'email';
                } else if (script.type === 'direct') {
                  iconKey = 'linkedin';
                  cardLabel = 'LinkedIn Message';
                  cardChannel = 'linkedin';
                  angleNote = `${activeCompany.name}'s public announcements and recent activities.`;
                } else if (script.type === 'founder') {
                  iconKey = 'followup';
                  cardLabel = 'Follow-up Email';
                  cardChannel = 'email';
                  angleNote = `Angle: Different angle on geographic fit and cross-border venture exposure rather than AI theme overlap.`;
                }

                const bodyLines = scriptObj.body.split('\n');
                const ctaLine = bodyLines.find(l => l.toLowerCase().startsWith('cta:') || l.toLowerCase().includes('worth a') || l.toLowerCase().includes('intro call'));
                if (ctaLine) ctaNote = `CTA: ${ctaLine.replace(/^CTA:\s*/i, '')}`;

                return (
                  <MessageCard
                    key={script.type}
                    script={scriptObj}
                    channel={cardChannel}
                    label={cardLabel}
                    angleNote={angleNote}
                    ctaNote={ctaNote}
                    iconKey={iconKey}
                    isRegenerating={regenerating && activeScriptType === script.type}
                    onRegenerate={() => {
                      setActiveScriptType(script.type);
                      handleRegenerate(script.type);
                    }}
                    onEdit={(subj, bod) => handleEdit(script.type, subj, bod)}
                    onSendEmail={cardChannel === 'email' ? (subj, bod) => {
                      setSendEmailModalConfig({
                        company: activeCompany,
                        subject: subj,
                        body: bod,
                      });
                    } : undefined}
                    isSent={sentCompanyIds.includes(activeCompany.id)}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}
        </>
      )}

      {/* ── Direct Send Email Modal ── */}
      {sendEmailModalConfig && (
        <SendEmailModal
          isOpen={sendEmailModalConfig !== null}
          onClose={() => setSendEmailModalConfig(null)}
          company={sendEmailModalConfig.company}
          connectedAccount={connectedAccount}
          onOpenConnectModal={() => {
            setSendEmailModalConfig(null);
            setConnectModalOpen(true);
          }}
          onOpenAutomateCampaignModal={() => {
            setSendEmailModalConfig(null);
            setAutomateCampaignModalOpen(true);
          }}
          defaultSubject={sendEmailModalConfig.subject}
          defaultBody={sendEmailModalConfig.body}
          onSendSuccess={handleSendEmailSuccess}
        />
      )}

      {/* ── Connect Gmail Account Modal ── */}
      <GmailConnectModal
        isOpen={connectModalOpen}
        onClose={() => setConnectModalOpen(false)}
        onConnect={handleConnectAccount}
        currentAccount={connectedAccount}
        onDisconnect={handleDisconnectAccount}
      />

      {/* ── Automate Campaign Modal ── */}
      <AutomateCampaignModal
        isOpen={automateCampaignModalOpen}
        onClose={() => setAutomateCampaignModalOpen(false)}
        companies={companiesToProcess}
        connectedAccount={connectedAccount}
        onOpenConnectModal={() => {
          setAutomateCampaignModalOpen(false);
          setConnectModalOpen(true);
        }}
        onLaunchSuccess={handleBulkCampaignSuccess}
      />

      {/* ── Outreach Action Notification Toast ── */}
      {outreachToast && (
        <div className="fixed bottom-20 right-8 z-50 bg-[#202A2E] text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-[#35624A] animate-fadeIn">
          <CheckCircle2 className="h-5 w-5 text-[#8FBEA1] shrink-0" />
          <span className="text-xs font-bold">{outreachToast}</span>
        </div>
      )}

      {/* Details Modal */}
      <CompanyDetails
        company={displayCompanies.find(c => c.id === selectedModalCompanyId) || null}
        isOpen={selectedModalCompanyId !== null}
        onClose={() => setSelectedModalCompanyId(null)}
      />

      {/* Sticky Footer nav */}
      <div className="sticky bottom-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-default py-4.5 px-6 -mx-6 -mb-6 flex items-center justify-between z-25 shadow-[0_-8px_30px_rgba(0,0,0,0.04)] mt-6 rounded-b">
        <Button
          variant="outline"
          onClick={() => navigate('/review')}
          leftIcon={<ArrowLeft className="h-5 w-5" />}
          className="min-w-[120px]"
        >
          Back
        </Button>
      </div>
    </div>
  );
};

export default Outreach;
