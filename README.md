# Compliant Private Transfers

Privacy-forward, KYC-gated shielded transfer system using zero-knowledge proofs across multiple blockchains. UI and documentation hosted on IPFS/IPNS.

## Features

- 🔒 **Privacy**: Zero-knowledge proofs for shielded transfers
- ✅ **Compliance**: KYC gating via ICP Internet Identity + OFAC/AML screening
- 🔗 **Multi-Chain**: Support for Ethereum, Polygon, Arbitrum, Optimism
- 👥 **Relayer Marketplace**: Allowlisted relayers with quotes and SLAs
- 📋 **Selective Disclosure**: Compliance bundles for auditors
- 🌐 **Decentralized**: UI deployed to IPFS/IPNS

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- MetaMask or compatible wallet extension
- IPFS node (for deployment, optional for development)

### Installation

```bash
npm install
```

### Configuration

Copy `.env.example` to `.env.local` and configure:

```bash
cp .env.example .env.local
```

Update RPC endpoints and contract addresses in `.env.local`.

### Development

```bash
npm run dev
```

Visit `http://localhost:3000`

### Build

```bash
npm run build
```

Creates static export in `out/` directory ready for IPFS deployment.

### Deploy to IPFS/IPNS

Using Node.js script:
```bash
npm run deploy:ipfs
```

Or using bash script:
```bash
npm run deploy:ipfs:bash
```

Environment variables:
- `IPFS_API_URL` - IPFS API endpoint (default: http://127.0.0.1:5001)
- `PUBLISH_TO_IPNS` - Set to `true` to publish to IPNS
- `IPNS_KEY` - IPNS key name (default: `self`)

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Main dashboard
│   ├── deposit/           # Deposit flow
│   ├── withdraw/          # Withdraw flow
│   ├── onboarding/        # KYC onboarding
│   ├── relayers/          # Relayer marketplace
│   ├── auditor/           # Auditor portal
│   └── lib/               # Client-side utilities
│       ├── wallet.ts      # Wallet connection
│       ├── api.ts         # API client
│       ├── validation.ts  # Form validation
│       ├── disclosure.ts  # Disclosure bundles
│       └── relayers.ts   # Relayer management
├── src/                   # Backend modules
│   ├── adapters/          # Blockchain adapters
│   │   └── evm/          # EVM adapter with calldata builders
│   ├── compliance/        # KYC and screening
│   ├── prover/            # ZK proof generation
│   └── ipfs/              # IPFS publishing
└── scripts/                # Deployment scripts
    └── deploy-ipfs.js     # IPFS/IPNS deployment
```

## Architecture

### Core Components

1. **UI (Next.js)**: Static export ready for IPFS deployment
2. **Wallet Integration**: MetaMask for EVM chains
3. **ZK Proofs**: Dummy prover (MVP) with interface for real circuits
4. **Compliance**: ICP Internet Identity (KYC) + OFAC/AML screening
5. **Relayers**: Allowlisted relayer marketplace with quotes
6. **Selective Disclosure**: Compliance bundles for auditors

### Transaction Flow

1. **Deposit**:
   - Address screening
   - ZK proof generation
   - Transaction signing via MetaMask
   - On-chain submission

2. **Withdraw**:
   - ZK proof generation
   - Optional selective disclosure bundle
   - Transaction signing via MetaMask
   - On-chain submission

### Smart Contracts

Contract interface (to be deployed):
- `deposit(address asset, address to, uint256 amount, bytes proofData)`
- `withdraw(address asset, address to, uint256 amount, bytes proofData, bytes32 disclosureHash)`

## Development Status

See `DEVELOPMENT_STATUS.md` for current progress.

### Completed ✅

- Next.js UI with all pages
- Wallet integration (MetaMask)
- Transaction signing and submission
- ABI encoding with viem
- Relayer marketplace
- Selective disclosure bundles
- Screening implementation
- IPFS deployment scripts

### In Progress / Pending

- ICP Internet Identity full SDK integration
- Real ZK circuit integration
- IPFS deployment automation
- Expanded test coverage

## Documentation

- `DEVELOPMENT_STATUS.md` - Current development status
- `DEVELOP_PENDING.md` - Pending tasks
- `PLACEHOLDER_COMPLETION.md` - Placeholder implementation summary
- `QUICK_START.md` - Quick start guide
- `BUILD_STATUS.md` - Build configuration and status

## License

[Specify license]

## Contributing

[Contributing guidelines]

## Related Work and References

- Tornado Cash GitHub (archived): https://github.com/tornadocash
- Tornado Cash UI (eth.limo mirror): https://tornadocash.eth.limo/

Disclaimer: This project is compliance-first (KYC via ICP Internet Identity, screening, allowlisted relayers, selective disclosure) and is not a mixer.

## Differences vs Tornado Cash (High-level)
- Mixer vs KYC-gated privacy: We require KYC and screening.
- Selective disclosure/audit bundles vs purely anonymous notes.
- Allowlisted relayers vs open relayers.
- Multi-chain adapters with compliance hooks.

## Parity Status (Tornado-style UI)

- ✅ Pools UX: index & per-asset/denomination pages (ETH: 0.1, 1, 10)
- ✅ Notes: generation, export, secure local vault (deposit)
- ✅ Withdraw: note import/validation, proof flow alignment
- ✅ Relayers: inline quote/selection on withdraw
- ✅ Stats/History: anonymity set (local) + recent deposits per pool + dashboard recent activity
- ⏳ Next: richer pool stats, denomination expansion, E2E tests

## Parity Backlog (Updated)
- ⏳ Pool stats from backend/on-chain event indexer
- ⏳ Multi-asset pools and cross-chain routing UI
- ⏳ E2E tests and screenshots parity
- ⏳ Advanced note checksum and recovery flows
