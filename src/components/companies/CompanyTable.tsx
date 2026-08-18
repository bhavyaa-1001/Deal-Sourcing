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
    return { label: 'High', style: 'text-[#53666F] dark:text-[#A4BCC7] bg-[#E8EEEF] dark:bg-[#203038] border-[#758A93]/50 dark:border-[#758A93]' };
  }
  if (score >= 50 || levelText?.includes('MEDIUM')) {
    return { label: 'Medium', style: 'text-[#997017] dark:text-[#E8C062] bg-[#FDF7E8] dark:bg-[#332B18] border-[#E9B63B]/40 dark:border-[#6E5A2A]' };
  }
  return { label: 'Low', style: 'text-[#C66E52] dark:text-[#E2937C] bg-[#F9ECE8] dark:bg-[#34201B] border-[#F0D5CD] dark:border-[#5E3226]' };
};

export const CompanyTable: React.FC<CompanyTableProps> = ({ companies, onView }) => {
  return (
    <div className="w-full overflow-x-auto rounded-lg border border-[#DED9D0] dark:border-[#2E3D47] shadow-xs bg-white dark:bg-[#1D272E]">
      <table className="w-full border-collapse text-left text-sm md:text-base">
        <thead>
          <tr className="bg-[#F8F6F1] dark:bg-[#172025] border-b border-[#DED9D0] dark:border-[#2E3D47] text-[#5F6B72] dark:text-[#A4B2BA] font-bold text-xs uppercase tracking-wider">
            <th className="px-5 py-3.5">Company Name</th>
            <th className="px-5 py-3.5">Location</th>
            <th className="px-5 py-3.5">Industry</th>
            <th className="px-5 py-3.5">Fit Rate</th>
            <th className="px-5 py-3.5">Revenue</th>
            <th className="px-5 py-3.5">Employees</th>
            <th className="px-5 py-3.5">Confidence</th>
            <th className="px-5 py-3.5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#DED9D0] dark:divide-[#2E3D47] text-[#202A30] dark:text-[#F4F6F8]">
          {companies.map(company => {
            const fitScore = company.fitScore ?? (company.fitLevel === 'HIGH FIT' ? 90 : company.fitLevel === 'MEDIUM FIT' ? 70 : 40);
            const fitCategory = getFitCategory(fitScore, company.fitLevel);
            const confidenceScore = company.confidenceScore ?? 80;

            return (
              <tr
                key={company.id}
                className="hover:bg-[#F8F6F1]/60 dark:hover:bg-[#243038]/50 transition-colors duration-150"
              >
                {/* Name & Website */}
                <td className="px-5 py-4 font-bold">
                  <div className="flex flex-col">
                    <span
                      onClick={() => onView(company.id)}
                      className="text-[#202A30] dark:text-[#F4F6F8] text-base hover:text-[#758A93] hover:underline cursor-pointer"
                    >
                      {company.name}
                    </span>
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-[#5F6B72] dark:text-[#A4B2BA] hover:text-[#202A30] dark:hover:text-white flex items-center gap-1.5 mt-0.5"
                    >
                      {company.website.replace('https://www.', '')}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </td>

                {/* Location */}
                <td className="px-5 py-4 text-[#5F6B72] dark:text-[#A4B2BA] font-semibold text-sm">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-[#7D8589] shrink-0" />
                    <span>{company.location}</span>
                  </span>
                </td>

                {/* Industry */}
                <td className="px-5 py-4 text-[#5F6B72] dark:text-[#A4B2BA] text-sm font-semibold">
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
                <td className="px-5 py-4 font-bold text-[#202A30] dark:text-[#F4F6F8] text-sm">
                  {company.revenueRange}
                </td>

                {/* Employees */}
                <td className="px-5 py-4 text-[#5F6B72] dark:text-[#A4B2BA] font-semibold text-sm">
                  {company.employeeRange}
                </td>

                {/* Confidence */}
                <td className="px-5 py-4">
                  <span className="text-sm font-bold text-[#5F6B72] dark:text-[#A4B2BA]">
                    {confidenceScore.toFixed(0)}%
                  </span>
                </td>

                {/* Actions */}
                <td className="px-5 py-4 text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onView(company.id)}
                    className="px-3 min-h-0 py-1.5 text-xs font-bold border-[#DED9D0]"
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
