import { parse } from '@babel/parser'
import MagicString from 'magic-string'
import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { dirname, join, resolve } from 'node:path'

export const virtualModuleId = 'virtual:inertia-module-pages'
const resolvedVirtualModuleId = `\0${virtualModuleId}`
const defaultPages = ['./pages/**/*.vue', './Pages/**/*.vue']

export function inertiaModules(options = {}) {
  let root = process.cwd()
  let discovered = []
  let watchedFiles = []

  async function discover() {
    const result = await discoverInertiaModules(root, options)
    discovered = result.modules
    watchedFiles = result.files
    return discovered
  }

  return {
    name: 'inertia-module-pages',
    enforce: 'pre',
    config() {
      return options.preserveSymlinks === false ? undefined : { resolve: { preserveSymlinks: true } }
    },
    configResolved(config) {
      root = config.root
    },
    async buildStart() {
      await discover()
      for (const file of watchedFiles) this.addWatchFile(file)
      if (options.debug) logDiscovery(this, discovered)
    },
    configureServer(server) {
      server.watcher.add(watchedFiles)
      server.watcher.on('change', async (file) => {
        if (!watchedFiles.includes(file)) return
        await discover()
        server.watcher.add(watchedFiles)
        const virtualModule = server.moduleGraph.getModuleById(resolvedVirtualModuleId)
        if (virtualModule) server.moduleGraph.invalidateModule(virtualModule)
        if (options.debug) logDiscovery(server.config.logger, discovered)
      })
    },
    resolveId(id) {
      if (id === virtualModuleId) return resolvedVirtualModuleId
    },
    async load(id) {
      if (id !== resolvedVirtualModuleId) return
      if (!discovered.length) await discover()
      return createVirtualModule(discovered)
    },
    transform(code, id) {
      if (options.autoResolve === false || !/\.[cm]?[jt]sx?$/.test(id) || !code.includes('createInertiaApp')) return null
      return injectPageResolver(code, id, options.pages ?? defaultPages, this)
    },
  }
}

export async function discoverInertiaModules(root, options = {}) {
  const manifestPath = resolve(root, options.packageJson ?? 'package.json')
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
  const dependencyNames = new Set([
    ...Object.keys(manifest.dependencies ?? {}),
    ...Object.keys(manifest.optionalDependencies ?? {}),
    ...Object.keys(options.includeDevDependencies ? manifest.devDependencies ?? {} : {}),
    ...(options.modules ?? []),
  ])
  const modules = []
  const files = [manifestPath, ...lockfilesFor(dirname(manifestPath))]

  for (const packageName of [...dependencyNames].sort()) {
    const packagePath = await resolvePackageManifest(packageName, manifestPath)
    if (!packagePath) continue
    files.push(packagePath)
    const packageManifest = JSON.parse(await readFile(packagePath, 'utf8'))
    const pageExport = packageManifest.inertiaModule?.pageExport
    if (typeof pageExport !== 'string' || !pageExport.startsWith('./')) continue
    modules.push({ packageName, pageExport, packagePath })
  }

  return { modules, files: [...new Set(files)] }
}

async function resolvePackageManifest(packageName, hostManifest) {
  const direct = join(dirname(hostManifest), 'node_modules', packageName, 'package.json')
  try {
    await readFile(direct, 'utf8')
    return direct
  } catch {}

  const require = createRequire(hostManifest)
  try {
    return require.resolve(`${packageName}/package.json`)
  } catch {}

  try {
    let current = dirname(require.resolve(packageName))
    while (current !== dirname(current)) {
      const candidate = join(current, 'package.json')
      try {
        const manifest = JSON.parse(await readFile(candidate, 'utf8'))
        if (manifest.name === packageName) return candidate
      } catch {}
      current = dirname(current)
    }
  } catch {}

  return null
}

function lockfilesFor(root) {
  return ['package-lock.json', 'pnpm-lock.yaml', 'yarn.lock'].map((file) => join(root, file))
}

export function createVirtualModule(modules) {
  const imports = modules.map(({ packageName, pageExport }, index) =>
    `import { pages as modulePages${index} } from ${JSON.stringify(`${packageName}/${pageExport.slice(2)}`)}`,
  )
  const registrations = modules.map(({ packageName }, index) =>
    `registerPages(${JSON.stringify(packageName)}, modulePages${index})`,
  )

  return `${imports.join('\n')}\n\nconst pages = Object.create(null)\nconst owners = Object.create(null)\n\nfunction registerPages(owner, entries) {\n  for (const [name, loader] of Object.entries(entries)) {\n    if (pages[name]) {\n      throw new Error(\`Duplicate Inertia module page "\${name}" from \${owners[name]} and \${owner}.\`)\n    }\n    pages[name] = loader\n    owners[name] = owner\n  }\n}\n\n${registrations.join('\n')}\n\nexport const modulePages = Object.freeze(pages)\nexport const modulePageOwners = Object.freeze(owners)\n\nexport function resolveModulePage(name) {\n  return pages[name]?.()\n}\n\nexport function createInertiaPageResolver({ fallback }) {\n  return async (name, page) => {\n    const modulePage = resolveModulePage(name)\n    if (modulePage) return modulePage\n    const fallbackPage = await fallback(name, page)\n    if (fallbackPage) return fallbackPage\n    throw pageNotFoundError(name)\n  }\n}\n\nexport function pageNotFoundError(name, hostPages = []) {\n  const available = [...Object.keys(pages), ...hostPages].sort()\n  const details = available.length ? \`\\n\\nAvailable pages:\\n- \${available.join('\\n- ')}\` : '\\n\\nNo module pages were discovered.'\n  return new Error(\`Inertia page not found: \${name}\${details}\`)\n}\n`
}

export function injectPageResolver(code, id, pageGlobs, context = { warn() {} }) {
  let ast
  try {
    ast = parse(code, { sourceType: 'module', plugins: ['typescript', 'jsx', 'decorators-legacy'] })
  } catch {
    return null
  }

  const createNames = new Set()
  for (const statement of ast.program.body) {
    if (statement.type !== 'ImportDeclaration' || statement.source.value !== '@inertiajs/vue3') continue
    for (const specifier of statement.specifiers) {
      if (specifier.type === 'ImportSpecifier' && specifier.imported.name === 'createInertiaApp') createNames.add(specifier.local.name)
    }
  }
  if (!createNames.size) return null

  const calls = []
  walk(ast.program, (node) => {
    if (node.type === 'CallExpression' && node.callee.type === 'Identifier' && createNames.has(node.callee.name)) calls.push(node)
  })
  if (!calls.length) return null

  const output = new MagicString(code)
  let transformed = false
  for (const call of calls) {
    if (!call.arguments.length) {
      const typeEnd = call.typeParameters?.end ?? call.typeArguments?.end
      const opening = code.indexOf('(', typeEnd ?? call.callee.end)
      output.appendLeft(opening + 1, '{ resolve: __resolveInertiaPage }')
      transformed = true
      continue
    }
    const argument = call.arguments[0]
    if (argument.type !== 'ObjectExpression') {
      context.warn(`Cannot automatically add the Inertia module resolver in ${id}: createInertiaApp() must receive an object literal.`)
      continue
    }
    const properties = new Set(argument.properties.map(propertyName))
    if (properties.has('resolve') || properties.has('pages')) {
      context.warn(`Skipped the automatic Inertia module resolver in ${id}: an explicit resolve or pages option already exists.`)
      continue
    }
    output.appendLeft(argument.start + 1, ' resolve: __resolveInertiaPage,')
    transformed = true
  }
  if (!transformed) return null

  const lastImport = [...ast.program.body].reverse().find((node) => node.type === 'ImportDeclaration')
  output.appendLeft(lastImport?.end ?? 0, autoResolverSource(pageGlobs))
  return { code: output.toString(), map: output.generateMap({ hires: true, source: id }) }
}

function autoResolverSource(pageGlobs) {
  const candidates = pageGlobs.map(pageCandidate).filter(Boolean)
  return `\nimport { createInertiaPageResolver as __createInertiaPageResolver, pageNotFoundError as __inertiaPageNotFoundError } from '${virtualModuleId}'\nconst __inertiaHostPages = import.meta.glob(${JSON.stringify(pageGlobs)})\nconst __resolveInertiaPage = __createInertiaPageResolver({\n  fallback: async (name) => {\n    const candidates = ${JSON.stringify(candidates)}.map((pattern) => pattern.replace('__PAGE__', name))\n    const loader = candidates.map((candidate) => __inertiaHostPages[candidate]).find(Boolean)\n    if (!loader) throw __inertiaPageNotFoundError(name, Object.keys(__inertiaHostPages))\n    const loaded = await loader()\n    return loaded.default ?? loaded\n  },\n})\n`
}

function pageCandidate(glob) {
  return glob.replace('/**/*', '/__PAGE__').replace('*.', '.')
}

function propertyName(property) {
  if (property?.type !== 'ObjectProperty' && property?.type !== 'ObjectMethod') return undefined
  if (property.key.type === 'Identifier') return property.key.name
  if (property.key.type === 'StringLiteral') return property.key.value
}

function walk(node, visit) {
  if (!node || typeof node !== 'object') return
  visit(node)
  for (const [key, value] of Object.entries(node)) {
    if (['loc', 'extra', 'errors'].includes(key)) continue
    if (Array.isArray(value)) value.forEach((child) => walk(child, visit))
    else if (value && typeof value === 'object' && typeof value.type === 'string') walk(value, visit)
  }
}

function logDiscovery(logger, modules) {
  const lines = modules.length
    ? modules.map(({ packageName, pageExport }) => `  - ${packageName}/${pageExport.slice(2)}`)
    : ['  (none)']
  const message = `Inertia module page exports:\n${lines.join('\n')}`
  if (typeof logger.info === 'function') logger.info(message)
  else logger.warn(message)
}
