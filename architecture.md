# Architecture Overview

## ✅ What's Implemented

### Frontend/UI (100% Complete)
- ✅ **Next.js 14** with App Router
- ✅ **Static Export** for IPFS deployment
- ✅ All pages (home, pools, deposit, withdraw, dashboard, history, relayers, auditor)
- ✅ Tornado Cash-style UI patterns
- ✅ Responsive design with Tailwind CSS
- ✅ Dark mode support

### Client-Side Logic (100% Complete)
- ✅ **Wallet Integration**: MetaMask connection and signing
- ✅ **Transaction Preparation**: ABI encoding with viem
- ✅ **Note Management**: Generate, store, validate deposit notes
- ✅ **Form Validation**: Address, amount, network validation
- ✅ **Local Storage**: Notes vault, transaction history
- ✅ **Relayer Marketplace**: Client-side relayer management
- ✅ **Selective Disclosure**: Bundle generation and storage

### Smart Contract Interface (Ready, Not Deployed)
- ✅ **Calldata Generation**: Deposit/withdraw calldata ready
- ✅ **Contract ABI**: Function signatures defined
- ⚠️ **Smart Contracts**: Not deployed (needs deployment)

### ZK Proof System (Interface Ready)
- ✅ **Proof Interface**: `ProofInput` and `ZkProof` types
- ⚠️ **Dummy Prover**: Deterministic placeholder
- ❌ **Real Circuits**: Needs circom/snarkjs integration

---

## ❌ What's NOT Implemented

### Traditional Backend Server
- ❌ No Express/FastAPI/Node.js server
- ❌ No REST API endpoints
- ❌ No database (uses localStorage instead)
- ❌ No server-side authentication

**Why?** This is a **decentralized frontend** that connects directly to blockchains. No central server needed!

### On-Chain Services
- ❌ Smart contracts not deployed
- ❌ Event indexer not built (needed for real anonymity set)
- ❌ Merkle tree state not tracked (needs indexer)

### External Services
- ❌ Real KYC provider integration (ICP SDK optional)
- ❌ Real screening API (mock implementation)
- ❌ Real relayer registry (localStorage only)

---

## Architecture Pattern

```
┌─────────────────────────────────────────┐
│         User's Browser                   │
│  ┌──────────────────────────────────┐  │
│  │    Next.js Static App (UI)       │  │
│  │  - Pages, Components, Forms      │  │
│  │  - Client-side logic             │  │
│  │  - localStorage (notes/history)  │  │
│  └──────────────────────────────────┘  │
│              │                          │
│              │ Wallet (MetaMask)        │
│              ▼                          │
│  ┌──────────────────────────────────┐  │
│  │   Blockchain RPC (Ethereum/etc)  │  │
│  │   - Read balances                │  │
│  │   - Submit transactions          │  │
│  │   - Read contract state          │  │
│  └──────────────────────────────────┘  │
└─────────────────────────────────────────┘
              │
              ▼
    ┌─────────────────────┐
    │  Smart Contracts    │
    │  (Not Deployed Yet) │
    └─────────────────────┘
```

**Key Points:**
1. **No Backend Server**: All logic runs in the browser
2. **Direct Blockchain Connection**: Uses RPC endpoints directly
3. **MetaMask for Signing**: User signs transactions in their wallet
4. **Static Frontend**: Can be hosted on IPFS, no server required

---

## Data Flow

### Deposit Flow
1. User fills form → Client validates
2. Generate note → Store in localStorage
3. Generate proof → Dummy prover (MVP)
4. Build calldata → viem ABI encoding
5. MetaMask signs → User approves
6. Submit to RPC → Transaction sent
7. Wait for receipt → Poll blockchain

### Withdraw Flow
1. User imports note → Validate format
2. Generate proof → Dummy prover (MVP)
3. Select relayer → Get quote
4. Build calldata → Include disclosure hash
5. MetaMask signs → User approves
6. Submit to RPC → Transaction sent
7. Wait for receipt → Poll blockchain

---

## What Works Locally

✅ **Fully Functional:**
- All UI pages and navigation
- Wallet connection
- Note generation and storage
- Form validation
- Transaction preparation and signing
- Local pool statistics

⚠️ **Partially Functional:**
- Transaction submission (will fail without deployed contracts)
- Pool statistics (from local data only, not on-chain)

---

## Next Steps for Production

1. **Deploy Smart Contracts**
   - Deploy deposit/withdraw contracts
   - Configure contract addresses in `.env.local`

2. **Integrate Real ZK Circuits**
   - Replace dummy prover with circom circuits
   - Generate real merkle proofs

3. **Build Event Indexer** (Optional but Recommended)
   - Track deposit/withdraw events on-chain
   - Calculate real anonymity sets
   - Provide real-time pool statistics

4. **Optional Services**
   - Integrate real KYC provider
   - Integrate real screening API
   - Deploy relayer registry contract

---

**Last Updated**: 2025-10-31
