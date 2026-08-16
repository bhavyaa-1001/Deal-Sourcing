import React, { useState } from 'react';
import type { Company, PipelineStage } from '../../types';
import {
  Users, ChevronRight, AlertCircle
} from 'lucide-react';

export type PriorityLevel = 'HIGH' | 'MEDIUM' | 'LOW';

interface CompanyKanbanProps {
  companies: Company[];
  onView: (id: string) => void;
  onMoveStage?: (id: string, newStage: PipelineStage) => void;
  onUpdatePriority?: (id: string, priority: PriorityLevel) => void;
}

export const PIPELINE_STAGES: {
  id: PipelineStage;
  label: string;
  dotColor: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
}[] = [
  {
    id: 'shortlisted',
    label: 'Shortlisted Targets',
    dotColor: 'bg-[#A65F3F] dark:bg-[#C27A56]',
    badgeBg: 'bg-[#F4E8E2] dark:bg-[#3A281F]',
    badgeText: 'text-[#A65F3F] dark:text-[#C27A56]',
    borderColor: 'border-[#A65F3F]/30 dark:border-[#C27A56]/30',
  },
  {
    id: 'contacted',
    label: 'Outreach Sent',
    dotColor: 'bg-[#9A7535] dark:bg-[#D5C76E]',
    badgeBg: 'bg-[#F5EDDA] dark:bg-[#3A3520]',
    badgeText: 'text-[#9A7535] dark:text-[#D5C76E]',
    borderColor: 'border-[#E3D4B3] dark:border-[#625A2F]',
  },
  {
    id: 'discussion',
    label: 'In Discussion / NDA',
    dotColor: 'bg-[#2B6CB0] dark:bg-[#63B3ED]',
    badgeBg: 'bg-[#EBF8FF] dark:bg-[#1A365D]',
    badgeText: 'text-[#2B6CB0] dark:text-[#63B3ED]',
    borderColor: 'border-[#BEE3F8] dark:border-[#2A4365]',
  },
  {
    id: 'due_diligence',
    label: 'Due Diligence',
    dotColor: 'bg-[#805AD5] dark:bg-[#B794F4]',
    badgeBg: 'bg-[#FAF5FF] dark:bg-[#322659]',
    badgeText: 'text-[#805AD5] dark:text-[#B794F4]',
    borderColor: 'border-[#E9D8FD] dark:border-[#44337A]',
  },
  {
    id: 'closing',
    label: 'Term Sheet / Closing',
    dotColor: 'bg-[#35624A] dark:text-[#8FBEA1]',
    badgeBg: 'bg-[#E3ECE6] dark:bg-[#173529]',
    badgeText: 'text-[#35624A] dark:text-[#8FBEA1]',
    borderColor: 'border-[#B7CCBC] dark:border-[#39634D]',
  },
];

export const CompanyKanban: React.FC<CompanyKanbanProps> = ({
  companies,
  onView,
  onMoveStage,
  onUpdatePriority,
}) => {
  const [dragOverColumn, setDragOverColumn] = useState<PipelineStage | null>(null);

  // Local state for priorities and pipeline stages if not stored on company object
  const [localPriorities, setLocalPriorities] = useState<Record<string, PriorityLevel>>(() => {
    const saved = localStorage.getItem('dealsourcing_kanban_priorities');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    const initial: Record<string, PriorityLevel> = {};
    companies.forEach(c => {
      const score = c.fitScore ?? c.confidenceScore ?? 80;
      if (c.priority) {
        initial[c.id] = c.priority;
      } else if (c.fitLevel === 'HIGH FIT' || score >= 90) {
        initial[c.id] = 'HIGH';
      } else if (c.fitLevel === 'MEDIUM FIT' || score >= 75) {
        initial[c.id] = 'MEDIUM';
      } else {
        initial[c.id] = 'LOW';
      }
    });
    return initial;
  });

  const [localStages, setLocalStages] = useState<Record<string, PipelineStage>>(() => {
    const saved = localStorage.getItem('dealsourcing_kanban_stages');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    const initial: Record<string, PipelineStage> = {};
    companies.forEach((c, idx) => {
      initial[c.id] = c.pipelineStage || (idx === 0 ? 'contacted' : 'shortlisted');
    });
    return initial;
  });

  const handlePriorityChange = (companyId: string, priority: PriorityLevel) => {
    const updated = { ...localPriorities, [companyId]: priority };
    setLocalPriorities(updated);
    localStorage.setItem('dealsourcing_kanban_priorities', JSON.stringify(updated));
    if (onUpdatePriority) {
      onUpdatePriority(companyId, priority);
    }
  };

  const handleStageChange = (companyId: string, newStage: PipelineStage) => {
    const updated = { ...localStages, [companyId]: newStage };
    setLocalStages(updated);
    localStorage.setItem('dealsourcing_kanban_stages', JSON.stringify(updated));
    if (onMoveStage) {
      onMoveStage(companyId, newStage);
    }
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, stage: PipelineStage) => {
    e.preventDefault();
    setDragOverColumn(stage);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, targetStage: PipelineStage) => {
    e.preventDefault();
    setDragOverColumn(null);
    const companyId = e.dataTransfer.getData('text/plain');
    if (companyId) {
      handleStageChange(companyId, targetStage);
    }
  };

  const getPriorityBadgeClass = (priority: PriorityLevel) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-[#E3ECE6] text-[#35624A] border-[#B7CCBC] dark:bg-[#173529] dark:text-[#8FBEA1] dark:border-[#39634D]';
      case 'MEDIUM':
        return 'bg-[#F5EDDA] text-[#9A7535] border-[#E3D4B3] dark:bg-[#3A3520] dark:text-[#D5C76E] dark:border-[#625A2F]';
      case 'LOW':
        return 'bg-[#F1EFEA] text-[#626A6D] border-[#D8D5CE] dark:bg-[#1D2B3A] dark:text-[#9AA9B8] dark:border-[#344658]';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 items-stretch min-h-[640px] text-left">
      {PIPELINE_STAGES.map((col, colIndex) => {
        const columnCompanies = companies.filter(c => (localStages[c.id] || c.pipelineStage || 'shortlisted') === col.id);
        const isOver = dragOverColumn === col.id;

        return (
          <div
            key={col.id}
            onDragOver={(e) => handleDragOver(e, col.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, col.id)}
            className={`flex flex-col rounded-xl border p-3.5 transition-all duration-200 min-h-[520px] bg-slate-50/50 dark:bg-[#141F2C]/60 ${
              isOver
                ? 'border-[#202A2E] dark:border-[#C5B76A] border-dashed border-2 bg-white dark:bg-[#1D2B3A] shadow-md'
                : 'border-[#D8D5CE] dark:border-[#2D4053]'
            }`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#D8D5CE] dark:border-[#263544]">
              <div className="flex items-center gap-2 min-w-0">
                <span className={`w-2 h-2 rounded-full ${col.dotColor} shrink-0`} />
                <h3 className="font-extrabold text-xs text-[#202A2E] dark:text-[#F1F5F9] uppercase tracking-wider truncate">
                  {col.label}
                </h3>
              </div>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${col.badgeBg} ${col.badgeText} border ${col.borderColor} shrink-0`}>
                {columnCompanies.length}
              </span>
            </div>

            {/* Droppable Area Container */}
            <div className="flex-1 flex flex-col gap-3 overflow-y-auto max-h-[75vh] pr-1 scrollbar-thin">
              {columnCompanies.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-[#D8D5CE] dark:border-[#344658] rounded-xl py-10 px-3 text-center bg-white/40 dark:bg-[#182536]/30">
                  <AlertCircle className="h-6 w-6 text-[#899093] dark:text-[#626A6D] mb-1.5 opacity-60" />
                  <p className="text-xs text-[#626A6D] dark:text-[#9AA9B8] font-semibold">No candidates in this stage</p>
                  <p className="text-[10px] text-[#899093] dark:text-[#626A6D] mt-0.5">Drag & drop here to update deal progress</p>
                </div>
              ) : (
                columnCompanies.map(c => {
                  const currentPriority = localPriorities[c.id] || 'HIGH';
                  const founderName = c.enrichmentData?.founderName || c.enrichmentData?.contactPerson || 'Key Executive';

                  return (
                    <div
                      key={c.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, c.id)}
                      className="group bg-white dark:bg-[#182536] border border-[#D8D5CE] dark:border-[#344658] hover:border-[#202A2E] dark:hover:border-[#C5B76A] rounded-xl p-3.5 shadow-xs hover:shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing flex flex-col gap-3"
                    >
                      {/* Top Row: Company Name & Fit score */}
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <h4
                            onClick={() => onView(c.id)}
                            className="font-extrabold text-sm text-[#202A2E] dark:text-[#F1F5F9] group-hover:text-[#A65F3F] dark:group-hover:text-[#C27A56] hover:underline cursor-pointer transition-colors leading-snug line-clamp-1"
                            title={c.name}
                          >
                            {c.name}
                          </h4>
                          <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-[#E3ECE6] text-[#35624A] dark:bg-[#173529] dark:text-[#8FBEA1] shrink-0 border border-[#B7CCBC] dark:border-[#39634D]">
                            {(c.fitScore ?? c.confidenceScore ?? 85).toFixed(0)}%
                          </span>
                        </div>

                        <div className="text-[11px] text-[#626A6D] dark:text-[#9AA9B8] font-semibold mt-1 flex items-center gap-1 truncate">
                          <span>{c.location.split(',')[0]}</span>
                          <span>•</span>
                          <span className="truncate">{c.industry}</span>
                        </div>
                      </div>

                      {/* ─── PRIORITY SELECTOR (HIGH / MEDIUM / LOW) ─── */}
                      <div className="p-2 rounded-lg bg-[#F1EFEA]/80 dark:bg-[#141F2C] border border-[#D8D5CE] dark:border-[#2D4053] flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[9.5px] font-black uppercase tracking-wider text-[#626A6D] dark:text-[#9AA9B8]">
                            Priority Tier
                          </span>
                          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border uppercase tracking-wider ${getPriorityBadgeClass(currentPriority)}`}>
                            {currentPriority} Priority
                          </span>
                        </div>

                        {/* Interactive Toggle Buttons for High / Medium / Low */}
                        <div className="grid grid-cols-3 gap-1 pt-0.5">
                          {(['HIGH', 'MEDIUM', 'LOW'] as PriorityLevel[]).map((p) => {
                            const isActive = currentPriority === p;
                            return (
                              <button
                                key={p}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePriorityChange(c.id, p);
                                }}
                                className={`py-1 text-[10px] font-bold rounded transition-all cursor-pointer border text-center ${
                                  isActive
                                    ? p === 'HIGH'
                                      ? 'bg-[#35624A] text-white border-[#35624A] shadow-xs'
                                      : p === 'MEDIUM'
                                      ? 'bg-[#9A7535] text-white border-[#9A7535] shadow-xs'
                                      : 'bg-[#626A6D] text-white border-[#626A6D] shadow-xs'
                                    : 'bg-white dark:bg-[#182536] text-[#626A6D] dark:text-[#9AA9B8] border-[#D8D5CE] dark:border-[#344658] hover:bg-[#F1EFEA] dark:hover:bg-[#1D2B3A]'
                                }`}
                              >
                                {p}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Financial & Scale Snapshot */}
                      <div className="grid grid-cols-2 gap-2 text-[11px] bg-[#F1EFEA]/50 dark:bg-[#141F2C]/60 p-2 rounded border border-[#E5E2DC] dark:border-[#263544]">
                        <div>
                          <span className="text-[9.5px] text-[#899093] dark:text-[#9AA9B8] font-bold uppercase block">Revenue</span>
                          <span className="font-extrabold text-[#202A2E] dark:text-[#F1F5F9] truncate block mt-0.5">{c.revenueRange}</span>
                        </div>
                        <div>
                          <span className="text-[9.5px] text-[#899093] dark:text-[#9AA9B8] font-bold uppercase block">Employees</span>
                          <span className="font-extrabold text-[#202A2E] dark:text-[#F1F5F9] truncate block mt-0.5">{c.employeeRange}</span>
                        </div>
                      </div>

                      {/* Founder / Key Contact */}
                      <div className="text-[11px] text-[#626A6D] dark:text-[#9AA9B8] truncate flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-[#899093] dark:text-[#9AA9B8] shrink-0" />
                        <span className="truncate font-semibold">{founderName}</span>
                      </div>

                      {/* Card Footer: Quick Advance Stage & View Details */}
                      <div className="flex items-center justify-between gap-1 pt-2 border-t border-[#D8D5CE]/60 dark:border-[#263544] mt-0.5">
                        <button
                          onClick={() => onView(c.id)}
                          className="text-[11px] font-bold text-[#A65F3F] dark:text-[#C27A56] hover:underline cursor-pointer"
                        >
                          View Details
                        </button>

                        {colIndex < PIPELINE_STAGES.length - 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStageChange(c.id, PIPELINE_STAGES[colIndex + 1].id);
                            }}
                            className="flex items-center gap-1 text-[10.5px] font-bold text-[#35624A] dark:text-[#8FBEA1] hover:underline cursor-pointer"
                            title={`Advance to ${PIPELINE_STAGES[colIndex + 1].label}`}
                          >
                            <span>Advance</span>
                            <ChevronRight className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CompanyKanban;
