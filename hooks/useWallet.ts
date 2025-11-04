'use client';

import { useState, useEffect, useCallback } from 'react';
import { getWalletState, connectWallet, disconnectWallet } from '../lib/wallet';

export function useWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 初始化钱包状态
  useEffect(() => {
    const checkWalletConnection = async () => {
      try {
        const walletState = await getWalletState();
        setAddress(walletState.address || null);
        setIsConnected(!!walletState.address);
      } catch (err) {
        console.error('Failed to get wallet state:', err);
        setError('Failed to get wallet state');
      }
    };

    checkWalletConnection();
  }, []);

  // 连接钱包
  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    
    try {
      const result = await connectWallet();
      if (result.address) {
        setAddress(result.address);
        setIsConnected(true);
        return result;
      } else {
        setError('Failed to connect wallet');
        return null;
      }
    } catch (err) {
      console.error('Wallet connection error:', err);
      setError('Failed to connect wallet');
      return null;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  // 断开钱包连接
  const disconnect = useCallback(async () => {
    try {
      await disconnectWallet();
      setAddress(null);
      setIsConnected(false);
    } catch (err) {
      console.error('Wallet disconnection error:', err);
      setError('Failed to disconnect wallet');
    }
  }, []);

  return {
    address,
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect
  };
}