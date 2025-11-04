# Quick Start - Running Locally

## Architecture Overview

### ✅ What's Implemented

**Frontend/UI (100% Complete)**:
- ✅ Next.js 14 static export application
- ✅ All pages and user flows
- ✅ Wallet integration (MetaMask)
- ✅ Form validation
- ✅ Transaction signing
- ✅ Note generation/management
- ✅ Pool statistics
- ✅ All Tornado Cash-style UI patterns

**Backend Logic (Client-Side)**:
- ✅ Client-side utilities (wallet, validation, API client)
- ✅ Local storage for notes and history
- ✅ ABI encoding for smart contract calls
- ✅ Transaction preparation and signing
- ⚠️ No server-side backend (static frontend only)

**Smart Contracts**:
- ⚠️ Contract interface ready (calldata generation works)
- ❌ Contracts not deployed yet (needs deployment)

**ZK Circuits**:
- ⚠️ Dummy prover implemented (interface ready)
- ❌ Real circuits not integrated (needs circom/snarkjs)

---

## Running Locally

### Option 1: Development Server (Recommended for Development)

```bash
cd /Users/khoo/Downloads/project4/projects/project-20251030-232211-compliant-private-transfers

# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

**Access**: http://localhost:3000

**Features**:
- Hot reload on file changes
- Full Next.js development features
- Debug mode

---

### Option 2: Production Build + Static Server

```bash
cd /Users/khoo/Downloads/project4/projects/project-20251030-232211-compliant-private-transfers

# Build the application
npm run build

# Serve the static build
cd out
python3 -m http.server 8080
```

**Access**: http://localhost:8080

**Note**: Currently running on port 8080

---

### Option 3: Docker Compose (IPFS + Nginx)

```bash
cd /Users/khoo/Downloads/project4/projects/project-20251030-232211-compliant-private-transfers

# Ensure Docker Desktop is running

# Build the app first
npm run build

# Start IPFS and web server
docker compose up -d
```

**Access**:
- **App**: http://localhost:8080
- **IPFS API**: http://127.0.0.1:5001
- **IPFS Gateway**: http://127.0.0.1:8081

**Stop**:
```bash
docker compose down
```

See `docs/docker-LOCAL.md` for more details.

---

## What Works vs. What Needs Backend

### ✅ Works Locally (Client-Side Only)

1. **All UI Pages**: Navigation, forms, displays
2. **Wallet Connection**: MetaMask integration
3. **Note Generation**: Create and store deposit notes
4. **Form Validation**: Address, amount, network validation
5. **Transaction Preparation**: Build calldata for contracts
6. **Transaction Signing**: MetaMask signing flow
7. **Local Storage**: Notes vault, transaction history
8. **Pool Statistics**: From local data (MVP)

### ⚠️ Needs Smart Contract Deployment

1. **On-Chain Deposits**: Contracts must be deployed
2. **On-Chain Withdrawals**: Contracts must be deployed
3. **Real Anonymity Set**: Needs event indexer
4. **Merkle Tree State**: Needs contract + indexer

### ⚠️ Needs Real ZK Circuits

1. **Proof Generation**: Replace dummy prover
2. **Merkle Proofs**: Include merkle paths
3. **Nullifier Hashing**: Cryptographic nullifiers

---

## Testing the UI Locally

Even without deployed contracts, you can test:

1. **Wallet Connection**: Connect MetaMask
2. **Note Generation**: Create deposit notes
3. **Note Import**: Paste notes in withdraw
4. **Transaction Signing**: Will fail at submission (no contract), but signing flow works
5. **All Pages**: Navigate through all routes
6. **Statistics**: View pool stats (from local data)

---

## Environment Setup

### Required (for full functionality)

Create `.env.local`:
```bash
# Contract address (use placeholder until deployed)
NEXT_PUBLIC_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000

# RPC endpoints (use public endpoints for testing)
NEXT_PUBLIC_ETHEREUM_RPC=https://eth.llamarpc.com
NEXT_PUBLIC_POLYGON_RPC=https://polygon-rpc.com
NEXT_PUBLIC_ARBITRUM_RPC=https://arb1.arbitrum.io/rpc
NEXT_PUBLIC_OPTIMISM_RPC=https://mainnet.optimism.io

# Optional: ICP Internet Identity
NEXT_PUBLIC_ENABLE_ICP_IDENTITY=false
```

---

## Current Status

**UI/UX**: ✅ 100% Complete  
**Client Logic**: ✅ 100% Complete  
**Smart Contracts**: ❌ Not deployed  
**ZK Circuits**: ⚠️ Dummy prover (ready for real)  
**Backend Indexer**: ❌ Not implemented  

**You can run the full UI locally and test all flows except actual on-chain transactions.**

---

## Quick Test Checklist

- [ ] `npm install` - Dependencies installed
- [ ] `npm run dev` - Dev server starts
- [ ] Open http://localhost:3000
- [ ] Navigate to /pools/ - Pools page loads
- [ ] Navigate to /deposit/ - Deposit form works
- [ ] Connect wallet - MetaMask connects
- [ ] Generate note - Note created and saved
- [ ] Navigate to /withdraw/ - Withdraw form works
- [ ] Import note - Note validation works
- [ ] Check /dashboard/ - Dashboard displays
- [ ] Check /history/ - History page works

All of these work without any backend! 🎉

---

**Last Updated**: 2025-10-31

