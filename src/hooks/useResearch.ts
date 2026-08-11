import { useState, useEffect, useCallback } from 'react';
import type { ResearchStrategy } from '../types';
import { researchApi } from '../api/research';

export const useResearch = (mandateId = 'mandate-101') => {
  const [strategy, setStrategy] = useState<ResearchStrategy | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchStrategy = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await researchApi.getResearchStrategy(mandateId);
      setStrategy(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load research strategy.');
    } finally {
      setLoading(false);
    }
  }, [mandateId]);

  useEffect(() => {
    fetchStrategy();
  }, [fetchStrategy]);

  const toggleGap = async (gapId: string) => {
    setError(null);
    try {
      const updated = await researchApi.toggleGapAcknowledgement(mandateId, gapId);
      setStrategy(updated);
    } catch (err: any) {
      setError(err?.message || 'Failed to update gap status.');
    }
  };

  const approveStrategy = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const updated = await researchApi.approveResearchStrategy(mandateId);
      setStrategy(updated);
      setSuccessMessage('Research strategy approved successfully.');
      setTimeout(() => setSuccessMessage(null), 3000);
      return updated;
    } catch (err: any) {
      setError(err?.message || 'Failed to approve research strategy.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    strategy,
    loading,
    error,
    successMessage,
    toggleGap,
    approveStrategy,
    refetch: fetchStrategy,
  };
};
