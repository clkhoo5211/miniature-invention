# Local Testing Guide: IPFS & Merkle Tree Functions

**Date**: 2025-01-02  
**Purpose**: Comprehensive guide for testing IPFS and Merkle tree functionality locally

---

## 🔍 Current Implementation Status

### IPFS Functions
- ✅ **Implemented**: `src/ipfs/publishIpns.ts`
- ✅ **Deployment Scripts**: `scripts/deploy-ipfs.sh`, `scripts/deploy-ipfs-simple.sh`
- ✅ **Docker Setup**: `docker-compose.yml` for local IPFS node

### Merkle Tree Functions
- ⚠️ **Not Yet Implemented**: Currently using local note-based anonymity set
- 📝 **Planned**: Real merkle tree with ZK circuits (requires circom/snarkjs)
- 🔄 **MVP**: Local notes vault for testing UI/UX

---

## 📦 Part 1: Testing IPFS Locally

### Prerequisites
- Docker and Docker Compose installed
- `jq` installed (for JSON parsing in scripts)

### Option A: Using Docker Compose (Recommended)

#### Step 1: Start Local IPFS Node
```bash
cd /Users/khoo/Downloads/project4/projects/project-20251030-232211-compliant-private-transfers
docker-compose up -d ipfs
```

#### Step 2: Verify IPFS is Running
```bash
# Check IPFS API is accessible
curl -s http://127.0.0.1:5001/api/v0/version | jq

# Check IPFS Gateway
curl -s http://127.0.0.1:8081/ipfs/QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG/readme
```

**Expected Output**:
```json
{
  "Version": "0.x.x",
  "Commit": "...",
  "Repo": "..."
}
```

#### Step 3: Build and Deploy to Local IPFS
```bash
# Set environment variables
export IPFS_API_URL=http://127.0.0.1:5001
export PUBLISH_TO_IPNS=true

# Run deployment script
bash scripts/deploy-ipfs.sh
```

#### Step 4: Verify Deployment
```bash
# The script will output:
# - CID (Content Identifier)
# - IPNS Name (if published)
# - Gateway URLs

# Test accessing via local gateway
# Replace <CID> with the actual CID from output
curl http://127.0.0.1:8081/ipfs/<CID>/
```

#### Step 5: Test IPNS Resolution
```bash
# If IPNS was published, test resolution
# Replace <IPNS_NAME> with actual IPNS name
curl http://127.0.0.1:8081/ipns/<IPNS_NAME>/
```

### Option B: Manual IPFS Testing

#### Step 1: Install IPFS Kubo
```bash
# macOS
brew install ipfs

# Linux
# Download from https://dist.ipfs.tech/#kubo
```

#### Step 2: Initialize and Start IPFS
```bash
ipfs init
ipfs daemon
```

#### Step 3: Test IPFS Add Function
```bash
# Test adding a file
echo "Hello IPFS" > test.txt
ipfs add test.txt

# Note the CID (Qm...)
# Test retrieving
ipfs cat <CID>
```

#### Step 4: Test via API (Programmatic)
```typescript
// Create a test script: test-ipfs.ts
import { publishToIpns } from './src/ipfs/publishIpns';

async function testIPFS() {
  const testContent = new Blob(['Hello IPFS Test'], { type: 'text/plain' });
  
  try {
    const result = await publishToIpns(testContent, {
      kuboApiUrl: 'http://127.0.0.1:5001',
      keyName: 'self'
    });
    
    console.log('✅ IPFS Upload Success:');
    console.log('   CID:', result.cid);
    console.log('   IPNS:', result.ipnsName);
    console.log('   Gateway URL:', `http://127.0.0.1:8081/ipfs/${result.cid}`);
  } catch (error) {
    console.error('❌ IPFS Upload Failed:', error);
  }
}

testIPFS();
```

---

## 🌳 Part 2: Testing Merkle Tree Functions

### Current Status: ⚠️ Not Yet Implemented

**Important**: Merkle tree functions are **not yet implemented** in this codebase. The following sections show:
1. What's currently in place (local note-based)
2. How to test current functionality
3. How to implement and test real merkle trees (future work)

### Current Implementation (MVP)

#### What Exists:
- **Local Note Vault**: `app/lib/note.ts`
  - Stores user's deposit notes in `localStorage`
  - Calculates anonymity set from local notes only
  - **Limitation**: Only shows user's own deposits

#### Testing Local Note-Based Anonymity Set

```bash
# Start the dev server
npm run dev

# Navigate to http://localhost:3000
# 1. Complete onboarding
# 2. Make multiple deposits (different amounts)
# 3. Check pool statistics:
#    - Go to /pools/ETH/1
#    - View anonymity set count
#    - Check dashboard for recent activity
```

**Test Script** (Browser Console):
```javascript
// Open browser console on http://localhost:3000
// Test note vault functions

// Import functions (in browser console)
const { 
  generateNote, 
  saveNoteToVault, 
  listNotesFromVault,
  getAnonymitySetCount 
} = await import('/app/lib/note.js');

// Generate test notes
const note1 = generateNote({ asset: 'ETH', denomination: '1' });
const note2 = generateNote({ asset: 'ETH', denomination: '1' });
const note3 = generateNote({ asset: 'ETH', denomination: '0.1' });

// Save to vault
saveNoteToVault(note1);
saveNoteToVault(note2);
saveNoteToVault(note3);

// List all notes
const allNotes = listNotesFromVault();
console.log('All notes:', allNotes);

// Get anonymity set for 1 ETH pool
const anonymitySet = getAnonymitySetCount('ETH', '1');
console.log('Anonymity set for 1 ETH:', anonymitySet); // Should be 2
```

---

## 🔧 Part 3: Implementing & Testing Real Merkle Trees

### Overview

For production, merkle trees are needed for:
1. **Anonymity Set Calculation**: Track all deposits across all users
2. **ZK Proof Generation**: Generate merkle proofs for withdrawals
3. **Nullifier Tracking**: Prevent double-spending
4. **Pool Statistics**: Real-time anonymity set from on-chain data

### Implementation Plan

#### Step 1: Install Merkle Tree Library

```bash
npm install merkletreejs
# or
npm install @openzeppelin/merkle-tree
```

#### Step 2: Create Merkle Tree Service

**File**: `src/merkle/merkleTree.ts`

```typescript
import { MerkleTree } from 'merkletreejs';
import { keccak256 } from 'ethers';

export interface DepositLeaf {
  commitment: string; // bytes32 hash of deposit
  timestamp: number;
  nullifier: string; // bytes32 nullifier for this deposit
}

/**
 * Generate merkle tree from deposit commitments
 */
export function generateMerkleTree(deposits: DepositLeaf[]): MerkleTree {
  const leaves = deposits.map(deposit => 
    Buffer.from(keccak256(Buffer.from(
      deposit.commitment + deposit.nullifier
    )).slice(2), 'hex')
  );
  
  return new MerkleTree(leaves, keccak256, { sortPairs: true });
}

/**
 * Get merkle proof for a specific deposit
 */
export function getMerkleProof(
  tree: MerkleTree,
  deposit: DepositLeaf
): string[] {
  const leaf = Buffer.from(keccak256(Buffer.from(
    deposit.commitment + deposit.nullifier
  )).slice(2), 'hex');
  
  return tree.getHexProof(leaf);
}

/**
 * Get merkle root
 */
export function getMerkleRoot(tree: MerkleTree): string {
  return tree.getHexRoot();
}

/**
 * Verify merkle proof
 */
export function verifyMerkleProof(
  proof: string[],
  root: string,
  leaf: string
): boolean {
  return MerkleTree.verify(proof, leaf, root, keccak256);
}
```

#### Step 3: Create Test Suite

**File**: `tests/merkle.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { 
  generateMerkleTree, 
  getMerkleProof, 
  getMerkleRoot,
  verifyMerkleProof,
  type DepositLeaf 
} from '../src/merkle/merkleTree';

describe('Merkle Tree Functions', () => {
  it('should generate merkle tree from deposits', () => {
    const deposits: DepositLeaf[] = [
      { commitment: '0x123...', nullifier: '0xabc...', timestamp: Date.now() },
      { commitment: '0x456...', nullifier: '0xdef...', timestamp: Date.now() },
      { commitment: '0x789...', nullifier: '0xghi...', timestamp: Date.now() },
    ];
    
    const tree = generateMerkleTree(deposits);
    expect(tree).toBeDefined();
  });
  
  it('should generate valid merkle proof', () => {
    const deposits: DepositLeaf[] = [
      { commitment: '0x123...', nullifier: '0xabc...', timestamp: Date.now() },
      { commitment: '0x456...', nullifier: '0xdef...', timestamp: Date.now() },
    ];
    
    const tree = generateMerkleTree(deposits);
    const proof = getMerkleProof(tree, deposits[0]);
    
    expect(proof).toBeInstanceOf(Array);
    expect(proof.length).toBeGreaterThan(0);
  });
  
  it('should verify merkle proof correctly', () => {
    const deposits: DepositLeaf[] = [
      { commitment: '0x123...', nullifier: '0xabc...', timestamp: Date.now() },
      { commitment: '0x456...', nullifier: '0xdef...', timestamp: Date.now() },
    ];
    
    const tree = generateMerkleTree(deposits);
    const root = getMerkleRoot(tree);
    const proof = getMerkleProof(tree, deposits[0]);
    const leaf = keccak256(Buffer.from(
      deposits[0].commitment + deposits[0].nullifier
    ));
    
    const isValid = verifyMerkleProof(proof, root, leaf);
    expect(isValid).toBe(true);
  });
  
  it('should reject invalid merkle proof', () => {
    const deposits: DepositLeaf[] = [
      { commitment: '0x123...', nullifier: '0xabc...', timestamp: Date.now() },
      { commitment: '0x456...', nullifier: '0xdef...', timestamp: Date.now() },
    ];
    
    const tree = generateMerkleTree(deposits);
    const root = getMerkleRoot(tree);
    const fakeProof = ['0x000...'];
    const leaf = keccak256(Buffer.from(
      deposits[0].commitment + deposits[0].nullifier
    ));
    
    const isValid = verifyMerkleProof(fakeProof, root, leaf);
    expect(isValid).toBe(false);
  });
});
```

#### Step 4: Run Tests

```bash
npm test tests/merkle.test.ts
```

---

## 🧪 Part 4: Integration Testing

### Test IPFS + Merkle Tree Integration

#### Scenario: Deploy with Merkle Tree Data

```typescript
// test-integration.ts
import { publishToIpns } from './src/ipfs/publishIpns';
import { generateMerkleTree, getMerkleRoot } from './src/merkle/merkleTree';

async function testIntegration() {
  // 1. Generate merkle tree
  const deposits = [/* test deposits */];
  const tree = generateMerkleTree(deposits);
  const root = getMerkleRoot(tree);
  
  // 2. Include merkle root in deployment metadata
  const metadata = {
    merkleRoot: root,
    timestamp: Date.now(),
    deposits: deposits.length,
  };
  
  // 3. Upload to IPFS
  const metadataBlob = new Blob([JSON.stringify(metadata)], {
    type: 'application/json'
  });
  
  const result = await publishToIpns(metadataBlob, {
    kuboApiUrl: 'http://127.0.0.1:5001',
  });
  
  console.log('Merkle root on IPFS:', result.cid);
  console.log('IPNS:', result.ipnsName);
}
```

---

## 📊 Part 5: Testing Current Anonymity Set Functions

### Local Note-Based Anonymity Set

**Location**: `app/lib/note.ts` → `getAnonymitySetCount()`

#### Test Steps:

1. **Create Multiple Deposits**:
```javascript
// In browser console at http://localhost:3000/deposit
// Complete multiple deposits with same asset/denomination
// Each deposit generates a note saved to vault
```

2. **Check Anonymity Set**:
```javascript
// In browser console
const { getAnonymitySetCount } = await import('/app/lib/note.js');
const count = getAnonymitySetCount('ETH', '1');
console.log('Anonymity set:', count);
```

3. **Verify Pool Stats**:
```javascript
// Navigate to /pools/ETH/1
// Check that anonymity set matches local notes count
```

#### Limitations:
- ❌ Only counts user's own notes
- ❌ Not the real anonymity set (should include all users' deposits)
- ✅ Useful for UI/UX testing

---

## 🔬 Part 6: Manual Testing Checklist

### IPFS Testing
- [ ] Local IPFS node running
- [ ] IPFS API accessible (http://127.0.0.1:5001)
- [ ] IPFS Gateway accessible (http://127.0.0.1:8081)
- [ ] Build script completes successfully
- [ ] Upload to IPFS returns CID
- [ ] Content retrievable via gateway
- [ ] IPNS publish succeeds (if enabled)
- [ ] IPNS resolution works

### Merkle Tree Testing (Once Implemented)
- [ ] Merkle tree generation from deposits
- [ ] Merkle proof generation for withdrawals
- [ ] Merkle proof verification
- [ ] Root calculation
- [ ] Anonymity set calculation from tree
- [ ] Nullifier tracking
- [ ] Double-spend prevention

### Current MVP Testing
- [ ] Local note generation works
- [ ] Note vault stores notes correctly
- [ ] Anonymity set count from local notes
- [ ] Pool stats display correctly
- [ ] Note import/export works

---

## 🚀 Quick Test Commands

### Test IPFS Connection
```bash
# Check IPFS node
curl -s http://127.0.0.1:5001/api/v0/version | jq

# Test adding a file
echo "test" > test.txt
curl -X POST -F "file=@test.txt" http://127.0.0.1:5001/api/v0/add

# Get file back (replace <CID> with returned hash)
curl http://127.0.0.1:8081/ipfs/<CID>
```

### Test Merkle Tree (After Implementation)
```bash
# Run merkle tree tests
npm test tests/merkle.test.ts

# Run all tests including merkle
npm test
```

---

## 📝 Notes

### IPFS
- **Production**: Use Pinata or Infura IPFS for persistence
- **Local**: Docker Compose IPFS is ephemeral (resets on container restart)
- **Gateway**: Local gateway at http://127.0.0.1:8081 for testing

### Merkle Trees
- **Current**: Not implemented, using local notes
- **Future**: Requires:
  - Smart contract deployment (for on-chain merkle root)
  - Event indexer (for building tree from events)
  - ZK circuit integration (for merkle proofs in withdrawals)
  - Nullifier tracking service

---

## 🐛 Troubleshooting

### IPFS Issues

**Problem**: Cannot connect to IPFS node
```bash
# Solution: Check if IPFS is running
docker-compose ps

# Restart IPFS
docker-compose restart ipfs

# Check logs
docker-compose logs ipfs
```

**Problem**: IPNS publish fails
```bash
# Solution: Ensure IPFS key exists
curl -X POST http://127.0.0.1:5001/api/v0/key/list

# Create key if needed
curl -X POST "http://127.0.0.1:5001/api/v0/key/gen?arg=mykey"
```

### Merkle Tree Issues

**Problem**: Merkle proof verification fails
- Check that leaves are in same order
- Verify hash function matches (keccak256)
- Ensure commitment and nullifier concatenation is consistent

---

## 📚 References

- [IPFS Kubo Documentation](https://docs.ipfs.tech/)
- [Merkle Tree Libraries](https://github.com/miguelmota/merkletreejs)
- [ZK Circuits (Circom)](https://docs.circom.io/)
- [Tornado Cash Merkle Trees](https://github.com/tornadocash/tornado-core)

---

**Status**: IPFS testing ready ✅ | Merkle tree implementation pending ⏳

