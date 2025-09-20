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

// ------------------------------------------------------------------
// Command
// ------------------------------------------------------------------
const command = `deno run -A --no-lock npm:@arethetypeswrong/cli@0.18.2`

// ------------------------------------------------------------------
// Rules
// ------------------------------------------------------------------
export type Rules =
  | 'no-resolution'
  | 'untyped-resolution'
  | 'false-cjs'
  | 'false-esm'
  | 'cjs-resolves-to-esm'
  | 'fallback-condition'
  | 'cjs-only-exports-default'
  | 'false-export-default'
  | 'unexpected-module-syntax'
  | 'missing-export-equals'
  | 'internal-resolution-error'
  | 'named-exports'

// ------------------------------------------------------------------
// Rules
// ------------------------------------------------------------------
export interface AttwOptions {
  mode: 'dual' | 'esm-only'
  ignore: Rules[]
}
function defaultOptions(): AttwOptions {
  return { mode: 'dual', ignore: [] }
}
/** Runs a "Are The Types Wrong" query on a npm .tgz pack */
export async function attw(packFile: string, options_: Partial<AttwOptions> = {}) {
  const options = { ...defaultOptions(), ...options_ }
  const ignore_rules = options.ignore.length > 0 ? `--ignore-rules ${options.ignore.join(' ')}` : ''
  return options.mode === 'esm-only' ? await shell(`${command} ${packFile} --profile esm-only ${ignore_rules}`) : await shell(`${command} ${packFile} ${ignore_rules}`)
}
