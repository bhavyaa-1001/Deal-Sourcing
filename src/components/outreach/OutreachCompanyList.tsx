import React from 'react';
import type { Company } from '../../types';
import Badge from '../ui/Badge';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

interface Props {
  companies: Company[];
  enrichedIds: string[];
  activeId: string | null;
  onSelect: (id: string) => void;
}

const OutreachCompanyList: React.FC<Props> = ({ companies, enrichedIds, activeId, onSelect }) => {
  return (
    <div className="flex flex-col gap-1 text-left">
      <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2">
        Target Companies
      </span>
      {companies.map((company) => {
        const isEnriched = enrichedIds.includes(company.id);
        const isActive = company.id === activeId;
        return (
          <button
            key={company.id}
            onClick={() => onSelect(company.id)}
            className={`
              w-full text-left px-4 py-3.5 rounded-lg border transition-all duration-150 cursor-pointer
              ${isActive
                ? 'border-brand-primary bg-brand-primary-light dark:bg-blue-950/30 shadow-sm'
                : 'border-default bg-card hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }
            `}
            aria-pressed={isActive}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2.5 min-w-0">
                {isEnriched
                  ? <CheckCircle2 className="h-4 w-4 text-brand-success shrink-0 mt-0.5" />
                  : <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                }
                <div className="min-w-0">
                  <span className={`text-sm font-bold leading-tight block truncate ${isActive ? 'text-brand-primary' : 'text-primary'}`}>
                    {company.name}
                  </span>
                  <span className="text-xs text-secondary mt-0.5 block truncate">{company.location}</span>
                </div>
              </div>
            </div>
            <div className="mt-2 pl-6">
              {isEnriched
                ? <Badge variant="success" className="text-xs px-2 py-0.5 min-h-0">Enriched</Badge>
                : <Badge variant="warning" className="text-xs px-2 py-0.5 min-h-0">Enrichment Required</Badge>
              }
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default OutreachCompanyList;
