import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import { mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { createVirtualModule, discoverInertiaModules } from '../src/index.js'

test('discovers module metadata from direct dependencies', async () => {
  const root = await mkdtemp(join(tmpdir(), 'inertia-vite-plugin-'))
  await mkdir(join(root, 'node_modules/@acme/timer'), { recursive: true })
  await mkdir(join(root, 'node_modules/ignored'), { recursive: true })
  await writeFile(join(root, 'package.json'), JSON.stringify({ dependencies: { '@acme/timer': '1.0.0', ignored: '1.0.0' } }))
  await writeFile(join(root, 'node_modules/@acme/timer/package.json'), JSON.stringify({ inertiaModule: { pageExport: './pages' } }))
  await writeFile(join(root, 'node_modules/ignored/package.json'), '{}')

  assert.deepEqual(await discoverInertiaModules(root), [
    { packageName: '@acme/timer', pageExport: './pages' },
  ])
})

test('creates a virtual resolver with collision detection', () => {
  const source = createVirtualModule([
    { packageName: '@acme/timer', pageExport: './pages' },
    { packageName: '@acme/billing', pageExport: './pages' },
  ])

  assert.match(source, /@acme\/timer\/pages/)
  assert.match(source, /Duplicate Inertia module page/)
  assert.match(source, /createInertiaPageResolver/)
})
