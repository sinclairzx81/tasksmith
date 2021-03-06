/*--------------------------------------------------------------------------

tasksmith - task automation library for node.

The MIT License (MIT)

Copyright (c) 2015-2017 Haydn Paterson (sinclair) <haydn.developer@gmail.com>

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

import { rename as system_rename } from "../system/file/rename"
import { signature }               from "../common/signature"
import { Task }                    from "../core/task"
import { create }                  from "../core/create"

/**
 * (synchronous) renames the given target file to the given new name.
 * @param {string} target the path of the file to rename.
 * @param {string} newname the new name of this file.
 * @returns {Task}
 */
export function rename(target: string, newname: string): Task


export function rename(...args: any[]): Task {
  return create("file/rename", context => signature(args)
  .err((err) => context.fail(err))
  .map(["string", "string"])
  .run((target: string, newname: string) => {
    try {
      system_rename(target, newname, data => context.log(data))
      context.ok()
    } catch (error) {
      context.fail(error)
    }
  }))
}