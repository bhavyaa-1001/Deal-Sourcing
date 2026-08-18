import React, { useState, useEffect } from 'react';
import type { Company } from '../../types';
import Modal from '../ui/Modal';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import {
  Lock, Mail, ChevronLeft, ChevronRight,
  Users, FileText, Phone, ExternalLink,
  Briefcase, Award
} from 'lucide-react';
import { MOCK_ENRICHMENT_DATA } from '../../api/enrichment';

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
  { label: 'Founder Details', icon: <Users className="h-4 w-4" /> },
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
  const [activeTab, setActiveTab] = useState<'Overview' | 'Founder Details'>('Overview');
  const [leadStatus, setLeadStatus] = useState<LeadStatus>('Not Contacted');
  const [leadOwner, setLeadOwner] = useState('Bhavya Bansal');

  // Load persistent lead status and owner for this company
  useEffect(() => {
    if (company) {
      const storedStatus = localStorage.getItem(`dealsourcing_lead_status_${company.id}`);
      setLeadStatus((storedStatus as LeadStatus) || 'Not Contacted');

      const storedOwner = localStorage.getItem(`dealsourcing_lead_owner_${company.id}`);
      setLeadOwner(storedOwner || 'Bhavya Bansal');
    }
  }, [company]);

  if (!company) return null;

  const isEnriched = company.enrichmentStatus === 'enriched';
  const isProcessing = company.enrichmentStatus === 'processing';
  const enrichment = company.enrichmentData || (isEnriched ? MOCK_ENRICHMENT_DATA[company.id] : undefined);

  const handleStatusChange = (status: LeadStatus) => {
    setLeadStatus(status);
    localStorage.setItem(`dealsourcing_lead_status_${company.id}`, status);
  };

  const handleOwnerChange = (newOwner: string) => {
    setLeadOwner(newOwner);
    localStorage.setItem(`dealsourcing_lead_owner_${company.id}`, newOwner);
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
            {isEnriched && enrichment?.contactPerson 
              ? enrichment.contactPerson 
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
        
        {/* Header Block */}
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
        <div className="flex flex-col md:flex-row items-stretch gap-6 min-h-[440px]">
          
          {/* Related List Sidebar (Left) — Only 2 Tabs */}
          <aside className="w-full md:w-56 shrink-0 border border-default rounded-xl bg-slate-50/50 dark:bg-slate-900/10 p-3 flex flex-col gap-1.5 select-none">
            <span className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest pl-2 mb-2 block">
              Related Views
            </span>
            {RELATED_LIST.map((tab) => {
              const isSelected = activeTab === tab.label;
              return (
                <button
                  key={tab.label}
                  onClick={() => setActiveTab(tab.label as any)}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-bold rounded-lg text-left transition-colors cursor-pointer focus:outline-none
                    ${isSelected
                      ? 'bg-brand-primary-light/80 text-brand-primary dark:bg-slate-800 dark:text-slate-200 shadow-xs'
                      : 'text-secondary hover:bg-slate-100 dark:hover:bg-slate-850 hover:text-primary'
                    }
                  `}
                >
                  <span className={`${isSelected ? 'text-brand-primary' : 'text-slate-450'}`}>{tab.icon}</span>
                  <span className="text-[13px]">{tab.label}</span>
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
                  
                  {/* Email & Phone summary */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Direct Email</span>
                    {isEnriched && enrichment?.email ? (
                      <div className="mt-1">
                        <a href={`mailto:${enrichment.email}`} className="text-[13px] font-extrabold text-brand-primary hover:underline block">
                          {enrichment.email}
                        </a>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500 dark:text-slate-400 italic flex items-center gap-1 mt-1 font-medium select-none">
                        Pending AI Enrichment
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Phone / Mobile</span>
                    {isEnriched && enrichment?.phone ? (
                      <div className="mt-1">
                        <span className="text-[13px] font-extrabold text-primary block">
                          {enrichment.phone}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500 dark:text-slate-400 italic flex items-center gap-1 mt-1 font-medium select-none">
                        Pending AI Enrichment
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

                {/* Key Metrics */}
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

                {/* Business Profile */}
                {company.businessProfile && (
                  <div className="border-t border-default/60 pt-4 flex flex-col gap-3">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Core Business Capabilities
                    </h3>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Key Products & Services</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {company.businessProfile.keyProducts.map((p, idx) => (
                          <span key={idx} className="px-2.5 py-1 text-xs font-semibold rounded-md bg-slate-100 dark:bg-slate-800 text-primary border border-default">
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Key Customers & Client Base</span>
                      <p className="text-xs font-semibold text-secondary mt-0.5">{company.businessProfile.mainCustomers.join(' • ')}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Founder Details Tab Content */}
            {activeTab === 'Founder Details' && (
              <div className="flex flex-col gap-6 text-left">
                {isEnriched && enrichment ? (
                  <div className="flex flex-col gap-5">
                    {/* Header Profile Card */}
                    <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-900/40 border border-default flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-brand-primary text-white flex items-center justify-center font-black text-base shadow-sm">
                          {enrichment.founderName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <h3 className="text-base font-black text-primary leading-tight">
                            {enrichment.founderName}
                          </h3>
                          <span className="text-xs font-bold text-secondary block mt-0.5">
                            {enrichment.founderRole}
                          </span>
                        </div>
                      </div>

                      {/* Age & Demographics Badge */}
                      <div className="flex flex-col items-end gap-1">
                        {enrichment.age && (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#35624A] dark:text-[#8FBEA1] bg-[#E3ECE6] dark:bg-[#173529] px-3 py-1 rounded-full border border-[#B7CCBC] dark:border-[#39634D]">
                            <Users className="h-3.5 w-3.5" />
                            Age: ~{enrichment.age} Years ({enrichment.gender || 'Male'})
                          </span>
                        )}
                        {enrichment.ageProof && (
                          <span className="text-[10px] font-semibold text-slate-400">
                            [Proof: {enrichment.ageProof}]
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Direct Contact Dossier */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/50 dark:bg-slate-900/20 p-4 rounded-xl border border-default">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Direct Email</span>
                        {enrichment.email ? (
                          <div className="mt-1">
                            <a href={`mailto:${enrichment.email}`} className="text-sm font-extrabold text-brand-primary hover:underline flex items-center gap-1.5">
                              <Mail className="h-3.5 w-3.5" />
                              {enrichment.email}
                            </a>
                            {enrichment.emailProof && (
                              <span className="text-[10px] font-semibold text-[#35624A] dark:text-[#8FBEA1] block mt-0.5">
                                [Proof: {enrichment.emailProof}]
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Not available</span>
                        )}
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Phone Number</span>
                        {enrichment.phone ? (
                          <div className="mt-1">
                            <span className="text-sm font-extrabold text-primary flex items-center gap-1.5">
                              <Phone className="h-3.5 w-3.5 text-slate-400" />
                              {enrichment.phone}
                            </span>
                            {enrichment.phoneProof && (
                              <span className="text-[10px] font-semibold text-[#35624A] dark:text-[#8FBEA1] block mt-0.5">
                                [Proof: {enrichment.phoneProof}]
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Not available</span>
                        )}
                      </div>

                      {enrichment.linkedin && (
                        <div className="sm:col-span-2 pt-2 border-t border-default/60">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">LinkedIn Profile</span>
                          <a
                            href={enrichment.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-bold text-brand-primary hover:underline inline-flex items-center gap-1.5 mt-1"
                          >
                            {enrichment.linkedin}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Career Biography */}
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 flex items-center gap-1.5">
                        <Briefcase className="h-3.5 w-3.5 text-brand-primary" />
                        Founder Career Biography
                      </h4>
                      <p className="text-sm text-secondary leading-relaxed font-semibold p-3.5 rounded-lg bg-slate-50/40 dark:bg-slate-900/10 border border-default">
                        "{enrichment.bio}"
                      </p>
                    </div>

                    {/* Succession Opportunity & Transition Readiness */}
                    {enrichment.successionNote && (
                      <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900">
                        <span className="text-[10px] font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider block mb-1">
                          Succession Opportunity & Transition Notes
                        </span>
                        <p className="text-xs font-bold text-amber-900 dark:text-amber-200 leading-relaxed">
                          {enrichment.successionNote}
                        </p>
                      </div>
                    )}

                    {/* Management Lieutenants */}
                    {enrichment.managementTeam && (
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          Management Lieutenants & Key Executives
                        </span>
                        <p className="text-xs font-semibold text-secondary">
                          {enrichment.managementTeam}
                        </p>
                      </div>
                    )}

                    {/* Additional Details Grid: Experience, Ownership, Education, Prior Exits */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-default/60 text-xs">
                      {enrichment.industryExperience && (
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Industry Experience</span>
                          <span className="font-bold text-primary block mt-0.5">{enrichment.industryExperience}</span>
                        </div>
                      )}
                      {enrichment.ownershipStake && (
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ownership Stake</span>
                          <span className="font-bold text-primary block mt-0.5">{enrichment.ownershipStake}</span>
                        </div>
                      )}
                      {enrichment.education && (
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Education & Credentials</span>
                          <span className="font-bold text-primary block mt-0.5">{enrichment.education}</span>
                        </div>
                      )}
                      {enrichment.priorExits && (
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Prior M&A Exits</span>
                          <span className="font-bold text-primary block mt-0.5">{enrichment.priorExits}</span>
                        </div>
                      )}
                    </div>

                    {/* Mandate Additional Criteria Match */}
                    {enrichment.additionalRequirementMatch && (
                      <div className="p-3.5 rounded-xl bg-[#E3ECE6]/80 dark:bg-[#173529]/60 border border-[#B7CCBC] dark:border-[#39634D]">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="text-[10px] font-bold text-[#35624A] dark:text-[#8FBEA1] uppercase tracking-wider flex items-center gap-1.5">
                            <Award className="h-3.5 w-3.5" />
                            Mandate Criteria Verification
                          </span>
                          <span className="text-[10px] font-bold text-[#35624A] dark:text-[#8FBEA1]">
                            [Proof: {enrichment.additionalRequirementMatch.proofSource}]
                          </span>
                        </div>
                        <p className="text-xs text-primary mt-1 font-bold">
                          {enrichment.additionalRequirementMatch.requirement}: <span className="font-normal">{enrichment.additionalRequirementMatch.extractedValue}</span>
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-12 px-6 rounded-xl bg-slate-50 dark:bg-slate-900/30 border border-default text-center select-none flex flex-col items-center justify-center gap-3">
                    <div className="p-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                      <Lock className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-primary">Founder Profile & Contacts Locked</h4>
                      <p className="text-xs text-secondary mt-1 max-w-md">
                        Enrich this company to extract verified founder biographies, contact numbers, direct emails, and succession transition timelines.
                      </p>
                    </div>
                    {onEnrich && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => onEnrich(company.id)}
                        disabled={isProcessing}
                        leftIcon={<Lock className="h-3.5 w-3.5" />}
                        className="mt-2"
                      >
                        {isProcessing ? 'Enriching...' : 'Enrich This Company'}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

      </div>
    </Modal>
  );
};

export default CompanyDetails;
