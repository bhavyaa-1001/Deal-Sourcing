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
import { LayoutGrid, Table, ArrowLeft, ArrowRight, CheckCircle2, Database, Target, Award } from 'lucide-react';

export const CompanyDiscovery: React.FC = () => {
  const navigate = useNavigate();
  const {
    companies,
    shortlistIds,
    loading,
    error,
    successMessage,
    filters,
    uniqueOptions,
    updateFilters,
    clearFilters,
    toggleShortlist
  } = useCompanies();

  // View state: 'cards' | 'table'
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  
  // Selected company for modal
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);

  const handleBack = () => {
    navigate('/research');
  };

  const handleContinue = () => {
    navigate('/review');
  };

  // Find currently opened company details
  const activeCompany = companies.find(c => c.id === selectedCompanyId) || null;

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
            Find target businesses in Australia that match your acquisition mandate.
          </p>
        </div>
        
        {/* Toggle Grid/Table view */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-md border border-default self-start md:self-auto">
          <button
            onClick={() => setViewMode('cards')}
            className={`flex items-center gap-1.5 px-4.5 py-2.5 text-base font-semibold rounded cursor-pointer transition-colors ${viewMode === 'cards' ? 'bg-card text-brand-primary shadow-sm' : 'text-secondary hover:text-primary'}`}
            aria-label="Cards view mode"
          >
            <LayoutGrid className="h-5 w-5" />
            <span>Cards</span>
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 px-4.5 py-2.5 text-base font-semibold rounded cursor-pointer transition-colors ${viewMode === 'table' ? 'bg-card text-brand-primary shadow-sm' : 'text-secondary hover:text-primary'}`}
            aria-label="Table view mode"
          >
            <Table className="h-5 w-5" />
            <span>Table</span>
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successMessage && (
        <div className="bg-brand-success-light text-brand-success border border-brand-success rounded-md p-4 flex items-center gap-2.5 text-left animate-fadeIn">
          <CheckCircle2 className="h-5 w-5" />
          <span className="font-semibold text-base">{successMessage}</span>
        </div>
      )}

      {/* 1. Metrics Cards (High level telemetry matching requirements) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
        <Card className="flex items-center gap-4 border-l-4 border-l-slate-400">
          <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500">
            <Database className="h-6 w-6" />
          </div>
          <div>
            <span className="text-sm font-semibold text-secondary uppercase tracking-wider block">
              Discovered Targets
            </span>
            <span className="text-2xl font-black text-primary block mt-0.5">
              148 Companies
            </span>
            <span className="text-xs text-secondary block mt-0.5 font-medium">
              Identified through crawlers & sources
            </span>
          </div>
        </Card>
        
        <Card className="flex items-center gap-4 border-l-4 border-l-indigo-500">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 rounded-full text-indigo-500">
            <Target className="h-6 w-6" />
          </div>
          <div>
            <span className="text-sm font-semibold text-secondary uppercase tracking-wider block">
              Potential Fits
            </span>
            <span className="text-2xl font-black text-primary block mt-0.5">
              42 Candidates
            </span>
            <span className="text-xs text-secondary block mt-0.5 font-medium">
              Validated against geography & activity
            </span>
          </div>
        </Card>

        <Card className="flex items-center gap-4 border-l-4 border-l-brand-success">
          <div className="p-3 bg-brand-success-light rounded-full text-brand-success">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <span className="text-sm font-semibold text-secondary uppercase tracking-wider block">
              High Alignment
            </span>
            <span className="text-2xl font-black text-primary block mt-0.5">
              18 Targets
            </span>
            <span className="text-xs text-secondary block mt-0.5 font-medium">
              90%+ match score and succession path
            </span>
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
      {companies.length === 0 ? (
        <EmptyState
          title="No companies found"
          description="We couldn't find any target companies matching your current filters. Try relaxing your constraints, clearing filters, or widening the revenue ranges."
          actionText="Clear Filters"
          onAction={clearFilters}
        />
      ) : viewMode === 'cards' ? (
        /* Cards Layout Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map(company => (
            <CompanyCard
              key={company.id}
              company={company}
              isShortlisted={shortlistIds.includes(company.id)}
              onView={() => setSelectedCompanyId(company.id)}
              onToggleShortlist={() => toggleShortlist(company.id)}
            />
          ))}
        </div>
      ) : (
        /* Table Layout View */
        <CompanyTable
          companies={companies}
          shortlistIds={shortlistIds}
          onView={(id) => setSelectedCompanyId(id)}
          onToggleShortlist={(id) => toggleShortlist(id)}
        />
      )}

      {/* 4. Company Detail Modal / Side Drawer Drawer */}
      <CompanyDetails
        company={activeCompany}
        isOpen={selectedCompanyId !== null}
        onClose={() => setSelectedCompanyId(null)}
        isShortlisted={selectedCompanyId ? shortlistIds.includes(selectedCompanyId) : false}
        onToggleShortlist={() => selectedCompanyId && toggleShortlist(selectedCompanyId)}
      />

      {/* Page Actions Footer Navigation */}
      <div className="border-t border-default pt-6 flex items-center justify-between mt-4">
        <Button
          variant="outline"
          onClick={handleBack}
          leftIcon={<ArrowLeft className="h-5 w-5" />}
          className="min-w-[120px]"
        >
          Back
        </Button>
        
        <div className="flex items-center gap-4">
          <span className="hidden md:inline text-base font-semibold text-secondary">
            {shortlistIds.length} companies selected for review
          </span>
          <Button
            variant="primary"
            onClick={handleContinue}
            rightIcon={<ArrowRight className="h-5 w-5" />}
            className="min-w-[200px]"
          >
            Continue to Review Shortlist
          </Button>
        </div>
      </div>
    </div>
  );
};
export default CompanyDiscovery;
