<div align='center'>

<h1>Tasksmith</h1>

<p>Automation Tooling for Deno</p>

<img src="tasksmith.png" />

<br />
<br />

[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![Test](https://github.com/sinclairzx81/tasksmith/actions/workflows/build.yml/badge.svg)](https://github.com/sinclairzx81/tasksmith/actions/workflows/build.yml)

</div>

## Overview

Tasksmith is a lightweight task automation tool for Deno

License: MIT

## Usage

Tasksmith provides a command-line router that routes tasks based on the first command-line argument passed to Deno. Additional arguments are passed into the task function. Task files can be run from anywhere, but would usually reside in a `tasks.ts` file within a project root. The following is a simple task file.

```typescript
import { Task } from 'https://raw.githubusercontent.com/sinclairzx81/tasksmith/0.8.0/src/index.ts'

Task.run('test', async (...args: string[]) => { /* ... */ })

Task.run('build', async (...args: string[]) => { /* ... */ })
```

Tasks are usually configured and run from `deno.json`

```typescript
{
  "tasks": {
    "test": "deno run -A  tasks.ts test",
    "build": "deno run -A tasks.ts build" 
  }
}
```

Check [here](https://github.com/sinclairzx81/tasksmith/tags) for the latest tagged version. 


## Shell

The `Task` namespace provides a `shell(...)` function to run and orchestrate command-line programs.

```typescript
// Run a command line program
Task.run('start', async () => 
  Task.shell('deno run -A example/index.ts'))

// ... or run them in parallel
Task.run('serve', () => Promise.all([
  Task.shell('deno run -A example/client.ts'),
  Task.shell('deno run -A example/server.ts')
]))
```

## Build

The `Task` namespace also provides a `build(...)` function which creates a npm publishable package from a Deno source tree. Internally this function uses TypeScript for compilation and the `attw` command line CLI for module resolution verification. The output is a dual `cjs` and `esm` package that uses the [package json redirects](https://github.com/andrewbranch/example-subpath-exports-ts-compat/tree/main/examples/node_modules/package-json-redirects) resolution scheme. 

```typescript
Task.run('build', () => Task.build('src-tree', { 
  compiler: '5.8.2', // tsc compiler version
  outdir: 'dist',    
  additional: ['license', 'readme.md'],
  packageJson: {
    name: '@sinclair/project',
    description: 'A software library',
    version: '1.0.0',
    author: 'user',
    license: 'MIT',
    keywords: ['tooling', 'automation'],
    repository: { 
      type: 'git',
      url: 'https://github.com/sinclairzx81/project'
    }
  }
}))
```
Refer to the `src-tree` directory with in this repository for an example of how modules should be structured.