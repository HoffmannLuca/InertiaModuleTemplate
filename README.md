# AaaModuleTemplateZzz

A template repository for a Laravel module with a separately installed,
headless Vue package. The PHP package owns backend behavior, routes, config,
migrations, and translations. The npm package provides Vue composables for
calling those endpoints and can be used from an Inertia application.

## Naming placeholders

Replace the placeholders consistently when creating a module:

| Context | Placeholder |
| --- | --- |
| Composer/npm organization | `aaa-organization-zzz` |
| Composer/package slug | `aaa-module-template-zzz` |
| PHP namespace/classes | `AaaModuleTemplateZzz` |
| Human-readable name | `Aaa Module Template Zzz` |
| Config/database keys | `aaa_module_template_zzz` |
| Environment variables | `AAA_MODULE_TEMPLATE_ZZZ` |
| npm package | `@aaa-organization-zzz/aaa-module-template-zzz-vue` |

Create a renamed copy in `build/` with:

```bash
./create.sh customer-portal acme
```

The organization can be passed as the second argument. If omitted, the script
uses `DEFAULT_ORGANISATION` from the environment when available and otherwise
asks for it interactively:

```bash
DEFAULT_ORGANISATION=acme ./create.sh customer-portal
```

It can also be stored locally:

```bash
cp .env.example .env
# Set DEFAULT_ORGANISATION=acme in .env
./create.sh customer-portal
```

The `.env` file is ignored by Git and is never copied into generated modules.
An explicit second argument takes precedence over the process environment,
which takes precedence over `.env`.
The command creates `build/customer-portal`, uses
`acme/customer-portal` for Composer and `@acme/customer-portal-vue` for npm,
and replaces all occurrences and file
names using `customer-portal`, `customer_portal`, and `CustomerPortal`. Existing
human-readable names become `Customer Portal` and environment-variable prefixes
become `CUSTOMER_PORTAL`. Existing targets are never overwritten. The generator
itself, this repository's `README.md`, installed dependencies, Git metadata,
generated frontend files, and the template's `composer.lock` are not copied.
Instead, `ModuleREADME.md` is processed and renamed to `README.md` in the
generated module. The generated directory is initialized as a fresh Git
repository only after interactive confirmation. If confirmed, it uses the
user's configured default branch, falling back to `feature/initial-module`, and
commits all generated files as `Initial commit`. A second prompt controls
whether Composer dependencies and the dependencies in `npm/vue` are installed.
When both options are selected, generated lock-file changes are added to the
initial commit so that the new repository finishes clean. Pressing Enter
accepts the default `yes`; `n` or `no` skips an option.

Organization input is normalized to a lowercase kebab-case scope. For example,
`Acme GmbH` is accepted with a warning and used as `acme-gmbh`.

Before the optional Git and installation steps, the generator asks for a
license. Enter selects the default `1) MIT`; Apache-2.0, GPL-3.0-only, and a
proprietary package are also available. The choice updates `LICENSE.md` and the
Composer/npm package metadata. License templates live in `licenses/`; that
directory itself is not copied into generated modules. Copyright notices use
the selected Organization as their holder.

The generator's PHP helpers live in `create-utils/`. They handle name
transformations, recursive placeholder replacement, file renaming, and license
metadata. This utility directory is not copied into generated modules.

## Backend installation

```bash
composer require aaa-organization-zzz/aaa-module-template-zzz
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
npm install @aaa-organization-zzz/aaa-module-template-zzz-vue
```

Use the headless composable in any Vue or Inertia Vue component:

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
