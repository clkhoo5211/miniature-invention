'use client';

import { useState } from 'react';
import { useToast } from '../../components/ToastProvider';

interface BalancesSectionProps {
  balances: Array<{ asset: string; amount: string; network: string }>;
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  walletAddress: string | null;
}

export default function BalancesSection({ 
  balances, 
  loading, 
  refreshing, 
  onRefresh,
  walletAddress 
}: BalancesSectionProps) {
  const { show } = useToast();
  
  return (
    <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8" aria-labelledby="balances-heading">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <h2 id="balances-heading" className="text-xl font-semibold">Your Balances</h2>
        <button
          onClick={onRefresh}
          disabled={loading || refreshing || !walletAddress}
          aria-label="Refresh balances"
          className={`px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base rounded-lg transition ${
            refreshing ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
      
      {!walletAddress ? (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">Connect your wallet to view balances</p>
        </div>
      ) : loading ? (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">Loading balances...</p>
        </div>
      ) : balances.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">No balances found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Asset</th>
                <th scope="col" className="px-4 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {balances.map((balance, index) => (
                <tr key={`${balance.network}-${balance.asset}-${index}`}>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{balance.asset}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">{balance.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}