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

export interface CreateReadStreamOptions {
  start?: number
  end?: number
  chunkSize?: number
}
/** Replicates Node createReadStream with offsets */
export async function createReadStream(filePath: string, options: CreateReadStreamOptions = {}): Promise<ReadableStream<Uint8Array>> {
  const { start = 0, end = Infinity, chunkSize = 64 * 1024 } = options
  const file = await Deno.open(filePath, { read: true })
  await file.seek(start, Deno.SeekMode.Start)
  let position = start
  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      if (position > end) {
        controller.close()
        file.close()
        return
      }
      const remaining = end - position + 1
      const buffer = new Uint8Array(Math.min(chunkSize, remaining))
      const length = await file.read(buffer)
      if (length === null || length === 0) {
        controller.close()
        file.close()
        return
      }
      position += length
      controller.enqueue(buffer.subarray(0, length))
    },
    cancel() {
      file.close()
    },
  })
}
