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
import { tsc } from '../../tsc/index.ts'
import { Folder } from './folder.ts'

// ------------------------------------------------------------------
// BuildEsm
// ------------------------------------------------------------------
export async function buildEsm(baseUrl: string, options: BuildOptions): Promise<void> {
  console.log('build-dual: esm')
  const working = `${settings.get().tempDirectory}/build-esm`
  const outdir = `${options.outdir}/${Folder}/esm`
  await folder(`${working}`).delete()
  await folder(`${working}`).addContents(baseUrl, {
    extensionRename: [['.ts', '.mts']],
    specifierRename: [['.ts', '.mjs']],
    removeNotices: true
  })
  const indexList = await folder(baseUrl).indexList()
  const files = indexList.map(file => (file.endsWith('.ts')) ? file.slice(0, file.lastIndexOf('.ts')) + '.mts' : file)
  await file(`${working}/tsconfig.json`).create(JSON.stringify({
    compilerOptions: {
      strict: true,
      target: "ES2020",
      module: "ESNext",
      declaration: true,
    },
    files
  }, null, 2)) 
  await tsc(options.compiler).run(`-p ${working}/tsconfig.json --outDir ${outdir} --declaration`)
  await folder(`${working}`).delete()
}


