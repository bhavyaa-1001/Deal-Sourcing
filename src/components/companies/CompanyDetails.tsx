import React, { useState } from 'react';
import type { Company } from '../../types';
import Modal from '../ui/Modal';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { Globe, Building2, TrendingUp, ShieldCheck, ChevronRight, ChevronDown, Lock, Unlock, Mail, Phone, ExternalLink } from 'lucide-react';

interface CompanyDetailsProps {
  company: Company | null;
  isOpen: boolean;
  onClose: () => void;
  onEnrich?: (companyId: string) => void;
}

export const CompanyDetails: React.FC<CompanyDetailsProps> = ({
  company,
  isOpen,
  onClose,
  onEnrich
}) => {
  const [showRawEvidence, setShowRawEvidence] = useState(false);

  if (!company) return null;

  const getFitBadge = (fit: Company['fitLevel']) => {
    switch (fit) {
      case 'HIGH FIT': return <Badge variant="success">HIGH FIT</Badge>;
      case 'MEDIUM FIT': return <Badge variant="warning">MEDIUM FIT</Badge>;
      case 'LOW FIT': return <Badge variant="danger">LOW FIT</Badge>;
      default: return <Badge variant="neutral">{fit}</Badge>;
    }
  };

  const isEnriched = company.enrichmentStatus === 'enriched';
  const isProcessing = company.enrichmentStatus === 'processing';

  const footerActions = (
    <div className="flex justify-between items-center w-full">
      <Button variant="outline" onClick={onClose}>Back to Companies</Button>
      {!isEnriched && onEnrich && (
        <Button
          variant="primary"
          onClick={() => onEnrich(company.id)}
          disabled={isProcessing}
          leftIcon={<Lock className="h-4 w-4" />}
        >
          {isProcessing ? 'Enriching...' : 'Enrich This Company'}
        </Button>
      )}
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${company.name} — Detailed Profile`} size="lg" footerActions={footerActions}>
      <div className="flex flex-col gap-6 text-left">

        {/* 1. Header */}
        <div className="bg-slate-50 dark:bg-slate-900/30 p-5 rounded-lg border border-default flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-2xl font-black text-primary">{company.name}</span>
            <span className="text-base text-secondary font-semibold mt-1">{company.location} &bull; {company.industry}</span>
            <a href={company.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-base font-bold text-brand-primary hover:underline mt-2">
              <Globe className="h-5 w-5" />{company.website}
            </a>
          </div>
          <div className="flex flex-col items-start md:items-end gap-2 bg-card p-4 rounded border border-default min-w-[150px]">
            <span className="text-xs font-bold text-secondary uppercase tracking-wider">Fit Score</span>
            <div className="flex items-center gap-2">
              {getFitBadge(company.fitLevel)}
              <span className="text-lg font-black text-brand-primary">{company.confidenceScore}%</span>
            </div>
          </div>
        </div>

        {/* 2. Description */}
        <div className="flex flex-col gap-2">
          <h4 className="text-base font-bold uppercase tracking-wider text-slate-400">Company Description</h4>
          <p className="text-base text-secondary leading-relaxed">{company.description}</p>
        </div>

        {/* 3. Contact Information - gated */}
        <div className="bg-card border border-default rounded-lg p-5 flex flex-col gap-4">
          <h4 className="text-lg font-bold text-primary flex items-center gap-2 border-b border-default pb-2">
            {isEnriched ? <Unlock className="h-5 w-5 text-brand-success" /> : <Lock className="h-5 w-5 text-[#8A6A3D]" />}
            Contact Information
          </h4>

          {isEnriched && company.enrichmentData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-3">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Founder</span>
                  <span className="text-base font-bold text-primary block mt-0.5">{company.enrichmentData.founderName}</span>
                  <span className="text-sm text-secondary block mt-0.5">{company.enrichmentData.founderRole}</span>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Contact Person</span>
                  <span className="text-base font-bold text-primary block mt-0.5">{company.enrichmentData.contactPerson}</span>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">LinkedIn Profile</span>
                  {company.enrichmentData.linkedin ? (
                    <a href={company.enrichmentData.linkedin} target="_blank" rel="noopener noreferrer" className="text-base font-bold text-brand-primary hover:underline inline-flex items-center gap-1.5 mt-0.5">
                      View LinkedIn Profile <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  ) : (
                    <span className="text-base text-secondary block mt-0.5">Not available</span>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Email Address</span>
                  <a href={`mailto:${company.enrichmentData.email}`} className="text-base font-bold text-brand-primary hover:underline inline-flex items-center gap-1.5 mt-0.5">
                    <Mail className="h-4 w-4" /> {company.enrichmentData.email}
                  </a>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Phone Number</span>
                  <span className="text-base font-bold text-primary inline-flex items-center gap-1.5 mt-0.5">
                    <Phone className="h-4 w-4 text-slate-400" /> {company.enrichmentData.phone}
                  </span>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Management Team</span>
                  <span className="text-base text-secondary block mt-0.5">{company.enrichmentData.managementTeam}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 bg-slate-50 dark:bg-slate-900/30 rounded-md border border-default text-center flex flex-col items-center gap-3">
              <span className="text-base font-bold text-[#8A6A3D] uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="h-4 w-4" /> Enrichment Required
              </span>
              <p className="text-sm text-secondary max-w-md">
                Pay for enrichment to access founder, management team, direct phone numbers, email addresses, and LinkedIn profiles.
              </p>
              {onEnrich && (
                <Button variant="primary" size="sm" onClick={() => onEnrich(company.id)} disabled={isProcessing} leftIcon={<Lock className="h-4 w-4" />} className="mt-2">
                  {isProcessing ? 'Enriching...' : 'Enrich This Company'}
                </Button>
              )}
            </div>
          )}
        </div>

        {/* 4. Business Profile & Acquisition Fit */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card border border-default rounded-lg p-5 flex flex-col gap-4">
            <h4 className="text-lg font-bold text-primary flex items-center gap-2 border-b border-default pb-2">
              <Building2 className="h-5 w-5 text-brand-primary" />Business Profile
            </h4>
            <div className="grid grid-cols-2 gap-4 text-base">
              <div><span className="text-sm font-semibold text-secondary block">Revenue</span><span className="font-bold text-primary block mt-0.5">{company.revenueRange}</span></div>
              <div><span className="text-sm font-semibold text-secondary block">Employees</span><span className="font-bold text-primary block mt-0.5">{company.employeeRange}</span></div>
              <div><span className="text-sm font-semibold text-secondary block">Ownership</span><span className="font-bold text-primary block mt-0.5">{company.ownership}</span></div>
              <div><span className="text-sm font-semibold text-secondary block">Founded</span><span className="font-bold text-primary block mt-0.5">{company.founded}</span></div>
            </div>
            <div className="flex flex-col gap-2.5 mt-2">
              <div>
                <span className="text-sm font-semibold text-secondary block">Key Products</span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {company.businessProfile.keyProducts.map(p => (
                    <span key={p} className="px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-default rounded text-sm font-semibold text-slate-800 dark:text-slate-200">{p}</span>
                  ))}
                </div>
              </div>
              <div><span className="text-sm font-semibold text-secondary block">Main Customers</span><span className="text-base text-primary font-semibold block mt-0.5">{company.businessProfile.mainCustomers.join(', ')}</span></div>
              <div><span className="text-sm font-semibold text-secondary block">Facilities</span><span className="text-base text-secondary leading-relaxed block mt-0.5 font-semibold">{company.businessProfile.facilities}</span></div>
            </div>
          </div>

          <div className="bg-card border border-default rounded-lg p-5 flex flex-col gap-4">
            <h4 className="text-lg font-bold text-primary flex items-center gap-2 border-b border-default pb-2">
              <TrendingUp className="h-5 w-5 text-indigo-500" />Acquisition Fit Assessment
            </h4>
            <div className="flex flex-col gap-4">
              <div><span className="text-sm font-semibold text-secondary block">Alignment Rationale</span><p className="text-base text-primary font-semibold mt-1 leading-relaxed">{company.acquisitionFit.alignmentReason}</p></div>
              <div><span className="text-sm font-semibold text-secondary block">Succession &amp; Leadership Risk</span><p className="text-base text-primary font-semibold mt-1 leading-relaxed">{company.acquisitionFit.successionRisk}</p></div>
              <div><span className="text-sm font-semibold text-secondary block">Financial Health Note</span><p className="text-base text-primary font-semibold mt-1 leading-relaxed">{company.acquisitionFit.financialHealth}</p></div>
            </div>
          </div>
        </div>

        {/* 5. Evidence */}
        <div className="bg-card border border-default rounded-lg p-5 flex flex-col gap-4">
          <h4 className="text-lg font-bold text-primary flex items-center gap-2 border-b border-default pb-2">
            <ShieldCheck className="h-5 w-5 text-brand-success" />Verification Evidence
          </h4>
          <div className="flex items-center justify-between text-base">
            <div className="flex items-center gap-2">
              <span className="text-secondary font-semibold">Verification Status:</span>
              <Badge variant={company.evidence.verificationStatus === 'VERIFIED' ? 'success' : 'neutral'}>{company.evidence.verificationStatus}</Badge>
            </div>
            <span className="text-sm text-secondary font-semibold">Last Verified: {company.evidence.lastVerifiedDate}</span>
          </div>
          <div className="border-t border-default pt-2 mt-1">
            <button onClick={() => setShowRawEvidence(!showRawEvidence)} className="flex items-center gap-1.5 text-base font-bold text-brand-primary hover:underline cursor-pointer focus-ring">
              {showRawEvidence ? (<><ChevronDown className="h-5 w-5" /><span>Hide raw database sources</span></>) : (<><ChevronRight className="h-5 w-5" /><span>Show raw database sources</span></>)}
            </button>
            {showRawEvidence && (
              <div className="mt-3.5 bg-slate-50 dark:bg-slate-900/40 p-4 rounded border border-default text-base font-mono text-secondary space-y-1.5 animate-fadeIn">
                <span className="font-bold text-primary block text-sm uppercase font-sans tracking-wide">Crawler sources used to corroborate this listing:</span>
                {company.evidence.sourcesUsed.map((src, idx) => (
                  <div key={idx} className="flex gap-2"><span className="text-slate-400">[{idx + 1}]</span><span>{src}</span></div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </Modal>
  );
};
export default CompanyDetails;
