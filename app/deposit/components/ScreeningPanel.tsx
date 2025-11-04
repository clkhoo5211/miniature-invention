'use client';

import { useState } from 'react';
import { screenAddress } from '../../lib/api';
import { getWalletState } from '../../lib/wallet';
import { useToast } from '../../components/ToastProvider';

interface ScreeningPanelProps {
  onScreeningComplete: (status: 'pass' | 'fail') => void;
  screeningStatus: 'pending' | 'pass' | 'fail';
  setScreeningStatus: (status: 'pending' | 'pass' | 'fail') => void;
}

export default function ScreeningPanel({ 
  onScreeningComplete, 
  screeningStatus,
  setScreeningStatus 
}: ScreeningPanelProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { show } = useToast();

  const handleScreening = async () => {
    try {
      setIsLoading(true);
      const walletState = await getWalletState();
      if (!walletState.address) {
        show('Please connect your wallet first', { type: 'error', title: 'Wallet Required' });
        setScreeningStatus('pending');
        return;
      }
      const result = await screenAddress(walletState.address);
      if (result.ok) {
        setScreeningStatus('pass');
        onScreeningComplete('pass');
      } else {
        setScreeningStatus('fail');
        onScreeningComplete('fail');
        show('Address screening failed', { type: 'error', title: 'Screening Failed' });
      }
    } catch (error) {
      console.error('Screening error:', error);
      show('Error during address screening', { type: 'error', title: 'Screening Error' });
      setScreeningStatus('pending');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Address Screening</h2>
      <p className="mb-4 text-sm sm:text-base">
        Before depositing, your address needs to be screened for compliance.
      </p>
      
      {screeningStatus === 'pending' && (
        <button
          onClick={handleScreening}
          disabled={isLoading}
          className={`w-full py-2 px-4 rounded-lg text-white ${
            isLoading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isLoading ? 'Screening...' : 'Start Screening'}
        </button>
      )}
      
      {screeningStatus === 'pass' && (
        <div className="p-3 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg">
          Your address has passed screening. You can proceed with the deposit.
        </div>
      )}
      
      {screeningStatus === 'fail' && (
        <div className="p-3 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg">
          Your address did not pass screening. Please contact support for assistance.
        </div>
      )}
    </div>
  );
}