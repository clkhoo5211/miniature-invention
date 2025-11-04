'use client';

import Link from 'next/link';
import { getTxUrl } from '../../lib/explorer';

interface RecentActivitySectionProps {
  recentTx: Array<{
    type: string;
    amount: string;
    asset: string;
    network: string;
    hash?: string;
    timestamp: string;
  }>;
}

export default function RecentActivitySection({ recentTx }: RecentActivitySectionProps) {
  return (
    <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6 mb-6 sm:mb-8" aria-labelledby="activity-heading">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 sm:mb-4 gap-2">
        <h2 id="activity-heading" className="text-xl font-semibold">Recent Activity</h2>
        <Link 
          href="/transactions" 
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm sm:text-base"
          aria-label="View all transactions"
        >
          View All
        </Link>
      </div>
      
      {recentTx.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">No recent transactions</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-4 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {recentTx.map((tx, index) => (
                <tr key={index}>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      tx.type === 'deposit' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                      'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    }`}>
                      {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {tx.amount} {tx.asset}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(tx.timestamp).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-right">
                    {tx.hash ? (
                      <a 
                        href={getTxUrl(tx.network, tx.hash)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        aria-label={`View transaction ${tx.hash.substring(0, 6)}... on block explorer`}
                      >
                        View
                      </a>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-600">N/A</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}