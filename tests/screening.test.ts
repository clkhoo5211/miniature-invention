import { describe, it, expect } from 'vitest'
import { screenAddress } from '../src/compliance/screening'

describe('screening', () => {
  it('rejects invalid addresses', async () => {
    const res = await screenAddress('not-an-address')
    expect(res.ok).toBe(false)
  })

  it('rejects zero address', async () => {
    const res = await screenAddress('0x0000000000000000000000000000000000000000')
    expect(res.ok).toBe(false)
  })

  it('passes a valid, normal-looking address', async () => {
    const res = await screenAddress('0x000000000000000000000000000000000000dEaD')
    expect(res.ok).toBe(true)
  })
})
