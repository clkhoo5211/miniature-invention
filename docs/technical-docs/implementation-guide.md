# Implementation Guide

**Last Updated**: 2025-10-31  
**Version**: 1.0

---

## Overview

This guide provides detailed implementation information for developers working on the Compliant Private Transfers system.

---

## Core Implementation Patterns

### 1. Adapter Pattern

The system uses an adapter pattern for blockchain interactions:

```typescript
// Unified adapter interface
export interface Adapter {
  init(options: AdapterInitOptions): Promise<void>;
  getBalance(address: string, assetSymbol?: string): Promise<string>;
  deposit(params: DepositParams): Promise<string>;
  withdraw(params: WithdrawParams): Promise<string>;
}

// EVM implementation
export class EvmAdapter implements Adapter {
  // Implementation details
}
```

**Location**: `src/adapters/Adapter.ts`, `src/adapters/evm/EvmAdapter.ts`

**Benefits**:
- Easy to add new chains (Solana, BNB Chain, TRON)
- Consistent interface across all chains
- Testable and mockable

---

### 2. Note Generation and Management

Deposit notes are generated with cryptographic components:

```typescript
interface DepositNote {
  note: string;              // Human-readable note string
  asset: string;             // Asset symbol (ETH, USDC, etc.)
  denomination: string;      // Amount string
  nullifier: string;         // Hex string for double-spend prevention
  secret: string;            // Hex string for proof generation
  checksum: string;          // 8-char hex checksum
  createdAt: string;         // ISO timestamp
}
```

**Generation**:
- Nullifier and secret derived from random seed
- Checksum validates note integrity
- Note format: `note-compliant-<asset>-<denom>-<random>-<checksum>`

**Storage**:
- Notes stored in `localStorage` under key `compliant-note-vault`
- User can export/download notes as `.txt` files
- Vault validated on withdraw to warn if note not found

**Location**: `app/lib/note.ts`

---

### 3. Transaction Preparation and Signing

#### Calldata Generation

All contract calls use `viem` for ABI encoding:

```typescript
import { encodeFunctionData } from 'viem';

// Deposit calldata
const calldata = buildDepositCalldata({
  assetSymbol: 'ETH',
  to: '0x...',
  amount: BigInt('1000000000000000000'), // 1 ETH in wei
  proofData: '0x...'
});
```

**Location**: `src/adapters/evm/calldata.ts`

#### MetaMask Integration

Transaction signing via MetaMask:

```typescript
// Request transaction signature
const txHash = await window.ethereum.request({
  method: 'eth_sendTransaction',
  params: [{
    to: contractAddress,
    from: userAddress,
    data: calldata,
    value: valueHex // For native tokens
  }]
});

// Poll for receipt
const receipt = await waitForTransactionReceipt(txHash);
```

**Location**: `app/lib/wallet.ts`

---

### 4. ZK Proof Generation (MVP)

Current implementation uses a dummy prover:

```typescript
export async function generateDummyProof(input: ProofInput): Promise<ZkProof> {
  return {
    proofData: `0x${Buffer.from(JSON.stringify(input)).toString('hex')}`,
    publicSignals: [
      input.assetSymbol,
      input.amount,
      input.senderAddress,
      input.nonce,
    ],
  };
}
```

**Future Integration**:
- Replace with real circom/snarkjs circuits
- Include merkle proofs
- Cryptographic nullifier hashing

**Location**: `src/prover/proof.ts`, `app/lib/api.ts`

---

### 5. Selective Disclosure

Disclosure bundles are generated for compliance:

```typescript
interface DisclosureBundle {
  depositTxHash: string;
  withdrawTxHash: string;
  amount: string;
  asset: string;
  timestamp: string;
  userAddress?: string; // Optional
}

// Generate bundle
const bundle = generateDisclosureBundle({
  depositTxHash: '0x...',
  withdrawTxHash: '0x...',
  amount: '1.0',
  asset: 'ETH'
});

// Hash for on-chain storage
const hash = hashDisclosureBundle(bundle); // 32-byte hash

// Store locally
saveDisclosureBundle(bundle);
```

**Location**: `app/lib/disclosure.ts`

---

### 6. Form Validation

Comprehensive client-side validation:

```typescript
// Address validation
const result = validateAddress('0x...');
if (!result.isValid) {
  alert(result.error);
}

// Amount validation
const amountResult = validateAmount('1.5');
if (!amountResult.isValid) {
  alert(amountResult.error);
}

// Network validation
const networkResult = validateNetwork('ethereum');
```

**Location**: `app/lib/validation.ts`

**Validation Rules**:
- **Address**: Valid Ethereum address format, checksummed
- **Amount**: Positive number, within limits, proper decimals
- **Network**: Supported network (Ethereum, Polygon, Arbitrum, Optimism)

---

### 7. Relayer Marketplace

Relayers managed client-side:

```typescript
// Get active relayers for network
const relayers = getActiveRelayers('ethereum');

// Get quote
const quote = getRelayerQuote('relayer-1', {
  network: 'ethereum',
  amount: '1.0',
  asset: 'ETH'
});

// Quote includes:
// - Fee amount
// - Fee percentage
// - Total amount (amount + fee)
// - Time-to-live (TTL)
```

**Storage**: `localStorage` under key `compliant-relayers`

**Location**: `app/lib/relayers.ts`

---

### 8. Pool Statistics

Pool stats calculated from local data (MVP):

```typescript
interface PoolStats {
  anonymitySet: number;        // Count of local notes
  totalDeposits: number;       // Total deposits in pool
  totalVolume: string;          // Total volume (wei string)
  recentActivity24h: number;    // Deposits in last 24h
  recentActivity7d: number;     // Deposits in last 7 days
  avgDepositInterval: number;   // Average seconds between deposits
  lastDeposit?: {
    txHash: string;
    timestamp: string;
    explorerUrl: string;
  };
}
```

**Future Enhancement**: Connect to on-chain indexer for real-time stats

**Location**: `app/lib/poolStats.ts`

---

## Page Implementation Patterns

### 1. Client Components

All interactive pages use client components:

```typescript
'use client';

import { useState, useEffect } from 'react';

export default function DepositPage() {
  const [selectedNetwork, setSelectedNetwork] = useState('ethereum');
  const [selectedAsset, setSelectedAsset] = useState('ETH');
  // ... state management
  
  // Event handlers
  const handleDeposit = async () => {
    // Deposit logic
  };
  
  return (
    // JSX
  );
}
```

### 2. Static Generation

Pool detail pages use static generation:

```typescript
// Generate static paths at build time
export async function generateStaticParams() {
  return [
    { asset: 'ETH', denom: '0.1' },
    { asset: 'ETH', denom: '1' },
    { asset: 'ETH', denom: '10' },
  ];
}
```

**Location**: `app/pools/[asset]/[denom]/page.tsx`

---

## Testing Patterns

### Unit Tests

Tests use Vitest:

```typescript
import { describe, it, expect } from 'vitest';
import { buildDepositCalldata } from '../src/adapters/evm/calldata';

describe('EVM calldata builders', () => {
  it('buildDepositCalldata returns valid hex calldata', () => {
    const calldata = buildDepositCalldata({
      assetSymbol: 'ETH',
      to: '0x000000000000000000000000000000000000dEaD',
      amount: 1234567890123456789n,
      proofData: '0x1234abcd',
    });
    
    expect(isHex(calldata)).toBe(true);
    expect(calldata.length).toBeGreaterThan(10);
  });
});
```

**Location**: `tests/`

---

## Build and Deployment

### Static Export

Next.js configured for static export:

```javascript
// next.config.js
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};
```

**Build Command**: `npm run build`

**Output**: `out/` directory with static files

### IPFS Deployment

Automated deployment scripts:

```bash
# Simple deployment (IPFS only)
npm run deploy:ipfs

# Full deployment (IPFS + IPNS)
npm run deploy:ipfs:full
```

**Location**: `scripts/deploy-ipfs.sh`, `scripts/deploy-ipfs-simple.sh`

---

## Error Handling Patterns

### Transaction Errors

```typescript
try {
  const txHash = await signAndSendTransaction(params);
  const receipt = await waitForTransactionReceipt(txHash);
} catch (error) {
  if (error.code === 4001) {
    // User rejected transaction
    alert('Transaction rejected by user');
  } else if (error.code === -32603) {
    // Execution reverted (contract error)
    alert('Transaction failed: Contract execution reverted');
  } else {
    // Other errors
    console.error('Transaction error:', error);
    alert('Transaction failed. Please try again.');
  }
}
```

### RPC Errors

```typescript
try {
  const balance = await adapter.getBalance(address);
} catch (error) {
  if (error.message.includes('network')) {
    // Network/RPC error
    alert('Network error. Please check your RPC endpoint.');
  } else {
    // Other errors
    console.error('RPC error:', error);
  }
}
```

---

## Performance Considerations

### Code Splitting

- Dynamic imports for optional features (ICP Identity)
- Route-based code splitting (Next.js automatic)

### Local Storage Optimization

- Limit transaction history to last 100 entries
- Clean old notes periodically (future enhancement)

### RPC Calls

- Cache balance calls (with TTL)
- Batch multiple queries where possible (future enhancement)

---

**Related Documentation**:
- [Architecture](./architecture.md)
- [API Reference](../api-documentation/api-reference.md)
- [Troubleshooting](./troubleshooting.md)

