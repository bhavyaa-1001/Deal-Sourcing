import React from 'react';
import type { Company } from '../../types';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { MapPin, ExternalLink } from 'lucide-react';

interface CompanyTableProps {
  companies: Company[];
  onView: (id: string) => void;
}

export const CompanyTable: React.FC<CompanyTableProps> = ({ companies, onView }) => {
  const getFitBadge = (fit: Company['fitLevel']) => {
    switch (fit) {
      case 'HIGH FIT':
        return <Badge variant="success">HIGH</Badge>;
      case 'MEDIUM FIT':
        return <Badge variant="warning">MEDIUM</Badge>;
      case 'LOW FIT':
        return <Badge variant="danger">LOW</Badge>;
      default:
        return <Badge variant="neutral">{fit}</Badge>;
    }
  };

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-default shadow-sm bg-card">
      <table className="w-full border-collapse text-left text-base">
        <thead>
          <tr className="bg-slate-50/70 dark:bg-slate-900/60 border-b border-default text-primary font-bold text-sm uppercase tracking-wider">
            <th className="px-6 py-4.5">Company Name</th>
            <th className="px-6 py-4.5">Location</th>
            <th className="px-6 py-4.5">Industry</th>
            <th className="px-6 py-4.5">Fit</th>
            <th className="px-6 py-4.5">Fit Level</th>
            <th className="px-6 py-4.5">Confidence</th>
            <th className="px-6 py-4.5">Revenue</th>
            <th className="px-6 py-4.5">Employees</th>
            <th className="px-6 py-4.5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-default text-primary">
          {companies.map(company => (
            <tr
              key={company.id}
              className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors duration-150"
            >
              {/* Name & Website */}
              <td className="px-6 py-5 font-bold">
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
              <td className="px-6 py-5 text-secondary font-semibold">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  {company.location}
                </span>
              </td>

              {/* Industry */}
              <td className="px-6 py-5 text-secondary">
                {company.industry}
              </td>

              {/* Fit (float) */}
              <td className="px-6 py-5 font-bold text-slate-700 dark:text-slate-350">
                {company.fitScore !== undefined ? company.fitScore.toFixed(1) : '0.0'}
              </td>

              {/* Fit Level */}
              <td className="px-6 py-5">
                {getFitBadge(company.fitLevel)}
              </td>

              {/* Confidence */}
              <td className="px-6 py-5">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-350">
                  {(company.confidenceScore ?? 0).toFixed(1)}%
                </span>
              </td>

              {/* Revenue */}
              <td className="px-6 py-5 font-bold text-slate-800 dark:text-slate-200">
                {company.revenueRange}
              </td>

              {/* Employees */}
              <td className="px-6 py-5 text-secondary font-semibold">
                {company.employeeRange}
              </td>

              {/* Actions */}
              <td className="px-6 py-5 text-right">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onView(company.id)}
                  className="px-3 min-h-0 py-1.5 text-sm"
                >
                  View
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default CompanyTable;

