<div align='center'>

<h1>Tasksmith</h1>

<p>Task Automation for Deno</p>

<img src="tasksmith.png" />

<br />
<br />

[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![Test](https://github.com/sinclairzx81/tasksmith/actions/workflows/build.yml/badge.svg)](https://github.com/sinclairzx81/tasksmith/actions/workflows/build.yml)

</div>

## Overview

Tasksmith is a task automation tool for Deno that routes the first command line argument to TypeScript functions. It also has a suite functions to assist with various task automation workflows. 

License: MIT

## Install

Tasksmith is only available via tagged revision provided by this repository. 



```typescript
// file: deno.json

{
  "imports": {
    "tasksmith": "https://raw.githubusercontent.com/sinclairzx81/tasksmith/0.9.0/src/index.ts"
  }
}
```

## Usage

Tasksmith will route the first command line argument to a function.

```typescript
import { Task } from 'tasksmith'

Task.run('test', () => console.log('test'))

Task.run('build', () => console.log('build'))
```

Tasks are usually configured and run from `deno.json`

```typescript
// file: deno.json

{
  "tasks": {
    "test": "deno run -A tasks.ts test",
    "build": "deno run -A tasks.ts build" 
  }
}
```