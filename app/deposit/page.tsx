'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { validateAddress, validateAmount, validateAsset } from '../lib/validation';
// Use the project-level API wrapper to ensure typed balances
import { prepareDeposit, signAndSendTransaction, screenAddress, generateDummyProof, getBalance } from '../../lib/api';
import { connectWallet, getWalletState, waitForTransactionReceipt } from '../lib/wallet';
import type { ProofInput } from '@/src/prover/proof';
import { generateNote, saveNoteToVault, addTxRecord } from '../lib/note';
import { useToast } from '../components/ToastProvider';

// Explicit type to avoid accidental string inference on getBalance result
type BalanceResult = { balances: Record<string, number> } | null;

const ScreeningPanel = dynamic(() => import('./components/ScreeningPanel'), {
  ssr: false,
  loading: () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6 mb-6 animate-pulse">
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-4"></div>
      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
    </div>
  )
});

const ProofGenerationPanel = dynamic(() => import('./components/ProofGenerationPanel'), {
  ssr: false,
  loading: () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6 mb-6 animate-pulse">
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-4"></div>
      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
    </div>
  )
});

export default function DepositPage() {
  const [selectedNetwork, setSelectedNetwork] = useState('ethereum');
  const [selectedAsset, setSelectedAsset] = useState('ETH');
  const [amount, setAmount] = useState('');
  const [screeningStatus, setScreeningStatus] = useState<'pending' | 'pass' | 'fail'>('pending');
  const [proofStatus, setProofStatus] = useState<'idle' | 'generating' | 'complete'>('idle');
  const [txStatus, setTxStatus] = useState<'idle' | 'signing' | 'pending' | 'success' | 'error'>('idle');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [noteText, setNoteText] = useState<string | null>(null);
  const [showAdvancedPanels, setShowAdvancedPanels] = useState(false);
  // Use unknown instead of any to avoid implicit any issues
  const [proofData, setProofData] = useState<unknown>(null);
  const [lastScreened, setLastScreened] = useState<number | null>(null);
  const [lastProofGenerated, setLastProofGenerated] = useState<number | null>(null);
  const router = useRouter();
  const { show } = useToast();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAdvancedPanels(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const networks = [
    { id: 'ethereum', name: 'Ethereum', chainId: 1 },
    { id: 'polygon', name: 'Polygon', chainId: 137 },
    { id: 'arbitrum', name: 'Arbitrum', chainId: 42161 },
    { id: 'optimism', name: 'Optimism', chainId: 10 },
  ];

  const assets = {
    ethereum: ['ETH', 'USDC', 'USDT'],
    polygon: ['MATIC', 'USDC', 'USDT'],
    arbitrum: ['ETH', 'USDC', 'USDT'],
    optimism: ['ETH', 'USDC', 'USDT'],
  };

  // Balances state
  const [balances, setBalances] = useState<Record<string, number> | null>(null);
  const [balancesLoading, setBalancesLoading] = useState<boolean>(false);
  const [balancesError, setBalancesError] = useState<string | null>(null);

  // Load balances when network changes or wallet connects
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setBalancesLoading(true);
        setBalancesError(null);
        const ws = await getWalletState();
        if (!ws.address) {
          setBalances(null);
          setBalancesLoading(false);
          return;
        }
        const res: BalanceResult = await getBalance(ws.address, selectedNetwork);
        if (!cancelled) {
          setBalances(res && res.balances ? res.balances : null);
        }
      } catch (err) {
        console.error('Balances load error:', err);
        if (!cancelled) setBalancesError('Failed to load balances');
      } finally {
        if (!cancelled) setBalancesLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [selectedNetwork]);

  const refreshBalances = async () => {
    try {
      setBalancesLoading(true);
      setBalancesError(null);
      const ws = await getWalletState();
      if (!ws.address) {
        setBalances(null);
        setBalancesLoading(false);
        show('Connect wallet to load balances', { type: 'info', title: 'Wallet' });
        return;
      }
      const res: BalanceResult = await getBalance(ws.address, selectedNetwork);
      setBalances(res && res.balances ? res.balances : null);
    } catch (err) {
      console.error('Balances refresh error:', err);
      setBalancesError('Failed to refresh balances');
    } finally {
      setBalancesLoading(false);
    }
  };

  const useMax = () => {
    try {
      const b = balances?.[selectedAsset];
      if (typeof b === 'number') {
        const formatted = Number(b).toFixed(6).replace(/\.0+$/, '');
        setAmount(formatted);
      }
    } catch (e) {
      console.error('Use Max error:', e);
    }
  };

  const handleScreening = async () => {
    try {
      setScreeningStatus('pending');
      const walletState = await getWalletState();
      if (!walletState.address) {
        show('Please connect your wallet first', { type: 'error', title: 'Wallet Required' });
        setScreeningStatus('pending');
        return;
      }
      const result = await screenAddress(walletState.address);
      if (result.ok) {
        setScreeningStatus('pass');
        setLastScreened(Date.now());
        show('Address screening passed', { type: 'success', title: 'Screening' });
      } else {
        setScreeningStatus('fail');
        setLastScreened(Date.now());
        show(`Screening failed: ${result.reasons?.join(', ') || 'Address flagged'}`, { type: 'error', title: 'Screening Failed' });
      }
    } catch (error) {
      console.error('Screening error:', error);
      setScreeningStatus('fail');
      setLastScreened(Date.now());
      show('Screening failed. Please try again.', { type: 'error', title: 'Screening Error' });
    }
  };

  const handleGenerateProof = async () => {
    if (!amount || screeningStatus !== 'pass') return;
    
    try {
      setProofStatus('generating');
      const walletState = await getWalletState();
      if (!walletState.address) {
        show('Please connect your wallet first', { type: 'error', title: 'Wallet Required' });
        setProofStatus('idle');
        return;
      }

      const amountValidation = validateAmount(amount);
      if (!amountValidation.isValid) {
        show(amountValidation.error || 'Invalid amount', { type: 'error', title: 'Validation Error' });
        setProofStatus('idle');
        return;
      }

      const assetValidation = validateAsset(selectedAsset, selectedNetwork);
      if (!assetValidation.isValid) {
        show(assetValidation.error || 'Invalid asset', { type: 'error', title: 'Validation Error' });
        setProofStatus('idle');
        return;
      }

      const proofInput: ProofInput = {
        assetSymbol: selectedAsset,
        amount,
        senderAddress: walletState.address,
        nonce: Date.now().toString(),
      };

      const proof = await generateDummyProof(proofInput);
      sessionStorage.setItem('lastProof', JSON.stringify(proof));
      setProofStatus('complete');
      setLastProofGenerated(Date.now());

      const note = generateNote({ asset: selectedAsset, denomination: amount });
      setNoteText(note.note);
      saveNoteToVault(note);
      show('Proof generated successfully', { type: 'success', title: 'Proof Generation' });
    } catch (error) {
      console.error('Proof generation error:', error);
      show('Failed to generate proof', { type: 'error', title: 'Proof Error' });
      setProofStatus('idle');
    }
  };

  const handleSubmit = async () => {
    if (proofStatus !== 'complete') return;

    try {
      const walletState = await getWalletState();
      if (!walletState.address) {
        show('Please connect your wallet first', { type: 'error', title: 'Wallet Required' });
        return;
      }

      const proofJson = sessionStorage.getItem('lastProof');
      if (!proofJson) {
        show('Proof not found. Please generate proof first.', { type: 'error', title: 'Proof Required' });
        return;
      }

      const proof = JSON.parse(proofJson);
      
      const calldata = await prepareDeposit({
        network: selectedNetwork,
        assetSymbol: selectedAsset,
        amount,
        address: walletState.address,
        proof,
      });

      const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';

      if (!calldata || calldata === '0x') {
        show('Transaction calldata not available. Contract may not be deployed.', { type: 'error', title: 'Transaction Error' });
        return;
      }

      setTxStatus('signing');
      const amountInWei = BigInt(Math.floor(parseFloat(amount) * 1e18)).toString();
      const hash = await signAndSendTransaction({
        network: selectedNetwork,
        to: contractAddress,
        data: calldata,
        value: selectedAsset === 'ETH' || selectedAsset === 'MATIC' ? amountInWei : undefined,
      });

      setTxHash(hash);
      setTxStatus('pending');
      
      try {
        await waitForTransactionReceipt(hash, 120000);
        setTxStatus('success');
        addTxRecord({ type: 'deposit', asset: selectedAsset, amount, network: selectedNetwork, hash, timestamp: new Date().toISOString() });
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } catch (receiptError) {
        console.error('Receipt error:', receiptError);
        setTxStatus('pending');
      }
    } catch (error) {
      console.error('Submit error:', error);
      setTxStatus('error');
      show(`Transaction failed: ${error instanceof Error ? error.message : 'Unknown error'}`, { type: 'error', title: 'Transaction Failed' });
      setTimeout(() => {
        setTxStatus('idle');
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 sm:py-8">
      <main className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Deposit Funds</h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Transaction Details</h2>
          
          <div className="mb-4">
            <label htmlFor="network" className="block text-sm font-medium mb-1">Network</label>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-labelledby="network-label">
              {networks.map((network) => (
                <button
                  key={network.id}
                  type="button"
                  onClick={() => setSelectedNetwork(network.id)}
                  className={`px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base rounded-lg transition ${
                    selectedNetwork === network.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
                  }`}
                  aria-checked={selectedNetwork === network.id}
                  role="radio"
                >
                  {network.name}
                </button>
              ))}
            </div>
          </div>
          
          <div className="mb-4">
            <label htmlFor="asset" className="block text-sm font-medium mb-1">Asset</label>
            <div className="flex flex-wrap gap-2">
              {assets[selectedNetwork as keyof typeof assets].map((asset) => (
                <button
                  key={asset}
                  type="button"
                  onClick={() => setSelectedAsset(asset)}
                  className={`px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base rounded-lg transition ${
                    selectedAsset === asset
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
                  }`}
                >
                  {asset}
                </button>
              ))}
            </div>
          </div>
          
          <div className="mb-6">
            <label htmlFor="amount" className="block text-sm font-medium mb-1">Amount</label>
            <div className="relative">
              <input
                type="text"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm sm:text-base"
                placeholder={`Enter amount in ${selectedAsset}`}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
                <button type="button" onClick={useMax} className="px-2 py-1 text-xs rounded bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600">Use Max</button>
              </div>
            </div>
          </div>
        </div>

        {/* Balances widget */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold">Balances</h2>
            <button
              type="button"
              onClick={refreshBalances}
              className="px-3 py-1.5 text-sm rounded bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600"
            >
              {balancesLoading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
          {balancesError && (
            <div className="text-sm text-red-600 dark:text-red-400 mb-2">{balancesError}</div>
          )}
          {!balances && !balancesLoading && (
            <div className="text-sm text-gray-600 dark:text-gray-400">Connect your wallet to view balances on {selectedNetwork}.</div>
          )}
          {balancesLoading && (
            <div className="animate-pulse text-sm text-gray-600 dark:text-gray-400">Loading balances...</div>
          )}
          {balances && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {assets[selectedNetwork as keyof typeof assets].map((asset) => (
                <div
                  key={`bal-${asset}`}
                  className={`rounded border p-3 text-sm ${
                    selectedAsset === asset
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <div className="font-medium">{asset}</div>
                  <div className="mt-1 text-gray-700 dark:text-gray-300">
                    {typeof balances[asset] === 'number' ? balances[asset].toFixed(6).replace(/\.0+$/, '') : '0'}
                  </div>
                </div>
              ))}
            </div>
          )}
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">Balances are fetched from the selected network and include native and supported ERC20 tokens.</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Diagnostics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Screening Status</div>
              <div className="mt-1">
                <span
                  className={`inline-flex items-center px-2 py-1 rounded text-sm font-medium ${
                    screeningStatus === 'pass'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : screeningStatus === 'fail'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                  }`}
                >
                  {screeningStatus === 'pending' ? 'Pending' : screeningStatus === 'pass' ? 'Pass' : 'Fail'}
                </span>
              </div>
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Last screened: {lastScreened ? new Date(lastScreened).toLocaleString() : '—'}
              </div>
              <div className="mt-3">
                <button
                  type="button"
                  onClick={handleScreening}
                  className="px-3 py-1.5 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
                >
                  Rescreen Address
                </button>
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Proof Status</div>
              <div className="mt-1">
                <span
                  className={`inline-flex items:center px-2 py-1 rounded text-sm font-medium ${
                    proofStatus === 'complete'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : proofStatus === 'generating'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                  }`}
                >
                  {proofStatus === 'idle' ? 'Idle' : proofStatus === 'generating' ? 'Generating' : 'Complete'}
                </span>
              </div>
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Last proof generated: {lastProofGenerated ? new Date(lastProofGenerated).toLocaleString() : '—'}
              </div>
              <div className="mt-3">
                <button
                  type="button"
                  onClick={handleGenerateProof}
                  disabled={screeningStatus !== 'pass' || !amount}
                  className={`px-3 py-1.5 text-sm rounded ${
                    screeningStatus !== 'pass' || !amount
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                  title={
                    screeningStatus !== 'pass'
                      ? 'Screening must pass before generating proof'
                      : !amount
                      ? 'Enter an amount to generate proof'
                      : 'Regenerate proof'
                  }
                >
                  Regenerate Proof
                </button>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400">
            Tip: Use Diagnostics to quickly re-run screening or regenerate proof if network or inputs changed.
          </p>
        </div>

        {showAdvancedPanels ? (
          <Suspense fallback={
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6 mb-6 animate-pulse">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-4"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            </div>
          }>
            <ScreeningPanel 
              onScreeningComplete={(status) => {
                if (status === 'pass') {
                  show('Address screening passed', { type: 'success' });
                }
              }}
              screeningStatus={screeningStatus}
              setScreeningStatus={setScreeningStatus}
            />
          </Suspense>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6 mb-6 animate-pulse">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-4"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          </div>
        )}

        {showAdvancedPanels && screeningStatus === 'pass' && (
          <Suspense fallback={
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6 mb-6 animate-pulse">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-4"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            </div>
          }>
            <ProofGenerationPanel
              amount={amount}
              selectedAsset={selectedAsset}
              selectedNetwork={selectedNetwork}
              onProofComplete={setProofData}
              proofStatus={proofStatus}
              setProofStatus={setProofStatus}
              screeningStatus={screeningStatus}
            />
          </Suspense>
        )}
        
        {proofStatus === 'complete' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Submit Transaction</h2>
            <button
              onClick={handleSubmit}
              disabled={txStatus !== 'idle'}
              className={`w-full py-2 px-4 rounded-lg text-white ${
                txStatus !== 'idle' ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {txStatus === 'idle' ? 'Submit Transaction' : 'Processing...'}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}