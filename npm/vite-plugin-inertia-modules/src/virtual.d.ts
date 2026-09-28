declare module 'virtual:inertia-module-pages' {
  import type { DefineComponent } from 'vue'

  export type InertiaModulePage = DefineComponent | { default: DefineComponent }
  export type PageLoader = () => Promise<InertiaModulePage>
  export const modulePages: Readonly<Record<string, PageLoader>>
  export function resolveModulePage(name: string): ReturnType<PageLoader> | undefined
  export function createInertiaPageResolver(options: {
    fallback: (name: string) => InertiaModulePage | Promise<InertiaModulePage>
  }): (name: string) => InertiaModulePage | Promise<InertiaModulePage>
}
