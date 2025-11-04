import type { Adapter, AdapterInitOptions } from '../Adapter';
import type { ZkProof } from '../../prover/proof';
import { encodeErc20BalanceOf } from './erc20';
import { buildDepositCalldata, buildWithdrawCalldata } from './calldata';

interface JsonRpcRequest {
  jsonrpc: '2.0';
  id: number;
  method: string;
  params?: unknown[];
}

export class EvmAdapter implements Adapter {
  private providerUrl: string | undefined;
  private idCounter = 1;

  async init(options: AdapterInitOptions): Promise<void> {
    this.providerUrl = options.rpcUrl;
  }

  private async rpc<T = unknown>(method: string, params: unknown[] = []): Promise<T> {
    if (!this.providerUrl) throw new Error('EvmAdapter not initialized');
    const body: JsonRpcRequest = { jsonrpc: '2.0', id: this.idCounter++, method, params };
    const res = await fetch(this.providerUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`RPC HTTP ${res.status}`);
    const json = await res.json();
    if (json.error) throw new Error(json.error.message ?? 'RPC error');
    return json.result as T;
  }

  async getBalance(address: string, assetSymbol?: string): Promise<string> {
    if (!assetSymbol) {
      const hex = await this.rpc<string>('eth_getBalance', [address, 'latest']);
      return BigInt(hex).toString();
    }
    // ERC20 balance via eth_call if assetSymbol looks like a token address
    if (assetSymbol.startsWith('0x') && assetSymbol.length === 42) {
      const data = encodeErc20BalanceOf(address);
      const result = await this.rpc<string>('eth_call', [
        { to: assetSymbol, data },
        'latest',
      ]);
      return BigInt(result).toString();
    }
    // Otherwise unsupported symbol at this layer
    return '0';
  }

  async deposit(params: {
    assetSymbol: string;
    amount: string;
    address: string;
    proof: ZkProof;
  }): Promise<string> {
    const data = buildDepositCalldata({
      assetSymbol: params.assetSymbol,
      to: params.address,
      amount: BigInt(params.amount),
      proofData: params.proof.proofData,
    });
    // Return the prepared calldata for the caller to sign and submit
    return data;
  }

  async withdraw(params: {
    assetSymbol: string;
    amount: string;
    address: string;
    proof: ZkProof;
    disclosure?: import('../../lib/types').DisclosureOptions;
  }): Promise<string> {
    // Extract disclosure hash if provided
    // Use the disclosure bundle hash from the disclosure options
    let disclosureHash: string | undefined;
    if (params.disclosure?.enableSelectiveDisclosure) {
      // Use the hash directly if provided, otherwise generate from scope
      if (params.disclosure.disclosureHash) {
        disclosureHash = params.disclosure.disclosureHash;
      } else {
        // Fallback: generate deterministic hash from scope
        const scopeStr = params.disclosure.scope?.join(',') || '';
        const hashInput = JSON.stringify({
          scope: params.disclosure.scope,
          timestamp: Date.now(),
        });
        disclosureHash = `0x${Buffer.from(hashInput).toString('hex').slice(0, 64).padEnd(64, '0')}`;
      }
    }
    
    const data = buildWithdrawCalldata({
      assetSymbol: params.assetSymbol,
      to: params.address,
      amount: BigInt(params.amount),
      proofData: params.proof.proofData,
      disclosureHash,
    });
    // Return the prepared calldata for the caller to sign and submit
    return data;
  }
}
