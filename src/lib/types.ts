export type ChainId =
  | 'ethereum'
  | 'polygon'
  | 'arbitrum'
  | 'optimism'
  | 'solana'
  | 'bnb'
  | 'tron';

export interface Asset {
  chainId: ChainId;
  symbol: string;
  decimals: number;
  address?: string; // optional for native assets
}

export interface DisclosureOptions {
  enableSelectiveDisclosure: boolean;
  scope?: string[]; // fields approved for disclosure
  disclosureHash?: string; // hash of the disclosure bundle (bytes32)
}

export interface RelayerQuote {
  relayerId: string;
  fee: string; // formatted string to avoid float precision
  ttlSeconds: number;
}
