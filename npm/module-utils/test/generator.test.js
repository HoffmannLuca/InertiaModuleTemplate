import assert from 'node:assert/strict'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { mkdtemp } from 'node:fs/promises'
import { generateModuleFiles } from '../src/generator.js'

test('generates page registrations and backend declarations', async () => {
  const root = await mkdtemp(join(tmpdir(), 'inertia-module-utils-'))
  await mkdir(join(root, 'src/pages/Reports'), { recursive: true })
  await mkdir(join(root, 'php/src/Enums'), { recursive: true })
  await mkdir(join(root, 'php/src/Data'), { recursive: true })
  await writeFile(join(root, 'src/pages/Index.vue'), '<template />')
  await writeFile(join(root, 'src/pages/Reports/Index.vue'), '<template />')
  await writeFile(join(root, 'src/pages/Empty.vue'), '')
  await writeFile(join(root, 'php/src/Enums/Status.php'), "<?php\nenum Status: string\n{\n case Open = 'open';\n case Closed = 'closed';\n}\n")
  await writeFile(join(root, 'php/src/Enums/Test.php'), "<?php\nenum Test: string\n{\n case One = 'one';\n}\n")
  await writeFile(join(root, 'php/src/Data/TimerData.php'), '<?php\nreadonly class TimerData { public function __construct(public int $id, public ?string $label, public Status $status) {} }\n')
  await writeFile(join(root, 'php/src/Data/Test.php'), '<?php\nuse Vendor\\Enums\\Test as EnumsTest;\nreadonly class Test { public function __construct(public string $name, public EnumsTest $value) {} }\n')

  const config = {
    namespace: 'TimeTracker', pagesDir: 'src/pages', pagesFile: 'src/pages.ts',
    phpDir: 'php', phpSources: ['src/Enums', 'src/Data'], backendTypesFile: 'src/generated/backend.ts',
  }
  const result = await generateModuleFiles(config, { cwd: root })
  const pages = await readFile(join(root, 'src/pages.ts'), 'utf8')
  const backend = await readFile(join(root, 'src/generated/backend.ts'), 'utf8')

  assert.deepEqual(result.changed, ['src/pages.ts', 'src/generated/backend.ts'])
  assert.match(pages, /'TimeTracker\/Reports\/Index'/)
  assert.doesNotMatch(pages, /TimeTracker\/Empty/)
  assert.match(backend, /export const StatusEnum/)
  assert.match(backend, /label: string \| null/)
  assert.match(backend, /status: StatusEnum/)
  assert.match(backend, /export const TestEnum/)
  assert.match(backend, /export interface Test \{/)
  assert.match(backend, /value: TestEnum/)
  assert.equal((await generateModuleFiles(config, { cwd: root, check: true })).checkFailed, false)
})
