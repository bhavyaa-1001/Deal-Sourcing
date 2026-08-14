import type { Company, EnrichmentData } from '../types';
import { mockCompanies } from '../data/mockCompanies';
import { getCompanyEnrichment } from './enrichment';

const getActiveMandateId = (): string => {
  return localStorage.getItem('dealsourcing_mandates_active_id') || 'mandate-101';
};

const getStorageKey = (): string => `dealsourcing_companies_${getActiveMandateId()}`;
const getEnrichedKey = (): string => `dealsourcing_enriched_ids_${getActiveMandateId()}`;

const delay = (ms = 600) => new Promise(resolve => setTimeout(resolve, ms));

// Legacy global keys (pre-isolation) - used for migration fallback
const LEGACY_COMPANIES_KEY = 'dealsourcing_companies';
const LEGACY_ENRICHED_KEY = 'dealsourcing_enriched_ids';

// Read persisted companies, falling back to legacy global key then mock data
const initCompanies = (): Company[] => {
  const key = getStorageKey();
  const stored = localStorage.getItem(key);
  if (stored) {
    try {
      const parsed: Company[] = JSON.parse(stored);
      return parsed.map(c => ({
        ...c,
        enrichmentStatus: c.enrichmentStatus ?? 'locked',
      }));
    } catch {
      // Corrupt storage — fall through
    }
  }

  // Migration: check old global key (data enriched before mandate isolation was added)
  const legacy = localStorage.getItem(LEGACY_COMPANIES_KEY);
  if (legacy) {
    try {
      const parsed: Company[] = JSON.parse(legacy);
      const migrated = parsed.map(c => ({
        ...c,
        enrichmentStatus: c.enrichmentStatus ?? 'locked',
      }));
      // Write into mandate-specific key so future reads are fast
      localStorage.setItem(key, JSON.stringify(migrated));
      return migrated;
    } catch {
      // Corrupt legacy data — fall through
    }
  }

  localStorage.setItem(key, JSON.stringify(mockCompanies));
  return mockCompanies;
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
      if (Array.isArray(ids) && ids.length > 0) return ids;
    } catch {}
  }

  // Migration: check old global key (enrichment done before mandate isolation was added)
  const legacy = localStorage.getItem(LEGACY_ENRICHED_KEY);
  if (legacy) {
    try {
      const ids = JSON.parse(legacy);
      if (Array.isArray(ids) && ids.length > 0) {
        // Migrate into mandate-specific key so future reads are fast
        localStorage.setItem(mandateKey, legacy);
        return ids;
      }
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

