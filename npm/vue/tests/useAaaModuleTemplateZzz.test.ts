import { describe, expect, it, vi } from 'vitest'
import { useAaaModuleTemplateZzz } from '../src'

describe('useAaaModuleTemplateZzz', () => {
  it('loads the module status', async () => {
    const request = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ data: { name: 'aaa-module-template-zzz', status: 'ok' } })),
    )

    const module = useAaaModuleTemplateZzz({ fetch: request })

    await expect(module.fetchStatus()).resolves.toEqual({
      name: 'aaa-module-template-zzz',
      status: 'ok',
    })
    expect(module.data.value?.status).toBe('ok')
    expect(module.loading.value).toBe(false)
  })
})

