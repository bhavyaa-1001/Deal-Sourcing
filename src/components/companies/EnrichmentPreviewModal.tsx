import React from 'react';
import type { Company } from '../../types';
import {
  X, Unlock, User, Mail, Phone, Link2, Users,
  FileText, TrendingUp, Sparkles, ChevronRight,
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
    icon: <User className="h-4 w-4" />,
    label: 'Founder Name & Role',
    sample: 'Robert "Bob" Miller — Founder & Managing Director',
    color: 'text-brand-primary dark:text-slate-300',
    bg: 'bg-brand-primary-light/50 dark:bg-slate-800/40',
    border: 'border-brand-primary-light dark:border-slate-800',
  },
  {
    icon: <Users className="h-4 w-4" />,
    label: 'Management Team',
    sample: 'Sarah Wilson (Ops), James Crawford (Sales)',
    color: 'text-brand-primary dark:text-slate-300',
    bg: 'bg-brand-primary-light/50 dark:bg-slate-800/40',
    border: 'border-brand-primary-light dark:border-slate-800',
  },
  {
    icon: <Mail className="h-4 w-4" />,
    label: 'Direct Email Address',
    sample: 'bob.miller@acmeplastics.com.au',
    color: 'text-brand-success dark:text-green-400',
    bg: 'bg-brand-success-light dark:bg-green-950/20',
    border: 'border-brand-success-light/80 dark:border-green-900/40',
  },
  {
    icon: <Phone className="h-4 w-4" />,
    label: 'Direct Phone Number',
    sample: '+61 3 9876 5432',
    color: 'text-brand-success dark:text-green-400',
    bg: 'bg-brand-success-light dark:bg-green-950/20',
    border: 'border-brand-success-light/80 dark:border-green-900/40',
  },
  {
    icon: <Link2 className="h-4 w-4" />,
    label: 'LinkedIn Profile',
    sample: 'linkedin.com/in/robert-miller-acme',
    color: 'text-brand-success dark:text-green-400',
    bg: 'bg-brand-success-light dark:bg-green-950/20',
    border: 'border-brand-success-light/80 dark:border-green-900/40',
  },
  {
    icon: <FileText className="h-4 w-4" />,
    label: 'Founder Bio',
    sample: 'Started Acme Plastics in 1988 with a single injection moulding machine…',
    color: 'text-brand-primary dark:text-slate-300',
    bg: 'bg-brand-primary-light/50 dark:bg-slate-800/40',
    border: 'border-brand-primary-light dark:border-slate-800',
  },
  {
    icon: <TrendingUp className="h-4 w-4" />,
    label: 'Succession Intelligence',
    sample: 'Looking to retire in 12 months. No family succession planned.',
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
              Here's exactly what you'll unlock for{' '}
              <span className="font-bold text-primary">
                {companies.length} {companies.length === 1 ? 'company' : 'companies'}
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
          <p className="text-xs font-bold text-secondary uppercase tracking-wider mb-2">Companies selected</p>
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
          <p className="text-xs font-bold text-secondary uppercase tracking-wider mb-3">What you'll receive</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {UNLOCK_ITEMS.map(item => (
              <div
                key={item.label}
                className={`flex items-start gap-3 p-3 rounded-xl border ${item.bg} ${item.border}`}
              >
                <span className={`shrink-0 mt-0.5 p-1.5 rounded-lg bg-white dark:bg-slate-800 shadow-sm ${item.color}`}>
                  {item.icon}
                </span>
                <div className="min-w-0">
                  <p className={`text-xs font-extrabold uppercase tracking-wide ${item.color}`}>{item.label}</p>
                  <p className="text-xs text-secondary mt-0.5 truncate font-medium italic">e.g. {item.sample}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Note about AI model */}
        <div className="mx-6 mb-4 p-3 rounded-xl bg-brand-primary-light/50 dark:bg-brand-primary-dark/20 border border-brand-primary-light dark:border-brand-primary-dark/40 flex items-start gap-2.5">
          <Sparkles className="h-4 w-4 text-brand-primary dark:text-brand-primary-light shrink-0 mt-0.5" />
          <p className="text-xs text-brand-primary dark:text-brand-primary-light font-medium">
            Our AI model will research and generate enrichment data for each company. Results typically take a few seconds per company.
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
                Enriching {companies.length} {companies.length === 1 ? 'Company' : 'Companies'}…
              </>
            ) : (
              <>
                <Unlock className="h-4 w-4 text-white" />
                Confirm & Enrich {companies.length} {companies.length === 1 ? 'Company' : 'Companies'}
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
