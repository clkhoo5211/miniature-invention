# API Reference

**Last Updated**: 2025-10-31  
**Version**: 1.0

---

## Overview

This application uses **client-side APIs** rather than traditional REST APIs. All interactions happen directly between the browser and blockchains via RPC calls.

---

## Client-Side API Functions

### Network Configuration

#### `getRpcUrl(network: string): string`

Get RPC URL for a specific network.

**Parameters**:
- `network` (string): Network identifier (`ethereum`, `polygon`, `arbitrum`, `optimism`)

**Returns**: RPC URL string or empty string if not configured

**Example**:
```typescript
import { getRpcUrl } from '@/app/lib/api';

const rpcUrl = getRpcUrl('ethereum');
// Returns: process.env.NEXT_PUBLIC_ETHEREUM_RPC || ''
```

**Location**: `app/lib/api.ts`

---

### Compliance & Screening

#### `screenAddress(address: string): Promise<ScreeningResult>`

Screen an Ethereum address for compliance (OFAC/AML).

**Parameters**:
- `address` (string): Ethereum address to screen

**Returns**: `Promise<ScreeningResult>`

**ScreeningResult**:
```typescript
interface ScreeningResult {
  ok: boolean;
  reason?: string;
  riskScore?: number;
}
```

**Example**:
```typescript
import { screenAddress } from '@/app/lib/api';

const result = await screenAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb');
if (!result.ok) {
  console.error('Address flagged:', result.reason);
}
```

**Location**: `app/lib/api.ts`, `src/compliance/screening.ts`

---

### ZK Proof Generation

#### `generateDummyProof(input: ProofInput): Promise<ZkProof>`

Generate a ZK proof (dummy MVP implementation).

**Parameters**:
- `input` (ProofInput): Proof input parameters

**ProofInput**:
```typescript
interface ProofInput {
  assetSymbol: string;    // Asset symbol (ETH, USDC, etc.)
  amount: string;         // Amount as string (wei for native tokens)
  senderAddress: string;  // User's wallet address
  nonce: string;          // Nonce for proof uniqueness
}
```

**Returns**: `Promise<ZkProof>`

**ZkProof**:
```typescript
interface ZkProof {
  proofData: string;        // Hex-encoded proof data
  publicSignals: string[];  // Public signals array
}
```

**Example**:
```typescript
import { generateDummyProof } from '@/app/lib/api';

const proof = await generateDummyProof({
  assetSymbol: 'ETH',
  amount: '1000000000000000000', // 1 ETH in wei
  senderAddress: '0x...',
  nonce: Date.now().toString(),
});
```

**Note**: This is a dummy implementation. Replace with real ZK circuits for production.

**Location**: `app/lib/api.ts`, `src/prover/proof.ts`

---

### Balance Queries

#### `getBalance(network: string, address: string, assetSymbol?: string): Promise<string>`

Get balance for an address on a specific network.

**Parameters**:
- `network` (string): Network identifier
- `address` (string): Wallet address
- `assetSymbol` (string, optional): Asset symbol (for tokens), undefined for native token

**Returns**: `Promise<string>` - Balance as string (wei for native tokens)

**Example**:
```typescript
import { getBalance } from '@/app/lib/api';

// Get native ETH balance
const ethBalance = await getBalance('ethereum', '0x...');
// Returns: "1000000000000000000" (1 ETH in wei)

// Get ERC20 token balance
const usdcBalance = await getBalance('ethereum', '0x...', 'USDC');
```

**Location**: `app/lib/api.ts`, `src/adapters/evm/EvmAdapter.ts`

---

### Transaction Preparation

#### `prepareDeposit(params): Promise<string>`

Prepare deposit transaction calldata.

**Parameters**:
```typescript
interface DepositParams {
  network: string;
  assetSymbol: string;
  amount: string;
  address: string;      // Destination address (contract)
  proof: ZkProof;
}
```

**Returns**: `Promise<string>` - Transaction calldata (hex string)

**Example**:
```typescript
import { prepareDeposit } from '@/app/lib/api';

const calldata = await prepareDeposit({
  network: 'ethereum',
  assetSymbol: 'ETH',
  amount: '1000000000000000000',
  address: '0x...', // Contract address
  proof: proofObject,
});
```

**Location**: `app/lib/api.ts`, `src/adapters/evm/calldata.ts`

---

#### `prepareWithdraw(params): Promise<string>`

Prepare withdrawal transaction calldata.

**Parameters**:
```typescript
interface WithdrawParams {
  network: string;
  assetSymbol: string;
  amount: string;
  address: string;      // Destination address (recipient)
  proof: ZkProof;
  disclosure?: {
    disclosureHash?: string; // Optional disclosure bundle hash
  };
}
```

**Returns**: `Promise<string>` - Transaction calldata (hex string)

**Example**:
```typescript
import { prepareWithdraw } from '@/app/lib/api';

const calldata = await prepareWithdraw({
  network: 'ethereum',
  assetSymbol: 'ETH',
  amount: '1000000000000000000',
  address: '0x...', // Recipient address
  proof: proofObject,
  disclosure: {
    disclosureHash: '0x...', // Optional
  },
});
```

**Location**: `app/lib/api.ts`, `src/adapters/evm/calldata.ts`

---

### Transaction Signing & Submission

#### `signAndSendTransaction(params): Promise<string>`

Sign and submit a transaction via MetaMask.

**Parameters**:
```typescript
interface TransactionParams {
  network: string;
  to: string;           // Contract address
  data: string;         // Transaction calldata
  value?: string;       // Value in hex (for native tokens)
}
```

**Returns**: `Promise<string>` - Transaction hash

**Example**:
```typescript
import { signAndSendTransaction } from '@/app/lib/api';

const txHash = await signAndSendTransaction({
  network: 'ethereum',
  to: '0x...', // Contract address
  data: calldata,
  value: '0xde0b6b3a7640000', // 1 ETH in hex (optional)
});

console.log('Transaction hash:', txHash);
```

**Location**: `app/lib/api.ts`, `app/lib/wallet.ts`

---

## Wallet API

### Wallet Connection

#### `getWalletState(): Promise<WalletState>`

Get current wallet connection state.

**Returns**: `Promise<WalletState>`

**WalletState**:
```typescript
interface WalletState {
  address: string | null;
  isConnected: boolean;
  chainId: number | null;
}
```

**Example**:
```typescript
import { getWalletState } from '@/app/lib/wallet';

const walletState = await getWalletState();
if (walletState.isConnected) {
  console.log('Connected:', walletState.address);
}
```

**Location**: `app/lib/wallet.ts`

---

#### `connectWallet(): Promise<string>`

Connect to MetaMask wallet.

**Returns**: `Promise<string>` - Connected wallet address

**Example**:
```typescript
import { connectWallet } from '@/app/lib/wallet';

try {
  const address = await connectWallet();
  console.log('Connected:', address);
} catch (error) {
  console.error('Connection failed:', error);
}
```

**Location**: `app/lib/wallet.ts`

---

### Transaction Utilities

#### `sendTransaction(params): Promise<string>`

Send transaction via MetaMask.

**Parameters**:
```typescript
interface SendTxParams {
  to: string;
  data: string;
  value?: string; // Hex string
}
```

**Returns**: `Promise<string>` - Transaction hash

**Location**: `app/lib/wallet.ts`

---

#### `waitForTransactionReceipt(txHash: string, timeout?: number): Promise<TransactionReceipt>`

Wait for transaction receipt.

**Parameters**:
- `txHash` (string): Transaction hash
- `timeout` (number, optional): Timeout in milliseconds (default: 120000)

**Returns**: `Promise<TransactionReceipt>`

**Location**: `app/lib/wallet.ts`

---

## Note Management API

### Note Generation

#### `generateNote(params): DepositNote`

Generate a new deposit note.

**Parameters**:
```typescript
interface NoteParams {
  asset: string;
  denomination: string; // Human-readable amount (e.g., "1.0")
}
```

**Returns**: `DepositNote`

**DepositNote**:
```typescript
interface DepositNote {
  note: string;              // Human-readable note string
  asset: string;
  denomination: string;
  nullifier: string;         // Hex string
  secret: string;            // Hex string
  checksum: string;          // 8-char hex checksum
  createdAt: string;         // ISO timestamp
}
```

**Example**:
```typescript
import { generateNote } from '@/app/lib/note';

const note = generateNote({
  asset: 'ETH',
  denomination: '1.0',
});

console.log('Note:', note.note);
// Output: note-compliant-ETH-1.0-<random>-<checksum>
```

**Location**: `app/lib/note.ts`

---

### Note Validation

#### `validateNote(note: string): boolean`

Validate note format and checksum.

**Parameters**:
- `note` (string): Note string to validate

**Returns**: `boolean`

**Example**:
```typescript
import { validateNote } from '@/app/lib/note';

const isValid = validateNote('note-compliant-ETH-1.0-abc123-def456');
if (!isValid) {
  console.error('Invalid note format');
}
```

**Location**: `app/lib/note.ts`

---

#### `parseNote(note: string): { asset: string; denomination: string; checksum: string } | null`

Parse note to extract components.

**Parameters**:
- `note` (string): Note string

**Returns**: Parsed components or null if invalid

**Example**:
```typescript
import { parseNote } from '@/app/lib/note';

const parsed = parseNote('note-compliant-ETH-1.0-abc123-def456');
if (parsed) {
  console.log('Asset:', parsed.asset);        // ETH
  console.log('Denomination:', parsed.denomination); // 1.0
  console.log('Checksum:', parsed.checksum);  // def456
}
```

**Location**: `app/lib/note.ts`

---

### Note Storage

#### `saveNoteToVault(note: DepositNote): void`

Save note to local vault.

**Example**:
```typescript
import { saveNoteToVault, generateNote } from '@/app/lib/note';

const note = generateNote({ asset: 'ETH', denomination: '1.0' });
saveNoteToVault(note);
```

**Location**: `app/lib/note.ts`

---

#### `listNotesFromVault(): DepositNote[]`

List all notes in local vault.

**Returns**: Array of `DepositNote`

**Location**: `app/lib/note.ts`

---

#### `isNoteInVault(note: string): boolean`

Check if note exists in local vault.

**Location**: `app/lib/note.ts`

---

## Relayer API

### Relayer Management

#### `getActiveRelayers(network: string): Relayer[]`

Get active relayers for a network.

**Parameters**:
- `network` (string): Network identifier

**Returns**: Array of `Relayer`

**Relayer**:
```typescript
interface Relayer {
  id: string;
  name: string;
  address: string;
  networks: string[];
  feePercentage: number;
  feeFixed?: number;
  sla: string;
  riskLevel: 'low' | 'medium' | 'high';
}
```

**Location**: `app/lib/relayers.ts`

---

#### `getRelayerQuote(relayerId: string, params): RelayerQuote`

Get quote from a relayer.

**Parameters**:
```typescript
interface QuoteParams {
  network: string;
  amount: string;
  asset: string;
}
```

**Returns**: `RelayerQuote`

**RelayerQuote**:
```typescript
interface RelayerQuote {
  fee: string;
  feePercentage: number;
  total: string;
  ttl: number; // Time-to-live in seconds
}
```

**Location**: `app/lib/relayers.ts`

---

## Disclosure API

### Disclosure Bundle Generation

#### `generateDisclosureBundle(params): DisclosureBundle`

Generate a disclosure bundle for compliance.

**Parameters**:
```typescript
interface DisclosureParams {
  depositTxHash: string;
  withdrawTxHash: string;
  amount: string;
  asset: string;
  userAddress?: string;
}
```

**Returns**: `DisclosureBundle`

**Location**: `app/lib/disclosure.ts`

---

#### `hashDisclosureBundle(bundle: DisclosureBundle): string`

Hash a disclosure bundle for on-chain storage.

**Returns**: 32-byte hex hash (64 characters)

**Location**: `app/lib/disclosure.ts`

---

## Validation API

### Form Validation

#### `validateAddress(address: string): ValidationResult`

Validate Ethereum address format.

**Returns**: `ValidationResult`

**Location**: `app/lib/validation.ts`

---

#### `validateAmount(amount: string): ValidationResult`

Validate amount format and range.

**Location**: `app/lib/validation.ts`

---

## Error Handling

### Common Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| `4001` | User rejected | User needs to approve in MetaMask |
| `-32603` | Execution reverted | Check contract, balance, proof |
| `-32602` | Invalid params | Check transaction parameters |

---

**Related Documentation**:
- [Implementation Guide](../technical-docs/implementation-guide.md)
- [Troubleshooting](../technical-docs/troubleshooting.md)

