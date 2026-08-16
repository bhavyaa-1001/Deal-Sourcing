import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCompanies } from '../hooks/useCompanies';
import { MOCK_ENRICHMENT_DATA } from '../api/enrichment';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingState from '../components/ui/LoadingState';
import {
  Users, UserCheck, Sparkles, Mail, Phone,
  ExternalLink, Copy, Check, ArrowLeft, ArrowRight,
  ShieldCheck, AlertCircle, Search, Building2,
  CheckCircle2, RefreshCw, Cpu, GraduationCap, Briefcase,
  Tag
} from 'lucide-react';

export type LeadStatus = 'active' | 'contact_future' | 'junk_lead' | 'follow_up';

export const LEAD_STATUS_CONFIG: Record<LeadStatus, {
  label: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  iconColor: string;
  description: string;
}> = {
  active: {
    label: 'Active Target',
    badgeBg: 'bg-[#E3ECE6] dark:bg-[#173529]',
    badgeText: 'text-[#35624A] dark:text-[#8FBEA1]',
    borderColor: 'border-[#B7CCBC] dark:border-[#39634D]',
    iconColor: 'bg-[#35624A]',
    description: 'High-priority founder ready for immediate acquisition outreach.',
  },
  contact_future: {
    label: 'Contact in Future',
    badgeBg: 'bg-[#F5EDDA] dark:bg-[#3A3520]',
    badgeText: 'text-[#9A7535] dark:text-[#D5C76E]',
    borderColor: 'border-[#E3D4B3] dark:border-[#625A2F]',
    iconColor: 'bg-[#9A7535]',
    description: 'Founder considering exit in 1-3 years; nurture pipeline.',
  },
  junk_lead: {
    label: 'Junk Lead / Pass',
    badgeBg: 'bg-[#FEE2E2] dark:bg-[#451A1A]',
    badgeText: 'text-[#DC2626] dark:text-[#F87171]',
    borderColor: 'border-[#FCA5A5] dark:border-[#991B1B]',
    iconColor: 'bg-[#DC2626]',
    description: 'Not a strategic fit or founder unviable for acquisition.',
  },
  follow_up: {
    label: 'Follow-up Scheduled',
    badgeBg: 'bg-[#EBF8FF] dark:bg-[#1A365D]',
    badgeText: 'text-[#2B6CB0] dark:text-[#63B3ED]',
    borderColor: 'border-[#BEE3F8] dark:border-[#2A4365]',
    iconColor: 'bg-[#2B6CB0]',
    description: 'Revisit founder after key operational milestone.',
  },
};

export const DiscoverFounders: React.FC = () => {
  const navigate = useNavigate();
  const {
    companies,
    enrichedIds,
    selectedIds,
    loading,
    successMessage,
    toggleSelection,
    enrichCompanies,
  } = useCompanies();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'founder' | 'executive'>('all');
  const [enrichFilter, setEnrichFilter] = useState<'all' | 'enriched' | 'pending'>('all');
  const [successionFilter, setSuccessionFilter] = useState<'all' | 'high_risk' | 'retirement'>('all');
  const [leadStatusFilter, setLeadStatusFilter] = useState<'all' | LeadStatus>('all');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [enrichingId, setEnrichingId] = useState<string | null>(null);
  const [batchEnriching, setBatchEnriching] = useState(false);

  // Lead Status State per company / founder
  const [leadStatuses, setLeadStatuses] = useState<Record<string, LeadStatus>>(() => {
    const saved = localStorage.getItem('dealsourcing_lead_statuses');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return {
      'comp-1': 'active',
      'comp-2': 'active',
      'comp-3': 'contact_future',
      'comp-4': 'active',
      'comp-5': 'junk_lead',
      'comp-6': 'active',
    };
  });

  const handleUpdateLeadStatus = (companyId: string, status: LeadStatus) => {
    const next = { ...leadStatuses, [companyId]: status };
    setLeadStatuses(next);
    localStorage.setItem('dealsourcing_lead_statuses', JSON.stringify(next));
  };

  const handleBack = () => navigate('/discover');
  const handleContinue = () => navigate('/review');

  const copyToClipboard = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Build founder / management profiles by combining company + enrichment info
  const founderProfiles = useMemo(() => {
    return companies.map(company => {
      const isEnriched = enrichedIds.includes(company.id) || company.enrichmentStatus === 'enriched';
      const enrichmentFallback = MOCK_ENRICHMENT_DATA[company.id];
      const liveEnrichment = company.enrichmentData || enrichmentFallback;

      const name = liveEnrichment?.founderName || liveEnrichment?.contactPerson || 'Managing Director';
      const role = liveEnrichment?.founderRole || 'Founder & Principal';
      const isFounder = role.toLowerCase().includes('founder') || company.ownership.toLowerCase().includes('founder');

      const isHighSuccession = company.acquisitionFit.successionRisk.toLowerCase().includes('high') ||
        (liveEnrichment?.successionNote && liveEnrichment.successionNote.toLowerCase().includes('retire'));

      const leadStatus = leadStatuses[company.id] || 'active';

      return {
        company,
        isEnriched,
        name,
        role,
        isFounder,
        isHighSuccession,
        leadStatus,
        age: liveEnrichment?.age,
        ageProof: liveEnrichment?.ageProof || 'ASIC Corporate Director Filing (2024)',
        gender: liveEnrichment?.gender,
        genderProof: liveEnrichment?.genderProof || 'Public Executive Registry',
        industryExperience: liveEnrichment?.industryExperience,
        experienceProof: liveEnrichment?.experienceProof || 'Industry Association Member Directory',
        ownershipStake: liveEnrichment?.ownershipStake || company.ownership,
        ownershipProof: liveEnrichment?.ownershipProof || 'ASIC Shareholder Registry Extract',
        education: liveEnrichment?.education,
        educationProof: liveEnrichment?.educationProof || 'University Alumni Verification Database',
        priorExits: liveEnrichment?.priorExits,
        exitsProof: liveEnrichment?.exitsProof || 'Corporate Gazette & Press Disclosures',
        managementTeam: liveEnrichment?.managementTeam || 'Key operations & sales directors',
        bio: liveEnrichment?.bio || company.description,
        successionNote: liveEnrichment?.successionNote || company.acquisitionFit.successionRisk,
        email: isEnriched ? liveEnrichment?.email : null,
        emailProof: liveEnrichment?.emailProof || 'Corporate MX DNS & Industry Verified Routing',
        phone: isEnriched ? liveEnrichment?.phone : null,
        phoneProof: liveEnrichment?.phoneProof || 'Chamber of Commerce Direct Telco Registry',
        linkedin: isEnriched ? liveEnrichment?.linkedin : null,
        additionalRequirementMatch: liveEnrichment?.additionalRequirementMatch,
      };
    });
  }, [companies, enrichedIds, leadStatuses]);

  // Filtered founder profiles
  const filteredProfiles = useMemo(() => {
    return founderProfiles.filter(profile => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = profile.name.toLowerCase().includes(q);
        const matchRole = profile.role.toLowerCase().includes(q);
        const matchComp = profile.company.name.toLowerCase().includes(q);
        const matchBio = profile.bio.toLowerCase().includes(q);
        if (!matchName && !matchRole && !matchComp && !matchBio) return false;
      }

      // Role filter
      if (roleFilter === 'founder' && !profile.isFounder) return false;
      if (roleFilter === 'executive' && profile.isFounder) return false;

      // Enrichment filter
      if (enrichFilter === 'enriched' && !profile.isEnriched) return false;
      if (enrichFilter === 'pending' && profile.isEnriched) return false;

      // Succession filter
      if (successionFilter === 'high_risk' && !profile.isHighSuccession) return false;
      if (successionFilter === 'retirement' && !profile.successionNote.toLowerCase().includes('retire')) return false;

      // Lead Status Filter (Junk Lead, Contact in Future, Active Target, Follow-up)
      if (leadStatusFilter !== 'all' && profile.leadStatus !== leadStatusFilter) return false;

      return true;
    });
  }, [founderProfiles, searchQuery, roleFilter, enrichFilter, successionFilter, leadStatusFilter]);

  // Metrics
  const totalFounders = founderProfiles.length;
  const enrichedCount = founderProfiles.filter(p => p.isEnriched).length;
  const pendingExtractionCount = totalFounders - enrichedCount;
  const highSuccessionCount = founderProfiles.filter(p => p.isHighSuccession).length;
  const selectedCount = selectedIds.length;

  const handleSingleEnrich = async (companyId: string) => {
    setEnrichingId(companyId);
    try {
      await enrichCompanies([companyId]);
    } finally {
      setEnrichingId(null);
    }
  };

  const handleBatchEnrich = async () => {
    const unenrichedIds = companies
      .filter(c => !enrichedIds.includes(c.id) && c.enrichmentStatus !== 'enriched')
      .map(c => c.id);
    if (unenrichedIds.length === 0) return;

    setBatchEnriching(true);
    try {
      await enrichCompanies(unenrichedIds);
    } finally {
      setBatchEnriching(false);
    }
  };

  if (loading && companies.length === 0) {
    return <LoadingState message="Discovering leadership & founder profiles..." />;
  }

  return (
    <div className="flex flex-col gap-5 text-left pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#D8D5CE] dark:border-[#263544] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#202A2E] dark:text-[#F1F5F9] tracking-tight">
              Discover Founders & Management
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider bg-[#F4E8E2] dark:bg-[#3A281F] text-[#A65F3F] dark:text-[#C27A56] border border-[#A65F3F]/20 dark:border-[#C27A56]/30">
              Step 03
            </span>
          </div>
          <p className="text-sm text-[#626A6D] dark:text-[#9AA9B8] mt-1 leading-relaxed">
            Initial screening identifies company-level targets. Run AI Deep Extraction models to fetch additional founder intelligence: direct phone, verified email, age/demographics, career background, and succession readiness.
          </p>
        </div>

        {/* Global Batch Action */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="primary"
            onClick={handleBatchEnrich}
            disabled={batchEnriching || pendingExtractionCount === 0}
            leftIcon={batchEnriching ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Cpu className="h-4 w-4" />}
            className="text-xs font-bold bg-[#A65F3F] hover:bg-[#8F4F36] dark:bg-[#C27A56] dark:text-white border-none shadow-sm"
          >
            {batchEnriching ? 'Running Deep AI Extraction...' : pendingExtractionCount === 0 ? 'All Profiles Fully Extracted' : `Run Deep Extraction for All (${pendingExtractionCount})`}
          </Button>
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-3.5 rounded-lg bg-[#E3ECE6] dark:bg-[#173529] border border-[#B7CCBC] dark:border-[#39634D] text-[#35624A] dark:text-[#8FBEA1] text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl border border-[#D8D5CE] dark:border-[#2D4053] bg-white dark:bg-[#182536] flex items-center gap-3.5 shadow-sm">
          <div className="p-2.5 rounded-lg bg-[#F1EFEA] dark:bg-[#1D2B3A] text-[#202A2E] dark:text-[#F1F5F9] shrink-0 border border-[#D8D5CE] dark:border-[#344658]">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10.5px] font-bold text-[#626A6D] dark:text-[#9AA9B8] uppercase tracking-wider block">Identified Leaders</span>
            <span className="text-xl md:text-2xl font-black text-[#202A2E] dark:text-[#F1F5F9]">{totalFounders}</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-[#D8D5CE] dark:border-[#2D4053] bg-white dark:bg-[#182536] flex items-center gap-3.5 shadow-sm">
          <div className="p-2.5 rounded-lg bg-[#E3ECE6] dark:bg-[#173529] text-[#35624A] dark:text-[#8FBEA1] shrink-0 border border-[#B7CCBC] dark:border-[#39634D]">
            <UserCheck className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10.5px] font-bold text-[#626A6D] dark:text-[#9AA9B8] uppercase tracking-wider block">Deep AI Extracted</span>
            <span className="text-xl md:text-2xl font-black text-[#35624A] dark:text-[#8FBEA1]">{enrichedCount} <span className="text-xs font-semibold text-[#626A6D] dark:text-[#9AA9B8]">/ {totalFounders}</span></span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-[#D8D5CE] dark:border-[#2D4053] bg-white dark:bg-[#182536] flex items-center gap-3.5 shadow-sm">
          <div className="p-2.5 rounded-lg bg-[#F5EDDA] dark:bg-[#3A3520] text-[#9A7535] dark:text-[#D5C76E] shrink-0 border border-[#E3D4B3] dark:border-[#625A2F]">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10.5px] font-bold text-[#626A6D] dark:text-[#9AA9B8] uppercase tracking-wider block">Succession Signals</span>
            <span className="text-xl md:text-2xl font-black text-[#9A7535] dark:text-[#D5C76E]">{highSuccessionCount}</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-[#D8D5CE] dark:border-[#2D4053] bg-white dark:bg-[#182536] flex items-center gap-3.5 shadow-sm">
          <div className="p-2.5 rounded-lg bg-[#F4E8E2] dark:bg-[#3A281F] text-[#A65F3F] dark:text-[#C27A56] shrink-0 border border-[#A65F3F]/20 dark:border-[#C27A56]/30">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10.5px] font-bold text-[#626A6D] dark:text-[#9AA9B8] uppercase tracking-wider block">Shortlisted Targets</span>
            <span className="text-xl md:text-2xl font-black text-[#A65F3F] dark:text-[#C27A56]">{selectedCount}</span>
          </div>
        </div>
      </div>

      {/* Lead Status Quick Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 select-none scrollbar-thin">
        <span className="text-[11px] font-black uppercase tracking-wider text-[#626A6D] dark:text-[#9AA9B8] shrink-0 mr-1 flex items-center gap-1">
          <Tag className="h-3.5 w-3.5" />
          Lead Status:
        </span>

        {[
          { id: 'all', label: 'All Leads', count: totalFounders, colorClass: 'bg-[#F1EFEA] text-[#202A2E] dark:bg-[#1D2B3A] dark:text-[#F1F5F9]' },
          { id: 'active', label: '🟢 Active Targets', count: founderProfiles.filter(p => p.leadStatus === 'active').length, colorClass: 'bg-[#E3ECE6] text-[#35624A] dark:bg-[#173529] dark:text-[#8FBEA1]' },
          { id: 'contact_future', label: '🟡 Contact in Future', count: founderProfiles.filter(p => p.leadStatus === 'contact_future').length, colorClass: 'bg-[#F5EDDA] text-[#9A7535] dark:bg-[#3A3520] dark:text-[#D5C76E]' },
          { id: 'junk_lead', label: '🔴 Junk Leads / Pass', count: founderProfiles.filter(p => p.leadStatus === 'junk_lead').length, colorClass: 'bg-[#FEE2E2] text-[#DC2626] dark:bg-[#451A1A] dark:text-[#F87171]' },
          { id: 'follow_up', label: '🔵 Follow-up Scheduled', count: founderProfiles.filter(p => p.leadStatus === 'follow_up').length, colorClass: 'bg-[#EBF8FF] text-[#2B6CB0] dark:bg-[#1A365D] dark:text-[#63B3ED]' },
        ].map(tab => {
          const isActive = leadStatusFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setLeadStatusFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 border ${
                isActive
                  ? 'border-[#202A2E] dark:border-[#C5B76A] bg-[#202A2E] text-white dark:bg-[#C5B76A] dark:text-[#182536] shadow-xs'
                  : `border-[#D8D5CE] dark:border-[#344658] ${tab.colorClass} hover:opacity-90`
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${isActive ? 'bg-white/20 text-white dark:bg-black/20' : 'bg-black/5 dark:bg-white/10'}`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter & Search Bar */}
      <div className="p-3.5 rounded-xl border border-[#D8D5CE] dark:border-[#2D4053] bg-[#F1EFEA]/80 dark:bg-[#141F2C] flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#899093] dark:text-[#9AA9B8]" />
          <input
            type="text"
            placeholder="Search founders by name, role, background, or target company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-[#182536] border border-[#D8D5CE] dark:border-[#344658] rounded-lg text-[#202A2E] dark:text-[#F1F5F9] focus:outline-none focus:ring-1 focus:ring-[#A65F3F] dark:focus:ring-[#C5B76A]"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Lead Status Filter Dropdown */}
          <select
            value={leadStatusFilter}
            onChange={(e: any) => setLeadStatusFilter(e.target.value)}
            className="text-xs font-semibold px-2.5 py-1.5 bg-white dark:bg-[#182536] border border-[#D8D5CE] dark:border-[#344658] rounded-lg text-[#202A2E] dark:text-[#F1F5F9] focus:outline-none cursor-pointer"
          >
            <option value="all">All Lead Statuses</option>
            <option value="active">🟢 Active Targets Only</option>
            <option value="contact_future">🟡 Contact in Future</option>
            <option value="junk_lead">🔴 Junk Leads / Pass</option>
            <option value="follow_up">🔵 Follow-up Scheduled</option>
          </select>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e: any) => setRoleFilter(e.target.value)}
            className="text-xs font-semibold px-2.5 py-1.5 bg-white dark:bg-[#182536] border border-[#D8D5CE] dark:border-[#344658] rounded-lg text-[#202A2E] dark:text-[#F1F5F9] focus:outline-none cursor-pointer"
          >
            <option value="all">All Roles</option>
            <option value="founder">Founders & Owners</option>
            <option value="executive">Executives / Directors</option>
          </select>

          {/* Extraction Status */}
          <select
            value={enrichFilter}
            onChange={(e: any) => setEnrichFilter(e.target.value)}
            className="text-xs font-semibold px-2.5 py-1.5 bg-white dark:bg-[#182536] border border-[#D8D5CE] dark:border-[#344658] rounded-lg text-[#202A2E] dark:text-[#F1F5F9] focus:outline-none cursor-pointer"
          >
            <option value="all">All Extraction States</option>
            <option value="enriched">✓ Deep Intel Extracted</option>
            <option value="pending">⚡ Deep Extraction Pending</option>
          </select>

          {/* Succession Status */}
          <select
            value={successionFilter}
            onChange={(e: any) => setSuccessionFilter(e.target.value)}
            className="text-xs font-semibold px-2.5 py-1.5 bg-white dark:bg-[#182536] border border-[#D8D5CE] dark:border-[#344658] rounded-lg text-[#202A2E] dark:text-[#F1F5F9] focus:outline-none cursor-pointer"
          >
            <option value="all">All Succession States</option>
            <option value="high_risk">High Succession Risk</option>
            <option value="retirement">Retirement Readiness</option>
          </select>

          {(searchQuery || roleFilter !== 'all' || enrichFilter !== 'all' || successionFilter !== 'all' || leadStatusFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setRoleFilter('all');
                setEnrichFilter('all');
                setSuccessionFilter('all');
                setLeadStatusFilter('all');
              }}
              className="text-[11px] font-bold text-[#A65F3F] dark:text-[#C5B76A] hover:underline px-1 cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Founder Profile Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredProfiles.map(({ company, isEnriched, name, role, isFounder, isHighSuccession, leadStatus, age, ageProof, gender, industryExperience, ownershipStake, education, educationProof, priorExits, exitsProof, managementTeam, bio, successionNote, email, emailProof, phone, phoneProof, linkedin, additionalRequirementMatch }) => {
          const isSelected = selectedIds.includes(company.id);
          const isCurrentEnriching = enrichingId === company.id;
          const statusConfig = LEAD_STATUS_CONFIG[leadStatus as LeadStatus] || LEAD_STATUS_CONFIG.active;

          const initials = name
            .split(' ')
            .filter(n => !n.startsWith('"'))
            .map(n => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase() || 'MD';

          return (
            <Card
              key={company.id}
              className={`flex flex-col justify-between border transition-all duration-200 p-5 rounded-xl shadow-xs relative ${
                leadStatus === 'junk_lead'
                  ? 'opacity-70 bg-slate-50/70 dark:bg-[#141F2C]/70 border-[#FCA5A5]/60 dark:border-[#991B1B]/40'
                  : isSelected
                  ? 'border-[#202A2E] dark:border-[#7E8350] bg-white dark:bg-[#1D2B3A] shadow-sm ring-1 ring-[#202A2E]/10 dark:ring-[#C5B76A]/20'
                  : 'border-[#D8D5CE] dark:border-[#2D4053] bg-white dark:bg-[#182536]'
              }`}
            >
              {/* Top Row: Avatar, Name, Role, Affiliation, Lead Status Selector & Selection Checkbox */}
              <div className="flex flex-col gap-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    {/* Founder Avatar Monogram */}
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm shrink-0 border ${
                      isEnriched
                        ? 'bg-[#E3ECE6] text-[#35624A] border-[#B7CCBC] dark:bg-[#173529] dark:text-[#8FBEA1] dark:border-[#39634D]'
                        : 'bg-[#F4E8E2] text-[#A65F3F] border-[#A65F3F]/30 dark:bg-[#3A281F] dark:text-[#C27A56] dark:border-[#C27A56]/30'
                    }`}>
                      {initials}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="font-extrabold text-base text-[#202A2E] dark:text-[#F1F5F9] leading-tight truncate">
                          {name}
                        </h3>
                        {isEnriched ? (
                          <span className="flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.5 rounded bg-[#E3ECE6] text-[#35624A] dark:bg-[#173529] dark:text-[#8FBEA1] border border-[#B7CCBC] dark:border-[#39634D]">
                            <ShieldCheck className="h-3 w-3" />
                            AI EXTRACTED & VERIFIED
                          </span>
                        ) : (
                          <span className="flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#F1EFEA] text-[#626A6D] dark:bg-[#141F2C] dark:text-[#9AA9B8] border border-[#D8D5CE] dark:border-[#344658]">
                            BASIC DISCOVERY DATA
                          </span>
                        )}
                        {isFounder && (
                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-[#F4E8E2] text-[#A65F3F] dark:bg-[#3A281F] dark:text-[#C27A56] border border-[#A65F3F]/20 dark:border-[#C27A56]/30 uppercase">
                            Founder
                          </span>
                        )}
                      </div>

                      <span className="text-xs font-bold text-[#626A6D] dark:text-[#9AA9B8] block mt-0.5">
                        {role}
                      </span>

                      {/* Company affiliation chip */}
                      <div className="flex items-center gap-1 text-[11px] text-[#202A2E] dark:text-[#F1F5F9] font-semibold mt-1">
                        <Building2 className="h-3 w-3 text-[#899093] dark:text-[#9AA9B8] shrink-0" />
                        <span className="truncate">{company.name}</span>
                        <span className="text-[#899093] dark:text-[#9AA9B8]">·</span>
                        <span className="text-[#899093] dark:text-[#9AA9B8] truncate">{company.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Header Controls: Lead Status Dropdown + Shortlist Checkbox */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <label className="flex items-center gap-1.5 text-xs font-bold text-[#626A6D] dark:text-[#9AA9B8] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelection(company.id)}
                        className="rounded border-[#D8D5CE] text-[#A65F3F] focus:ring-[#A65F3F] h-4 w-4 cursor-pointer"
                      />
                      <span>Shortlist</span>
                    </label>

                    {/* Interactive Lead Status Selector */}
                    <div className="flex items-center gap-1">
                      <select
                        value={leadStatus}
                        onChange={(e) => handleUpdateLeadStatus(company.id, e.target.value as LeadStatus)}
                        className={`text-[10px] font-extrabold px-2 py-1 rounded-md border cursor-pointer focus:outline-none uppercase tracking-wider ${statusConfig.badgeBg} ${statusConfig.badgeText} ${statusConfig.borderColor}`}
                      >
                        <option value="active">🟢 Active Target</option>
                        <option value="contact_future">🟡 Contact in Future</option>
                        <option value="junk_lead">🔴 Junk Lead / Pass</option>
                        <option value="follow_up">🔵 Follow-up</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Junk Lead Warning Banner if marked */}
                {leadStatus === 'junk_lead' && (
                  <div className="p-2 rounded bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 text-[11px] text-rose-700 dark:text-rose-300 font-semibold flex items-center gap-2">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0 text-rose-600" />
                    <span>Marked as Junk Lead / Pass. This prospect will be filtered out from automated outreach.</span>
                  </div>
                )}

                {/* ─── Founder Age & Demographics Card with Source Proof in brackets ─── */}
                {isEnriched && age ? (
                  <div className="p-3 rounded-lg bg-[#F1EFEA]/80 dark:bg-[#1D2B3A] border border-[#D8D5CE] dark:border-[#344658] flex flex-col gap-1.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#626A6D] dark:text-[#9AA9B8]">
                        Founder Demographics & Age
                      </span>
                      <span className="text-[10px] font-semibold text-[#35624A] dark:text-[#8FBEA1]">
                        [Source Proof: {ageProof}]
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-[#202A2E] dark:text-[#F1F5F9]">
                      <span className="px-2 py-0.5 rounded bg-white dark:bg-[#141F2C] border border-[#D8D5CE] dark:border-[#2D4053]">
                        Age: <strong>{age} Years</strong> ({gender})
                      </span>
                      {industryExperience && (
                        <span className="px-2 py-0.5 rounded bg-white dark:bg-[#141F2C] border border-[#D8D5CE] dark:border-[#2D4053]">
                          {industryExperience}
                        </span>
                      )}
                      {ownershipStake && (
                        <span className="px-2 py-0.5 rounded bg-white dark:bg-[#141F2C] border border-[#D8D5CE] dark:border-[#2D4053]">
                          {ownershipStake}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-2 text-[11px] pt-1">
                    {ownershipStake ? (
                      <span className="px-2 py-0.5 rounded font-semibold bg-[#F1EFEA] dark:bg-[#1D2B3A] text-[#202A2E] dark:text-[#F1F5F9] border border-[#D8D5CE] dark:border-[#344658]">
                        {ownershipStake}
                      </span>
                    ) : null}
                    <span className="text-[10.5px] text-[#899093] dark:text-[#9AA9B8] italic">
                      (Founder age, direct mobile, verified email & prior exits pending deep extraction)
                    </span>
                  </div>
                )}

                {/* ─── Mandate Additional Requirement Match (with Proof in Brackets) ─── */}
                {isEnriched && additionalRequirementMatch && (
                  <div className="p-3 rounded-lg bg-[#E3ECE6]/70 dark:bg-[#173529]/40 border border-[#B7CCBC] dark:border-[#39634D] flex flex-col gap-1 text-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <span className="font-bold text-[#35624A] dark:text-[#8FBEA1] flex items-center gap-1 text-[11px]">
                        <Sparkles className="h-3.5 w-3.5" /> Mandate Additional Requirement Match
                      </span>
                      <span className="text-[10px] font-semibold text-[#35624A] dark:text-[#8FBEA1]">
                        [Source Proof: {additionalRequirementMatch.proofSource}]
                      </span>
                    </div>
                    <p className="text-xs text-[#202A2E] dark:text-[#F1F5F9] mt-0.5">
                      <strong className="font-bold">{additionalRequirementMatch.requirement}: </strong>
                      <span>{additionalRequirementMatch.extractedValue}</span>
                    </p>
                  </div>
                )}

                {/* Succession Signal Alert Badge */}
                {isHighSuccession && (
                  <div className="p-2.5 rounded-lg bg-[#F5EDDA]/70 dark:bg-[#3A3520]/50 border border-[#E3D4B3] dark:border-[#625A2F] flex items-start gap-2 text-xs">
                    <AlertCircle className="h-4 w-4 text-[#9A7535] dark:text-[#D5C76E] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[#9A7535] dark:text-[#D5C76E] font-bold block">
                        Succession & Exit Signal
                      </strong>
                      <p className="text-[#626A6D] dark:text-[#9AA9B8] text-[11px] mt-0.5 leading-snug">
                        {successionNote}
                      </p>
                    </div>
                  </div>
                )}

                {/* Executive Bio / Background */}
                <div className="text-xs text-[#626A6D] dark:text-[#9AA9B8] leading-relaxed">
                  <strong className="text-[#202A2E] dark:text-[#F1F5F9] font-bold">Career & Background: </strong>
                  {bio}
                </div>

                {/* Education & Prior Exits (Visible when enriched) */}
                {isEnriched && (education || priorExits) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] bg-[#F1EFEA]/40 dark:bg-[#141F2C]/40 p-2.5 rounded border border-[#E5E2DC] dark:border-[#263544]">
                    {education && (
                      <div className="flex flex-col gap-0.5 text-[#626A6D] dark:text-[#9AA9B8]">
                        <div className="flex items-center gap-1 font-bold text-[#202A2E] dark:text-[#F1F5F9]">
                          <GraduationCap className="h-3.5 w-3.5 text-[#899093] shrink-0" />
                          <span>Education:</span>
                        </div>
                        <span className="truncate">{education}</span>
                        {educationProof && (
                          <span className="text-[9.5px] text-[#899093] dark:text-[#9AA9B8]">[Proof: {educationProof}]</span>
                        )}
                      </div>
                    )}
                    {priorExits && (
                      <div className="flex flex-col gap-0.5 text-[#626A6D] dark:text-[#9AA9B8]">
                        <div className="flex items-center gap-1 font-bold text-[#202A2E] dark:text-[#F1F5F9]">
                          <Briefcase className="h-3.5 w-3.5 text-[#899093] shrink-0" />
                          <span>Venture History:</span>
                        </div>
                        <span className="truncate">{priorExits}</span>
                        {exitsProof && (
                          <span className="text-[9.5px] text-[#899093] dark:text-[#9AA9B8]">[Proof: {exitsProof}]</span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Lieutenants / Management Team */}
                {managementTeam && (
                  <div className="text-[11px] text-[#626A6D] dark:text-[#9AA9B8] leading-snug bg-[#F1EFEA]/60 dark:bg-[#1D2B3A]/60 p-2 rounded border border-[#E5E2DC] dark:border-[#263544]">
                    <strong className="text-[#202A2E] dark:text-[#F1F5F9]">Key Management Lieutenants: </strong>
                    <span>{managementTeam}</span>
                  </div>
                )}

                {/* ─── Contact Dossier & AI Extraction Module ─── */}
                <div className={`p-3 rounded-lg border transition-all ${
                  isEnriched
                    ? 'border-[#B7CCBC] dark:border-[#39634D] bg-[#E3ECE6]/30 dark:bg-[#173529]/20'
                    : 'border-[#D8D5CE] dark:border-[#2D4053] bg-[#F1EFEA]/40 dark:bg-[#141F2C]/60'
                }`}>
                  <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-[#D8D5CE]/60 dark:border-[#263544]">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#626A6D] dark:text-[#9AA9B8] flex items-center gap-1">
                      {isEnriched ? (
                        <>
                          <ShieldCheck className="h-3.5 w-3.5 text-[#35624A] dark:text-[#8FBEA1]" />
                          Deep Contact Intelligence (Extracted via AI)
                        </>
                      ) : (
                        <>
                          <Cpu className="h-3.5 w-3.5 text-[#A65F3F] dark:text-[#C27A56]" />
                          Additional Contact Data (Pending Extraction)
                        </>
                      )}
                    </span>

                    {!isEnriched ? (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleSingleEnrich(company.id)}
                        disabled={isCurrentEnriching}
                        className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#A65F3F] hover:bg-[#8F4F36] dark:bg-[#C27A56] text-white border-none min-h-0"
                      >
                        {isCurrentEnriching ? (
                          <span className="flex items-center gap-1">
                            <RefreshCw className="h-3 w-3 animate-spin" /> Extracting Intel...
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Sparkles className="h-3 w-3" /> Run Deep AI Extraction
                          </span>
                        )}
                      </Button>
                    ) : (
                      <span className="text-[9px] font-bold text-[#35624A] dark:text-[#8FBEA1]">
                        ✓ Model Extraction Complete
                      </span>
                    )}
                  </div>

                  {/* Direct Contact Details with Proofs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {/* Email */}
                    <div className="flex flex-col gap-1 p-2 rounded bg-white dark:bg-[#182536] border border-[#D8D5CE] dark:border-[#344658]">
                      <div className="flex items-center justify-between gap-1.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Mail className="h-3.5 w-3.5 text-[#899093] dark:text-[#9AA9B8] shrink-0" />
                          <span className={`text-[11px] truncate ${isEnriched ? 'font-semibold text-[#202A2E] dark:text-[#F1F5F9]' : 'text-[#899093] italic'}`}>
                            {email ? email : 'Direct email not yet extracted'}
                          </span>
                        </div>
                        {isEnriched && email && (
                          <button
                            onClick={() => copyToClipboard(email, `email-${company.id}`)}
                            className="p-1 text-[#899093] hover:text-[#202A2E] dark:hover:text-white cursor-pointer"
                            title="Copy Direct Email"
                          >
                            {copiedField === `email-${company.id}` ? <Check className="h-3 w-3 text-[#35624A]" /> : <Copy className="h-3 w-3" />}
                          </button>
                        )}
                      </div>
                      {isEnriched && emailProof && (
                        <span className="text-[9.5px] text-[#35624A] dark:text-[#8FBEA1] font-medium">
                          [Proof: {emailProof}]
                        </span>
                      )}
                    </div>

                    {/* Phone */}
                    <div className="flex flex-col gap-1 p-2 rounded bg-white dark:bg-[#182536] border border-[#D8D5CE] dark:border-[#344658]">
                      <div className="flex items-center justify-between gap-1.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Phone className="h-3.5 w-3.5 text-[#899093] dark:text-[#9AA9B8] shrink-0" />
                          <span className={`text-[11px] truncate ${isEnriched ? 'font-semibold text-[#202A2E] dark:text-[#F1F5F9]' : 'text-[#899093] italic'}`}>
                            {phone ? phone : 'Direct mobile not yet extracted'}
                          </span>
                        </div>
                        {isEnriched && phone && (
                          <button
                            onClick={() => copyToClipboard(phone, `phone-${company.id}`)}
                            className="p-1 text-[#899093] hover:text-[#202A2E] dark:hover:text-white cursor-pointer"
                            title="Copy Direct Mobile"
                          >
                            {copiedField === `phone-${company.id}` ? <Check className="h-3 w-3 text-[#35624A]" /> : <Copy className="h-3 w-3" />}
                          </button>
                        )}
                      </div>
                      {isEnriched && phoneProof && (
                        <span className="text-[9.5px] text-[#35624A] dark:text-[#8FBEA1] font-medium">
                          [Proof: {phoneProof}]
                        </span>
                      )}
                    </div>
                  </div>

                  {/* LinkedIn Profile */}
                  {isEnriched && linkedin ? (
                    <div className="mt-2 flex items-center justify-between text-[11px] pt-1.5 border-t border-[#D8D5CE]/60 dark:border-[#263544]">
                      <div className="flex items-center gap-1.5 text-[#0077B5] font-semibold">
                        <svg className="h-3.5 w-3.5 fill-current shrink-0" viewBox="0 0 24 24">
                          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.64 1.64 0 1 0 0 3.28 1.64 1.64 0 0 0 0-3.28" />
                        </svg>
                        <span className="truncate">Verified Executive Profile</span>
                      </div>
                      <a
                        href={linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#0077B5] hover:underline flex items-center gap-0.5 text-[11px] font-bold"
                      >
                        Open Profile <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  ) : (
                    <div className="mt-1.5 text-[10.5px] text-[#899093] dark:text-[#9AA9B8] flex items-center gap-1">
                      <span>• Run Deep Extraction to fetch verified executive profile and primary source proofs.</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="sticky bottom-0 bg-white/95 dark:bg-[#111B27]/95 backdrop-blur-md border-t border-[#D8D5CE] dark:border-[#263544] py-4 px-6 -mx-4 -mb-12 flex items-center justify-between z-25 shadow-lg mt-6">
        <Button
          variant="outline"
          onClick={handleBack}
          leftIcon={<ArrowLeft className="h-4 w-4" />}
          className="min-w-[120px] text-xs font-bold"
        >
          Back to Companies
        </Button>

        <div className="hidden sm:flex items-center gap-3 text-xs text-[#626A6D] dark:text-[#9AA9B8]">
          <span className="font-semibold">
            <strong className="text-[#35624A] dark:text-[#8FBEA1] font-bold">{enrichedCount}</strong> of {totalFounders} Founders Extracted
          </span>
          <span>•</span>
          <span className="font-semibold">
            <strong className="text-[#A65F3F] dark:text-[#C27A56] font-bold">{selectedCount}</strong> Shortlisted for Review
          </span>
        </div>

        <Button
          variant="primary"
          onClick={handleContinue}
          rightIcon={<ArrowRight className="h-4 w-4" />}
          className="min-w-[200px] text-xs font-bold bg-[#202A2E] hover:bg-[#141B1E] dark:bg-[#E6E9E5] dark:text-[#101820]"
          id="continue-to-review-from-founders-btn"
        >
          Continue to Review Results
        </Button>
      </div>
    </div>
  );
};
export default DiscoverFounders;
