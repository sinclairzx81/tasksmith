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

import { appendFile } from './append.ts'
import { createFile } from './create.ts'
import { deleteFile } from './delete.ts'
import { readFile } from './read.ts'
import { replace } from './replace.ts'
import { writeFile } from './write.ts'

class File {
  constructor(private readonly filePath: string) {}
  /** Appends the given content to this file */
  public async append(content: string) {
    await appendFile(this.filePath, content)
  }
  /** Creates this file with optional content */
  public async create(content?: string) {
    await createFile(this.filePath, content)
  }
  /** Deletes this file */
  public async delete() {
    await deleteFile(this.filePath)
  }
  /** Reads the contents of this file as a string */
  public async read(): Promise<string> {
    return await readFile(this.filePath)
  }
  /** Replaces occurrences of the given matcher with the replacement string */
  public async replace(matcher: string | RegExp, replacement: string) {
    await replace(this.filePath, matcher, replacement)
  }
  /** Writes the given content to this file */
  public async write(content: string) {
    await writeFile(this.filePath, content)
  }
}
export function file(filePath: string): File {
  return new File(filePath)
}
