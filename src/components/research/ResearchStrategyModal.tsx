import React, { useState } from 'react';
import { useResearch } from '../../hooks/useResearch';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import LoadingState from '../ui/LoadingState';
import {
  Compass
} from 'lucide-react';

interface ResearchStrategyModalProps {
  mandateId: string | null;
  mandateTitle?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ResearchStrategyModal: React.FC<ResearchStrategyModalProps> = ({
  mandateId,
  mandateTitle = 'Acquisition Mandate',
  isOpen,
  onClose,
}) => {
  const effectiveId = mandateId || 'mandate-101';
  const { strategy, loading, error, toggleGap } = useResearch(effectiveId);
  const [activeTab, setActiveTab] = useState<'mapping' | 'sources' | 'gaps'>('mapping');

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      size="xl"
      footerActions={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2 text-xs text-[#626A6D] dark:text-[#9AA9B8]">
            <span className="w-2 h-2 rounded-full bg-[#35624A] dark:bg-[#8FBEA1]" />
            <span>Mandate ID: <strong className="font-bold text-[#202A2E] dark:text-[#F1F5F9]">{effectiveId}</strong></span>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={onClose}
            className="text-xs font-bold bg-[#202A2E] hover:bg-[#141B1E] dark:bg-[#E6E9E5] dark:text-[#101820]"
          >
            Close
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-5 text-left -mt-2">
        {/* Custom Header Area */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#D8D5CE] dark:border-[#263544]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#F4E8E2] dark:bg-[#3A281F] text-[#A65F3F] dark:text-[#C27A56] flex items-center justify-center font-black text-sm shrink-0 border border-[#A65F3F]/20 dark:border-[#C27A56]/30">
              <Compass className="h-4.5 w-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base md:text-lg font-black text-[#202A2E] dark:text-[#F1F5F9] leading-tight">
                  Research Strategy
                </h3>
                <span className="text-[9px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider bg-[#E3ECE6] dark:bg-[#173529] text-[#35624A] dark:text-[#8FBEA1] border border-[#B7CCBC] dark:border-[#39634D]">
                  {strategy?.status || 'Active'}
                </span>
              </div>
              <p className="text-xs text-[#626A6D] dark:text-[#9AA9B8] mt-0.5">
                Market mapping & search methodology for <span className="font-bold text-[#202A2E] dark:text-[#F1F5F9]">{mandateTitle}</span>
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center p-0.5 rounded-lg bg-[#EDEBE5] dark:bg-[#141F2C] border border-[#D8D5CE] dark:border-[#263544] self-start sm:self-auto shrink-0">
            <button
              onClick={() => setActiveTab('mapping')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                activeTab === 'mapping'
                  ? 'bg-white dark:bg-[#1D2B3A] text-[#202A2E] dark:text-[#F1F5F9] shadow-sm'
                  : 'text-[#626A6D] dark:text-[#9AA9B8] hover:text-[#202A2E] dark:hover:text-[#F1F5F9]'
              }`}
            >
              Methodology
            </button>
            <button
              onClick={() => setActiveTab('sources')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                activeTab === 'sources'
                  ? 'bg-white dark:bg-[#1D2B3A] text-[#202A2E] dark:text-[#F1F5F9] shadow-sm'
                  : 'text-[#626A6D] dark:text-[#9AA9B8] hover:text-[#202A2E] dark:hover:text-[#F1F5F9]'
              }`}
            >
              Sources ({strategy?.sources?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('gaps')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                activeTab === 'gaps'
                  ? 'bg-white dark:bg-[#1D2B3A] text-[#202A2E] dark:text-[#F1F5F9] shadow-sm'
                  : 'text-[#626A6D] dark:text-[#9AA9B8] hover:text-[#202A2E] dark:hover:text-[#F1F5F9]'
              }`}
            >
              Gaps ({strategy?.gaps?.length || 0})
            </button>
          </div>
        </div>

        {loading && !strategy ? (
          <div className="py-12">
            <LoadingState message="Loading mandate research strategy..." />
          </div>
        ) : error ? (
          <div className="p-4 rounded-lg bg-[#F4E4E1] dark:bg-[#381E21] border border-[#E3C4C0] dark:border-[#54282B] text-[#A44A42] dark:text-[#E89E9A] text-xs font-semibold">
            {error}
          </div>
        ) : strategy ? (
          <>
            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-lg border border-[#D8D5CE] dark:border-[#2D4053] bg-white dark:bg-[#182536] flex flex-col">
                <span className="text-[10px] font-bold text-[#626A6D] dark:text-[#9AA9B8] uppercase tracking-wider">Research Questions</span>
                <span className="text-base font-black text-[#202A2E] dark:text-[#F1F5F9] mt-0.5">
                  {strategy.metrics.researchQuestionsCompleted} / {strategy.metrics.researchQuestionsTotal}
                </span>
              </div>
              <div className="p-3 rounded-lg border border-[#D8D5CE] dark:border-[#2D4053] bg-white dark:bg-[#182536] flex flex-col">
                <span className="text-[10px] font-bold text-[#626A6D] dark:text-[#9AA9B8] uppercase tracking-wider">Market Coverage</span>
                <span className="text-base font-black text-[#202A2E] dark:text-[#F1F5F9] mt-0.5">
                  {strategy.metrics.coveragePercentage}% Yield
                </span>
              </div>
              <div className="p-3 rounded-lg border border-[#D8D5CE] dark:border-[#2D4053] bg-white dark:bg-[#182536] flex flex-col">
                <span className="text-[10px] font-bold text-[#626A6D] dark:text-[#9AA9B8] uppercase tracking-wider">Validated Sources</span>
                <span className="text-base font-black text-[#202A2E] dark:text-[#F1F5F9] mt-0.5">
                  {strategy.metrics.validatedSourcesCount} Verified
                </span>
              </div>
              <div className="p-3 rounded-lg border border-[#D8D5CE] dark:border-[#2D4053] bg-white dark:bg-[#182536] flex flex-col">
                <span className="text-[10px] font-bold text-[#626A6D] dark:text-[#9AA9B8] uppercase tracking-wider">Open Gaps</span>
                <span className="text-base font-black text-[#202A2E] dark:text-[#F1F5F9] mt-0.5">
                  {strategy.metrics.openGapsCount} Remaining
                </span>
              </div>
            </div>

            {/* TAB 1: Market Mapping & Boolean Search */}
            {activeTab === 'mapping' && (
              <div className="flex flex-col gap-4">
                <div className="p-4 rounded-lg border border-[#D8D5CE] dark:border-[#2D4053] bg-white dark:bg-[#182536] flex flex-col gap-3">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-[#626A6D] dark:text-[#9AA9B8]">
                      Market Scope & Narrative
                    </h4>
                    <p className="text-xs md:text-sm text-[#202A2E] dark:text-[#F1F5F9] mt-1 leading-relaxed">
                      {strategy.marketMapping.description}
                    </p>
                  </div>

                  {/* Taxonomy Categories */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#E5E2DC] dark:border-[#263544]">
                    {Object.entries(strategy.marketMapping.categories).map(([cat, terms]) => (
                      <div key={cat} className="flex flex-col gap-1.5">
                        <span className="text-[10.5px] font-bold text-[#626A6D] dark:text-[#9AA9B8] uppercase tracking-wider">
                          {cat}
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {terms.map(t => (
                            <span
                              key={t}
                              className="px-2 py-0.5 text-xs font-semibold rounded bg-[#F1EFEA] dark:bg-[#1D2B3A] border border-[#D8D5CE] dark:border-[#344658] text-[#202A2E] dark:text-[#F1F5F9]"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Search Strategy Execution Steps */}
                <div className="p-4 rounded-lg border border-[#D8D5CE] dark:border-[#2D4053] bg-white dark:bg-[#182536] flex flex-col gap-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-[#626A6D] dark:text-[#9AA9B8]">
                    Execution Rules & Sourcing Logic
                  </h4>
                  <ul className="space-y-1.5 text-xs text-[#202A2E] dark:text-[#F1F5F9] list-disc pl-4 leading-relaxed">
                    {strategy.marketMapping.searchStrategy.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* TAB 2: Sourcing Manifest */}
            {activeTab === 'sources' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
                {strategy.sources.map(source => (
                  <div
                    key={source.id}
                    className="p-3 rounded-lg border border-[#D8D5CE] dark:border-[#2D4053] bg-white dark:bg-[#182536] flex flex-col justify-between gap-2"
                  >
                    <div className="flex justify-between items-start gap-2 border-b border-[#E5E2DC] dark:border-[#263544] pb-2">
                      <div>
                        <h5 className="font-bold text-xs md:text-sm text-[#202A2E] dark:text-[#F1F5F9]">
                          {source.name}
                        </h5>
                        <span className="text-[10px] text-[#626A6D] dark:text-[#9AA9B8] block">{source.type}</span>
                      </div>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider border shrink-0
                        ${source.status === 'VALIDATED'
                          ? 'border-[#B7CCBC] bg-[#E3ECE6] text-[#35624A] dark:bg-[#173529] dark:text-[#8FBEA1] dark:border-[#39634D]'
                          : source.status === 'REJECTED'
                            ? 'border-[#E3C4C0] bg-[#F4E4E1] text-[#A44A42] dark:bg-[#381E21] dark:text-[#E89E9A] dark:border-[#54282B]'
                            : 'border-[#E3D4B3] bg-[#F5EDDA] text-[#9A7535] dark:bg-[#3A3520] dark:text-[#D5C76E] dark:border-[#625A2F]'
                        }
                      `}>
                        {source.status}
                      </span>
                    </div>

                    {source.status === 'VALIDATED' && (
                      <div className="grid grid-cols-3 gap-2 bg-[#F1EFEA]/60 dark:bg-[#1D2B3A] p-2 rounded text-[10px]">
                        <div>
                          <span className="text-[#626A6D] dark:text-[#9AA9B8] block">Found</span>
                          <strong className="text-[#202A2E] dark:text-[#F1F5F9]">{source.companiesFound}</strong>
                        </div>
                        <div>
                          <span className="text-[#626A6D] dark:text-[#9AA9B8] block">Quality</span>
                          <strong className="text-[#202A2E] dark:text-[#F1F5F9]">{Math.round(source.qualityScore * 100)}%</strong>
                        </div>
                        <div>
                          <span className="text-[#626A6D] dark:text-[#9AA9B8] block">Dup %</span>
                          <strong className="text-[#202A2E] dark:text-[#F1F5F9]">{source.duplicatePercentage}%</strong>
                        </div>
                      </div>
                    )}

                    {source.notes && (
                      <p className="text-[11px] text-[#626A6D] dark:text-[#9AA9B8] leading-snug">
                        {source.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* TAB 3: Gaps & Quality */}
            {activeTab === 'gaps' && (
              <div className="flex flex-col gap-2.5 max-h-[380px] overflow-y-auto pr-1">
                {strategy.gaps.map(gap => (
                  <div
                    key={gap.id}
                    className={`p-3 rounded-lg border transition-all flex flex-col gap-2 ${
                      gap.acknowledged
                        ? 'border-[#B7CCBC] dark:border-[#39634D] bg-[#E3ECE6]/30 dark:bg-[#173529]/20'
                        : 'border-[#E3D4B3] dark:border-[#625A2F] bg-[#F5EDDA]/30 dark:bg-[#3A3520]/20'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#202A2E] dark:text-[#F1F5F9]">Information Gap</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider bg-white dark:bg-[#182536] border border-[#D8D5CE] dark:border-[#344658] text-[#626A6D] dark:text-[#9AA9B8]">
                          {gap.acknowledged ? 'Acknowledged' : 'Pending'}
                        </span>
                      </div>
                      <button
                        onClick={() => toggleGap(gap.id)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border cursor-pointer transition-colors ${
                          gap.acknowledged
                            ? 'bg-[#35624A] text-white border-[#35624A] dark:bg-[#173529] dark:border-[#39634D]'
                            : 'bg-white dark:bg-[#182536] border-[#D8D5CE] dark:border-[#344658] text-[#202A2E] dark:text-[#F1F5F9] hover:bg-[#F1EFEA]'
                        }`}
                      >
                        {gap.acknowledged ? '✓ Acknowledged' : 'Mark Acknowledged'}
                      </button>
                    </div>

                    <p className="text-xs text-[#626A6D] dark:text-[#9AA9B8] leading-relaxed">
                      {gap.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : null}
      </div>
    </Modal>
  );
};
export default ResearchStrategyModal;
