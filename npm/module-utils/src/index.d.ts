export interface ModuleResponse<T> {
  data: T
}

export interface ModuleClientOptions {
  baseUrl?: string
  fetch?: typeof globalThis.fetch
  headers?: HeadersInit
}

export interface InertiaModuleGeneratorConfig {
  namespace: string
  pagesDir: string
  pagesFile: string
  phpDir: string
  phpSources: string[]
  backendTypesFile: string
  enumSuffix?: string
}

export interface GenerateModuleOptions {
  cwd?: string
  check?: boolean
}

export interface GenerateModuleResult {
  files: string[]
  changed: string[]
  checkFailed: boolean
}

export declare function generatePages(
  config: InertiaModuleGeneratorConfig,
  cwd?: string,
): Promise<string>

export declare function generateBackendTypes(
  config: InertiaModuleGeneratorConfig,
  cwd?: string,
): Promise<string>

export declare function generateModuleFiles(
  config: InertiaModuleGeneratorConfig,
  options?: GenerateModuleOptions,
): Promise<GenerateModuleResult>
