# ICP Internet Identity Import Fix

## Problem

The console shows: `@dfinity/auth-client not available` even though:
- ✅ Package is installed (`@dfinity/auth-client@3.4.1`)
- ✅ Package exists in `node_modules/@dfinity/auth-client`
- ✅ Node.js can import it successfully

## Root Cause

**Next.js static export mode** (`output: 'export'`) tries to bundle all dependencies at build time, but `@dfinity/auth-client` is an ES module that needs to be loaded dynamically at runtime in the browser.

## Solution Applied

### 1. Updated `next.config.js`

Added webpack configuration to externalize `@dfinity` packages:
```javascript
webpack: (config, { isServer }) => {
  if (!isServer) {
    config.externals = config.externals || [];
    config.externals.push({
      '@dfinity/auth-client': '@dfinity/auth-client',
      '@dfinity/identity': '@dfinity/identity',
      '@dfinity/principal': '@dfinity/principal',
    });
  }
  return config;
}
```

### 2. Improved Dynamic Import

Enhanced `safeDynamicImport()` with multiple fallback methods:
1. Standard dynamic import
2. Function constructor (bypasses webpack)
3. Direct path import (for development)

### 3. Better Error Logging

Added detailed console logs to diagnose which import method fails and why.

## Alternative Solutions (If Above Doesn't Work)

### Option A: Load from CDN (Recommended for Static Export)

Since static export doesn't support node_modules runtime loading, use a CDN:

```typescript
// Load from unpkg CDN
const mod = await import('https://unpkg.com/@dfinity/auth-client@3.4.1/dist/esm/index.js')
```

### Option B: Copy to Public Folder

Copy the built files to `public/js/` and load directly:
```typescript
const mod = await import('/js/@dfinity-auth-client.js')
```

### Option C: Use Next.js API Routes (If Not Using Static Export)

Create an API route that proxies the module loading (won't work with `output: 'export'`).

## Testing

After applying the fix:

1. **Restart dev server** (critical - webpack changes require restart)
   ```bash
   npm run dev
   ```

2. Navigate to `/onboarding`

3. Open browser console (F12)

4. Click "Connect ICP Internet Identity"

5. Check console logs - should see:
   - `[ICP] Attempting dynamic import of: @dfinity/auth-client`
   - `[ICP] Standard dynamic import succeeded` (or which method worked)
   - `[ICP] Module imported successfully: [...]`

6. Should redirect to `identity.ic0.app`

## If Still Not Working

The static export limitation might require loading from a CDN. Update the import:

```typescript
// In app/lib/icp.ts, replace safeDynamicImport for @dfinity/auth-client:
const mod = await import('https://unpkg.com/@dfinity/auth-client@3.4.1/dist/esm/index.js?module')
```

This loads the module directly from CDN, bypassing Next.js bundling entirely.

---

**Last Updated**: 2025-10-31  
**Status**: ⚠️ Fix Applied - Restart Required

