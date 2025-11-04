'use client';

import { useState, useEffect } from 'react';
import { useToast } from '../components/ToastProvider';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [icpIdentity, setIcpIdentity] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [selectedNetwork, setSelectedNetwork] = useState<string>('ethereum');
  const router = useRouter();
  const { show } = useToast();

  const networks = [
    { id: 'ethereum', name: 'Ethereum', chainId: 1 },
    { id: 'polygon', name: 'Polygon', chainId: 137 },
    { id: 'arbitrum', name: 'Arbitrum', chainId: 42161 },
    { id: 'optimism', name: 'Optimism', chainId: 10 },
    // Testnets
    { id: 'sepolia', name: 'Sepolia (Testnet)', chainId: 11155111 },
    { id: 'polygon-mumbai', name: 'Mumbai (Testnet)', chainId: 80001 },
  ];

  // Check for Internet Identity session on mount and after redirect
  useEffect(() => {
    let isMounted = true
    let intervalId: NodeJS.Timeout | null = null
    let timeoutId: NodeJS.Timeout | null = null
    
    const checkSession = async () => {
      if (!isMounted) return
      
      try {
        // Check localStorage first (faster, no async import needed)
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('icpIdentity')
          if (stored && stored !== 'redirecting...' && stored.length > 10) {
            if (icpIdentity !== stored) {
              console.log('[Onboarding] Found stored ICP identity:', stored)
              setIcpIdentity(stored)
              if (step === 1) {
                setStep(2)
              }
            }
            // Already have identity, stop checking
            if (intervalId) {
              clearInterval(intervalId)
              intervalId = null
            }
            return
          }
        }
        
        // Only check via SDK if no localStorage value
        console.log('[Onboarding] Checking for ICP session via SDK...')
        const { checkInternetIdentitySession } = await import('../lib/icp')
        const session = await checkInternetIdentitySession()
        
        if (!isMounted) return
        
        if (session && session.principal && session.principal !== 'redirecting...') {
          console.log('[Onboarding] Found authenticated session:', session.principal)
          setIcpIdentity(session.principal)
          // Store in localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('icpIdentity', session.principal)
            localStorage.setItem('icpAttestationRef', session.attestationRef)
            localStorage.setItem('icpIdentityTimestamp', Date.now().toString())
          }
          // If still on step 1, advance to step 2
          if (step === 1) {
            console.log('[Onboarding] Auto-advancing to step 2')
            setStep(2)
          }
          // Stop checking once we found it
          if (intervalId) {
            clearInterval(intervalId)
            intervalId = null
          }
        }
      } catch (err) {
        console.error('[Onboarding] Error checking ICP session:', err)
      }
    }
    
    // Check immediately on mount (only once)
    checkSession()
    
    // Listen for custom event from ICP connection
    const handleICPConnected = (event: any) => {
      if (!isMounted) return
      console.log('[Onboarding] Received ICP connected event:', event.detail)
      if (event.detail && event.detail.principal) {
        setIcpIdentity(event.detail.principal)
        if (step === 1) {
          setStep(2)
        }
      }
    }
    
    window.addEventListener('icpIdentityConnected', handleICPConnected)
    
    // Only poll if we don't have an identity yet (stop after 3 seconds max)
    // Check localStorage to see if we already have identity
    const hasStoredIdentity = typeof window !== 'undefined' && localStorage.getItem('icpIdentity')
    if (!hasStoredIdentity) {
      intervalId = setInterval(() => {
        checkSession()
      }, 1000)
      
      timeoutId = setTimeout(() => {
        if (intervalId) {
          clearInterval(intervalId)
          intervalId = null
        }
      }, 3000)
    }
    
    return () => {
      isMounted = false
      if (intervalId) clearInterval(intervalId)
      if (timeoutId) clearTimeout(timeoutId)
      window.removeEventListener('icpIdentityConnected', handleICPConnected)
    }
  }, [step]) // Re-run if step changes (e.g., when advancing to step 2)

  const handleICPConnect = async () => {
    try {
      console.log('[Onboarding] ICP Connect button clicked')
      const { connectInternetIdentity } = await import('../lib/icp')
      // This will redirect user to Internet Identity for authentication
      // After authentication, user is redirected back and checkInternetIdentitySession() 
      // will detect the authenticated session
      const result = await connectInternetIdentity()
      
      console.log('[Onboarding] ICP Connect result:', result)
      
      // Note: If redirect happens, this code may not execute
      // Check localStorage or wait for redirect instead
      if (result.principal !== 'redirecting...') {
        console.log('[Onboarding] Setting ICP identity:', result.principal)
        setIcpIdentity(result.principal)
        if (typeof window !== 'undefined') {
          localStorage.setItem('icpIdentity', result.principal)
          localStorage.setItem('icpAttestationRef', result.attestationRef)
        }
        setStep(2)
      } else {
        // Redirect in progress - show loading state
        // User will be redirected to Internet Identity
        // After redirect back, useEffect will detect the session
        console.log('[Onboarding] Redirect in progress, waiting for Internet Identity...')
        // Optionally show loading indicator
      }
    } catch (err) {
      console.error('[Onboarding] ICP connect failed:', err)
      // Fallback: proceed with mock identity for development
      show(`ICP Connection Error: ${err instanceof Error ? err.message : 'Unknown error'}`, { type: 'error', title: 'Internet Identity' })
      setIcpIdentity('user-principal-id-mock')
      setStep(2)
    }
  }

  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [walletConnected, setWalletConnected] = useState(false);
  const [currentWalletChainId, setCurrentWalletChainId] = useState<number | null>(null);

  // Check if wallet is already connected on mount and detect network
  useEffect(() => {
    if (step === 2 || step === 3) {
      const checkExistingWallet = async () => {
        try {
          const { getWalletState } = await import('../lib/wallet');
          const state = await getWalletState();
          if (state.isConnected && state.address) {
            setWalletAddress(state.address);
            setWalletConnected(true);
            setCurrentWalletChainId(state.chainId);
            
            // Auto-select matching network if detected
            if (state.chainId) {
              const matchingNetwork = networks.find(n => n.chainId === state.chainId);
              if (matchingNetwork) {
                setSelectedNetwork(matchingNetwork.id);
              }
            }
            
            // Also check localStorage
            if (typeof window !== 'undefined') {
              const stored = localStorage.getItem('walletAddress');
              if (stored) {
                setWalletAddress(stored);
                setWalletConnected(true);
              }
            }
          }
        } catch (e) {
          // No wallet or not connected
        }
      };
      checkExistingWallet();
      
      // Listen for chain changes
      const eth = (typeof window !== 'undefined' ? (window as any).ethereum : undefined);
      if (eth && eth.on) {
        const handleChainChange = () => {
          checkExistingWallet();
        };
        eth.on('chainChanged', handleChainChange);
        return () => {
          if (eth.removeListener) eth.removeListener('chainChanged', handleChainChange);
        };
      }
    }
  }, [step]);

  const handleWalletConnect = async () => {
    setIsConnecting(true);
    setConnectionError(null);
    
    try {
      // Try to connect via MetaMask/injected wallet first
      const { connectWallet, ensureChain } = await import('../lib/wallet');
      const walletState = await connectWallet();
      
      if (walletState.address) {
        setWalletAddress(walletState.address);
        setWalletConnected(true);
        
        // Store in localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('walletAddress', walletState.address);
          if (walletState.chainId) {
            localStorage.setItem('chainId', String(walletState.chainId));
            setCurrentWalletChainId(walletState.chainId);
            
            // Auto-select matching network if detected
            const matchingNetwork = networks.find(n => n.chainId === walletState.chainId);
            if (matchingNetwork) {
              setSelectedNetwork(matchingNetwork.id);
              show(`Detected ${matchingNetwork.name}`, { type: 'info', title: 'Network' });
            }
          }
        }

        // Advance to next step (network selection happens in Step 3)
        setStep(3);
      } else {
        throw new Error('No address received from wallet');
      }
    } catch (error: any) {
      console.error('[Onboarding] Wallet connection error:', error);
      setConnectionError(error.message || 'Failed to connect wallet. Try entering address manually.');
      
      // If user has entered an address manually, validate and continue
      if (walletAddress && walletAddress.startsWith('0x')) {
        try {
          const { validateAddress } = await import('../lib/validation');
          const validation = validateAddress(walletAddress);
          if (validation.isValid) {
            if (typeof window !== 'undefined') {
              localStorage.setItem('walletAddress', walletAddress);
            }
            setStep(3);
          } else {
            setConnectionError(validation.error || 'Invalid address format');
          }
        } catch (e) {
          // Validation failed
        }
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handleManualAddressSubmit = async () => {
    if (!walletAddress || !walletAddress.startsWith('0x')) {
      setConnectionError('Please enter a valid Ethereum address (starts with 0x)');
      return;
    }
    
    try {
      const { validateAddress } = await import('../lib/validation');
      const validation = validateAddress(walletAddress);
      if (validation.isValid) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('walletAddress', walletAddress);
        }
        setStep(3);
      } else {
        setConnectionError(validation.error || 'Invalid address format');
      }
    } catch (error) {
      setConnectionError('Failed to validate address');
    }
  };

  const handleComplete = async () => {
    // If a wallet is connected, ensure the browser wallet is on the selected network
    try {
      const { getWalletState, ensureChain } = await import('../lib/wallet')
      const state = await getWalletState()
      const selected = networks.find((n) => n.id === selectedNetwork)
      
      if (state.isConnected && selected && state.chainId !== selected.chainId) {
        try {
          // Map network IDs to RPC URLs and explorer URLs
          const networkConfig: Record<string, { rpcUrls: string[]; blockExplorerUrls?: string[] }> = {
            ethereum: {
              rpcUrls: ['https://rpc.ankr.com/eth', 'https://eth.llamarpc.com'],
              blockExplorerUrls: ['https://etherscan.io'],
            },
            polygon: {
              rpcUrls: ['https://polygon-rpc.com', 'https://rpc.ankr.com/polygon'],
              blockExplorerUrls: ['https://polygonscan.com'],
            },
            arbitrum: {
              rpcUrls: ['https://arb1.arbitrum.io/rpc', 'https://rpc.ankr.com/arbitrum'],
              blockExplorerUrls: ['https://arbiscan.io'],
            },
            optimism: {
              rpcUrls: ['https://mainnet.optimism.io', 'https://rpc.ankr.com/optimism'],
              blockExplorerUrls: ['https://optimistic.etherscan.io'],
            },
            sepolia: {
              rpcUrls: ['https://rpc.sepolia.org', 'https://ethereum-sepolia-rpc.publicnode.com'],
              blockExplorerUrls: ['https://sepolia.etherscan.io'],
            },
            'polygon-mumbai': {
              rpcUrls: ['https://rpc-mumbai.maticvigil.com'],
              blockExplorerUrls: ['https://mumbai.polygonscan.com'],
            },
          }
          
          const config = networkConfig[selected.id] || { rpcUrls: [] }
          
          await ensureChain({
            chainId: selected.chainId,
            chainName: selected.name,
            rpcUrls: config.rpcUrls,
            blockExplorerUrls: config.blockExplorerUrls,
          })
          
          show(`Switched to ${selected.name}`, { type: 'success', title: 'Network' })
          
          // Wait a moment for the switch to complete, then re-check
          await new Promise(resolve => setTimeout(resolve, 1500))
          const newState = await getWalletState()
          setCurrentWalletChainId(newState.chainId)
          if (newState.chainId !== selected.chainId) {
            show(`Please confirm the network switch in your wallet`, { type: 'warning', title: 'Network Switch' })
            return // Don't complete onboarding until network is correct
          }
          // Update UI state
          setCurrentWalletChainId(selected.chainId)
        } catch (e: any) {
          console.error('Network switch failed:', e)
          show(`Failed to switch network: ${e?.message || 'Please switch to ${selected.name} manually in your wallet'}`, { 
            type: 'error', 
            title: 'Network Mismatch' 
          })
          return // Don't complete onboarding if network switch fails
        }
      }
      
      // Persist the chain id we expect
      if (typeof window !== 'undefined' && selected) {
        localStorage.setItem('chainId', String(selected.chainId))
        localStorage.setItem('selectedNetwork', selected.id)
      }
    } catch (e) {
      console.error('Network check failed:', e)
      // Continue anyway if wallet not connected
    }

    // Run screening checks
    if (walletAddress) {
      try {
        const { screenAddress } = await import('../lib/api');
        const result = await screenAddress(walletAddress);
        if (!result.ok) {
          show(`Screening failed: ${result.reasons?.join(', ') || 'Address flagged'}`, { type: 'warning', title: 'Compliance Screening' });
          return;
        }
      } catch (error) {
        console.error('Screening error:', error);
        // Continue anyway for MVP
      }
    }
    
    // Store onboarding data
    if (typeof window !== 'undefined') {
      localStorage.setItem('onboardingComplete', 'true');
      localStorage.setItem('icpIdentity', icpIdentity || '');
      localStorage.setItem('walletAddress', walletAddress);
      localStorage.setItem('selectedNetwork', selectedNetwork);
    }
    
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6">
          <h1 className="text-2xl font-semibold tracking-tight mb-4">Onboarding</h1>

          {/* Step indicator */}
          {/* Stepper */}
          <div className="mb-6 relative">
            {/* Base line */}
            <div className="absolute left-4 right-4 top-4 h-0.5 bg-gray-200 dark:bg-gray-700" />
            {/* Progress line (0%, 50%, 100%) */}
            <div
              className="absolute left-4 top-4 h-0.5 bg-blue-600 transition-all"
              style={{ width: `${((Math.max(1, Math.min(3, step)) - 1) / 2) * 100}%`, maxWidth: 'calc(100% - 2rem)' }}
            />
            <div className="grid grid-cols-3 gap-2">
              {[{ n: 1, label: 'KYC' }, { n: 2, label: 'Wallet' }, { n: 3, label: 'Network' }].map(({ n, label }) => (
                <div key={n} className="flex flex-col items-center">
                  <div
                    className={`z-10 w-8 h-8 rounded-full flex items-center justify-center ${
                      step >= n ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                    }`}
                  >
                    {n}
                  </div>
                  <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Step 1: ICP Internet Identity */}
          {step === 1 && (
            <div>
              <h2 className="text-lg font-semibold mb-3">Step 1: KYC Verification</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Sign in via ICP Internet Identity for KYC verification
              </p>
              
              {icpIdentity && icpIdentity !== 'redirecting...' ? (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-center mb-2">
                      <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-medium text-green-800 dark:text-green-200">Successfully Connected!</span>
                    </div>
                    <div className="text-sm text-green-700 dark:text-green-300">
                      <div className="font-medium mb-1">Internet Identity Principal:</div>
                      <div className="font-mono text-xs break-all">{icpIdentity}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setStep(2)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition"
                  >
                    Continue to Wallet Connection
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleICPConnect}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition"
                >
                  Connect ICP Internet Identity
                </button>
              )}
            </div>
          )}

          {/* Step 2: Wallet Connection */}
          {step === 2 && (
            <div>
              <h2 className="text-lg font-semibold mb-3">Step 2: Link Wallet</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Connect your wallet to continue. We support MetaMask and other Web3 wallets.
              </p>

              {/* Connected State */}
              {walletConnected && walletAddress && (
                <div className="mb-5 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-medium text-green-800 dark:text-green-200">Wallet Connected</span>
                    </div>
                    <button
                      onClick={() => {
                        setWalletConnected(false);
                        setWalletAddress('');
                      }}
                      className="text-sm text-green-600 hover:text-green-700 underline"
                    >
                      Change
                    </button>
                  </div>
                  <div className="mt-2 text-sm text-green-700 dark:text-green-300 font-mono break-all">
                    {walletAddress}
                  </div>
                  <button
                    onClick={() => setStep(3)}
                    className="mt-3 w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-4 rounded-lg transition"
                  >
                    Continue to Network Selection
                  </button>
                </div>
              )}

              {/* Connection Options */}
              {!walletConnected && (
                <div className="space-y-4">
                  {/* MetaMask Button */}
                  <div>
                    <button
                      onClick={handleWalletConnect}
                      disabled={isConnecting}
                      className="w-full flex items-center justify-center gap-3 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-medium py-3.5 px-6 rounded-lg transition shadow-sm hover:shadow-md"
                    >
                      {isConnecting ? (
                        <>
                          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Connecting...</span>
                        </>
                      ) : (
                        <>
                          {/* MetaMask Fox Icon */}
                          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 11.46L20.41 9.19L21.26 6.66L19.56 5.64L20.41 3.11L18.29 1L15.76 1.85L14.74 0.15L12.21 1L10.09 1L11.04 3.53L9.34 4.55L8.49 2.02L6.37 0.89L4.24 2.02L5.09 4.55L3.39 5.57L4.24 8.1L2.12 9.23L3.77 11.46L2.12 13.69L4.24 14.82L3.39 17.35L5.09 18.37L4.24 20.9L6.37 22.03L8.49 20.9L9.34 18.37L11.04 17.35L10.09 14.82L12.21 13.69L14.74 14.54L15.76 16.24L18.29 15.39L20.41 17.51L21.26 14.98L19.56 13.96L20.41 11.46H22.56Z" fill="#E2761B"/>
                            <path d="M15.76 8.1L13.64 7.45L12.62 6.43L11.6 7.45L9.48 8.1L11.29 10.22L13.64 10.03L15.99 10.22L17.8 8.1H15.76Z" fill="#E4761B"/>
                          </svg>
                          <span>Connect with MetaMask</span>
                        </>
                      )}
                    </button>
                    <p className="mt-2 text-xs text-gray-500 text-center">
                      Click to connect with MetaMask or other injected wallet
                    </p>
                  </div>

                  {/* Divider */}
                  <div className="relative my-5">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">OR</span>
                    </div>
                  </div>

                  {/* Manual Address Entry */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Enter Wallet Address Manually
                    </label>
                    <input
                      type="text"
                      value={walletAddress}
                      onChange={(e) => {
                        setWalletAddress(e.target.value);
                        setConnectionError(null);
                      }}
                      placeholder="0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
                      className="w-full px-3.5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={handleManualAddressSubmit}
                      disabled={!walletAddress || walletAddress.length < 10}
                      className="mt-3 w-full bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-2.5 px-4 rounded-lg transition"
                    >
                      Use This Address
                    </button>
                  </div>

                  {/* Error Message */}
                  {connectionError && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <p className="text-sm text-red-700 dark:text-red-300">{connectionError}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Network Selection */}
          {step === 3 && (
            <div>
              <h2 className="text-lg font-semibold mb-3">Step 3: Select Network</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Choose your primary network. Make sure it matches your wallet's current network.
              </p>
              
              {/* Show current wallet network warning if mismatch */}
              {walletConnected && currentWalletChainId && (() => {
                const currentNetwork = networks.find(n => n.chainId === currentWalletChainId)
                const selected = networks.find(n => n.id === selectedNetwork)
                if (currentNetwork && selected && currentNetwork.chainId !== selected.chainId) {
                  return (
                    <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        ⚠️ Your wallet is on <strong>{currentNetwork.name}</strong> (Chain {currentWalletChainId}), but you selected <strong>{selected.name}</strong> (Chain {selected.chainId}). 
                        <br />
                        Click "Complete Onboarding" to automatically switch your wallet to the selected network.
                      </p>
                    </div>
                  )
                }
                return null
              })()}
              
              <div className="space-y-3">
                {networks.map((network) => (
                  <button
                    key={network.id}
                    onClick={() => setSelectedNetwork(network.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg border transition ${
                      selectedNetwork === network.id
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                    }`}
                  >
                    <div className="font-medium">{network.name}</div>
                    <div className="text-sm text-gray-500">Chain ID: {network.chainId}</div>
                  </button>
                ))}
              </div>
              <button
                onClick={handleComplete}
                className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition"
              >
                Complete Onboarding
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

