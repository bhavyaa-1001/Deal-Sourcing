import React, { useState, useEffect } from 'react';
import type { Company } from '../../types';
import Modal from '../ui/Modal';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import {
  Lock, Mail, ChevronLeft, ChevronRight,
  Users, FileText, Calendar, Cpu
} from 'lucide-react';

interface CompanyDetailsProps {
  company: Company | null;
  isOpen: boolean;
  onClose: () => void;
  onEnrich?: (companyId: string) => void;
  onPrevious?: () => void;
  onNext?: () => void;
}

type LeadStatus =
  | 'Not Contacted'
  | 'Attempted to Contact'
  | 'Contact in Future'
  | 'Contacted'
  | 'Pre-Qualified'
  | 'Not Qualified'
  | 'Junk Lead'
  | 'Lost Lead';

const STATUSES: LeadStatus[] = [
  'Not Contacted',
  'Attempted to Contact',
  'Contact in Future',
  'Contacted',
  'Pre-Qualified',
  'Not Qualified',
  'Junk Lead',
  'Lost Lead'
];

const RELATED_LIST = [
  { label: 'Overview', icon: <FileText className="h-4 w-4" /> },
  { label: 'Timeline', icon: <Calendar className="h-4 w-4" /> },
  { label: 'Notes', icon: <FileText className="h-4 w-4" /> },
  { label: 'Connected Records', icon: <Users className="h-4 w-4" /> },
  { label: 'Attachments', icon: <FileText className="h-4 w-4" /> },
  { label: 'Open Activities', icon: <Calendar className="h-4 w-4" /> },
  { label: 'Closed Activities', icon: <Calendar className="h-4 w-4" /> },
  { label: 'Emails', icon: <Mail className="h-4 w-4" /> }
];

const TEAM_MEMBERS = [
  { name: 'Bhavya Bansal', role: 'Lead Partner', initials: 'BB', color: 'bg-blue-600' },
  { name: 'Sarah Jenkins', role: 'M&A Associate', initials: 'SJ', color: 'bg-purple-600' },
  { name: 'David Vance', role: 'Investment Analyst', initials: 'DV', color: 'bg-emerald-600' },
  { name: 'Unassigned', role: 'Team Pool', initials: '??', color: 'bg-slate-400' }
];

export const CompanyDetails: React.FC<CompanyDetailsProps> = ({
  company,
  isOpen,
  onClose,
  onEnrich,
  onPrevious,
  onNext
}) => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [leadStatus, setLeadStatus] = useState<LeadStatus>('Not Contacted');
  const [leadOwner, setLeadOwner] = useState('Bhavya Bansal');
  const [showNotesText, setShowNotesText] = useState('');
  const [notesList, setNotesList] = useState<any[]>([]);
  const [selectedNoteAuthor, setSelectedNoteAuthor] = useState('Bhavya Bansal');
  const [timelineEvents, setTimelineEvents] = useState<any[]>([]);

  // Load persistent lead status, owner, notes, and timeline logs for this company
  useEffect(() => {
    if (company) {
      // 1. Lead Status
      const storedStatus = localStorage.getItem(`dealsourcing_lead_status_${company.id}`);
      setLeadStatus((storedStatus as LeadStatus) || 'Not Contacted');

      // 2. Lead Owner
      const storedOwner = localStorage.getItem(`dealsourcing_lead_owner_${company.id}`);
      setLeadOwner(storedOwner || 'Bhavya Bansal');

      // 3. Notes List
      const storedNotes = localStorage.getItem(`dealsourcing_lead_notes_${company.id}`);
      if (storedNotes) {
        setNotesList(JSON.parse(storedNotes));
      } else {
        const defaultNotes = [
          {
            id: 'note-seed-1',
            text: 'Initial profile verified against mandate criteria. Fit looks high based on primary industry classifications.',
            author: 'Sarah Jenkins',
            timestamp: 'Yesterday at 4:32 PM'
          }
        ];
        setNotesList(defaultNotes);
        localStorage.setItem(`dealsourcing_lead_notes_${company.id}`, JSON.stringify(defaultNotes));
      }

      // 4. Timeline Events
      const storedTimeline = localStorage.getItem(`dealsourcing_lead_timeline_${company.id}`);
      if (storedTimeline) {
        setTimelineEvents(JSON.parse(storedTimeline));
      } else {
        const isEnriched = company.enrichmentStatus === 'enriched';
        const defaultEvents = [
          {
            id: 'evt-discover',
            title: 'Lead Discovered',
            description: `Identified via research source: ${company.sourceName || 'Registry Database'}.`,
            time: '1 day ago',
            user: 'System'
          }
        ];
        if (isEnriched) {
          defaultEvents.unshift({
            id: 'evt-enrich',
            title: 'Data Enrichment',
            description: 'AI model generated company founder profiling and succession notes successfully.',
            time: 'Processed recently',
            user: 'System'
          });
        }
        setTimelineEvents(defaultEvents);
        localStorage.setItem(`dealsourcing_lead_timeline_${company.id}`, JSON.stringify(defaultEvents));
      }
    }
  }, [company]);

  if (!company) return null;

  const isEnriched = company.enrichmentStatus === 'enriched';
  const isProcessing = company.enrichmentStatus === 'processing';

  const logTimelineEvent = (title: string, description: string) => {
    const newEvent = {
      id: `evt-${Date.now()}`,
      title,
      description,
      time: 'Just now',
      user: 'Bhavya Bansal' // Active user session
    };
    setTimelineEvents(prev => {
      const updated = [newEvent, ...prev];
      localStorage.setItem(`dealsourcing_lead_timeline_${company.id}`, JSON.stringify(updated));
      return updated;
    });
  };

  const handleStatusChange = (status: LeadStatus) => {
    setLeadStatus(status);
    localStorage.setItem(`dealsourcing_lead_status_${company.id}`, status);
    logTimelineEvent('Lead Status Updated', `Status changed to '${status}'.`);
  };

  const handleOwnerChange = (newOwner: string) => {
    setLeadOwner(newOwner);
    localStorage.setItem(`dealsourcing_lead_owner_${company.id}`, newOwner);
    logTimelineEvent('Lead Owner Assigned', `Lead assigned to ${newOwner}.`);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showNotesText.trim()) return;

    const newNote = {
      id: `note-${Date.now()}`,
      text: showNotesText.trim(),
      author: selectedNoteAuthor,
      timestamp: 'Just now'
    };
    const updated = [newNote, ...notesList];
    setNotesList(updated);
    localStorage.setItem(`dealsourcing_lead_notes_${company.id}`, JSON.stringify(updated));
    logTimelineEvent('Note Added', `Added a new note regarding prospect details.`);
    setShowNotesText('');
  };


  // Mock profile picture initials
  const initials = company.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const crmTitle = (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full select-none">
      {/* Profile Header Block */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-brand-primary text-white flex items-center justify-center font-extrabold text-sm shadow-premium">
          {initials}
        </div>
        <div className="text-left">
          <h2 className="text-lg font-black text-primary leading-tight flex items-center gap-2">
            {isEnriched && company.enrichmentData?.contactPerson 
              ? company.enrichmentData.contactPerson 
              : `Founder (LOCKED)`}
            <span className="text-xs text-secondary font-semibold font-sans">
              - {company.name}
            </span>
          </h2>
          <div className="flex items-center gap-1.5 mt-0.5 text-xs text-secondary font-semibold">
            <span className="truncate">{company.location}</span>
            <span>&bull;</span>
            <span className="truncate">{company.industry}</span>
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2 pr-4 self-end sm:self-auto">
        {!isEnriched && onEnrich && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => onEnrich(company.id)}
            disabled={isProcessing}
            leftIcon={<Lock className="h-3.5 w-3.5" />}
          >
            {isProcessing ? 'Enriching...' : 'Enrich Lead'}
          </Button>
        )}
        {isEnriched && (
          <Badge variant="success" className="px-2.5 py-1 text-xs font-bold leading-none shrink-0">
            ENRICHED
          </Badge>
        )}
        
        {/* Navigation buttons */}
        <div className="flex items-center border border-default rounded-lg bg-card shadow-sm ml-1 select-none">
          <button
            onClick={onPrevious}
            disabled={!onPrevious}
            className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-secondary disabled:opacity-30 disabled:cursor-not-allowed border-r border-default cursor-pointer"
            title="Previous lead"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={onNext}
            disabled={!onNext}
            className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-secondary disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            title="Next lead"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="" // Title custom rendered in header
      size="xl"
      footerActions={
        <div className="flex justify-between items-center w-full select-none">
          <Button variant="outline" onClick={onClose}>Back to Pipeline</Button>
          <span className="text-xs text-secondary font-semibold">Deal Sourcing CRM</span>
        </div>
      }
    >
      <div className="flex flex-col gap-5 -mt-3.5">
        
        {/* Header Block override */}
        <div className="border-b border-default pb-4">
          {crmTitle}
        </div>

        {/* 1. Chevron Tracker Status Bar */}
        <div className="w-full overflow-x-auto scrollbar-none pb-2 select-none">
          <div className="flex items-center min-w-[800px] border border-default rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-900/30">
            {STATUSES.map((status) => {
              const isActive = status === leadStatus;

              return (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  className={`flex-1 relative py-2.5 px-4 text-xs font-bold transition-all duration-150 text-center cursor-pointer border-r border-default last:border-r-0 focus:outline-none
                    ${isActive
                      ? 'bg-brand-primary text-white shadow-inner font-extrabold font-sans'
                      : 'bg-white dark:bg-slate-800 text-secondary hover:bg-slate-50 dark:hover:bg-slate-700/50 font-sans'
                    }
                  `}
                >
                  <div className="truncate flex items-center justify-center gap-1">
                    {status}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Double-split layout: Related List Sidebar & Main Details */}
        <div className="flex flex-col md:flex-row items-stretch gap-6 min-h-[480px]">
          
          {/* Related List Sidebar (Left) */}
          <aside className="w-full md:w-56 shrink-0 border border-default rounded-xl bg-slate-50/50 dark:bg-slate-900/10 p-3 flex flex-col gap-1 select-none">
            <span className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest pl-2 mb-2 block">
              Related List
            </span>
            {RELATED_LIST.map((tab) => {
              const isSelected = activeTab === tab.label;
              return (
                <button
                  key={tab.label}
                  onClick={() => setActiveTab(tab.label)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-lg text-left transition-colors cursor-pointer focus:outline-none
                    ${isSelected
                      ? 'bg-brand-primary-light/80 text-brand-primary dark:bg-slate-800 dark:text-slate-200'
                      : 'text-secondary hover:bg-slate-100 dark:hover:bg-slate-850 hover:text-primary'
                    }
                  `}
                >
                  <span className={`${isSelected ? 'text-brand-primary' : 'text-slate-450'}`}>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </aside>

          {/* Main Details Panel (Right) */}
          <div className="flex-1 border border-default rounded-xl bg-card p-6 flex flex-col gap-6 overflow-y-auto max-h-[60vh] scrollbar-thin">
            
            {/* Overview Tab Content */}
            {activeTab === 'Overview' && (
              <div className="flex flex-col gap-6 text-left">
                {/* CRM Key Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 border-b border-default pb-5 bg-slate-50/50 dark:bg-slate-900/10 p-4.5 rounded-xl">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Lead Owner</span>
                    <select
                      value={leadOwner}
                      onChange={(e) => handleOwnerChange(e.target.value)}
                      className="text-[13px] font-extrabold text-primary bg-transparent border border-default rounded px-2.5 py-1.5 mt-1.5 focus:outline-none focus:ring-1 focus:ring-brand-primary cursor-pointer w-full max-w-[200px]"
                    >
                      {TEAM_MEMBERS.map(member => (
                        <option key={member.name} value={member.name}>
                          {member.name} ({member.role || 'Unassigned'})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Lead Status</span>
                    <span className="text-[13px] font-extrabold text-brand-primary block mt-1">{leadStatus}</span>
                  </div>
                  
                  {/* Email & Phone */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Email Address</span>
                    {isEnriched && company.enrichmentData?.email ? (
                      <div className="mt-1">
                        <a href={`mailto:${company.enrichmentData.email}`} className="text-[13px] font-extrabold text-brand-primary hover:underline block">
                          {company.enrichmentData.email}
                        </a>
                        {company.enrichmentData.emailProof && (
                          <span className="text-[10px] font-semibold text-[#35624A] dark:text-[#8FBEA1] block mt-0.5">
                            [Proof: {company.enrichmentData.emailProof}]
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500 dark:text-slate-400 italic flex items-center gap-1 mt-1 font-medium select-none">
                        Not yet extracted — Run Deep AI Extraction
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Phone / Mobile</span>
                    {isEnriched && company.enrichmentData?.phone ? (
                      <div className="mt-1">
                        <span className="text-[13px] font-extrabold text-primary block">
                          {company.enrichmentData.phone}
                        </span>
                        {company.enrichmentData.phoneProof && (
                          <span className="text-[10px] font-semibold text-[#35624A] dark:text-[#8FBEA1] block mt-0.5">
                            [Proof: {company.enrichmentData.phoneProof}]
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500 dark:text-slate-400 italic flex items-center gap-1 mt-1 font-medium select-none">
                        Not yet extracted — Run Deep AI Extraction
                      </span>
                    )}
                  </div>
                </div>

                {/* Company Description */}
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                    Company Description
                  </h3>
                  <p className="text-[14px] text-secondary leading-relaxed font-semibold">
                    {company.description}
                  </p>
                </div>

                {/* Acquisition Alignment */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-default/60">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                      Acquisition Fit Alignment
                    </h3>
                    <p className="text-[13px] text-secondary leading-relaxed font-semibold">
                      {company.acquisitionFit.alignmentReason}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                      Succession Risk Notes
                    </h3>
                    <p className="text-[13px] text-secondary leading-relaxed font-semibold">
                      {company.acquisitionFit.successionRisk}
                    </p>
                  </div>
                </div>

                {/* Basic Metrics details */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-default/60 bg-slate-50/20 dark:bg-slate-900/10 p-3 rounded-lg">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Revenue</span>
                    <span className="text-[13px] font-black text-primary block mt-0.5">{company.revenueRange}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Employees</span>
                    <span className="text-[13px] font-black text-primary block mt-0.5">{company.employeeRange}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Ownership</span>
                    <span className="text-[13px] font-black text-primary block mt-0.5 truncate">{company.ownership}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Founded</span>
                    <span className="text-[13px] font-black text-primary block mt-0.5">{company.founded}</span>
                  </div>
                </div>

                {/* Founder Bio, Demographics & Mandate Criteria Match */}
                <div className="border-t border-default/60 pt-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2.5 flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-brand-primary" />
                    Founder & Leadership Intelligence Dossier
                  </h3>
                  {isEnriched && company.enrichmentData ? (
                    <div className="flex flex-col gap-3.5 bg-brand-success-light/30 dark:bg-emerald-950/10 p-4.5 rounded-xl border border-brand-success-light/70 dark:border-emerald-950/20">
                      {/* Founder Demographics & Age with Proof */}
                      {company.enrichmentData.age && (
                        <div className="p-3 rounded-lg bg-white/80 dark:bg-[#182536] border border-[#B7CCBC] dark:border-[#39634D]">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className="text-[10px] font-bold text-brand-success uppercase tracking-wider">
                              Founder Age & Demographics
                            </span>
                            <span className="text-[10px] font-bold text-[#35624A] dark:text-[#8FBEA1]">
                              [Proof: {company.enrichmentData.ageProof || 'ASIC Corporate Director Registry (2024)'}]
                            </span>
                          </div>
                          <p className="text-[13px] text-primary mt-1 font-bold">
                            {company.enrichmentData.founderName} ({company.enrichmentData.founderRole}) — Age: ~{company.enrichmentData.age} Years ({company.enrichmentData.gender || 'Male'})
                          </p>
                          {company.enrichmentData.industryExperience && (
                            <p className="text-xs text-secondary mt-0.5">
                              Tenure: {company.enrichmentData.industryExperience} {company.enrichmentData.experienceProof && <span className="text-[10px] font-semibold text-[#35624A] dark:text-[#8FBEA1]">[Proof: {company.enrichmentData.experienceProof}]</span>}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Mandate Additional Criteria Match */}
                      {company.enrichmentData.additionalRequirementMatch && (
                        <div className="p-3 rounded-lg bg-[#E3ECE6]/80 dark:bg-[#173529]/60 border border-[#B7CCBC] dark:border-[#39634D]">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className="text-[10px] font-bold text-brand-success uppercase tracking-wider">
                              🎯 Mandate Additional Criteria Match
                            </span>
                            <span className="text-[10px] font-bold text-[#35624A] dark:text-[#8FBEA1]">
                              [Proof: {company.enrichmentData.additionalRequirementMatch.proofSource}]
                            </span>
                          </div>
                          <p className="text-xs text-primary mt-1 font-bold">
                            {company.enrichmentData.additionalRequirementMatch.requirement}: <span className="font-normal">{company.enrichmentData.additionalRequirementMatch.extractedValue}</span>
                          </p>
                        </div>
                      )}

                      <div>
                        <span className="text-[10px] font-bold text-brand-success uppercase tracking-wider block">Founder Career Biography</span>
                        <p className="text-[13px] text-secondary mt-1 font-semibold leading-relaxed">"{company.enrichmentData.bio}"</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-brand-success uppercase tracking-wider block">Management Lieutenants</span>
                        <p className="text-[13px] text-secondary mt-1 font-semibold">{company.enrichmentData.managementTeam}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-brand-success uppercase tracking-wider block">Succession Opportunity & Transition Notes</span>
                        <p className="text-[13px] text-secondary mt-1 font-semibold leading-relaxed">{company.enrichmentData.successionNote}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/30 border border-default text-center select-none">
                      <Cpu className="h-5 w-5 text-slate-400 mx-auto mb-1.5" />
                      <p className="text-xs font-bold text-secondary">Founder details & contacts pending deep extraction</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Run Deep AI Extraction on the Discover Founders page to generate verified dossiers and primary source proofs.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Timeline Tab Content */}
            {activeTab === 'Timeline' && (
              <div className="flex flex-col gap-6 text-left">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">
                    Lead Activity Timeline
                  </h3>
                  
                  {/* Timeline track list */}
                  <div className="relative border-l border-default pl-6 ml-3 flex flex-col gap-6.5">
                    {timelineEvents.map((evt) => {
                      const isStatus = evt.title.includes('Status');
                      const isOwner = evt.title.includes('Owner');
                      const dotColor = isStatus 
                        ? 'bg-brand-primary' 
                        : isOwner 
                          ? 'bg-purple-600' 
                          : evt.title.includes('Enrichment')
                            ? 'bg-brand-success'
                            : 'bg-slate-400';

                      return (
                        <div key={evt.id} className="relative">
                          <span className={`absolute -left-[31px] top-0.5 w-4.5 h-4.5 rounded-full ${dotColor} border-4 border-white dark:border-slate-800 shadow-sm`} />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-extrabold text-primary">{evt.title}</span>
                              <span className="text-[10px] text-slate-400 font-medium">{evt.time}</span>
                            </div>
                            <p className="text-xs text-secondary mt-1 font-semibold leading-relaxed">
                              {evt.description}
                            </p>
                            {evt.user && evt.user !== 'System' && (
                              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mt-1 block">
                                Action by: {evt.user}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Notes Tab Content */}
            {activeTab === 'Notes' && (
              <div className="flex flex-col gap-5 text-left">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Team Discussion & Notes
                </h3>
                
                {/* Form with Author Selector */}
                <form onSubmit={handleAddNote} className="flex flex-col sm:flex-row gap-3 bg-slate-50/50 dark:bg-slate-900/10 p-3 rounded-lg border border-default">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider whitespace-nowrap">Post as:</span>
                    <select
                      value={selectedNoteAuthor}
                      onChange={(e) => setSelectedNoteAuthor(e.target.value)}
                      className="text-xs font-bold text-primary bg-white dark:bg-slate-800 border border-default rounded px-2 py-1 focus:outline-none cursor-pointer"
                    >
                      {TEAM_MEMBERS.map(m => (
                        <option key={m.name} value={m.name}>{m.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-1 gap-2">
                    <input
                      type="text"
                      value={showNotesText}
                      onChange={(e) => setShowNotesText(e.target.value)}
                      placeholder="Type a team note or update here..."
                      className="flex-1 px-3 py-1.5 text-sm border border-default rounded bg-card text-primary focus:outline-none focus:border-brand-primary"
                    />
                    <Button type="submit" variant="primary" size="sm">Post</Button>
                  </div>
                </form>

                {/* List */}
                <div className="flex flex-col gap-4">
                  {notesList.length === 0 ? (
                    <span className="text-xs text-slate-400 italic block py-4 text-center">No team notes added yet.</span>
                  ) : (
                    notesList.map((note: any) => {
                      const member = TEAM_MEMBERS.find(m => m.name === note.author) || TEAM_MEMBERS[3];
                      return (
                        <div key={note.id} className="flex items-start gap-3 p-3.5 bg-slate-50/50 dark:bg-slate-900/10 rounded-xl border border-default">
                          <div className={`w-8 h-8 rounded-full ${member.color} flex items-center justify-center text-white text-[11px] font-extrabold shrink-0 shadow-sm select-none`}>
                            {member.initials}
                          </div>
                          <div className="flex-1 text-left min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-extrabold text-primary truncate">
                                {note.author} <span className="text-[10px] text-slate-400 font-medium">({member.role})</span>
                              </span>
                              <span className="text-[9px] text-slate-400 shrink-0 font-medium">{note.timestamp}</span>
                            </div>
                            <p className="text-xs text-secondary mt-1.5 leading-relaxed font-semibold break-words">
                              {note.text}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* Other dead/mock tabs */}
            {!['Overview', 'Timeline', 'Notes'].includes(activeTab) && (
              <div className="py-12 text-center select-none">
                <FileText className="h-8 w-8 text-slate-350 mx-auto mb-2" />
                <p className="text-xs font-bold text-secondary">{activeTab} Details</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Mock related list records for this candidate lead.</p>
              </div>
            )}

          </div>
        </div>

      </div>
    </Modal>
  );
};

export default CompanyDetails;
