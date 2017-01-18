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

/// <reference path="./node.d.ts" />

import {signature} from "../common/signature"
import {ITask}     from "../core/task"
import {script}    from "../core/script"
import * as util   from "./util"
import * as path   from "path"

import * as url    from "url"
import * as http   from "http"
import * as https  from "https"

/**
 * creates a empty file with the given path, if the file already exists, no action.
 * @param {string} filename the filename to save this resource as. 
 * @returns {ITask}
 */
export function touch(filename: string) : ITask

/**
 * creates a empty file with the given path, if the file already exists, no action.
 * @param {any[]} arguments.
 * @returns {ITask}
 */
export function touch(...args: any[]) : ITask {
  let param = signature<{
    filename: string
  }>(args, [
    { pattern: ["string"], map : (args) => ({ filename: args[0] })  },
  ])
  return script("node/touch", context => {
    try {
      let filename = path.resolve(param.filename)
      context.log(filename)
      util.touch(filename, message => context.log(message))
      context.ok()
    } catch (error) {
      context.fail(error.message)
    }
  })
}