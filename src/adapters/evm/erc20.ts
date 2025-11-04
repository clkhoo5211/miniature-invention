// Minimal ABI encoding for ERC-20 balanceOf(address)
// selector 0x70a08231 + 32-byte left-padded address

function leftPad32(hexNoPrefix: string): string {
  return hexNoPrefix.padStart(64, '0');
}

export function encodeErc20BalanceOf(address: string): string {
  const selector = '0x70a08231';
  const addr = address.toLowerCase().replace(/^0x/, '');
  const padded = leftPad32(addr);
  return selector + padded;
}
