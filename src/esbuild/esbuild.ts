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

// ------------------------------------------------------------------
// Bundle
// ------------------------------------------------------------------
/** Bundles the given module */
export async function bundle(entryPath: string, outDir: string = `${settings.get().tempDirectory}/bundle`): Promise<void>  {
  await folder(`${settings.get().tempDirectory}/bundle`).create()
  await shell(`${command} --bundle ${entryPath} --outfile=${outDir}/bundle/${path.basename(entryPath)}.js`)
}
// ------------------------------------------------------------------
// Minify
// ------------------------------------------------------------------
/** Bundles + minifies the given module */
export async function minify(entryPath: string, outDir: string = `${settings.get().tempDirectory}/minify`): Promise<void>  {
  await folder(`${settings.get().tempDirectory}/bundle`).create()
  await shell(`${command} --bundle ${entryPath} --minify --outfile=${outDir}/bundle/${path.basename(entryPath)}.min.js`)
}
// ------------------------------------------------------------------
// Metrics
// ------------------------------------------------------------------
async function computeMetricsForEntryPath(entryPath: string): Promise<{ path: string, bundled: string, minified: string, gzipped: string }> {
  const basename = path.basename(entryPath)
  // targets
  const bundleTarget = `${settings.get().tempDirectory}/metrics/${basename}-bundle.js`
  const minifyTarget = `${settings.get().tempDirectory}/metrics/${basename}-minified.js`
  // metafile: targets
  const bundleMetafileTarget = `${settings.get().tempDirectory}/metrics/${basename}-bundle.meta.json`
  const minifyMetafileTarget = `${settings.get().tempDirectory}/metrics/${basename}-minified.meta.json`

  await folder(`${settings.get().tempDirectory}/metrics`).create()
  await shell(`${command} --bundle ${entryPath} --outfile=${bundleTarget} --metafile=${bundleMetafileTarget}`)
  await shell(`${command} --bundle ${entryPath} --outfile=${minifyTarget} --metafile=${minifyMetafileTarget} --minify`)
  const bundled = await Deno.readFile(`${bundleTarget}`)
  const minified = await Deno.readFile(`${minifyTarget}`)
  const minifiedGzip = await compress.gzipSize(minified)
  return {
    path: entryPath,
    bundled: compress.formatSize(bundled.length),
    minified: compress.formatSize(minified.length),
    gzipped: compress.formatSize(minifiedGzip)
  }
}
/** Reports compression metrics for the entry paths */
export async function metrics(entryPaths: string[]): Promise<void> {
  const results = await Promise.all(entryPaths.map(path => computeMetricsForEntryPath(path)))
  console.table(results)
  console.log('')
  console.log('  visit: https://esbuild.github.io/analyze/ for metafile analysis')
  console.log('')
}