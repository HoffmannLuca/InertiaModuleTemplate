# Vite Plugin for Inertia Modules

Discovers installed frontend packages with an `inertiaModule.pageExport`
entry, combines their generated page registries, and automatically adds the
combined resolver to `createInertiaApp()`.

```ts
import inertia from '@inertiajs/vite'
import { inertiaModules } from '@starter-solutions/vite-plugin-inertia-modules'

export default defineConfig({
  plugins: [inertiaModules(), inertia()],
})
```

The host can keep its existing `createInertiaApp({ ... })` call. Local pages in
`./pages` and `./Pages` remain available. Put this plugin before the official
Inertia Vite plugin.

For custom resolvers, disable automatic integration and use the virtual module:

```ts
inertiaModules({ autoResolve: false })

import {
  createInertiaPageResolver,
  modulePages,
  resolveModulePage,
} from 'virtual:inertia-module-pages'
```

Options include `pages`, `modules`, `includeDevDependencies`, `autoResolve`,
`preserveSymlinks`, and `debug`. Symlink preservation is enabled by default for
local npm, workspace, and Composer path development.

Module packages opt in through their `package.json`:

```json
{
  "inertiaModule": { "pageExport": "./pages" },
  "exports": { "./pages": "./dist/pages.js" }
}
```
