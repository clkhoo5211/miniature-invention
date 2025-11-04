# Environment Management

## Overview

This document describes environment variable configuration, secrets management, and environment-specific settings for the Compliant Private Transfers application.

## Environment Variables

### Build-Time Variables (NEXT_PUBLIC_*)

These variables are embedded into the build output and accessible in the browser.

#### Required

```bash
# Smart Contract Address
NEXT_PUBLIC_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000

# RPC Endpoints (at least one chain required)
NEXT_PUBLIC_ETHEREUM_RPC=https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY
NEXT_PUBLIC_POLYGON_RPC=https://polygon-mainnet.g.alchemy.com/v2/YOUR_API_KEY
NEXT_PUBLIC_ARBITRUM_RPC=https://arb-mainnet.g.alchemy.com/v2/YOUR_API_KEY
NEXT_PUBLIC_OPTIMISM_RPC=https://opt-mainnet.g.alchemy.com/v2/YOUR_API_KEY
```

#### Optional

```bash
# ICP Internet Identity Integration
NEXT_PUBLIC_ENABLE_ICP_IDENTITY=false
NEXT_PUBLIC_ICP_INTERNET_IDENTITY_URL=https://identity.ic0.app
```

### Deployment-Time Variables

These variables are used during deployment scripts and CI/CD.

```bash
# IPFS Configuration
IPFS_API_URL=http://127.0.0.1:5001
IPNS_KEY=self
PUBLISH_TO_IPNS=false

# Pinata Configuration (for production)
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_API_KEY=your_pinata_secret_key
PINATA_JWT=your_pinata_jwt_token
```

## Environment Configurations

### Development

**File**: `.env.local` (gitignored)

```bash
NODE_ENV=development
NEXT_PUBLIC_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000

# Use public RPC endpoints for development
NEXT_PUBLIC_ETHEREUM_RPC=https://eth.llamarpc.com
NEXT_PUBLIC_POLYGON_RPC=https://polygon-rpc.com
NEXT_PUBLIC_ARBITRUM_RPC=https://arb1.arbitrum.io/rpc
NEXT_PUBLIC_OPTIMISM_RPC=https://mainnet.optimism.io

NEXT_PUBLIC_ENABLE_ICP_IDENTITY=false

# Local IPFS node
IPFS_API_URL=http://127.0.0.1:5001
```

### Staging

**File**: Configure in CI/CD environment or deployment platform

```bash
NODE_ENV=production
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...staging_contract...

# Use staging/testnet RPC endpoints
NEXT_PUBLIC_ETHEREUM_RPC=https://goerli.infura.io/v3/YOUR_KEY
NEXT_PUBLIC_POLYGON_RPC=https://polygon-mumbai.g.alchemy.com/v2/YOUR_KEY

NEXT_PUBLIC_ENABLE_ICP_IDENTITY=true

# Pinata staging account
PINATA_API_KEY=staging_key
PINATA_SECRET_API_KEY=staging_secret
IPFS_API_URL=https://api.pinata.cloud
```

### Production

**File**: Configure in CI/CD secrets (never commit)

```bash
NODE_ENV=production
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...production_contract...

# Production RPC endpoints with API keys
NEXT_PUBLIC_ETHEREUM_RPC=https://eth-mainnet.g.alchemy.com/v2/PRODUCTION_KEY
NEXT_PUBLIC_POLYGON_RPC=https://polygon-mainnet.g.alchemy.com/v2/PRODUCTION_KEY
NEXT_PUBLIC_ARBITRUM_RPC=https://arb-mainnet.g.alchemy.com/v2/PRODUCTION_KEY
NEXT_PUBLIC_OPTIMISM_RPC=https://opt-mainnet.g.alchemy.com/v2/PRODUCTION_KEY

NEXT_PUBLIC_ENABLE_ICP_IDENTITY=true
NEXT_PUBLIC_ICP_INTERNET_IDENTITY_URL=https://identity.ic0.app

# Production Pinata account
PINATA_API_KEY=production_key
PINATA_SECRET_API_KEY=production_secret
IPFS_API_URL=https://api.pinata.cloud
IPNS_KEY=production-ipns-key
PUBLISH_TO_IPNS=true
```

## Secrets Management

### GitHub Secrets

Configure in: Repository Settings → Secrets and variables → Actions

**Required Secrets**:
- `PINATA_API_KEY` - Pinata API key
- `PINATA_SECRET_API_KEY` - Pinata secret API key
- `NEXT_PUBLIC_CONTRACT_ADDRESS` - Smart contract address (if secret)

**Optional Secrets**:
- `IPFS_API_URL` - IPFS API endpoint (if using Kubo)
- `IPNS_KEY_NAME` - IPNS key identifier
- `NEXT_PUBLIC_ETHEREUM_RPC` - Ethereum RPC (if private)
- `NEXT_PUBLIC_POLYGON_RPC` - Polygon RPC (if private)
- `NEXT_PUBLIC_ARBITRUM_RPC` - Arbitrum RPC (if private)
- `NEXT_PUBLIC_OPTIMISM_RPC` - Optimism RPC (if private)

### Local Development

1. Copy `.env.example` to `.env.local`
2. Update with your values
3. Never commit `.env.local` to git

```bash
cp .env.example .env.local
# Edit .env.local with your values
```

### Secure Storage

**Best Practices**:
1. Never commit secrets to version control
2. Use environment-specific configurations
3. Rotate keys regularly
4. Use least-privilege access
5. Monitor secret usage

## Environment Setup Checklist

### Development
- [ ] Copy `.env.example` to `.env.local`
- [ ] Configure RPC endpoints
- [ ] Set contract address (if available)
- [ ] Verify IPFS node is accessible (if using local node)

### Staging
- [ ] Create staging environment in CI/CD
- [ ] Configure staging secrets
- [ ] Set up staging RPC endpoints
- [ ] Configure Pinata staging account
- [ ] Test deployment workflow

### Production
- [ ] Create production secrets in CI/CD
- [ ] Configure production RPC endpoints
- [ ] Set up Pinata production account
- [ ] Configure IPNS key
- [ ] Test deployment workflow
- [ ] Document rollback procedures

## Validation

### Check Configuration

```bash
# Verify environment variables are set
npm run build

# Check for missing required variables (will fail build if critical)
# TypeScript will catch missing process.env references during build
```

### Testing Different Environments

```bash
# Development
npm run dev

# Production build (local)
npm run build

# Production build (with environment)
NODE_ENV=production npm run build
```

## Troubleshooting

### Missing Environment Variables

**Symptom**: Build fails or runtime errors

**Solution**:
1. Check `.env.local` exists
2. Verify variable names (NEXT_PUBLIC_ prefix for browser vars)
3. Restart dev server after changes
4. Clear Next.js cache: `rm -rf .next`

### RPC Endpoint Issues

**Symptom**: Connection errors in browser console

**Solution**:
1. Verify RPC URL is correct
2. Check API key is valid
3. Test endpoint with curl
4. Verify rate limits not exceeded

### IPFS Deployment Issues

**Symptom**: Deployment script fails

**Solution**:
1. Verify `IPFS_API_URL` is accessible
2. Check Pinata credentials (if using)
3. Verify network connectivity
4. Check IPFS node logs

---

**Last Updated**: 2025-10-31  
**Maintained By**: DevOps Team

