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

import * as Path from 'jsr:@std/path@1.1.0'

// This file is a pass-through for 'jsr:@std/path'

export function seperator(): string {
  return Path.SEPARATOR
}
export function basename(path: string): string {
  return Path.basename(path)
}
export function dirname(path: string): string {
  return Path.dirname(path)
}
export function join(...paths: string[]): string {
  const [left, ...right] = paths
  return Path.join(left, ...right)
}
export function extname(path: string): string {
  return Path.extname(path)
}
export function relative(from: string, to: string): string {
  return Path.relative(from, to)
}
export function resolve(...pathSegments: string[]): string {
  return Path.resolve(...pathSegments)
}
