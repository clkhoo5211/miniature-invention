'use client';

import { useEffect, useState } from 'react';
import { getPoolStats, type PoolStats } from '../lib/poolStats';
import { getTxUrl } from '../lib/explorer';

export default function EnhancedPoolStats({ asset, denom, network }: { asset: string; denom: string; network: string }) {
  const [stats, setStats] = useState<PoolStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getPoolStats(asset, denom, network);
        if (mounted) {
          setStats(data);
          setLoading(false);
        }
      } catch {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [asset, denom, network]);

  if (loading) return <div className="text-gray-500">Loading stats...</div>;
  if (!stats) return <div className="text-gray-500">No stats available</div>;

  const lastDepositUrl = stats.lastDepositHash ? getTxUrl(network, stats.lastDepositHash) : null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
        <div className="text-sm text-gray-500 mb-1">Anonymity Set</div>
        <div className="text-2xl font-semibold">{stats.anonymitySet}</div>
      </div>
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
        <div className="text-sm text-gray-500 mb-1">Total Deposits</div>
        <div className="text-2xl font-semibold">{stats.totalDeposits}</div>
      </div>
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
        <div className="text-sm text-gray-500 mb-1">Total Volume</div>
        <div className="text-xl font-semibold">{stats.totalVolume}</div>
      </div>
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
        <div className="text-sm text-gray-500 mb-1">Last 24h</div>
        <div className="text-2xl font-semibold">{stats.depositsLast24h}</div>
      </div>
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
        <div className="text-sm text-gray-500 mb-1">Last 7d</div>
        <div className="text-2xl font-semibold">{stats.depositsLast7d}</div>
      </div>
      {stats.averageDepositInterval && (
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <div className="text-sm text-gray-500 mb-1">Avg Interval</div>
          <div className="text-xl font-semibold">{stats.averageDepositInterval}m</div>
        </div>
      )}
      {stats.lastDepositTime && (
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 col-span-2">
          <div className="text-sm text-gray-500 mb-1">Last Deposit</div>
          <div className="flex items-center justify-between">
            <div className="text-sm">{new Date(stats.lastDepositTime).toLocaleString()}</div>
            {lastDepositUrl && (
              <a href={lastDepositUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-700 text-sm">
                View →
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

