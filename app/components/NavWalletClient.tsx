'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from './ToastProvider'

function shorten(addr: string): string {
  if (!addr || addr.length < 10) return addr
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

export default function NavWalletClient() {
  // Initialize from localStorage to avoid setState in effect
  const [address, setAddress] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('walletAddress')
  })
  const [chainId, setChainId] = useState<number | null>(() => {
    if (typeof window === 'undefined') return null
    const stored = localStorage.getItem('chainId')
    return stored ? Number(stored) : null
  })
  const [showMenu, setShowMenu] = useState(false)
  const router = useRouter()
  const { show } = useToast()

  useEffect(() => {
    // subscribe to wallet changes if available
    interface EthereumProvider {
      request: (args: { method: string; params?: unknown }) => Promise<unknown>
      on?: (event: string, handler: (...args: unknown[]) => void) => void
      removeListener?: (event: string, handler: (...args: unknown[]) => void) => void
    }
    const eth = (typeof window !== 'undefined'
      ? (window as unknown as { ethereum?: EthereumProvider }).ethereum
      : undefined)

    const handleAccounts = (...args: unknown[]) => {
      const accounts = args[0] as string[]
      const next = accounts && accounts.length > 0 ? accounts[0] : null
      setAddress(next)
      if (typeof window !== 'undefined') {
        if (next) {
          localStorage.setItem('walletAddress', next)
        } else {
          // Account disconnected
          localStorage.removeItem('walletAddress')
          localStorage.removeItem('chainId')
          setChainId(null)
        }
      }
    }
    const handleChain = async () => {
      try {
        const idHex = await eth?.request({ method: 'eth_chainId' })
        const id = parseInt(String(idHex), 16)
        setChainId(id)
        if (typeof window !== 'undefined') localStorage.setItem('chainId', String(id))
      } catch {}
    }

    if (eth && eth.on) {
      eth.on('accountsChanged', handleAccounts)
      eth.on('chainChanged', handleChain)
      // initial fetch (async callbacks)
      eth.request({ method: 'eth_accounts' })
        .then((accs) => handleAccounts(accs as string[]))
        .catch(() => {})
      // chain id fetch
      handleChain()
      return () => {
        if (eth.removeListener) {
          eth.removeListener('accountsChanged', handleAccounts)
          eth.removeListener('chainChanged', handleChain)
        }
      }
    }
  }, [])

  const handleDisconnect = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('walletAddress')
      localStorage.removeItem('chainId')
      localStorage.removeItem('selectedNetwork')
      localStorage.removeItem('onboardingComplete')
      setAddress(null)
      setChainId(null)
      setShowMenu(false)
      router.push('/onboarding')
    }
  }

  const handleSwitchWallet = async () => {
    setShowMenu(false) // Close menu immediately
    
    try {
      const eth = (typeof window !== 'undefined'
        ? (window as unknown as { ethereum?: { request: (args: { method: string; params?: unknown }) => Promise<unknown> } }).ethereum
        : undefined)
      if (!eth) {
        show('No wallet extension found. Please install MetaMask.', { type: 'error', title: 'Wallet Not Found' })
        return
      }
      
      // First, try to request permissions again (this may show account picker in some wallets)
      try {
        await eth.request({ 
          method: 'wallet_requestPermissions', 
          params: [{ eth_accounts: {} }] 
        })
      } catch (permError: unknown) {
        // If permissions already granted, that's okay - continue to request accounts
        const code = (permError as { code?: number }).code
        const message = (permError as { message?: string }).message
        if (code !== 4001) {
          console.log('Permission request result:', message)
        }
      }
      
      // Request accounts - this should trigger MetaMask's account selection if multiple accounts
      const accounts = (await eth.request({ method: 'eth_requestAccounts' })) as string[]
      
      if (accounts && accounts.length > 0) {
        const newAddress = accounts[0]
        
        // Check if address actually changed
        if (newAddress.toLowerCase() === address?.toLowerCase()) {
          show('Same account selected. To switch accounts, please: 1) Click the MetaMask extension icon, 2) Click the account dropdown, 3) Select a different account. The app will automatically detect the change.', { 
            type: 'info', 
            title: 'Switch Account',
            duration: 8000
          })
          return
        }
        
        setAddress(newAddress)
        if (typeof window !== 'undefined') {
          localStorage.setItem('walletAddress', newAddress)
          
          // Get new chain ID
          try {
            const chainIdHex = await eth.request({ method: 'eth_chainId' })
            const chainId = parseInt(String(chainIdHex), 16)
            setChainId(chainId)
            localStorage.setItem('chainId', String(chainId))
          } catch {}
        }
        
        // Reload the page to update all components
        window.location.reload()
      }
    } catch (error: unknown) {
      console.error('Error switching wallet:', error)
      const code = (error as { code?: number }).code
      const message = (error as { message?: string }).message
      if (code === 4001) {
        show('Account switch cancelled by user', { type: 'warning', title: 'Cancelled' })
      } else {
        show(`Failed to switch account: ${message || 'Unknown error'}. Note: Some wallets require you to manually switch accounts in the extension. The app will automatically detect the change.`, { 
          type: 'error', 
          title: 'Switch Failed',
          duration: 8000
        })
      }
    }
  }

  if (!address) {
    return (
      <a href="/onboarding" className="px-3 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700">
        Connect Wallet
      </a>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="px-3 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
        title={address}
      >
        <span>{shorten(address)}</span>
        {chainId && <span className="text-xs opacity-75">({chainId})</span>}
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {showMenu && (
        <>
          {/* Backdrop to close menu */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowMenu(false)}
          />
          {/* Dropdown menu */}
          <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20 py-1">
            <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
              <div className="text-xs text-gray-500 dark:text-gray-400">Connected Wallet</div>
              <div className="text-sm font-mono truncate mt-1">{address}</div>
              {chainId && (
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Chain ID: {chainId}</div>
              )}
            </div>
            <button
              onClick={() => {
                handleSwitchWallet()
                setShowMenu(false)
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Switch Account
            </button>
            <button
              onClick={handleDisconnect}
              className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Disconnect Wallet
            </button>
          </div>
        </>
      )}
    </div>
  )
}


