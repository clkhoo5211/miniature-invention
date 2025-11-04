/**
 * Relayer marketplace utilities
 * Manages allowlisted relayers, quotes, and selection
 */

import type { RelayerQuote } from '@/src/lib/types';

export interface Relayer {
  id: string;
  name: string;
  address: string; // Relayer wallet address
  fee: string; // Fee in wei (string to avoid precision issues)
  feeFormatted: string; // Human-readable fee (e.g., "0.001 ETH")
  sla: string; // Service level agreement (e.g., "99.9%")
  riskBadge: 'Low Risk' | 'Medium Risk' | 'High Risk';
  status: 'Active' | 'Inactive';
  network: string; // Supported network
  ttlSeconds: number; // Quote time-to-live
}

/**
 * Get allowlisted relayers (stored in localStorage)
 */
export function getAllowlistedRelayers(): Relayer[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem('allowlistedRelayers');
    if (!stored) {
      // Return default relayers if none stored
      return getDefaultRelayers();
    }
    return JSON.parse(stored) as Relayer[];
  } catch (error) {
    console.error('Error retrieving relayers:', error);
    return getDefaultRelayers();
  }
}

/**
 * Get default relayers (for MVP)
 */
function getDefaultRelayers(): Relayer[] {
  return [
    {
      id: '1',
      name: 'Relayer Alpha',
      address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      fee: '1000000000000000', // 0.001 ETH in wei
      feeFormatted: '0.001 ETH',
      sla: '99.9%',
      riskBadge: 'Low Risk',
      status: 'Active',
      network: 'ethereum',
      ttlSeconds: 300, // 5 minutes
    },
    {
      id: '2',
      name: 'Relayer Beta',
      address: '0x8ba1f109551bD432803012645Hac136c22C9299',
      fee: '800000000000000', // 0.0008 ETH in wei
      feeFormatted: '0.0008 ETH',
      sla: '99.5%',
      riskBadge: 'Low Risk',
      status: 'Active',
      network: 'ethereum',
      ttlSeconds: 300,
    },
  ];
}

/**
 * Store allowlisted relayers
 */
export function storeRelayers(relayers: Relayer[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('allowlistedRelayers', JSON.stringify(relayers));
  } catch (error) {
    console.error('Error storing relayers:', error);
  }
}

/**
 * Add a new relayer to the allowlist
 */
export function addRelayer(relayer: Relayer): void {
  const relayers = getAllowlistedRelayers();
  // Check if relayer already exists
  if (relayers.find(r => r.id === relayer.id || r.address.toLowerCase() === relayer.address.toLowerCase())) {
    throw new Error('Relayer already exists');
  }
  relayers.push(relayer);
  storeRelayers(relayers);
}

/**
 * Remove a relayer from the allowlist
 */
export function removeRelayer(relayerId: string): void {
  const relayers = getAllowlistedRelayers();
  const filtered = relayers.filter(r => r.id !== relayerId);
  storeRelayers(filtered);
}

/**
 * Get a quote from a relayer
 */
export async function getRelayerQuote(
  relayerId: string,
  network: string,
  amount: string
): Promise<RelayerQuote | null> {
  const relayers = getAllowlistedRelayers();
  const relayer = relayers.find(r => r.id === relayerId && r.network === network);
  
  if (!relayer || relayer.status !== 'Active') {
    return null;
  }
  
  // Calculate fee based on amount (example: 0.1% of amount)
  const amountBigInt = BigInt(amount);
  const feePercentage = BigInt(1); // 0.1% = 1/1000
  const calculatedFee = (amountBigInt * feePercentage) / BigInt(1000);
  
  // Use relayer's base fee or calculated fee, whichever is higher
  const relayerBaseFee = BigInt(relayer.fee);
  const finalFee = calculatedFee > relayerBaseFee ? calculatedFee : relayerBaseFee;
  
  return {
    relayerId: relayer.id,
    fee: finalFee.toString(),
    ttlSeconds: relayer.ttlSeconds,
  };
}

/**
 * Get all active relayers for a network
 */
export function getActiveRelayers(network: string): Relayer[] {
  const relayers = getAllowlistedRelayers();
  return relayers.filter(r => r.network === network && r.status === 'Active');
}

/**
 * Update relayer status
 */
export function updateRelayerStatus(relayerId: string, status: 'Active' | 'Inactive'): void {
  const relayers = getAllowlistedRelayers();
  const relayer = relayers.find(r => r.id === relayerId);
  if (relayer) {
    relayer.status = status;
    storeRelayers(relayers);
  }
}

