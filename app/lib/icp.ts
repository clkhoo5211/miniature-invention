export interface IcpConnectResult {
  principal: string
  attestationRef: string
}

// Let webpack bundle @dfinity/auth-client properly
// We'll use a direct dynamic import that webpack can analyze and bundle
// The webpack config handles Node.js dependencies by setting them to false

async function safeDynamicImport(): Promise<unknown> {
  // Only run in browser - never during SSR/build
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    console.log('[ICP] Attempting to import @dfinity/auth-client...')
    
    // Direct dynamic import - webpack will bundle it and all its dependencies
    // The webpack config in next.config.js handles Node.js fallbacks
    const mod = await import('@dfinity/auth-client');
    console.log('[ICP] Successfully loaded @dfinity/auth-client');
    return mod;
  } catch (error: unknown) {
    console.error('[ICP] Failed to import @dfinity/auth-client:', (error as { message?: string }).message);
    console.error('[ICP] Error details:', error);
    return null;
  }
}

/**
 * Attempt to connect to ICP Internet Identity if SDK is available.
 * Falls back to a mock if not available or disabled.
 * 
 * IMPORTANT NOTES:
 * - Internet Identity uses a REDIRECT-BASED flow (not a modal/popup)
 * - It does NOT trigger Plug Wallet - they are separate systems:
 *   * Internet Identity: Authentication/KYC (WebAuthn: fingerprint, Face ID, YubiKey)
 *   * Plug Wallet: Browser extension for ICP asset management (separate)
 * - The login() method redirects user to identity.ic0.app, authenticates, then redirects back
 * - This function should be called from a button click handler
 */
export async function connectInternetIdentity(): Promise<IcpConnectResult> {
  const enabled = process.env.NEXT_PUBLIC_ENABLE_ICP_IDENTITY
  console.log('[ICP] Environment check:', { 
    enabled, 
    type: typeof enabled, 
    strict: enabled === 'true',
    nodeEnv: process.env.NODE_ENV 
  })
  
  if (enabled !== 'true') {
    console.warn('[ICP] Internet Identity disabled or not configured. Set NEXT_PUBLIC_ENABLE_ICP_IDENTITY=true to enable.')
    return mockIcpConnection()
  }

  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    console.warn('Internet Identity requires browser environment')
    return mockIcpConnection()
  }

  try {
    const mod = await safeDynamicImport()
    if (!mod) {
      console.error('[ICP] @dfinity/auth-client not available. Install with: npm install @dfinity/auth-client')
      return mockIcpConnection()
    }
    
    console.log('[ICP] Module imported successfully:', Object.keys(mod))
    const AuthClient = (mod as { AuthClient?: any }).AuthClient
    if (!AuthClient) {
      console.error('[ICP] AuthClient not found in module. Available exports:', Object.keys(mod))
      return mockIcpConnection()
    }
    
    console.log('[ICP] AuthClient found, creating instance...')

    // Create AuthClient instance
    // This will check localStorage for existing sessions
    const client = await AuthClient.create({
      identityProvider:
        process.env.NEXT_PUBLIC_ICP_INTERNET_IDENTITY_URL || 'https://identity.ic0.app',
      // Optional: Specify maxTimeToLive (session duration)
      // maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000), // 7 days in nanoseconds
    })

    // Check if user is already authenticated
    const isAuthenticated = await client.isAuthenticated()
    console.log('[ICP] Authentication status:', isAuthenticated)
    
    if (isAuthenticated) {
      const identity = client.getIdentity()
      const principal = identity.getPrincipal().toText()
      console.log('[ICP] Already authenticated with principal:', principal)
      
      return {
        principal,
        attestationRef: `delegation:${Date.now()}`,
      }
    }

    // User not authenticated - trigger login flow
    // This will REDIRECT the user to identity.ic0.app
    // After authentication, user is redirected back to the app
    console.log('[ICP] User not authenticated, triggering login flow (will redirect)...')
    await client.login({
      identityProvider:
        process.env.NEXT_PUBLIC_ICP_INTERNET_IDENTITY_URL || 'https://identity.ic0.app',
      // IMPORTANT: onSuccess callback runs AFTER redirect back from Internet Identity
      onSuccess: () => {
        // This callback executes after successful authentication
        // when user is redirected back to your app
        console.log('[ICP] Internet Identity authentication successful')
        
        // Get the authenticated identity
        const identity = client.getIdentity()
        const principal = identity.getPrincipal().toText()
        
        console.log('[ICP] Authenticated principal:', principal)
        
        // Store identity in localStorage for persistence
        if (typeof window !== 'undefined') {
          localStorage.setItem('icpIdentity', principal)
          localStorage.setItem('icpIdentityTimestamp', Date.now().toString())
          localStorage.setItem('icpAttestationRef', `delegation:${Date.now()}`)
          
          // Trigger a custom event so the UI can react immediately
          window.dispatchEvent(new CustomEvent('icpIdentityConnected', { 
            detail: { principal, timestamp: Date.now() } 
          }))
          
          // Don't auto-reload - let the component detect the session via useEffect
          // Reloading can cause infinite loops and hangs
        }
      },
      // Optional: Specify redirect URL (defaults to current URL)
      // redirectUrl: window.location.href,
      // Optional: Specify derivation origin for domain separation
      // derivationOrigin: window.location.origin,
    })

    // After calling login(), the page will redirect to Internet Identity
    // This code may not execute if redirect happens immediately
    // Return a placeholder - actual identity will be available after redirect
    return {
      principal: 'redirecting...',
      attestationRef: 'pending',
    }
  } catch (error) {
    console.error('Internet Identity connection error:', error)
    return mockIcpConnection()
  }
}

/**
 * Alternative pattern: Check for authenticated session after page load
 * Call this on component mount to detect if user returned from Internet Identity
 */
export async function checkInternetIdentitySession(): Promise<IcpConnectResult | null> {
  const enabled = process.env.NEXT_PUBLIC_ENABLE_ICP_IDENTITY
  if (enabled !== 'true') {
    return null
  }

  if (typeof window === 'undefined') {
    return null
  }

  try {
    const mod = await safeDynamicImport()
    if (!mod) return null
    
    const AuthClient = (mod as { AuthClient?: any }).AuthClient
    if (!AuthClient) return null

    const client = await AuthClient.create({
      identityProvider:
        process.env.NEXT_PUBLIC_ICP_INTERNET_IDENTITY_URL || 'https://identity.ic0.app',
    })

    const isAuthenticated = await client.isAuthenticated()
    if (isAuthenticated) {
      const identity = client.getIdentity()
      const principal = identity.getPrincipal().toText()
      
      return {
        principal,
        attestationRef: `delegation:${Date.now()}`,
      }
    }

    return null
  } catch (error) {
    console.error('Error checking Internet Identity session:', error)
    return null
  }
}

/**
 * Logout from Internet Identity
 */
export async function disconnectInternetIdentity(): Promise<void> {
  if (typeof window === 'undefined') return

  try {
    // Dynamic import ICP AuthClient
    const mod = await safeDynamicImport()
    if (!mod) return
    
    const AuthClient = (mod as { AuthClient?: any }).AuthClient
    if (!AuthClient) return

    const client = await AuthClient.create()
    await client.logout()

    // Clear localStorage
    localStorage.removeItem('icpIdentity')
    localStorage.removeItem('icpIdentityTimestamp')
    localStorage.removeItem('icpAttestationRef')
  } catch (error) {
    console.error('Error disconnecting Internet Identity:', error)
  }
}

function mockIcpConnection(): IcpConnectResult {
  return {
    principal: 'principal-mock-' + Date.now(),
    attestationRef: 'attestation-mock-' + Math.random().toString(36).slice(2),
  }
}
