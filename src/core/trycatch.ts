/*--------------------------------------------------------------------------

tasksmith - task automation library for node.

The MIT License (MIT)

Copyright (c) 2015-2016 Haydn Paterson (sinclair) <haydn.developer@gmail.com>

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

import {signature} from "../common/signature"
import {ITask}     from "./task"
import {script}    from "./script"

/**
 * creates a task that will try the left task, and if fail, will fallback to the right task.
 * @param {string} a message to log.
 * @param {() => ITask} a function to return the left task.
 * @param {() => ITask} a function to return the right task.
 * @returns {ITask}
 */
export function trycatch(message: string, left: () => ITask, right : () => ITask) : ITask;

/**
 * creates a task that will try the left task, and if fail, will fallback to the right task.
 * @param {() => ITask} a function to return the left task.
 * @param {() => ITask} a function to return the right task.
 * @returns {ITask}
 */
export function trycatch(left: () => ITask, right : () => ITask) : ITask;

/**
 * creates a task that will try the left task, and if fail, will fallback to the right task.
 * @param {() => ITask} a function to return the left task.
 * @param {() => ITask} a function to return the right task.
 * @returns {ITask}
 * @example
 * 
 * let mytask = task.trycatch(() => task.fail ("this task will fail."),
 *                            () => task.ok   ("so fallback to this task."))
 */
export function trycatch(...args: any[]) : ITask {
  let param = signature<{
    message   : string,
    left      : () => ITask,
    right     : () => ITask
  }>(args, [
      { pattern: ["string", "function", "function"], map : (args) => ({ message: args[0], left: args[1], right: args[2]  })  },
      { pattern: ["function", "function"],           map : (args) => ({ message: null,    left: args[0], right: args[1]  })  },
  ])
  return script("core/trycatch", context => {
    if(param.message !== null) context.log(param.message)
    context.run(param.left())
        .then(() => context.ok())
        .catch(error => {
          context.run(param.right())
                 .then(()     => context.ok())
                 .catch(error => context.fail(error.message))
        })
  })
}