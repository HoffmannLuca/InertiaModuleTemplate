# Aaa Module Template Zzz

Laravel module package with Inertia web routes, JSON API routes, and a
separately distributed headless Vue package.

## Backend installation

```bash
composer require aaa-organization-zzz/aaa-module-template-zzz
php artisan migrate
```

Laravel discovers `AaaModuleTemplateZzzServiceProvider` automatically. The
service provider loads the module config, routes, migrations, and translations.

Optional resources can be published with:

```bash
php artisan vendor:publish --tag=aaa-module-template-zzz-config
php artisan vendor:publish --tag=aaa-module-template-zzz-migrations
php artisan vendor:publish --tag=aaa-module-template-zzz-translations
```

The default routes are:

```text
GET /api/aaa-module-template-zzz/status
GET /aaa-module-template-zzz
```

The web route renders the Inertia component `AaaModuleTemplateZzz/Index`. The
frontend package exposes this page through its generated `./pages` export,
which can be discovered by
`@starter-solutions/vite-plugin-inertia-modules`. API and web routes can be
configured or disabled independently in `config/aaa_module_template_zzz.php`.

## Frontend installation

The frontend package is distributed as ESM-only.

```bash
npm install @aaa-organization-zzz/aaa-module-template-zzz-vue
```

The bundled pages use `@starter-solutions/vue-ui`. Install it in the consuming
application and import its stylesheet once in the application CSS entry:

```css
@import '@starter-solutions/vue-ui/styles.css';
```

Use the headless composable from a Vue or Inertia Vue component:

```vue
<script setup lang="ts">
import { onMounted } from 'vue'
import { useAaaModuleTemplateZzz } from '@aaa-organization-zzz/aaa-module-template-zzz-vue'

const { data, error, loading, fetchStatus } = useAaaModuleTemplateZzz()

onMounted(fetchStatus)
</script>

<template>
  <p v-if="loading">Loading…</p>
  <p v-else-if="error">{{ error.message }}</p>
  <p v-else>{{ data?.status }}</p>
</template>
```

## Development

```bash
composer install
composer test
composer lint

cd npm/vue
npm install
npm run typecheck
npm test
npm run build
```

Vue files below `src/pages` are registered automatically. Regenerate the page
registry and backend TypeScript declarations after adding pages, PHP backed
enums, or constructor-promoted data objects:

```bash
npm run generate
npm run generate:check
```

Generated PHP declarations can be imported from the package's `./backend`
subpath, while the generated page registry is exposed through `./pages`.

Committed migrations are immutable. Add a new migration for every subsequent
schema change instead of modifying an existing migration.
