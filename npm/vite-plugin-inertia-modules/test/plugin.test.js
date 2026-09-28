import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import { mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { createVirtualModule, discoverInertiaModules, injectPageResolver, inertiaModules } from '../src/index.js'

test('discovers module metadata from optional dependencies', async () => {
  const root = await fixtureRoot()
  const result = await discoverInertiaModules(root)

  assert.deepEqual(result.modules.map(({ packageName, pageExport }) => ({ packageName, pageExport })), [
    { packageName: '@acme/timer', pageExport: './pages' },
  ])
  assert.ok(result.files.some((file) => file.endsWith('@acme/timer/package.json')))
})

test('injects an automatic resolver while preserving existing options', () => {
  const result = injectPageResolver(
    `import { createInertiaApp as boot } from '@inertiajs/vue3'; boot({ title: value => value })`,
    '/app/resources/js/app.ts',
    ['./pages/**/*.vue'],
  )

  assert.match(result.code, /resolve: __resolveInertiaPage/)
  assert.match(result.code, /virtual:inertia-module-pages/)
  assert.match(result.code, /import\.meta\.glob/)
})

test('keeps an explicit resolver as an escape hatch', () => {
  const warnings = []
  const result = injectPageResolver(
    `import { createInertiaApp } from '@inertiajs/vue3'; createInertiaApp({ resolve: custom })`,
    '/app/resources/js/app.ts',
    ['./pages/**/*.vue'],
    { warn: (warning) => warnings.push(warning) },
  )

  assert.equal(result, null)
  assert.equal(warnings.length, 1)
})

test('creates a virtual resolver with collision detection and diagnostics', () => {
  const source = createVirtualModule([
    { packageName: '@acme/timer', pageExport: './pages' },
    { packageName: '@acme/billing', pageExport: './pages' },
  ])

  assert.match(source, /@acme\/timer\/pages/)
  assert.match(source, /Duplicate Inertia module page/)
  assert.match(source, /Available pages/)
})

test('builds module pages for client and SSR with Vite', async () => {
  const { build } = await import('vite')
  const root = await fixtureRoot()
  const alias = join(root, 'fake-inertia.js')
  const entry = join(root, 'app.js')
  await mkdir(join(root, 'pages'), { recursive: true })
  await writeFile(alias, 'export function createInertiaApp(options) { return options }')
  await writeFile(join(root, 'pages/Home.js'), 'export default {}')
  await writeFile(entry, `import { createInertiaApp } from '@inertiajs/vue3'; export default createInertiaApp()`)

  const base = {
    root,
    logLevel: 'silent',
    plugins: [inertiaModules({ pages: ['./pages/**/*.js'] })],
    resolve: { alias: { '@inertiajs/vue3': alias } },
  }

  await build({ ...base, build: { write: false, rollupOptions: { input: entry } } })
  await build({ ...base, build: { write: false, ssr: entry } })
})

async function fixtureRoot() {
  const root = await mkdtemp(join(tmpdir(), 'inertia-vite-plugin-'))
  const moduleRoot = join(root, 'node_modules/@acme/timer')
  await mkdir(moduleRoot, { recursive: true })
  await writeFile(join(root, 'package.json'), JSON.stringify({
    type: 'module',
    optionalDependencies: { '@acme/timer': '1.0.0' },
  }))
  await writeFile(join(moduleRoot, 'package.json'), JSON.stringify({
    name: '@acme/timer',
    version: '1.0.0',
    type: 'module',
    exports: { '.': './index.js', './pages': './pages.js' },
    inertiaModule: { pageExport: './pages' },
  }))
  await writeFile(join(moduleRoot, 'index.js'), 'export {}')
  await writeFile(join(moduleRoot, 'pages.js'), `export const pages = { 'Timer/Index': () => import('./TimerIndex.js') }`)
  await writeFile(join(moduleRoot, 'TimerIndex.js'), 'export default {}')
  return root
}
