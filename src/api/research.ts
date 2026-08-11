import type { ResearchStrategy } from '../types';
import { mockResearchStrategy } from '../data/mockResearch';

const STORAGE_KEY = 'dealsourcing_research';

const initResearch = (): ResearchStrategy => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mockResearchStrategy));
  return mockResearchStrategy;
};

const delay = (ms = 700) => new Promise(resolve => setTimeout(resolve, ms));

export const researchApi = {
  getResearchStrategy: async (_mandateId: string): Promise<ResearchStrategy> => {
    await delay(500);
    const strategy = initResearch();
    // In a real app we would query by mandateId
    return strategy;
  },

  approveResearchStrategy: async (_mandateId: string): Promise<ResearchStrategy> => {
    await delay(1000);
    const strategy = initResearch();
    
    // Validate that all gaps are acknowledged first
    const unacknowledged = strategy.gaps.filter(g => !g.acknowledged);
    if (unacknowledged.length > 0) {
      throw new Error('Please acknowledge all open gaps before approving the strategy.');
    }
    
    strategy.status = 'Approved';
    localStorage.setItem(STORAGE_KEY, JSON.stringify(strategy));
    return strategy;
  },

  toggleGapAcknowledgement: async (_mandateId: string, gapId: string): Promise<ResearchStrategy> => {
    await delay(300);
    const strategy = initResearch();
    strategy.gaps = strategy.gaps.map(gap => {
      if (gap.id === gapId) {
        return { ...gap, acknowledged: !gap.acknowledged };
      }
      return gap;
    });
    
    // Update metrics
    const openGaps = strategy.gaps.filter(g => !g.acknowledged).length;
    strategy.metrics.openGapsCount = openGaps;
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(strategy));
    return strategy;
  }
};
