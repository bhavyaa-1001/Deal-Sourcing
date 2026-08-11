import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Company, CompanyFilter } from '../types';
import { companiesApi } from '../api/companies';

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
  const [companies, setCompanies] = useState<Company[]>([]);
  const [shortlistIds, setShortlistIds] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filter and Sorting State
  const [filters, setFilters] = useState<CompanyFilter>(initialFilters);
  const [sortBy, setSortBy] = useState<string>('confidence-desc'); // name-asc, confidence-desc, revenue-desc
  
  // Selection for comparison (max 4)
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await companiesApi.getCompanies();
      setCompanies(data.companies);
      setShortlistIds(data.shortlistIds);
    } catch (err: any) {
      setError(err?.message || 'Failed to load discovered companies.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const toggleShortlist = async (id: string) => {
    setError(null);
    try {
      const company = companies.find(c => c.id === id);
      const isCurrentlyShortlisted = shortlistIds.includes(id);
      
      const updatedIds = await companiesApi.toggleShortlist(id);
      setShortlistIds(updatedIds);
      
      if (!isCurrentlyShortlisted && company) {
        setSuccessMessage(`"${company.name}" added to shortlist.`);
      } else if (company) {
        setSuccessMessage(`"${company.name}" removed from shortlist.`);
      }
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err?.message || 'Failed to update shortlist.');
    }
  };

  const updateFilters = (newFilters: Partial<CompanyFilter>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters(initialFilters);
  };

  const toggleComparisonSelection = (id: string) => {
    setSelectedForComparison(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      }
      if (prev.length >= 4) {
        // Limit to 4 companies
        return prev;
      }
      return [...prev, id];
    });
  };

  const clearComparison = () => {
    setSelectedForComparison([]);
  };

  // Helper to extract dropdown options from raw data
  const uniqueOptions = useMemo(() => {
    const industries = new Set<string>();
    const locations = new Set<string>();
    const ownerships = new Set<string>();

    companies.forEach(c => {
      if (c.industry) industries.add(c.industry);
      // Simplify location to state or main city for dropdown filters
      if (c.location) {
        const state = c.location.split(',')[1]?.trim() || c.location;
        locations.add(state);
      }
      if (c.ownership) {
        // e.g. "Private (Founder Owned)" -> simplify or keep exact
        ownerships.add(c.ownership);
      }
    });

    return {
      industries: Array.from(industries),
      locations: Array.from(locations),
      ownerships: Array.from(ownerships),
    };
  }, [companies]);

  // Apply filters and sorting
  const filteredCompanies = useMemo(() => {
    let result = [...companies];

    // Search query
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

    // Industry Filter
    if (filters.industry) {
      result = result.filter(c => c.industry === filters.industry);
    }

    // Location Filter (State match)
    if (filters.location) {
      result = result.filter(c => c.location.includes(filters.location));
    }

    // Revenue Filter (rough matching or exact range)
    if (filters.revenue) {
      result = result.filter(c => c.revenueRange === filters.revenue);
    }

    // Employees Filter
    if (filters.employees) {
      result = result.filter(c => c.employeeRange === filters.employees);
    }

    // Ownership Filter
    if (filters.ownership) {
      result = result.filter(c => c.ownership === filters.ownership);
    }

    // Fit Level Filter
    if (filters.fitLevel) {
      result = result.filter(c => c.fitLevel === filters.fitLevel);
    }

    // Confidence Filter
    if (filters.confidence) {
      const minConfidence = parseInt(filters.confidence, 10);
      if (!isNaN(minConfidence)) {
        result = result.filter(c => c.confidenceScore >= minConfidence);
      }
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'name-asc') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'confidence-desc') {
        return b.confidenceScore - a.confidenceScore;
      } else if (sortBy === 'revenue-desc') {
        // simple heuristic: extract first digits
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

  // Derived arrays
  const shortlistedCompanies = useMemo(() => {
    return companies.filter(c => shortlistIds.includes(c.id));
  }, [companies, shortlistIds]);

  const comparisonCompanies = useMemo(() => {
    return companies.filter(c => selectedForComparison.includes(c.id));
  }, [companies, selectedForComparison]);

  return {
    companies: filteredCompanies,
    allCompaniesRaw: companies,
    shortlistedCompanies,
    shortlistIds,
    comparisonCompanies,
    selectedForComparison,
    loading,
    error,
    successMessage,
    filters,
    sortBy,
    uniqueOptions,
    updateFilters,
    clearFilters,
    setSortBy,
    toggleShortlist,
    toggleComparisonSelection,
    clearComparison,
    refetch: fetchCompanies,
  };
};
