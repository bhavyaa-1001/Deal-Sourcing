import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCompanies } from '../hooks/useCompanies';
import CompanyFilters from '../components/companies/CompanyFilters';
import CompanyCard from '../components/companies/CompanyCard';
import CompanyTable from '../components/companies/CompanyTable';
import CompanyDetails from '../components/companies/CompanyDetails';
import CompanyKanban from '../components/companies/CompanyKanban';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import LoadingState from '../components/ui/LoadingState';
import { LayoutGrid, Table, Kanban, ArrowLeft, ArrowRight, Database, Target, Award } from 'lucide-react';
import type { FitLevel } from '../types';
import { useMemo } from 'react';

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

  const [viewMode, setViewMode] = useState<'cards' | 'table' | 'kanban'>('kanban');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [fitLevelOverrides, setFitLevelOverrides] = useState<Record<string, FitLevel>>({});

  const handleBack = () => navigate('/research');
  const handleContinue = () => navigate('/review');

  const displayCompanies = useMemo(() => {
    return companies.map(c => ({
      ...c,
      fitLevel: fitLevelOverrides[c.id] || c.fitLevel
    }));
  }, [companies, fitLevelOverrides]);

  const activeCompany = displayCompanies.find(c => c.id === selectedCompanyId) || null;

  // Lead Modal navigation callbacks
  const activeIndex = selectedCompanyId ? displayCompanies.findIndex(c => c.id === selectedCompanyId) : -1;
  const onPrevious = activeIndex > 0 ? () => setSelectedCompanyId(displayCompanies[activeIndex - 1].id) : undefined;
  const onNext = activeIndex >= 0 && activeIndex < displayCompanies.length - 1 ? () => setSelectedCompanyId(displayCompanies[activeIndex + 1].id) : undefined;

  const handleMoveCompany = (id: string, newFit: FitLevel) => {
    setFitLevelOverrides(prev => ({
      ...prev,
      [id]: newFit
    }));
  };

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
            Explore companies matching your acquisition mandate. Select companies for deeper evaluation in Review Results.
          </p>
        </div>

        {/* Toggle Grid/Table/Kanban view */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-md border border-default self-start md:self-auto select-none">
          <button
            onClick={() => setViewMode('kanban')}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-bold rounded cursor-pointer transition-colors ${viewMode === 'kanban' ? 'bg-card text-brand-primary shadow-sm' : 'text-secondary hover:text-primary'}`}
            aria-label="Kanban view mode"
          >
            <Kanban className="h-4 w-4" />
            <span>Kanban</span>
          </button>
          <button
            onClick={() => setViewMode('cards')}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-bold rounded cursor-pointer transition-colors ${viewMode === 'cards' ? 'bg-card text-brand-primary shadow-sm' : 'text-secondary hover:text-primary'}`}
            aria-label="Cards view mode"
          >
            <LayoutGrid className="h-4 w-4" />
            <span>Cards</span>
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-bold rounded cursor-pointer transition-colors ${viewMode === 'table' ? 'bg-card text-brand-primary shadow-sm' : 'text-secondary hover:text-primary'}`}
            aria-label="Table view mode"
          >
            <Table className="h-4 w-4" />
            <span>Table</span>
          </button>
        </div>
      </div>

      {/* 1. Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
        <Card className="flex justify-between items-start p-5 border border-default bg-card rounded shadow-none">
          <div className="flex flex-col gap-1.5 min-w-0 flex-1 pr-2">
            <span className="text-[10px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider block">Discovered Targets</span>
            <span className="text-3xl font-bold text-primary block my-0.5">148</span>
            <span className="text-xs text-secondary block leading-normal">Companies identified through research sources</span>
          </div>
          <div className="p-2 bg-slate-50 dark:bg-slate-900 border border-default rounded text-slate-450 shrink-0">
            <Database className="h-4.5 w-4.5" />
          </div>
        </Card>

        <Card className="flex justify-between items-start p-5 border border-default bg-card rounded shadow-none">
          <div className="flex flex-col gap-1.5 min-w-0 flex-1 pr-2">
            <span className="text-[10px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider block">Potential Fits</span>
            <span className="text-3xl font-bold text-primary block my-0.5">42</span>
            <span className="text-xs text-secondary block leading-normal">Candidates matching initial criteria</span>
          </div>
          <div className="p-2 bg-slate-50 dark:bg-slate-900 border border-default rounded text-slate-450 shrink-0">
            <Target className="h-4.5 w-4.5" />
          </div>
        </Card>

        <Card className="flex justify-between items-start p-5 border border-default bg-card rounded shadow-none">
          <div className="flex flex-col gap-1.5 min-w-0 flex-1 pr-2">
            <span className="text-[10px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider block">High Alignment</span>
            <span className="text-3xl font-bold text-primary block my-0.5">{companies.filter(c => c.fitLevel === 'HIGH FIT').length}</span>
            <span className="text-xs text-secondary block leading-normal">Strong acquisition alignment targets</span>
          </div>
          <div className="p-2 bg-slate-50 dark:bg-slate-900 border border-default rounded text-slate-450 shrink-0">
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
      ) : viewMode === 'kanban' ? (
        <CompanyKanban
          companies={displayCompanies}
          onView={(id) => setSelectedCompanyId(id)}
          onMoveCompany={handleMoveCompany}
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

      {/* Page Actions Footer */}
      <div className="border-t border-default pt-6 flex items-center justify-between mt-4">
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
          className="min-w-[200px]"
          id="continue-to-review-btn"
        >
          Continue to Review Results
        </Button>
      </div>
    </div>
  );
};
export default CompanyDiscovery;
