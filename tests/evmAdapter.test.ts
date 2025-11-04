import { describe, it, expect, vi } from 'vitest'
import { EvmAdapter } from '../src/adapters/evm/EvmAdapter'

describe('EvmAdapter', () => {
  it('initializes and returns string balance without RPC (mocked)', async () => {
    const adapter = new EvmAdapter()
    await adapter.init({ rpcUrl: 'http://localhost:8545' })

    // @ts-ignore - access private method for test via cast
    const spy = vi.spyOn(adapter as any, 'rpc').mockResolvedValue('0x0')

    const bal = await adapter.getBalance(
      '0x0000000000000000000000000000000000000000'
    )

    expect(typeof bal).toBe('string')
    expect(spy).toHaveBeenCalled()

    spy.mockRestore()
  })
})
