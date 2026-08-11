import { useState, useEffect, useCallback } from 'react';
import type { Mandate } from '../types';
import { mandatesApi } from '../api/mandates';

export const useMandate = (mandateId = 'mandate-101') => {
  const [mandate, setMandate] = useState<Mandate | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchMandate = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await mandatesApi.getMandate(mandateId);
      setMandate(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load acquisition mandate.');
    } finally {
      setLoading(false);
    }
  }, [mandateId]);

  useEffect(() => {
    fetchMandate();
  }, [fetchMandate]);

  const updateMandateFields = async (updates: Partial<Mandate>) => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const updated = await mandatesApi.updateMandate(mandateId, updates);
      setMandate(updated);
      setSuccessMessage('Mandate updated successfully.');
      setTimeout(() => setSuccessMessage(null), 3000);
      return updated;
    } catch (err: any) {
      setError(err?.message || 'Failed to update mandate.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const approveMandate = async () => {
    return updateMandateFields({ status: 'Approved' });
  };

  return {
    mandate,
    loading,
    error,
    successMessage,
    updateMandate: updateMandateFields,
    approveMandate,
    refetch: fetchMandate,
  };
};
