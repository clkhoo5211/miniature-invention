# Data Architecture - Compliant Private Transfers

**Created**: 2025-10-30 23:59:00  
**Version**: 1.0  
**Status**: Draft

---

## Overview
- Minimal data retention; selective disclosure bundles
- Logs: proof events, relayer quotes, screening results (tokenized identifiers)
- Storage: encrypted at rest where applicable; IPFS for static artifacts

## Entities (Conceptual)
- UserIdentity (ICP II tokenized ref)
- Wallet (chain, address)
- ScreeningResult (score, provider, timestamp)
- ProofRecord (inputs hash, proof hash, status)
- RelayerQuote (relayerId, fee, ttl)
- DisclosureBundle (scope, link, expiry)

## Data Flows
- Onboarding: ICP II -> create UserIdentity, link Wallet
- Transfer: Screening -> Proof -> Relayer -> ProofRecord
- Audit: Generate DisclosureBundle from ProofRecord
