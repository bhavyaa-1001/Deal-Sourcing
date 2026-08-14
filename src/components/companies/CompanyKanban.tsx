import React, { useState } from 'react';
import type { Company, FitLevel } from '../../types';
import { Database, ShieldAlert } from 'lucide-react';

interface CompanyKanbanProps {
  companies: Company[];
  onView: (id: string) => void;
  onMoveCompany: (id: string, newFit: FitLevel) => void;
}

export const CompanyKanban: React.FC<CompanyKanbanProps> = ({
  companies,
  onView,
  onMoveCompany,
}) => {
  const [dragOverColumn, setDragOverColumn] = useState<FitLevel | null>(null);

  const columns: { fit: FitLevel; label: string; bg: string; text: string; border: string; dot: string }[] = [
    {
      fit: 'HIGH FIT',
      label: 'High Fit',
      bg: 'bg-brand-success-light/40 dark:bg-emerald-950/10',
      text: 'text-brand-success dark:text-emerald-400',
      border: 'border-brand-success/20 dark:border-emerald-900/30',
      dot: 'bg-brand-success',
    },
    {
      fit: 'MEDIUM FIT',
      label: 'Medium Fit',
      bg: 'bg-brand-warning-light/40 dark:bg-amber-950/10',
      text: 'text-brand-warning dark:text-amber-400',
      border: 'border-brand-warning/20 dark:border-amber-900/30',
      dot: 'bg-brand-warning',
    },
    {
      fit: 'LOW FIT',
      label: 'Low Fit',
      bg: 'bg-brand-danger-light/40 dark:bg-rose-950/10',
      text: 'text-brand-danger dark:text-rose-400',
      border: 'border-brand-danger/20 dark:border-rose-900/30',
      dot: 'bg-brand-danger',
    },
  ];

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, fit: FitLevel) => {
    e.preventDefault();
    setDragOverColumn(fit);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, targetFit: FitLevel) => {
    e.preventDefault();
    setDragOverColumn(null);
    const companyId = e.dataTransfer.getData('text/plain');
    if (companyId) {
      onMoveCompany(companyId, targetFit);
    }
  };


  const getConfidenceBadge = (score: number) => {
    let color = 'bg-brand-success-light text-brand-success border-brand-success/20 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-800/30';
    if (score < 70) {
      color = 'bg-brand-danger-light text-brand-danger border-brand-danger/20 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-800/30';
    } else if (score < 85) {
      color = 'bg-brand-warning-light text-brand-warning border-brand-warning/20 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-800/30';
    }
    return (
      <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded border ${color} select-none whitespace-nowrap`}>
        {score.toFixed(0)}% AI Fit
      </span>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch min-h-[600px] text-left">
      {columns.map(col => {
        const columnCompanies = companies.filter(c => c.fitLevel === col.fit);
        const isOver = dragOverColumn === col.fit;

        return (
          <div
            key={col.fit}
            onDragOver={(e) => handleDragOver(e, col.fit)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, col.fit)}
            className={`flex flex-col rounded-2xl border p-4.5 transition-all duration-200 select-none min-h-[500px]
              ${isOver 
                ? 'border-brand-primary border-dashed border-2 bg-brand-primary-light/10 dark:bg-slate-800/60 shadow-lg scale-[1.005]' 
                : 'border-default bg-slate-50/30 dark:bg-slate-900/25'
              }
            `}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-default select-none">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${col.dot} animate-pulse`} />
                <h3 className="font-extrabold text-[15px] text-primary leading-none uppercase tracking-wider">
                  {col.label}
                </h3>
              </div>
              <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${col.bg} ${col.text} border ${col.border} shadow-sm`}>
                {columnCompanies.length}
              </span>
            </div>

            {/* Droppable Area Container */}
            <div className="flex-1 flex flex-col gap-3.5 overflow-y-auto max-h-[75vh] pr-1.5 scrollbar-thin">
              {columnCompanies.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-default/70 rounded-xl py-12 px-4 text-center select-none bg-white/40 dark:bg-slate-900/10">
                  <ShieldAlert className="h-7 w-7 text-slate-350 dark:text-slate-600 mb-2" />
                  <p className="text-xs text-secondary font-semibold">Drop candidates here</p>
                  <p className="text-[10px] text-slate-400 mt-1 font-medium">Drag a company to change fit level</p>
                </div>
              ) : (
                columnCompanies.map(c => (
                  <div
                    key={c.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, c.id)}
                    className="group bg-white dark:bg-slate-800 border border-default hover:border-brand-primary/45 rounded-xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-grab active:cursor-grabbing relative flex flex-col gap-3.5"
                  >
                    {/* Header */}
                    <div>
                      <div className="flex justify-between items-start gap-3">
                        <h4
                          onClick={() => onView(c.id)}
                          className="font-extrabold text-[17px] text-primary leading-snug group-hover:text-brand-primary hover:underline cursor-pointer transition-colors pr-2 truncate"
                        >
                          {c.name}
                        </h4>
                        <div className="shrink-0 pt-0.5">
                          {getConfidenceBadge(c.confidenceScore ?? 0)}
                        </div>
                      </div>
                      <div className="text-[13px] text-secondary mt-1.5 font-semibold flex items-center gap-1.5 truncate">
                        <span>{c.location.split(',')[0]}</span>
                        <span>•</span>
                        <span>{c.industry}</span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-2 text-[13px] border-t border-b border-default/50 py-2 bg-slate-50/50 dark:bg-slate-900/30 px-2 rounded-lg">
                      <div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Rev</span>
                        <span className="font-extrabold text-primary text-[14px] block mt-0.5 truncate">{c.revenueRange}</span>
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Emp</span>
                        <span className="font-extrabold text-primary text-[14px] block mt-0.5 truncate">{c.employeeRange}</span>
                      </div>
                    </div>

                    {/* Rationale */}
                    <p className="text-[14px] text-secondary leading-normal line-clamp-2">
                      {c.whyItMatches}
                    </p>

                    {/* Footer / CTA */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-default/50 mt-1 select-none">
                      <div className="flex items-center gap-1 text-[12px] text-slate-400 truncate">
                        <Database className="h-3 w-3 shrink-0" />
                        <span className="truncate">{c.sourceName}</span>
                      </div>
                      
                      <button
                        onClick={() => onView(c.id)}
                        className="text-[13px] font-black text-brand-primary hover:underline hover:text-brand-primary-hover flex items-center gap-0.5 cursor-pointer bg-transparent border-none focus:outline-none"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CompanyKanban;
