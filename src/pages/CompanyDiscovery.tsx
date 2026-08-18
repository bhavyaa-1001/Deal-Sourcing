import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCompanies } from '../hooks/useCompanies';
import CompanyFilters from '../components/companies/CompanyFilters';
import CompanyCard from '../components/companies/CompanyCard';
import CompanyTable from '../components/companies/CompanyTable';
import CompanyDetails from '../components/companies/CompanyDetails';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import LoadingState from '../components/ui/LoadingState';
import { LayoutGrid, Table, ArrowLeft, ArrowRight, Database, Target, Award } from 'lucide-react';

export const CompanyDiscovery: React.FC = () => {
  const navigate = useNavigate();
  const {
    companies,
    loading,
    error,
    filters,
    uniqueOptions,
    updateFilters,
    clearFilters,
  } = useCompanies();

  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);

  const handleBack = () => navigate('/mandate');
  const handleContinue = () => navigate('/review');

  const displayCompanies = companies;
  const activeCompany = displayCompanies.find(c => c.id === selectedCompanyId) || null;

  // Lead Modal navigation callbacks
  const activeIndex = selectedCompanyId ? displayCompanies.findIndex(c => c.id === selectedCompanyId) : -1;
  const onPrevious = activeIndex > 0 ? () => setSelectedCompanyId(displayCompanies[activeIndex - 1].id) : undefined;
  const onNext = activeIndex >= 0 && activeIndex < displayCompanies.length - 1 ? () => setSelectedCompanyId(displayCompanies[activeIndex + 1].id) : undefined;

  if (loading && companies.length === 0) {
    return <LoadingState message="Discovering candidate companies matching mandate..." />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-md text-left">
        <p className="font-bold">Error discovering companies</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Title & Description */}
      <div className="text-left flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-primary tracking-tight">
            Discover Companies
          </h2>
          <p className="text-lg text-secondary mt-2">
            Explore companies matching your acquisition mandate. Select companies for deeper evaluation in Enrich Leads.
          </p>
        </div>

        {/* Toggle Grid/Table view (Table on left, Cards on right) */}
        <div className="flex bg-[#F1F5F9] dark:bg-[#1E293B] p-1 rounded-lg border border-[#E2E8F0] dark:border-[#334155] self-start md:self-auto select-none">
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-bold rounded-md cursor-pointer transition-all ${viewMode === 'table' ? 'bg-white text-[#0F172A] dark:bg-[#0F172A] dark:text-white shadow-xs border border-[#E2E8F0] dark:border-[#475569]' : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white'}`}
            aria-label="Table view mode"
          >
            <Table className="h-4 w-4" />
            <span>Table</span>
          </button>
          <button
            onClick={() => setViewMode('cards')}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-bold rounded-md cursor-pointer transition-all ${viewMode === 'cards' ? 'bg-white text-[#0F172A] dark:bg-[#0F172A] dark:text-white shadow-xs border border-[#E2E8F0] dark:border-[#475569]' : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white'}`}
            aria-label="Cards view mode"
          >
            <LayoutGrid className="h-4 w-4" />
            <span>Cards</span>
          </button>
        </div>
      </div>

      {/* 1. Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
        <Card className="flex justify-between items-start p-5 border border-default bg-card rounded shadow-none">
          <div className="flex flex-col gap-1.5 min-w-0 flex-1 pr-2">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Discovered Targets</span>
            <span className="text-3xl font-bold text-primary block my-0.5">148</span>
            <span className="text-xs text-secondary block leading-normal">Companies identified through research sources</span>
          </div>
          <div className="p-2 bg-slate-50 dark:bg-slate-900 border border-default rounded text-slate-500 dark:text-slate-400 shrink-0">
            <Database className="h-4.5 w-4.5" />
          </div>
        </Card>

        <Card className="flex justify-between items-start p-5 border border-default bg-card rounded shadow-none">
          <div className="flex flex-col gap-1.5 min-w-0 flex-1 pr-2">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Potential Fits</span>
            <span className="text-3xl font-bold text-primary block my-0.5">42</span>
            <span className="text-xs text-secondary block leading-normal">Candidates matching initial criteria</span>
          </div>
          <div className="p-2 bg-slate-50 dark:bg-slate-900 border border-default rounded text-slate-500 dark:text-slate-400 shrink-0">
            <Target className="h-4.5 w-4.5" />
          </div>
        </Card>

        <Card className="flex justify-between items-start p-5 border border-default bg-card rounded shadow-none">
          <div className="flex flex-col gap-1.5 min-w-0 flex-1 pr-2">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">High Alignment</span>
            <span className="text-3xl font-bold text-primary block my-0.5">{companies.filter(c => c.fitLevel === 'HIGH FIT').length}</span>
            <span className="text-xs text-secondary block leading-normal">Strong acquisition alignment targets</span>
          </div>
          <div className="p-2 bg-slate-50 dark:bg-slate-900 border border-default rounded text-slate-500 dark:text-slate-400 shrink-0">
            <Award className="h-4.5 w-4.5" />
          </div>
        </Card>
      </div>

      {/* 2. Search & Filters Panel */}
      <CompanyFilters
        filters={filters}
        updateFilters={updateFilters}
        clearFilters={clearFilters}
        uniqueOptions={uniqueOptions}
      />

      {/* 3. Company Listing Section */}
      {displayCompanies.length === 0 ? (
        <EmptyState
          title="No companies found"
          description="We couldn't find any target companies matching your current filters. Try relaxing your constraints, clearing filters, or widening the revenue ranges."
          actionText="Clear Filters"
          onAction={clearFilters}
        />
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayCompanies.map(company => (
            <CompanyCard
              key={company.id}
              company={company}
              onView={() => setSelectedCompanyId(company.id)}
            />
          ))}
        </div>
      ) : (
        <CompanyTable
          companies={displayCompanies}
          onView={(id) => setSelectedCompanyId(id)}
        />
      )}

      {/* 4. Company Detail Modal */}
      <CompanyDetails
        company={activeCompany}
        isOpen={selectedCompanyId !== null}
        onClose={() => setSelectedCompanyId(null)}
        onPrevious={onPrevious}
        onNext={onNext}
      />

      {/* Sticky Page Actions Footer */}
      <div className="sticky bottom-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-default py-4.5 px-6 -mx-6 -mb-6 flex items-center justify-between z-25 shadow-[0_-8px_30px_rgba(0,0,0,0.04)] mt-6 rounded-b">
        <Button
          variant="outline"
          onClick={handleBack}
          leftIcon={<ArrowLeft className="h-5 w-5" />}
          className="min-w-[120px]"
        >
          Back
        </Button>

        <Button
          variant="primary"
          onClick={handleContinue}
          rightIcon={<ArrowRight className="h-5 w-5" />}
          className="min-w-[220px]"
          id="continue-to-review-btn"
        >
          Continue to Enrich Leads
        </Button>
      </div>
    </div>
  );
};
export default CompanyDiscovery;
