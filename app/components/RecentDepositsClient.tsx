'use client';

import { useMemo } from 'react';
import { listTxHistory, type TxRecord } from '../lib/note';

export default function RecentDepositsClient({ asset, denom }: { asset: string; denom: string }) {
  const items: TxRecord[] = useMemo(() => {
    try {
      const all = listTxHistory();
      return all
        .filter(it => it.type === 'deposit' && it.asset === asset && it.amount === denom)
        .slice(0, 5);
    } catch {
      return [];
    }
  }, [asset, denom]);

  if (items.length === 0) return <div className="text-gray-500 text-sm">No recent deposits</div>;

  return (
    <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
      {items.map((it, idx) => (
        <div key={idx} className="flex justify-between">
          <span>{new Date(it.timestamp).toLocaleString()}</span>
          <span>{it.amount} {asset}</span>
        </div>
      ))}
    </div>
  );
}
