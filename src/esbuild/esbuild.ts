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

import { settings } from '../settings/index.ts'
import { folder } from '../folder/index.ts'
import { compress } from '../compress/index.ts'
import { shell } from '../shell/index.ts'
import { path } from '../path/index.ts'

export const __esbuild__ = `esbuild@0.25.2`

/** Bundles the given module */
export async function bundle(modulePath: string, outDir: string = `${settings.get().tempDirectory}/bundle`) {
  await folder(`${settings.get().tempDirectory}/bundle`).create()
  await shell(`deno run -A npm:${__esbuild__} --bundle ${modulePath} --outfile=${outDir}/bundle/${path.basename(modulePath)}.js`)
}
/** Bundles + minifies the given module */
export async function minify(modulePath: string, outDir: string = `${settings.get().tempDirectory}/minify`) {
  await folder(`${settings.get().tempDirectory}/bundle`).create()
  await shell(`deno run -A npm:${__esbuild__} --bundle ${modulePath} --minify --outfile=${outDir}/bundle/${path.basename(modulePath)}.min.js`)
}
/** Prints compression metrics for the given model path */
export async function metrics(modulePath: string) {
  await folder(`${settings.get().tempDirectory}/metrics`).create()
  await shell(`deno run -A npm:${__esbuild__} --bundle ${modulePath} --outfile=${settings.get().tempDirectory}/metrics/default.js`)
  await shell(`deno run -A npm:${__esbuild__} --bundle ${modulePath} --outfile=${settings.get().tempDirectory}/metrics/minified.js --minify`)
  const bundled = await Deno.readFile(`${settings.get().tempDirectory}/metrics/default.js`)
  const minified = await Deno.readFile(`${settings.get().tempDirectory}/metrics/minified.js`)
  const minifiedGzip = await compress.gzipSize(minified)
  console.table([
    { Output: 'Bundled', Size: compress.formatSize(bundled.length) },
    { Output: 'Minified', Size: compress.formatSize(minified.length) },
    { Output: 'Minified + Gzip', Size: compress.formatSize(minifiedGzip) },
  ])
}