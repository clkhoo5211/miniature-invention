# ICP Internet Identity Integration Guide

## Overview

**Internet Identity** is the Internet Computer's authentication system that enables passwordless authentication using WebAuthn (fingerprint, Face ID, hardware security keys like YubiKey).

**Important Distinctions:**
- **Internet Identity ≠ Plug Wallet**
  - Internet Identity: Authentication/KYC (passwordless, WebAuthn-based)
  - Plug Wallet: Browser extension wallet for ICP (transaction signing, asset management)
  - They are **separate systems** that can work together but serve different purposes

## How Internet Identity Works

### Authentication Flow

1. **User Clicks "Connect Internet Identity"**
   - Triggers `AuthClient.login()`
   - User is **REDIRECTED** to `identity.ic0.app`
   - Not a popup/modal - full page redirect

2. **User Authenticates on Internet Identity**
   - Uses WebAuthn (fingerprint, Face ID, YubiKey, etc.)
   - No passwords required
   - Cryptographic keys never leave the device

3. **Redirect Back to Your App**
   - Internet Identity redirects back to your app
   - Authentication delegation/credentials included in URL
   - `AuthClient` handles the delegation automatically

4. **Session Established**
   - Identity stored in `AuthClient` instance
   - Principal can be retrieved: `client.getIdentity().getPrincipal()`
   - Session persists in localStorage (managed by AuthClient)

## Implementation Details

### Current Implementation (`app/lib/icp.ts`)

```typescript
// 1. Create AuthClient instance
const client = await AuthClient.create({
  identityProvider: 'https://identity.ic0.app',
})

// 2. Check if already authenticated
const isAuthenticated = await client.isAuthenticated()

// 3. Trigger login (redirects to Internet Identity)
await client.login({
  identityProvider: 'https://identity.ic0.app',
  onSuccess: () => {
    // Called after redirect back from Internet Identity
    const identity = client.getIdentity()
    const principal = identity.getPrincipal().toText()
  },
})
```

### Key Implementation Notes

1. **Redirect-Based Flow**
   - `login()` causes a full page redirect (not async/await in traditional sense)
   - Code after `login()` may not execute if redirect happens immediately
   - Use `checkInternetIdentitySession()` on page load to detect authenticated sessions

2. **Session Detection**
   - Call `checkInternetIdentitySession()` on component mount
   - Detects if user returned from Internet Identity authentication
   - Returns principal if authenticated, null otherwise

3. **State Management**
   - AuthClient manages session in localStorage automatically
   - Session persists across page reloads
   - Use `client.isAuthenticated()` to check session status

## Integration in Onboarding Flow

### Current Implementation (`app/onboarding/page.tsx`)

```typescript
// Step 1: KYC Verification via Internet Identity
const handleICPConnect = async () => {
  // This redirects user to Internet Identity
  await connectInternetIdentity()
  // After redirect back, useEffect detects the session
}

// Check for session on mount (handles redirect back)
useEffect(() => {
  const session = await checkInternetIdentitySession()
  if (session) {
    setIcpIdentity(session.principal)
    setStep(2) // Auto-advance to wallet connection
  }
}, [step])
```

### User Experience Flow

1. **Step 1: KYC Verification**
   - User clicks "Connect ICP Internet Identity"
   - **Redirects to identity.ic0.app**
   - User authenticates (fingerprint/Face ID/YubiKey)
   - **Redirects back to onboarding page**

2. **Step 2: Wallet Connection**
   - Automatically advances (session detected)
   - User connects EVM wallet (MetaMask)
   - Separate from Internet Identity

3. **Step 3: Network Selection**
   - User selects network (Ethereum, Polygon, etc.)
   - Completes onboarding

## Configuration

### Environment Variables

```env
# Enable Internet Identity integration
NEXT_PUBLIC_ENABLE_ICP_IDENTITY=true

# Internet Identity URL (optional, defaults to production)
NEXT_PUBLIC_ICP_INTERNET_IDENTITY_URL=https://identity.ic0.app
```

### Dependencies

```json
{
  "dependencies": {
    "@dfinity/auth-client": "^2.0.0" // Optional, dynamically imported
  }
}
```

**Note**: The SDK is dynamically imported, so the app works even if `@dfinity/auth-client` is not installed (falls back to mock).

## Common Issues & Solutions

### Issue 1: Redirect Loop

**Problem**: App redirects infinitely between your app and Internet Identity

**Solution**: 
- Ensure `redirectUrl` matches your app's URL exactly
- Check that `derivationOrigin` is set correctly (if used)
- Verify Internet Identity canister is properly configured

### Issue 2: Session Not Detected After Redirect

**Problem**: User authenticates but session isn't detected after redirect

**Solution**:
- Call `checkInternetIdentitySession()` on component mount
- Wait for AuthClient to process delegation after redirect
- Reload page if needed: `window.location.reload()`

### Issue 3: Mock Identity in Production

**Problem**: Always returns mock identity instead of real authentication

**Solution**:
- Check `NEXT_PUBLIC_ENABLE_ICP_IDENTITY=true` in environment
- Verify `@dfinity/auth-client` is installed
- Check browser console for errors

## Security Considerations

1. **Principal Storage**
   - Store principal in localStorage (public identifier, not sensitive)
   - Do NOT store private keys (AuthClient handles this securely)

2. **Session Duration**
   - Sessions persist until user logs out or expires
   - Set `maxTimeToLive` for session expiration (optional)

3. **Domain Verification**
   - Internet Identity verifies the origin domain
   - Ensure your domain matches the configured derivation origin

## Testing

### Development Testing

```typescript
// Mock mode (when NEXT_PUBLIC_ENABLE_ICP_IDENTITY !== 'true')
const result = await connectInternetIdentity()
// Returns: { principal: 'principal-mock-...', attestationRef: '...' }
```

### Production Testing

1. Set `NEXT_PUBLIC_ENABLE_ICP_IDENTITY=true`
2. Install `@dfinity/auth-client`
3. Click "Connect Internet Identity"
4. Should redirect to `identity.ic0.app`
5. Authenticate with WebAuthn
6. Should redirect back with authenticated session

## References

- [Official Internet Identity Docs](https://internetcomputer.org/docs/building-apps/authentication/integrate-internet-identity)
- [Internet Identity Specification](https://internetcomputer.org/docs/references/ii-spec)
- [@dfinity/auth-client NPM](https://www.npmjs.com/package/@dfinity/auth-client)
- [Internet Computer Developer Forum](https://forum.dfinity.org)

## FAQ

### Q: Does Internet Identity trigger Plug Wallet?
**A**: No. Internet Identity and Plug Wallet are separate systems. Internet Identity is for authentication/KYC. Plug Wallet is for asset management on ICP.

### Q: Can I use Internet Identity for both authentication and wallet?
**A**: Internet Identity provides authentication (principal). For ICP transactions, you'd need Plug Wallet or another ICP wallet. For EVM chains (this project), use MetaMask.

### Q: How do I integrate Plug Wallet?
**A**: Plug Wallet has its own integration pattern. It's a browser extension (similar to MetaMask). Check Plug Wallet documentation for integration.

### Q: Why does login() cause a redirect?
**A**: Internet Identity uses a redirect-based OAuth-like flow for security. This prevents popup blocking and ensures proper domain verification.

---

**Last Updated**: 2025-10-31  
**Implementation Status**: ✅ Corrected to use proper redirect-based flow

