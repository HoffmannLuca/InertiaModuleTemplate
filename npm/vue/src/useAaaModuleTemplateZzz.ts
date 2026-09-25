import { readonly, ref } from 'vue'
import type { ModuleClientOptions, ModuleResponse, ModuleStatus } from './types'

export function useAaaModuleTemplateZzz(options: ModuleClientOptions = {}) {
  const data = ref<ModuleStatus | null>(null)
  const error = ref<Error | null>(null)
  const loading = ref(false)

  const baseUrl = (options.baseUrl ?? '/api/aaa-module-template-zzz').replace(/\/$/, '')
  const request = options.fetch ?? globalThis.fetch

  async function fetchStatus(): Promise<ModuleStatus> {
    loading.value = true
    error.value = null

    try {
      const response = await request(`${baseUrl}/status`, {
        headers: {
          Accept: 'application/json',
          ...options.headers,
        },
      })

      if (!response.ok) {
        throw new Error(`Module request failed with HTTP ${response.status}`)
      }

      const payload = (await response.json()) as ModuleResponse<ModuleStatus>
      data.value = payload.data

      return payload.data
    } catch (cause) {
      error.value = cause instanceof Error ? cause : new Error(String(cause))
      throw error.value
    } finally {
      loading.value = false
    }
  }

  return {
    data: readonly(data),
    error: readonly(error),
    loading: readonly(loading),
    fetchStatus,
  }
}

