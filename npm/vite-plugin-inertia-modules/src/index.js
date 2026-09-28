import { readFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'

export const virtualModuleId = 'virtual:inertia-module-pages'
const resolvedVirtualModuleId = `\0${virtualModuleId}`

export function inertiaModules(options = {}) {
  let root = process.cwd()

  return {
    name: 'inertia-module-pages',
    enforce: 'pre',
    configResolved(config) {
      root = config.root
    },
    resolveId(id) {
      if (id === virtualModuleId) return resolvedVirtualModuleId
    },
    async load(id) {
      if (id !== resolvedVirtualModuleId) return
      const modules = await discoverInertiaModules(root, options)
      return createVirtualModule(modules)
    },
  }
}

export async function discoverInertiaModules(root, options = {}) {
  const manifestPath = resolve(root, options.packageJson ?? 'package.json')
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
  const dependencyNames = new Set([
    ...Object.keys(manifest.dependencies ?? {}),
    ...Object.keys(options.includeDevDependencies ? manifest.devDependencies ?? {} : {}),
    ...(options.modules ?? []),
  ])
  const modules = []

  for (const packageName of [...dependencyNames].sort()) {
    const packagePath = join(dirname(manifestPath), 'node_modules', packageName, 'package.json')
    let packageManifest
    try {
      packageManifest = JSON.parse(await readFile(packagePath, 'utf8'))
    } catch (error) {
      if (error?.code === 'ENOENT') continue
      throw error
    }
    const pageExport = packageManifest.inertiaModule?.pageExport
    if (typeof pageExport !== 'string' || !pageExport.startsWith('./')) continue
    modules.push({ packageName, pageExport })
  }

  return modules
}

export function createVirtualModule(modules) {
  const imports = modules.map(({ packageName, pageExport }, index) =>
    `import { pages as modulePages${index} } from ${JSON.stringify(`${packageName}/${pageExport.slice(2)}`)}`,
  )
  const registrations = modules.map(({ packageName }, index) =>
    `registerPages(${JSON.stringify(packageName)}, modulePages${index})`,
  )

  return `${imports.join('\n')}\n\nconst pages = Object.create(null)\nconst owners = Object.create(null)\n\nfunction registerPages(owner, entries) {\n  for (const [name, loader] of Object.entries(entries)) {\n    if (pages[name]) {\n      throw new Error(\`Duplicate Inertia module page "\${name}" from \${owners[name]} and \${owner}.\`)\n    }\n    pages[name] = loader\n    owners[name] = owner\n  }\n}\n\n${registrations.join('\n')}\n\nexport const modulePages = Object.freeze(pages)\n\nexport function resolveModulePage(name) {\n  return pages[name]?.()\n}\n\nexport function createInertiaPageResolver({ fallback }) {\n  return (name) => resolveModulePage(name) ?? fallback(name)\n}\n`
}
