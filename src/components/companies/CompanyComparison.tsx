import React from 'react';
import type { Company } from '../../types';
import Badge from '../ui/Badge';
import { Star } from 'lucide-react';

interface CompanyComparisonProps {
  companies: Company[];
}

export const CompanyComparison: React.FC<CompanyComparisonProps> = ({
  companies
}) => {
  if (companies.length === 0) return null;

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

  // Find the highest confidence score to highlight
  const maxConfidence = Math.max(...companies.map(c => c.confidenceScore));

  return (
    <div className="flex flex-col gap-6 text-left">
      <div>
        <h3 className="text-xl font-bold text-primary">Side-by-Side Target Comparison</h3>
        <p className="text-base text-secondary mt-1">
          Comparing {companies.length} selected acquisition candidates. Highlighted values indicate the strongest matches.
        </p>
      </div>

      <div className="w-full overflow-x-auto rounded-lg border border-default bg-card shadow-premium-lg">
        <table className="w-full border-collapse text-left text-base min-w-[700px]">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900 border-b border-default">
              <th className="px-6 py-4 font-bold text-secondary text-sm uppercase tracking-wider w-1/4">
                Comparison Dimension
              </th>
              {companies.map(c => (
                <th key={c.id} className="px-6 py-4 font-black text-primary text-lg border-l border-default w-1/4">
                  {c.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-default text-primary">
            {/* Row: Industry */}
            <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
              <td className="px-6 py-4.5 font-bold text-secondary">Target Industry</td>
              {companies.map(c => (
                <td key={c.id} className="px-6 py-4.5 border-l border-default font-semibold">
                  {c.industry}
                </td>
              ))}
            </tr>

            {/* Row: Location */}
            <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
              <td className="px-6 py-4.5 font-bold text-secondary">Location</td>
              {companies.map(c => (
                <td key={c.id} className="px-6 py-4.5 border-l border-default text-secondary">
                  {c.location}
                </td>
              ))}
            </tr>

            {/* Row: Revenue */}
            <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
              <td className="px-6 py-4.5 font-bold text-secondary">Revenue Range</td>
              {companies.map(c => (
                <td key={c.id} className="px-6 py-4.5 border-l border-default font-bold text-slate-800 dark:text-slate-200">
                  {c.revenueRange}
                </td>
              ))}
            </tr>

            {/* Row: Employees */}
            <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
              <td className="px-6 py-4.5 font-bold text-secondary">Employees</td>
              {companies.map(c => (
                <td key={c.id} className="px-6 py-4.5 border-l border-default font-semibold text-secondary">
                  {c.employeeRange}
                </td>
              ))}
            </tr>

            {/* Row: Ownership */}
            <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
              <td className="px-6 py-4.5 font-bold text-secondary">Ownership Structure</td>
              {companies.map(c => (
                <td key={c.id} className="px-6 py-4.5 border-l border-default font-semibold">
                  {c.ownership}
                </td>
              ))}
            </tr>

            {/* Row: Acquisition Fit */}
            <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
              <td className="px-6 py-4.5 font-bold text-secondary">Acquisition Fit</td>
              {companies.map(c => (
                <td key={c.id} className="px-6 py-4.5 border-l border-default">
                  {getFitBadge(c.fitLevel)}
                </td>
              ))}
            </tr>

            {/* Row: Confidence */}
            <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
              <td className="px-6 py-4.5 font-bold text-secondary">Match Confidence</td>
              {companies.map(c => {
                const isHighest = c.confidenceScore === maxConfidence;
                return (
                  <td
                    key={c.id}
                    className={`px-6 py-4.5 border-l border-default font-bold text-lg
                      ${isHighest ? 'text-brand-success bg-brand-success-light/10 dark:bg-green-950/15' : 'text-brand-primary'}
                    `}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{c.confidenceScore}%</span>
                      {isHighest && <Star className="h-4.5 w-4.5 fill-brand-success" />}
                    </div>
                  </td>
                );
              })}
            </tr>

            {/* Row: Succession Risk */}
            <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
              <td className="px-6 py-4.5 font-bold text-secondary font-sans">Succession Profile</td>
              {companies.map(c => (
                <td key={c.id} className="px-6 py-4.5 border-l border-default text-sm leading-relaxed text-secondary font-semibold">
                  {c.acquisitionFit.successionRisk}
                </td>
              ))}
            </tr>

            {/* Row: Key Products */}
            <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
              <td className="px-6 py-4.5 font-bold text-secondary">Key Products</td>
              {companies.map(c => (
                <td key={c.id} className="px-6 py-4.5 border-l border-default text-sm text-secondary font-semibold">
                  <ul className="list-disc pl-4 space-y-1">
                    {c.businessProfile.keyProducts.slice(0, 3).map(p => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                </td>
              ))}
            </tr>

            {/* Row: Financial Health */}
            <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
              <td className="px-6 py-4.5 font-bold text-secondary">Financial Overview</td>
              {companies.map(c => (
                <td key={c.id} className="px-6 py-4.5 border-l border-default text-base leading-relaxed text-secondary font-semibold">
                  {c.acquisitionFit.financialHealth}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default CompanyComparison;
