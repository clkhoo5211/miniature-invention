# System Architecture Documentation

**Last Updated**: 2025-10-31  
**Version**: 1.0

---

## Overview

Compliant Private Transfers is a privacy-forward, KYC-gated shielded transfer system using zero-knowledge proofs across multiple blockchains. The system is designed as a decentralized frontend application with client-side logic that connects directly to blockchains.

---

## Architecture Pattern

### Decentralized Client-Side Architecture

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

**Key Points**:
1. **No Backend Server**: All logic runs in the browser
2. **Direct Blockchain Connection**: Uses RPC endpoints directly
3. **MetaMask for Signing**: User signs transactions in their wallet
4. **Static Frontend**: Can be hosted on IPFS, no server required

---

## Component Architecture

### Frontend Layer

#### Next.js App Router Structure
```
app/
├── page.tsx                 # Home page with pool links
├── layout.tsx               # Root layout with navigation
├── onboarding/              # KYC and wallet connection
├── dashboard/               # User dashboard with activity
├── deposit/                 # Deposit flow
├── withdraw/                # Withdraw flow with note import
├── pools/                   # Pool index and detail pages
├── relayers/                # Relayer marketplace
├── history/                 # Transaction history
├── auditor/                 # Disclosure bundle viewer
├── components/              # Reusable React components
└── lib/                     # Client-side utilities
```

#### Key Components

**Pages**:
- **Home (`/`)**: Pool selection with quick links
- **Pools (`/pools`)**: Pool index page
- **Pool Details (`/pools/[asset]/[denom]`)**: Individual pool stats
- **Deposit (`/deposit`)**: Shielded deposit flow
- **Withdraw (`/withdraw`)**: Shielded withdrawal with note import
- **Dashboard (`/dashboard`)**: User activity and balance
- **History (`/history`)**: Transaction history
- **Relayers (`/relayers`)**: Relayer marketplace
- **Auditor (`/auditor`)**: Disclosure bundle viewer

**Components**:
- `WalletConnect`: MetaMask connection wrapper
- `PoolStatsClient`: Pool statistics display
- `EnhancedPoolStats`: Detailed pool dashboard
- `RecentDepositsClient`: Recent deposits list

**Client Libraries** (`app/lib/`):
- `api.ts`: API client for blockchain interactions
- `wallet.ts`: MetaMask integration
- `validation.ts`: Form validation utilities
- `note.ts`: Deposit note management
- `disclosure.ts`: Selective disclosure bundles
- `relayers.ts`: Relayer management
- `poolStats.ts`: Pool statistics calculation
- `explorer.ts`: Blockchain explorer link generation
- `icp.ts`: ICP Internet Identity connector (optional)

---

### Backend Layer (Client-Side Modules)

#### Source Modules (`src/`)

**Adapters (`src/adapters/`)**:
- `Adapter.ts`: Unified adapter interface
- `evm/`: EVM chain adapter (Ethereum, Polygon, Arbitrum, Optimism)
  - `EvmAdapter.ts`: Main EVM adapter implementation
  - `calldata.ts`: ABI encoding for contract calls
  - `erc20.ts`: ERC20 token support

**Compliance (`src/compliance/`)**:
- `screening.ts`: Address screening (OFAC/AML)
- `icpInternetIdentity.ts`: ICP Internet Identity integration

**Prover (`src/prover/`)**:
- `proof.ts`: ZK proof interface and dummy prover (MVP)

**IPFS (`src/ipfs/`)**:
- `publishIpns.ts`: IPFS/IPNS publishing utilities

**Types (`src/lib/`)**:
- `types.ts`: Core type definitions
- `abi.ts`: Contract ABI definitions

---

## Data Flow

### Deposit Flow

```
1. User Input (Form)
   ↓
2. Address Screening (Compliance Check)
   ↓
3. Generate Deposit Note (nullifier + secret)
   ↓
4. Generate ZK Proof (Dummy MVP)
   ↓
5. Build Calldata (ABI encoding)
   ↓
6. MetaMask Sign Transaction
   ↓
7. Submit to Blockchain RPC
   ↓
8. Poll for Receipt
   ↓
9. Store Note in Local Vault
   ↓
10. Update Transaction History
```

### Withdraw Flow

```
1. User Input (Note Import)
   ↓
2. Validate Note Format
   ↓
3. Check Note in Local Vault (Warning if not found)
   ↓
4. Select Relayer (Optional)
   ↓
5. Generate Disclosure Bundle (Optional)
   ↓
6. Generate ZK Proof (Dummy MVP)
   ↓
7. Build Calldata (with disclosureHash if enabled)
   ↓
8. MetaMask Sign Transaction
   ↓
9. Submit to Blockchain RPC
   ↓
10. Poll for Receipt
   ↓
11. Update Transaction History
```

---

## Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Hooks (useState, useEffect)
- **Storage**: localStorage (notes, history, relayers)

### Blockchain Integration
- **Library**: viem (EVM chains)
- **Wallet**: MetaMask (ethers.js injected)
- **RPC**: Direct JSON-RPC calls

### Build & Deployment
- **Build**: Next.js static export
- **Hosting**: IPFS/IPNS
- **CI/CD**: GitHub Actions

---

## Smart Contract Interface

### Contract ABI

**Deposit Function**:
```solidity
function deposit(
    address asset,
    address to,
    uint256 amount,
    bytes proofData
) external payable;
```

**Withdraw Function**:
```solidity
function withdraw(
    address asset,
    address to,
    uint256 amount,
    bytes proofData,
    bytes32 disclosureHash
) external;
```

### Calldata Generation

Calldata is generated using `viem`'s `encodeFunctionData`:
- Located in: `src/adapters/evm/calldata.ts`
- Functions: `buildDepositCalldata()`, `buildWithdrawCalldata()`

---

## Storage Architecture

### Client-Side Storage (localStorage)

**Keys**:
- `compliant-note-vault`: Array of deposit notes
- `compliant-tx-history`: Array of transaction records
- `compliant-disclosure-bundles`: Array of disclosure bundles
- `compliant-relayers`: Array of relayer configurations
- `compliant-onboarding`: Onboarding completion status

**Data Structures**:
```typescript
// Deposit Note
interface DepositNote {
  note: string;              // note-compliant-<asset>-<denom>-<random>-<checksum>
  asset: string;
  denomination: string;
  nullifier: string;         // hex
  secret: string;            // hex
  checksum: string;          // 8 hex chars
  createdAt: string;         // ISO timestamp
}

// Transaction Record
interface TxRecord {
  type: 'deposit' | 'withdraw';
  asset: string;
  amount: string;
  network: string;
  address?: string;
  hash?: string;
  timestamp: string;
}
```

---

## Security Architecture

### Wallet Integration
- **MetaMask**: Primary wallet provider
- **Connection Flow**: User-initiated, explicit approval
- **Transaction Signing**: All transactions signed by user

### Compliance Checks
- **KYC**: Optional ICP Internet Identity integration
- **Screening**: Address screening before deposits
- **Selective Disclosure**: Optional disclosure bundles for auditors

### Privacy Features
- **Zero-Knowledge Proofs**: ZK proofs for privacy (dummy MVP, ready for real circuits)
- **Note System**: Deposit notes stored locally, not on-chain
- **Local Vault**: Notes encrypted and stored in browser

---

## Deployment Architecture

### Static Export
- **Build**: `npm run build` generates static files in `out/`
- **Routes**: All routes pre-rendered as static HTML
- **No Server**: Fully static, can be served from any static host

### IPFS/IPNS Deployment
- **IPFS**: Content-addressed storage
- **IPNS**: Mutable pointer to latest version
- **Gateway**: Accessible via IPFS gateways
- **Scripts**: `scripts/deploy-ipfs.sh`, `scripts/deploy-ipfs-simple.sh`

---

## Environment Configuration

### Environment Variables

```bash
# Contract Address
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...

# RPC Endpoints
NEXT_PUBLIC_ETHEREUM_RPC=https://...
NEXT_PUBLIC_POLYGON_RPC=https://...
NEXT_PUBLIC_ARBITRUM_RPC=https://...
NEXT_PUBLIC_OPTIMISM_RPC=https://...

# Optional Features
NEXT_PUBLIC_ENABLE_ICP_IDENTITY=false
```

---

## Future Architecture Considerations

### Backend Integration (Optional)
- **Event Indexer**: For real-time anonymity set calculation
- **Pool Statistics**: On-chain event indexing
- **Relayer Registry**: On-chain relayer allowlist

### ZK Circuit Integration
- **Real Circuits**: Replace dummy prover with circom/snarkjs
- **Merkle Proofs**: Include merkle paths in proofs
- **Nullifier Hashing**: Cryptographic nullifier generation

---

**Related Documentation**:
- [Implementation Guide](./implementation-guide.md)
- [API Reference](../api-documentation/api-reference.md)
- [Troubleshooting](./troubleshooting.md)

