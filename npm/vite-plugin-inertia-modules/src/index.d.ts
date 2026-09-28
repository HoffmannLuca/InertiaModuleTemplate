/// <reference path="./virtual.d.ts" />

import type { Plugin } from 'vite'

export interface InertiaModulesOptions {
  packageJson?: string
  includeDevDependencies?: boolean
  modules?: string[]
}

export declare const virtualModuleId: 'virtual:inertia-module-pages'
export declare function inertiaModules(options?: InertiaModulesOptions): Plugin
