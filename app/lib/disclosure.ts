/**
 * Selective disclosure bundle generation and management
 */

import type { DisclosureOptions } from '@/src/lib/types';
import { STORAGE_KEYS } from './constants';
import type { ZkProof, ProofInput } from '@/src/prover/proof';

export interface DisclosureBundle {
  id: string;
  hash: string;
  type: 'deposit' | 'withdraw';
  amount: string;
  assetSymbol: string;
  senderAddress: string;
  recipientAddress?: string;
  proof: ZkProof;
  proofInput: ProofInput;
  timestamp: string;
  scope: string[];
  metadata?: Record<string, unknown>;
}

/**
 * Generate a disclosure bundle from transaction data
 */
export async function generateDisclosureBundle(params: {
  type: 'deposit' | 'withdraw';
  amount: string;
  assetSymbol: string;
  senderAddress: string;
  recipientAddress?: string;
  proof: ZkProof;
  proofInput: ProofInput;
  disclosureOptions?: DisclosureOptions;
}): Promise<DisclosureBundle> {
  const timestamp = new Date().toISOString();
  const bundleId = `bundle-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Create a hash from the bundle data
  const bundleData = JSON.stringify({
    type: params.type,
    amount: params.amount,
    assetSymbol: params.assetSymbol,
    senderAddress: params.senderAddress,
    recipientAddress: params.recipientAddress,
    proof: params.proof,
    timestamp,
  });
  
  // Generate a proper 32-byte (64 hex chars) cryptographic hash using SHA-256
  // Prefer Web Crypto API; use Node.js crypto as fallback for non-browser environments
  let hash: string;
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    // Browser: Use Web Crypto API
    const encoder = new TextEncoder();
    const data = encoder.encode(bundleData);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    hash = `0x${hashHex}`; // SHA-256 produces 32 bytes = 64 hex chars
  } else {
    // Node.js/server-side fallback: use Node's crypto
    try {
      const nodeCrypto = await import('crypto');
      const hashHex = nodeCrypto.createHash('sha256').update(bundleData).digest('hex');
      hash = `0x${hashHex}`;
    } catch {
      // Last resort: non-cryptographic placeholder (should not be used in production)
      const hashBytes = Buffer.from(bundleData);
      const hashHex = hashBytes.toString('hex').slice(0, 64).padEnd(64, '0');
      hash = `0x${hashHex}`;
    }
  }

  // Determine disclosure scope
  const scope = params.disclosureOptions?.scope || [
    'amount',
    'assetSymbol',
    'timestamp',
    params.type === 'withdraw' ? 'recipientAddress' : null,
  ].filter(Boolean) as string[];

  return {
    id: bundleId,
    hash,
    type: params.type,
    amount: params.amount,
    assetSymbol: params.assetSymbol,
    senderAddress: params.senderAddress,
    recipientAddress: params.recipientAddress,
    proof: params.proof,
    proofInput: params.proofInput,
    timestamp,
    scope,
  };
}

/**
 * Store disclosure bundle in localStorage (client-side only)
 * In production, this would be stored on a server or IPFS
 */
export function storeDisclosureBundle(bundle: DisclosureBundle): void {
  if (typeof window === 'undefined') return;
  
  try {
    const existing = getStoredDisclosureBundles();
    existing.push(bundle);
    localStorage.setItem(STORAGE_KEYS.DISCLOSURE_BUNDLES, JSON.stringify(existing));
  } catch (error) {
    console.error('Error storing disclosure bundle:', error);
  }
}

/**
 * Get all stored disclosure bundles
 */
export function getStoredDisclosureBundles(): DisclosureBundle[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.DISCLOSURE_BUNDLES);
    if (!stored) return [];
    return JSON.parse(stored) as DisclosureBundle[];
  } catch (error) {
    console.error('Error retrieving disclosure bundles:', error);
    return [];
  }
}

/**
 * Get a specific disclosure bundle by ID
 */
export function getSpecificDisclosureBundle(bundleId: string): DisclosureBundle | null {
  const bundles = getStoredDisclosureBundles();
  return bundles.find(b => b.id === bundleId) || null;
}

/**
 * Verify disclosure bundle integrity
 */
export async function verifyDisclosureBundle(bundle: DisclosureBundle): Promise<boolean> {
  // Recompute hash using the same SHA-256 algorithm as generation
  const bundleData = JSON.stringify({
    type: bundle.type,
    amount: bundle.amount,
    assetSymbol: bundle.assetSymbol,
    senderAddress: bundle.senderAddress,
    recipientAddress: bundle.recipientAddress,
    proof: bundle.proof,
    timestamp: bundle.timestamp,
  });

  try {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      const encoder = new TextEncoder();
      const data = encoder.encode(bundleData);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      const computedHash = `0x${hashHex}`;
      return computedHash === bundle.hash;
    } else {
      // Node.js fallback (should be rare in this client-side context)
      try {
        // Use Node's crypto if available
        const nodeCrypto = await import('crypto');
        const computedHash = `0x${nodeCrypto.createHash('sha256').update(bundleData).digest('hex')}`;
        return computedHash === bundle.hash;
      } catch {
        // As a last resort, do a non-cryptographic check (not secure, but avoids false negatives)
        const hex = Buffer.from(bundleData).toString('hex').slice(0, 64).padEnd(64, '0');
        const computedHash = `0x${hex}`;
        return computedHash === bundle.hash;
      }
    }
  } catch (err) {
    console.error('Error verifying disclosure bundle:', err);
    return false;
  }
}

