export interface ModuleStatus {
  name: string
  status: string
}

export interface ModuleResponse<T> {
  data: T
}

export interface ModuleClientOptions {
  baseUrl?: string
  fetch?: typeof globalThis.fetch
  headers?: HeadersInit
}

