import type { DisclosureOptions } from '../lib/types';
import type { ZkProof } from '../prover/proof';

export interface AdapterInitOptions {
  rpcUrl?: string;
}

export interface Adapter {
  init(options: AdapterInitOptions): Promise<void>;
  getBalance(address: string, assetSymbol?: string): Promise<string>; // returns stringified bigint
  deposit(params: {
    assetSymbol: string;
    amount: string;
    address: string;
    proof: ZkProof;
  }): Promise<string>; // tx id/hash
  withdraw(params: {
    assetSymbol: string;
    amount: string;
    address: string;
    proof: ZkProof;
    disclosure?: DisclosureOptions;
  }): Promise<string>; // tx id/hash
}
