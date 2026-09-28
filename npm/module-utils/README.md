# Inertia Module Utils

Generates an Inertia page registry and TypeScript declarations from the Vue
pages, PHP backed enums, and constructor-promoted PHP data objects in a Laravel
module.

```bash
npx inertia-module generate
npx inertia-module generate --check
```

Configuration is loaded from `inertia-module.config.mjs` by default. Use
`--config=path/to/config.mjs` to select another file.

```js
export default {
  namespace: 'TimeTracker',
  pagesDir: 'src/pages',
  pagesFile: 'src/pages.ts',
  phpDir: '../..',
  phpSources: ['src/Enums', 'src/Data'],
  backendTypesFile: 'src/generated/backend.ts',
  enumSuffix: 'Enum',
}
```

Backed PHP enums receive the configurable `Enum` suffix by default. For
example, PHP `Status` becomes the TypeScript value and type `StatusEnum`. DTO
properties referencing that enum are rewritten to `StatusEnum` as well.
