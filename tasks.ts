import { Task } from './src/index.ts'

const Version = '0.9.1'

// ------------------------------------------------------------------
// Clean
// ------------------------------------------------------------------
Task.run('clean', () => Task.folder('target').delete())
// ------------------------------------------------------------------
// Format
// ------------------------------------------------------------------
Task.run('format', () => Task.shell('deno fmt src'))
// ------------------------------------------------------------------
// Start
// ------------------------------------------------------------------
Task.run('start', () => Task.shell('deno run -A --watch example/index.ts'))
// ------------------------------------------------------------------
// Serve
// ------------------------------------------------------------------
Task.run('serve', () => Task.serve('ref/serve'))
// ------------------------------------------------------------------
// Build: Dual
// ------------------------------------------------------------------
Task.run('build:dual', () =>
  Task.build.dual('ref/build', {
    compiler: 'latest',
    outdir: 'target/build',
    additional: ['license', 'readme.md'],
    packageJson: {
      name: '@sinclair/project',
      description: 'A software library',
      version: '1.0.0',
      author: 'sinclairzx81',
      license: 'MIT',
      keywords: ['tooling', 'automation'],
      repository: {
        type: 'git',
        url: 'https://github.com/sinclairzx81/project',
      },
    },
  }))
// ------------------------------------------------------------------
// Build: Esm
// ------------------------------------------------------------------
Task.run('build:esm', () =>
  Task.build.esm('ref/build', {
    compiler: 'latest',
    outdir: 'target/build',
    additional: ['license', 'readme.md'],
    packageJson: {
      name: '@sinclair/project',
      description: 'A software library',
      version: '1.0.0',
      author: 'sinclairzx81',
      license: 'MIT',
      keywords: ['tooling', 'automation'],
      repository: {
        type: 'git',
        url: 'https://github.com/sinclairzx81/project',
      },
    },
  }))
// ------------------------------------------------------------------
// Metrics
// ------------------------------------------------------------------
Task.run('metrics', async () => {
  await Task.esbuild.metrics([
    'ref/build/index.ts',
    'ref/build/foo/foo.ts',
    'ref/build/bar/bar.ts',
    'ref/build/baz/baz.ts',
  ])
})
// ------------------------------------------------------------------
// Test
// ------------------------------------------------------------------
Task.run('test', () => Task.test.run(['test/subset0', 'test/subset1']))
// ------------------------------------------------------------------
// Report
// ------------------------------------------------------------------
Task.run('report', () => Task.test.report(['test/subset0', 'test/subset1']))
// ------------------------------------------------------------------
// Publish
// ------------------------------------------------------------------
Task.run('publish', async () => {
  await Task.shell(`git tag ${Version}`)
  await Task.shell(`git push origin ${Version}`)
})
