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

const command = `deno run -A --no-lock npm:esbuild@0.25.2`

/** Bundles the given module */
export async function bundle(entryPath: string, outDir: string = `${settings.get().tempDirectory}/bundle`): Promise<void>  {
  await folder(`${settings.get().tempDirectory}/bundle`).create()
  await shell(`${command} --bundle ${entryPath} --outfile=${outDir}/bundle/${path.basename(entryPath)}.js`)
}
/** Bundles + minifies the given module */
export async function minify(entryPath: string, outDir: string = `${settings.get().tempDirectory}/minify`): Promise<void>  {
  await folder(`${settings.get().tempDirectory}/bundle`).create()
  await shell(`${command} --bundle ${entryPath} --minify --outfile=${outDir}/bundle/${path.basename(entryPath)}.min.js`)
}
/** Reports compression metrics for the given module graph */
export async function metrics(entryPath: string): Promise<void> {
  await folder(`${settings.get().tempDirectory}/metrics`).create()
  await shell(`${command} --bundle ${entryPath} --outfile=${settings.get().tempDirectory}/metrics/default.js`)
  await shell(`${command} --bundle ${entryPath} --outfile=${settings.get().tempDirectory}/metrics/minified.js --minify`)
  const bundled = await Deno.readFile(`${settings.get().tempDirectory}/metrics/default.js`)
  const minified = await Deno.readFile(`${settings.get().tempDirectory}/metrics/minified.js`)
  const minifiedGzip = await compress.gzipSize(minified)
  console.table([
    { Src: entryPath, Asset: 'Bundled', Size: compress.formatSize(bundled.length) },
    { Src: entryPath, Asset: 'Minified', Size: compress.formatSize(minified.length) },
    { Src: entryPath, Asset: 'Minified + Gzip', Size: compress.formatSize(minifiedGzip) },
  ])
}