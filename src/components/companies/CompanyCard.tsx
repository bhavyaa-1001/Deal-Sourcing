import React from 'react';
import type { Company } from '../../types';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { MapPin, Briefcase, Database, Plus, Check } from 'lucide-react';
import Button from '../ui/Button';

interface CompanyCardProps {
  company: Company;
  isShortlisted: boolean;
  onView: () => void;
  onToggleShortlist: () => void;
}

export const CompanyCard: React.FC<CompanyCardProps> = ({
  company,
  isShortlisted,
  onView,
  onToggleShortlist
}) => {
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

  return (
    <Card hoverable className="text-left flex flex-col gap-5 border border-default">
      {/* 1. Header: Name & Fit */}
      <div className="flex justify-between items-start gap-4">
        <div>
          <h3 className="text-xl font-bold text-primary tracking-tight leading-snug">
            {company.name}
          </h3>
          <div className="flex flex-wrap items-center gap-2 mt-1 text-base text-secondary font-semibold">
            <span className="flex items-center gap-1">
              <MapPin className="h-4.5 w-4.5" />
              {company.location}
            </span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span className="flex items-center gap-1">
              <Briefcase className="h-4.5 w-4.5" />
              {company.industry}
            </span>
          </div>
        </div>
        <div className="shrink-0 flex flex-col items-end gap-1.5">
          {getFitBadge(company.fitLevel)}
          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
            {company.confidenceScore}% Match
          </span>
        </div>
      </div>

      {/* 2. Structured Metrics Block */}
      <div className="grid grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-900/30 p-4 rounded-md border border-default">
        <div>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-450 uppercase tracking-wider block">Revenue</span>
          <span className="text-lg font-extrabold text-primary block mt-1">
            {company.revenueRange}
          </span>
        </div>
        <div>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-450 uppercase tracking-wider block">Employees</span>
          <span className="text-lg font-extrabold text-primary block mt-1">
            {company.employeeRange}
          </span>
        </div>
        <div>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-450 uppercase tracking-wider block">Ownership</span>
          <span className="text-lg font-extrabold text-primary block mt-1 truncate">
            {company.ownership.replace(' (Founder Owned)', '')}
          </span>
        </div>
      </div>

      {/* 3. Fit Description Rationale */}
      <div className="flex-1 text-base text-primary border-l-2 border-slate-200 dark:border-slate-700 pl-3">
        <span className="font-bold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
          Acquisition Alignment
        </span>
        <p className="text-secondary leading-relaxed line-clamp-3">
          {company.whyItMatches}
        </p>
      </div>

      {/* 4. Footer info */}
      <div className="flex items-center gap-1.5 text-sm text-secondary border-t border-default pt-3">
        <Database className="h-4 w-4 shrink-0 text-slate-400" />
        <span className="truncate">Source: {company.sourceName}</span>
      </div>

      {/* 5. CTA Action Buttons */}
      <div className="grid grid-cols-2 gap-3 mt-1">
        <Button
          variant="outline"
          size="md"
          onClick={onView}
        >
          View Company
        </Button>
        <Button
          variant={isShortlisted ? 'success' : 'secondary'}
          size="md"
          onClick={onToggleShortlist}
          leftIcon={isShortlisted ? <Check className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
        >
          {isShortlisted ? 'Shortlisted' : 'Add to Shortlist'}
        </Button>
      </div>
    </Card>
  );
};
export default CompanyCard;
