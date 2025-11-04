/**
 * Wallet connection utilities for EVM chains
 */

export interface WalletState {
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
}

/**
 * Connect to MetaMask or other injected wallet
 */
export async function connectWallet(): Promise<WalletState> {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('No wallet extension found. Please install MetaMask.');
  }

  try {
    // Request account access
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    }) as string[];

    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found');
    }

    const address = accounts[0];
    
    // Get chain ID
    const chainIdHex = await window.ethereum.request({
      method: 'eth_chainId',
    });
    const chainId = parseInt(chainIdHex as string, 16);

    return {
      address,
      chainId,
      isConnected: true,
    };
  } catch (error) {
    console.error('Wallet connection error:', error);
    throw error;
  }
}

/**
 * Get current wallet state without requesting connection
 */
export async function getWalletState(): Promise<WalletState> {
  if (typeof window === 'undefined' || !window.ethereum) {
    return { address: null, chainId: null, isConnected: false };
  }

  try {
    const accounts = await window.ethereum.request({
      method: 'eth_accounts',
    }) as string[];

    if (!accounts || accounts.length === 0) {
      return { address: null, chainId: null, isConnected: false };
    }

    const address = accounts[0];
    const chainIdHex = await window.ethereum.request({
      method: 'eth_chainId',
    });
    const chainId = parseInt(chainIdHex as string, 16);

    return {
      address,
      chainId,
      isConnected: true,
    };
  } catch (error) {
    console.error('Get wallet state error:', error);
    return { address: null, chainId: null, isConnected: false };
  }
}

/**
 * Switch to a specific chain
 */
export async function switchChain(chainId: number): Promise<void> {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('No wallet extension found');
  }

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${chainId.toString(16)}` }],
    });
  } catch (error: unknown) {
    // If chain doesn't exist, user may need to add it
    if ((error as { code?: number }).code === 4902) {
      throw new Error(`Chain ${chainId} not found. Please add it to your wallet.`);
    }
    throw error;
  }
}

/**
 * Add a chain to the wallet if missing
 */
export async function addChain(params: {
  chainId: number;
  chainName: string;
  rpcUrls: string[];
  nativeCurrency?: { name: string; symbol: string; decimals: number };
  blockExplorerUrls?: string[];
}): Promise<void> {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('No wallet extension found');
  }

  await window.ethereum.request({
    method: 'wallet_addEthereumChain',
    params: [
      {
        chainId: `0x${params.chainId.toString(16)}`,
        chainName: params.chainName,
        rpcUrls: params.rpcUrls,
        nativeCurrency:
          params.nativeCurrency || { name: 'Ether', symbol: 'ETH', decimals: 18 },
        blockExplorerUrls: params.blockExplorerUrls,
      },
    ],
  });
}

/**
 * Ensure wallet is on the expected chain; try switch, then add+switch if missing
 */
export async function ensureChain(target: {
  chainId: number;
  chainName: string;
  rpcUrls: string[];
  blockExplorerUrls?: string[];
}): Promise<void> {
  try {
    await switchChain(target.chainId);
  } catch (err: unknown) {
    if ((err as { message?: string; code?: number })?.message?.includes('not found') || (err as { code?: number })?.code === 4902) {
      await addChain({
        chainId: target.chainId,
        chainName: target.chainName,
        rpcUrls: target.rpcUrls,
        blockExplorerUrls: target.blockExplorerUrls,
      });
      await switchChain(target.chainId);
    } else {
      throw err;
    }
  }
}

/**
 * Sign a message with the connected wallet
 */
export async function signMessage(message: string): Promise<string> {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('No wallet extension found');
  }

  const accounts = await window.ethereum.request({
    method: 'eth_accounts',
  }) as string[];

  if (!accounts || accounts.length === 0) {
    throw new Error('No wallet connected');
  }

  const signature = await window.ethereum.request({
    method: 'personal_sign',
    params: [message, accounts[0]],
  }) as string;

  return signature;
}

/**
 * Send a transaction using MetaMask
 */
export async function sendTransaction(params: {
  to: string;
  value?: string; // Amount in wei (hex string)
  data?: string; // Transaction data (hex string)
  gas?: string; // Gas limit (hex string)
  gasPrice?: string; // Gas price (hex string)
}): Promise<string> {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('No wallet extension found');
  }

  const accounts = await window.ethereum.request({
    method: 'eth_accounts',
  }) as string[];

  if (!accounts || accounts.length === 0) {
    throw new Error('No wallet connected');
  }

  try {
    // Build transaction object
    const txParams: Record<string, string | undefined> = {
      from: accounts[0],
      to: params.to,
    };

    if (params.value) {
      txParams.value = params.value;
    }

    if (params.data) {
      txParams.data = params.data;
    }

    if (params.gas) {
      txParams.gas = params.gas;
    }

    if (params.gasPrice) {
      txParams.gasPrice = params.gasPrice;
    }

    // Request transaction signature and submission
    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [txParams],
    }) as string;

    return txHash;
  } catch (error: unknown) {
    // Handle user rejection
    if ((error as { code?: number; message?: string }).code === 4001 || (error as { message?: string }).message?.includes('User denied')) {
      throw new Error('Transaction rejected by user');
    }
    throw error;
  }
}

/**
 * Get transaction receipt (polling)
 */
import { DEFAULTS } from './constants';

export async function waitForTransactionReceipt(txHash: string, maxWaitTime: number = DEFAULTS.TX_RECEIPT_MAX_WAIT_MS): Promise<unknown> {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('No wallet extension found');
  }

  const startTime = Date.now();
  const pollInterval = 2000; // Poll every 2 seconds

  while (Date.now() - startTime < maxWaitTime) {
    try {
      const receipt = await window.ethereum.request({
        method: 'eth_getTransactionReceipt',
        params: [txHash],
      });

      if (receipt) {
        return receipt;
      }

      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    } catch (error) {
      console.error('Error polling for receipt:', error);
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }
  }

  throw new Error('Transaction receipt timeout');
}

// Type declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, handler: (accounts: string[]) => void) => void;
      removeListener: (event: string, handler: (accounts: string[]) => void) => void;
    };
  }
}

