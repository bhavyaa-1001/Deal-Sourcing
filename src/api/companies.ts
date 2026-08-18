import type { Company, EnrichmentData } from '../types';
import { mockCompanies } from '../data/mockCompanies';
import { getCompanyEnrichment } from './enrichment';

const getActiveMandateId = (): string => {
  return localStorage.getItem('dealsourcing_mandates_active_id') || 'mandate-101';
};

const getStorageKey = (): string => `dealsourcing_companies_${getActiveMandateId()}`;
const getEnrichedKey = (): string => `dealsourcing_enriched_ids_${getActiveMandateId()}`;

const delay = (ms = 600) => new Promise(resolve => setTimeout(resolve, ms));

// Read persisted companies for the active mandate, or initialize fresh un-enriched mock data
const initCompanies = (): Company[] => {
  const key = getStorageKey();
  const stored = localStorage.getItem(key);
  if (stored) {
    try {
      const parsed: Company[] = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(c => ({
          ...c,
          enrichmentStatus: c.enrichmentStatus ?? 'locked',
        }));
      }
    } catch {
      // Corrupt storage — fall through
    }
  }

  // Initialize fresh, un-enriched company records for this mandate
  const fresh = mockCompanies.map(c => ({
    ...c,
    enrichmentStatus: 'locked' as const,
    enrichmentData: undefined,
  }));
  localStorage.setItem(key, JSON.stringify(fresh));
  return fresh;
};

const saveCompanies = (companies: Company[]) => {
  localStorage.setItem(getStorageKey(), JSON.stringify(companies));
};

export const getEnrichedIds = (): string[] => {
  const mandateKey = getEnrichedKey();
  const stored = localStorage.getItem(mandateKey);
  if (stored) {
    try {
      const ids = JSON.parse(stored);
      if (Array.isArray(ids)) return ids;
    } catch {}
  }
  return [];
};

export const saveEnrichedIds = (ids: string[]) => {
  localStorage.setItem(getEnrichedKey(), JSON.stringify(ids));
};

export const companiesApi = {
  getCompanies: async (): Promise<{ companies: Company[]; enrichedIds: string[] }> => {
    await delay(600);
    const companies = initCompanies();
    const enrichedIds = getEnrichedIds();
    
    // Sync enrichmentStatus and populate enrichmentData if enriched
    const synced = await Promise.all(
      companies.map(async c => {
        const isEnriched = enrichedIds.includes(c.id) || c.enrichmentStatus === 'enriched';
        if (isEnriched) {
          const enrichmentData = c.enrichmentData || await getCompanyEnrichment(c.id);
          return {
            ...c,
            enrichmentStatus: 'enriched' as const,
            enrichmentData,
          };
        }
        return {
          ...c,
          enrichmentStatus: 'locked' as const,
        };
      })
    );

    return { companies: synced, enrichedIds };
  },

  getCompanyById: async (id: string): Promise<Company> => {
    await delay(400);
    const companies = initCompanies();
    const company = companies.find(c => c.id === id);
    if (!company) {
      throw new Error(`Company with ID ${id} not found.`);
    }
    const enrichedIds = getEnrichedIds();
    const isEnriched = enrichedIds.includes(company.id) || company.enrichmentStatus === 'enriched';
    if (isEnriched) {
      const enrichmentData = company.enrichmentData || await getCompanyEnrichment(company.id);
      return {
        ...company,
        enrichmentStatus: 'enriched' as const,
        enrichmentData,
      };
    }
    return {
      ...company,
      enrichmentStatus: 'locked' as const,
    };
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

