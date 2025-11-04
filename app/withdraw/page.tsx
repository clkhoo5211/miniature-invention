'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { validateAddress, validateAmount } from '../lib/validation';
import { generateDummyProof, prepareWithdraw, signAndSendTransaction } from '../lib/api';
import { getWalletState, waitForTransactionReceipt } from '../lib/wallet';
import { generateDisclosureBundle, storeDisclosureBundle } from '../lib/disclosure';
import type { ProofInput } from '@/src/prover/proof';
import { parseNote, validateNote, listNotesFromVault, addTxRecord, isNoteInVault } from '../lib/note';
import { getActiveRelayers, getRelayerQuote, type Relayer } from '../lib/relayers';
import { useToast } from '../components/ToastProvider';

export default function WithdrawPage() {
  const [destinationAddress, setDestinationAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState('ethereum');
  const [disclosureEnabled, setDisclosureEnabled] = useState(false);
  const [proofStatus, setProofStatus] = useState<'idle' | 'generating' | 'complete'>('idle');
  const [txStatus, setTxStatus] = useState<'idle' | 'signing' | 'pending' | 'success' | 'error'>('idle');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [vaultNotes, setVaultNotes] = useState<string[]>([]);
  const [relayers, setRelayers] = useState<Relayer[]>([]);
  const [selectedRelayer, setSelectedRelayer] = useState<string | null>(null);
  const [quote, setQuote] = useState<string | null>(null);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [lastProofGenerated, setLastProofGenerated] = useState<number | null>(null);
  const [lastTxSubmitted, setLastTxSubmitted] = useState<number | null>(null);
  const [lastDisclosureGenerated, setLastDisclosureGenerated] = useState<number | null>(null);
  const router = useRouter();
  const { show } = useToast();

  const networks = [
    { id: 'ethereum', name: 'Ethereum', chainId: 1 },
    { id: 'polygon', name: 'Polygon', chainId: 137 },
    { id: 'arbitrum', name: 'Arbitrum', chainId: 42161 },
    { id: 'optimism', name: 'Optimism', chainId: 10 },
  ];

  useEffect(() => {
    try {
      const notes = listNotesFromVault();
      setVaultNotes(notes.map(n => n.note));
    } catch {}
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const list = getActiveRelayers(selectedNetwork);
        setRelayers(list);
        setSelectedRelayer(list[0]?.id || null);
      } catch {
        setRelayers([]);
        setSelectedRelayer(null);
      }
    })();
  }, [selectedNetwork]);

  const handleGenerateProof = async () => {
    if (!destinationAddress || !amount) return;
    try {
      const addressValidation = validateAddress(destinationAddress);
      if (!addressValidation.isValid) { 
        show(addressValidation.error || 'Invalid address', { type: 'error', title: 'Validation Error' }); 
        return; 
      }
      const amountValidation = validateAmount(amount);
      if (!amountValidation.isValid) { 
        show(amountValidation.error || 'Invalid amount', { type: 'error', title: 'Validation Error' }); 
        return; 
      }

      // If note provided, validate and align amount if needed (lightweight)
      if (noteText) {
        if (!validateNote(noteText)) {
          show('Invalid note format', { type: 'error', title: 'Note Error' });
          return;
        }
        if (!isNoteInVault(noteText)) {
          if (!confirm('Note not found in local vault. Continue anyway?')) return;
        }
        const parsed = parseNote(noteText);
        if (parsed?.denomination && !amount) setAmount(parsed.denomination);
      }

      setProofStatus('generating');
      const walletState = await getWalletState();
      if (!walletState.address) { 
        show('Please connect your wallet first', { type: 'error', title: 'Wallet Required' }); 
        setProofStatus('idle'); 
        return; 
      }

      const proofInput: ProofInput = {
        assetSymbol: (parseNote(noteText)?.asset || 'ETH'),
        amount: amount || (parseNote(noteText)?.denomination || ''),
        senderAddress: walletState.address,
        nonce: Date.now().toString(),
      };

      const proof = await generateDummyProof(proofInput);
      sessionStorage.setItem('lastWithdrawProof', JSON.stringify(proof));
      sessionStorage.setItem('lastWithdrawProofInput', JSON.stringify(proofInput));
      setProofStatus('complete');
      setLastProofGenerated(Date.now());
      show('Proof generated successfully', { type: 'success', title: 'Proof Generation' });
    } catch (error) {
      console.error('Proof generation error:', error);
      show('Failed to generate proof', { type: 'error', title: 'Proof Error' });
      setProofStatus('idle');
    }
  };

  const handleRelayerQuote = async () => {
    if (!selectedRelayer || !amount) return;
    setLoadingQuote(true);
    setQuote(null);
    try {
      const q = await getRelayerQuote(selectedRelayer, selectedNetwork, amount);
      if (q) setQuote(`${q.fee} wei (ttl ${q.ttlSeconds}s)`);
    } catch (e) {
      console.error(e);
      show('Failed to get relayer quote', { type: 'error', title: 'Quote Error' });
    } finally {
      setLoadingQuote(false);
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

      const proofJson = sessionStorage.getItem('lastWithdrawProof');
      if (!proofJson) { 
        show('Proof not found. Please generate proof first.', { type: 'error', title: 'Proof Required' }); 
        return; 
      }
      const proof = JSON.parse(proofJson);
      const proofInputJson = sessionStorage.getItem('lastWithdrawProofInput');

      let disclosureBundleHash: string | undefined;
      if (disclosureEnabled && proofInputJson) {
        const proofInput = JSON.parse(proofInputJson) as ProofInput;
        const disclosureBundle = await generateDisclosureBundle({
          type: 'withdraw', amount, assetSymbol: proofInput.assetSymbol,
          senderAddress: proofInput.senderAddress, recipientAddress: destinationAddress,
          proof, proofInput, disclosureOptions: { enableSelectiveDisclosure: true, scope: ['amount','assetSymbol','recipientAddress','timestamp'] }
        });
        storeDisclosureBundle(disclosureBundle);
        disclosureBundleHash = disclosureBundle.hash;
        setLastDisclosureGenerated(Date.now());
      }

      const calldata = await prepareWithdraw({
        network: selectedNetwork,
        assetSymbol: 'ETH',
        amount,
        address: destinationAddress,
        proof,
        disclosure: disclosureEnabled ? { enableSelectiveDisclosure: true, scope: ['amount','assetSymbol','recipientAddress','timestamp'], disclosureHash: disclosureBundleHash } : undefined,
      });

      const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';
      if (!calldata || calldata === '0x') { 
        show('Transaction calldata not available. Contract may not be deployed.', { type: 'error', title: 'Transaction Error' }); 
        return; 
      }

      setTxStatus('signing');
      const hash = await signAndSendTransaction({ network: selectedNetwork, to: contractAddress, data: calldata });
      setTxHash(hash);
      setTxStatus('pending');
      setLastTxSubmitted(Date.now());

      try {
        await waitForTransactionReceipt(hash, 120000); // 2 minute timeout
        setTxStatus('success');
        addTxRecord({ type: 'withdraw', asset: 'ETH', amount, network: selectedNetwork, address: destinationAddress, hash, timestamp: new Date().toISOString() });
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } catch (receiptError) {
        setTxStatus('pending');
      }
    } catch (error) {
      console.error('Submit error:', error);
      show(`Failed to prepare transaction: ${error instanceof Error ? error.message : 'Unknown error'}`, { type: 'error', title: 'Transaction Failed' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-8">
          <h1 className="text-3xl font-bold mb-6">Withdraw</h1>

          {/* Network Selection */}
          <div className="mb-6" role="group" aria-labelledby="withdraw-network-label">
            <label id="withdraw-network-label" className="block text-sm font-medium mb-2">Network</label>
            <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Select network">
              {networks.map((network) => (
                <button
                  key={network.id}
                  onClick={() => setSelectedNetwork(network.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedNetwork(network.id);
                    }
                  }}
                  role="radio"
                  aria-checked={selectedNetwork === network.id}
                  tabIndex={0}
                  aria-label={`Select ${network.name} network`}
                  className={`px-4 py-3 rounded-lg border transition ${selectedNetwork === network.id ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'}`}
                >
                  {network.name}
                </button>
              ))}
            </div>
          </div>

          {/* Note Import */}
          <div className="mb-6">
            <label htmlFor="withdraw-note" className="block text-sm font-medium mb-2">Deposit Note (optional)</label>
            <input
              id="withdraw-note"
              type="text"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="note-compliant-..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              aria-describedby="withdraw-note-help"
            />
            <p id="withdraw-note-help" className="mt-1 text-xs text-gray-500 dark:text-gray-400">Paste a deposit note to auto-fill details, if available.</p>
            {vaultNotes.length > 0 && (
              <div className="text-xs text-gray-500 mt-2">
                From vault:
                <div className="mt-1 space-x-2 overflow-x-auto whitespace-nowrap">
                  {vaultNotes.slice(0,3).map((n, i) => (
                    <button
                      key={i}
                      onClick={() => setNoteText(n)}
                      className="underline"
                      type="button"
                      aria-label={`Use note ${i+1} from vault`}
                    >
                      note #{i+1}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Destination Address */}
          <div className="mb-6">
            <label htmlFor="destination-address" className="block text-sm font-medium mb-2">Destination Address</label>
            <input
              id="destination-address"
              type="text"
              value={destinationAddress}
              onChange={(e) => setDestinationAddress(e.target.value)}
              placeholder="0x..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              aria-describedby="destination-help"
            />
            <p id="destination-help" className="mt-1 text-xs text-gray-500 dark:text-gray-400">Enter the recipient address for the withdrawal.</p>
          </div>

          {/* Amount Input */}
          <div className="mb-6">
            <label htmlFor="withdraw-amount" className="block text-sm font-medium mb-2">Amount</label>
            <input
              id="withdraw-amount"
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              aria-describedby="withdraw-amount-help"
            />
            <p id="withdraw-amount-help" className="mt-1 text-xs text-gray-500 dark:text-gray-400">Enter the amount to withdraw.</p>
          </div>

          {/* Relayer Inline */}
          <div className="mb-6" aria-busy={loadingQuote}>
            <label htmlFor="relayer-select" className="block text-sm font-medium mb-2">Relayer (optional)</label>
            <div className="flex gap-2 items-center">
              <select id="relayer-select" value={selectedRelayer || ''} onChange={(e) => setSelectedRelayer(e.target.value)} className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-700">
                {relayers.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
              <button
                onClick={handleRelayerQuote}
                disabled={!selectedRelayer || !amount || loadingQuote}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                aria-label="Get relayer quote"
                aria-controls="relayer-quote"
              >
                {loadingQuote ? 'Quoting...' : 'Get Quote'}
              </button>
              {quote && <span id="relayer-quote" role="status" aria-live="polite" className="text-sm text-gray-600 dark:text-gray-300">{quote}</span>}
            </div>
          </div>

          {/* Selective Disclosure */}
          <div className="mb-6">
            <label htmlFor="enable-disclosure" className="flex items-center space-x-2">
              <input id="enable-disclosure" type="checkbox" checked={disclosureEnabled} onChange={(e) => setDisclosureEnabled(e.target.checked)} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
              <span className="text-sm font-medium">Enable Selective Disclosure</span>
            </label>
            <p className="text-sm text-gray-500 mt-1 ml-6">Allow auditors to view transaction details for compliance</p>
            <div className="ml-6 mt-2 flex items-center gap-2">
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${disclosureEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`} role="status" aria-live="polite">
                {disclosureEnabled ? 'Enabled' : 'Disabled'}
              </span>
              {lastDisclosureGenerated && (
                <span className="text-xs text-gray-500 dark:text-gray-400" role="status" aria-live="polite">Bundle generated: {new Date(lastDisclosureGenerated).toLocaleString()}</span>
              )}
            </div>
          </div>

          {/* Proof Generation */}
          <div className="mb-6" aria-busy={proofStatus === 'generating'}>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium" htmlFor="withdraw-proof-status">ZK Proof Generation</label>
              {proofStatus === 'complete' && (<span id="withdraw-proof-status" role="status" aria-live="polite" className="text-green-600 text-sm">✓ Complete</span>)}
              {proofStatus === 'generating' && (<span id="withdraw-proof-status" role="status" aria-live="polite" className="text-blue-600 text-sm">Generating...</span>)}
            </div>
            {lastProofGenerated && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                Last generated: {new Date(lastProofGenerated).toLocaleString()}
              </div>
            )}
            <button
              onClick={handleGenerateProof}
              disabled={!destinationAddress || !amount || proofStatus === 'generating' || proofStatus === 'complete'}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition"
              aria-label="Generate zero-knowledge proof"
              aria-controls="withdraw-proof-status"
            >
              Generate Proof
            </button>
          </div>

          {/* Transaction Status */}
          {txStatus !== 'idle' && (
            <div className="mb-6 p-4 rounded-lg bg-gray-50 dark:bg-gray-700" role="status" aria-live="polite" aria-label="Transaction status">
              {txStatus === 'signing' && (<p className="text-blue-600">Please sign the transaction in your wallet...</p>)}
              {txStatus === 'pending' && (
                <div>
                  <p className="text-yellow-600 mb-2">Transaction submitted. Waiting for confirmation...</p>
                  {txHash && (<p className="text-sm text-gray-600 dark:text-gray-400 break-all">Hash: {txHash}</p>)}
                  {lastTxSubmitted && (<p className="text-xs text-gray-500 dark:text-gray-400">Submitted at: {new Date(lastTxSubmitted).toLocaleString()}</p>)}
                </div>
              )}
              {txStatus === 'success' && (<p className="text-green-600">✓ Transaction confirmed!</p>)}
              {txStatus === 'error' && (<p className="text-red-600">Transaction failed. Please try again.</p>)}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={proofStatus !== 'complete' || txStatus === 'signing' || txStatus === 'pending'}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition"
            aria-label={txStatus === 'signing' ? 'Signing transaction' : txStatus === 'pending' ? 'Transaction pending' : 'Sign and send transaction'}
          >
            {txStatus === 'signing' ? 'Signing...' : txStatus === 'pending' ? 'Transaction Pending...' : 'Sign & Send Transaction'}
          </button>
        </div>
      </div>
    </div>
  );
}

