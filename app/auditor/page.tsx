'use client';

import { useState, useEffect } from 'react';
import { getStoredDisclosureBundles, verifyDisclosureBundle, type DisclosureBundle } from '../lib/disclosure';

export default function AuditorPage() {
  const [selectedDisclosure, setSelectedDisclosure] = useState<string | null>(null);
  const [disclosures, setDisclosures] = useState<DisclosureBundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifiedMap, setVerifiedMap] = useState<Record<string, boolean>>({});
  const [verifying, setVerifying] = useState(false);
  const [lastChecked, setLastChecked] = useState<number | null>(null);

  useEffect(() => {
    loadDisclosures();
  }, []);

  const loadDisclosures = () => {
    try {
      const bundles = getStoredDisclosureBundles();
      setDisclosures(bundles);
      // 异步计算校验结果
      setVerifying(true);
      Promise.all(
        bundles.map(async (b) => {
          const ok = await verifyDisclosureBundle(b);
          return { id: b.id, ok };
        })
      ).then(results => {
        const map: Record<string, boolean> = {};
        results.forEach(r => { map[r.id] = r.ok; });
        setVerifiedMap(map);
        setLastChecked(Date.now());
        setVerifying(false);
      }).catch(err => {
        console.error('Verification error:', err);
        setVerifying(false);
      });
    } catch (error) {
      console.error('Error loading disclosures:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString();
  };

  const formatAmount = (amount: string, assetSymbol: string) => {
    return `${parseFloat(amount).toFixed(4)} ${assetSymbol}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Auditor Portal</h1>
          <p className="text-gray-600 dark:text-gray-300">
            View and verify selective disclosure bundles for compliance
          </p>
          {/* Verification status toolbar */}
          <div className="mt-4 flex items-center justify-between">
            {verifying ? (
              <div className="flex items-center text-blue-600">
                <span className="mr-2 inline-block h-4 w-4">
                  <span className="animate-spin inline-block h-4 w-4 rounded-full border-2 border-blue-600 border-t-transparent" />
                </span>
                <span className="text-sm">Verifying disclosure bundles…</span>
              </div>
            ) : (
              lastChecked ? (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Last checked: {new Date(lastChecked).toLocaleString()}
                </div>
              ) : (
                <div className="text-sm text-gray-500 dark:text-gray-400">Not checked yet</div>
              )
            )}
            <button
              type="button"
              onClick={loadDisclosures}
              className="inline-flex items-center rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Refresh disclosure bundles"
              disabled={loading}
            >
              <span className="sr-only">Refresh disclosure bundles</span>
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div role="status" aria-live="polite" className="text-gray-500">
            <span className="sr-only">Loading disclosure bundles</span>
            Loading disclosure bundles...
          </div>
        ) : disclosures.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center" role="region" aria-label="No disclosure bundles">
            <p className="text-gray-500">No disclosure bundles found.</p>
            <p className="text-sm text-gray-400 mt-2">Disclosure bundles will appear here when users enable selective disclosure on withdrawals.</p>
          </div>
        ) : (
          <div className="space-y-4" role="list" aria-label="Disclosure bundles">
            {disclosures.map((disclosure) => {
              const verified = verifiedMap[disclosure.id];
              return (
                <div
                  key={disclosure.id}
                  className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 cursor-pointer transition ${
                    selectedDisclosure === disclosure.id
                      ? 'ring-2 ring-blue-600'
                      : 'hover:shadow-lg'
                  }`}
                  onClick={() => setSelectedDisclosure(disclosure.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedDisclosure(disclosure.id);
                    }
                  }}
                  role="listitem button"
                  tabIndex={0}
                  aria-label={`Disclosure bundle ${disclosure.type} for ${formatAmount(disclosure.amount, disclosure.assetSymbol)}`}
                  aria-pressed={selectedDisclosure === disclosure.id}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold mb-2 capitalize">{disclosure.type}</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Amount:</span>
                          <span className="ml-2 font-medium">{formatAmount(disclosure.amount, disclosure.assetSymbol)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Date:</span>
                          <span className="ml-2 font-medium">{formatDate(disclosure.timestamp)}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-500">Hash:</span>
                          <span className="ml-2 font-mono text-xs">{disclosure.hash.slice(0, 10)}...{disclosure.hash.slice(-8)}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-500">Scope:</span>
                          <span className="ml-2 text-xs">{disclosure.scope.join(', ')}</span>
                        </div>
                      </div>
                    </div>
                    <div
                      className={`px-4 py-2 rounded-lg text-sm font-medium ${
                        verifying && verified === undefined
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                          : verified
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      }`}
                      role="status"
                      aria-live={verifying && verified === undefined ? 'polite' : 'off'}
                      aria-label={`Verification status: ${
                        verifying && verified === undefined
                          ? 'Currently verifying'
                          : verified
                            ? 'Successfully verified'
                            : 'Verification failed'
                      }`}
                    >
                      {verifying && verified === undefined
                        ? 'Verifying…'
                        : verified
                          ? 'Verified'
                          : 'Verification Failed'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {selectedDisclosure && (() => {
          const bundle = disclosures.find((d) => d.id === selectedDisclosure);
          if (!bundle) return null;
          
          return (
            <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Disclosure Details</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Type:</span>
                  <span className="font-medium capitalize">{bundle.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Amount:</span>
                  <span className="font-medium">{formatAmount(bundle.amount, bundle.assetSymbol)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Asset:</span>
                  <span className="font-medium">{bundle.assetSymbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Sender:</span>
                  <span className="font-mono text-xs">{bundle.senderAddress.slice(0, 8)}...{bundle.senderAddress.slice(-6)}</span>
                </div>
                {bundle.recipientAddress && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Recipient:</span>
                    <span className="font-mono text-xs">{bundle.recipientAddress.slice(0, 8)}...{bundle.recipientAddress.slice(-6)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Date:</span>
                  <span className="font-medium">{formatDate(bundle.timestamp)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Hash:</span>
                  <span className="font-mono text-xs break-all">{bundle.hash}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Scope:</span>
                  <span className="text-xs">{bundle.scope.join(', ')}</span>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `disclosure-bundle-${bundle.id}.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition"
                  >
                    Download Disclosure Bundle
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
