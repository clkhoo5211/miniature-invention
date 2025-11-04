'use client';

import { useState, useEffect } from 'react';
import { getActiveRelayers, getRelayerQuote, type Relayer } from '../lib/relayers';
import { getWalletState } from '../lib/wallet';
import { useToast } from '../components/ToastProvider';

export default function RelayersPage() {
  const [selectedRelayer, setSelectedRelayer] = useState<string | null>(null);
  const [relayers, setRelayers] = useState<Relayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNetwork, setSelectedNetwork] = useState('ethereum');
  const [quote, setQuote] = useState<{ fee: string; ttlSeconds: number } | null>(null);
  const [quoteAmount, setQuoteAmount] = useState('');
  const { show } = useToast();

  const networks = [
    { id: 'ethereum', name: 'Ethereum' },
    { id: 'polygon', name: 'Polygon' },
    { id: 'arbitrum', name: 'Arbitrum' },
    { id: 'optimism', name: 'Optimism' },
  ];

  useEffect(() => {
    loadRelayers();
  }, [selectedNetwork]);

  const loadRelayers = () => {
    try {
      const activeRelayers = getActiveRelayers(selectedNetwork);
      setRelayers(activeRelayers);
    } catch (error) {
      console.error('Error loading relayers:', error);
      setRelayers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGetQuote = async (relayerId: string) => {
    if (!quoteAmount || parseFloat(quoteAmount) <= 0) {
      show('Please enter a valid amount', { type: 'error', title: 'Validation Error' });
      return;
    }

    try {
      const amountInWei = BigInt(Math.floor(parseFloat(quoteAmount) * 1e18)).toString();
      const relayerQuote = await getRelayerQuote(relayerId, selectedNetwork, amountInWei);
      
      if (relayerQuote) {
        setQuote(relayerQuote);
        setSelectedRelayer(relayerId);
        show('Quote received successfully', { type: 'success', title: 'Quote' });
      } else {
        show('Failed to get quote from relayer', { type: 'error', title: 'Quote Error' });
      }
    } catch (error) {
      console.error('Error getting quote:', error);
      show('Failed to get quote', { type: 'error', title: 'Quote Error' });
    }
  };

  const formatFee = (feeWei: string) => {
    const feeEth = (BigInt(feeWei) / BigInt(1e18)).toString();
    const feeFormatted = (Number(feeEth) / 1e18).toFixed(6);
    return `${feeFormatted} ETH`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Relayer Marketplace</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Select an allowlisted relayer for your transaction
          </p>
        </div>

        {/* Network Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Network</label>
          <div className="flex space-x-2">
            {networks.map((network) => (
              <button
                key={network.id}
                onClick={() => setSelectedNetwork(network.id)}
                className={`px-4 py-2 rounded-lg transition ${
                  selectedNetwork === network.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {network.name}
              </button>
            ))}
          </div>
        </div>

        {/* Quote Amount Input */}
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <label className="block text-sm font-medium mb-2">Get Quote for Amount</label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={quoteAmount}
              onChange={(e) => setQuoteAmount(e.target.value)}
              placeholder="0.0 ETH"
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <button
              onClick={async () => {
                if (!quoteAmount || parseFloat(quoteAmount) <= 0) return;
                const walletState = await getWalletState();
                if (walletState.address && relayers.length > 0) {
                  handleGetQuote(relayers[0].id);
                } else {
                  show('Please connect wallet and ensure relayers are available', { type: 'warning', title: 'Requirements' });
                }
              }}
              disabled={!quoteAmount || parseFloat(quoteAmount) <= 0}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition"
            >
              Get Quote
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading relayers...</p>
        ) : relayers.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
            <p className="text-gray-500">No active relayers found for this network.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {relayers.map((relayer) => (
              <div
                key={relayer.id}
                className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 cursor-pointer transition ${
                  selectedRelayer === relayer.id
                    ? 'ring-2 ring-blue-600'
                    : 'hover:shadow-lg'
                }`}
                onClick={() => setSelectedRelayer(relayer.id)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{relayer.name}</h3>
                    <div className="grid grid-cols-3 gap-4 text-sm mb-2">
                      <div>
                        <span className="text-gray-500">Fee:</span>
                        <span className="ml-2 font-medium">{relayer.feeFormatted}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">SLA:</span>
                        <span className="ml-2 font-medium">{relayer.sla}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Risk:</span>
                        <span className={`ml-2 px-2 py-1 rounded text-xs ${
                          relayer.riskBadge === 'Low Risk'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : relayer.riskBadge === 'Medium Risk'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                          {relayer.riskBadge}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Address: {relayer.address.slice(0, 8)}...{relayer.address.slice(-6)}
                    </div>
                  </div>
                  <div className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    relayer.status === 'Active'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {relayer.status}
                  </div>
                </div>
                {quote && selectedRelayer === relayer.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Quote Fee:</span>
                      <span className="font-semibold text-green-600">{formatFee(quote.fee)}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Quote valid for {quote.ttlSeconds} seconds
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {selectedRelayer && (
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Selected Relayer</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              You have selected {relayers.find((r) => r.id === selectedRelayer)?.name}
            </p>
            {quote && (
              <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <div className="text-sm">
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-500">Estimated Fee:</span>
                    <span className="font-medium">{formatFee(quote.fee)}</span>
                  </div>
                </div>
              </div>
            )}
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition">
              Proceed with Transaction
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
