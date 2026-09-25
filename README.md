# AaaModuleTemplateZzz

A template repository for a Laravel module with a separately installed,
headless Vue package. The PHP package owns backend behavior, routes, config,
migrations, and translations. The npm package provides Vue composables for
calling those endpoints and can be used from an Inertia application.

## Naming placeholders

Replace the placeholders consistently when creating a module:

| Context | Placeholder |
| --- | --- |
| Composer/package slug | `aaa-module-template-zzz` |
| PHP namespace/classes | `AaaModuleTemplateZzz` |
| Human-readable name | `Aaa Module Template Zzz` |
| Config/database keys | `aaa_module_template_zzz` |
| Environment variables | `AAA_MODULE_TEMPLATE_ZZZ` |
| npm package | `@aaa-module-template-zzz/vue` |

Create a renamed copy in `build/` with:

```bash
./create.sh customer-portal
```

This creates `build/customer-portal` and replaces all occurrences and file
names using `customer-portal`, `customer_portal`, and `CustomerPortal`. Existing
human-readable names become `Customer Portal` and environment-variable prefixes
become `CUSTOMER_PORTAL`. Existing targets are never overwritten. Installed
dependencies, Git metadata, generated
frontend files, and the template's `composer.lock` are not copied. Run
`composer install` in the generated package to create its own valid lock file.

## Backend installation

```bash
composer require aaa-module-template-zzz/aaa-module-template-zzz
php artisan migrate
```

Laravel discovers `AaaModuleTemplateZzzServiceProvider` automatically. The
provider merges the package config, loads routes, migrations and translations,
and exposes optional publish groups:

```bash
php artisan vendor:publish --tag=aaa-module-template-zzz-config
php artisan vendor:publish --tag=aaa-module-template-zzz-migrations
php artisan vendor:publish --tag=aaa-module-template-zzz-translations
```

The package exposes separate API and Inertia web routes by default:

```text
GET /api/aaa-module-template-zzz/status
GET /aaa-module-template-zzz
```

The web route renders the configurable Inertia component
`AaaModuleTemplateZzz/Index`. Register that page name in the consuming app's
Inertia page resolver. Both route stacks can be configured or disabled
independently through `aaa_module_template_zzz.php`.

Package migrations are part of the module's immutable history. Once a
migration is committed, add a new migration for later schema changes instead
of modifying the existing file.

## Frontend installation

The frontend package is independent from Composer and must be published and
installed separately:

```bash
npm install @aaa-module-template-zzz/vue
```

Use the headless composable in any Vue or Inertia Vue component:

```vue
<script setup lang="ts">
import { onMounted } from 'vue'
import { useAaaModuleTemplateZzz } from '@aaa-module-template-zzz/vue'

const { data, error, loading, fetchStatus } = useAaaModuleTemplateZzz()

onMounted(fetchStatus)
</script>

<template>
  <p v-if="loading">Loading…</p>
  <p v-else-if="error">{{ error.message }}</p>
  <p v-else>{{ data?.status }}</p>
</template>
```

To develop or publish the Vue package:

```bash
cd npm/vue
npm install
npm run typecheck
npm test
npm run build
npm publish
```

## Packagist distribution

The root `.gitattributes` marks `npm/`, tests, and repository-only tooling with
`export-ignore`. GitHub/Packagist source archives therefore contain the PHP
runtime package without the separately distributed frontend sources.

## Development

```bash
composer install
composer test
composer lint
```

The PHP test suite uses Pest with Orchestra Testbench.
