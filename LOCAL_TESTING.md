# Local Testing & Debugging Guide

## ✅ Yes! You Can Test Everything Locally

You can test and debug the entire UI and most functionality locally **before** deploying to production.

---

## 🚀 Quick Start - Development Mode

```bash
# 1. Install dependencies (if not done)
npm install

# 2. Start development server with hot reload
npm run dev
```

**Access**: http://localhost:3000

**Features**:
- ✅ Hot reload (changes reflect immediately)
- ✅ Full React dev tools support
- ✅ Browser console for debugging
- ✅ TypeScript type checking
- ✅ Error overlay on save

---

## ✅ What You CAN Test Locally

### 1. **All UI Pages & Navigation** ✅
- [x] Home page with pool links
- [x] Pools index (`/pools/`)
- [x] Individual pool pages (`/pools/ETH/0.1/`)
- [x] Deposit page (`/deposit/`)
- [x] Withdraw page (`/withdraw/`)
- [x] Dashboard (`/dashboard/`)
- [x] History (`/history/`)
- [x] Relayers marketplace (`/relayers/`)
- [x] Auditor portal (`/auditor/`)
- [x] Onboarding (`/onboarding/`)

### 2. **Wallet Connection** ✅
- [x] Connect MetaMask
- [x] Switch networks
- [x] Display wallet address
- [x] Handle connection errors
- [x] Disconnect wallet

### 3. **Note Generation & Management** ✅
- [x] Generate deposit notes
- [x] Download notes as `.txt` files
- [x] Store notes in local vault
- [x] Import notes in withdraw page
- [x] Validate note format
- [x] Auto-fill amount/asset from note

### 4. **Form Validation** ✅
- [x] Address validation (format, checksum)
- [x] Amount validation (positive, decimals)
- [x] Network selection
- [x] Asset selection
- [x] Error messages

### 5. **Transaction Preparation** ✅
- [x] Build deposit calldata
- [x] Build withdraw calldata
- [x] Include disclosure hash
- [x] ABI encoding (viem)
- [x] Proof generation (dummy)

### 6. **Transaction Signing** ✅
- [x] MetaMask transaction popup
- [x] Sign transaction
- [x] Reject transaction
- [x] Handle signing errors

### 7. **Local Data** ✅
- [x] Notes vault (localStorage)
- [x] Transaction history (localStorage)
- [x] Pool statistics (from local data)
- [x] Recent deposits display

### 8. **Relayer Marketplace** ✅
- [x] View relayers
- [x] Get quotes
- [x] Select relayers
- [x] Filter by network
- [x] Add/edit/delete relayers (localStorage)

### 9. **Compliance Features** ✅
- [x] Address screening (mock)
- [x] Generate disclosure bundles
- [x] Store disclosure bundles
- [x] Download disclosure bundles
- [x] Verify disclosure bundles

---

## ⚠️ What WON'T Work (Without Deployed Contracts)

### On-Chain Transactions ❌
- ❌ Actual deposit transactions (contract not deployed)
- ❌ Actual withdrawal transactions (contract not deployed)
- ❌ Transaction receipts (no on-chain transactions)
- ❌ Real balance checking (can still call RPC, but contract won't exist)

**What happens?**
- Transaction preparation ✅ Works
- MetaMask signing ✅ Works
- Transaction submission ⚠️ Will fail (contract not found)
- You'll see a "contract not found" or "execution reverted" error

### Real-Time On-Chain Data ❌
- ❌ Real anonymity set (uses local notes count only)
- ❌ Real pool balances (not available)
- ❌ Real deposit history from blockchain (local only)
- ❌ Real merkle tree state (not available)

---

## 🐛 Debugging Tools

### 1. Browser DevTools

**Console** - Check for errors:
```javascript
// All logs and errors appear here
// Check for transaction errors, validation errors, etc.
```

**Network Tab** - Monitor RPC calls:
- See all blockchain RPC requests
- Check for failed requests
- Inspect request/response data

**Application Tab** - Check localStorage:
- `compliant-note-vault` - Your deposit notes
- `compliant-tx-history` - Transaction history
- `compliant-disclosure-bundles` - Disclosure bundles
- `compliant-relayers` - Relayer data

**React DevTools** - Component inspection:
- Install React DevTools browser extension
- Inspect component state
- Debug props and hooks

### 2. TypeScript Type Checking

```bash
# Check for type errors
npm run typecheck
```

### 3. Linting

```bash
# Run linter
npm run lint
```

### 4. Unit Tests

```bash
# Run unit tests
npm run test

# Watch mode (for development)
npm test -- --watch
```

---

## 🧪 Testing Checklist

### Basic Navigation
- [ ] Navigate to all pages
- [ ] Check links work
- [ ] Verify responsive design (mobile/desktop)
- [ ] Test dark mode toggle

### Wallet Connection
- [ ] Connect MetaMask
- [ ] Verify address displays
- [ ] Switch networks
- [ ] Disconnect and reconnect

### Deposit Flow
- [ ] Select network and asset
- [ ] Enter amount
- [ ] Generate proof (check console for dummy proof)
- [ ] Generate note (check localStorage)
- [ ] Download note file
- [ ] Attempt transaction (will fail, but signing works)
- [ ] Check note in vault

### Withdraw Flow
- [ ] Import note (paste)
- [ ] Verify note validation
- [ ] Select relayer
- [ ] Get relayer quote
- [ ] Generate proof
- [ ] Attempt transaction (will fail, but signing works)

### Note Management
- [ ] Generate multiple notes
- [ ] Check vault storage
- [ ] Import note in withdraw
- [ ] Validate note format
- [ ] Test invalid note formats

### Pool Statistics
- [ ] View pools index
- [ ] Click into individual pool
- [ ] Check anonymity set count (from local notes)
- [ ] View recent deposits (local)

### History & Dashboard
- [ ] Check dashboard recent activity
- [ ] View transaction history
- [ ] Verify explorer links format (even if transactions don't exist)

---

## 🔧 Development Configuration

### Environment Variables

Create `.env.local`:
```bash
# Contract address (placeholder for now)
NEXT_PUBLIC_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000

# RPC endpoints (use public testnets or mainnet RPCs)
NEXT_PUBLIC_ETHEREUM_RPC=https://eth.llamarpc.com
NEXT_PUBLIC_POLYGON_RPC=https://polygon-rpc.com
NEXT_PUBLIC_ARBITRUM_RPC=https://arb1.arbitrum.io/rpc
NEXT_PUBLIC_OPTIMISM_RPC=https://mainnet.optimism.io

# Optional: Enable ICP Internet Identity
NEXT_PUBLIC_ENABLE_ICP_IDENTITY=false
```

### Test with Different Networks

You can test with:
- **Mainnet**: Real addresses, real RPCs (expensive!)
- **Testnets**: Sepolia, Mumbai, etc. (free, but still need deployed contracts)
- **Local Hardhat/Foundry**: Run local node + deploy contracts

---

## 📝 Debugging Common Issues

### 1. "Contract not found" Error
**Expected**: This is normal! Contracts aren't deployed yet.
**Solution**: You can still test the UI flow. Transactions will fail at submission, but everything else works.

### 2. "Invalid note format"
**Check**: Note starts with `note-compliant-`
**Fix**: Use notes generated by the deposit page

### 3. MetaMask not connecting
**Check**: 
- MetaMask extension installed?
- Extension enabled?
- Popup blocked?

### 4. RPC errors
**Check**: 
- `.env.local` configured?
- RPC endpoint accessible?
- Network selected in MetaMask matches?

### 5. localStorage not persisting
**Check**: 
- Browser allows localStorage?
- Using incognito/private mode? (localStorage disabled)
- Storage quota exceeded?

---

## 🎯 Recommended Testing Flow

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Test Basic Navigation**
   - Visit all pages
   - Check responsiveness

3. **Test Wallet Connection**
   - Connect MetaMask
   - Verify address shows

4. **Test Deposit Flow**
   - Fill deposit form
   - Generate note
   - Check localStorage
   - Attempt transaction (will fail, that's OK)

5. **Test Withdraw Flow**
   - Import note from deposit
   - Select relayer
   - Attempt transaction (will fail, that's OK)

6. **Test Note Management**
   - Generate multiple notes
   - Check vault
   - Verify note validation

7. **Test Pool Pages**
   - Browse pools
   - Check statistics
   - View recent deposits

8. **Check Console**
   - Look for errors
   - Verify logs
   - Check RPC calls

---

## ✅ Pre-Production Checklist

Before going to production, verify:

- [ ] All pages load without errors
- [ ] Wallet connection works
- [ ] Form validation works
- [ ] Note generation/import works
- [ ] Transaction preparation works
- [ ] No console errors (except expected contract errors)
- [ ] TypeScript types pass (`npm run typecheck`)
- [ ] Linting passes (`npm run lint`)
- [ ] Tests pass (`npm run test`)
- [ ] Build succeeds (`npm run build`)

---

## 🚀 Next Steps After Local Testing

Once local testing is complete:

1. **Deploy Smart Contracts**
   - Deploy to testnet first
   - Update `.env.local` with contract addresses
   - Test with real contracts

2. **Integrate Real ZK Circuits**
   - Replace dummy prover
   - Test proof generation

3. **Build Event Indexer** (Optional)
   - For real anonymity sets
   - Real-time pool statistics

4. **Deploy to IPFS/IPNS**
   - Use `npm run deploy:ipfs:full`
   - Verify deployment

---

**Happy Testing! 🎉**

**Last Updated**: 2025-10-31

