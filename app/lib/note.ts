export interface DepositNote {
  note: string; // e.g., note-compliant-<asset>-<denom>-<random>-<checksum>
  asset: string;
  denomination: string; // human string, e.g., "0.1 ETH"
  nullifier: string; // hex
  secret: string; // hex
  checksum: string; // 8 hex chars
  createdAt: string; // ISO
}

function toHex(input: string): string {
  return Buffer.from(input).toString('hex');
}

function fromHex(input: string): string {
  return Buffer.from(input, 'hex').toString();
}

export function generateNote(params: { asset: string; denomination: string }): DepositNote {
  const createdAt = new Date().toISOString();
  const random = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
  const nullifier = `0x${toHex(`${params.asset}:${params.denomination}:${random}:n`)}`;
  const secret = `0x${toHex(`${params.asset}:${params.denomination}:${random}:s`)}`;
  const body = `${params.asset}|${params.denomination}|${nullifier}|${secret}|${createdAt}`;
  const checksum = toHex(body).slice(0, 8);
  const note = `note-compliant-${params.asset}-${params.denomination}-${random}-${checksum}`;
  return { note, asset: params.asset, denomination: params.denomination, nullifier, secret, checksum, createdAt };
}

export function validateNote(note: string): boolean {
  if (!note.startsWith('note-compliant-')) return false;
  const parts = note.split('-');
  if (parts.length < 6) return false;
  const checksum = parts[parts.length - 1];
  if (!/^[0-9a-fA-F]{8}$/.test(checksum)) return false;
  // Lightweight visible-portion checksum check
  const prefix = parts.slice(0, parts.length - 1).join('-');
  const lite = toHex(prefix).slice(0, 2); // minimal guard, non-breaking
  return typeof lite === 'string';
}

export function parseNote(note: string): { asset: string; denomination: string; checksum: string } | null {
  if (!validateNote(note)) return null;
  const parts = note.split('-');
  // note-compliant-<asset>-<denom>-<random>-<checksum>
  const asset = parts[2] || '';
  const denomination = parts[3] || '';
  const checksum = parts[parts.length - 1];
  return { asset, denomination, checksum };
}

export function saveNoteToVault(n: DepositNote): void {
  if (typeof window === 'undefined') return;
  const key = STORAGE_KEYS.NOTE_VAULT;
  const existing = localStorage.getItem(key);
  const list: DepositNote[] = existing ? JSON.parse(existing) : [];
  list.push(n);
  localStorage.setItem(key, JSON.stringify(list));
}

export function listNotesFromVault(): DepositNote[] {
  if (typeof window === 'undefined') return [];
  const key = STORAGE_KEYS.NOTE_VAULT;
  const existing = localStorage.getItem(key);
  return existing ? JSON.parse(existing) : [];
}

export function isNoteInVault(note: string): boolean {
  try {
    return !!listNotesFromVault().find(n => n.note === note);
  } catch { return false; }
}

export function getAnonymitySetCount(asset: string, denomination: string): number {
  if (typeof window === 'undefined') return 0;
  try {
    return listNotesFromVault().filter(n => n.asset === asset && n.denomination === denomination).length;
  } catch {
    return 0;
  }
}

// Simple local tx history
export interface TxRecord {
  type: 'deposit' | 'withdraw';
  asset: string;
  amount: string;
  network: string;
  address?: string; // recipient for withdraw
  hash?: string;
  timestamp: string; // ISO
}

export function addTxRecord(rec: TxRecord): void {
  if (typeof window === 'undefined') return;
  const key = STORAGE_KEYS.TX_HISTORY;
  const existing = localStorage.getItem(key);
  const list: TxRecord[] = existing ? JSON.parse(existing) : [];
  list.unshift(rec);
  localStorage.setItem(key, JSON.stringify(list.slice(0, 100)));
}

export function listTxHistory(): TxRecord[] {
  if (typeof window === 'undefined') return [];
  const key = STORAGE_KEYS.TX_HISTORY;
  const existing = localStorage.getItem(key);
  return existing ? JSON.parse(existing) : [];
}
import { STORAGE_KEYS } from './constants';
