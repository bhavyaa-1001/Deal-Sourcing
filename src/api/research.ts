import type { ResearchStrategy } from '../types';
import { mockResearchStrategy } from '../data/mockResearch';

const initResearch = (mandateId: string): ResearchStrategy => {
  const key = `dealsourcing_strategy_${mandateId}`;
  const stored = localStorage.getItem(key);
  if (stored) {
    return JSON.parse(stored);
  }
  const defaultStrategy: ResearchStrategy = {
    ...mockResearchStrategy,
    status: mandateId === 'mandate-101' ? 'Approved' : 'Draft',
    gaps: mockResearchStrategy.gaps.map(g => ({
      ...g,
      acknowledged: mandateId === 'mandate-101'
    })),
    metrics: {
      ...mockResearchStrategy.metrics,
      openGapsCount: mandateId === 'mandate-101' ? 0 : mockResearchStrategy.metrics.openGapsCount
    }
  };
  localStorage.setItem(key, JSON.stringify(defaultStrategy));
  return defaultStrategy;
};

const delay = (ms = 700) => new Promise(resolve => setTimeout(resolve, ms));

export const researchApi = {
  getResearchStrategy: async (mandateId: string): Promise<ResearchStrategy> => {
    await delay(500);
    const strategy = initResearch(mandateId);
    return strategy;
  },

  approveResearchStrategy: async (mandateId: string): Promise<ResearchStrategy> => {
    await delay(1000);
    const strategy = initResearch(mandateId);
    
    // Validate that all gaps are acknowledged first
    const unacknowledged = strategy.gaps.filter(g => !g.acknowledged);
    if (unacknowledged.length > 0) {
      throw new Error('Please acknowledge all open gaps before approving the strategy.');
    }
    
    strategy.status = 'Approved';
    localStorage.setItem(`dealsourcing_strategy_${mandateId}`, JSON.stringify(strategy));
    return strategy;
  },

  toggleGapAcknowledgement: async (mandateId: string, gapId: string): Promise<ResearchStrategy> => {
    await delay(300);
    const strategy = initResearch(mandateId);
    strategy.gaps = strategy.gaps.map(gap => {
      if (gap.id === gapId) {
        return { ...gap, acknowledged: !gap.acknowledged };
      }
      return gap;
    });
    
    // Update metrics
    const openGaps = strategy.gaps.filter(g => !g.acknowledged).length;
    strategy.metrics.openGapsCount = openGaps;
    
    localStorage.setItem(`dealsourcing_strategy_${mandateId}`, JSON.stringify(strategy));
    return strategy;
  }
};
