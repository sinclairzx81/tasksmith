<div align='center'>

<h1>Tasksmith</h1>

<p>Command Line Automation for Deno</p>

<img src="tasksmith.png" />

<br />
<br />

[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![Test](https://github.com/sinclairzx81/tasksmith/actions/workflows/build.yml/badge.svg)](https://github.com/sinclairzx81/tasksmith/actions/workflows/build.yml)

</div>

## Overview

Tasksmith is a command line automation tool for Deno. It offers a CLI router that routes tasks to TypeScript functions. It also includes a suite of built in functions to assist with project management workflows.

License: MIT

## Usage

Tasksmith is a command-line router that routes tasks based name.

```typescript
import { Task } from 'https://raw.githubusercontent.com/sinclairzx81/tasksmith/0.8.0/src/index.ts'

Task.run('test', () => console.log('test'))

Task.run('build', () => console.log('build'))
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
