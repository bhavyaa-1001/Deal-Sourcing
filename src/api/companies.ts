import type { Company, EnrichmentData } from '../types';
import { mockCompanies } from '../data/mockCompanies';

const getActiveMandateId = (): string => {
  return localStorage.getItem('dealsourcing_mandates_active_id') || 'mandate-101';
};

const getStorageKey = (): string => `dealsourcing_companies_${getActiveMandateId()}`;
const getEnrichedKey = (): string => `dealsourcing_enriched_ids_${getActiveMandateId()}`;

const delay = (ms = 600) => new Promise(resolve => setTimeout(resolve, ms));

// Read persisted companies, falling back to mock data
const initCompanies = (): Company[] => {
  const key = getStorageKey();
  const stored = localStorage.getItem(key);
  if (stored) {
    try {
      const parsed: Company[] = JSON.parse(stored);
      // Ensure new fields exist for any stored data that predates this version
      return parsed.map(c => ({
        ...c,
        enrichmentStatus: c.enrichmentStatus ?? 'locked',
      }));
    } catch {
      // Corrupt storage — reset
    }
  }
  localStorage.setItem(key, JSON.stringify(mockCompanies));
  return mockCompanies;
};

const saveCompanies = (companies: Company[]) => {
  localStorage.setItem(getStorageKey(), JSON.stringify(companies));
};

export const getEnrichedIds = (): string[] => {
  const stored = localStorage.getItem(getEnrichedKey());
  return stored ? JSON.parse(stored) : [];
};

export const saveEnrichedIds = (ids: string[]) => {
  localStorage.setItem(getEnrichedKey(), JSON.stringify(ids));
};

export const companiesApi = {
  getCompanies: async (): Promise<{ companies: Company[]; enrichedIds: string[] }> => {
    await delay(600);
    const companies = initCompanies();
    const enrichedIds = getEnrichedIds();
    // Sync enrichmentStatus from enrichedIds
    const synced = companies.map(c => ({
      ...c,
      enrichmentStatus: (enrichedIds.includes(c.id) ? 'enriched' : c.enrichmentStatus) as Company['enrichmentStatus'],
    }));
    return { companies: synced, enrichedIds };
  },

  getCompanyById: async (id: string): Promise<Company> => {
    await delay(400);
    const companies = initCompanies();
    const company = companies.find(c => c.id === id);
    if (!company) {
      throw new Error(`Company with ID ${id} not found.`);
    }
    return company;
  },

  /** Marks a set of companies as enriched and persists their enrichment data */
  markAsEnriched: async (
    ids: string[],
    enrichmentMap: Record<string, EnrichmentData>
  ): Promise<void> => {
    await delay(200);
    const companies = initCompanies();
    const existing = getEnrichedIds();
    const allEnriched = Array.from(new Set([...existing, ...ids]));
    saveEnrichedIds(allEnriched);

    const updated = companies.map(c => {
      if (ids.includes(c.id)) {
        return {
          ...c,
          enrichmentStatus: 'enriched' as const,
          enrichmentData: enrichmentMap[c.id] ?? c.enrichmentData,
        };
      }
      return c;
    });
    saveCompanies(updated);
  },
};

