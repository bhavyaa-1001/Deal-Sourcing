import React, { useState } from 'react';
import type { Company } from '../../types';
import Modal from '../ui/Modal';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { Globe, Building2, TrendingUp, ShieldCheck, ChevronRight, ChevronDown, Check, Plus } from 'lucide-react';

interface CompanyDetailsProps {
  company: Company | null;
  isOpen: boolean;
  onClose: () => void;
  isShortlisted: boolean;
  onToggleShortlist: () => void;
}

export const CompanyDetails: React.FC<CompanyDetailsProps> = ({
  company,
  isOpen,
  onClose,
  isShortlisted,
  onToggleShortlist
}) => {
  const [showRawEvidence, setShowRawEvidence] = useState(false);

  if (!company) return null;

  const getFitBadge = (fit: Company['fitLevel']) => {
    switch (fit) {
      case 'HIGH FIT':
        return <Badge variant="success">HIGH FIT</Badge>;
      case 'MEDIUM FIT':
        return <Badge variant="warning">MEDIUM FIT</Badge>;
      case 'LOW FIT':
        return <Badge variant="danger">LOW FIT</Badge>;
      default:
        return <Badge variant="neutral">{fit}</Badge>;
    }
  };

  const footerActions = (
    <div className="flex justify-between items-center w-full">
      <Button variant="outline" onClick={onClose}>
        Back to Companies
      </Button>
      <Button
        variant={isShortlisted ? 'success' : 'primary'}
        onClick={onToggleShortlist}
        leftIcon={isShortlisted ? <Check className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
      >
        {isShortlisted ? 'Shortlisted ✓' : 'Add to Shortlist'}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${company.name} — Detailed Profile`}
      size="lg"
      footerActions={footerActions}
    >
      <div className="flex flex-col gap-6 text-left">
        {/* 1. Header Overview Card */}
        <div className="bg-slate-50 dark:bg-slate-900/30 p-5 rounded-lg border border-default flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-2xl font-black text-primary">{company.name}</span>
            <span className="text-base text-secondary font-semibold mt-1">
              {company.location} &bull; {company.industry}
            </span>
            <a
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-base font-bold text-brand-primary hover:underline mt-2"
            >
              <Globe className="h-5 w-5" />
              {company.website}
            </a>
          </div>

          <div className="flex flex-col items-start md:items-end gap-2 bg-card p-4 rounded border border-default min-w-[150px]">
            <span className="text-xs font-bold text-secondary uppercase tracking-wider">Fit Score</span>
            <div className="flex items-center gap-2">
              {getFitBadge(company.fitLevel)}
              <span className="text-lg font-black text-brand-primary">
                {company.confidenceScore}%
              </span>
            </div>
          </div>
        </div>

        {/* 2. Business Description */}
        <div className="flex flex-col gap-2">
          <h4 className="text-base font-bold uppercase tracking-wider text-slate-400">
            Company Description
          </h4>
          <p className="text-base text-secondary leading-relaxed">
            {company.description}
          </p>
        </div>

        {/* 3. Grid for Business Profile & Acquisition Rationale */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Section A: Business Profile */}
          <div className="bg-card border border-default rounded-lg p-5 flex flex-col gap-4">
            <h4 className="text-lg font-bold text-primary flex items-center gap-2 border-b border-default pb-2">
              <Building2 className="h-5 w-5 text-brand-primary" />
              Business Profile
            </h4>

            <div className="grid grid-cols-2 gap-4 text-base">
              <div>
                <span className="text-sm font-semibold text-secondary block">Revenue</span>
                <span className="font-bold text-primary block mt-0.5">{company.revenueRange}</span>
              </div>
              <div>
                <span className="text-sm font-semibold text-secondary block">Employees</span>
                <span className="font-bold text-primary block mt-0.5">{company.employeeRange}</span>
              </div>
              <div>
                <span className="text-sm font-semibold text-secondary block">Ownership</span>
                <span className="font-bold text-primary block mt-0.5">{company.ownership}</span>
              </div>
              <div>
                <span className="text-sm font-semibold text-secondary block">Founded</span>
                <span className="font-bold text-primary block mt-0.5">{company.founded}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 mt-2">
              <div>
                <span className="text-sm font-semibold text-secondary block">Key Products</span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {company.businessProfile.keyProducts.map(p => (
                    <span key={p} className="px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-default rounded text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-sm font-semibold text-secondary block">Main Customers</span>
                <span className="text-base text-primary font-semibold block mt-0.5">
                  {company.businessProfile.mainCustomers.join(', ')}
                </span>
              </div>
              <div>
                <span className="text-sm font-semibold text-secondary block">Facilities</span>
                <span className="text-base text-secondary leading-relaxed block mt-0.5 font-semibold">
                  {company.businessProfile.facilities}
                </span>
              </div>
            </div>
          </div>

          {/* Section B: Acquisition Fit Analysis */}
          <div className="bg-card border border-default rounded-lg p-5 flex flex-col gap-4">
            <h4 className="text-lg font-bold text-primary flex items-center gap-2 border-b border-default pb-2">
              <TrendingUp className="h-5 w-5 text-indigo-500" />
              Acquisition Fit Assessment
            </h4>

            <div className="flex flex-col gap-4">
              <div>
                <span className="text-sm font-semibold text-secondary block">Alignment Rationale</span>
                <p className="text-base text-primary font-semibold mt-1 leading-relaxed">
                  {company.acquisitionFit.alignmentReason}
                </p>
              </div>

              <div>
                <span className="text-sm font-semibold text-secondary block">Succession & Leadership Risk</span>
                <p className="text-base text-primary font-semibold mt-1 leading-relaxed">
                  {company.acquisitionFit.successionRisk}
                </p>
              </div>

              <div>
                <span className="text-sm font-semibold text-secondary block">Financial Health Note</span>
                <p className="text-base text-primary font-semibold mt-1 leading-relaxed">
                  {company.acquisitionFit.financialHealth}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Evidence & Progressive Disclosure */}
        <div className="bg-card border border-default rounded-lg p-5 flex flex-col gap-4">
          <h4 className="text-lg font-bold text-primary flex items-center gap-2 border-b border-default pb-2">
            <ShieldCheck className="h-5 w-5 text-brand-success" />
            Verification Evidence
          </h4>

          <div className="flex items-center justify-between text-base">
            <div className="flex items-center gap-2">
              <span className="text-secondary font-semibold">Verification Status:</span>
              <Badge variant={company.evidence.verificationStatus === 'VERIFIED' ? 'success' : 'neutral'}>
                {company.evidence.verificationStatus}
              </Badge>
            </div>
            <span className="text-sm text-secondary font-semibold">
              Last Verified: {company.evidence.lastVerifiedDate}
            </span>
          </div>

          {/* Collapsible advanced evidence records */}
          <div className="border-t border-default pt-2 mt-1">
            <button
              onClick={() => setShowRawEvidence(!showRawEvidence)}
              className="flex items-center gap-1.5 text-base font-bold text-brand-primary hover:underline cursor-pointer focus-ring"
            >
              {showRawEvidence ? (
                <>
                  <ChevronDown className="h-5 w-5" />
                  <span>Hide raw database sources</span>
                </>
              ) : (
                <>
                  <ChevronRight className="h-5 w-5" />
                  <span>Show raw database sources</span>
                </>
              )}
            </button>

            {showRawEvidence && (
              <div className="mt-3.5 bg-slate-50 dark:bg-slate-900/40 p-4 rounded border border-default text-base font-mono text-secondary space-y-1.5 animate-fadeIn">
                <span className="font-bold text-primary block text-sm uppercase font-sans tracking-wide">
                  Crawler sources used to corroborate this listing:
                </span>
                {company.evidence.sourcesUsed.map((src, idx) => (
                  <div key={idx} className="flex gap-2">
                    <span className="text-slate-400">[{idx + 1}]</span>
                    <span>{src}</span>
                  </div>
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
