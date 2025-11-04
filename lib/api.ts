// Wrapper API to adapt app/lib modules to hooks' expected interfaces
// This prevents refactors across existing hooks while aligning with app/lib implementations.

import { getBalance as appGetBalance } from '../app/lib/api';
export { prepareDeposit, prepareWithdraw, signAndSendTransaction, generateDummyProof, screenAddress } from '../app/lib/api';
import { listTxHistory as appListTxHistory, type TxRecord } from '../app/lib/note';

// Map networks to supported assets (MVP)
const NETWORK_ASSETS: Record<string, string[]> = {
  ethereum: ['ETH', 'USDC', 'USDT'],
  polygon: ['MATIC', 'USDC', 'USDT'],
  arbitrum: ['ETH', 'USDC', 'USDT'],
  optimism: ['ETH', 'USDC', 'USDT'],
};

// Identify native asset per network
function getNativeAsset(network: string): string {
  switch (network) {
    case 'polygon':
      return 'MATIC';
    case 'arbitrum':
    case 'optimism':
      return 'ETH';
    case 'ethereum':
    default:
      return 'ETH';
  }
}

// Known token addresses (MVP). Expand as needed.
const TOKEN_ADDRESSES: Record<string, Record<string, string>> = {
  ethereum: {
    USDC: '0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  },
  polygon: {
    USDC: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    USDT: '0xc2132D05D31c914A87C6611C10748AEb04B58e8F',
  },
  // TODO: Add arbitrum and optimism native USDC/USDT addresses in a follow-up
};

const DECIMALS: Record<string, number> = {
  ETH: 18,
  MATIC: 18,
  USDC: 6,
  USDT: 6,
};

function formatUnits(raw: string, decimals: number): number {
  try {
    const bi = BigInt(raw);
    const isNeg = bi < 0n;
    const abs = isNeg ? -bi : bi;
    const s = abs.toString();
    if (decimals === 0) return Number(isNeg ? `-${s}` : s);
    const pad = decimals - s.length;
    let out: string;
    if (pad >= 0) {
      out = `0.${'0'.repeat(pad)}${s}`;
    } else {
      const idx = s.length - decimals;
      out = `${s.slice(0, idx)}.${s.slice(idx)}`;
    }
    return Number(isNeg ? `-${out}` : out);
  } catch {
    return 0;
  }
}

export async function getBalance(address: string, network: string): Promise<{ balances: Record<string, number> } | null> {
  try {
    const assets = NETWORK_ASSETS[network] || [getNativeAsset(network)];
    const native = getNativeAsset(network);
    const balances: Record<string, number> = {};

    // Always fetch native asset balance
    try {
      const valueStr = await appGetBalance(network, address);
      const valueNum = formatUnits(valueStr, DECIMALS[native] ?? 18);
      balances[native] = Number.isNaN(valueNum) ? 0 : valueNum;
    } catch (e) {
      console.error('Native balance fetch error:', e);
      balances[native] = 0;
    }

    // Fetch ERC20 token balances where addresses are known
    const tokenMap = TOKEN_ADDRESSES[network] || {};
    for (const asset of assets) {
      if (asset === native) continue;
      const tokenAddress = tokenMap[asset];
      if (tokenAddress) {
        try {
          const raw = await appGetBalance(network, address, tokenAddress);
          const valueNum = formatUnits(raw, DECIMALS[asset] ?? 18);
          balances[asset] = Number.isNaN(valueNum) ? 0 : valueNum;
        } catch (err) {
          console.error(`Token balance fetch error (${asset} on ${network}):`, err);
          balances[asset] = 0;
        }
      } else {
        // Unknown token address for this network; set 0 but keep key for UI stability
        balances[asset] = balances[asset] ?? 0;
      }
    }

    return { balances };
  } catch (err) {
    console.error('getBalance wrapper error:', err);
    return null;
  }
}

export async function listTxHistory(address: string, network: string): Promise<{ transactions: Array<{ id: string; type: string; amount: number; asset: string; timestamp: string; txHash: string }> }> {
  // app keeps a local history; we filter by network and optionally address if present in records
  try {
    const items: TxRecord[] = appListTxHistory();
    const filtered = items.filter((it) => {
      const matchNetwork = !network || it.network === network;
      const matchAddress = !address || !it.address || it.address === address;
      return matchNetwork && matchAddress;
    });

    // Sort by timestamp descending (newest first)
    filtered.sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp));

    return {
      transactions: filtered.map((it, idx) => ({
        id: it.hash ? it.hash : `${idx}-${it.timestamp}`,
        type: it.type,
        amount: parseFloat(it.amount),
        asset: it.asset,
        timestamp: it.timestamp,
        txHash: it.hash || '',
      })),
    };
  } catch (err) {
    console.error('listTxHistory wrapper error:', err);
    return { transactions: [] };
  }
}
