# Backend/On-Chain Integration Guide

## Overview

The Compliant Private Transfers application currently uses local storage for pool statistics and transaction history. This document describes how to integrate with on-chain data sources and backend indexers for production-ready pool statistics.

## Current Implementation

### Local Storage (MVP)
- Transaction history stored in `localStorage`
- Pool statistics derived from local history
- Anonymity set calculated from local note vault

**Limitations**:
- Only shows user's own transactions
- No access to other users' deposits
- Cannot calculate true anonymity set
- Missing aggregate statistics

## Integration Options

### Option 1: Direct On-Chain Event Queries

Query smart contract events directly using RPC providers:

```typescript
import { createPublicClient, http, parseAbi } from 'viem';

const client = createPublicClient({
  chain: mainnet,
  transport: http('YOUR_RPC_URL'),
});

const contractAbi = parseAbi([
  'event Deposit(address indexed asset, address indexed to, uint256 amount, bytes32 nullifier)',
  'event Withdraw(address indexed asset, address indexed to, uint256 amount, bytes32 nullifier, bytes32 disclosureHash)',
]);

async function getPoolDeposits(asset: string, amount: bigint, fromBlock: bigint = 0n) {
  const logs = await client.getLogs({
    address: CONTRACT_ADDRESS,
    event: contractAbi[0],
    args: {
      asset: asset,
      amount: amount,
    },
    fromBlock,
  });
  
  return logs.map(log => ({
    hash: log.transactionHash,
    timestamp: await getBlockTimestamp(log.blockNumber),
    amount: log.args.amount.toString(),
    asset: log.args.asset,
  }));
}
```

### Option 2: Backend Indexer API

Deploy a backend service that indexes on-chain events:

**Architecture**:
```
Smart Contract Events → Indexer Service → Database → REST/GraphQL API → Frontend
```

**API Endpoints**:
```
GET /api/pools/{network}/{asset}/{denomination}/stats
GET /api/pools/{network}/{asset}/{denomination}/deposits?limit=10&offset=0
GET /api/pools/{network}/{asset}/{denomination}/anonymity-set
```

**Example Response**:
```json
{
  "asset": "ETH",
  "denomination": "1",
  "network": "ethereum",
  "totalDeposits": 1250,
  "totalVolume": "1250 ETH",
  "anonymitySet": 892,
  "lastDepositTime": "2025-10-31T14:30:00Z",
  "lastDepositHash": "0x...",
  "depositsLast24h": 15,
  "depositsLast7d": 87,
  "averageDepositInterval": 120
}
```

### Option 3: Third-Party Indexer Services

Use existing indexing services:
- **The Graph**: Subgraph for contract events
- **Alchemy**: Enhanced APIs with event filtering
- **Moralis**: Web3 API with transaction indexing
- **Custom Indexer**: Self-hosted using The Graph or custom solution

## Implementation Steps

### Step 1: Update Pool Stats Service

Modify `app/lib/poolStats.ts`:

```typescript
// Add environment variable for API endpoint
const INDEXER_API_URL = process.env.NEXT_PUBLIC_INDEXER_API_URL;

export async function getPoolStats(
  asset: string,
  denomination: string,
  network: string
): Promise<PoolStats> {
  // Try indexer API first
  if (INDEXER_API_URL) {
    try {
      const response = await fetch(
        `${INDEXER_API_URL}/pools/${network}/${asset}/${denomination}/stats`
      );
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn('Indexer API unavailable, falling back to local data');
    }
  }
  
  // Fallback to local data (current implementation)
  return getPoolStatsFromLocal(asset, denomination, network);
}
```

### Step 2: Update Frontend Components

The `EnhancedPoolStats` component already supports async stats loading. No changes needed - it will automatically use the new data source.

### Step 3: Configure Environment

Add to `.env.local`:
```bash
NEXT_PUBLIC_INDEXER_API_URL=https://your-indexer.example.com/api
```

## Backend Indexer Requirements

### Data Model

**Pool Statistics**:
- Total deposits count
- Total volume (sum of all deposits)
- Current anonymity set (unique nullifiers not yet withdrawn)
- Recent deposit timestamps
- Deposit frequency metrics

**Event Indexing**:
- Index all `Deposit` events from contract
- Index all `Withdraw` events
- Track nullifiers for anonymity set calculation
- Store timestamps and transaction hashes

### Anonymity Set Calculation

```typescript
// Pseudocode
anonymitySet = (all_deposit_nullifiers - all_withdraw_nullifiers).length
```

Important: Anonymity set is dynamic and changes with each deposit/withdraw.

### Performance Considerations

- Cache pool statistics (refresh every 5-10 seconds)
- Use database indexes on (network, asset, denomination)
- Implement pagination for deposit history
- Consider using read replicas for high traffic

## Example Backend Implementation (Node.js/Express)

```typescript
import express from 'express';
import { createPublicClient, http } from 'viem';

const app = express();
const client = createPublicClient({
  transport: http(process.env.RPC_URL),
});

app.get('/api/pools/:network/:asset/:denomination/stats', async (req, res) => {
  const { network, asset, denomination } = req.params;
  
  // Query contract events
  const deposits = await getDepositEvents(network, asset, denomination);
  const withdraws = await getWithdrawEvents(network, asset, denomination);
  
  // Calculate stats
  const stats = {
    totalDeposits: deposits.length,
    totalVolume: calculateVolume(deposits, denomination),
    anonymitySet: calculateAnonymitySet(deposits, withdraws),
    // ... other metrics
  };
  
  res.json(stats);
});
```

## Security Considerations

1. **Rate Limiting**: Implement rate limiting on API endpoints
2. **CORS**: Configure CORS appropriately for frontend domain
3. **Authentication**: Optional API keys for production use
4. **Data Validation**: Validate all inputs and sanitize outputs
5. **Caching**: Use appropriate cache headers to reduce load

## Testing

### Local Development
1. Use mock data or local contract events
2. Test fallback to local storage
3. Verify error handling

### Production
1. Monitor indexer uptime
2. Set up alerts for API failures
3. Test with real on-chain data
4. Verify anonymity set accuracy

## Migration Path

1. **Phase 1**: Deploy indexer service, keep local storage as fallback
2. **Phase 2**: Update frontend to use indexer API
3. **Phase 3**: Remove local storage dependency (optional)

---

**Last Updated**: 2025-10-31  
**Status**: Ready for backend integration

