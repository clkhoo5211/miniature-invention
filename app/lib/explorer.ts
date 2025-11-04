export function getTxUrl(network: string, hash: string): string | undefined {
  const h = hash || '';
  switch (network) {
    case 'ethereum':
      return `https://etherscan.io/tx/${h}`;
    case 'polygon':
      return `https://polygonscan.com/tx/${h}`;
    case 'arbitrum':
      return `https://arbiscan.io/tx/${h}`;
    case 'optimism':
      return `https://optimistic.etherscan.io/tx/${h}`;
    default:
      return undefined;
  }
}
