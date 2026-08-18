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
    color: 'text-[#758A93] dark:text-[#A4BCC7]',
    bg: 'bg-[#E8EEEF] dark:bg-[#203038]',
    border: 'border-[#758A93]/40 dark:border-[#3E5664]',
  },
  {
    icon: <Link2 className="h-4 w-4" />,
    label: 'Executive & Digital Profiles',
    description: 'Finds verified executive LinkedIn URLs, corporate profiles, and public digital traces',
    color: 'text-[#53666F] dark:text-[#A4BCC7]',
    bg: 'bg-[#F8F6F1] dark:bg-[#1D272E]',
    border: 'border-[#DED9D0] dark:border-[#2E3D47]',
  },
  {
    icon: <Award className="h-4 w-4" />,
    label: 'Official Verification Proofs',
    description: 'Extracts ASIC director filings, corporate inception records, and verifiable registry proofs',
    color: 'text-[#53666F] dark:text-[#A4BCC7]',
    bg: 'bg-[#F8F6F1] dark:bg-[#1D272E]',
    border: 'border-[#DED9D0] dark:border-[#2E3D47]',
  },
  {
    icon: <TrendingUp className="h-4 w-4" />,
    label: 'Succession & Ownership Intelligence',
    description: 'Uncovers cap table breakdown, management lieutenants, and transition/exit timelines',
    color: 'text-[#997017] dark:text-[#E8C062]',
    bg: 'bg-[#FDF7E8] dark:bg-[#332B18]',
    border: 'border-[#E9B63B]/40 dark:border-[#6E5A2A]',
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
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-[#1D272E] rounded-xl shadow-2xl border border-[#DED9D0] dark:border-[#2E3D47] animate-fadeIn">

        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#F8F6F1] dark:bg-[#172025] border-b border-[#DED9D0] dark:border-[#2E3D47] px-6 py-4 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 rounded-lg bg-[#202A30] dark:bg-[#F4F6F8]">
                <Sparkles className="h-4 w-4 text-[#E9B63B] dark:text-[#202A30]" />
              </div>
              <h2 className="text-lg font-extrabold text-[#202A30] dark:text-[#F4F6F8]">Enrichment Preview</h2>
            </div>
            <p className="text-sm text-[#5F6B72] dark:text-[#A4B2BA]">
              Extract all missing information and verification proofs for{' '}
              <span className="font-bold text-[#202A30] dark:text-[#F4F6F8]">
                {companies.length} {companies.length === 1 ? 'lead' : 'leads'}
              </span>
            </p>
          </div>
          {!isEnriching && (
            <button
              onClick={onClose}
              className="shrink-0 p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-[#5F6B72] hover:text-[#202A30] dark:text-[#A4B2BA] dark:hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Companies being enriched */}
        <div className="px-6 pt-5 pb-3">
          <p className="text-xs font-bold text-[#5F6B72] dark:text-[#A4B2BA] uppercase tracking-wider mb-2">Selected Lead</p>
          <div className="flex flex-wrap gap-2">
            {companies.map(c => (
              <span
                key={c.id}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F8F6F1] dark:bg-[#243038] border border-[#DED9D0] dark:border-[#2E3D47] text-sm font-semibold text-[#202A30] dark:text-[#F4F6F8]"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#758A93] shrink-0" />
                {c.name}
              </span>
            ))}
          </div>
        </div>

        {/* What you unlock */}
        <div className="px-6 pb-4">
          <p className="text-xs font-bold text-[#5F6B72] dark:text-[#A4B2BA] uppercase tracking-wider mb-3">All Missing Information Extracted</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {UNLOCK_ITEMS.map(item => (
              <div
                key={item.label}
                className={`flex items-start gap-3 p-3.5 rounded-lg border ${item.bg} ${item.border}`}
              >
                <span className={`shrink-0 mt-0.5 p-1.5 rounded-lg bg-white dark:bg-[#1D272E] shadow-xs ${item.color}`}>
                  {item.icon}
                </span>
                <div className="min-w-0">
                  <p className={`text-xs font-extrabold uppercase tracking-wide ${item.color}`}>{item.label}</p>
                  <p className="text-xs text-[#5F6B72] dark:text-[#A4B2BA] mt-1 font-medium leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Note about deeper research with Gold accent */}
        <div className="mx-6 mb-4 p-3 rounded-lg bg-[#FDF7E8] dark:bg-[#332B18]/60 border border-[#E9B63B]/40 dark:border-[#6E5A2A] flex items-start gap-2.5">
          <Sparkles className="h-4 w-4 text-[#E9B63B] shrink-0 mt-0.5" />
          <p className="text-xs text-[#997017] dark:text-[#E8C062] font-medium leading-relaxed">
            Our deep research model scans private databases, registry filings, and verification systems to extract and verify all missing company and founder details in a single complete package.
          </p>
        </div>

        {/* Footer actions */}
        <div className="sticky bottom-0 bg-[#F8F6F1] dark:bg-[#172025] border-t border-[#DED9D0] dark:border-[#2E3D47] px-6 py-4 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            disabled={isEnriching}
            className="px-4 py-2 text-sm font-semibold text-[#5F6B72] hover:text-[#202A30] dark:text-[#A4B2BA] dark:hover:text-white border border-[#DED9D0] dark:border-[#2E3D47] rounded-lg bg-white dark:bg-[#1D272E] hover:bg-[#F8F6F1] dark:hover:bg-[#243038] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Cancel
          </button>

          <button
            onClick={handleConfirm}
            disabled={isEnriching}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm bg-[#202A30] hover:bg-[#151D22] text-white dark:bg-[#F4F6F8] dark:text-[#13191D] dark:hover:bg-[#E4E8EB] shadow-xs transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#758A93] focus:ring-offset-2"
          >
            {isEnriching ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white dark:text-[#13191D]" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Enriching {companies.length} {companies.length === 1 ? 'Lead' : 'Leads'}…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-[#E9B63B]" />
                Confirm & Enrich {companies.length} {companies.length === 1 ? 'Lead' : 'Leads'}
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnrichmentPreviewModal;
