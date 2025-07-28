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
import { settings } from '../../settings/index.ts'
import { folder } from '../../folder/index.ts'
import { file } from '../../file/index.ts'
import { path } from '../../path/index.ts'
import { tsc } from '../../tsc/index.ts'

import { Folder } from './folder.ts'

// ------------------------------------------------------------------
// Build Cjs Alias Directories
//
// This function is required by node10. It writes directories for 
// each submodule where each directory contains a package.json
// that redirects to the _build folder. This is needed in node10
// as it primarily operates on directories and not the pathing
// configurations in the root package.json.
//
// ------------------------------------------------------------------
export async function buildCjsAliasDirectories(baseUrl: string, options: BuildOptions): Promise<void> {
  console.log('build-dual: cjs-aliases')
  await folder(`${options.outdir}`).create()
  for(const indexPath of await folder(baseUrl).indexList()) {
    const dirname = path.dirname(indexPath)
    const dirbase = path.basename(dirname)
    if(dirbase === '.') continue
    await folder(`${options.outdir}/${dirname}`).create()
    await file(`${options.outdir}/${dirname}/package.json`).create(JSON.stringify({
      main: `../${Folder}/cjs/${dirbase}/index.js`,
      types: `../${Folder}/cjs/${dirbase}/index.d.ts`
    }, null, 2))
  }
}
export async function buildCjs(baseUrl: string, options: BuildOptions): Promise<void> {
  console.log('build-dual: cjs')
  const working = `${settings.get().tempDirectory}/build-cjs`
  const outdir = `${options.outdir}/${Folder}/cjs`
  await folder(`${working}`).delete()
  await folder(`${working}`).addContents(baseUrl, {
    extensionRename: [],
    specifierRename: [['.ts', '']],
    removeNotices: true
  })
  const indexList = await folder(baseUrl).indexList()
  const files = indexList.map(file => file)
  await file(`${working}/tsconfig.json`).create(JSON.stringify({
    compilerOptions: {
      strict: true,
      target: "ES2020",
      module: "CommonJS",
      declaration: true,
    },
    files
  }, null, 2))
  await tsc(options.compiler).run(`-p ${working}/tsconfig.json --outDir ${outdir} --declaration`)
  await folder(`${working}`).delete()
}
