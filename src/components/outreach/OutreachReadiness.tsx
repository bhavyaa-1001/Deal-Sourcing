import React from 'react';
import type { Company } from '../../types';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

interface Props {
  company: Company;
  isEnriched: boolean;
}

interface ReadinessItem {
  label: string;
  ok: boolean;
  required: boolean;
}

const OutreachReadiness: React.FC<Props> = ({ company, isEnriched }) => {
  const ed = company.enrichmentData;

  const hasContact = isEnriched && !!(ed?.contactPerson || ed?.founderName);
  const hasContactInfo = isEnriched && !!(
    (ed?.email && !ed.email.toLowerCase().includes('not available')) ||
    (ed?.linkedin && ed.linkedin.trim().length > 0)
  );

  const items: ReadinessItem[] = [
    { label: 'Company selected', ok: true, required: true },
    { label: 'Company enriched', ok: isEnriched, required: true },
    { label: 'Contact identified', ok: hasContact, required: true },
    { label: 'Contact information available', ok: hasContactInfo, required: true },
  ];

  const isReady = items.every(i => i.ok);

  return (
    <div className="border border-default rounded-lg p-5 bg-card text-left">
      <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-3">
        Outreach Readiness
      </span>
      <div className="flex flex-col gap-2 mb-4">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-2.5">
            {item.ok
              ? <CheckCircle2 className="h-4 w-4 text-brand-success shrink-0" />
              : item.required
                ? <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                : <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
            }
            <span className={`text-sm font-medium ${item.ok ? 'text-primary' : 'text-slate-400 dark:text-slate-500'}`}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
      <div className={`
        flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-bold
        ${isReady
          ? 'bg-brand-success-light text-brand-success border border-brand-success/30 dark:bg-emerald-950/30'
          : 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
        }
      `}>
        {isReady ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
        {isReady ? 'Ready for Outreach' : isEnriched ? 'Contact Information Unavailable' : 'Enrichment Required'}
      </div>
    </div>
  );
};

export default OutreachReadiness;
