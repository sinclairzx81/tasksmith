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

import { shell } from '../shell/index.ts'
import { writeManifest } from './manifest.ts'

// ------------------------------------------------------------------
// Run
// ------------------------------------------------------------------
export interface RunOptions {
  /** test manifest file path. default is `target/test/manifest.ts` */
  manifest: string
  /** test name filters. default is `''` */
  filter: string
  /** test watch mode. default is `false` */
  watch: boolean
  /** test parallel mode. default is `false` */
  parallel: boolean
  /** test no-check mode. default is `false` */
  noCheck: boolean
}
function DefaultRunOptions(): RunOptions {
  return {
    manifest: 'target/test/manifest.ts',
    filter: '',
    watch: false,
    parallel: false,
    noCheck: false,
  }
}
/**
 * Runs tests under the given roots. Tests work by writing an entry manifest file
 * for each ts module under the roots. Tests are executed from this manifest which
 * yields much faster performance than running tests via module discovery.
 */
export async function run(roots: string[], options: Partial<RunOptions> = {}) {
  const options_ = { ...DefaultRunOptions(), ...options }
  writeManifest(roots, options_.manifest)

  const filter = options_.filter === '' ? '' : `--filter ${options_.filter}`
  const parallel = options_.parallel ? '--parallel' : ''
  const watch = options_.watch ? '--watch' : ''
  await shell(`deno test -A ${watch} ${filter} ${options_.manifest} ${parallel}`)
}
