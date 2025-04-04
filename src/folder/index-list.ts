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

/** Returns an index list of `index.ts` files from this folder (build process) */
export async function indexList(directoryPath: string, depth: number = 1, currentDepth: number = 0, root: string = directoryPath): Promise<string[]> {
  const indexFile = `${directoryPath}/index.ts`
  const result: string[] = []
  try {
    const stat = await Deno.stat(indexFile)
    if (!stat.isFile) return []
  } catch {
    return []
  }
  if (currentDepth < depth) {
    for await (const entry of Deno.readDir(directoryPath)) {
      if (entry.isDirectory) {
        const subdir = `${directoryPath}/${entry.name}`
        result.push(...await indexList(subdir, depth, currentDepth + 1, root))
      }
    }
  }
  const output = directoryPath === root
    ? 'index.ts'
    : indexFile.slice(root.length + 1)
  result.push(output)
  return result
}