import React from 'react';
import type { Company } from '../../types';
import {
  X, Mail, Link2,
  Award, TrendingUp, Sparkles, ChevronRight
} from 'lucide-react';

interface EnrichmentPreviewModalProps {
  isOpen: boolean;
  companies: Company[];          // unenriched selected companies
  onClose: () => void;
  onConfirm: (ids: string[]) => void;
  isEnriching?: boolean;
}

const UNLOCK_ITEMS = [
  {
    icon: <Mail className="h-4 w-4" />,
    label: 'All Missing Direct Contacts',
    description: 'Searches & extracts verified direct emails, mobile numbers, and executive direct lines',
    color: 'text-brand-success dark:text-green-400',
    bg: 'bg-brand-success-light dark:bg-green-950/20',
    border: 'border-brand-success-light/80 dark:border-green-900/40',
  },
  {
    icon: <Link2 className="h-4 w-4" />,
    label: 'Executive & Digital Profiles',
    description: 'Finds verified executive LinkedIn URLs, corporate profiles, and public digital traces',
    color: 'text-brand-primary dark:text-slate-300',
    bg: 'bg-brand-primary-light/50 dark:bg-slate-800/40',
    border: 'border-brand-primary-light dark:border-slate-800',
  },
  {
    icon: <Award className="h-4 w-4" />,
    label: 'Official Verification Proofs',
    description: 'Extracts ASIC director filings, corporate inception records, and verifiable registry proofs',
    color: 'text-brand-primary dark:text-slate-300',
    bg: 'bg-brand-primary-light/50 dark:bg-slate-800/40',
    border: 'border-brand-primary-light dark:border-slate-800',
  },
  {
    icon: <TrendingUp className="h-4 w-4" />,
    label: 'Succession & Ownership Intelligence',
    description: 'Uncovers cap table breakdown, management lieutenants, and transition/exit timelines',
    color: 'text-brand-warning dark:text-amber-400',
    bg: 'bg-brand-warning-light dark:bg-amber-950/20',
    border: 'border-brand-warning-light dark:border-amber-900/40',
  },
];

const EnrichmentPreviewModal: React.FC<EnrichmentPreviewModalProps> = ({
  isOpen,
  companies,
  onClose,
  onConfirm,
  isEnriching = false,
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(companies.map(c => c.id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/55 backdrop-blur-xs"
        onClick={!isEnriching ? onClose : undefined}
      />

      {/* Panel */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-default animate-fadeIn">

        {/* Header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-default px-6 py-4 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 rounded-lg bg-brand-primary dark:bg-brand-primary-hover">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <h2 className="text-lg font-extrabold text-primary">Enrichment Preview</h2>
            </div>
            <p className="text-sm text-secondary">
              Extract all missing information and verification proofs for{' '}
              <span className="font-bold text-primary">
                {companies.length} {companies.length === 1 ? 'lead' : 'leads'}
              </span>
            </p>
          </div>
          {!isEnriching && (
            <button
              onClick={onClose}
              className="shrink-0 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-secondary hover:text-primary transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Companies being enriched */}
        <div className="px-6 pt-5 pb-3">
          <p className="text-xs font-bold text-secondary uppercase tracking-wider mb-2">Selected Lead</p>
          <div className="flex flex-wrap gap-2">
            {companies.map(c => (
              <span
                key={c.id}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-sm font-semibold text-primary"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-brand-primary dark:bg-brand-primary-light shrink-0" />
                {c.name}
              </span>
            ))}
          </div>
        </div>

        {/* What you unlock */}
        <div className="px-6 pb-4">
          <p className="text-xs font-bold text-secondary uppercase tracking-wider mb-3">All Missing Information Extracted</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {UNLOCK_ITEMS.map(item => (
              <div
                key={item.label}
                className={`flex items-start gap-3 p-3.5 rounded-xl border ${item.bg} ${item.border}`}
              >
                <span className={`shrink-0 mt-0.5 p-1.5 rounded-lg bg-white dark:bg-slate-800 shadow-sm ${item.color}`}>
                  {item.icon}
                </span>
                <div className="min-w-0">
                  <p className={`text-xs font-extrabold uppercase tracking-wide ${item.color}`}>{item.label}</p>
                  <p className="text-xs text-secondary mt-1 font-medium leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Note about AI model */}
        <div className="mx-6 mb-4 p-3 rounded-xl bg-brand-primary-light/50 dark:bg-brand-primary-dark/20 border border-brand-primary-light dark:border-brand-primary-dark/40 flex items-start gap-2.5">
          <Sparkles className="h-4 w-4 text-brand-primary dark:text-brand-primary-light shrink-0 mt-0.5" />
          <p className="text-xs text-brand-primary dark:text-brand-primary-light font-medium">
            Our deep research model scans private databases, registry filings, and verification systems to extract and verify all missing company and founder details in a single complete package.
          </p>
        </div>

        {/* Footer actions */}
        <div className="sticky bottom-0 bg-white dark:bg-slate-900 border-t border-default px-6 py-4 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            disabled={isEnriching}
            className="px-4 py-2 text-sm font-semibold text-secondary hover:text-primary border border-default rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Cancel
          </button>

          <button
            onClick={handleConfirm}
            disabled={isEnriching}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm bg-brand-primary hover:bg-brand-primary-hover text-white shadow-md transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed active:scale-95 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2"
          >
            {isEnriching ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Enriching {companies.length} {companies.length === 1 ? 'Lead' : 'Leads'}…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-white" />
                Confirm & Enrich {companies.length} {companies.length === 1 ? 'Lead' : 'Leads'}
                <ChevronRight className="h-4 w-4 text-white" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnrichmentPreviewModal;
