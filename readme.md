<div align='center'>

<h1>Tasksmith</h1>

<p>Automation Tooling for Deno</p>

<br />
<br />

[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

</div>

### Overview

Tasksmith is a lightweight automation and build tool developed for Deno. It's designed to orchestrate a variety of project tasks, including file and folder management, as well as running shell commands in parallel. Tasksmith also supports generating dual ESM and CJS npm packages directly from a Deno source tree.

License: MIT

### Usage

Tasksmith is written to be run via tasks configured in `deno.json` 

```typescript
{
  "tasks": {
    "clean": "deno run -A tasks.ts clean",
    "format": "deno run -A  tasks.ts format",
    "start": "deno run -A  tasks.ts start",
    "test": "deno run -A  tasks.ts test",
    "build": "deno run -A tasks.ts build" 
  }
}
```

Where `tasks.ts` would include the following

```typescript
import { Task } from '<import-tasksmith-somehow>'

Task.run('clean', async () => { /* ... */ })
Task.run('format', async () => { /* ... */ })
Task.run('start', async () => { /* ... */ })
Task.run('test', async () => { /* ... */ })
Task.run('build', async () => { /* ... */ })
```

... And where starts are started via the deno CLI

```bash
$ deno task start
```

### Shell

Tasksmith is primarily designed to orchestrate command-line utilities using `async`/`await` control flow. Use the `Task.shell(...)` function to run command line tools.

```typescript
// run one shell command
Task.run('start', async () => {
  await Task.shell('deno run -A example/index.ts')
})

// ... or run them in parallel
Task.run('serve', async () => {
  await Promise([
    Task.shell('deno run -A example/client.ts'),
    Task.shell('deno run -A example/server.ts')
  ])
})
```

### Build

Tasksmith also supports generating npm-publishable packages by introspecting a Deno source tree. The source must include `index.ts` files (not `mod.ts`)), which are interpretted as package entry points. During the build process, Tasksmith generates sub-module imports up to one level deep. The output is a compiled `.tgz` npm package, validated for Node 10, Node 16 (CommonJS and ESM), and bundler-compatible module resolution.

```typescript
Task.run('build', async () => {
  await Task.build('./src', { // build from './src'
    target: './build',        // build directory
    include: [                // files to include
      './license',
      './readme.md'
    ],
    packageJson: {            // package.json configuration
      name: '@{scope}/{name}',
      description: '...',
      version: '1.0.0',
      author: '...',
      license: 'MIT',
      keywords: ['...', '...'],
      repository: { 
        type: 'git',
        url: 'https://github.com/{scope}/{name}'
      }
    }
  })
})
```