import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Company, CompanyFilter, EnrichmentData } from '../types';
import { companiesApi } from '../api/companies';
import {
  createEnrichmentOrder,
  processEnrichmentPayment,
  getCompanyEnrichment,
} from '../api/enrichment';
import { useMandateHistory } from '../context/MandateHistoryContext';

const initialFilters: CompanyFilter = {
  search: '',
  industry: '',
  location: '',
  revenue: '',
  employees: '',
  ownership: '',
  fitLevel: '',
  confidence: '',
};

export const useCompanies = () => {
  // Read activeId from React context (reactive) so any mandate switch immediately
  // triggers a re-fetch — even if the consuming component doesn't remount.
  const { activeId } = useMandateHistory();
  const activeMandateId = activeId || localStorage.getItem('dealsourcing_mandates_active_id') || 'mandate-101';
  const SELECTED_KEY = `dealsourcing_selected_ids_${activeMandateId}`;

  const [companies, setCompanies] = useState<Company[]>([]);
  const [enrichedIds, setEnrichedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filter and Sorting State
  const [filters, setFilters] = useState<CompanyFilter>(initialFilters);
  const [sortBy, setSortBy] = useState<string>('confidence-desc');

  // Selection state — initialized from the current mandate's storage key
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    const stored = localStorage.getItem(`dealsourcing_selected_ids_${activeMandateId}`);
    return stored ? JSON.parse(stored) : [];
  });

  // Re-fetch companies whenever the active mandate changes
  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await companiesApi.getCompanies();
      setCompanies(data.companies);
      setEnrichedIds(data.enrichedIds);
    } catch (err: any) {
      setError(err?.message || 'Failed to load discovered companies.');
    } finally {
      setLoading(false);
    }
  // activeMandateId in deps ensures the callback is recreated (and re-run) on every mandate switch
  }, [activeMandateId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  // Load selection state when active mandate changes
  useEffect(() => {
    const stored = localStorage.getItem(SELECTED_KEY);
    setSelectedIds(stored ? JSON.parse(stored) : []);
  }, [SELECTED_KEY]);

  // Persist selected IDs
  useEffect(() => {
    localStorage.setItem(SELECTED_KEY, JSON.stringify(selectedIds));
  }, [selectedIds, SELECTED_KEY]);

  // ─── Selection controls ───────────────────────────────────────────────────

  const toggleSelection = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedIds(companies.map(c => c.id));
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  // ─── Enrichment flow ──────────────────────────────────────────────────────

  /**
   * Runs the full enrichment flow for a set of company IDs:
   * 1. Create order  2. Process payment  3. Fetch enrichment data per company
   * 4. Mark as enriched in storage  5. Update local state
   */
  const enrichCompanies = async (ids: string[]): Promise<void> => {
    if (ids.length === 0) return;

    // Create order (no-op for demo, but backend-ready)
    const order = await createEnrichmentOrder(ids);

    // Process payment
    const paymentResult = await processEnrichmentPayment(order.orderId);
    if (!paymentResult.success) {
      throw new Error('Payment failed. Please try again.');
    }

    // Fetch enrichment data for each company in parallel
    const enrichmentMap: Record<string, EnrichmentData> = {};
    await Promise.all(
      ids.map(async id => {
        enrichmentMap[id] = await getCompanyEnrichment(id);
      })
    );

    // Persist to localStorage
    await companiesApi.markAsEnriched(ids, enrichmentMap);

    // Update React state
    setEnrichedIds(prev => Array.from(new Set([...prev, ...ids])));
    setCompanies(prev =>
      prev.map(c => {
        if (ids.includes(c.id)) {
          return {
            ...c,
            enrichmentStatus: 'enriched' as const,
            enrichmentData: enrichmentMap[c.id],
          };
        }
        return c;
      })
    );

    setSuccessMessage(
      `${ids.length} ${ids.length === 1 ? 'company' : 'companies'} successfully enriched.`
    );
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  // ─── Filter helpers ───────────────────────────────────────────────────────

  const updateFilters = (newFilters: Partial<CompanyFilter>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters(initialFilters);
  };

  // ─── Unique dropdown options ──────────────────────────────────────────────

  const uniqueOptions = useMemo(() => {
    const industries = new Set<string>();
    const locations = new Set<string>();
    const ownerships = new Set<string>();

    companies.forEach(c => {
      if (c.industry) industries.add(c.industry);
      if (c.location) {
        const state = c.location.split(',')[1]?.trim() || c.location;
        locations.add(state);
      }
      if (c.ownership) ownerships.add(c.ownership);
    });

    return {
      industries: Array.from(industries),
      locations: Array.from(locations),
      ownerships: Array.from(ownerships),
    };
  }, [companies]);

  // ─── Filtered + sorted companies ─────────────────────────────────────────

  const filteredCompanies = useMemo(() => {
    let result = [...companies];

    if (filters.search.trim()) {
      const query = filters.search.toLowerCase();
      result = result.filter(
        c =>
          c.name.toLowerCase().includes(query) ||
          c.industry.toLowerCase().includes(query) ||
          c.location.toLowerCase().includes(query) ||
          c.whyItMatches.toLowerCase().includes(query)
      );
    }

    if (filters.industry) result = result.filter(c => c.industry === filters.industry);
    if (filters.location) result = result.filter(c => c.location.includes(filters.location));
    if (filters.revenue) result = result.filter(c => c.revenueRange === filters.revenue);
    if (filters.employees) result = result.filter(c => c.employeeRange === filters.employees);
    if (filters.ownership) result = result.filter(c => c.ownership === filters.ownership);
    if (filters.fitLevel) result = result.filter(c => c.fitLevel === filters.fitLevel);

    if (filters.confidence) {
      const minConfidence = parseInt(filters.confidence, 10);
      if (!isNaN(minConfidence)) {
        result = result.filter(c => c.confidenceScore >= minConfidence);
      }
    }

    result.sort((a, b) => {
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      if (sortBy === 'confidence-desc') return b.confidenceScore - a.confidenceScore;
      if (sortBy === 'revenue-desc') {
        const getVal = (range: string) => {
          const matched = range.match(/\d+/);
          return matched ? parseInt(matched[0], 10) : 0;
        };
        return getVal(b.revenueRange) - getVal(a.revenueRange);
      }
      return 0;
    });

    return result;
  }, [companies, filters, sortBy]);

  return {
    companies: filteredCompanies,
    allCompaniesRaw: companies,
    enrichedIds,
    selectedIds,
    loading,
    error,
    successMessage,
    filters,
    sortBy,
    uniqueOptions,
    updateFilters,
    clearFilters,
    setSortBy,
    toggleSelection,
    selectAll,
    clearSelection,
    enrichCompanies,
    refetch: fetchCompanies,
  };
};

