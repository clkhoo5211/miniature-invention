# Getting Started Guide

**Last Updated**: 2025-10-31  
**Version**: 1.0

---

## Welcome to Compliant Private Transfers

Compliant Private Transfers is a privacy-forward, KYC-gated shielded transfer system that allows you to make private blockchain transactions while maintaining regulatory compliance.

---

## What You Need

### Required
- **Web Browser**: Chrome, Firefox, Brave, or Edge
- **MetaMask**: Browser extension wallet ([Install MetaMask](https://metamask.io))
- **Funds**: Some cryptocurrency in your wallet (ETH, MATIC, etc.)

### Optional
- **ICP Internet Identity**: For optional KYC verification

---

## Quick Start (5 Minutes)

### Step 1: Install MetaMask

1. Visit [metamask.io](https://metamask.io)
2. Click "Download" and install the browser extension
3. Create a new wallet or import an existing one
4. **Important**: Save your seed phrase securely!

### Step 2: Access the Application

1. Open the Compliant Private Transfers application
2. You'll see the home page with pool options

### Step 3: Connect Your Wallet

1. Click "Connect Wallet" button (top right)
2. MetaMask will open - approve the connection
3. Your wallet address will appear when connected

### Step 4: Make Your First Deposit

1. Click "Deposit" in the navigation
2. Select network (Ethereum, Polygon, etc.)
3. Select asset (ETH, USDC, etc.)
4. Enter amount
5. Click "Generate Proof"
6. Review transaction details
7. Click "Sign Transaction" and approve in MetaMask
8. **Save your deposit note** - you'll need it to withdraw!

### Step 5: Withdraw Funds

1. Click "Withdraw" in the navigation
2. Paste your deposit note (or select from vault)
3. Enter destination address
4. (Optional) Select a relayer
5. Generate proof and sign transaction
6. Wait for confirmation

---

## Understanding Deposit Notes

### What is a Deposit Note?

A deposit note is a special string that proves you made a deposit. It contains:
- Your asset and amount
- Cryptographic nullifier (prevents double-spending)
- Secret key (for proof generation)
- Checksum (for validation)

**Example Note**:
```
note-compliant-ETH-1.0-abc123xyz-def45678
```

### Why Are Notes Important?

- **Required for Withdrawal**: You need your note to withdraw funds
- **Private**: Notes don't reveal your identity on-chain
- **Secure**: Store notes safely - if lost, you may not be able to withdraw

### Storing Notes

**Option 1: Local Vault** (Recommended for regular use)
- Notes are automatically saved in your browser's local vault
- Accessible only from this browser/device
- Lost if you clear browser data

**Option 2: Download** (Recommended for backup)
- Click "Download Note" after deposit
- Save the `.txt` file securely
- Store in password manager or encrypted storage

**Option 3: Manual Backup**
- Copy the note text manually
- Store in secure location (password manager, encrypted file)

---

## Key Features

### 1. Shielded Deposits

- Make deposits without revealing your identity
- Zero-knowledge proofs protect your privacy
- Compliant with KYC requirements

### 2. Private Withdrawals

- Withdraw to any address
- No link between deposit and withdrawal
- Optional relayer support for gasless withdrawals

### 3. Pool System

- Fixed denomination pools (0.1, 1, 10 ETH)
- Anonymity set grows with more deposits
- View pool statistics and recent activity

### 4. Selective Disclosure

- Generate compliance bundles for auditors
- Optional disclosure of transaction details
- Maintains privacy while enabling compliance

---

## Network Support

### Currently Supported Networks

- **Ethereum** (Mainnet)
- **Polygon** (Mainnet)
- **Arbitrum** (Mainnet)
- **Optimism** (Mainnet)

### Assets

- **Native Tokens**: ETH, MATIC
- **ERC20 Tokens**: USDC, DAI (coming soon)

---

## Transaction Flow

### Deposit Flow

```
1. Select Network & Asset
   ↓
2. Enter Amount
   ↓
3. Address Screening (Automatic)
   ↓
4. Generate Proof
   ↓
5. Sign Transaction (MetaMask)
   ↓
6. Receive Deposit Note
   ↓
7. Save Note Securely
```

### Withdraw Flow

```
1. Import Deposit Note
   ↓
2. Enter Destination Address
   ↓
3. (Optional) Select Relayer
   ↓
4. Generate Proof
   ↓
5. Sign Transaction (MetaMask)
   ↓
6. Wait for Confirmation
   ↓
7. Funds Received
```

---

## Security Best Practices

### 1. Protect Your Notes

- **Never share your deposit notes** - they can be used to withdraw your funds
- Store notes in secure, encrypted storage
- Make multiple backups in different locations

### 2. Verify Addresses

- Always double-check destination addresses before withdrawing
- Use address book for frequently used addresses
- Verify first and last 4 characters match

### 3. Use Trusted Networks

- Only use official application URLs
- Verify you're on the correct domain
- Check for HTTPS certificate

### 4. Wallet Security

- Never share your MetaMask seed phrase
- Use hardware wallet for large amounts (if supported)
- Keep MetaMask software updated

---

## Troubleshooting

### "Transaction Rejected"

**Cause**: You clicked "Reject" in MetaMask

**Solution**: Click "Sign" and approve the transaction

---

### "Note Not Found in Vault"

**Cause**: Note not saved or browser data cleared

**Solution**: 
- Import note manually (paste from backup)
- Continue anyway (note can still work if valid)
- Verify note format is correct

---

### "Transaction Failed"

**Cause**: Contract not deployed, insufficient funds, or network error

**Solutions**:
- **Contract not deployed**: Expected for MVP - contracts need deployment
- **Insufficient funds**: Check your balance
- **Network error**: Try again or use different RPC endpoint

---

### "Cannot Connect to Wallet"

**Cause**: MetaMask not installed or locked

**Solutions**:
1. Install MetaMask extension
2. Unlock MetaMask (enter password)
3. Refresh the page

---

## Frequently Asked Questions

### Q: Is this like Tornado Cash?

A: Similar UI/UX, but with compliance features:
- KYC required
- Address screening
- Allowlisted relayers
- Selective disclosure for auditors

### Q: Do I need to verify my identity?

A: KYC verification (ICP Internet Identity) is optional but recommended for compliance.

### Q: Can I withdraw to a different address?

A: Yes! You can withdraw to any address - that's part of the privacy design.

### Q: What happens if I lose my note?

A: Without your note, you cannot withdraw. Always back up your notes securely.

### Q: Are my transactions truly private?

A: Yes, deposits and withdrawals are not linked on-chain. However, compliance features (KYC, screening, disclosure) provide auditability.

### Q: How long do transactions take?

A: Typically 1-2 minutes on mainnet, depending on network congestion.

---

## Next Steps

1. **Make a Test Deposit**: Start with a small amount to get familiar
2. **Explore Pools**: Check different pool sizes and statistics
3. **Read User Guide**: See [User Guide](./user-guide.md) for detailed features
4. **Join Community**: Connect with other users (if available)

---

## Support

### Documentation
- [User Guide](./user-guide.md) - Complete feature guide
- [FAQ](./faq.md) - Frequently asked questions
- [Troubleshooting](../technical-docs/troubleshooting.md) - Technical issues

### Getting Help
- Check browser console for error messages
- Verify transaction on blockchain explorer
- Review documentation for your issue

---

**Welcome aboard!** 🚀

