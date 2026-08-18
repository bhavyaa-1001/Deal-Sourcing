import React from 'react';
import type { Company } from '../../types';
import Card from '../ui/Card';
import { Database } from 'lucide-react';
import Button from '../ui/Button';

interface CompanyCardProps {
  company: Company;
  onView: () => void;
}

const getFitCategory = (score: number, levelText?: string) => {
  if (score >= 80 || levelText?.includes('HIGH')) {
    return { label: 'High', style: 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800' };
  }
  if (score >= 50 || levelText?.includes('MEDIUM')) {
    return { label: 'Medium', style: 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800' };
  }
  return { label: 'Low', style: 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800' };
};

export const CompanyCard: React.FC<CompanyCardProps> = ({ company, onView }) => {
  const fitScore = company.fitScore ?? (company.fitLevel === 'HIGH FIT' ? 90 : company.fitLevel === 'MEDIUM FIT' ? 70 : 40);
  const fitCategory = getFitCategory(fitScore, company.fitLevel);
  const confidenceScore = company.confidenceScore ?? 80;

  return (
    <Card className="text-left flex flex-col gap-4 border border-default bg-card rounded shadow-none p-5">
      {/* 1. Header: Name, Match & Fit Level */}
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

        {/* Fit Rate & Confidence */}
        <div className="shrink-0 flex flex-col items-end gap-1">
          <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-md border ${fitCategory.style}`}>
            <span>{fitScore.toFixed(0)}%</span>
            <span className="font-semibold">({fitCategory.label})</span>
          </span>

          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5 block text-right">
            Confidence: {confidenceScore.toFixed(0)}%
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
