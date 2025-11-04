'use client';

import { useState, useEffect } from 'react';
import { connectWallet, getWalletState, type WalletState } from '../lib/wallet';
import { useToast } from './ToastProvider';

interface WalletConnectProps {
  onConnect?: (state: WalletState) => void;
}

export default function WalletConnect({ onConnect }: WalletConnectProps) {
  const [walletState, setWalletState] = useState<WalletState>({
    address: null,
    chainId: null,
    isConnected: false,
  });
  const [connecting, setConnecting] = useState(false);
  const { show } = useToast();

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const state = await getWalletState();
      setWalletState(state);
      if (state.isConnected && onConnect) {
        onConnect(state);
      }
    } catch (error) {
      console.error('Error checking wallet connection:', error);
    }
  };

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const state = await connectWallet();
      setWalletState(state);
      if (onConnect) {
        onConnect(state);
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
      show(error instanceof Error ? error.message : 'Failed to connect wallet', { type: 'error', title: 'Connection Failed' });
    } finally {
      setConnecting(false);
    }
  };

  if (walletState.isConnected && walletState.address) {
    return (
      <div className="flex items-center space-x-2">
        <div className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 rounded-full text-sm font-medium">
          ● Connected
        </div>
        <span className="text-sm font-mono text-gray-600 dark:text-gray-400">
          {walletState.address.slice(0, 6)}...{walletState.address.slice(-4)}
        </span>
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      disabled={connecting}
      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition"
    >
      {connecting ? 'Connecting...' : 'Connect Wallet'}
    </button>
  );
}

