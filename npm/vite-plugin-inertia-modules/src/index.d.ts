/// <reference path="./virtual.d.ts" />

import type { Plugin } from 'vite'

export interface InertiaModulesOptions {
  packageJson?: string
  includeDevDependencies?: boolean
  modules?: string[]
  pages?: string[]
  autoResolve?: boolean
  preserveSymlinks?: boolean
  debug?: boolean
}

export declare const virtualModuleId: 'virtual:inertia-module-pages'
export declare function inertiaModules(options?: InertiaModulesOptions): Plugin
