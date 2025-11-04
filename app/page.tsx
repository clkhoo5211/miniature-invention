'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';

const PoolStatsClient = dynamic(() => import('./components/PoolStatsClient'), { ssr: false });

const pools = [
  { asset: 'ETH', denominations: [{ value: '0.1', label: '0.1 ETH' }, { value: '1', label: '1 ETH' }, { value: '10', label: '10 ETH' }] },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Compliant Private Transfers
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Privacy-forward, KYC-gated shielded transfers with zk proofs
          </p>
        </div>

        {/* Pools Section - Tornado Cash style */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Select Pool</h2>
          <div className="space-y-6">
            {pools.map((pool) => (
              <div key={pool.asset} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">{pool.asset}</h3>
                  <Link href="/pools/" className="text-sm text-blue-600 hover:text-blue-700">
                    View all →
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {pool.denominations.map((denom) => (
                    <Link
                      key={denom.value}
                      href={`/pools/${pool.asset}/${denom.value}/`}
                      className="border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 rounded-lg p-4 transition group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold text-lg">{denom.label}</div>
                        <div className="text-blue-600 opacity-0 group-hover:opacity-100 transition">→</div>
                      </div>
                      <div className="text-sm text-gray-500">Anonymity Set:</div>
                      <PoolStatsClient asset={pool.asset} denom={denom.value} />
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link
            href="/deposit"
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition"
          >
            <h2 className="text-xl font-semibold mb-2">Deposit</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Shielded deposit with zk proof-of-funds
            </p>
          </Link>
          <Link
            href="/withdraw"
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition"
          >
            <h2 className="text-xl font-semibold mb-2">Withdraw</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Create withdrawal with selective disclosure
            </p>
          </Link>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Multi-Chain Support</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Ethereum, Polygon, Arbitrum, Optimism, Solana, BNB Chain, and TRON
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">KYC & Compliance</h2>
            <p className="text-gray-600 dark:text-gray-300">
              ICP Internet Identity integration with OFAC/AML screening
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Privacy Forward</h2>
            <p className="text-gray-600 dark:text-gray-300">
              zk proofs for proof-of-funds with selective disclosure
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

