# User Guide

**Last Updated**: 2025-10-31  
**Version**: 1.0

---

## Complete Feature Guide

This guide covers all features and functionality of Compliant Private Transfers.

---

## Table of Contents

1. [Home Page](#home-page)
2. [Pools](#pools)
3. [Deposit](#deposit)
4. [Withdraw](#withdraw)
5. [Dashboard](#dashboard)
6. [History](#history)
7. [Relayers](#relayers)
8. [Auditor Portal](#auditor-portal)

---

## Home Page

The home page provides an overview and quick access to pools.

### Features

- **Pool Quick Links**: Access popular pools directly
- **Anonymity Set Display**: See pool sizes at a glance
- **Navigation**: Access all features via top navigation bar

### Pool Quick Links

Each pool shows:
- Asset and denomination (e.g., "0.1 ETH")
- Current anonymity set size
- Click to view pool details

---

## Pools

### Pool Index (`/pools`)

View all available pools organized by asset.

**Available Pools**:
- **ETH**: 0.1, 1, 10 ETH
- **USDC**: Coming soon
- **DAI**: Coming soon

### Pool Details (`/pools/[asset]/[denom]`)

View detailed statistics for a specific pool.

**Pool Statistics**:
- **Anonymity Set**: Number of deposits in pool
- **Total Deposits**: Total number of deposits
- **Total Volume**: Total volume in pool
- **24h Activity**: Deposits in last 24 hours
- **7d Activity**: Deposits in last 7 days
- **Average Interval**: Average time between deposits
- **Last Deposit**: Most recent deposit with explorer link

**Actions**:
- **Deposit**: Click "Deposit" to make a deposit
- **View Recent**: Scroll to see recent deposits

---

## Deposit

Make a shielded deposit to a pool.

### Deposit Process

#### Step 1: Select Network
- Choose blockchain network (Ethereum, Polygon, Arbitrum, Optimism)
- Ensure you have funds on selected network

#### Step 2: Select Asset & Amount
- **Asset**: Choose asset (ETH, USDC, etc.)
- **Amount**: Enter amount (must match pool denomination)
- **Fixed Denominations**: Pools only accept specific amounts (0.1, 1, 10 ETH)

#### Step 3: Address Screening
- Your address is automatically screened
- Screening checks for OFAC/AML compliance
- If flagged, deposit may be rejected

#### Step 4: Generate Proof
- Click "Generate Proof"
- System generates zero-knowledge proof
- Proof generation takes a few seconds

#### Step 5: Sign Transaction
- Review transaction details
- Click "Sign Transaction"
- MetaMask opens - review and approve
- Transaction is submitted to blockchain

#### Step 6: Save Note
- **Critical**: Save your deposit note!
- Click "Download Note" to save as file
- Note is also saved to local vault automatically
- Store note securely - needed for withdrawal

### Deposit Note Format

```
note-compliant-ETH-1.0-<random>-<checksum>
```

**Components**:
- `note-compliant`: Prefix
- `ETH`: Asset symbol
- `1.0`: Denomination
- `<random>`: Random string
- `<checksum>`: 8-character validation code

### Tips

- Start with small amounts to test
- Always verify network and amount before signing
- Back up your notes immediately after deposit
- Check transaction status on blockchain explorer

---

## Withdraw

Withdraw funds from a pool using your deposit note.

### Withdraw Process

#### Step 1: Import Note
- **Option A**: Paste note manually
- **Option B**: Select from local vault dropdown
- **Validation**: System validates note format automatically

#### Step 2: Enter Destination
- **Address**: Enter recipient address (can be different from deposit address)
- **Validation**: Address format is validated
- **Warning**: Double-check address - transactions are irreversible

#### Step 3: Select Relayer (Optional)
- Choose relayer for gasless withdrawal
- View relayer fees and quotes
- Select best option or proceed without relayer

#### Step 4: Generate Proof
- Click "Generate Proof"
- System generates zero-knowledge proof using your note
- Note is validated before proof generation

#### Step 5: Sign Transaction
- Review transaction details
- Check destination address
- Click "Sign Transaction"
- Approve in MetaMask

#### Step 6: Confirmation
- Wait for transaction confirmation (1-2 minutes)
- View transaction on blockchain explorer
- Funds arrive at destination address

### Note Validation

Before withdrawal:
- ✅ Note format validated
- ✅ Checksum verified
- ⚠️ Warning if note not in local vault (can still proceed)

### Relayer Selection

**Benefits**:
- No gas fees (relayer pays)
- Faster transactions (relayer prioritizes)
- Convenience

**Considerations**:
- Relayer fee applies
- Choose trusted relayers
- Check relayer SLA and risk level

---

## Dashboard

Your personal dashboard showing activity and balances.

### Features

- **Wallet Address**: Your connected wallet address
- **Network**: Currently selected network
- **Balance**: Your wallet balance (native token)
- **Recent Activity**: Last 10 transactions
  - Transaction type (deposit/withdraw)
  - Asset and amount
  - Network
  - Transaction hash with explorer link
  - Timestamp

### Actions

- **Switch Network**: Change blockchain network
- **View Full History**: Click to see complete transaction history
- **Make Deposit**: Quick link to deposit page
- **Make Withdraw**: Quick link to withdraw page

---

## History

Complete transaction history page.

### Features

- **All Transactions**: Complete list of deposits and withdrawals
- **Filters**: Filter by type, asset, network (future)
- **Pagination**: Navigate through transaction history
- **Explorer Links**: Click to view on blockchain explorer

### Transaction Details

Each transaction shows:
- **Type**: Deposit or Withdraw
- **Asset**: Token symbol
- **Amount**: Transaction amount
- **Network**: Blockchain network
- **Address**: Transaction address
- **Hash**: Transaction hash (clickable)
- **Timestamp**: When transaction occurred

### Export (Future)

Export transaction history as CSV or JSON (coming soon).

---

## Relayers

Relayer marketplace for gasless withdrawals.

### Features

- **Relayer List**: View all available relayers
- **Network Filter**: Filter relayers by network
- **Quote Generator**: Get real-time quotes
- **Relayer Details**: View fees, SLA, risk level

### Relayer Information

Each relayer shows:
- **Name**: Relayer name/identifier
- **Address**: Relayer contract address
- **Supported Networks**: Which networks relayer supports
- **Fee Structure**: Percentage and/or fixed fees
- **SLA**: Service level agreement
- **Risk Level**: Low, Medium, or High

### Getting Quotes

1. Select network
2. Enter withdrawal amount
3. View quotes from all relayers
4. Compare fees and select best option

### Adding Relayers (Admin)

Advanced users can add custom relayers:
1. Click "Add Relayer"
2. Enter relayer details
3. Save to local storage

---

## Auditor Portal

View and manage disclosure bundles for compliance.

### Features

- **Bundle List**: View all generated disclosure bundles
- **Bundle Details**: View full bundle contents
- **Verification**: Verify bundle integrity
- **Download**: Export bundles as JSON

### Disclosure Bundles

A disclosure bundle contains:
- **Deposit Transaction**: Original deposit hash
- **Withdraw Transaction**: Withdrawal hash
- **Amount**: Transaction amount
- **Asset**: Token symbol
- **Timestamp**: When bundle was created
- **User Address**: Optional (if disclosed)

### Generating Bundles

Disclosure bundles are automatically generated when:
- Withdrawal is made with selective disclosure enabled
- User chooses to enable disclosure during withdraw

### Use Cases

- **Regulatory Compliance**: Provide to regulators if required
- **Audit Trail**: Maintain compliance records
- **Verification**: Prove transaction legitimacy

---

## Advanced Features

### ICP Internet Identity (Optional)

**Setup**:
1. Enable ICP Identity in settings
2. Connect to Internet Identity
3. Complete KYC verification

**Benefits**:
- Enhanced compliance
- Regulatory approval
- Access to advanced features

### Selective Disclosure

**What It Is**:
- Optional disclosure of transaction details
- Provides audit trail while maintaining privacy
- Hash stored on-chain, details stored locally

**When to Use**:
- Regulatory requirements
- Audit purposes
- Compliance verification

---

## Tips & Best Practices

### Security
- Always verify addresses before transactions
- Use trusted relayers only
- Keep notes backed up in multiple locations
- Never share deposit notes

### Privacy
- Withdraw to different addresses for maximum privacy
- Use different pools to break transaction patterns
- Consider timing between deposit and withdrawal

### Performance
- Use L2 networks (Polygon, Arbitrum) for lower fees
- Check network congestion before large transactions
- Use relayers for gasless withdrawals

---

**Related Documentation**:
- [Getting Started](./getting-started.md)
- [FAQ](./faq.md)

