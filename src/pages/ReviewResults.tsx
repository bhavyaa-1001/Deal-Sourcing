import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import { useCompanies } from '../hooks/useCompanies';
import CompanyDetails from '../components/companies/CompanyDetails';
import CompanyComparison from '../components/companies/CompanyComparison';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import LoadingState from '../components/ui/LoadingState';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import { ArrowLeft, CheckCircle2, FileDown, Layers, Sparkles, FolderCheck, AlertCircle, Ban, Mail, Phone, ExternalLink, Copy, RefreshCw, UserCheck, AlertTriangle } from 'lucide-react';

interface FounderEnrichment {
  founderName: string;
  role: string;
  email: string;
  phone: string;
  successionNote: string;
  linkedin: string;
  bio: string;
}

const mockEnrichments: Record<string, FounderEnrichment> = {
  'comp-101': {
    founderName: 'Robert "Bob" Miller',
    role: 'Founder & Managing Director (Age 63)',
    email: 'bob.miller@acmeplastics.com.au',
    phone: '+61 3 9876 5432',
    successionNote: 'Bob is looking to retire in the next 12 months. None of his children want to take over the family manufacturing business.',
    linkedin: 'https://linkedin.com/in/robert-miller-acme',
    bio: 'Started Acme Plastics in 1988 with a single injection moulding machine. Built it to a leading Dandenong packaging supplier.'
  },
  'comp-102': {
    founderName: 'Douglas Vance',
    role: 'Co-Founder & Chief Operations Officer (Age 59)',
    email: 'd.vance@qldpoly.com.au',
    phone: '+61 7 3456 7890',
    successionNote: 'Vance and his partner have alignment issues on expanding blowmoulding assets; seeking clean buyout or recapitalization.',
    linkedin: 'https://linkedin.com/in/doug-vance-poly',
    bio: 'Formed QLD Poly in 2004. Oversees all factory automation and machinery operations in Brisbane.'
  },
  'comp-103': {
    founderName: 'Arthur Southern',
    role: 'Managing Director & Principal Partner (Age 61)',
    email: 'arthur.s@sxc-extrusions.com.au',
    phone: '+61 2 9234 5678',
    successionNote: 'Three equal partners. Two ready to retire. Arthur is willing to stay on as Operations Director for a 2-year transition period.',
    linkedin: 'https://linkedin.com/in/arthur-southern-sxc',
    bio: 'An extrusion tooling engineer with 35 years of industrial experience. Co-founded Southern Cross Extrusions in Sydney.'
  },
  'comp-104': {
    founderName: 'Jonathan Mawson',
    role: 'Founder & Head of R&D (Age 57)',
    email: 'j.mawson@precisionmouldings.com.au',
    phone: '+61 8 8345 6789',
    successionNote: 'Wants to divest 80% majority equity to an active group who can fund Class 7 cleanroom growth, while staying as CTO.',
    linkedin: 'https://linkedin.com/in/jon-mawson-precision',
    bio: 'Academic background in medical-grade polymers. Patented three connector designs used by SA Health.'
  },
  'comp-105': {
    founderName: 'Alastair Tasman',
    role: 'Managing Director (Age 65)',
    email: 'alastair@taspolyproducts.com.au',
    phone: '+61 3 6234 5678',
    successionNote: 'Seeking full immediate retirement. Active talks with marine-grade competitors; succession is high priority.',
    linkedin: 'https://linkedin.com/in/alastair-tasman-taspoly',
    bio: 'A marine biology enthusiast. Designed rotational pens for the early salmon farming sector in Tasmania.'
  },
  'comp-106': {
    founderName: 'Gareth Vance (Board Representative)',
    role: 'Private Equity Operating Partner (Age 48)',
    email: 'g.vance@ozpacksol.com.au',
    phone: '+61 3 9567 8901',
    successionNote: "Owned by mid-market Private Equity. Direct succession isn't standard, exit will likely be an auction process.",
    linkedin: 'https://linkedin.com/in/gareth-vance-ozpack',
    bio: 'Venture Capital and PE operations background. Appointed as director of Oz Packaging Solutions in 2021.'
  }
};

export const ReviewResults: React.FC = () => {
  const navigate = useNavigate();
  const {
    companies,
    shortlistedCompanies,
    shortlistIds,
    loading,
    error,
    successMessage,
    toggleShortlist
  } = useCompanies();

  // Selection states for comparison
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [compareModalOpen, setCompareModalOpen] = useState(false);

  // Selected company detail modal state
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  
  // Custom export feedback success toast state
  const [exportMessage, setExportMessage] = useState<string | null>(null);

  // Enrichment states
  const [enrichModalOpen, setEnrichModalOpen] = useState(false);
  const [activeEnrichId, setActiveEnrichId] = useState<string | null>(null);
  const [enrichStatus, setEnrichStatus] = useState<'idle' | 'searching' | 'linkedin' | 'email' | 'ready'>('idle');
  const [selectedTemplate, setSelectedTemplate] = useState<'formal' | 'legacy' | 'synergy'>('formal');
  const [copyFeedback, setCopyFeedback] = useState(false);

  const activeEnrichCompany = companies.find(c => c.id === activeEnrichId) || null;
  const activeFounder = activeEnrichId ? mockEnrichments[activeEnrichId] : null;

  // Trigger crawler when active company changes in enrichment workspace
  useEffect(() => {
    if (!activeEnrichId || !enrichModalOpen) return;
    setEnrichStatus('searching');
    
    const t1 = setTimeout(() => {
      setEnrichStatus('linkedin');
    }, 400);
    
    const t2 = setTimeout(() => {
      setEnrichStatus('email');
    }, 800);
    
    const t3 = setTimeout(() => {
      setEnrichStatus('ready');
    }, 1200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [activeEnrichId, enrichModalOpen]);

  const generatedScript = useMemo(() => {
    if (!activeEnrichCompany || !activeFounder) return '';

    const name = activeFounder.founderName;
    const company = activeEnrichCompany.name;
    const location = activeEnrichCompany.location;
    const industry = activeEnrichCompany.industry;
    const size = activeEnrichCompany.employeeRange;

    switch (selectedTemplate) {
      case 'formal':
        return `Subject: Confidential Acquisition Inquiry: ${company}

Dear ${name},

I hope this email finds you well.

My name is [Your Name] from [Your Firm], and we have been actively mapping the Australian ${industry} sector for strategic investment. In our research, ${company} stood out as a leader in custom manufacturing, particularly in your ${location} facility operations.

We understand that business succession is a critical milestone, and we are interested in discussing a potential acquisition or recapitalization strategy that respects your legacy and ensures continuity for your ${size} staff. Our focus aligns strongly with your succession profile.

Would you be open to a brief, confidential 15-minute introductory call next Tuesday at 2:00 PM AEST to share notes?

Kind regards,
[Your Name]
[Your Contact Details]`;

      case 'legacy':
        return `Subject: Succession & Legacy Transition Discussion - ${company}

Dear ${name},

I am writing to you directly as the founder of ${company}. We have followed your success in building your ${industry} operations over the years.

We recognize that finding the right successor can be challenging. We specialize in partnering with founders who are seeking retirement or complete transition options. Our goal is to preserve the operations in ${location}, maintain customer trust, and support your transition over a 6-to-12 month period.

We would appreciate the opportunity to introduce ourselves under complete confidentiality. Please let me know if you have availability for a brief call next week.

Warm regards,
[Your Name]
[Your Phone Number]`;

      case 'synergy':
        return `Subject: Strategic Growth & Synergy Opportunities: ${company}

Dear ${name},

I hope you are having a productive week.

We are currently building out an industrial manufacturing portfolio on the East Coast and have been impressed by ${company}'s product line in ${location}.

We see strong horizontal synergies between your manufacturing capabilities and our network. We would love to explore a joint venture, majority buy-out, or partnership structure that allows you to rollover equity or step back from daily operations while retaining your R&D focus.

Let me know if you are open to a casual discussion.

Best regards,
[Your Name]
[Your Title]`;

      default:
        return '';
    }
  }, [activeEnrichCompany, activeFounder, selectedTemplate]);

  const handleBack = () => {
    navigate('/discover');
  };

  const handleExport = () => {
    setExportMessage('Generating PDF Dossiers... Download will start shortly.');
    setTimeout(() => {
      try {
        const doc = new jsPDF();
        
        // Document Title
        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.setTextColor(37, 99, 235); // #2563EB
        doc.text("DEAL SOURCING PLATFORM", 20, 20);
        
        doc.setFontSize(14);
        doc.setTextColor(71, 85, 105); // text-secondary
        doc.text("Shortlisted Acquisition Candidates Dossier", 20, 28);
        
        doc.setLineWidth(0.5);
        doc.setDrawColor(229, 231, 235);
        doc.line(20, 32, 190, 32);
        
        // Metadata Info
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(71, 85, 105);
        doc.text(`Export Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 20, 40);
        doc.text(`Total Candidates Sourced: ${shortlistedCompanies.length}`, 20, 46);
        
        let y = 58;
        
        shortlistedCompanies.forEach((company, index) => {
          if (y > 230) {
            doc.addPage();
            y = 20;
          }
          
          doc.setFont("helvetica", "bold");
          doc.setFontSize(13);
          doc.setTextColor(23, 32, 51);
          doc.text(`${index + 1}. ${company.name}`, 20, y);
          y += 6;
          
          doc.setLineWidth(0.3);
          doc.setDrawColor(241, 245, 249);
          doc.line(20, y, 190, y);
          y += 6;
          
          // Row 1 Metadata columns
          doc.setFont("helvetica", "bold");
          doc.setFontSize(9);
          doc.setTextColor(71, 85, 105);
          doc.text("Location:", 20, y);
          doc.text("Fit Score:", 80, y);
          doc.text("Revenue Range:", 140, y);
          
          doc.setFont("helvetica", "normal");
          doc.setTextColor(23, 32, 51);
          doc.text(company.location, 45, y);
          doc.text(`${company.fitLevel} (${company.confidenceScore}%)`, 100, y);
          doc.text(company.revenueRange, 165, y);
          y += 6;
          
          // Row 2 Metadata columns
          doc.setFont("helvetica", "bold");
          doc.setTextColor(71, 85, 105);
          doc.text("Employees:", 20, y);
          doc.text("Verification:", 80, y);
          doc.text("Ownership Profile:", 140, y);
          
          doc.setFont("helvetica", "normal");
          doc.setTextColor(23, 32, 51);
          doc.text(company.employeeRange, 45, y);
          doc.text(company.evidence.verificationStatus, 110, y);
          doc.text(company.ownership, 172, y);
          y += 8;
          
          // Description paragraph
          doc.setFont("helvetica", "bold");
          doc.setTextColor(71, 85, 105);
          doc.text("Acquisition Rationale & Profile Summary:", 20, y);
          y += 5;
          
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.setTextColor(23, 32, 51);
          
          const splitDesc = doc.splitTextToSize(company.description || company.whyItMatches || '', 170);
          doc.text(splitDesc, 20, y);
          y += (splitDesc.length * 4.5) + 12;
        });
        
        doc.save("dealsourcing_shortlist_dossier.pdf");
        setExportMessage('Dossiers exported successfully. (dealsourcing_shortlist_dossier.pdf)');
      } catch (err) {
        console.error("PDF generation failed:", err);
        setExportMessage('Failed to download PDF dossier. Please try again.');
      }
      setTimeout(() => setExportMessage(null), 3500);
    }, 1500);
  };

  const handleCheckboxToggle = (id: string) => {
    setSelectedForCompare(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      }
      if (prev.length >= 4) {
        alert('You can select a maximum of 4 companies to compare.');
        return prev;
      }
      return [...prev, id];
    });
  };

  const activeCompany = companies.find(c => c.id === selectedCompanyId) || null;

  // Filter comparison targets
  const comparisonTargets = useMemo(() => {
    return shortlistedCompanies.filter(c => selectedForCompare.includes(c.id));
  }, [shortlistedCompanies, selectedForCompare]);

  // Derive page metrics
  const metrics = useMemo(() => {
    const total = shortlistedCompanies.length;
    const highConfidence = shortlistedCompanies.filter(c => c.fitLevel === 'HIGH FIT').length;
    const needsReview = shortlistedCompanies.filter(c => c.evidence.verificationStatus === 'UNVERIFIED').length;
    // Excluded represents companies not shortlisted by the user
    const excluded = total > 0 ? Math.max(0, companies.length - total) : 0;

    return { total, highConfidence, needsReview, excluded };
  }, [shortlistedCompanies, companies]);

  if (loading && shortlistedCompanies.length === 0) {
    return <LoadingState message="Loading shortlist results workspace..." />;
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
      {/* Title & Subtitle */}
      <div className="text-left flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-primary tracking-tight">
            Review Acquisition Candidates
          </h2>
          <p className="text-lg text-secondary mt-2">
            Review your shortlisted businesses before moving forward with formal due diligence.
          </p>
        </div>
      </div>

      {/* Action Toasts */}
      {successMessage && (
        <div className="bg-brand-success-light text-brand-success border border-brand-success rounded-md p-4 flex items-center gap-2.5 text-left animate-fadeIn">
          <CheckCircle2 className="h-5 w-5" />
          <span className="font-semibold text-base">{successMessage}</span>
        </div>
      )}



      {/* 1. Summary Metrics Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
        <Card className="flex items-center gap-4 border-l-4 border-l-brand-primary">
          <div className="p-3 bg-brand-primary-light rounded-full text-brand-primary-dark">
            <FolderCheck className="h-6 w-6" />
          </div>
          <div>
            <span className="text-sm font-semibold text-secondary uppercase tracking-wider block">
              Shortlisted
            </span>
            <span className="text-2xl font-black text-primary block mt-0.5">
              {metrics.total} Companies
            </span>
          </div>
        </Card>

        <Card className="flex items-center gap-4 border-l-4 border-l-brand-success">
          <div className="p-3 bg-brand-success-light rounded-full text-brand-success">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <span className="text-sm font-semibold text-secondary uppercase tracking-wider block">
              High Confidence
            </span>
            <span className="text-2xl font-black text-primary block mt-0.5">
              {metrics.highConfidence} High Fits
            </span>
          </div>
        </Card>

        <Card className="flex items-center gap-4 border-l-4 border-l-brand-warning">
          <div className="p-3 bg-brand-warning-light rounded-full text-brand-warning">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <span className="text-sm font-semibold text-secondary uppercase tracking-wider block">
              Needs Review
            </span>
            <span className="text-2xl font-black text-primary block mt-0.5">
              {metrics.needsReview} Unverified
            </span>
          </div>
        </Card>

        <Card className="flex items-center gap-4 border-l-4 border-l-slate-400">
          <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500">
            <Ban className="h-6 w-6" />
          </div>
          <div>
            <span className="text-sm font-semibold text-secondary uppercase tracking-wider block">
              Excluded Targets
            </span>
            <span className="text-2xl font-black text-primary block mt-0.5">
              {metrics.excluded} Filtered Out
            </span>
          </div>
        </Card>
      </div>

      {/* 2. Main content area */}
      {shortlistedCompanies.length === 0 ? (
        <EmptyState
          title="No shortlisted companies"
          description="Your shortlist is currently empty. Navigate back to the Discover Companies step, select target candidates that match your criteria, and click 'Add to Shortlist'."
          actionText="Discover Companies"
          onAction={() => navigate('/discover')}
        />
      ) : (
        <div className="w-full flex flex-col gap-4 text-left">
          <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-lg border border-default flex items-center justify-between">
            <span className="text-base text-secondary font-semibold">
              Select 2 to 4 checkboxes on the left of each row to unlock the side-by-side comparison workspace.
            </span>
          </div>
          
          <div className="w-full overflow-x-auto rounded-lg border border-default shadow-premium bg-card">
            <table className="w-full border-collapse text-left text-base">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 border-b border-default text-primary font-bold text-sm uppercase tracking-wider">
                  <th className="px-6 py-4.5 w-16 text-center">Compare</th>
                  <th className="px-6 py-4.5">Company Name</th>
                  <th className="px-6 py-4.5">Location</th>
                  <th className="px-6 py-4.5">Fit Score</th>
                  <th className="px-6 py-4.5">Revenue</th>
                  <th className="px-6 py-4.5">Employees</th>
                  <th className="px-6 py-4.5">Verification</th>
                  <th className="px-6 py-4.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-default text-primary">
                {shortlistedCompanies.map(company => {
                  const isSelected = selectedForCompare.includes(company.id);
                  return (
                    <tr
                      key={company.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors duration-150"
                    >
                      {/* Checkbox for Compare */}
                      <td className="px-6 py-5 text-center">
                        <button
                          onClick={() => handleCheckboxToggle(company.id)}
                          className="focus-ring rounded p-1 cursor-pointer inline-flex items-center justify-center"
                          aria-label={`Select ${company.name} for comparison`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}} // handled by button click
                            className="h-5 w-5 text-brand-primary rounded border-default focus-ring cursor-pointer"
                          />
                        </button>
                      </td>

                      {/* Company Name */}
                      <td className="px-6 py-5 font-bold">
                        <span className="text-primary text-base">{company.name}</span>
                      </td>

                      {/* Location */}
                      <td className="px-6 py-5 text-secondary font-semibold">
                        {company.location}
                      </td>

                      {/* Fit Score */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          {company.fitLevel === 'HIGH FIT' && <Badge variant="success">HIGH</Badge>}
                          {company.fitLevel === 'MEDIUM FIT' && <Badge variant="warning">MEDIUM</Badge>}
                          {company.fitLevel === 'LOW FIT' && <Badge variant="danger">LOW</Badge>}
                          <span className="text-sm font-bold text-brand-primary">
                            {company.confidenceScore}%
                          </span>
                        </div>
                      </td>

                      {/* Revenue */}
                      <td className="px-6 py-5 font-bold text-slate-800 dark:text-slate-200">
                        {company.revenueRange}
                      </td>

                      {/* Employees */}
                      <td className="px-6 py-5 text-secondary font-semibold">
                        {company.employeeRange}
                      </td>

                      {/* Verification Status */}
                      <td className="px-6 py-5">
                        <Badge variant={company.evidence.verificationStatus === 'VERIFIED' ? 'success' : 'neutral'}>
                          {company.evidence.verificationStatus}
                        </Badge>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-5 text-right">
                        <div className="inline-flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedCompanyId(company.id)}
                            className="px-3 min-h-0 py-1.5 text-sm"
                          >
                            View Details
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to remove "${company.name}" from your shortlist?`)) {
                                toggleShortlist(company.id);
                              }
                            }}
                            className="px-3 min-h-0 py-1.5 text-sm"
                          >
                            Remove
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Floating Compare & Enrichment Action Bar below table */}
          {selectedForCompare.length >= 1 && (
            <div className="mt-6 p-5 border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl flex flex-col lg:flex-row items-center justify-between gap-4 animate-fadeIn text-left">
              <span className="text-base text-slate-800 dark:text-slate-200 font-bold">
                {selectedForCompare.length} {selectedForCompare.length === 1 ? 'candidate' : 'candidates'} selected.
              </span>
              <div className="flex flex-wrap items-center gap-3 self-stretch lg:self-auto justify-end">
                <Button
                  variant="outline"
                  onClick={() => setSelectedForCompare([])}
                  className="min-h-[46px] px-5"
                >
                  Clear Selection
                </Button>
                
                {/* Enrichment Button */}
                <Button
                  variant="primary"
                  onClick={() => {
                    setActiveEnrichId(selectedForCompare[0]);
                    setEnrichModalOpen(true);
                  }}
                  leftIcon={<Sparkles className="h-5 w-5 text-amber-500 shrink-0" />}
                  className="min-h-[46px] px-5 bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-700 hover:to-indigo-700 text-white border-none"
                >
                  Enrich & Script Outreach
                </Button>

                {/* Compare Button */}
                {selectedForCompare.length >= 2 && (
                  <Button
                    variant="primary"
                    onClick={() => setCompareModalOpen(true)}
                    leftIcon={<Layers className="h-5 w-5 shrink-0" />}
                    className="min-h-[46px] px-5 bg-emerald-600 hover:bg-emerald-700 text-white border-none"
                  >
                    Compare Selected ({selectedForCompare.length})
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. Company Detailed Modal */}
      <CompanyDetails
        company={activeCompany}
        isOpen={selectedCompanyId !== null}
        onClose={() => setSelectedCompanyId(null)}
        isShortlisted={selectedCompanyId ? shortlistIds.includes(selectedCompanyId) : false}
        onToggleShortlist={() => selectedCompanyId && toggleShortlist(selectedCompanyId)}
      />

      {/* 4. Compare Side-by-Side Modal */}
      <Modal
        isOpen={compareModalOpen}
        onClose={() => setCompareModalOpen(false)}
        title="Acquisition Candidates Comparison Matrix"
        size="xl"
        footerActions={
          <Button variant="outline" onClick={() => setCompareModalOpen(false)}>
            Close Matrix Workspace
          </Button>
        }
      >
        <CompanyComparison
          companies={comparisonTargets}
        />
      </Modal>

      {/* 5. Data Enrichment & Outreach Scripting Modal */}
      <Modal
        isOpen={enrichModalOpen}
        onClose={() => setEnrichModalOpen(false)}
        title="Candidate Data Enrichment & Outreach Scripting"
        size="xl"
        footerActions={
          <Button variant="outline" onClick={() => setEnrichModalOpen(false)}>
            Close Workspace
          </Button>
        }
      >
        <div className="flex flex-col lg:flex-row gap-6 min-h-[500px] text-left">
          
          {/* Left Sidebar: Selected Companies List */}
          <div className="w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-default pb-4 lg:pb-0 lg:pr-4 flex flex-col gap-2 shrink-0">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2 px-1">
              Select Candidate
            </span>
            {selectedForCompare.map(id => {
              const comp = shortlistedCompanies.find(c => c.id === id);
              if (!comp) return null;
              const isActive = comp.id === activeEnrichId;
              return (
                <button
                  key={comp.id}
                  onClick={() => setActiveEnrichId(comp.id)}
                  className={`w-full text-left p-3.5 rounded-lg border transition-all cursor-pointer select-none
                    ${isActive 
                      ? 'border-brand-primary bg-blue-50/50 dark:bg-blue-950/20 text-brand-primary font-bold shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                    }
                  `}
                >
                  <div className="text-sm font-bold block truncate">{comp.name}</div>
                  <div className="text-xs text-slate-400 mt-1">{comp.location}</div>
                </button>
              );
            })}
          </div>

          {/* Right Workspace: Enrichment Details & outreach */}
          <div className="flex-1 flex flex-col min-w-0">
            {activeEnrichCompany && activeFounder ? (
              <>
                {enrichStatus !== 'ready' ? (
                  /* enrichment loading status crawler animation */
                  <div className="flex-1 flex flex-col items-center justify-center gap-4 py-12">
                    <RefreshCw className="h-10 w-10 text-brand-primary animate-spin" />
                    <div className="text-center">
                      <h4 className="text-base font-bold text-primary animate-pulse">
                        Enriching Profile Data...
                      </h4>
                      <p className="text-sm text-secondary mt-1">
                        {enrichStatus === 'searching' && "Querying ASIC registers and trade directories..."}
                        {enrichStatus === 'linkedin' && "Validating executive LinkedIn profile maps..."}
                        {enrichStatus === 'email' && "Checking MX DNS records and email routing..."}
                      </p>
                    </div>
                  </div>
                ) : (
                  /* enriched content display */
                  <div className="flex-1 flex flex-col gap-6 animate-fadeIn">
                    
                    {/* Header: Company and fit Level */}
                    <div className="flex flex-wrap justify-between items-center gap-3 border-b border-default pb-4">
                      <div>
                        <h3 className="text-xl font-bold text-primary">{activeEnrichCompany.name}</h3>
                        <span className="text-xs text-secondary mt-0.5 block">{activeEnrichCompany.industry} | {activeEnrichCompany.location}</span>
                      </div>
                      <Badge variant={activeEnrichCompany.fitLevel === 'HIGH FIT' ? 'success' : activeEnrichCompany.fitLevel === 'MEDIUM FIT' ? 'warning' : 'danger'}>
                        {activeEnrichCompany.fitLevel === 'HIGH FIT' ? 'HIGH FIT' : activeEnrichCompany.fitLevel === 'MEDIUM FIT' ? 'MEDIUM FIT' : 'LOW FIT'}
                      </Badge>
                    </div>

                    {/* Grid: Contact details & succession drivers */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      
                      {/* Enriched Contact Info Card */}
                      <div className="p-4 border border-default rounded-md bg-slate-50 dark:bg-slate-900/30 flex flex-col gap-3">
                        <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                          <UserCheck className="h-4 w-4 text-brand-primary" />
                          Enriched Founder Information
                        </h4>
                        
                        <div className="flex flex-col gap-2.5 text-sm mt-1">
                          <div>
                            <span className="text-xs text-slate-400 block">Owner / Managing Director</span>
                            <span className="font-bold text-primary">{activeFounder.founderName}</span>
                          </div>
                          <div>
                            <span className="text-xs text-slate-400 block">Corporate Email</span>
                            <a href={`mailto:${activeFounder.email}`} className="font-semibold text-brand-primary hover:underline flex items-center gap-1 mt-0.5">
                              <Mail className="h-4 w-4 inline animate-pulse" /> {activeFounder.email}
                            </a>
                          </div>
                          <div>
                            <span className="text-xs text-slate-400 block">Direct Contact Number</span>
                            <span className="font-semibold text-primary flex items-center gap-1 mt-0.5">
                              <Phone className="h-4 w-4 text-slate-400" /> {activeFounder.phone}
                            </span>
                          </div>
                          <div>
                            <span className="text-xs text-slate-400 block">LinkedIn Profile</span>
                            <a href={activeFounder.linkedin} target="_blank" rel="noopener noreferrer" className="font-semibold text-indigo-650 dark:text-indigo-400 hover:underline flex items-center gap-1.5 mt-0.5">
                              <svg className="h-4 w-4 inline fill-current text-indigo-600 dark:text-indigo-400 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                              </svg>
                              <span>View Profile</span>
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* Succession Note */}
                      <div className="p-4 border border-default rounded-md bg-slate-50 dark:bg-slate-900/30 flex flex-col gap-3">
                        <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                          Succession & Retirement Driver
                        </h4>
                        <p className="text-sm text-secondary leading-relaxed mt-1">
                          {activeFounder.successionNote}
                        </p>
                        <div className="mt-auto pt-2 border-t border-default/40">
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block uppercase">
                            Verification Source: ASIC Company Extract
                          </span>
                        </div>
                      </div>

                    </div>

                    {/* Outreach Scripting Section */}
                    <div className="flex-1 flex flex-col gap-4 border-t border-default pt-5 mt-1">
                      <div className="flex flex-wrap justify-between items-center gap-3">
                        <div>
                          <h4 className="text-base font-bold text-primary">Outreach Campaign Script</h4>
                          <p className="text-xs text-secondary mt-0.5">Choose a message template based on your strategic positioning.</p>
                        </div>
                        <select
                          value={selectedTemplate}
                          onChange={(e) => setSelectedTemplate(e.target.value as any)}
                          className="px-3.5 py-1.5 text-sm font-semibold rounded border border-default bg-card text-primary focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="formal">Formal Acquisition Inquiry</option>
                          <option value="legacy">Succession & Legacy Partnership</option>
                          <option value="synergy">Industrial Synergies Discussion</option>
                        </select>
                      </div>

                      <div className="relative flex-1 flex flex-col">
                        <textarea
                          readOnly
                          value={generatedScript}
                          rows={11}
                          className="w-full p-4 text-sm font-mono border border-default rounded-md bg-slate-50/50 dark:bg-slate-950/20 text-slate-850 dark:text-slate-200 focus:outline-none resize-none leading-relaxed"
                        />
                        
                        {/* Copy Button */}
                        <div className="absolute top-3 right-3 flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(generatedScript);
                              setCopyFeedback(true);
                              setTimeout(() => setCopyFeedback(false), 2000);
                            }}
                            className="bg-white dark:bg-slate-900 border border-default shadow-sm min-h-0 py-1.5 px-3 flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-350"
                          >
                            <Copy className="h-3.5 w-3.5" />
                            <span>{copyFeedback ? 'Copied!' : 'Copy Script'}</span>
                          </Button>
                        </div>
                      </div>

                      {/* Launch Mail Client Button */}
                      <div className="flex justify-end mt-1">
                        <Button
                          variant="primary"
                          onClick={() => {
                            const subject = encodeURIComponent(
                              selectedTemplate === 'formal' ? `Confidential Acquisition Inquiry: ${activeEnrichCompany.name}` :
                              selectedTemplate === 'legacy' ? `Succession & Legacy Transition Discussion - ${activeEnrichCompany.name}` :
                              `Strategic Growth & Synergy Opportunities: ${activeEnrichCompany.name}`
                            );
                            const body = encodeURIComponent(generatedScript);
                            window.location.href = `mailto:${activeFounder.email}?subject=${subject}&body=${body}`;
                          }}
                          leftIcon={<Mail className="h-5 w-5 shrink-0" />}
                          className="px-6 min-h-[46px]"
                        >
                          Draft Email in Client
                        </Button>
                      </div>

                    </div>

                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-400 italic">
                Please select a candidate to enrich.
              </div>
            )}
          </div>

        </div>
      </Modal>

      {/* Footer / Back / Actions navigation */}
      <div className="border-t border-default pt-6 flex items-center justify-between mt-4">
        <Button
          variant="outline"
          onClick={handleBack}
          leftIcon={<ArrowLeft className="h-5 w-5" />}
          className="min-w-[120px]"
        >
          Back
        </Button>
        {shortlistedCompanies.length > 0 && (
          <Button
            variant="success"
            onClick={handleExport}
            leftIcon={<FileDown className="h-5 w-5" />}
            className="min-w-[200px]"
          >
            Export Candidate Dossiers
          </Button>
        )}
      </div>
      {/* Floating Export Toast at the bottom right */}
      {exportMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-indigo-600 dark:bg-indigo-900 text-white rounded-xl px-5 py-3.5 flex items-center gap-2.5 text-left shadow-lg border border-indigo-500 dark:border-indigo-800 animate-fadeIn text-base font-semibold">
          <Sparkles className="h-5 w-5 animate-pulse" />
          <span>{exportMessage}</span>
        </div>
      )}
    </div>
  );
};
export default ReviewResults;
