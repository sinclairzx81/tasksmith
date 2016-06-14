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

import {signature}       from "../common/signature"
import {ITask}           from "./task"
import {script}          from "./script"


/**
 * a next function, passed to resolve to asynchronously resolve values.
 */
export interface NextFunction<T> {
  (value: T) : void
}

/**
 * a resolve function used for asynchronous resolution of values.
 */
export interface ResolveFunction<T> {
  (next: NextFunction<T>): void
}

/**
 * creates a task that will run a inner task if a condition is true. otherwise ok.
 * @param {string} a message to log.
 * @param {ResolveFunction<boolean>} function to resolve a boolean.
 * @param {() => ITask} the task to be run if the condition is true.
 * @returns {ITask}
 */
export function ifthen(message: string, condition: ResolveFunction<boolean>, task: () => ITask) : ITask

/**
 * creates a task that will run a inner task if a condition is true. otherwise ok.
 * @param {ResolveFunction<boolean>} function to resolve a boolean.
 * @param {() => ITask} the task to be run if the condition is true.
 * @returns {ITask}
 */
export function ifthen(condition: ResolveFunction<boolean>, task: () => ITask) : ITask

/**
 * returns a task that runs only if a given condition is met.
 * @param {any[]} arguments
 * returns {ITask}
 * @example
 * 
 * let mytask = task.ifthen(next => next(true), 
 *                          ()    => task.ok ("only if true"))
 */
export function ifthen (...args:any []): ITask {
  let param = signature<{
    message   : string,
    condition : ResolveFunction<boolean>,
    taskfunc  : () => ITask
  }>(args, [
      { pattern: ["string", "function", "function"], map : (args) => ({ message: args[0], condition: args[1], taskfunc: args[2]  })  },
      { pattern: ["function", "function"],           map : (args) => ({ message: null,    condition: args[0], taskfunc: args[1]  })  },
  ])
  return script("core/ifthen", context => {
    if(param.message !== null) context.log(param.message)
    param.condition(result => {
      if(result === false) { context.ok() }
      else {
        let task = param.taskfunc()
        context.run(task)
               .then(()     => context.ok())
               .catch(error => context.fail(error.message))
      }
    })
 })
}