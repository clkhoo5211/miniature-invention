// Calldata builders using viem for compliant shielded contract
// Contract interface:
// deposit(address asset, address to, uint256 amount, bytes proofData)
// withdraw(address asset, address to, uint256 amount, bytes proofData, bytes32 disclosureHash)

import { encodeFunctionData, AbiFunction, Address } from 'viem';

// Contract ABI definitions
const DEPOSIT_ABI = {
  name: 'deposit',
  type: 'function',
  stateMutability: 'payable',
  inputs: [
    { name: 'asset', type: 'address' },
    { name: 'to', type: 'address' },
    { name: 'amount', type: 'uint256' },
    { name: 'proofData', type: 'bytes' },
  ],
  outputs: [],
} as const satisfies AbiFunction;

const WITHDRAW_ABI = {
  name: 'withdraw',
  type: 'function',
  stateMutability: 'nonpayable',
  inputs: [
    { name: 'asset', type: 'address' },
    { name: 'to', type: 'address' },
    { name: 'amount', type: 'uint256' },
    { name: 'proofData', type: 'bytes' },
    { name: 'disclosureHash', type: 'bytes32' },
  ],
  outputs: [],
} as const satisfies AbiFunction;

/**
 * Convert asset symbol to contract address
 * For native ETH/MATIC, returns zero address
 * For tokens, should map to actual token contract addresses
 */
function getAssetAddress(assetSymbol: string): Address {
  // For native assets, use zero address
  if (assetSymbol === 'ETH' || assetSymbol === 'MATIC') {
    return '0x0000000000000000000000000000000000000000' as Address;
  }
  
  // For tokens, return zero address as placeholder
  // In production, this should map to actual token addresses
  // Example: if (assetSymbol === 'USDC') return '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' as Address;
  return '0x0000000000000000000000000000000000000000' as Address;
}

/**
 * Build deposit calldata
 */
export function buildDepositCalldata(params: {
  assetSymbol: string;
  to: string;
  amount: bigint;
  proofData: string; // hex
}): string {
  const assetAddress = getAssetAddress(params.assetSymbol);
  const toAddress = params.to as Address;
  
  // Ensure proofData is hex
  let proofDataHex = params.proofData;
  if (!proofDataHex.startsWith('0x')) {
    proofDataHex = `0x${proofDataHex}`;
  }
  
  // Encode function call
  const calldata = encodeFunctionData({
    abi: [DEPOSIT_ABI],
    functionName: 'deposit',
    args: [
      assetAddress,
      toAddress,
      params.amount,
      proofDataHex as `0x${string}`,
    ],
  });
  
  return calldata;
}

/**
 * Build withdraw calldata
 */
export function buildWithdrawCalldata(params: {
  assetSymbol: string;
  to: string;
  amount: bigint;
  proofData: string; // hex
  disclosureHash?: string; // hex
}): string {
  const assetAddress = getAssetAddress(params.assetSymbol);
  const toAddress = params.to as Address;
  
  // Ensure proofData is hex
  let proofDataHex = params.proofData;
  if (!proofDataHex.startsWith('0x')) {
    proofDataHex = `0x${proofDataHex}`;
  }
  
  // Generate disclosure hash if not provided
  // In production, this should come from the disclosure bundle hash
  const disclosureHash = params.disclosureHash || '0x0000000000000000000000000000000000000000000000000000000000000000';
  
  // Ensure disclosureHash is 32 bytes (64 hex chars + 0x)
  let disclosureHashHex = disclosureHash;
  if (!disclosureHashHex.startsWith('0x')) {
    disclosureHashHex = `0x${disclosureHashHex}`;
  }
  // Pad to 66 characters (0x + 64 hex chars)
  if (disclosureHashHex.length < 66) {
    disclosureHashHex = `0x${disclosureHashHex.slice(2).padStart(64, '0')}`;
  }
  
  // Encode function call
  const calldata = encodeFunctionData({
    abi: [WITHDRAW_ABI],
    functionName: 'withdraw',
    args: [
      assetAddress,
      toAddress,
      params.amount,
      proofDataHex as `0x${string}`,
      disclosureHashHex as `0x${string}`,
    ],
  });
  
  return calldata;
}
