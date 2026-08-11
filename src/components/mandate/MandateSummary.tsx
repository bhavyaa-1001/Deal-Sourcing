import React from 'react';
import type { Mandate } from '../../types';
import Badge from '../ui/Badge';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface MandateSummaryProps {
  mandate: Mandate;
}

export const MandateSummary: React.FC<MandateSummaryProps> = ({ mandate }) => {
  const getFieldStatus = (val: any) => {
    if (!val || val === 'Not specified' || val === '' || (typeof val === 'object' && val.min === 0)) {
      return { text: 'Not specified', variant: 'neutral' as const };
    }
    if (mandate.status === 'Approved') {
      return { text: 'Confirmed', variant: 'success' as const };
    }
    return { text: 'Needs review', variant: 'warning' as const };
  };

  const getBadgeIcon = (statusText: string) => {
    if (statusText === 'Confirmed') {
      return <CheckCircle2 className="h-4 w-4 mr-1 text-brand-success" />;
    }
    if (statusText === 'Needs review') {
      return <AlertCircle className="h-4 w-4 mr-1 text-brand-warning" />;
    }
    return null;
  };

  const indStatus = getFieldStatus(mandate.targetIndustry);
  const geoStatus = getFieldStatus(mandate.geography);
  const sizeStatus = getFieldStatus(mandate.employeeRange.label);
  const revStatus = getFieldStatus(mandate.revenueRange.label);
  const ownStatus = getFieldStatus(mandate.ownershipPreference);
  const succStatus = getFieldStatus(mandate.successionPreference);

  return (
    <div className="bg-card border border-default rounded-lg p-6 shadow-premium h-full flex flex-col gap-6">
      <div>
        <h3 className="text-lg font-bold text-primary flex items-center gap-2">
          Structured Mandate Summary
        </h3>
        <p className="text-sm text-secondary mt-1">
          Live interpretation of your requirements.
        </p>
      </div>

      <div className="flex-1 flex flex-col gap-4">
        {/* Item: Industry */}
        <div className="flex justify-between items-start border-b border-default pb-3.5">
          <div className="flex flex-col text-left">
            <span className="text-sm font-semibold text-secondary">Target Industry</span>
            <span className="text-base font-bold text-primary mt-1">
              {mandate.targetIndustry || 'Not specified'}
            </span>
          </div>
          <Badge variant={indStatus.variant} className="flex items-center">
            {getBadgeIcon(indStatus.text)}
            {indStatus.text}
          </Badge>
        </div>

        {/* Item: Geography */}
        <div className="flex justify-between items-start border-b border-default pb-3.5">
          <div className="flex flex-col text-left">
            <span className="text-sm font-semibold text-secondary">Geography</span>
            <span className="text-base font-bold text-primary mt-1">
              {mandate.geography || 'Not specified'}
            </span>
          </div>
          <Badge variant={geoStatus.variant} className="flex items-center">
            {getBadgeIcon(geoStatus.text)}
            {geoStatus.text}
          </Badge>
        </div>

        {/* Item: Revenue */}
        <div className="flex justify-between items-start border-b border-default pb-3.5">
          <div className="flex flex-col text-left">
            <span className="text-sm font-semibold text-secondary">Revenue Range</span>
            <span className="text-base font-bold text-primary mt-1">
              {mandate.revenueRange.label || 'Not specified'}
            </span>
          </div>
          <Badge variant={revStatus.variant} className="flex items-center">
            {getBadgeIcon(revStatus.text)}
            {revStatus.text}
          </Badge>
        </div>

        {/* Item: Size */}
        <div className="flex justify-between items-start border-b border-default pb-3.5">
          <div className="flex flex-col text-left">
            <span className="text-sm font-semibold text-secondary">Company Size</span>
            <span className="text-base font-bold text-primary mt-1">
              {mandate.employeeRange.label || 'Not specified'}
            </span>
          </div>
          <Badge variant={sizeStatus.variant} className="flex items-center">
            {getBadgeIcon(sizeStatus.text)}
            {sizeStatus.text}
          </Badge>
        </div>

        {/* Item: Ownership */}
        <div className="flex justify-between items-start border-b border-default pb-3.5">
          <div className="flex flex-col text-left">
            <span className="text-sm font-semibold text-secondary">Ownership</span>
            <span className="text-base font-bold text-primary mt-1">
              {mandate.ownershipPreference || 'Not specified'}
            </span>
          </div>
          <Badge variant={ownStatus.variant} className="flex items-center">
            {getBadgeIcon(ownStatus.text)}
            {ownStatus.text}
          </Badge>
        </div>

        {/* Item: Succession */}
        <div className="flex justify-between items-start pb-2">
          <div className="flex flex-col text-left">
            <span className="text-sm font-semibold text-secondary">Succession Preference</span>
            <span className="text-base font-bold text-primary mt-1 line-clamp-2">
              {mandate.successionPreference || 'Not specified'}
            </span>
          </div>
          <Badge variant={succStatus.variant} className="flex items-center">
            {getBadgeIcon(succStatus.text)}
            {succStatus.text}
          </Badge>
        </div>
      </div>

      <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-md border border-default text-left">
        <span className="text-xs font-bold uppercase tracking-wider text-secondary">
          Mandate Status
        </span>
        <div className="flex items-center gap-2 mt-1.5">
          <span className={`h-3.5 w-3.5 rounded-full ${mandate.status === 'Approved' ? 'bg-brand-success' : 'bg-brand-warning animate-pulse'}`} />
          <span className="text-base font-bold text-primary">
            {mandate.status === 'Approved' ? 'Mandate Approved' : 'Drafting Requirements'}
          </span>
        </div>
      </div>
    </div>
  );
};
export default MandateSummary;
