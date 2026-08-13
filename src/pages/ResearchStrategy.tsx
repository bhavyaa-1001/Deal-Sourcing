import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useResearch } from '../hooks/useResearch';
import Button from '../components/ui/Button';
import LoadingState from '../components/ui/LoadingState';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { ArrowLeft, ArrowRight, CheckCircle2, Database, AlertTriangle, Check } from 'lucide-react';
import type { LayoutContextType } from '../components/layout/AppLayout';

export const ResearchStrategy: React.FC = () => {
  const navigate = useNavigate();
  const { refreshApprovals } = useOutletContext<LayoutContextType>();
  
  const {
    strategy,
    loading,
    error,
    successMessage,
    toggleGap,
    approveStrategy
  } = useResearch();

  const [savedMandate, setSavedMandate] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem('dealsourcing_mandate');
    if (stored) {
      try {
        setSavedMandate(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse mandate from storage:", e);
      }
    }
  }, []);

  const handleBack = () => {
    navigate('/mandate');
  };

  const handleApprove = async () => {
    if (!strategy) return;
    if (strategy.status === 'Approved') {
      navigate('/discover');
      return;
    }
    try {
      await approveStrategy();
      await refreshApprovals(); // Update layout stepper locks
      navigate('/discover');
    } catch (err) {
      console.error(err);
    }
  };

  if (loading && !strategy) {
    return <LoadingState message="Preparing research strategy..." />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-md text-left">
        <p className="font-bold">Error loading research strategy</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  if (!strategy) return null;

  // The approve button is unlocked only when all gaps have been acknowledged
  const allGapsAcknowledged = strategy.gaps.every(gap => gap.acknowledged);

  return (
    <div className="flex flex-col gap-6 text-left">
      {/* Title & Description */}
      <div>
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Research Strategy
        </h2>
        <p className="text-lg text-slate-500 dark:text-slate-400 mt-2">
          Review the strategy our research agent will use to identify potential acquisition targets.
        </p>
      </div>

      {/* Success Notification Alert */}
      {successMessage && (
        <div className="bg-brand-success-light text-brand-success border border-brand-success rounded-md p-4 flex items-center gap-2.5 text-left animate-fadeIn">
          <CheckCircle2 className="h-5 w-5" />
          <span className="font-semibold text-base">{successMessage}</span>
        </div>
      )}

      {/* Grid: Details on Left, Sources & Gaps on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Panel: Target Details & Approach (60% width) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <Card className="p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col gap-6">
            
            {/* 1. Target Market */}
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                Target Market
              </span>
              <span className="text-xl font-bold text-slate-800 dark:text-slate-200 block mt-1.5">
                {savedMandate?.targetIndustry || 'Plastics Manufacturing'}
              </span>
            </div>

            {/* 2. Geography */}
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                Geography
              </span>
              <span className="text-xl font-bold text-slate-800 dark:text-slate-200 block mt-1.5">
                {savedMandate?.geography || 'Australia'}
              </span>
            </div>

            {/* 3. Company Profile */}
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                Company Profile Constraints
              </span>
              <div className="grid grid-cols-2 gap-4 mt-2 bg-slate-50 dark:bg-slate-950/20 p-4 rounded-lg border border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wide">Revenue Range</span>
                  <span className="text-base font-bold text-slate-800 dark:text-slate-200 block mt-0.5">
                    {savedMandate?.revenueRange?.label || '$15M – $50M AUD'}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wide">Employee Count</span>
                  <span className="text-base font-bold text-slate-800 dark:text-slate-200 block mt-0.5">
                    {savedMandate?.employeeRange?.label || '50 – 150 employees'}
                  </span>
                </div>
              </div>
            </div>

            {/* 4. Research Approach */}
            <div>
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2">
                Research Approach
              </span>
              <p className="text-base text-slate-605 dark:text-slate-400 leading-relaxed mb-3">
                Our agent will deploy targeted search scripts, analyze structured registry filings, and query verified manufacturing registers to compile matching targets:
              </p>
              <ul className="space-y-2 text-base text-slate-700 dark:text-slate-300 font-semibold pl-1">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-500" />
                  Industry directories (e.g. Manufacturing registers)
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-500" />
                  National company registries (ASIC data sets)
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-500" />
                  Manufacturing trade associations and lists
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-500" />
                  Public filings and corporate disclosures
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-500" />
                  Specialist business brokerage registers & networks
                </li>
              </ul>
            </div>

          </Card>
        </div>

        {/* Right Panel: Sources & Gaps Check list (40% width) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Research Sources card */}
          <Card className="p-6 border border-default bg-card shadow-none flex flex-col gap-4">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b border-default pb-3">
              <Database className="h-5 w-5 text-slate-450 dark:text-slate-500" />
              Research Sources
            </h3>
            <div className="flex flex-col gap-3">
              {strategy.sources.map((src) => (
                <div key={src.id} className="flex justify-between items-center p-3 border border-default bg-white dark:bg-slate-900 rounded">
                  <div className="text-left">
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200 block">{src.name}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 block">Coverage: {src.type}</span>
                  </div>
                  <Badge variant={src.status === 'VALIDATED' ? 'success' : 'neutral'} className="text-xs font-bold px-2 py-0.5 uppercase">
                    {src.status === 'VALIDATED' ? 'Validated' : 'Pending'}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* Gaps Acknowledgement card */}
          <Card className="p-6 border border-default bg-card shadow-none flex flex-col gap-4">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b border-default pb-3">
              <AlertTriangle className="h-5 w-5 text-brand-warning" />
              Acknowledge Research Gaps
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Please review and acknowledge the identified data gaps in Australian private plastics data before proceeding.
            </p>
            <div className="flex flex-col gap-4 mt-2">
              {strategy.gaps.map((gap) => (
                <button
                  key={gap.id}
                  onClick={() => toggleGap(gap.id)}
                  className={`w-full flex items-start gap-3 p-3.5 border rounded text-left transition-all cursor-pointer select-none
                    ${gap.acknowledged 
                      ? 'border-brand-success/40 bg-brand-success-light dark:bg-brand-success-light/10 text-slate-800 dark:text-slate-200' 
                      : 'border-default hover:border-slate-450 dark:hover:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50/50 dark:hover:bg-slate-850/50 text-slate-700 dark:text-slate-300'
                    }
                  `}
                >
                  <div className={`h-5 w-5 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-all
                    ${gap.acknowledged 
                      ? 'bg-brand-success border-brand-success text-white' 
                      : 'border-slate-350 dark:border-slate-750 bg-white dark:bg-slate-900 text-transparent'
                    }
                  `}>
                    <Check className="h-3.5 w-3.5 stroke-[3px]" />
                  </div>
                  <div>
                    <span className="text-sm font-bold block capitalize text-slate-800 dark:text-slate-200">{gap.id.replace('-', ' ')}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 block mt-1 leading-relaxed">{gap.description}</span>
                  </div>
                </button>
              ))}
            </div>
          </Card>

        </div>

      </div>

      {/* Footer Stepper Controls */}
      <div className="border-t border-slate-200 dark:border-slate-800 pt-6 flex items-center justify-between mt-4">
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
          onClick={handleApprove}
          disabled={strategy.status !== 'Approved' && !allGapsAcknowledged}
          rightIcon={<ArrowRight className="h-5 w-5" />}
          className="min-w-[200px]"
        >
          {strategy.status === 'Approved' ? 'Strategy Approved ✓' : 'Approve Strategy & Search'}
        </Button>
      </div>
    </div>
  );
};
export default ResearchStrategy;
