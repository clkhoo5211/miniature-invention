# Product Strategy - Compliant Private Transfers

**Created**: 2025-10-30 23:33:11  
**Version**: 1.0  
**Status**: Strategic Planning

---

## Executive Summary

Compliance-first private transfers using zk proofs (no mixer semantics), with KYC via ICP Internet Identity, OFAC/AML screening, allowlisted relayers, and selective disclosure. Multi-chain coverage (ETH, Polygon, Arbitrum, Optimism, Solana, BNB, TRON). UI/docs hosted on IPFS with IPNS for cost efficiency and resilience.

---

## Market Position & Differentiation

### Current Landscape
- Mixers: non-compliant → out of scope.
- L2 privacy rollups: strong tech, unclear compliance footprint.
- Custodial privacy: compliant but centralized trust and custody risk.

### Our Uniqueness
1) ICP Internet Identity KYC + OFAC/AML screening  
2) No source-obfuscation; zk proofs with selective disclosures  
3) Allowlisted relayers with policy controls  
4) IPFS/IPNS hosting, open infra

---

## Product Vision
Mission: Compliant, privacy-preserving, multi-chain transfers with auditability and open infrastructure.

---

## Target Market
- Institutions (exchanges, funds), OTC desks, and advanced retail in compliant jurisdictions.
- Personas: Compliance officer, treasury operations, advanced retail user.

---

## Business Model
- Relayer fees (regulated allowlist)
- Compliance API/SDK (screening, disclosures)
- Enterprise SLA/support

---

## Competitive Strategy
- Differentiation: Compliance-first privacy; policy engine; disclosures.
- Entry Barriers: ZK integration + cross-chain adapters + relayer network.
- Defensibility: Compliance integrations, partnerships, operational playbooks.

---

## Product Roadmap
### MVP (Weeks 0–8)
- KYC (ICP II), address screening, EVM shielded transfers (ETH/Polygon/Arbitrum/Optimism), relayer allowlist, IPFS/IPNS deploy.

### Beta (Weeks 9–16)
- Selective disclosure packages, SOL adapter, policy engine, basic analytics.

### GA (Weeks 17–24)
- BNB/TRX adapters, enterprise controls, SLA, monitoring.

---

## Go-to-Market Strategy
- Channels: Institutional partnerships, compliance communities, developer conferences.
- Launch: Private pilot with institutions → public beta → GA.
- Growth: Compliance SDK, relayer marketplace incentives.

---

## Success Metrics (KPIs)
- KYCed wallets onboarded; proof success rate; time-to-proof and relayer latency; compliance pass rate; active organizations.

---

## Risk Mitigation
- Regulatory change → configurable policy engine  
- Cross-chain complexity → phased adapters, EVM-first  
- Relayer availability → multi-relayer allowlist + staking

---

## References
- Tornado Cash GitHub org (historical UI/workflows reference; we avoid mixer semantics): https://github.com/tornadocash
- IPNS for mutable naming on IPFS (for UI/docs hosting): https://docs.ipfs.tech/concepts/ipns/
- Reference account UI (visual flow inspiration only): https://tornadocash-eth.ipns.dweb.link/account
