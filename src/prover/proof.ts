export interface ProofInput {
  assetSymbol: string;
  amount: string; // bigint as string
  senderAddress: string;
  nonce: string;
}

export interface ZkProof {
  proofData: string; // base64 or hex
  publicSignals: string[];
}

export interface Prover {
  generateProof(input: ProofInput): Promise<ZkProof>;
  verifyProof(proof: ZkProof): Promise<boolean>;
}
