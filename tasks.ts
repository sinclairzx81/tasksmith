import { Task } from './src/index.ts'

// ------------------------------------------------------------------
// Clean
// ------------------------------------------------------------------
Task.run('clean', async () => {
  await Task.folder('target').delete()
})
// ------------------------------------------------------------------
// Start
// ------------------------------------------------------------------
Task.run('start', async () => {
  await Task.shell('deno run -A --watch example/index.ts')
})
// ------------------------------------------------------------------
// Metrics
// ------------------------------------------------------------------
Task.run('metrics', async () => {
  await Task.esbuild.metrics([
    'src-build/index.ts',
    'src-build/foo/foo.ts',
    'src-build/bar/bar.ts',
    'src-build/baz/baz.ts',
  ])
})
// ------------------------------------------------------------------
// Build
// ------------------------------------------------------------------
Task.run('build', () => Task.build('src-build', { 
  compiler: 'latest',
  outdir: 'target/build',
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

// ------------------------------------------------------------------
// Serve
// ------------------------------------------------------------------
Task.run('serve', async () => {
  await Task.serve('src-serve/index.html', { port: 5000 })
})