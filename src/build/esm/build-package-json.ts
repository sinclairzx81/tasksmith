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
// Package: Entry + Exports Section
// ------------------------------------------------------------------
export type PackageEntryAndExports = {
  types: string,
  module: string,
  exports: Record<string, {
  import: string
}>
}
async function buildPackageExports(baseUri: string): Promise<PackageEntryAndExports> {
  const exports: Record<string, { import: string }> = {}
  for (const filePath of await folder(baseUri).indexList()) {
    const isRoot = filePath === 'index.ts';
    const submoduleSection = isRoot ? '.' : `./${filePath.replace(/\/index\.ts$/, '')}`
    const submoduleBase = isRoot ? '' : `${filePath.replace(/\/index\.ts$/, '')}`
    const esmDir = submoduleBase ? `./${Folder}/${submoduleBase}` : `./${Folder}`
    exports[submoduleSection] = {
      import: `${esmDir}/index.mjs`
    }
  }
  return {
    types: `./${Folder}/index.d.mts`,   // Top-level declaration file
    module: `./${Folder}/index.mjs`,    // Top-level ESM module file
    exports                             // The generated subpath exports
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
export async function buildPackageTypeVersions(baseUrl: string): Promise<PackageTypeVersions> {
  const typeVersions: Record<string, string[]> = {}
  for (const filePath of await folder(baseUrl).indexList()) {
    const isRoot = filePath === 'index.ts'
    const submodulePath = isRoot ? '.' : filePath.replace(/\/index\.ts$/, '')
    const definitionPath = `./${Folder}/${submodulePath}/index.d.mts`
    typeVersions[submodulePath] = [definitionPath]
  }
  typeVersions['.'] = !typeVersions['.'] ? [`./${Folder}/index.d.mts`] : typeVersions['.']
  return {
    typesVersions: {
      "*": typeVersions
    }
  }
}
// ------------------------------------------------------------------
// Package: Build
// ------------------------------------------------------------------

/** Builds and writes the package.json file */
export async function buildPackageJson(baseUrl: string, options: BuildOptions): Promise<void> {
  console.log('build-esm: package-json')
  const packageJsonPath = `${options.outdir}/package.json`
  const packageExports = await buildPackageExports(baseUrl)
  const packageTypeVersions = await buildPackageTypeVersions(baseUrl)
  const packageJsonContent = JSON.stringify({
    ...options.packageJson,
    ...packageExports,
    ...packageTypeVersions
  }, null, 2)

  await file(packageJsonPath).create(packageJsonContent)
}