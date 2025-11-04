'use client';

import { useState } from 'react';
import { listTxHistory, type TxRecord } from '../lib/note';

export default function HistoryPage() {
  const [items] = useState<TxRecord[]>(() => {
    try {
      return listTxHistory();
    } catch {
      return [];
    }
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-6">History</h1>
        {items.length === 0 ? (
          <div className="text-gray-500">No history yet.</div>
        ) : (
          <div className="space-y-3">
            {items.map((it, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-sm">
                <div className="flex justify-between">
                  <div className="font-medium">{it.type.toUpperCase()}</div>
                  <div className="text-gray-500">{new Date(it.timestamp).toLocaleString()}</div>
                </div>
                <div className="mt-1 text-gray-600 dark:text-gray-300">
                  {it.amount} {it.asset} • {it.network}
                  {it.address ? ` → ${it.address}` : ''}
                </div>
                {it.hash && (
                  <div className="mt-1 break-all text-gray-500">{it.hash}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
