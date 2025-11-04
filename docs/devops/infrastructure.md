# Infrastructure Guide

## Overview

The Compliant Private Transfers application is a **static Next.js export** designed for decentralized hosting on IPFS/IPNS. No traditional server infrastructure is required for the frontend.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    User Browser                              │
│  (MetaMask, Web3 Wallet Integration)                        │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ HTTPS
                       │
┌──────────────────────▼──────────────────────────────────────┐
│              IPFS Gateway Network                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                 │
│  │ ipfs.io  │  │Cloudflare│  │  Pinata  │                 │
│  └──────────┘  └──────────┘  └──────────┘                 │
│       │              │              │                       │
└───────┼──────────────┼──────────────┼───────────────────────┘
        │              │              │
        └──────────────┼──────────────┘
                       │
                       │ IPFS Protocol
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                    IPFS Network                             │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │  IPFS Nodes  │  │ Pinning      │                        │
│  │  (Distributed)│  │ Services     │                        │
│  │              │  │ (Pinata,     │                        │
│  │              │  │  Infura, etc)│                        │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
                       │
                       │ IPNS Updates
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                    IPNS Registry                            │
│  (Human-readable, updatable addresses)                      │
└─────────────────────────────────────────────────────────────┘
```

## Infrastructure Components

### 1. Build Infrastructure

**Location**: GitHub Actions (CI/CD)

**Components**:
- Node.js 20 runtime
- npm package manager
- Build tools (Next.js, TypeScript)

**Requirements**:
- GitHub repository
- GitHub Actions enabled
- npm dependencies cached

### 2. IPFS Infrastructure

**Options**:

#### Option A: Self-Hosted IPFS Node (Development)
- **IPFS Kubo** daemon running locally or on server
- API accessible at `http://localhost:5001` or configured endpoint
- Suitable for development and testing

#### Option B: Pinning Service (Production)
- **Pinata** (recommended for production)
- **Infura IPFS**
- **Web3.Storage**
- **NFT.Storage**

**Benefits**:
- Reliable pinning
- Gateway access
- Better performance
- SLA guarantees

### 3. IPNS Infrastructure

**Purpose**: Human-readable, updatable addresses for the application

**Requirements**:
- IPFS node with IPNS support
- IPNS key (managed securely)
- Regular updates after deployments

### 4. Gateway Infrastructure

**Public Gateways** (no setup required):
- `https://ipfs.io`
- `https://cloudflare-ipfs.com`
- `https://gateway.pinata.cloud`

**Custom Gateway** (optional):
- Self-hosted IPFS gateway
- Cloudflare IPFS gateway
- Pinata dedicated gateway

## Network Configuration

### Required Endpoints

1. **EVM RPC Endpoints** (user's browser connects directly):
   - Ethereum Mainnet
   - Polygon
   - Arbitrum
   - Optimism

2. **IPFS API** (for deployment):
   - Local: `http://127.0.0.1:5001`
   - Remote: Configured endpoint
   - Pinata: `https://api.pinata.cloud`

3. **ICP Internet Identity** (optional):
   - Default: `https://identity.ic0.app`
   - Custom ICP identity provider (if configured)

## Security Considerations

### Secrets Management

**GitHub Secrets** (for CI/CD):
- `PINATA_API_KEY` - Pinata API key
- `PINATA_SECRET_API_KEY` - Pinata secret
- `IPFS_API_URL` - IPFS API endpoint (if using Kubo)
- `IPNS_KEY_NAME` - IPNS key identifier
- `NEXT_PUBLIC_CONTRACT_ADDRESS` - Smart contract address
- `NEXT_PUBLIC_*_RPC` - RPC endpoints (can be public)

**Local Development**:
- Store in `.env.local` (gitignored)
- Never commit secrets to repository

### Access Control

- IPFS nodes: Configure API access restrictions
- IPNS keys: Store securely, backup keys
- RPC endpoints: Use API keys, rate limit if needed

## Scalability

### Current Architecture
- **Static**: No server required
- **Distributed**: IPFS network provides redundancy
- **CDN-like**: Multiple gateways provide global access

### Scaling Considerations

1. **IPFS Pinning**: Use multiple pinning services for redundancy
2. **Gateway Diversity**: Users can access via any gateway
3. **RPC Endpoints**: Use reliable RPC providers with rate limits
4. **Monitoring**: Track gateway availability and IPFS node health

## Cost Estimation

### Development
- IPFS Node (self-hosted): Free (server costs if applicable)
- RPC Endpoints: Free tier available on most providers
- GitHub Actions: Free tier (2000 minutes/month)

### Production
- **Pinata**: 
  - Free tier: 1 GB storage, 100 requests/month
  - Paid: Starting at $20/month
- **RPC Endpoints**:
  - Free tier available (rate limited)
  - Paid: Starting at $50/month per chain
- **GitHub Actions**: Free for public repos, paid for private

## Disaster Recovery

### Backup Strategy
1. **IPFS Content**: Multiple pinning services provide redundancy
2. **IPNS Keys**: Backup keys securely
3. **Configuration**: Version control for deployment configs
4. **Build Artifacts**: GitHub Actions artifacts

### Recovery Procedures
1. **IPFS Content Loss**: Re-deploy from source
2. **IPNS Key Loss**: Cannot recover, must create new key
3. **Gateway Failure**: Users can access via alternative gateways
4. **RPC Endpoint Failure**: Users can configure alternative endpoints

## Monitoring Points

1. **Build Status**: GitHub Actions workflow status
2. **IPFS Node Health**: Node connectivity and pinning status
3. **Gateway Availability**: Response times and availability
4. **RPC Endpoint Health**: Response times and error rates
5. **IPNS Updates**: Verify updates propagate correctly

## Next Steps

1. Set up IPFS infrastructure (pinning service or self-hosted)
2. Configure CI/CD secrets
3. Set up monitoring
4. Document operational procedures
5. Test disaster recovery procedures

---

**Last Updated**: 2025-10-31  
**Maintained By**: DevOps Team

