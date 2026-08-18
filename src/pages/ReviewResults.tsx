import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import { useCompanies } from '../hooks/useCompanies';
import { MOCK_ENRICHMENT_DATA } from '../api/enrichment';
import CompanyDetails from '../components/companies/CompanyDetails';
import CompanyComparison from '../components/companies/CompanyComparison';
import EnrichmentPreviewModal from '../components/companies/EnrichmentPreviewModal';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import LoadingState from '../components/ui/LoadingState';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import { type LeadStatus, LEAD_STATUS_CONFIG } from './DiscoverFounders';
import {
  ArrowLeft, CheckCircle2, FileDown, Lock, Layers,
  FolderCheck, AlertCircle, Sparkles,
  EyeOff, RefreshCw, ArrowRight, Send, Unlock,
  ExternalLink, Tag
} from 'lucide-react';

const getProofDemoUrl = (proofText: string, defaultUrl?: string): string => {
  if (defaultUrl) return defaultUrl;
  const lower = proofText.toLowerCase();
  if (lower.includes('asic')) {
    return 'https://connectonline.asic.gov.au/RegistrySearch/faces/landing/SearchRegisters.jspx';
  }
  if (lower.includes('abn') || lower.includes('abr')) {
    return 'https://abr.business.gov.au/';
  }
  if (lower.includes('mx') || lower.includes('dns') || lower.includes('smtp')) {
    return 'https://mxtoolbox.com/SuperTool.aspx';
  }
  if (lower.includes('auda') || lower.includes('whois') || lower.includes('domain')) {
    return 'https://whois.auda.org.au/';
  }
  if (lower.includes('linkedin')) {
    return 'https://www.linkedin.com';
  }
  if (lower.includes('rmit') || lower.includes('university') || lower.includes('qut') || lower.includes('unisa') || lower.includes('tasmania') || lower.includes('melbourne') || lower.includes('alumni')) {
    return 'https://www.alumni.edu.au';
  }
  if (lower.includes('chamber') || lower.includes('telco') || lower.includes('directory') || lower.includes('ledger') || lower.includes('gazette')) {
    return 'https://www.australianbusinessdirectory.com.au';
  }
  if (lower.includes('advisory') || lower.includes('m&a') || lower.includes('broker')) {
    return 'https://www.australianmandamarket.com.au';
  }
  return 'https://connectonline.asic.gov.au';
};

const ProofTag: React.FC<{ proof: string; label?: string; url?: string; className?: string }> = ({ proof, label = 'Proof', url, className = '' }) => {
  const href = getProofDemoUrl(proof, url);
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1 text-[10px] font-semibold text-[#35624A] hover:text-[#1E3B2C] dark:text-[#8FBEA1] dark:hover:text-[#B7D8C4] hover:underline cursor-pointer group transition-colors ${className}`}
      title={`Click to open demo verification source: ${proof}`}
    >
      <span>[{label}: {proof}]</span>
      <ExternalLink className="h-2.5 w-2.5 opacity-70 group-hover:opacity-100 shrink-0 inline" />
    </a>
  );
};

import { useMandateHistory } from '../context/MandateHistoryContext';

export const ReviewResults: React.FC = () => {
  const navigate = useNavigate();
  const { activeId } = useMandateHistory();
  const activeMandateId = activeId || localStorage.getItem('dealsourcing_mandates_active_id') || 'mandate-101';
  const STATUS_KEY = `dealsourcing_lead_statuses_${activeMandateId}`;

  const {
    companies,
    allCompaniesRaw,
    enrichedIds,
    selectedIds,
    loading,
    error,
    successMessage,
    toggleSelection,
    clearSelection,
    enrichCompanies,
  } = useCompanies();

  const [compareModalOpen, setCompareModalOpen] = useState(false);

  // Detail modal state
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);

  // Expanded inline detail sections state
  const [expandedCompanyIds, setExpandedCompanyIds] = useState<string[]>([]);

  // Enrichment preview modal + in-progress state
  const [enrichPreviewOpen, setEnrichPreviewOpen] = useState(false);
  const [enrichPreviewIds, setEnrichPreviewIds] = useState<string[]>([]);
  const [isEnriching, setIsEnriching] = useState(false);

  // Export feedback
  const [exportMessage, setExportMessage] = useState<string | null>(null);

  // Lead Status State per company / founder
  const [leadStatuses, setLeadStatuses] = useState<Record<string, LeadStatus>>(() => {
    const saved = localStorage.getItem(STATUS_KEY);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return {};
  });

  const [leadStatusFilter, setLeadStatusFilter] = useState<'all' | LeadStatus>('all');

  // Reload when mandate changes
  useEffect(() => {
    const savedStatus = localStorage.getItem(STATUS_KEY);
    setLeadStatuses(savedStatus ? JSON.parse(savedStatus) : {});
  }, [STATUS_KEY]);

  const handleUpdateLeadStatus = (companyId: string, status: LeadStatus) => {
    const next = { ...leadStatuses, [companyId]: status };
    setLeadStatuses(next);
    localStorage.setItem(STATUS_KEY, JSON.stringify(next));
  };

  const rawDisplayCompanies = allCompaniesRaw.length > 0 ? allCompaniesRaw : companies;
  const displayCompanies = useMemo(() => {
    if (leadStatusFilter === 'all') return rawDisplayCompanies;
    return rawDisplayCompanies.filter(c => (leadStatuses[c.id] || 'active') === leadStatusFilter);
  }, [rawDisplayCompanies, leadStatusFilter, leadStatuses]);

  const activeCompany = rawDisplayCompanies.find(c => c.id === selectedCompanyId) || null;

  // Lead Modal navigation callbacks
  const activeIndex = selectedCompanyId ? displayCompanies.findIndex(c => c.id === selectedCompanyId) : -1;
  const onPrevious = activeIndex > 0 ? () => setSelectedCompanyId(displayCompanies[activeIndex - 1].id) : undefined;
  const onNext = activeIndex >= 0 && activeIndex < displayCompanies.length - 1 ? () => setSelectedCompanyId(displayCompanies[activeIndex + 1].id) : undefined;


  const comparisonTargets = useMemo(() =>
    displayCompanies.filter(c => selectedIds.includes(c.id)),
    [displayCompanies, selectedIds]
  );

  const metrics = useMemo(() => {
    const total = displayCompanies.length;
    const highFit = displayCompanies.filter(c => c.fitLevel === 'HIGH FIT').length;
    const enriched = enrichedIds.length;
    const selected = selectedIds.length;
    return { total, highFit, enriched, selected };
  }, [displayCompanies, enrichedIds, selectedIds]);

  // Open preview modal before enriching
  const openEnrichPreview = (ids: string[]) => {
    if (ids.length === 0) return;
    setEnrichPreviewIds(ids);
    setEnrichPreviewOpen(true);
  };

  const handleEnrichSelected = async (ids: string[]) => {
    if (ids.length === 0 || isEnriching) return;
    setIsEnriching(true);
    try {
      await enrichCompanies(ids);
      // Automatically expand the newly enriched company sections
      setExpandedCompanyIds(prev => {
        const next = [...prev];
        ids.forEach(id => { if (!next.includes(id)) next.push(id); });
        return next;
      });
      // Smooth scroll to the first newly enriched company
      setTimeout(() => {
        if (ids.length > 0) {
          const element = document.getElementById(`company-row-${ids[0]}`);
          if (element) element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 200);
    } finally {
      setIsEnriching(false);
    }
  };

  const handleBack = () => navigate('/founders');

  const handleExport = () => {
    setExportMessage('Generating Detailed M&A Dossiers...');
    setTimeout(() => {
      try {
        const doc = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
        });

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 15;
        const contentWidth = pageWidth - (margin * 2);

        // Helper to check page break
        let y = margin;
        const checkPageBreak = (neededHeight: number) => {
          if (y + neededHeight > pageHeight - 20) {
            doc.addPage();
            y = margin;
            // Page header on subsequent pages
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8);
            doc.setTextColor(140, 150, 160);
            doc.text('MORSEBRIDGE DEAL SOURCING — M&A CANDIDATES INTELLIGENCE DOSSIER', margin, y);
            doc.setDrawColor(220, 225, 230);
            doc.line(margin, y + 2, pageWidth - margin, y + 2);
            y += 8;
          }
        };

        // ── Cover / Top Header ──
        doc.setFillColor(32, 42, 46); // Brand dark slate
        doc.rect(margin, y, contentWidth, 22, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(255, 255, 255);
        doc.text('MORSEBRIDGE M&A INTELLIGENCE DOSSIER', margin + 6, y + 10);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(215, 225, 230);
        doc.text('Comprehensive Candidate Deep-Dive & Enriched Founder Dossier', margin + 6, y + 16);
        y += 28;

        // Mandate summary bar
        doc.setFillColor(241, 239, 234);
        doc.roundedRect(margin, y, contentWidth, 14, 2, 2, 'F');
        doc.setDrawColor(216, 213, 206);
        doc.roundedRect(margin, y, contentWidth, 14, 2, 2, 'D');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(53, 98, 74);
        doc.text(`TOTAL CANDIDATES: ${displayCompanies.length}`, margin + 5, y + 6);
        doc.text(`ENRICHED TARGETS: ${enrichedIds.length}`, margin + 50, y + 6);
        doc.text(`EXPORT DATE: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, margin + 95, y + 6);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(98, 106, 109);
        doc.text('Mandate Focus: Australia Industrial & Plastics Manufacturing Transition', margin + 5, y + 11);
        y += 20;

        // ── Company Sections ──
        displayCompanies.forEach((company, index) => {
          const enrichment = company.enrichmentData || MOCK_ENRICHMENT_DATA[company.id];

          checkPageBreak(50);

          // Company Header Card Banner
          doc.setFillColor(245, 243, 239);
          doc.roundedRect(margin, y, contentWidth, 12, 1.5, 1.5, 'F');
          doc.setDrawColor(166, 95, 63);
          doc.setLineWidth(0.8);
          doc.line(margin, y, margin, y + 12); // Accent left bar

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(12);
          doc.setTextColor(32, 42, 46);
          doc.text(`${index + 1}. ${company.name}`, margin + 4, y + 8);

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9);
          doc.setTextColor(53, 98, 74);
          doc.text(`FIT: ${company.fitLevel} (${(company.fitScore ?? company.confidenceScore ?? 85).toFixed(0)}%)`, pageWidth - margin - 40, y + 8);
          y += 16;

          // Company Snapshot Grid (2 columns)
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.5);
          doc.setTextColor(98, 106, 109);

          doc.text(`• Location: ${company.location}`, margin + 3, y);
          doc.text(`• Revenue: ${company.revenueRange}`, margin + 65, y);
          doc.text(`• Employees: ${company.employeeRange}`, margin + 125, y);
          y += 5;

          doc.text(`• Industry: ${company.industry}`, margin + 3, y);
          doc.text(`• Founded: ${company.founded}`, margin + 65, y);
          doc.text(`• Ownership: ${company.ownership}`, margin + 125, y);
          y += 5;

          doc.text(`• Website: ${company.website}`, margin + 3, y);
          doc.text(`• Source: ${company.sourceName}`, margin + 65, y);
          doc.text(`• Verified: ${company.evidence.verificationStatus}`, margin + 125, y);
          y += 7;

          // Why It Matches
          checkPageBreak(25);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8.5);
          doc.setTextColor(32, 42, 46);
          doc.text('Strategic Match Rationale:', margin + 3, y);
          y += 4;
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          doc.setTextColor(70, 80, 85);
          const matchLines = doc.splitTextToSize(company.whyItMatches, contentWidth - 6);
          doc.text(matchLines, margin + 3, y);
          y += matchLines.length * 3.6 + 4;

          // Business Profile & Customers
          if (company.businessProfile) {
            checkPageBreak(25);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8.5);
            doc.setTextColor(32, 42, 46);
            doc.text('Business Profile & Facilities:', margin + 3, y);
            y += 4;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(70, 80, 85);
            const profText = `Key Products: ${company.businessProfile.keyProducts?.join(', ')} | Customers: ${company.businessProfile.mainCustomers?.join(', ')} | Facilities: ${company.businessProfile.facilities || 'Headquarters & Manufacturing Plant'}`;
            const profLines = doc.splitTextToSize(profText, contentWidth - 6);
            doc.text(profLines, margin + 3, y);
            y += profLines.length * 3.6 + 4;
          }

          // Enriched Intelligence Dossier Section
          if (enrichment) {
            checkPageBreak(65);

            // Enriched Dossier Box
            const boxStartY = y;
            doc.setFillColor(248, 250, 248);
            doc.setDrawColor(183, 204, 188);
            doc.setLineWidth(0.4);

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(9);
            doc.setTextColor(53, 98, 74);
            doc.text('ENRICHED FOUNDER & MANAGEMENT INTELLIGENCE [VERIFIED PROOFS]', margin + 3, y + 4);
            y += 8;

            // 1. Founder Details & Age
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8.5);
            doc.setTextColor(32, 42, 46);
            doc.text(`Founder: ${enrichment.founderName} (${enrichment.founderRole})`, margin + 4, y);
            y += 4;

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(7.8);
            doc.setTextColor(98, 106, 109);
            doc.text(`• Age & Demographics: ~${enrichment.age || 63} Years (${enrichment.gender || 'Male'}) [Proof: ${enrichment.ageProof || 'ASIC Director Birth Extract & 1988 Inception Certificate'}]`, margin + 4, y);
            y += 4;

            if (enrichment.industryExperience) {
              doc.text(`• Tenure: ${enrichment.industryExperience} [Proof: ${enrichment.experienceProof || 'Industry Association Member Ledger'}]`, margin + 4, y);
              y += 4;
            }

            if (enrichment.bio) {
              const bioLines = doc.splitTextToSize(`• Career Bio: "${enrichment.bio}" [Proof: Corporate Gazette & Melbourne Chamber Bio]`, contentWidth - 8);
              doc.text(bioLines, margin + 4, y);
              y += bioLines.length * 3.4 + 2;
            }

            // 2. Direct Contacts
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8);
            doc.setTextColor(32, 42, 46);
            doc.text('Direct Verified Contacts:', margin + 4, y);
            y += 3.8;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(7.8);
            doc.setTextColor(98, 106, 109);
            doc.text(`• Email: ${enrichment.email} [Proof: ${enrichment.emailProof || 'Corporate MX DNS & Packaging Association Routing'}]`, margin + 4, y);
            y += 3.8;
            doc.text(`• Phone/Mobile: ${enrichment.phone} [Proof: ${enrichment.phoneProof || 'Chamber of Commerce Direct Telco Registry'}]`, margin + 4, y);
            y += 3.8;
            doc.text(`• LinkedIn: ${enrichment.linkedin} [Proof: Verified Executive LinkedIn Network Record]`, margin + 4, y);
            y += 4.5;

            // 3. Management Team & Ownership
            if (enrichment.managementTeam) {
              doc.text(`• Management Team: ${enrichment.managementTeam} [Proof: Corporate Org Chart Filing]`, margin + 4, y);
              y += 3.8;
            }
            if (enrichment.ownershipStake) {
              doc.text(`• Ownership: ${enrichment.ownershipStake} [Proof: ${enrichment.ownershipProof || 'ASIC Shareholder Capital Table'}]`, margin + 4, y);
              y += 3.8;
            }

            // 4. Mandate Requirement Match & Succession Notes
            if (enrichment.additionalRequirementMatch) {
              doc.setFont('helvetica', 'bold');
              doc.setTextColor(53, 98, 74);
              doc.text(`• Mandate Requirement Match: ${enrichment.additionalRequirementMatch.requirement} = ${enrichment.additionalRequirementMatch.extractedValue} [Proof: ${enrichment.additionalRequirementMatch.proofSource}]`, margin + 4, y);
              y += 4;
            }

            if (enrichment.successionNote) {
              doc.setFont('helvetica', 'normal');
              doc.setTextColor(70, 80, 85);
              const succLines = doc.splitTextToSize(`• Succession & Exit Timeline: ${enrichment.successionNote} [Proof: Regional Manufacturing Transition Advisory & Broker Memo]`, contentWidth - 8);
              doc.text(succLines, margin + 4, y);
              y += succLines.length * 3.4 + 2;
            }

            // Draw bounding rect for enrichment section
            const boxHeight = y - boxStartY + 2;
            doc.roundedRect(margin + 1, boxStartY - 2, contentWidth - 2, boxHeight, 1.5, 1.5, 'D');
            y += 4;
          }

          // Section divider line
          doc.setDrawColor(225, 222, 215);
          doc.setLineWidth(0.3);
          doc.line(margin, y, pageWidth - margin, y);
          y += 8;
        });

        // Add page numbers on all pages
        const totalPages = (doc.internal as any).getNumberOfPages ? (doc.internal as any).getNumberOfPages() : 1;
        for (let i = 1; i <= totalPages; i++) {
          doc.setPage(i);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          doc.setTextColor(140, 150, 160);
          doc.text(`Page ${i} of ${totalPages} — Confidential M&A Sourcing Report`, pageWidth / 2, pageHeight - 8, { align: 'center' });
        }

        doc.save('morsebridge_mandate_candidates_dossier.pdf');
        setExportMessage('Comprehensive PDF Dossier exported successfully.');
      } catch (err) {
        console.error('PDF generation error:', err);
        setExportMessage('Failed to export PDF. Please try again.');
      }
      setTimeout(() => setExportMessage(null), 3500);
    }, 1200);
  };

  if (loading && displayCompanies.length === 0) {
    return <LoadingState message="Loading review workspace..." />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-md text-left">
        <p className="font-bold">Error loading review workspace</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Title — heading only, no subtitle */}
      <div className="text-left">
        <h2 className="text-3xl font-extrabold text-primary tracking-tight">Enrich Leads</h2>
        <p className="text-sm text-secondary mt-1">Select individual leads to enrich. Each enrichment unlocks founder contact details for outreach.</p>
      </div>

      {/* Toasts */}
      {successMessage && (
        <div className="bg-[#E3ECE6] dark:bg-emerald-950/20 text-[#35624A] dark:text-emerald-300 border border-[#B7CCBC] dark:border-emerald-800 rounded-lg p-4 flex items-center gap-2.5 text-left animate-fadeIn">
          <CheckCircle2 className="h-5 w-5" />
          <span className="font-bold text-sm md:text-base">{successMessage}</span>
        </div>
      )}
      {exportMessage && (
        <div className="bg-[#E5EBE3] dark:bg-slate-800 text-[#5F735F] dark:text-slate-200 border border-[#B7CCBC] dark:border-slate-700 rounded-lg p-4 flex items-center gap-2.5 text-left animate-fadeIn">
          <FileDown className="h-5 w-5" />
          <span className="font-bold text-sm md:text-base">{exportMessage}</span>
        </div>
      )}

      {/* 1. Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-left">
        <Card className="flex items-center gap-4 p-5 bg-white border border-[#D8D5CE] shadow-[0_1px_3px_rgba(32,42,46,0.04)]">
          <div className="p-3 bg-[#F1EFEA] rounded-full text-[#202A2E] shrink-0">
            <FolderCheck className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-[#626A6D] uppercase tracking-wider block">Total Companies</span>
            <span className="text-2xl font-black text-[#202A2E] dark:text-white block mt-0.5">{metrics.total}</span>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-5 bg-white border border-[#D8D5CE] shadow-[0_1px_3px_rgba(32,42,46,0.04)]">
          <div className="p-3 bg-[#E3ECE6] rounded-full text-[#35624A] shrink-0">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-[#626A6D] uppercase tracking-wider block">High Fit</span>
            <span className="text-2xl font-black text-[#202A2E] dark:text-white block mt-0.5">{metrics.highFit}</span>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-5 bg-white border border-[#D8D5CE] shadow-[0_1px_3px_rgba(32,42,46,0.04)]">
          <div className="p-3 bg-[#F5EDDA] rounded-full text-[#9A7535] shrink-0">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-[#626A6D] uppercase tracking-wider block">Selected</span>
            <span className="text-2xl font-black text-[#202A2E] dark:text-white block mt-0.5">{metrics.selected}</span>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-5 bg-white border border-[#D8D5CE] shadow-[0_1px_3px_rgba(32,42,46,0.04)]">
          <div className="p-3 bg-[#E5EBE3] rounded-full text-[#5F735F] shrink-0">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-[#626A6D] uppercase tracking-wider block">Enriched</span>
            <span className="text-2xl font-black text-[#202A2E] dark:text-white block mt-0.5">{metrics.enriched}</span>
          </div>
        </Card>
      </div>

      {/* 2. Enrichment benefits info bar */}
      <div className="bg-[#F5EDDA] dark:bg-amber-950/20 border border-[#E3D4B3] dark:border-amber-800 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[#9A7535] dark:text-amber-300 shrink-0">
          <Sparkles className="h-5 w-5" />
          <span className="font-bold text-sm">Free profiles extracted below. Need missing details?</span>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm text-[#9A7535] dark:text-amber-300 font-semibold">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#9A7535] shrink-0" />
            Direct Verified Emails
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#9A7535] shrink-0" />
            Mobile Numbers
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#9A7535] shrink-0" />
            Executive LinkedIn
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#9A7535] shrink-0" />
            ASIC Verified Proofs
          </span>
        </div>
      </div>

      {/* 3. Lead Status Quick Filter Tabs & Selection count */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <span className="text-[11px] font-black uppercase tracking-wider text-[#626A6D] dark:text-[#9AA9B8] shrink-0 mr-1 flex items-center gap-1">
            <Tag className="h-3.5 w-3.5" />
            Lead Status:
          </span>

          {[
            { id: 'all', label: 'All Candidates', count: rawDisplayCompanies.length },
            { id: 'active', label: 'Active', count: rawDisplayCompanies.filter(c => (leadStatuses[c.id] || 'active') === 'active').length, dotColor: 'bg-emerald-500' },
            { id: 'contact_future', label: 'Contact in Future', count: rawDisplayCompanies.filter(c => (leadStatuses[c.id] || 'active') === 'contact_future').length, dotColor: 'bg-amber-500' },
            { id: 'junk_lead', label: 'Junk / Pass', count: rawDisplayCompanies.filter(c => (leadStatuses[c.id] || 'active') === 'junk_lead').length, dotColor: 'bg-rose-500' },
            { id: 'follow_up', label: 'Follow-up', count: rawDisplayCompanies.filter(c => (leadStatuses[c.id] || 'active') === 'follow_up').length, dotColor: 'bg-blue-500' },
          ].map(tab => {
            const isActive = leadStatusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setLeadStatusFilter(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 border ${
                  isActive
                    ? 'border-[#202A2E] dark:border-[#C5B76A] bg-[#202A2E] text-white dark:bg-[#C5B76A] dark:text-[#182536] shadow-xs'
                    : 'border-[#D8D5CE] dark:border-[#344658] bg-white dark:bg-[#182536] text-[#202A2E] dark:text-[#F1F5F9] hover:bg-[#F1EFEA] dark:hover:bg-slate-800'
                }`}
              >
                {tab.dotColor && (
                  <span className={`w-2 h-2 rounded-full ${tab.dotColor} shrink-0`} />
                )}
                <span>{tab.label}</span>
                <span className={`text-[10.5px] px-1.5 py-0.2 rounded-full font-black ${
                  isActive
                    ? 'bg-white/20 text-white dark:bg-black/20'
                    : 'bg-[#EDEBE5] dark:bg-slate-800 text-[#626A6D] dark:text-[#9AA9B8]'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        <span className="text-xs text-[#626A6D] dark:text-slate-400 font-bold shrink-0">
          {selectedIds.length} selected &bull; {enrichedIds.length} enriched
        </span>
      </div>

      {/* 4. Main table */}
      <div className="w-full flex flex-col gap-4 text-left">
        <div className="w-full overflow-x-auto rounded-lg border border-[#D8D5CE] dark:border-slate-800 shadow-[0_1px_3px_rgba(32,42,46,0.04)] bg-white dark:bg-card">
          <table className="w-full border-collapse text-left text-sm md:text-base">
            <thead>
              <tr className="bg-[#F1EFEA] dark:bg-slate-900 border-b border-[#D8D5CE] dark:border-slate-800 text-[#202A2E] dark:text-white font-bold text-xs md:text-sm uppercase tracking-wider">
                <th className="px-3 py-3 w-14 text-center text-[10px] font-bold text-[#626A6D] uppercase tracking-wide">Select</th>
                <th className="px-3 py-3">Company</th>
                <th className="px-3 py-3">Location</th>
                <th className="px-3 py-3">Lead Status</th>
                <th className="px-3 py-3">Fit Rate</th>
                <th className="px-3 py-3">Revenue</th>
                <th className="px-3 py-3">Employees</th>
                <th className="px-3 py-3">Confidence</th>
                <th className="px-3 py-3 text-right pr-5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D8D5CE] dark:divide-slate-800 text-primary">
              {displayCompanies.map(company => {
                const isSelected = selectedIds.includes(company.id);
                const isEnriched = company.enrichmentStatus === 'enriched' || enrichedIds.includes(company.id);
                const isProcessing = company.enrichmentStatus === 'processing';
                const isExpanded = expandedCompanyIds.includes(company.id);
                const leadStatus = leadStatuses[company.id] || 'active';
                const statusConfig = LEAD_STATUS_CONFIG[leadStatus] || LEAD_STATUS_CONFIG.active;
                const fitScore = company.fitScore ?? (company.fitLevel === 'HIGH FIT' ? 90 : company.fitLevel === 'MEDIUM FIT' ? 70 : 40);
                const isHigh = fitScore >= 80 || company.fitLevel === 'HIGH FIT';
                const isMed = fitScore >= 50 || company.fitLevel === 'MEDIUM FIT';
                const fitLabel = isHigh ? 'High' : isMed ? 'Medium' : 'Low';
                const fitBadgeVariant = isHigh ? 'success' : isMed ? 'warning' : 'danger';
                const confidenceScore = company.confidenceScore ?? 80;

                return (
                  <React.Fragment key={company.id}>
                    <tr
                      id={`company-row-${company.id}`}
                      className={`hover:bg-[#F6F5F1] dark:hover:bg-slate-800/30 transition-colors duration-150 ${
                        leadStatus === 'junk_lead'
                          ? 'opacity-60 bg-rose-50/30 dark:bg-rose-950/20'
                          : isSelected
                          ? 'bg-[#E5EBE3]/40 dark:bg-slate-800/60'
                          : ''
                      }`}
                    >
                      <td className="px-3 py-3.5 text-center">
                        {/* Single checkbox: selects + adds to compare in one click */}
                        <button
                          onClick={() => toggleSelection(company.id)}
                          disabled={isProcessing}
                          className="focus-ring rounded p-0.5 cursor-pointer inline-flex items-center justify-center"
                          aria-label={`Select ${company.name}`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="h-4 w-4 accent-[#202A2E] rounded border-[#D8D5CE] cursor-pointer"
                          />
                        </button>
                      </td>

                      <td className="px-3 py-3.5 font-bold">
                        <span
                          onClick={() => setSelectedCompanyId(company.id)}
                          className="text-primary text-sm md:text-base hover:text-brand-primary hover:underline cursor-pointer"
                        >
                          {company.name}
                        </span>
                        <span className="text-xs text-secondary block mt-0.5 font-semibold">{company.industry}</span>
                      </td>

                      <td className="px-3 py-3.5 text-secondary font-semibold text-xs md:text-sm">{company.location}</td>

                      {/* Lead Status Interactive Dropdown */}
                      <td className="px-3 py-3.5">
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
                      </td>

                      {/* Fit Rate Badge with percentage and bracket level */}
                      <td className="px-3 py-3.5">
                        <Badge variant={fitBadgeVariant} className="text-[10px] px-2 py-0.5 font-bold">
                          {fitScore.toFixed(0)}% ({fitLabel})
                        </Badge>
                      </td>

                      <td className="px-3 py-3.5 font-bold text-slate-800 dark:text-slate-200 text-xs md:text-sm whitespace-nowrap">{company.revenueRange}</td>

                      <td className="px-3 py-3.5 text-secondary font-semibold text-xs md:text-sm">{company.employeeRange}</td>

                      <td className="px-3 py-3.5">
                        <span className="text-xs md:text-sm font-bold text-slate-700 dark:text-slate-300">{confidenceScore.toFixed(0)}%</span>
                      </td>

                      <td className="px-3 py-3.5 text-right pr-5">
                        <div className="inline-flex gap-1.5 justify-end items-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedCompanyId(company.id)}
                            className="px-2 min-h-0 py-1 text-xs whitespace-nowrap"
                          >
                            View Details
                          </Button>

                          {isEnriched ? (
                            /* After enrichment: show Deep Dive button */
                            <Button
                              variant={isExpanded ? 'secondary' : 'primary'}
                              size="sm"
                              onClick={() => {
                                setExpandedCompanyIds(prev =>
                                  isExpanded ? prev.filter(x => x !== company.id) : [...prev, company.id]
                                );
                              }}
                              className="px-2 min-h-0 py-1 text-xs font-bold whitespace-nowrap"
                              leftIcon={isExpanded ? <EyeOff className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
                            >
                              {isExpanded ? 'Close' : 'Deep Dive'}
                            </Button>
                          ) : isProcessing ? (
                            <Button
                              variant="secondary"
                              size="sm"
                              disabled
                              className="px-2 min-h-0 py-1 text-xs font-bold whitespace-nowrap"
                              leftIcon={<RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                            >
                              Enriching...
                            </Button>
                          ) : (
                            /* Not yet enriched: show Enrich button */
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => openEnrichPreview([company.id])}
                              className="px-2 min-h-0 py-1 text-xs font-bold whitespace-nowrap"
                              leftIcon={<Unlock className="h-3.5 w-3.5" />}
                            >
                              Enrich
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr id={`enrich-details-${company.id}`} className="bg-slate-50/45 dark:bg-slate-900/10">
                        <td colSpan={9} className="px-6 py-6 border-b border-default">
                          <div className="flex flex-col gap-6 text-left animate-fadeIn">
                            
                            <div className="flex items-center justify-between border-b border-default pb-3">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                  <Sparkles className="h-4 w-4 text-brand-primary" />
                                  {isEnriched ? 'Deep Intelligence & Verified Proofs' : 'Public Founder & Business Intelligence'}
                                </span>
                              </div>
                              {isEnriched ? (
                                <Badge variant="success">ENRICHED</Badge>
                              ) : isProcessing ? (
                                <Badge variant="warning">ENRICHING...</Badge>
                              ) : (
                                <Badge variant="neutral">STANDARD</Badge>
                              )}
                            </div>

                            {isEnriched ? (() => {
                              const enrichment = company.enrichmentData || MOCK_ENRICHMENT_DATA[company.id];
                              if (!enrichment) return null;

                              return (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                  {/* Card 1: Founder & Leadership */}
                                  <div className="flex flex-col gap-5">
                                    <div className="bg-card border border-default p-4 rounded-lg shadow-xs">
                                      <h5 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2 border-b border-default pb-1 flex items-center justify-between">
                                        <span>Founder & Leadership</span>
                                        <ProofTag proof="ASIC Director Filing #2024" label="Source" />
                                      </h5>
                                      <div className="space-y-2 text-sm">
                                        <div>
                                          <p className="font-bold text-primary text-base">{enrichment.founderName}</p>
                                          <p className="text-secondary font-semibold text-xs">{enrichment.founderRole}</p>
                                        </div>

                                        {/* Founder Age & Demographics */}
                                        <div className="p-2 rounded bg-slate-50 dark:bg-slate-900/40 border border-default/70 text-xs">
                                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                                            Founder Demographics & Age
                                          </span>
                                          <p className="font-bold text-primary mt-0.5">
                                            Age: ~{enrichment.age || 63} Years ({enrichment.gender || 'Male'})
                                          </p>
                                          <div className="mt-1">
                                            <ProofTag proof={enrichment.ageProof || 'ASIC Director Birth Extract & Inception Record'} />
                                          </div>
                                        </div>

                                        {enrichment.industryExperience && (
                                          <div className="text-xs text-secondary">
                                            <strong>Industry Tenure:</strong> {enrichment.industryExperience}
                                            <div className="mt-0.5">
                                              <ProofTag proof={enrichment.experienceProof || 'Industry Association Member Ledger'} />
                                            </div>
                                          </div>
                                        )}

                                        <div>
                                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                                            Career Biography
                                          </span>
                                          <p className="text-secondary mt-1 text-xs leading-relaxed italic">
                                            "{enrichment.bio}"
                                          </p>
                                          <div className="mt-1">
                                            <ProofTag proof="Corporate Gazette & Chamber of Commerce Bio" />
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Primary Contact */}
                                    <div className="bg-card border border-default p-4 rounded-lg shadow-xs">
                                      <h5 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2 border-b border-default pb-1 flex items-center justify-between">
                                        <span>Primary Contact</span>
                                        <ProofTag proof="ABR Entity Extract" label="Source" />
                                      </h5>
                                      <div className="space-y-1 text-sm">
                                        <p className="font-bold text-primary">{enrichment.contactPerson || enrichment.founderName}</p>
                                        <p className="text-secondary font-semibold text-xs">{enrichment.founderRole || 'Managing Director'}</p>
                                        {enrichment.ownershipStake && (
                                          <div className="mt-2 text-xs text-secondary">
                                            <strong>Ownership:</strong> {enrichment.ownershipStake}
                                            <div className="mt-0.5">
                                              <ProofTag proof={enrichment.ownershipProof || 'ASIC Shareholder Capital Register'} />
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Card 2: Management Team & Contact Details */}
                                  <div className="flex flex-col gap-5">
                                    <div className="bg-card border border-default p-4 rounded-lg shadow-xs">
                                      <h5 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2 border-b border-default pb-1 flex items-center justify-between">
                                        <span>Management Team</span>
                                        <ProofTag proof="ASIC Key Management Personnel" label="Source" />
                                      </h5>
                                      <ul className="space-y-1.5 text-sm text-secondary list-disc pl-4 font-semibold">
                                        {enrichment.managementTeam.split(',').map((member, idx) => (
                                          <li key={idx} className="text-xs leading-snug">
                                            {member.trim()}
                                          </li>
                                        ))}
                                      </ul>
                                      <div className="mt-2 border-t border-default/60 pt-1">
                                        <ProofTag proof="Verified Corporate Organization Chart & Registry Filing" />
                                      </div>
                                    </div>

                                    <div className="bg-card border border-default p-4 rounded-lg shadow-xs">
                                      <h5 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2 border-b border-default pb-1">
                                        Direct Contact Information
                                      </h5>
                                      <div className="space-y-2.5 text-sm">
                                        <div>
                                          <span className="text-[10px] font-bold text-slate-400 block uppercase">Verified Direct Email</span>
                                          <a href={`mailto:${enrichment.email}`} className="font-bold text-brand-primary hover:underline block truncate text-xs">
                                            {enrichment.email}
                                          </a>
                                          <div className="mt-0.5">
                                            <ProofTag proof={enrichment.emailProof || 'Corporate MX DNS & Packaging Association Routing'} />
                                          </div>
                                        </div>
                                        <div>
                                          <span className="text-[10px] font-bold text-slate-400 block uppercase">Verified Direct Phone / Mobile</span>
                                          <span className="font-bold text-primary block text-xs">
                                            {enrichment.phone}
                                          </span>
                                          <div className="mt-0.5">
                                            <ProofTag proof={enrichment.phoneProof || 'Chamber of Commerce Direct Telco Registry'} />
                                          </div>
                                        </div>
                                        <div>
                                          <span className="text-[10px] font-bold text-slate-400 block uppercase">LinkedIn Executive Profile</span>
                                          <a href={enrichment.linkedin} target="_blank" rel="noopener noreferrer" className="font-bold text-brand-primary hover:underline block text-xs">
                                            View LinkedIn Profile
                                          </a>
                                          <div className="mt-0.5">
                                            <ProofTag proof="Verified Executive LinkedIn Network Record" />
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Card 3: Company & Succession / Mandate Notes */}
                                  <div className="flex flex-col gap-5">
                                    <div className="bg-card border border-default p-4 rounded-lg shadow-xs">
                                      <h5 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2 border-b border-default pb-1 flex items-center justify-between">
                                        <span>Company Information</span>
                                        <ProofTag proof="ABN & WHOIS" label="Source" />
                                      </h5>
                                      <div className="space-y-2 text-sm">
                                        <div>
                                          <span className="text-[10px] font-bold text-slate-400 block uppercase">Website</span>
                                          <a href={company.website} target="_blank" rel="noopener noreferrer" className="font-bold text-brand-primary hover:underline block truncate text-xs">
                                            {company.website.replace('https://www.', '')}
                                          </a>
                                          <div className="mt-0.5">
                                            <ProofTag proof="auDA Domain Registration & SSL Certificate" />
                                          </div>
                                        </div>
                                        <div>
                                          <span className="text-[10px] font-bold text-slate-400 block uppercase">Background</span>
                                          <p className="text-secondary text-xs leading-relaxed font-semibold">
                                            {company.description}
                                          </p>
                                          <div className="mt-0.5">
                                            <ProofTag proof="ABN Lookup, ASIC Gazette & Web Archive" />
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="bg-card border border-default p-4 rounded-lg shadow-xs">
                                      <h5 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2 border-b border-default pb-1 flex items-center justify-between">
                                        <span>Succession & Acquisition Notes</span>
                                        <ProofTag proof="M&A Advisory" label="Source" />
                                      </h5>
                                      <div className="space-y-2.5 text-sm">
                                        {/* Mandate Match if criteria requested */}
                                        {enrichment.additionalRequirementMatch && (
                                          <div className="p-2.5 rounded bg-[#E3ECE6]/70 dark:bg-[#173529]/40 border border-[#B7CCBC] dark:border-[#39634D] text-xs">
                                            <span className="text-[10px] font-bold text-[#35624A] dark:text-[#8FBEA1] uppercase tracking-wider block">
                                              🎯 Mandate Requirement Match
                                            </span>
                                            <p className="font-bold text-primary mt-0.5">
                                              {enrichment.additionalRequirementMatch.requirement}: <span className="font-semibold">{enrichment.additionalRequirementMatch.extractedValue}</span>
                                            </p>
                                            <div className="mt-1">
                                              <ProofTag proof={enrichment.additionalRequirementMatch.proofSource} />
                                            </div>
                                          </div>
                                        )}

                                        <div>
                                          <span className="text-[10px] font-bold text-slate-400 block uppercase">Succession Risk</span>
                                          <p className="text-secondary text-xs font-semibold">
                                            {company.acquisitionFit.successionRisk}
                                          </p>
                                          <div className="mt-0.5">
                                            <ProofTag proof="M&A Market Advisory Filing & Director Age Analysis" />
                                          </div>
                                        </div>
                                        <div>
                                          <span className="text-[10px] font-bold text-slate-400 block uppercase">Enriched Succession Notes</span>
                                          <p className="text-secondary text-xs leading-relaxed font-semibold">
                                            {enrichment.successionNote}
                                          </p>
                                          <div className="mt-0.5">
                                            <ProofTag proof="Regional Manufacturing Transition Advisory & Broker Memo" />
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })() : isProcessing ? (
                              <div className="p-8 text-center flex flex-col items-center justify-center gap-3">
                                <RefreshCw className="h-8 w-8 text-brand-primary animate-spin" />
                                <p className="text-sm font-bold text-primary">Enriching company data...</p>
                                <p className="text-xs text-secondary">Querying registers, maps and validation sources...</p>
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="flex flex-col gap-5">
                                  <div className="bg-card border border-default p-4 rounded-lg opacity-70">
                                    <h5 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2 border-b border-default pb-1">
                                      Founder
                                    </h5>
                                    <div className="space-y-1 text-sm text-slate-400">
                                      <p className="font-semibold flex items-center gap-1.5"><Lock className="h-3.5 w-3.5" /> Founder Name</p>
                                      <p className="font-semibold flex items-center gap-1.5"><Lock className="h-3.5 w-3.5" /> Founder Role</p>
                                      <p className="text-xs italic">Unlock with enrichment</p>
                                    </div>
                                  </div>
                                  <div className="bg-card border border-default p-4 rounded-lg opacity-70">
                                    <h5 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2 border-b border-default pb-1">
                                      Primary Contact
                                    </h5>
                                    <div className="space-y-1 text-sm text-slate-400">
                                      <p className="font-semibold flex items-center gap-1.5"><Lock className="h-3.5 w-3.5" /> Primary Contact Name</p>
                                      <p className="text-xs italic">Unlock with enrichment</p>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex flex-col gap-5">
                                  <div className="bg-card border border-default p-4 rounded-lg opacity-70">
                                    <h5 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2 border-b border-default pb-1">
                                      Management Team
                                    </h5>
                                    <div className="space-y-1 text-sm text-slate-400">
                                      <p className="font-semibold flex items-center gap-1.5"><Lock className="h-3.5 w-3.5" /> Management Members</p>
                                      <p className="text-xs italic">Unlock with enrichment</p>
                                    </div>
                                  </div>
                                  <div className="bg-card border border-default p-4 rounded-lg opacity-70">
                                    <h5 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2 border-b border-default pb-1">
                                      Contact Information
                                    </h5>
                                    <div className="space-y-2 text-sm text-slate-400">
                                      <div className="flex items-center gap-1.5"><Lock className="h-3.5 w-3.5" /><span className="font-semibold">Email</span></div>
                                      <div className="flex items-center gap-1.5"><Lock className="h-3.5 w-3.5" /><span className="font-semibold">Phone</span></div>
                                      <div className="flex items-center gap-1.5"><Lock className="h-3.5 w-3.5" /><span className="font-semibold">LinkedIn</span></div>
                                      <p className="text-xs italic">Unlock with enrichment</p>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex flex-col gap-5">
                                  <div className="bg-card border border-default p-4 rounded-lg">
                                    <h5 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2 border-b border-default pb-1">
                                      Company Information
                                    </h5>
                                    <div className="space-y-2 text-sm">
                                      <div>
                                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Website</span>
                                        <a href={company.website} target="_blank" rel="noopener noreferrer" className="font-bold text-brand-primary hover:underline block truncate">
                                          {company.website.replace('https://www.', '')}
                                        </a>
                                      </div>
                                      <div>
                                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Background</span>
                                        <p className="text-secondary text-xs leading-relaxed font-semibold">
                                          {company.description}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="bg-card border border-default p-4 rounded-lg">
                                    <h5 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2 border-b border-default pb-1">
                                      Succession / Acquisition Notes
                                    </h5>
                                    <div className="space-y-2 text-sm">
                                      <div>
                                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Succession Risk</span>
                                        <p className="text-secondary text-xs font-semibold">
                                          {company.acquisitionFit.successionRisk}
                                        </p>
                                      </div>
                                      <div>
                                        <span className="text-[10px] font-bold text-slate-450 block uppercase">Enriched Notes</span>
                                        <div className="space-y-1 text-slate-400 mt-1">
                                          <p className="font-semibold flex items-center gap-1.5"><Lock className="h-3.5 w-3.5" /> Succession Details</p>
                                          <p className="text-xs italic">Unlock with enrichment</p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Compare action bar — appears when 2+ companies are checked */}
        {selectedIds.length >= 2 && (
          <div className="p-4 border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg flex items-center justify-between gap-4 animate-fadeIn">
            <span className="text-base text-indigo-800 dark:text-indigo-300 font-bold flex items-center gap-2">
              <Layers className="h-5 w-5" />
              {selectedIds.length} companies selected for comparison
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => clearSelection()}>Clear</Button>
              <Button variant="success" size="sm" onClick={() => setCompareModalOpen(true)} leftIcon={<Layers className="h-4 w-4" />}>
                Compare ({selectedIds.length})
              </Button>
            </div>
          </div>
        )}

      </div>

      <CompanyDetails
        company={activeCompany}
        isOpen={selectedCompanyId !== null}
        onClose={() => setSelectedCompanyId(null)}
        onPrevious={onPrevious}
        onNext={onNext}
        onEnrich={(id) => {
          if (!enrichedIds.includes(id)) {
            openEnrichPreview([id]);
            setSelectedCompanyId(null);
          }
        }}
      />

      {/* Compare Modal */}
      <Modal
        isOpen={compareModalOpen}
        onClose={() => setCompareModalOpen(false)}
        title="Acquisition Candidates Comparison Matrix"
        size="xl"
        footerActions={
          <Button variant="outline" onClick={() => setCompareModalOpen(false)}>Close Comparison</Button>
        }
      >
        <CompanyComparison companies={comparisonTargets} />
      </Modal>

      {/* Enrichment Preview Modal */}
      <EnrichmentPreviewModal
        isOpen={enrichPreviewOpen}
        companies={displayCompanies.filter(c => enrichPreviewIds.includes(c.id))}
        isEnriching={isEnriching}
        onClose={() => { if (!isEnriching) setEnrichPreviewOpen(false); }}
        onConfirm={async (ids) => {
          await handleEnrichSelected(ids);
          setEnrichPreviewOpen(false);
        }}
      />
      {/* ── Sticky Page Footer Navigation — Export PDF + Continue to Outreach ── */}
      <div className="sticky bottom-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-default py-4.5 px-6 -mx-6 -mb-6 flex items-center justify-between z-25 shadow-[0_-8px_30px_rgba(0,0,0,0.04)] mt-6 rounded-b flex-wrap gap-3">
        <Button
          variant="outline"
          onClick={handleBack}
          leftIcon={<ArrowLeft className="h-5 w-5" />}
          className="min-w-[120px]"
        >
          Back
        </Button>

        <div className="flex items-center gap-3 flex-wrap">
          <Button
            variant="outline"
            onClick={handleExport}
            leftIcon={<FileDown className="h-5 w-5" />}
            id="export-pdf-btn"
          >
            Export PDF Dossier
          </Button>

          <div className="flex flex-col items-end gap-1">
            <Button
              variant="primary"
              onClick={() => navigate('/outreach')}
              disabled={selectedIds.length === 0}
              leftIcon={<Send className="h-4 w-4" />}
              rightIcon={<ArrowRight className="h-4 w-4" />}
              id="continue-to-outreach-btn"
            >
              Continue to Outreach
            </Button>
            {selectedIds.length === 0 && (
              <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                Select at least one company first
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default ReviewResults;
