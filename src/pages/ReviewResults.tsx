import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import { useCompanies } from '../hooks/useCompanies';
import CompanyDetails from '../components/companies/CompanyDetails';
import CompanyComparison from '../components/companies/CompanyComparison';
import EnrichmentPaymentModal from '../components/companies/EnrichmentPaymentModal';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import LoadingState from '../components/ui/LoadingState';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import {
  ArrowLeft, CheckCircle2, FileDown, Layers, Lock, Unlock,
  FolderCheck, AlertCircle, Sparkles, Users,
  Eye, EyeOff, RefreshCw
} from 'lucide-react';

export const ReviewResults: React.FC = () => {
  const navigate = useNavigate();
  const {
    companies,
    allCompaniesRaw,
    enrichedIds,
    selectedIds,
    loading,
    error,
    successMessage,
    toggleSelection,
    enrichCompanies,
  } = useCompanies();

  // Comparison state (select up to 4 for side-by-side view)
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [compareModalOpen, setCompareModalOpen] = useState(false);

  // Detail modal state
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);

  // Expanded inline detail sections state
  const [expandedCompanyIds, setExpandedCompanyIds] = useState<string[]>([]);

  // Enrichment payment modal state
  const [enrichModalOpen, setEnrichModalOpen] = useState(false);

  // Export feedback
  const [exportMessage, setExportMessage] = useState<string | null>(null);

  const displayCompanies = allCompaniesRaw.length > 0 ? allCompaniesRaw : companies;
  const activeCompany = displayCompanies.find(c => c.id === selectedCompanyId) || null;

  // Companies selected for enrichment payment
  const selectedCompanies = displayCompanies.filter(c => selectedIds.includes(c.id));
  // Not-yet-enriched selected companies
  const unenrichedSelected = selectedCompanies.filter(c => !enrichedIds.includes(c.id));

  const comparisonTargets = useMemo(() => {
    return displayCompanies.filter(c => selectedForCompare.includes(c.id));
  }, [displayCompanies, selectedForCompare]);

  const metrics = useMemo(() => {
    const total = displayCompanies.length;
    const highFit = displayCompanies.filter(c => c.fitLevel === 'HIGH FIT').length;
    const enriched = enrichedIds.length;
    const selected = selectedIds.length;
    return { total, highFit, enriched, selected };
  }, [displayCompanies, enrichedIds, selectedIds]);

  const handleToggleCompare = (id: string) => {
    setSelectedForCompare(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 4) return prev;
      return [...prev, id];
    });
  };

  const handleEnrichConfirm = async (ids: string[]) => {
    await enrichCompanies(ids);
    setEnrichModalOpen(false);
    
    // Automatically expand the newly enriched company sections
    setExpandedCompanyIds(prev => {
      const next = [...prev];
      ids.forEach(id => {
        if (!next.includes(id)) {
          next.push(id);
        }
      });
      return next;
    });

    // Smooth scroll to the first newly enriched company after rendering completes
    setTimeout(() => {
      if (ids.length > 0) {
        const element = document.getElementById(`company-row-${ids[0]}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
    }, 200);
  };

  const handleBack = () => navigate('/discover');

  const handleExport = () => {
    setExportMessage('Generating PDF Dossiers...');
    setTimeout(() => {
      try {
        const doc = new jsPDF();
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(22);
        doc.setTextColor(37, 99, 235);
        doc.text('DEAL SOURCING PLATFORM', 20, 20);
        doc.setFontSize(14);
        doc.setTextColor(71, 85, 105);
        doc.text('Acquisition Candidates Dossier', 20, 28);
        doc.setLineWidth(0.5);
        doc.setDrawColor(229, 231, 235);
        doc.line(20, 32, 190, 32);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(71, 85, 105);
        doc.text(`Export Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 20, 40);
        doc.text(`Total Companies: ${displayCompanies.length}`, 20, 46);
        let y = 58;
        displayCompanies.forEach((company, index) => {
          if (y > 230) { doc.addPage(); y = 20; }
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(13);
          doc.setTextColor(23, 32, 51);
          doc.text(`${index + 1}. ${company.name}`, 20, y);
          y += 6;
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          doc.setTextColor(71, 85, 105);
          const desc = doc.splitTextToSize(company.whyItMatches, 170);
          doc.text(desc, 20, y);
          y += desc.length * 4.5 + 10;
        });
        doc.save('dealsourcing_candidates_dossier.pdf');
        setExportMessage('PDF exported successfully.');
      } catch {
        setExportMessage('Failed to export. Please try again.');
      }
      setTimeout(() => setExportMessage(null), 3500);
    }, 1500);
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
      {/* Title */}
      <div className="text-left flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-primary tracking-tight">Review Acquisition Candidates</h2>
          <p className="text-lg text-secondary mt-2">
            Select companies below and unlock enriched contact data — founder info, email, phone, and LinkedIn.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleExport}
          leftIcon={<FileDown className="h-5 w-5" />}
          className="self-start md:self-auto"
          id="export-pdf-btn"
        >
          Export PDF Dossier
        </Button>
      </div>

      {/* Toasts */}
      {successMessage && (
        <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800 rounded-md p-4 flex items-center gap-2.5 text-left animate-fadeIn">
          <CheckCircle2 className="h-5 w-5" />
          <span className="font-semibold text-base">{successMessage}</span>
        </div>
      )}
      {exportMessage && (
        <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-md p-4 flex items-center gap-2.5 text-left animate-fadeIn">
          <FileDown className="h-5 w-5" />
          <span className="font-semibold text-base">{exportMessage}</span>
        </div>
      )}

      {/* 1. Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-left">
        <Card className="flex items-center gap-4 p-5">
          <div className="p-3 bg-brand-primary-light rounded-full text-brand-primary-dark shrink-0">
            <FolderCheck className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-secondary uppercase tracking-wider block">Total Companies</span>
            <span className="text-2xl font-black text-primary block mt-0.5">{metrics.total}</span>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-5">
          <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full text-green-700 dark:text-green-400 shrink-0">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-secondary uppercase tracking-wider block">High Fit</span>
            <span className="text-2xl font-black text-primary block mt-0.5">{metrics.highFit}</span>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-5">
          <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-full text-amber-700 dark:text-amber-400 shrink-0">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-secondary uppercase tracking-wider block">Selected</span>
            <span className="text-2xl font-black text-primary block mt-0.5">{metrics.selected}</span>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-5">
          <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full text-purple-700 dark:text-purple-400 shrink-0">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-secondary uppercase tracking-wider block">Enriched</span>
            <span className="text-2xl font-black text-primary block mt-0.5">{metrics.enriched}</span>
          </div>
        </Card>
      </div>

      {/* 2. Enrichment benefits info bar */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 shrink-0">
          <Lock className="h-5 w-5" />
          <span className="font-bold text-sm">Enrich to unlock:</span>
        </div>
        <div className="flex flex-wrap gap-3 text-sm text-amber-700 dark:text-amber-300 font-semibold">
          {['Founder Name & Role', 'Management Team', 'Direct Email', 'Phone Number', 'LinkedIn Profile'].map(b => (
            <span key={b} className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400 shrink-0" />
              {b}
            </span>
          ))}
        </div>
        <span className="text-xs text-amber-600 dark:text-amber-400 sm:ml-auto">₹500 per company</span>
      </div>

      {/* 3. Selection count */}
      <div className="flex items-center">
        <span className="text-sm text-secondary font-semibold ml-auto">
          {selectedIds.length} selected &bull; {enrichedIds.length} enriched
        </span>
      </div>

      {/* 4. Main table */}
      <div className="w-full flex flex-col gap-4 text-left">
        <div className="w-full overflow-x-auto rounded-lg border border-default shadow-sm bg-card">
          <table className="w-full border-collapse text-left text-sm md:text-base">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900 border-b border-default text-primary font-bold text-xs md:text-sm uppercase tracking-wider">
                <th className="px-2.5 py-3 w-10 text-center">Select</th>
                <th className="px-2.5 py-3 w-10 text-center">Compare</th>
                <th className="px-3 py-3">Company</th>
                <th className="px-3 py-3">Location</th>
                <th className="px-3 py-3">Fit Score</th>
                <th className="px-3 py-3">Revenue</th>
                <th className="px-3 py-3">Employees</th>
                <th className="px-3 py-3">Enrichment</th>
                <th className="px-3 py-3 text-right pr-5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-default text-primary">
              {displayCompanies.map(company => {
                const isSelected = selectedIds.includes(company.id);
                const isCompareSelected = selectedForCompare.includes(company.id);
                const isEnriched = company.enrichmentStatus === 'enriched' || enrichedIds.includes(company.id);
                const isProcessing = company.enrichmentStatus === 'processing';
                const isExpanded = expandedCompanyIds.includes(company.id);

                return (
                  <React.Fragment key={company.id}>
                    {/* Main Company Row */}
                    <tr
                      id={`company-row-${company.id}`}
                      className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors duration-150 ${isSelected ? 'bg-blue-50/30 dark:bg-blue-950/10' : ''}`}
                    >
                      {/* Select for enrichment */}
                      <td className="px-2.5 py-3.5 text-center">
                        {isEnriched ? (
                          <Unlock className="h-4.5 w-4.5 text-green-500 mx-auto" />
                        ) : (
                          <button
                            onClick={() => toggleSelection(company.id)}
                            disabled={isProcessing}
                            className="focus-ring rounded p-0.5 cursor-pointer inline-flex items-center justify-center"
                            aria-label={`Select ${company.name} for enrichment`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="h-4.5 w-4.5 text-brand-primary rounded border-default focus-ring cursor-pointer"
                            />
                          </button>
                        )}
                      </td>

                      {/* Compare checkbox */}
                      <td className="px-2.5 py-3.5 text-center">
                        <button
                          onClick={() => handleToggleCompare(company.id)}
                          className="focus-ring rounded p-0.5 cursor-pointer inline-flex items-center justify-center"
                          aria-label={`Select ${company.name} for comparison`}
                        >
                          <input
                            type="checkbox"
                            checked={isCompareSelected}
                            onChange={() => {}}
                            className="h-4.5 w-4.5 text-indigo-600 rounded border-default focus-ring cursor-pointer"
                          />
                        </button>
                      </td>

                      {/* Company */}
                      <td className="px-3 py-3.5 font-bold">
                        <span className="text-primary text-sm md:text-base">{company.name}</span>
                        <span className="text-xs text-secondary block mt-0.5 font-semibold">{company.industry}</span>
                      </td>

                      {/* Location */}
                      <td className="px-3 py-3.5 text-secondary font-semibold text-xs md:text-sm">{company.location}</td>

                      {/* Fit */}
                      <td className="px-3 py-3.5">
                        <div className="flex items-center gap-1">
                          {company.fitLevel === 'HIGH FIT' && <Badge variant="success" className="text-[10px] px-1 py-0.5">HIGH</Badge>}
                          {company.fitLevel === 'MEDIUM FIT' && <Badge variant="warning" className="text-[10px] px-1 py-0.5">MEDIUM</Badge>}
                          {company.fitLevel === 'LOW FIT' && <Badge variant="danger" className="text-[10px] px-1 py-0.5">LOW</Badge>}
                          <span className="text-xs md:text-sm font-bold text-brand-primary">{company.confidenceScore}%</span>
                        </div>
                      </td>

                      {/* Revenue */}
                      <td className="px-3 py-3.5 font-bold text-slate-800 dark:text-slate-200 text-xs md:text-sm whitespace-nowrap">{company.revenueRange}</td>

                      {/* Employees */}
                      <td className="px-3 py-3.5 text-secondary font-semibold text-xs md:text-sm">{company.employeeRange}</td>

                      {/* Enrichment Status */}
                      <td className="px-3 py-3.5">
                        {isEnriched ? (
                          <Badge variant="success" className="text-[10px] px-1.5 py-0.5">ENRICHED</Badge>
                        ) : isProcessing ? (
                          <Badge variant="warning" className="text-[10px] px-1.5 py-0.5">ENRICHING...</Badge>
                        ) : (
                          <Badge variant="neutral" className="text-[10px] px-1.5 py-0.5">LOCKED</Badge>
                        )}
                      </td>

                      {/* Actions */}
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
                          <Button
                            variant={isExpanded ? 'secondary' : 'primary'}
                            size="sm"
                            onClick={() => {
                              setExpandedCompanyIds(prev =>
                                isExpanded ? prev.filter(x => x !== company.id) : [...prev, company.id]
                              );
                            }}
                            className="px-2 min-h-0 py-1 text-xs font-bold whitespace-nowrap"
                            leftIcon={isExpanded ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          >
                            {isExpanded ? 'Hide Enrichment' : 'View Enrichment'}
                          </Button>
                        </div>
                      </td>
                    </tr>

                    {/* Inline Enriched Company Intelligence section */}
                    {isExpanded && (
                      <tr id={`enrich-details-${company.id}`} className="bg-slate-50/45 dark:bg-slate-900/10">
                        <td colSpan={9} className="px-6 py-6 border-b border-default">
                          <div className="flex flex-col gap-6 text-left animate-fadeIn">
                            
                            {/* Section Header */}
                            <div className="flex items-center justify-between border-b border-default pb-3">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                  {!isEnriched && <Lock className="h-4 w-4 text-[#8A6A3D]" />}
                                  {isEnriched ? 'Enriched Company Intelligence' : 'Company Intelligence (Locked)'}
                                </span>
                              </div>
                              {isEnriched ? (
                                <Badge variant="success">ENRICHED</Badge>
                              ) : isProcessing ? (
                                <Badge variant="warning">ENRICHING...</Badge>
                              ) : (
                                <Badge variant="neutral">LOCKED</Badge>
                              )}
                            </div>

                            {/* Info Layout */}
                            {isEnriched && company.enrichmentData ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Column 1: FOUNDER & PRIMARY CONTACT */}
                                <div className="flex flex-col gap-5">
                                  {/* FOUNDER */}
                                  <div className="bg-card border border-default p-4 rounded-lg">
                                    <h5 className="text-xs font-bold text-slate-450 uppercase tracking-wider mb-2 border-b border-default pb-1">
                                      Founder
                                    </h5>
                                    <div className="space-y-1 text-sm">
                                      <p className="font-bold text-primary">{company.enrichmentData.founderName}</p>
                                      <p className="text-secondary font-semibold text-xs">{company.enrichmentData.founderRole}</p>
                                      <p className="text-secondary mt-2 text-xs leading-relaxed italic">
                                        "{company.enrichmentData.bio}"
                                      </p>
                                    </div>
                                  </div>

                                  {/* PRIMARY CONTACT */}
                                  <div className="bg-card border border-default p-4 rounded-lg">
                                    <h5 className="text-xs font-bold text-slate-450 uppercase tracking-wider mb-2 border-b border-default pb-1">
                                      Primary Contact
                                    </h5>
                                    <div className="space-y-1 text-sm">
                                      <p className="font-bold text-primary">{company.enrichmentData.contactPerson}</p>
                                      <p className="text-secondary font-semibold text-xs">{company.enrichmentData.founderRole || 'Representative'}</p>
                                    </div>
                                  </div>
                                </div>

                                {/* Column 2: MANAGEMENT TEAM & CONTACT INFORMATION */}
                                <div className="flex flex-col gap-5">
                                  {/* MANAGEMENT TEAM */}
                                  <div className="bg-card border border-default p-4 rounded-lg">
                                    <h5 className="text-xs font-bold text-slate-450 uppercase tracking-wider mb-2 border-b border-default pb-1">
                                      Management Team
                                    </h5>
                                    <ul className="space-y-1.5 text-sm text-secondary list-disc pl-4 font-semibold">
                                      {company.enrichmentData.managementTeam.split(',').map((member, idx) => (
                                        <li key={idx}>{member.trim()}</li>
                                      ))}
                                    </ul>
                                  </div>

                                  {/* CONTACT INFORMATION */}
                                  <div className="bg-card border border-default p-4 rounded-lg">
                                    <h5 className="text-xs font-bold text-slate-450 uppercase tracking-wider mb-2 border-b border-default pb-1">
                                      Contact Information
                                    </h5>
                                    <div className="space-y-2 text-sm">
                                      <div>
                                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Email</span>
                                        <a href={`mailto:${company.enrichmentData.email}`} className="font-bold text-brand-primary hover:underline block truncate">
                                          {company.enrichmentData.email}
                                        </a>
                                      </div>
                                      <div>
                                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Phone</span>
                                        <span className="font-bold text-primary block">
                                          {company.enrichmentData.phone}
                                        </span>
                                      </div>
                                      <div>
                                        <span className="text-[10px] font-bold text-slate-400 block uppercase">LinkedIn</span>
                                        <a href={company.enrichmentData.linkedin} target="_blank" rel="noopener noreferrer" className="font-bold text-brand-primary hover:underline block text-xs">
                                          View LinkedIn Profile
                                        </a>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Column 3: COMPANY INFORMATION & SUCCESSION / ACQUISITION NOTES */}
                                <div className="flex flex-col gap-5">
                                  {/* COMPANY INFORMATION */}
                                  <div className="bg-card border border-default p-4 rounded-lg">
                                    <h5 className="text-xs font-bold text-slate-450 uppercase tracking-wider mb-2 border-b border-default pb-1">
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

                                  {/* SUCCESSION / ACQUISITION NOTES */}
                                  <div className="bg-card border border-default p-4 rounded-lg">
                                    <h5 className="text-xs font-bold text-slate-450 uppercase tracking-wider mb-2 border-b border-default pb-1">
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
                                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Enriched Notes</span>
                                        <p className="text-secondary text-xs leading-relaxed font-semibold">
                                          {company.enrichmentData.successionNote}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ) : isProcessing ? (
                              <div className="p-8 text-center flex flex-col items-center justify-center gap-3">
                                <RefreshCw className="h-8 w-8 text-brand-primary animate-spin" />
                                <p className="text-sm font-bold text-primary">Enriching company data...</p>
                                <p className="text-xs text-secondary">Querying registers, maps and validation sources...</p>
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Column 1: FOUNDER & PRIMARY CONTACT */}
                                <div className="flex flex-col gap-5">
                                  {/* FOUNDER */}
                                  <div className="bg-card border border-default p-4 rounded-lg opacity-70">
                                    <h5 className="text-xs font-bold text-slate-455 uppercase tracking-wider mb-2 border-b border-default pb-1">
                                      Founder
                                    </h5>
                                    <div className="space-y-1 text-sm text-slate-400">
                                      <p className="font-semibold flex items-center gap-1.5"><Lock className="h-3.5 w-3.5" /> Founder Name</p>
                                      <p className="font-semibold flex items-center gap-1.5"><Lock className="h-3.5 w-3.5" /> Founder Role</p>
                                      <p className="text-xs italic">Unlock with enrichment</p>
                                    </div>
                                  </div>

                                  {/* PRIMARY CONTACT */}
                                  <div className="bg-card border border-default p-4 rounded-lg opacity-70">
                                    <h5 className="text-xs font-bold text-slate-455 uppercase tracking-wider mb-2 border-b border-default pb-1">
                                      Primary Contact
                                    </h5>
                                    <div className="space-y-1 text-sm text-slate-400">
                                      <p className="font-semibold flex items-center gap-1.5"><Lock className="h-3.5 w-3.5" /> Primary Contact Name</p>
                                      <p className="text-xs italic">Unlock with enrichment</p>
                                    </div>
                                  </div>
                                </div>

                                {/* Column 2: MANAGEMENT TEAM & CONTACT INFORMATION */}
                                <div className="flex flex-col gap-5">
                                  {/* MANAGEMENT TEAM */}
                                  <div className="bg-card border border-default p-4 rounded-lg opacity-70">
                                    <h5 className="text-xs font-bold text-slate-455 uppercase tracking-wider mb-2 border-b border-default pb-1">
                                      Management Team
                                    </h5>
                                    <div className="space-y-1 text-sm text-slate-400">
                                      <p className="font-semibold flex items-center gap-1.5"><Lock className="h-3.5 w-3.5" /> Management Members</p>
                                      <p className="text-xs italic">Unlock with enrichment</p>
                                    </div>
                                  </div>

                                  {/* CONTACT INFORMATION */}
                                  <div className="bg-card border border-default p-4 rounded-lg opacity-70">
                                    <h5 className="text-xs font-bold text-slate-455 uppercase tracking-wider mb-2 border-b border-default pb-1">
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

                                {/* Column 3: COMPANY INFORMATION & NOTES */}
                                <div className="flex flex-col gap-5">
                                  {/* COMPANY INFORMATION */}
                                  <div className="bg-card border border-default p-4 rounded-lg">
                                    <h5 className="text-xs font-bold text-slate-455 uppercase tracking-wider mb-2 border-b border-default pb-1">
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

                                  {/* SUCCESSION / ACQUISITION NOTES */}
                                  <div className="bg-card border border-default p-4 rounded-lg">
                                    <h5 className="text-xs font-bold text-slate-455 uppercase tracking-wider mb-2 border-b border-default pb-1">
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

        {/* Compare action bar */}
        {selectedForCompare.length >= 2 && (
          <div className="p-4 border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg flex items-center justify-between gap-4 animate-fadeIn">
            <span className="text-base text-indigo-800 dark:text-indigo-300 font-bold flex items-center gap-2">
              <Layers className="h-5 w-5" />
              {selectedForCompare.length} companies selected for comparison
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedForCompare([])}>Clear</Button>
              <Button variant="success" size="sm" onClick={() => setCompareModalOpen(true)} leftIcon={<Layers className="h-4 w-4" />}>
                Compare ({selectedForCompare.length})
              </Button>
            </div>
          </div>
        )}

        {/* Enrichment CTA bar */}
        <div className={`p-5 rounded-lg border flex flex-col sm:flex-row items-center justify-between gap-4 ${unenrichedSelected.length > 0 ? 'bg-brand-primary-light border-brand-primary' : 'bg-slate-50 dark:bg-slate-900/30 border-default'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-full ${unenrichedSelected.length > 0 ? 'bg-brand-primary text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
              <Users className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className={`text-base font-bold ${unenrichedSelected.length > 0 ? 'text-brand-primary-dark dark:text-brand-primary' : 'text-secondary'}`}>
                {unenrichedSelected.length > 0
                  ? `${unenrichedSelected.length} ${unenrichedSelected.length === 1 ? 'company' : 'companies'} ready for enrichment`
                  : 'Select companies above to enrich them'}
              </p>
              <p className="text-xs text-secondary mt-0.5">
                {unenrichedSelected.length > 0
                  ? `Total cost: ₹${(unenrichedSelected.length * 500).toLocaleString('en-IN')}`
                  : 'Tick the checkbox column to add companies to enrichment queue'}
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            disabled={unenrichedSelected.length === 0}
            onClick={() => setEnrichModalOpen(true)}
            leftIcon={<Lock className="h-5 w-5" />}
            className="shrink-0 min-w-[220px]"
            id="enrich-selected-btn"
          >
            Enrich {unenrichedSelected.length > 0 ? `${unenrichedSelected.length} Selected` : 'Selected Companies'}
          </Button>
        </div>
      </div>

      {/* Company Detail Modal */}
      <CompanyDetails
        company={activeCompany}
        isOpen={selectedCompanyId !== null}
        onClose={() => setSelectedCompanyId(null)}
        onEnrich={(id) => {
          // Single-company enrichment from detail modal
          if (!enrichedIds.includes(id)) {
            toggleSelection(id);
            setSelectedCompanyId(null);
            setEnrichModalOpen(true);
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

      {/* Enrichment Payment Modal */}
      <EnrichmentPaymentModal
        isOpen={enrichModalOpen}
        companies={unenrichedSelected}
        onClose={() => setEnrichModalOpen(false)}
        onConfirm={handleEnrichConfirm}
      />

      {/* Page Footer Navigation */}
      <div className="border-t border-default pt-6 flex items-center justify-between mt-4">
        <Button
          variant="outline"
          onClick={handleBack}
          leftIcon={<ArrowLeft className="h-5 w-5" />}
          className="min-w-[120px]"
        >
          Back
        </Button>
      </div>
    </div>
  );
};
export default ReviewResults;
