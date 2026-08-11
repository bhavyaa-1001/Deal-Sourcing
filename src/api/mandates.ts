import type { Mandate } from '../types';
import { mockMandate } from '../data/mockMandates';

const STORAGE_KEY = 'dealsourcing_mandate';

// Initialize localStorage with mock data if not already present
const initMandate = (): Mandate => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mockMandate));
  return mockMandate;
};

// Helper for simulated delay
const delay = (ms = 800) => new Promise(resolve => setTimeout(resolve, ms));

export const mandatesApi = {
  getMandate: async (id: string): Promise<Mandate> => {
    await delay(600);
    const mandate = initMandate();
    if (mandate.id !== id) {
      throw new Error('Mandate not found');
    }
    return mandate;
  },

  createMandate: async (rawInput: string): Promise<Mandate> => {
    await delay(1200);
    const newMandate: Mandate = {
      id: `mandate-${Date.now()}`,
      title: 'New Custom Mandate',
      status: 'Draft',
      rawInput,
      objective: 'Define the acquisition strategy based on inputs.',
      geography: 'Not specified',
      targetIndustry: 'Not specified',
      targetActivity: 'Not specified',
      revenueRange: { min: 0, max: 0, label: 'Not specified' },
      employeeRange: { min: 0, max: 0, label: 'Not specified' },
      ownershipPreference: 'Not specified',
      successionPreference: 'Not specified',
      industryExclusions: [],
      otherRequirements: '',
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newMandate));
    return newMandate;
  },

  updateMandate: async (id: string, updates: Partial<Mandate>): Promise<Mandate> => {
    await delay(800);
    const current = initMandate();
    if (current.id !== id) {
      throw new Error('Mandate not found');
    }
    const updated = {
      ...current,
      ...updates,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  }
};
