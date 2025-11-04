# Development Environment Setup

**Last Updated**: 2025-10-31  
**Version**: 1.0

---

## Quick Start

### 1. Prerequisites

**Required**:
- Node.js 18+ ([Download](https://nodejs.org))
- npm or yarn
- Git
- Code editor (VS Code recommended)

**Optional**:
- MetaMask browser extension
- Docker (for local IPFS)

### 2. Clone Repository

```bash
git clone <repository-url>
cd compliant-private-transfers
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Environment Configuration

```bash
# Copy example environment file
cp .env.example .env.local

# Edit .env.local with your settings
# Required: RPC endpoints
# Optional: Contract addresses, ICP Identity
```

**Minimum `.env.local`**:
```bash
NEXT_PUBLIC_ETHEREUM_RPC=https://eth.llamarpc.com
NEXT_PUBLIC_POLYGON_RPC=https://polygon-rpc.com
NEXT_PUBLIC_ARBITRUM_RPC=https://arb1.arbitrum.io/rpc
NEXT_PUBLIC_OPTIMISM_RPC=https://mainnet.optimism.io
NEXT_PUBLIC_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
```

### 5. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

---

## Development Commands

### Core Commands

```bash
# Development server (with hot reload)
npm run dev

# Production build
npm run build

# Type checking
npm run typecheck

# Run tests
npm run test

# Linting
npm run lint

# Fix linting issues
npm run lint:fix
```

### Testing Commands

```bash
# Run tests once
npm run test

# Watch mode (for development)
npm test -- --watch

# Coverage report
npm test -- --coverage
```

### Deployment Commands

```bash
# Simple IPFS deployment
npm run deploy:ipfs

# Full IPFS + IPNS deployment
npm run deploy:ipfs:full
```

---

## Project Structure

```
compliant-private-transfers/
├── app/                      # Next.js App Router
│   ├── components/          # React components
│   │   ├── WalletConnect.tsx
│   │   ├── PoolStatsClient.tsx
│   │   └── EnhancedPoolStats.tsx
│   ├── lib/                 # Client utilities
│   │   ├── api.ts           # API client
│   │   ├── wallet.ts        # MetaMask integration
│   │   ├── note.ts          # Note management
│   │   ├── disclosure.ts    # Disclosure bundles
│   │   └── ...
│   ├── [pages]/            # Page routes
│   │   ├── page.tsx        # Home
│   │   ├── deposit/        # Deposit flow
│   │   ├── withdraw/       # Withdraw flow
│   │   └── ...
│   ├── layout.tsx          # Root layout
│   └── globals.css         # Global styles
│
├── src/                     # Source modules
│   ├── adapters/           # Blockchain adapters
│   │   ├── Adapter.ts      # Adapter interface
│   │   └── evm/            # EVM implementation
│   │       ├── EvmAdapter.ts
│   │       ├── calldata.ts
│   │       └── erc20.ts
│   ├── compliance/         # Compliance modules
│   │   ├── screening.ts
│   │   └── icpInternetIdentity.ts
│   ├── prover/             # ZK proof interface
│   │   └── proof.ts
│   ├── ipfs/               # IPFS utilities
│   │   └── publishIpns.ts
│   └── lib/                # Shared types
│       ├── types.ts
│       └── abi.ts
│
├── tests/                   # Unit tests
│   ├── evmCalldata.test.ts
│   ├── evmAdapter.test.ts
│   └── screening.test.ts
│
├── docs/                    # Documentation
│   ├── technical-docs/
│   ├── api-documentation/
│   ├── user-manuals/
│   └── developer-docs/
│
├── scripts/                 # Utility scripts
│   ├── deploy-ipfs.sh
│   └── deploy-ipfs-simple.sh
│
├── .github/                 # GitHub workflows
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
│
├── package.json
├── tsconfig.json
├── next.config.js
└── tailwind.config.js
```

---

## Development Tools

### VS Code Extensions (Recommended)

- **ESLint**: Code linting
- **Prettier**: Code formatting
- **TypeScript**: Type checking
- **Tailwind CSS IntelliSense**: Tailwind autocomplete
- **GitLens**: Git integration

### VS Code Settings

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

---

## Local Testing

### Manual Testing

1. **Start Dev Server**: `npm run dev`
2. **Open Browser**: `http://localhost:3000`
3. **Connect MetaMask**: Use test account
4. **Test Features**: 
   - Deposit flow
   - Withdraw flow
   - Note management
   - Relayer selection

### Automated Testing

```bash
# Run all tests
npm run test

# Run specific test file
npm test -- evmCalldata.test.ts

# Watch mode
npm test -- --watch
```

### Type Checking

```bash
# Check types without building
npm run typecheck
```

---

## Debugging

### Browser DevTools

1. **Console**: JavaScript errors and logs
2. **Network**: RPC calls and responses
3. **Application**: localStorage inspection
4. **React DevTools**: Component state

### Debugging Tips

```typescript
// Add logging
console.log('Debug:', { network, asset, amount });

// Check localStorage
console.log('Vault:', localStorage.getItem('compliant-note-vault'));

// Inspect transactions
console.log('Calldata:', calldata);
```

### Common Issues

See [Troubleshooting Guide](../technical-docs/troubleshooting.md)

---

## Environment Variables

### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_ETHEREUM_RPC` | Ethereum RPC endpoint | `https://eth.llamarpc.com` |
| `NEXT_PUBLIC_POLYGON_RPC` | Polygon RPC endpoint | `https://polygon-rpc.com` |
| `NEXT_PUBLIC_ARBITRUM_RPC` | Arbitrum RPC endpoint | `https://arb1.arbitrum.io/rpc` |
| `NEXT_PUBLIC_OPTIMISM_RPC` | Optimism RPC endpoint | `https://mainnet.optimism.io` |

### Optional

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | Contract address | `0x0...` |
| `NEXT_PUBLIC_ENABLE_ICP_IDENTITY` | Enable ICP Identity | `false` |

---

## Building for Production

### Static Export

```bash
# Build static files
npm run build

# Output in out/ directory
# Serve with any static file server
cd out
python3 -m http.server 8080
```

### IPFS Deployment

```bash
# Simple deployment
IPFS_API_URL=http://127.0.0.1:5001 npm run deploy:ipfs

# Full deployment with IPNS
IPFS_API_URL=http://127.0.0.1:5001 PUBLISH_TO_IPNS=true npm run deploy:ipfs:full
```

---

## Docker Development

### Local IPFS + Nginx

```bash
# Build app first
npm run build

# Start Docker services
docker compose up -d

# Access app
# App: http://localhost:8080
# IPFS API: http://127.0.0.1:5001
# IPFS Gateway: http://127.0.0.1:8081
```

See [Docker Local Guide](../docker-LOCAL.md) for details.

---

## CI/CD

### GitHub Actions

Workflows run on push and PR:
- Type checking
- Linting
- Tests
- Build verification

See `.github/workflows/ci.yml` for details.

---

## Next Steps

1. **Explore Code**: Start with `app/lib/api.ts`
2. **Read Architecture**: [Architecture Guide](../technical-docs/architecture.md)
3. **Run Tests**: Ensure tests pass
4. **Make Changes**: Start with small improvements

---

**Related Documentation**:
- [Contributing Guidelines](./contributing.md)
- [Architecture Guide](../technical-docs/architecture.md)
- [Implementation Guide](../technical-docs/implementation-guide.md)

