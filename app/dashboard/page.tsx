'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { getWalletState } from '../lib/wallet';
import { useToast } from '../components/ToastProvider';

// 动态导入组件以实现代码分割和懒加载
const BalancesSection = dynamic(() => import('./components/BalancesSection'), {
  loading: () => <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8 animate-pulse h-48"></div>,
  ssr: false
});

const RecentActivitySection = dynamic(() => import('./components/RecentActivitySection'), {
  loading: () => <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8 animate-pulse h-48"></div>,
  ssr: false
});

const RelayerStatusSection = dynamic(() => import('./components/RelayerStatusSection'), {
  loading: () => <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 animate-pulse h-48"></div>,
  ssr: false
});

// 固定的网络与资产配置（放到组件外，避免在每次渲染时重新创建导致 hooks 依赖警告）
const NETWORKS = [
  { id: 'ethereum', name: 'Ethereum', assets: ['ETH'] },
  { id: 'polygon', name: 'Polygon', assets: ['MATIC'] },
  { id: 'arbitrum', name: 'Arbitrum', assets: ['ETH'] },
  { id: 'optimism', name: 'Optimism', assets: ['ETH'] },
];

export default function DashboardPage() {
  const [selectedNetwork, setSelectedNetwork] = useState('ethereum');
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [balances, setBalances] = useState<Array<{ asset: string; amount: string; network: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [recentTx, setRecentTx] = useState(() => [] as Array<{ type: string; amount: string; asset: string; network: string; hash?: string; timestamp: string }>);
  const { show } = useToast();

  // Minimal Ethereum provider typing to avoid any
  interface EthereumProvider {
    request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  }
  const getEthereum = (): EthereumProvider | undefined => {
    if (typeof window === 'undefined') return undefined;
    return (window as unknown as { ethereum?: EthereumProvider }).ethereum;
  };

  // Safe error message extractor for unknown errors
  const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) return error.message;
    if (typeof error === 'string') return error;
    try {
      return JSON.stringify(error);
    } catch {
      return 'Unknown error';
    }
  };

  const networks = NETWORKS;

  // 添加状态以延迟加载非关键UI组件
  const [showSecondary, setShowSecondary] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const walletState = await getWalletState();
        setWalletAddress(walletState.address);
      } catch (error) {
        console.error('Error loading wallet:', error);
        setLoading(false);
      }
    })();

    // 动态导入交易历史
    import('../lib/note').then(({ listTxHistory }) => {
      try {
        setRecentTx(listTxHistory().slice(0, 5));
      } catch {
        setRecentTx([]);
      }
    });

    // 延迟加载非关键UI组件
    const timer = setTimeout(() => {
      setShowSecondary(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const loadBalances = useCallback(async (isRefresh = false) => {
    if (!walletAddress) {
      if (isRefresh) {
        show('Please connect your wallet first', { type: 'warning', title: 'No Wallet' });
      }
      return;
    }

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      // 动态导入getBalance函数
      const { getBalance } = await import('../lib/api');

      const networkAssets = NETWORKS.find(n => n.id === selectedNetwork)?.assets || [];
      const balancePromises = networkAssets.map(async (asset) => {
        try {
          const balance = await getBalance(selectedNetwork, walletAddress, asset) as string;
          const readableBalance = (parseFloat(balance) / 1e18).toFixed(6);
          return { asset, amount: readableBalance, network: selectedNetwork };
        } catch (error: unknown) {
          console.error(`Error loading balance for ${asset}:`, error);
          if (isRefresh) {
            show(`Failed to load ${asset} balance: ${getErrorMessage(error) || 'Unknown error'}`, {
              type: 'error',
              title: 'Balance Error'
            });
          }
          return { asset, amount: '0.000000', network: selectedNetwork };
        }
      });
      const balancesData = await Promise.all(balancePromises);
      setBalances(balancesData);

      if (isRefresh) {
        show('Balances refreshed', { type: 'success', title: 'Refresh' });
      }
    } catch (error: unknown) {
      console.error('Error loading balances:', error);
      setBalances([]);
      if (isRefresh) {
        show(`Failed to refresh balances: ${getErrorMessage(error) || 'Unknown error'}`, {
          type: 'error',
          title: 'Refresh Error'
        });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedNetwork, walletAddress, show]);

  useEffect(() => {
    if (walletAddress) {
      loadBalances();
    } else {
      setBalances([]);
      setLoading(false);
    }
  }, [loadBalances, walletAddress]);

  const loadWalletData = async () => {
    try {
      const walletState = await getWalletState();
      setWalletAddress(walletState.address);
    } catch (error) {
      console.error('Error loading wallet:', error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 sm:py-8">
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8" role="main">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Dashboard</h1>
          <div 
            role="radiogroup" 
            aria-label="Select network" 
            className="flex flex-wrap gap-2 mb-4 sm:mb-6"
          >
            {networks.map((network) => (
              <button
                key={network.id}
                onClick={() => setSelectedNetwork(network.id)}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    setSelectedNetwork(network.id);
                  }
                }}
                role="radio"
                aria-checked={selectedNetwork === network.id}
                tabIndex={selectedNetwork === network.id ? 0 : -1}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base rounded-lg transition ${selectedNetwork === network.id ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                {network.name}
              </button>
            ))}
          </div>
        </div>

        <nav className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8" aria-label="Main actions">
          <Link 
            href="/deposit" 
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition"
            role="button"
            aria-label="Go to deposit page - Shielded deposit with zk proof-of-funds"
          >
            <h2 className="text-xl font-semibold mb-2">Deposit</h2>
            <p className="text-gray-600 dark:text-gray-300">Shielded deposit with zk proof-of-funds</p>
          </Link>
          <Link 
            href="/withdraw" 
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition"
            role="button"
            aria-label="Go to withdraw page - Create withdrawal with selective disclosure"
          >
            <h2 className="text-xl font-semibold mb-2">Withdraw</h2>
            <p className="text-gray-600 dark:text-gray-300">Create withdrawal with selective disclosure</p>
          </Link>
        </nav>

        {walletAddress && (
          <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8" aria-labelledby="wallet-heading">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h2 id="wallet-heading" className="text-xl font-semibold mb-2">Connected Wallet</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-mono break-all" aria-label="Wallet address">{walletAddress}</p>
              </div>
              <div className="flex gap-2" role="group" aria-label="Wallet actions">
                <button
                  onClick={async () => {
                    try {
                      const eth = getEthereum();
                      if (!eth) {
                        show('No wallet extension found', { type: 'error', title: 'Wallet' });
                        return;
                      }

                      // Request accounts - this will trigger MetaMask's account selection UI
                      const accounts = await eth.request({ method: 'eth_requestAccounts' }) as unknown as string[];

                      if (accounts && accounts.length > 0) {
                        const newAddress = accounts[0];
                        if (typeof window !== 'undefined') {
                          localStorage.setItem('walletAddress', newAddress);
                          // Get new chain ID
                          try {
                            const chainIdHex = await eth.request({ method: 'eth_chainId' });
                            const chainId = parseInt(chainIdHex as string, 16);
                            localStorage.setItem('chainId', String(chainId));
                          } catch {}
                        }
                        // Reload wallet data
                        await loadWalletData();
                        await loadBalances(true);
                        show(`Switched to ${newAddress.slice(0, 6)}...${newAddress.slice(-4)}`, { type: 'success', title: 'Wallet' });
                      }
                    } catch (error: unknown) {
                      console.error('Switch account error:', error);
                      // MetaMask uses 4001 for user-rejected requests
                      if ((error as { code?: number }).code === 4001) {
                        show('Account switch cancelled', { type: 'warning', title: 'Wallet' });
                      } else {
                        show(`Failed to switch: ${getErrorMessage(error) || 'Unknown error'}`, { type: 'error', title: 'Wallet Switch' });
                      }
                    }
                  }}
                  className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition"
                  aria-label="Switch to a different wallet account"
                >
                  Switch Account
                </button>
                <button
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      localStorage.removeItem('walletAddress');
                      localStorage.removeItem('chainId');
                      localStorage.removeItem('selectedNetwork');
                      localStorage.removeItem('onboardingComplete');
                      setWalletAddress(null);
                      setBalances([]);
                      show('Wallet disconnected', { type: 'info', title: 'Wallet' });
                    }
                  }}
                  className="px-3 py-1.5 text-sm bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/40 rounded transition"
                  aria-label="Disconnect wallet"
                >
                  Disconnect
                </button>
              </div>
            </div>
          </section>
        )}

        {/* 使用懒加载的余额组件 */}
        <Suspense fallback={<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8 animate-pulse h-48"></div>}>
          <BalancesSection
            balances={balances}
            loading={loading}
            refreshing={refreshing}
            onRefresh={() => loadBalances(true)}
            walletAddress={walletAddress}
          />
        </Suspense>

        {/* 使用懒加载的最近活动组件，仅在初始渲染后显示 */}
        {showSecondary && (
          <Suspense fallback={<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8 animate-pulse h-48"></div>}>
            <RecentActivitySection recentTx={recentTx} />
          </Suspense>
        )}

        {/* 使用懒加载的中继器状态组件，仅在初始渲染后显示 */}
        {showSecondary && (
          <Suspense fallback={<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 animate-pulse h-48"></div>}>
            <RelayerStatusSection />
          </Suspense>
        )}
      </main>
    </div>
  );
}
