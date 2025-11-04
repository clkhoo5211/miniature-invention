import { describe, it, expect } from 'vitest';
import { generateDisclosureBundle } from '../app/lib/disclosure';
import type { ProofInput, ZkProof } from '../src/prover/proof';
import { verifyDisclosureBundle } from '../app/lib/disclosure';

describe('Disclosure bundle hashing and verification', () => {
  it('generates SHA-256 hash and verifies consistently', async () => {
    const proofInput: ProofInput = {
      assetSymbol: 'ETH',
      amount: '0.1000',
      senderAddress: '0x000000000000000000000000000000000000dEaD',
      nonce: 'test-nonce',
    };

    const zkProof: ZkProof = {
      proofData: '0xproof',
      publicSignals: ['sig1', 'sig2'],
    };

    const bundle = await generateDisclosureBundle({
      type: 'deposit',
      amount: '0.1000',
      assetSymbol: 'ETH',
      senderAddress: proofInput.senderAddress,
      proof: zkProof,
      proofInput,
    });

    // Expect a 0x-prefixed 64-hex-char hash (SHA-256 -> 32 bytes)
    expect(bundle.hash.startsWith('0x')).toBe(true);
    const hex = bundle.hash.slice(2);
    expect(hex).toMatch(/^[0-9a-f]{64}$/i);

    const ok = await verifyDisclosureBundle(bundle);
    expect(ok).toBe(true);
  });
});