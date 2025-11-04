import { describe, it, expect } from 'vitest'
import { buildDepositCalldata, buildWithdrawCalldata } from '../src/adapters/evm/calldata'

// Simple helper to check hex string
function isHex(s: string): boolean {
  return typeof s === 'string' && s.startsWith('0x') && s.length % 2 === 0
}

describe('EVM calldata builders', () => {
  it('buildDepositCalldata returns valid hex calldata', () => {
    const calldata = buildDepositCalldata({
      assetSymbol: 'ETH',
      to: '0x000000000000000000000000000000000000dEaD',
      amount: 1234567890123456789n,
      proofData: '0x1234abcd',
    })

    expect(isHex(calldata)).toBe(true)
    expect(calldata.length).toBeGreaterThan(10)
  })

  it('buildWithdrawCalldata returns valid hex calldata with disclosureHash', () => {
    const calldata = buildWithdrawCalldata({
      assetSymbol: 'ETH',
      to: '0x0000000000000000000000000000000000000001',
      amount: 1000000000000000000n,
      proofData: '0xdeadbeef',
      disclosureHash:
        '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    })

    expect(isHex(calldata)).toBe(true)
    expect(calldata.length).toBeGreaterThan(10)
  })
})
