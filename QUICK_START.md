# Quick Start Guide

## Prerequisites
- Node.js 18+ and npm
- Git

## Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment variables:**
```bash
cp .env.example .env
# Edit .env with your API keys and RPC endpoints
```

3. **Run development server:**
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Available Pages

- `/` - Home page
- `/onboarding` - KYC onboarding flow
- `/dashboard` - Main dashboard with balances and recent proofs
- `/deposit` - Shielded deposit interface
- `/withdraw` - Withdrawal interface with selective disclosure
- `/relayers` - Relayer marketplace
- `/auditor` - Auditor portal for viewing disclosure bundles

## Development

- **Type checking:** `npm run typecheck`
- **Build:** `npm run build`
- **Test:** `npm test`

## Next Steps

The UI is now runnable. Next tasks:
1. Integrate ICP Internet Identity for KYC
2. Add wallet connection (MetaMask, WalletConnect)
3. Wire up screening service
4. Integrate ZK prover
5. Connect to EVM adapters for on-chain interactions

