# Vite Plugin for Inertia Modules

Discovers installed frontend packages with an `inertiaModule.pageExport`
entry and combines their generated page registries.

```ts
import { inertiaModules } from '@starter-solutions/vite-plugin-inertia-modules'

export default defineConfig({
  plugins: [inertiaModules()],
})
```

The plugin exposes `virtual:inertia-module-pages`, including
`resolveModulePage`, `modulePages`, and `createInertiaPageResolver`.

Module packages opt in through their `package.json`:

```json
{
  "inertiaModule": { "pageExport": "./pages" },
  "exports": { "./pages": "./dist/pages.js" }
}
```
