# Project Requirements - Compliant Private Transfers

**Project**: project-20251030-232211-compliant-private-transfers  
**Created**: 2025-10-30 23:23:19  
**Version**: 1.0  
**Status**: Discovery Complete

---

## 1. Overview & Goals
Compliance-first private transfers across major chains using zk proofs without mixer semantics. KYC via ICP Internet Identity, OFAC/AML screening, allowlisted relayers, selective disclosure. UI/docs hosted on IPFS with IPNS.

---

## 2. Scope
- Multi-chain: Ethereum, Polygon, Arbitrum, Optimism, Solana, BNB Chain, TRON (extensible)
- Privacy: zk proofs (proof-of-funds/ownership, selective disclosure), no mixer-style source obfuscation
- Compliance: KYC via ICP Internet Identity (II), OFAC/AML wallet screening, allowlisted relayers, audit logs (selective disclosure), travel-rule metadata support
- Hosting: UI/docs on IPFS, pinned and published via IPNS

---

## 3. Functional Requirements (MVP)
1. KYC onboarding with ICP Internet Identity (II) and wallet link  
2. Address screening and risk scoring  
3. Shielded deposit with zk proof-of-funds (no mixer semantics)  
4. Allowlisted relayer request & fee quote  
5. Selective disclosure for auditors/compliance  
6. Multi-chain network selector (EVM + SOL/BNB/TRX stubs)  
7. IPFS build publish + IPNS record update

---

## 4. Non-Functional Requirements
- Security: OWASP, rate limiting, CSRF where relevant  
- Privacy: data minimization, encrypted at rest/in transit  
- Availability: static UI via IPFS gateways + local node options

---

## 5. Constraints & Assumptions
- Constraints: Free/static hosting; allowlist-only relayers; phased chain adapters  
- Assumptions: ICP II available; EVM-first development; disclosures acceptable to auditors

---

## 6. Compliance & Legal
- KYC/AML via ICP II + screening  
- Travel rule metadata support  
- Audit logs with selective disclosure

---

## 7. UX Reference
- Account page flow inspired by the provided reference (without mixing): balances, deposit/withdraw with disclosures, relayer selection (allowlisted), proof generation status, network selector.

---

## 8. Dependencies
- ICP Internet Identity integration  
- Screening provider/policy engine  
- EVM RPC endpoints; future SOL/BNP/TRX adapters  
- IPFS node/pinning + IPNS publisher

---

## 9. Milestones
- MVP (Weeks 0–8): EVM flows + KYC + screening + relayer allowlist + IPFS/IPNS  
- Beta (Weeks 9–16): Disclosures + SOL adapter + policy engine  
- GA (Weeks 17–24): BNB/TRX adapters + enterprise controls

---

## 10. Open Questions
- KYC policy thresholds (aligned to ICP Internet Identity attestation capabilities)
- Supported assets per chain (native vs tokens)
- Relayer business logic and jurisdiction constraints

---

## 11. Next
- /product for product strategy  
- /plan for roadmap
