/*--------------------------------------------------------------------------

Tasksmith

The MIT License (MIT)

Copyright (c) 2025 Haydn Paterson (sinclair) 

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

---------------------------------------------------------------------------*/

// deno-fmt-ignore-file
// deno-lint-ignore-file

import { BuildOptions } from '../options.ts'
import { folder } from '../../folder/index.ts'
import { file } from '../../file/index.ts'
import { Folder } from './folder.ts'

// ------------------------------------------------------------------
// Package: Type
// ------------------------------------------------------------------
export function buildType() {
  return { type: 'commonjs' }
}
// ------------------------------------------------------------------
// Package: Entry + Exports Section
//
// Note: In Dual builds, we use inline types on exports as well as
// typeVersions. Technically, we only need the inline versions but
// there are environments (TSP) that can have trouble resolving
// sub module types without specific configuration. The goal is
// to provide package.json as many configurations as possible.
//
// ------------------------------------------------------------------
export type PackageEntryAndExports = {
  types: string,
  main:string,
  module: string,
  exports: Record<string, {
    import: {
      types: string,
      default: string
    },
    require: {
      types: string,
      default: string
    }
  }>
}
async function buildExports(baseUri: string): Promise<PackageEntryAndExports> {
  const exports: Record<string, {
    import: {
      types: string,
      default: string
    },
    require: {
      types: string,
      default: string
    }
  }> = {}
  for (const filePath of await folder(baseUri).indexList()) {
    const isRoot = filePath === 'index.ts'
    const submoduleSection = isRoot ? '.' : `./${filePath.replace(/\/index\.ts$/, '')}`
    const submoduleBase = isRoot ? '' : filePath.replace(/\/index\.ts$/, '')

    const esmDir = submoduleBase ? `./${Folder}/esm/${submoduleBase}` : `./${Folder}/esm`
    const cjsDir = submoduleBase ? `./${Folder}/cjs/${submoduleBase}` : `./${Folder}/cjs`
    exports[submoduleSection] = {
      require: {
        types: `${cjsDir}/index.d.ts`,
        default: `${cjsDir}/index.js`
      },
      import: {
        types: `${esmDir}/index.d.mts`,
        default: `${esmDir}/index.mjs`
      }
    }
  }
  return {
    types: `./${Folder}/cjs/index.d.ts`,   // Top-level declaration file for CommonJS
    main: `./${Folder}/cjs/index.js`,      // CommonJS entry
    module: `./${Folder}/esm/index.mjs`,   // ESM entry
    exports                                // Subpath exports
  }
}
// ------------------------------------------------------------------
// Package: Type Versions Section
// ------------------------------------------------------------------
export interface PackageTypeVersions {
  typesVersions: {
    "*": Record<string, string[]>
  }
}
export async function buildTypeVersions(baseUrl: string): Promise<PackageTypeVersions> {
  const typeVersions: Record<string, string[]> = {}
  for (const filePath of await folder(baseUrl).indexList()) {
    const isRoot = filePath === 'index.ts'
    const submodulePath = isRoot ? '.' : filePath.replace(/\/index\.ts$/, '')
    const definitionPath = submodulePath === '.'
      ? `./${Folder}/esm/index.d.mts`
      : `./${Folder}/esm/${submodulePath}/index.d.mts`
    typeVersions[submodulePath] = [definitionPath]
  }
  return {
    typesVersions: {
      '*': typeVersions,
    },
  }
}
/** Builds and writes the package.json file */
export async function buildPackageJson(baseUrl: string, options: BuildOptions): Promise<void> {
  console.log('build-dual: package-json')
  const packageJsonPath = `${options.outdir}/package.json`
  const packageType = buildType()
  const packageExports = await buildExports(baseUrl)
  const packageTypeVersions = await buildTypeVersions(baseUrl)
  const packageJsonContent = JSON.stringify({
    ...options.packageJson,
    ...packageType, 
    ...packageExports,
    ...packageTypeVersions
  }, null, 2)
  await file(packageJsonPath).create(packageJsonContent)
}