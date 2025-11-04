/**
 * Centralized constants for storage keys and defaults
 */

export const STORAGE_KEYS = {
  NOTE_VAULT: 'compliant-note-vault',
  TX_HISTORY: 'compliant-tx-history',
  DISCLOSURE_BUNDLES: 'disclosureBundles',
} as const;

export const DEFAULTS = {
  TX_RECEIPT_MAX_WAIT_MS: 60_000,
} as const;