'use client';

import { useState, useCallback } from 'react';
import { getBalance } from '../lib/api';
import { useToast } from '../app/components/ToastProvider';

export function useBalance() {
  const [balances, setBalances] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { show } = useToast();

  const loadBalances = useCallback(async (address: string, network: string): Promise<Record<string, number>> => {
    if (!address) return {};
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await getBalance(address, network);
      if (result && result.balances) {
        setBalances(result.balances);
        return result.balances;
      } else {
        setError('Failed to load balances');
        return {};
      }
    } catch (err) {
      console.error('Balance loading error:', err);
      setError('Failed to load balances');
      show('Failed to load balances. Please try again.', { type: 'error', title: 'Balance Error' });
      return {};
    } finally {
      setIsLoading(false);
    }
  }, [show]);

  const refreshBalances = useCallback(async (address: string, network: string) => {
    show('Refreshing balances...', { type: 'info' });
    const result = (await loadBalances(address, network)) || {};
    if (Object.keys(result).length > 0) {
      show('Balances refreshed successfully', { type: 'success', title: 'Balances' });
    }
    return result;
  }, [loadBalances, show]);

  return {
    balances,
    isLoading,
    error,
    loadBalances,
    refreshBalances
  };
}