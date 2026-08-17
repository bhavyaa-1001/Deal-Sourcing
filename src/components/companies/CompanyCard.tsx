import React, { useState } from 'react';
import type { Company } from '../../types';
import Card from '../ui/Card';
import { Database } from 'lucide-react';
import Button from '../ui/Button';

interface CompanyCardProps {
  company: Company;
  onView: () => void;
}

export const CompanyCard: React.FC<CompanyCardProps> = ({ company, onView }) => {
  const [fitLevel, setFitLevel] = useState<'HIGH' | 'MEDIUM' | 'LOW'>(() => {
    const saved = localStorage.getItem('dealsourcing_user_fit_levels');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed[company.id]) return parsed[company.id];
      } catch { /* ignore */ }
    }
    return company.fitLevel === 'HIGH FIT' ? 'HIGH' : company.fitLevel === 'MEDIUM FIT' ? 'MEDIUM' : 'LOW';
  });

  const handleSetFitLevel = (level: 'HIGH' | 'MEDIUM' | 'LOW') => {
    setFitLevel(level);
    let savedObj: Record<string, string> = {};
    const saved = localStorage.getItem('dealsourcing_user_fit_levels');
    if (saved) {
      try { savedObj = JSON.parse(saved); } catch { /* ignore */ }
    }
    savedObj[company.id] = level;
    localStorage.setItem('dealsourcing_user_fit_levels', JSON.stringify(savedObj));
  };

  return (
    <Card className="text-left flex flex-col gap-4 border border-default bg-card rounded shadow-none p-5">
      {/* 1. Header: Name, Match & User-decided Fit Level */}
      <div className="flex justify-between items-start gap-4">
        <div className="min-w-0">
          <h3
            onClick={onView}
            className="text-xl font-bold text-primary hover:text-brand-primary hover:underline cursor-pointer tracking-tight leading-tight block truncate"
          >
            {company.name}
          </h3>
          <div className="text-sm text-secondary mt-1.5 font-semibold flex items-center gap-1.5">
            <span>{company.location}</span>
            <span>•</span>
            <span>{company.industry}</span>
          </div>
        </div>

        {/* User Fit Level Toggle */}
        <div className="shrink-0 flex flex-col items-end gap-1.5">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/90 p-1 rounded-lg border border-default select-none">
            {(['HIGH', 'MEDIUM', 'LOW'] as const).map(level => {
              const isSelected = fitLevel === level;
              const activeClass =
                level === 'HIGH'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : level === 'MEDIUM'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-rose-600 text-white shadow-xs';

              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => handleSetFitLevel(level)}
                  className={`px-2 py-0.5 rounded text-[10px] font-black uppercase transition-all cursor-pointer ${
                    isSelected
                      ? activeClass
                      : 'text-secondary hover:text-primary hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
                  }`}
                  title={`Mark as ${level} Fit`}
                >
                  {level}
                </button>
              );
            })}
          </div>

          <span className="text-xs font-bold text-[#9A8056] mt-0.5 block text-right">
            {(company.confidenceScore ?? 0).toFixed(1)}% Match
          </span>
        </div>
      </div>

      <div className="border-t border-default/70 my-1" />

      {/* 2. Structured Metrics Block */}
      <div className="grid grid-cols-3 gap-3 text-sm">
        <div>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Revenue</span>
          <span className="text-base font-bold text-primary block mt-0.5">
            {company.revenueRange}
          </span>
        </div>
        <div>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Employees</span>
          <span className="text-base font-bold text-primary block mt-0.5">
            {company.employeeRange}
          </span>
        </div>
        <div>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Ownership</span>
          <span className="text-base font-bold text-primary block mt-0.5 truncate">
            {company.ownership.replace(' (Founder Owned)', '')}
          </span>
        </div>
      </div>

      <div className="border-t border-default/70 my-1" />

      {/* 3. Fit Description Rationale */}
      <div className="flex-1 text-sm">
        <span className="font-bold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
          Acquisition Alignment
        </span>
        <p className="text-base text-secondary leading-relaxed line-clamp-3">
          {company.whyItMatches}
        </p>
      </div>

      {/* 4. Footer info */}
      <div className="flex items-center gap-1.5 text-sm text-slate-500 border-t border-default/60 pt-2.5">
        <Database className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">Source: {company.sourceName}</span>
      </div>

      {/* 5. CTA Action Button */}
      <div className="mt-1">
        <Button
          variant="outline"
          className="w-full"
          onClick={onView}
        >
          View Company Dossier
        </Button>
      </div>
    </Card>
  );
};

export default CompanyCard;
