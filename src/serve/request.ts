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
import { contentType } from 'jsr:@std/media-types@1.1.0'
import { createReadStream } from './stream.ts'

// ------------------------------------------------------------------
// FileExists
// ------------------------------------------------------------------
async function FileExists(filePath: string): Promise<boolean> {
  try {
    const stat = await Deno.stat(filePath)
    return stat.isFile
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) return false
    throw error
  }
}
// ------------------------------------------------------------------
// InjectReloadScript
// ------------------------------------------------------------------
const ReloadScript = (port: number) => (`<script>
(function connect() {
  const proto = window.location.protocol === 'https:' ? 'wss' : 'ws'
  const url = proto + '://' + window.location.hostname + ':' + ${port} + '/__reload'
  const socket = new WebSocket(url)
  socket.onopen = () => console.log('%ctasksmith: connected', 'color: #888')
  socket.onmessage = () => window.location.reload()
  socket.onclose = () => setTimeout(connect, 2000)
  socket.onerror = () => {
    console.log('%ctasksmith: retry', 'color: #888')
    socket.close()
  }
})()
</script>`)
export function InjectReloadScript(html: string, port: number): string {
  const script = ReloadScript(port)
  if (/<\/body>/i.test(html)) return html.replace(/<\/body>/i, `${script}</body>`)
  if (/<\/html>/i.test(html)) return html.replace(/<\/html>/i, `${script}</html>`)
  return html + script
}
// ------------------------------------------------------------------
// DecodeResponseInit: 206 | 200
// ------------------------------------------------------------------
function DecodeRangeHeader(range: string): number {
  const result = range.match(/bytes=([\d]+)-([\d]*)?/)
  return result ? parseInt(result[1]) : 0
}
function DecodeResponseInit(request: Request, filePath: string): ResponseInit & { range: { start: number; end: number } } {
  const stat = Deno.statSync(filePath)
  const disposition = path.basename(filePath).replace(/[^0-9a-zA-Z-\.]/gi, '-')
  const mime = contentType(path.extname(filePath)) || 'application/octet-stream'
  const range = request.headers.get('range')
  // Partial 206: If Range header is present
  if (typeof range === 'string') {
    const offset = DecodeRangeHeader(range)
    if (offset < stat.size) {
      const total = stat.size
      const start = offset
      const end = stat.size - 1
      const length = end - start + 1
      const range_out = `bytes ${start}-${end}/${total}`
      return {
        range: { start, end },
        status: 206,
        headers: {
          'Content-Type': `${mime}`,
          'Content-Length': `${length}`,
          'Content-Range': `${range_out}`,
          'Content-Disposition': `inline; filename=${disposition}`,
          'Cache-Control': 'public',
        },
      }
    }
  }
  // 200: Fall-Through
  return {
    range: { start: -1, end: -1 },
    status: 200,
    headers: {
      'Content-Type': `${mime}`,
      'Content-Length': `${stat.size}`,
      'Content-Disposition': `inline; filename=${disposition}`,
      'Cache-Control': 'public',
    },
  }
}
// ------------------------------------------------------------------
// HandleRequest
// ------------------------------------------------------------------
interface RequestOptions {
  directory: string
  port: number
}
export async function HandleRequest(request: Request, options: RequestOptions): Promise<Response> {
  const url = new URL(request.url)
  const pathname = url.pathname === '/' ? '/index.html' : url.pathname
  const filePath = path.join(options.directory, pathname)
  const mimeType = contentType(path.extname(filePath)) || 'application/octet-stream'
  // ----------------------------------------------------------------
  // Not Found
  // ----------------------------------------------------------------
  if (!(await FileExists(filePath))) {
    return new Response('File not found', { status: 404 })
  }
  // ----------------------------------------------------------------
  // Html
  // ----------------------------------------------------------------
  if (mimeType.startsWith('text/html')) {
    const content = await Deno.readTextFile(filePath)
    return new Response(InjectReloadScript(content, options.port), {
      status: 200,
      headers: { 'Content-Type': mimeType },
    })
  }
  // ----------------------------------------------------------------
  // Response
  // ----------------------------------------------------------------
  const responseInit = DecodeResponseInit(request, filePath)
  if (responseInit.status === 206) {
    const readable = await createReadStream(filePath, responseInit.range)
    return new Response(readable, responseInit)
  } else {
    const file = await Deno.open(filePath, { read: true })
    return new Response(file.readable, responseInit)
  }
}
