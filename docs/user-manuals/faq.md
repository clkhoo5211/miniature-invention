# Frequently Asked Questions (FAQ)

**Last Updated**: 2025-10-31  
**Version**: 1.0

---

## General Questions

### Q: What is Compliant Private Transfers?

A: A privacy-forward, KYC-gated shielded transfer system that allows private blockchain transactions while maintaining regulatory compliance. Similar to Tornado Cash but with built-in compliance features.

### Q: How is this different from Tornado Cash?

A: Key differences:
- **KYC Required**: Identity verification via ICP Internet Identity
- **Address Screening**: OFAC/AML screening before deposits
- **Allowlisted Relayers**: Only trusted relayers can process transactions
- **Selective Disclosure**: Optional compliance bundles for auditors

### Q: Is this legal?

A: This system is designed for compliance, with KYC, screening, and audit capabilities. However, regulations vary by jurisdiction - please consult legal counsel for your specific situation.

---

## Technical Questions

### Q: How does the privacy work?

A: Zero-knowledge proofs allow you to prove you made a deposit without revealing which specific deposit. The system uses cryptographic nullifiers to prevent double-spending while maintaining privacy.

### Q: What are zero-knowledge proofs?

A: Cryptographic proofs that allow you to prove something is true without revealing the underlying data. In this case, you prove you made a deposit without revealing which deposit.

### Q: Are my transactions truly anonymous?

A: Deposits and withdrawals are not linked on-chain. However, compliance features (KYC, screening, disclosure) provide auditability. For maximum privacy, withdraw to different addresses and vary timing.

### Q: What blockchains are supported?

A: Currently:
- Ethereum (Mainnet)
- Polygon (Mainnet)
- Arbitrum (Mainnet)
- Optimism (Mainnet)

More chains coming soon.

---

## Usage Questions

### Q: How do I make a deposit?

A: 
1. Connect your wallet
2. Go to Deposit page
3. Select network, asset, and amount
4. Generate proof and sign transaction
5. **Save your deposit note** (critical!)

### Q: How do I withdraw?

A:
1. Go to Withdraw page
2. Paste your deposit note (or select from vault)
3. Enter destination address
4. (Optional) Select relayer
5. Generate proof and sign transaction

### Q: What is a deposit note?

A: A special string that proves you made a deposit. Format: `note-compliant-<asset>-<amount>-<random>-<checksum>`. You need this note to withdraw funds.

### Q: What happens if I lose my note?

A: Without your deposit note, you cannot withdraw funds. Always back up your notes securely - download them as files and store in multiple locations.

### Q: Can I withdraw to a different address?

A: Yes! That's part of the privacy design. You can deposit from one address and withdraw to any other address.

### Q: How long do transactions take?

A: Typically 1-2 minutes on mainnet, depending on network congestion. L2 networks (Polygon, Arbitrum) are usually faster.

---

## Pool Questions

### Q: What are pools?

A: Pools are collections of deposits with the same asset and amount. For example, the "1 ETH" pool contains all 1 ETH deposits.

### Q: Why fixed denominations?

A: Fixed denominations (0.1, 1, 10 ETH) make it easier to maintain anonymity sets and calculate statistics.

### Q: What is anonymity set?

A: The number of deposits in a pool. Larger anonymity sets provide better privacy.

### Q: How do I see pool statistics?

A: Visit the Pools page or click on a specific pool to see detailed statistics including anonymity set, volume, and recent activity.

---

## Security Questions

### Q: Is my wallet safe?

A: Your wallet is never accessed directly. All transactions require your explicit approval in MetaMask. Never share your MetaMask seed phrase.

### Q: Are my notes secure?

A: Notes are stored locally in your browser. They're not sent to any server. However, if someone has your note, they can withdraw your funds - so keep them secure!

### Q: What if my note is stolen?

A: If someone has your note, they can withdraw your funds. This is why it's critical to:
- Never share notes
- Store notes in encrypted storage
- Use different notes for different deposits

### Q: Can transactions be traced?

A: Deposits and withdrawals are not linked on-chain. However, compliance features provide auditability. Advanced blockchain analysis might reveal patterns if you're not careful.

---

## Relayer Questions

### Q: What is a relayer?

A: A service that pays gas fees for your withdrawal in exchange for a fee. This allows gasless withdrawals.

### Q: Do I have to use a relayer?

A: No, relayers are optional. You can pay gas fees yourself if you prefer.

### Q: Are relayers safe?

A: Only allowlisted relayers are shown. Always check relayer details (SLA, risk level) before using. Trusted relayers are vetted, but always do your own research.

### Q: How much do relayers charge?

A: Fees vary by relayer. Check the Relayers page to compare fees. Fees are typically a percentage of the withdrawal amount.

---

## Compliance Questions

### Q: Do I need to verify my identity?

A: KYC verification (ICP Internet Identity) is optional but recommended for compliance. Some features may require verification.

### Q: What is address screening?

A: Before deposits, addresses are checked against OFAC/AML sanctions lists. Flagged addresses may be rejected.

### Q: What is selective disclosure?

A: An optional feature that generates compliance bundles. These bundles can be provided to auditors or regulators if required, while maintaining privacy by default.

### Q: Who can see my transactions?

A: By default, only you can see your transaction details. With selective disclosure, you can share specific transaction bundles with auditors if needed.

---

## Troubleshooting Questions

### Q: Transaction failed - why?

A: Common reasons:
- Contract not deployed (expected for MVP)
- Insufficient balance
- Network error
- Invalid proof

Check transaction details on blockchain explorer for specific error.

### Q: Can't connect wallet - help!

A: 
1. Ensure MetaMask is installed
2. Unlock MetaMask
3. Refresh the page
4. Check browser console for errors

### Q: Note not found in vault

A: Your note might be in a different browser/device, or browser data was cleared. You can still use the note by pasting it manually - the warning is just informational.

### Q: Wrong network error

A: Switch to the correct network in MetaMask, or use the network selector in the app.

---

## Future Features

### Q: What's coming next?

A: Planned features:
- More blockchain networks
- More asset types (tokens)
- Mobile app
- Hardware wallet support
- Real-time anonymity set updates
- Advanced analytics

### Q: When will smart contracts be deployed?

A: Smart contracts are ready but not yet deployed. Deployment timeline depends on security audits and testing.

### Q: When will real ZK circuits be integrated?

A: Dummy prover is currently in use. Real circuits will be integrated after security review and testing.

---

## Support

### Q: Where can I get help?

A:
- Check documentation: [Getting Started](./getting-started.md), [User Guide](./user-guide.md)
- Review troubleshooting guide
- Check browser console for errors
- Verify transactions on blockchain explorer

### Q: How do I report a bug?

A: Report bugs with:
- Browser and version
- MetaMask version
- Network used
- Error message
- Steps to reproduce

---

**Still have questions?** Check the [User Guide](./user-guide.md) for detailed feature documentation.

