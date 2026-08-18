import React from 'react';
import type { Company } from '../../types';
import Button from '../ui/Button';
import { MapPin, ExternalLink } from 'lucide-react';

interface CompanyTableProps {
  companies: Company[];
  onView: (id: string) => void;
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

export const CompanyTable: React.FC<CompanyTableProps> = ({ companies, onView }) => {
  return (
    <div className="w-full overflow-x-auto rounded-lg border border-default shadow-sm bg-card">
      <table className="w-full border-collapse text-left text-base">
        <thead>
          <tr className="bg-slate-50/70 dark:bg-slate-900/60 border-b border-default text-primary font-bold text-sm uppercase tracking-wider">
            <th className="px-5 py-4">Company Name</th>
            <th className="px-5 py-4">Location</th>
            <th className="px-5 py-4">Industry</th>
            <th className="px-5 py-4">Fit Rate</th>
            <th className="px-5 py-4">Revenue</th>
            <th className="px-5 py-4">Employees</th>
            <th className="px-5 py-4">Confidence</th>
            <th className="px-5 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-default text-primary">
          {companies.map(company => {
            const fitScore = company.fitScore ?? (company.fitLevel === 'HIGH FIT' ? 90 : company.fitLevel === 'MEDIUM FIT' ? 70 : 40);
            const fitCategory = getFitCategory(fitScore, company.fitLevel);
            const confidenceScore = company.confidenceScore ?? 80;

            return (
              <tr
                key={company.id}
                className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors duration-150"
              >
                {/* Name & Website */}
                <td className="px-5 py-4 font-bold">
                  <div className="flex flex-col">
                    <span
                      onClick={() => onView(company.id)}
                      className="text-primary text-base hover:text-brand-primary hover:underline cursor-pointer"
                    >
                      {company.name}
                    </span>
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-brand-primary hover:underline flex items-center gap-1.5 mt-1"
                    >
                      {company.website.replace('https://www.', '')}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </td>

                {/* Location */}
                <td className="px-5 py-4 text-secondary font-semibold text-sm">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                    <span>{company.location}</span>
                  </span>
                </td>

                {/* Industry */}
                <td className="px-5 py-4 text-secondary text-sm font-semibold">
                  {company.industry}
                </td>

                {/* Fit Rate (Percentage with level in bracket) */}
                <td className="px-5 py-4">
                  <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-md border ${fitCategory.style}`}>
                    <span>{fitScore.toFixed(0)}%</span>
                    <span className="font-semibold">({fitCategory.label})</span>
                  </span>
                </td>

                {/* Revenue */}
                <td className="px-5 py-4 font-bold text-slate-800 dark:text-slate-200 text-sm">
                  {company.revenueRange}
                </td>

                {/* Employees */}
                <td className="px-5 py-4 text-secondary font-semibold text-sm">
                  {company.employeeRange}
                </td>

                {/* Confidence */}
                <td className="px-5 py-4">
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    {confidenceScore.toFixed(0)}%
                  </span>
                </td>

                {/* Actions */}
                <td className="px-5 py-4 text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onView(company.id)}
                    className="px-3 min-h-0 py-1.5 text-xs font-bold"
                  >
                    View
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default CompanyTable;
