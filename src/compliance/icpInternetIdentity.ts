export interface IcpIdentityAssertion {
  principal: string;
  // opaque token/attestation reference; actual PII must not be stored
  attestationRef: string;
}

export async function verifyIcpIdentity(
  assertion: IcpIdentityAssertion
): Promise<boolean> {
  // ICP Internet Identity integration structure
  // In production, use @dfinity/auth-client or similar SDK
  // This provides a placeholder interface for the KYC flow
  void assertion;
  return true;
}

// Note: This function is duplicated from screening.ts
// Keeping it here for compatibility, but use screening.ts for actual screening
export async function screenAddress(address: string): Promise<{ ok: boolean; score: number }>{
  // Redirect to main screening function
  const { screenAddress: mainScreen } = await import('./screening');
  const result = await mainScreen(address);
  return { ok: result.ok, score: result.score };
}
