import React, { useState } from 'react';
import type { Company } from '../../types';
import Button from '../ui/Button';
import { MapPin, ExternalLink } from 'lucide-react';

interface CompanyTableProps {
  companies: Company[];
  onView: (id: string) => void;
}

export const CompanyTable: React.FC<CompanyTableProps> = ({ companies, onView }) => {
  const [userFitLevels, setUserFitLevels] = useState<Record<string, 'HIGH' | 'MEDIUM' | 'LOW'>>(() => {
    const saved = localStorage.getItem('dealsourcing_user_fit_levels');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return {
      'comp-1': 'HIGH',
      'comp-2': 'HIGH',
      'comp-3': 'HIGH',
      'comp-4': 'MEDIUM',
      'comp-5': 'MEDIUM',
      'comp-6': 'LOW',
    };
  });

  const handleSetFitLevel = (companyId: string, level: 'HIGH' | 'MEDIUM' | 'LOW') => {
    const next = { ...userFitLevels, [companyId]: level };
    setUserFitLevels(next);
    localStorage.setItem('dealsourcing_user_fit_levels', JSON.stringify(next));
  };

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-default shadow-sm bg-card">
      <table className="w-full border-collapse text-left text-base">
        <thead>
          <tr className="bg-slate-50/70 dark:bg-slate-900/60 border-b border-default text-primary font-bold text-sm uppercase tracking-wider">
            <th className="px-5 py-4">Company Name</th>
            <th className="px-5 py-4">Location</th>
            <th className="px-5 py-4">Industry</th>
            <th className="px-5 py-4">Fit Level (User Decision)</th>
            <th className="px-5 py-4">Confidence</th>
            <th className="px-5 py-4">Revenue</th>
            <th className="px-5 py-4">Employees</th>
            <th className="px-5 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-default text-primary">
          {companies.map(company => {
            const currentFit = userFitLevels[company.id] || (company.fitLevel === 'HIGH FIT' ? 'HIGH' : company.fitLevel === 'MEDIUM FIT' ? 'MEDIUM' : 'LOW');

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

                {/* User Decided Fit Level Selector */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/90 p-1 rounded-lg border border-default select-none w-fit">
                    {(['HIGH', 'MEDIUM', 'LOW'] as const).map(level => {
                      const isSelected = currentFit === level;
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
                          onClick={() => handleSetFitLevel(company.id, level)}
                          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase transition-all cursor-pointer ${
                            isSelected
                              ? activeClass
                              : 'text-secondary hover:text-primary hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
                          }`}
                          title={`Mark ${company.name} as ${level} Fit`}
                        >
                          {level}
                        </button>
                      );
                    })}
                  </div>
                </td>

                {/* Confidence */}
                <td className="px-5 py-4">
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-350">
                    {(company.confidenceScore ?? 0).toFixed(1)}%
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
