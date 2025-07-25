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

import { path } from '../path/index.ts'

// ------------------------------------------------------------------
// IsTestModule
// ------------------------------------------------------------------
function isTestModule(filePath: string) {
  return filePath.endsWith('.ts') && !filePath.startsWith('_')
}
// ------------------------------------------------------------------
// ReadDirectory
// ------------------------------------------------------------------
function* readDirectory(directoryPath: string): Generator<string> {
  for (const entry of Deno.readDirSync(directoryPath)) {
    const fullPath = path.join(directoryPath, entry.name)
    if (entry.isDirectory) yield* readDirectory(fullPath)
    if (entry.isFile && isTestModule(entry.name)) yield fullPath
  }
}
// ------------------------------------------------------------------
// ReadImports
// ------------------------------------------------------------------
function* readImports(root: string, baseDir: string) {
  for (const filePath of readDirectory(root)) {
    const resolvedBase = path.dirname(path.resolve(baseDir))
    const resolvedPath = path.resolve(filePath)
    const relativeToManifest = path.relative(resolvedBase, resolvedPath).split(path.seperator()).join('/')
    yield `import './${relativeToManifest}'`
  }
}
// ------------------------------------------------------------------
// CreateManifest
// ------------------------------------------------------------------
export function createManifest(roots: string[], manifestFilePath: string): string {
  return roots.reduce((result, root) => {
    return [...result, ...readImports(root, manifestFilePath)]
  }, [] as string[]).join('\n')
}
// ------------------------------------------------------------------
// WriteManifest
// ------------------------------------------------------------------
export function writeManifest(roots: string[], manifestPath: string): void {
  const code = createManifest(roots, manifestPath)
  Deno.mkdirSync(path.dirname(manifestPath), { recursive: true })
  Deno.writeTextFileSync(manifestPath, code)
}
