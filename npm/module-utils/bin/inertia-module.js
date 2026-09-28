#!/usr/bin/env node

import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { generateModuleFiles } from '../src/generator.js'

const args = process.argv.slice(2)
const command = args.find((argument) => !argument.startsWith('-')) ?? 'generate'

if (command !== 'generate') {
  console.error(`Unknown command: ${command}`)
  process.exitCode = 1
} else {
  const configArgument = args.find((argument) => argument.startsWith('--config='))
  const configPath = resolve(configArgument?.slice('--config='.length) ?? 'inertia-module.config.mjs')

  try {
    const imported = await import(pathToFileURL(configPath).href)
    const result = await generateModuleFiles(imported.default, {
      cwd: process.cwd(),
      check: args.includes('--check'),
    })

    for (const file of result.files) {
      const status = result.changed.includes(file)
        ? (args.includes('--check') ? 'outdated' : 'generated')
        : 'up-to-date'

      console.log(`${status} ${file}`)
    }

    if (result.checkFailed) {
      console.error('Generated module files are out of date.')
      process.exitCode = 1
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 1
  }
}
