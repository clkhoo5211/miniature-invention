'use client';

import Link from 'next/link';

const assets = [
  { id: 'ETH', name: 'Ethereum', denominations: ['0.1', '1', '10'] },
  // Future: add more assets
];

export default function PoolsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-6">Pools</h1>
        <div className="space-y-6">
          {assets.map(asset => (
            <div key={asset.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">{asset.name}</h2>
              </div>
              <div className="flex gap-3">
                {asset.denominations.map(denom => (
                  <Link key={denom} href={`/pools/${asset.id}/${denom}/`} className="px-3 py-2 rounded border hover:bg-gray-100 dark:hover:bg-gray-700">
                    {denom} {asset.id}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
