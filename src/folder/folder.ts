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

import { add, addContents, AddOptions } from './add.ts'
import { deleteFolder } from './delete.ts'
import { createFolder } from "./create.ts"
import { indexList } from './index-list.ts'

class Folder {
  constructor(private readonly folderPath: string) {}
  /** Adds the contents of the given folder path to this folder with optional file transformations */
  public async addContents(folderPath: string, options?: AddOptions): Promise<void> {
    await addContents(this.folderPath, folderPath, options)
  }
  /** Adds a file to this folder with optional file transformation */
  public async add(fileOrFolderPath: string, options?: AddOptions): Promise<void> {
    await add(this.folderPath, fileOrFolderPath, options)
  }
  /** Deletes a folder recursively */
  public async delete(): Promise<void> {
    await deleteFolder(this.folderPath)
  }
  /** Returns an index list of `index.ts` files from this folder (build process) */
  public async indexList(): Promise<string[]> {
    return await indexList(this.folderPath)
  }
  /** Creates this folder recursively */
  public async create(): Promise<void> {
    await createFolder(this.folderPath)
  }
}

/** Factory function to create a Folder instance. */
export function folder(path: string): Folder {
  return new Folder(path)
}