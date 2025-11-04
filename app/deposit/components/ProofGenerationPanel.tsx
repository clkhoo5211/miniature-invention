'use client';

import { useState } from 'react';
import { generateDummyProof } from '../../lib/api';
import { getWalletState } from '../../lib/wallet';
import { useToast } from '../../components/ToastProvider';

interface ProofGenerationPanelProps {
  amount: string;
  selectedAsset: string;
  selectedNetwork: string;
  onProofComplete: (proofData: unknown) => void;
  proofStatus: 'idle' | 'generating' | 'complete';
  setProofStatus: (status: 'idle' | 'generating' | 'complete') => void;
  screeningStatus: 'pending' | 'pass' | 'fail';
}

export default function ProofGenerationPanel({
  amount,
  selectedAsset,
  selectedNetwork,
  onProofComplete,
  proofStatus,
  setProofStatus,
  screeningStatus
}: ProofGenerationPanelProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { show } = useToast();

  const handleGenerateProof = async () => {
    if (!amount || screeningStatus !== 'pass') return;
    
    try {
      setIsGenerating(true);
      setProofStatus('generating');
      
      // Build ProofInput and generate proof using project API
      const walletState = await getWalletState();
      if (!walletState.address) {
        setProofStatus('idle');
        show('Please connect your wallet first', { type: 'error' });
        setIsGenerating(false);
        return;
      }
      const proofData = await generateDummyProof({
        assetSymbol: selectedAsset,
        amount: amount, // bigint as string (MVP: using raw string input)
        senderAddress: walletState.address,
        nonce: Date.now().toString(),
      });
      
      setProofStatus('complete');
      onProofComplete(proofData);
      show('Proof generated successfully', { type: 'success' });
    } catch (error) {
      console.error('Proof generation error:', error);
      setProofStatus('idle');
      show('Failed to generate proof', { type: 'error' });
    } finally {
      setIsGenerating(false);
    }
  };

  const isDisabled = screeningStatus !== 'pass' || !amount || isGenerating;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Zero-Knowledge Proof</h2>
      <p className="mb-4 text-sm sm:text-base">
        Generate a zero-knowledge proof to ensure privacy of your transaction.
      </p>
      
      {proofStatus === 'idle' && (
        <button
          onClick={handleGenerateProof}
          disabled={isDisabled}
          className={`w-full py-2 px-4 rounded-lg text-white ${
            isDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          Generate Proof
        </button>
      )}
      
      {proofStatus === 'generating' && (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Generating proof...</span>
        </div>
      )}
      
      {proofStatus === 'complete' && (
        <div className="p-3 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg">
          Proof generated successfully. You can proceed with the deposit.
        </div>
      )}
    </div>
  );
}