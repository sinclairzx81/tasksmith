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
// Bundle
// ------------------------------------------------------------------
Task.run('bundle', async () => {
  await Task.esbuild.compression('./src-tree/index.ts')
})
// ------------------------------------------------------------------
// Build
// ------------------------------------------------------------------
Task.run('build', () => Task.build('src-tree', { 
  compiler: 'latest',
  outdir: 'target',
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

