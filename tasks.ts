import { Task } from './src/index.ts'

// ------------------------------------------------------------------
// Clean: Removes the target build directory
// ------------------------------------------------------------------
Task.run('clean', async () => {
  await Task.folder('target').delete()
})

// ------------------------------------------------------------------
// Start: Runs the example/index.ts file in watch mode
// ------------------------------------------------------------------
Task.run('start', async () => {
  await Task.shell('deno run -A --watch example/index.ts')
})

// ------------------------------------------------------------------
// Metrics: Reports bundle size metrics for the given module
// ------------------------------------------------------------------
Task.run('metrics', async () => {
  await Task.esbuild.metrics('./src-tree/index.ts')
})

// ------------------------------------------------------------------
// Build: Generates a NPM publishable package from the example `src-tree`
// ------------------------------------------------------------------
Task.run('build', async () => {
  await Task.build('src-tree', { 
    target: 'target',
    include: ['license', 'readme.md'],
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
  })
})

