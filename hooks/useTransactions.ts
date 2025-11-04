'use client';

import { useState, useCallback } from 'react';
import { listTxHistory } from '../lib/api';
import { useToast } from '../app/components/ToastProvider';

export interface Transaction {
  id: string;
  type: string;
  amount: number;
  asset: string;
  timestamp: string;
  txHash: string;
}

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { show } = useToast();

  const loadTransactions = useCallback(async (address: string, network: string) => {
    if (!address) return [];
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await listTxHistory(address, network);
      if (result && Array.isArray(result.transactions)) {
        setTransactions(result.transactions);
        return result.transactions;
      } else {
        setError('Failed to load transaction history');
        return [];
      }
    } catch (err) {
      console.error('Transaction history loading error:', err);
      setError('Failed to load transaction history');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshTransactions = useCallback(async (address: string, network: string) => {
    show('Refreshing transaction history...', { type: 'info' });
    const result = await loadTransactions(address, network);
    if (result.length > 0) {
      show('Transaction history refreshed', { type: 'success', title: 'History' });
    }
    return result;
  }, [loadTransactions, show]);

  return {
    transactions,
    isLoading,
    error,
    loadTransactions,
    refreshTransactions
  };
}