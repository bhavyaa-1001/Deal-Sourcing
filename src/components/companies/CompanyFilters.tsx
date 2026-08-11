import React, { useState } from 'react';
import type { CompanyFilter } from '../../types';
import { Search, Filter, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import Button from '../ui/Button';

interface CompanyFiltersProps {
  filters: CompanyFilter;
  updateFilters: (newFilters: Partial<CompanyFilter>) => void;
  clearFilters: () => void;
  uniqueOptions: {
    industries: string[];
    locations: string[];
    ownerships: string[];
  };
}

export const CompanyFilters: React.FC<CompanyFiltersProps> = ({
  filters,
  updateFilters,
  clearFilters,
  uniqueOptions
}) => {
  const [showAllFilters, setShowAllFilters] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFilters({ search: e.target.value });
  };

  const handleSelectChange = (field: keyof CompanyFilter, value: string) => {
    updateFilters({ [field]: value });
  };

  const hasActiveFilters = Object.entries(filters).some(
    ([key, val]) => key !== 'search' && val !== ''
  );

  return (
    <div className="w-full flex flex-col gap-4 bg-card border border-default rounded-lg p-5 shadow-premium text-left">
      {/* 1. Main Search & Core Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full md:flex-1">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-secondary">
            <Search className="h-5 w-5" />
          </span>
          <input
            type="text"
            value={filters.search}
            onChange={handleSearchChange}
            placeholder="Search companies by name, activity, location, key terms..."
            className="w-full pl-10 pr-4 py-3 text-base rounded border border-default bg-card text-primary focus-ring focus:border-brand-primary transition-all duration-200 min-h-[46px]"
          />
        </div>

        {/* Buttons */}
        <div className="flex w-full md:w-auto gap-3 shrink-0">
          <Button
            variant="outline"
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="flex-1 md:hidden flex items-center justify-center gap-2"
          >
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => setShowAllFilters(!showAllFilters)}
            className="hidden md:flex items-center justify-center gap-2"
          >
            <Filter className="h-5 w-5" />
            <span>{showAllFilters ? 'Less Filters' : 'More Filters'}</span>
            {showAllFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>

          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={clearFilters}
              className="flex items-center justify-center gap-2 border-brand-danger/30 text-brand-danger hover:bg-red-50 dark:hover:bg-red-950/20"
            >
              <RotateCcw className="h-5 w-5" />
              <span>Reset</span>
            </Button>
          )}
        </div>
      </div>

      {/* 2. Collapsible Filters - Desktop (expandable) & Mobile (drawer/accordion) */}
      <div
        className={`
          grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2 border-t border-default pt-4
          ${mobileFiltersOpen ? 'grid' : 'hidden'}
          ${showAllFilters ? 'md:grid' : 'md:hidden'}
        `}
      >
        {/* Industry Filter */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="filter-industry" className="text-sm font-semibold text-secondary">
            Industry
          </label>
          <select
            id="filter-industry"
            value={filters.industry}
            onChange={(e) => handleSelectChange('industry', e.target.value)}
            className="px-3 py-2 text-base rounded border border-default bg-card text-primary focus-ring"
          >
            <option value="">All Industries</option>
            {uniqueOptions.industries.map(ind => (
              <option key={ind} value={ind}>{ind}</option>
            ))}
          </select>
        </div>

        {/* Location Filter */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="filter-location" className="text-sm font-semibold text-secondary">
            Location (State)
          </label>
          <select
            id="filter-location"
            value={filters.location}
            onChange={(e) => handleSelectChange('location', e.target.value)}
            className="px-3 py-2 text-base rounded border border-default bg-card text-primary focus-ring"
          >
            <option value="">All States</option>
            {uniqueOptions.locations.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>

        {/* Revenue Filter */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="filter-revenue" className="text-sm font-semibold text-secondary">
            Revenue Range
          </label>
          <select
            id="filter-revenue"
            value={filters.revenue}
            onChange={(e) => handleSelectChange('revenue', e.target.value)}
            className="px-3 py-2 text-base rounded border border-default bg-card text-primary focus-ring"
          >
            <option value="">Any Revenue</option>
            <option value="$5M – $15M">$5M – $15M</option>
            <option value="$15M – $25M">$15M – $25M</option>
            <option value="$25M – $50M">$25M – $50M</option>
            <option value="$30M – $40M">$30M – $40M</option>
            <option value="$40M – $60M">$40M – $60M</option>
            <option value="$5M – $10M">$5M – $10M</option>
          </select>
        </div>

        {/* Employee Filter */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="filter-employees" className="text-sm font-semibold text-secondary">
            Employees Size
          </label>
          <select
            id="filter-employees"
            value={filters.employees}
            onChange={(e) => handleSelectChange('employees', e.target.value)}
            className="px-3 py-2 text-base rounded border border-default bg-card text-primary focus-ring"
          >
            <option value="">Any Size</option>
            <option value="20 – 35">20 – 35</option>
            <option value="40 – 60">40 – 60</option>
            <option value="50 – 75">50 – 75</option>
            <option value="80 – 120">80 – 120</option>
            <option value="85 – 110">85 – 110</option>
            <option value="110 – 140">110 – 140</option>
          </select>
        </div>

        {/* Ownership Filter */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="filter-ownership" className="text-sm font-semibold text-secondary">
            Ownership Structure
          </label>
          <select
            id="filter-ownership"
            value={filters.ownership}
            onChange={(e) => handleSelectChange('ownership', e.target.value)}
            className="px-3 py-2 text-base rounded border border-default bg-card text-primary focus-ring"
          >
            <option value="">Any Ownership</option>
            {uniqueOptions.ownerships.map(own => (
              <option key={own} value={own}>{own}</option>
            ))}
          </select>
        </div>

        {/* Fit Level Filter */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="filter-fit" className="text-sm font-semibold text-secondary">
            Acquisition Fit
          </label>
          <select
            id="filter-fit"
            value={filters.fitLevel}
            onChange={(e) => handleSelectChange('fitLevel', e.target.value)}
            className="px-3 py-2 text-base rounded border border-default bg-card text-primary focus-ring"
          >
            <option value="">All fits</option>
            <option value="HIGH FIT">HIGH FIT</option>
            <option value="MEDIUM FIT">MEDIUM FIT</option>
            <option value="LOW FIT">LOW FIT</option>
          </select>
        </div>

        {/* Confidence Filter */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="filter-confidence" className="text-sm font-semibold text-secondary">
            Match Confidence
          </label>
          <select
            id="filter-confidence"
            value={filters.confidence}
            onChange={(e) => handleSelectChange('confidence', e.target.value)}
            className="px-3 py-2 text-base rounded border border-default bg-card text-primary focus-ring"
          >
            <option value="">Any Confidence</option>
            <option value="90">90%+ Match</option>
            <option value="80">80%+ Match</option>
            <option value="70">70%+ Match</option>
            <option value="50">50%+ Match</option>
          </select>
        </div>
      </div>
    </div>
  );
};
export default CompanyFilters;
