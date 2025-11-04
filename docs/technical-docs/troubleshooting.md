# Troubleshooting Guide

**Last Updated**: 2025-10-31  
**Version**: 1.0

---

## Common Issues and Solutions

### Transaction Issues

#### Transaction Rejected by User

**Symptom**: MetaMask popup closes without signing, error code `4001`

**Solution**:
- User needs to approve transaction in MetaMask
- Check MetaMask is unlocked
- Verify sufficient gas funds

**Code**:
```typescript
if (error.code === 4001) {
  alert('Transaction rejected by user');
}
```

---

#### Transaction Execution Failed

**Symptom**: Transaction signed but fails with error code `-32603` or "execution reverted"

**Possible Causes**:
1. **Contract not deployed**: Smart contracts not deployed yet
2. **Insufficient funds**: Not enough balance for deposit
3. **Invalid proof**: ZK proof validation failed (with dummy prover, less likely)
4. **Already spent**: Nullifier already used (double-spend prevention)

**Solutions**:
1. **Contract not deployed**: Expected for MVP - contracts need deployment
2. **Insufficient funds**: Check balance before deposit
3. **Invalid proof**: Verify proof generation (future: check circuit validity)
4. **Already spent**: Check if note was already used in previous withdrawal

---

#### Transaction Stuck / No Receipt

**Symptom**: Transaction submitted but receipt never received

**Possible Causes**:
1. Network congestion
2. Low gas price
3. RPC endpoint issues

**Solutions**:
1. Wait longer (timeout is 2 minutes by default)
2. Check transaction on blockchain explorer
3. Try resubmitting with higher gas price (future enhancement)

**Code Location**: `app/lib/wallet.ts` - `waitForTransactionReceipt()`

---

### Wallet Connection Issues

#### MetaMask Not Detected

**Symptom**: "Please install MetaMask" error

**Solution**:
1. Install MetaMask browser extension
2. Refresh the page
3. Check extension is enabled

**Code Location**: `app/lib/wallet.ts` - `getWalletState()`

---

#### Wrong Network Selected

**Symptom**: Transaction fails or wrong network error

**Solution**:
1. Switch to correct network in MetaMask
2. Or use "Switch Network" button in UI (if implemented)
3. Verify network matches selected network in form

**Code Location**: `app/lib/wallet.ts` - Network detection

---

### Note Management Issues

#### Note Not Found in Vault

**Symptom**: Warning on withdraw: "Note not found in local vault"

**Possible Causes**:
1. Note stored in different browser/device
2. localStorage cleared
3. Note from different vault

**Solutions**:
1. Import note from backup (exported `.txt` file)
2. Use note from original deposit transaction
3. Continue anyway (warning only, note can still be used if valid)

**Code Location**: `app/lib/note.ts` - `isNoteInVault()`

---

#### Invalid Note Format

**Symptom**: "Invalid note format" error

**Solution**:
1. Verify note starts with `note-compliant-`
2. Check note has correct format: `note-compliant-<asset>-<denom>-<random>-<checksum>`
3. Verify checksum is 8 hex characters
4. Ensure note wasn't corrupted during copy/paste

**Code Location**: `app/lib/note.ts` - `validateNote()`

---

### Build and Deployment Issues

#### Build Fails

**Symptom**: `npm run build` fails with errors

**Common Causes**:
1. TypeScript errors
2. Missing dependencies
3. Environment variable issues

**Solutions**:
1. **TypeScript errors**: Run `npm run typecheck` to see errors
2. **Missing dependencies**: Run `npm install`
3. **Environment variables**: Create `.env.local` from `.env.example`

**Check**:
```bash
npm run typecheck  # Check TypeScript
npm install        # Install dependencies
```

---

#### Static Export Routes Not Working

**Symptom**: 404 errors on routes like `/dashboard`, `/onboarding`

**Solution**:
Ensure `next.config.js` has:
```javascript
trailingSlash: true
```

This ensures routes resolve correctly for static export.

**Code Location**: `next.config.js`

---

### RPC Connection Issues

#### RPC Endpoint Unavailable

**Symptom**: "Network error" or "RPC endpoint unavailable"

**Solutions**:
1. Check RPC endpoint URL in `.env.local`
2. Verify endpoint is accessible
3. Try alternative RPC endpoint
4. Check rate limiting (some public RPCs have limits)

**Configuration**:
```bash
# .env.local
NEXT_PUBLIC_ETHEREUM_RPC=https://eth.llamarpc.com
NEXT_PUBLIC_POLYGON_RPC=https://polygon-rpc.com
```

---

### Development Server Issues

#### Dev Server Won't Start

**Symptom**: `npm run dev` fails

**Solutions**:
1. **Port in use**: Change port with `PORT=3001 npm run dev`
2. **Dependencies**: Run `npm install`
3. **Node version**: Ensure Node.js 18+ is installed

---

#### Hot Reload Not Working

**Symptom**: Changes not reflecting in browser

**Solutions**:
1. Refresh browser manually
2. Clear browser cache
3. Restart dev server

---

### localStorage Issues

#### Data Not Persisting

**Symptom**: Notes/history disappear after page refresh

**Possible Causes**:
1. **Private/Incognito mode**: localStorage disabled
2. **Browser settings**: localStorage disabled
3. **Storage quota**: Storage limit exceeded

**Solutions**:
1. Use regular browser mode (not incognito)
2. Check browser settings for localStorage
3. Clear old data (future: implement cleanup)

---

#### Storage Quota Exceeded

**Symptom**: Error saving to localStorage

**Solution**:
1. Clear old transaction history (keep last 100 entries)
2. Export and delete old notes
3. Clear browser storage for this domain

**Code Location**: `app/lib/note.ts` - Limits history to 100 entries

---

### ESLint Configuration Issues

#### ESLint Errors After Upgrade

**Symptom**: ESLint configuration errors after v9 upgrade

**Solution**:
ESLint v9 uses flat config format. Next.js should auto-configure, but if issues persist:

1. Delete `.eslintrc.json` and let Next.js regenerate
2. Run `npm run lint` to trigger auto-configuration
3. Check for conflicting ESLint plugins

**Status**: ✅ Fixed in Debug Agent - ESLint v9 configured

---

## Debugging Tips

### Enable Console Logging

Add logging to debug issues:

```typescript
console.log('Debug:', {
  network: selectedNetwork,
  asset: selectedAsset,
  amount: amount,
  calldata: calldata
});
```

### Check Browser DevTools

1. **Console**: Check for JavaScript errors
2. **Network**: Monitor RPC calls and responses
3. **Application**: Inspect localStorage data
4. **React DevTools**: Inspect component state

### Verify Transaction on Explorer

Check transaction status on blockchain explorer:

```typescript
import { getExplorerUrl } from '@/app/lib/explorer';

const explorerUrl = getExplorerUrl('ethereum', txHash);
console.log('Transaction:', explorerUrl);
```

---

## Getting Help

### Check Documentation
- [Architecture Guide](./architecture.md)
- [Implementation Guide](./implementation-guide.md)
- [API Reference](../api-documentation/api-reference.md)
- [User Manual](../user-manuals/getting-started.md)

### Common Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| `4001` | User rejected | User needs to approve in MetaMask |
| `-32603` | Execution reverted | Check contract deployment, balance, proof |
| `-32602` | Invalid params | Check transaction parameters |
| `-32601` | Method not found | Check RPC endpoint supports method |
| `-32700` | Parse error | Invalid JSON in RPC call |

---

## Reporting Issues

When reporting issues, include:
1. **Browser**: Chrome, Firefox, Safari, etc.
2. **MetaMask Version**: Version number
3. **Network**: Ethereum, Polygon, etc.
4. **Error Message**: Full error text
5. **Steps to Reproduce**: Detailed steps
6. **Console Logs**: Any error messages from browser console

---

**Related Documentation**:
- [Architecture](./architecture.md)
- [Implementation Guide](./implementation-guide.md)
- [API Reference](../api-documentation/api-reference.md)

