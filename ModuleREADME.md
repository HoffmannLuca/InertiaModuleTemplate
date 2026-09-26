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

The web route renders the Inertia component `AaaModuleTemplateZzz/Index`.
Register this component name in the consuming application's Inertia page
resolver. API and web routes can be configured or disabled independently in
`config/aaa_module_template_zzz.php`.

## Frontend installation

```bash
npm install @aaa-organization-zzz/aaa-module-template-zzz-vue
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

Committed migrations are immutable. Add a new migration for every subsequent
schema change instead of modifying an existing migration.
