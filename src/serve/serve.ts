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

import { HandleRequest } from './request.ts'
import { HandleSocket, StartWatch } from './socket.ts'

// ------------------------------------------------------------------
// ServeOptions
// ------------------------------------------------------------------
export interface ServeOptions {
  /** Serve port to listen on. Default is 5000 */
  port: number
}
function DefaultServeOptions(): ServeOptions {
  return { port: 5000 }
}
// ------------------------------------------------------------------
// Serve
// ------------------------------------------------------------------
/** Serves the given directory over HTTP. Supports auto reload for HTML files */
export function serve(directory: string = Deno.cwd(), serveOptions: Partial<ServeOptions> = {}): Deno.HttpServer<Deno.NetAddr> {
  const options = { ...DefaultServeOptions(), ...serveOptions }
  StartWatch(directory)
  console.log('serve', options)
  return Deno.serve({ hostname: "0.0.0.0", port: options.port, onListen: () => {} }, async request => {
    const url = new URL(request.url)
    return (url.pathname === "/__reload")
      ? HandleSocket(request)
      : await HandleRequest(request, { directory, port: options.port })
  })
}