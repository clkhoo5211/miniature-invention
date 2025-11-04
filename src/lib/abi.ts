// Minimal placeholders for ABI encoding without external deps
export function encodeFunction(selector: string, argsEncoded: string[]): string {
  return selector + argsEncoded.join('');
}

export function pad32(hexNoPrefix: string): string {
  return hexNoPrefix.padStart(64, '0');
}

export function toHexNoPrefix(value: bigint | number | string): string {
  if (typeof value === 'bigint') return value.toString(16);
  if (typeof value === 'number') return BigInt(value).toString(16);
  const v = value.toLowerCase();
  return v.startsWith('0x') ? v.slice(2) : v;
}
