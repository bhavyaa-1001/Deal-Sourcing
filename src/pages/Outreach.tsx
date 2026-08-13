import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCompanies } from '../hooks/useCompanies';
import { useMandate } from '../hooks/useMandate';
import { generateOutreachScripts, regenerateOutreachMessage } from '../api/outreach';
import type {
  OutreachChannel,
  OutreachScriptType,
  OutreachScript,
  OutreachSet,
} from '../types';

import LoadingState from '../components/ui/LoadingState';
import Button from '../components/ui/Button';
import {
  ArrowLeft, Sparkles, AlertTriangle, Users, Search,
  Target, Mail, Link2, MessageSquare, Copy, CheckCheck,
  RefreshCw, ChevronRight, ChevronDown, Pencil,
} from 'lucide-react';

const STEP_LABELS: Record<string, string> = {
  researching: 'Researching company profile...',
  reviewing:   'Reviewing acquisition mandate...',
  drafting:    'Drafting personalized outreach...',
};

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
  email:    'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  linkedin: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  direct:   'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  followup: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
  professional: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  founder: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
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
}

const MessageCard: React.FC<MessageCardProps> = ({
  script, channel, label, angleNote, sourceNote, ctaNote,
  iconKey, isRegenerating, onRegenerate, onEdit,
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
  const { companies, allCompaniesRaw, enrichedIds, selectedIds, loading: companiesLoading } = useCompanies();
  const activeMandateId = localStorage.getItem('dealsourcing_mandates_active_id') || 'mandate-101';
  const { mandate, loading: mandateLoading } = useMandate(activeMandateId);

  const displayCompanies = allCompaniesRaw.length > 0 ? allCompaniesRaw : companies;
  const selectedCompanies = useMemo(
    () => displayCompanies.filter(c => selectedIds.includes(c.id)),
    [displayCompanies, selectedIds]
  );

  const [activeCompanyId, setActiveCompanyId] = useState<string | null>(() => {
    const enrichedFirst = selectedCompanies.find(c => enrichedIds.includes(c.id));
    return enrichedFirst?.id ?? selectedCompanies[0]?.id ?? null;
  });
  const [channel, setChannel] = useState<OutreachChannel>('email');
  const [activeScriptType, setActiveScriptType] = useState<OutreachScriptType>('professional');
  const [outreachSets, setOutreachSets] = useState<Record<string, OutreachSet>>({});
  const [editedScripts, setEditedScripts] = useState<Record<string, Record<OutreachScriptType, { subject: string; body: string }>>>({});
  const [generating, setGenerating] = useState(false);
  const [generatingStep, setGeneratingStep] = useState('');
  const [regenerating, setRegenerating] = useState(false);
  const [researchOpen, setResearchOpen] = useState(false);

  const activeCompany    = displayCompanies.find(c => c.id === activeCompanyId) ?? null;
  const isActiveEnriched = activeCompanyId ? enrichedIds.includes(activeCompanyId) : false;
  const activeOutreachSet = activeCompanyId ? outreachSets[activeCompanyId] : undefined;
  const hasScripts       = !!activeOutreachSet?.scripts?.length;

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

  const handleGenerate = useCallback(async () => {
    if (!activeCompany) return;
    const finalMandate = mandate || {
      id: activeMandateId,
      title: 'Plastics Manufacturing Mandate',
      status: 'Approved',
      rawInput: '',
      objective: 'Search for plastics businesses',
      geography: 'Australia',
      targetIndustry: 'Plastics Manufacturing',
    };
    setGenerating(true);
    setGeneratingStep(STEP_LABELS.researching);
    try {
      const scripts = await generateOutreachScripts(
        activeCompany, finalMandate, channel,
        (step) => setGeneratingStep(STEP_LABELS[step] ?? '')
      );
      setOutreachSets(prev => ({
        ...prev,
        [activeCompany.id]: { companyId: activeCompany.id, channel, scripts, generatedAt: new Date().toISOString() },
      }));
      setActiveScriptType('professional');
    } finally {
      setGenerating(false);
      setGeneratingStep('');
    }
  }, [activeCompany, mandate, channel, activeMandateId]);

  const handleRegenerate = useCallback(async (type: OutreachScriptType) => {
    if (!activeCompany) return;
    const finalMandate = mandate || {
      id: activeMandateId,
      title: 'Plastics Manufacturing Mandate',
      status: 'Approved',
      rawInput: '',
      objective: 'Search for plastics businesses',
      geography: 'Australia',
      targetIndustry: 'Plastics Manufacturing',
    };
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

  if (selectedCompanies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-20 text-center">
        <div className="p-4 bg-amber-100 dark:bg-amber-950/30 rounded-full">
          <AlertTriangle className="h-10 w-10 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-primary mb-2">No Companies Selected</h2>
          <p className="text-secondary text-base max-w-md">
            Please return to Review Results and select at least one company to continue to outreach.
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate('/review')} leftIcon={<ArrowLeft className="h-4 w-4" />}>
          Back to Review Results
        </Button>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6 text-left">

      {/* Page heading */}
      <div>
        <h2 className="text-3xl font-extrabold text-primary tracking-tight">Outreach Plan</h2>
        <p className="text-base text-secondary mt-1">
          Ultra-personalized messages for each selected prospect, based on in-depth research.
        </p>
      </div>

      {/* ── Contact tabs ─────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        {selectedCompanies.map(company => {
          const isActive   = company.id === activeCompanyId;
          const isEnriched = enrichedIds.includes(company.id);
          const contactName = company.enrichmentData?.contactPerson
            || company.enrichmentData?.founderName
            || company.name;
          return (
            <button
              key={company.id}
              onClick={() => handleCompanySelect(company.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-semibold transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'border-brand-primary bg-brand-primary-light dark:bg-blue-950/30 text-brand-primary shadow-sm'
                  : 'border-default bg-card text-primary hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <Users className={`h-3.5 w-3.5 shrink-0 ${isActive ? 'text-brand-primary' : isEnriched ? 'text-green-500' : 'text-amber-500'}`} />
              {contactName}
            </button>
          );
        })}
      </div>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      {!activeCompany ? (
        <div className="border border-default rounded-xl p-10 text-center text-secondary bg-card">
          Select a company above to begin.
        </div>
      ) : !isActiveEnriched ? (
        <div className="border border-default rounded-xl p-10 flex flex-col items-center gap-5 text-center bg-card">
          <div className="p-4 bg-amber-100 dark:bg-amber-950/30 rounded-full">
            <AlertTriangle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-primary mb-2">Enrichment Required</h3>
            <p className="text-secondary text-base max-w-md">
              <strong>{activeCompany.name}</strong> needs to be enriched before outreach can be generated.
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate('/review')} leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Go to Review Results to Enrich
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">

          {/* Contact card */}
          <div className="border border-default rounded-xl px-5 py-4 bg-card flex items-center gap-4">
            <div className="p-2.5 rounded-lg bg-brand-primary-light dark:bg-blue-950/30 shrink-0">
              <Users className="h-5 w-5 text-brand-primary" />
            </div>
            <div>
              <p className="text-sm font-bold text-primary">
                {activeCompany.enrichmentData?.contactPerson || activeCompany.enrichmentData?.founderName || activeCompany.name}
              </p>
              <p className="text-xs text-secondary mt-0.5">
                {activeCompany.enrichmentData?.founderRole && (
                  <span>{activeCompany.enrichmentData.founderRole} · </span>
                )}
                <span className="text-brand-primary font-semibold">{activeCompany.name}</span>
              </p>
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

          {/* ── Scripts area ─────────────────────────────────────────────── */}
          {!hasScripts ? (
            <div className="border border-default rounded-xl p-10 flex flex-col items-center gap-5 text-center bg-card">
              {generating ? (
                <div className="flex flex-col items-center gap-4 py-4">
                  <div className="flex gap-1.5">
                    {[0, 1, 2].map(i => (
                      <span
                        key={i}
                        className="w-2.5 h-2.5 rounded-full bg-brand-primary animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                  <p className="text-secondary font-semibold text-base">{generatingStep}</p>
                </div>
              ) : (
                <>
                  <div className="p-4 bg-brand-primary-light dark:bg-blue-950/30 rounded-full">
                    <Sparkles className="h-8 w-8 text-brand-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-primary mb-1.5">Generate Outreach Messages</h3>
                    <p className="text-secondary text-sm max-w-sm">
                      Personalized messages for {activeCompany.enrichmentData?.contactPerson || activeCompany.name} using their profile
                      and your acquisition mandate.
                    </p>
                  </div>

                  {/* Channel toggle */}
                  <div className="flex items-center gap-2 p-1 rounded-lg border border-default bg-slate-50 dark:bg-slate-900/50">
                    {(['email', 'linkedin'] as OutreachChannel[]).map(ch => (
                      <button
                        key={ch}
                        onClick={() => setChannel(ch)}
                        className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${
                          channel === ch
                            ? 'bg-card shadow text-primary border border-default'
                            : 'text-secondary hover:text-primary'
                        }`}
                      >
                        {ch === 'email' ? <Mail className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
                        {ch === 'email' ? 'Email' : 'LinkedIn'}
                      </button>
                    ))}
                  </div>

                  <Button variant="primary" onClick={handleGenerate} leftIcon={<Sparkles className="h-4 w-4" />}>
                    Generate Outreach
                  </Button>
                </>
              )}
            </div>
          ) : (
            /* ── Generated scripts — one card per script ─────────────────── */
            <div className="flex flex-col gap-4">
              {activeOutreachSet!.scripts.map(script => {
                const scriptObj = getScript(script.type);
                if (!scriptObj) return null;

                // Determine icon and label per type
                let iconKey = 'email';
                let cardLabel = script.label;
                let angleNote: string | undefined;
                let ctaNote: string | undefined;

                if (script.type === 'professional') {
                  iconKey = 'email';
                  cardLabel = 'Email';
                } else if (script.type === 'direct') {
                  iconKey = 'linkedin';
                  cardLabel = 'LinkedIn Message';
                  angleNote = `${activeCompany.name}'s public announcements and recent activities.`;
                } else if (script.type === 'founder') {
                  iconKey = 'followup';
                  cardLabel = 'Follow-up Email';
                  angleNote = `Angle: Different angle — personal founder-to-founder connection.`;
                }

                // Extract CTA from body if present (last line that starts with CTA: pattern)
                const bodyLines = scriptObj.body.split('\n');
                const ctaLine = bodyLines.find(l => l.toLowerCase().startsWith('cta:') || l.toLowerCase().includes('worth a') || l.toLowerCase().includes('intro call'));
                if (ctaLine) ctaNote = `CTA: ${ctaLine.replace(/^CTA:\s*/i, '')}`;

                return (
                  <MessageCard
                    key={script.type}
                    script={scriptObj}
                    channel={activeOutreachSet!.channel}
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
                  />
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Footer nav */}
      <div className="border-t border-default pt-6 flex items-center justify-between mt-4">
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
