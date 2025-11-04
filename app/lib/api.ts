/**
 * API client for interacting with backend services
 * Since we're using static export, these will be client-side calls
 */

import type { ScreeningResult } from '@/src/compliance/screening';
import type { ProofInput, ZkProof } from '@/src/prover/proof';
import type { DisclosureBundle } from './disclosure';

/**
 * Get RPC URL for a network
 */
export function getRpcUrl(network: string): string {
  const urls: Record<string, string> = {
    // Mainnets (env first, then safe public fallbacks)
    ethereum:
      process.env.NEXT_PUBLIC_ETHEREUM_RPC ||
      'https://rpc.ankr.com/eth',
    polygon:
      process.env.NEXT_PUBLIC_POLYGON_RPC ||
      'https://polygon-rpc.com',
    arbitrum:
      process.env.NEXT_PUBLIC_ARBITRUM_RPC ||
      'https://arb1.arbitrum.io/rpc',
    optimism:
      process.env.NEXT_PUBLIC_OPTIMISM_RPC ||
      'https://mainnet.optimism.io',
    // Testnets
    sepolia:
      process.env.NEXT_PUBLIC_SEPOLIA_RPC ||
      'https://rpc.sepolia.org',
    'polygon-mumbai':
      process.env.NEXT_PUBLIC_POLYGON_MUMBAI_RPC ||
      'https://rpc-mumbai.maticvigil.com',
  };
  return urls[network] || '';
}

/**
 * Screen an address for compliance
 */
export async function screenAddress(address: string): Promise<ScreeningResult> {
  // In a real implementation, this would call a server endpoint
  // For now, we'll use the client-side module
  const { screenAddress: screen } = await import('@/src/compliance/screening');
  return screen(address);
}

/**
 * Generate a dummy ZK proof (MVP placeholder)
 */
export async function generateDummyProof(input: ProofInput): Promise<ZkProof> {
  // For MVP, generate a deterministic dummy proof
  // This will be replaced with real circuit logic later
  return {
    proofData: `0x${Buffer.from(JSON.stringify(input)).toString('hex')}`,
    publicSignals: [
      input.assetSymbol,
      input.amount,
      input.senderAddress,
      input.nonce,
    ],
  };
}

/**
 * Get balance for an address on a network
 */
export async function getBalance(
  network: string,
  address: string,
  assetSymbol?: string
): Promise<string> {
  const rpcUrl = getRpcUrl(network);
  if (!rpcUrl) {
    throw new Error(`No RPC URL configured for ${network}`);
  }

  const { EvmAdapter } = await import('@/src/adapters/evm/EvmAdapter');
  const adapter = new EvmAdapter();
  await adapter.init({ rpcUrl });
  return adapter.getBalance(address, assetSymbol);
}

/**
 * Prepare deposit transaction
 */
export async function prepareDeposit(params: {
  network: string;
  assetSymbol: string;
  amount: string;
  address: string;
  proof: ZkProof;
}): Promise<string> {
  const rpcUrl = getRpcUrl(params.network);
  if (!rpcUrl) {
    throw new Error(`No RPC URL configured for ${params.network}`);
  }

  const { EvmAdapter } = await import('@/src/adapters/evm/EvmAdapter');
  const adapter = new EvmAdapter();
  await adapter.init({ rpcUrl });
  return adapter.deposit({
    assetSymbol: params.assetSymbol,
    amount: params.amount,
    address: params.address,
    proof: params.proof,
  });
}

/**
 * Prepare withdrawal transaction
 */
export async function prepareWithdraw(params: {
  network: string;
  assetSymbol: string;
  amount: string;
  address: string;
  proof: ZkProof;
  disclosure?: DisclosureBundle;
}): Promise<string> {
  const rpcUrl = getRpcUrl(params.network);
  if (!rpcUrl) {
    throw new Error(`No RPC URL configured for ${params.network}`);
  }

  const { EvmAdapter } = await import('@/src/adapters/evm/EvmAdapter');
  const adapter = new EvmAdapter();
  await adapter.init({ rpcUrl });
  return adapter.withdraw({
    assetSymbol: params.assetSymbol,
    amount: params.amount,
    address: params.address,
    proof: params.proof,
    disclosure: params.disclosure,
  });
}

/**
 * Sign and submit a transaction
 * Returns the transaction hash
 */
export async function signAndSendTransaction(params: {
  network: string;
  to: string;
  data: string;
  value?: string;
}): Promise<string> {
  const { sendTransaction } = await import('./wallet');
  
  // Convert value to hex if provided
  let valueHex: string | undefined;
  if (params.value) {
    // Convert from wei (string) to hex
    const valueBigInt = BigInt(params.value);
    valueHex = `0x${valueBigInt.toString(16)}`;
  }

  // Send transaction via MetaMask
  const txHash = await sendTransaction({
    to: params.to,
    data: params.data,
    value: valueHex,
  });

  return txHash;
}

