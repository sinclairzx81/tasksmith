/*--------------------------------------------------------------------------

Tasksmith

The MIT License (MIT)

Copyright (c) 2025 Haydn Paterson (sinclair) 

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

// deno-fmt-ignore-file
// deno-lint-ignore-file ban-types

import { settings } from '../settings/index.ts'
import { attw } from '../attw/index.ts'
import { folder } from '../folder/index.ts'
import { file } from '../file/index.ts'
import { path } from '../path/index.ts'
import { tsc } from '../tsc/index.ts'
import { shell } from '../shell/index.ts'

const MBUILD = '.build' // Interior Build Directory

// ------------------------------------------------------------------
// BuildOptions
// ------------------------------------------------------------------
interface BuildOptions {
  compiler: `latest` | `next` | `4.9.5` | ({} & string), // typescript version
  outdir: string,                                        // output directory
  additional: string[],                                  // additional files
  packageJson: {                                         // required 
    [key: string]: unknown
    name: string
    version: string
    description: string
    keywords: string[]
    author: string
    license: string
    repository: { 
      type: 'git' | (string & {}), 
      url: 'https://github.com/sinclairzx81/project' | (string & {}) 
    }
  }
}
// ------------------------------------------------------------------
// Clean
// ------------------------------------------------------------------
async function clean(_baseUrl: string, options: BuildOptions): Promise<void> {
  console.log('build: clean')
  await folder(options.outdir).delete()
}

// ------------------------------------------------------------------
// CreatePackageJson
// ------------------------------------------------------------------
function buildExportMap(indexList: string[]): Record<string, unknown> {
  const exports: Record<string, {
    require: { types: string, default: string }
    import: { types: string, default: string }
  }> = {}
  for (const file of indexList) {
    const isRoot = file === 'index.ts'
    const subpath = isRoot ? '.' : `./${file.replace(/\/index\.ts$/, '')}`
    const base = isRoot ? '' : `/${file.replace(/\/index\.ts$/, '')}`
    exports[subpath] = {
      require: {
        types: `./${MBUILD}/cjs${base}/index.d.ts`,
        default: `./${MBUILD}/cjs${base}/index.js`
      },
      import: {
        types: `./${MBUILD}/esm${base}/index.d.mts`,
        default: `./${MBUILD}/esm${base}/index.mjs`
      }
    }
  }
  return {
    types: `./${MBUILD}/cjs/index.d.ts`,
    main: `./${MBUILD}/cjs/index.js`,
    module: `./${MBUILD}/esm/index.mjs`,
    exports
  }
}
async function createPackageJson(baseUrl: string, options: BuildOptions): Promise<void> {
  console.log('build: package-json')
  const indexList = await folder(baseUrl).indexList()
  const exportMap = buildExportMap(indexList)
  await file(`${options.outdir}/build/package.json`).create(JSON.stringify({
    ...options.packageJson,
    ...exportMap 
  }, null, 2))
}

// ------------------------------------------------------------------
// BuildCommonJS
// ------------------------------------------------------------------
async function createCommonJSAliases(baseUrl: string, options: BuildOptions): Promise<void> {
  console.log('build: commonjs-aliases')
  await folder(`${options.outdir}/build`).create()
  for(const indexPath of await folder(baseUrl).indexList()) {
    const dirname = path.dirname(indexPath)
    const dirbase = path.basename(dirname)
    if(dirbase === '.') continue
    await folder(`${options.outdir}/build/${dirname}`).create()
    await file(`${options.outdir}/build/${dirname}/package.json`).create(JSON.stringify({
      main: `../${MBUILD}/cjs/${dirbase}/index.js`,
      types: `../${MBUILD}/cjs/${dirbase}/index.d.ts`
    }, null, 2))
  }
}
async function buildCommonJS(baseUrl: string, options: BuildOptions): Promise<void> {
  console.log('build: commonjs')
  const working = `${settings.get().tempDirectory}/build-cjs`
  const outdir = `${options.outdir}/build/${MBUILD}/cjs`
  await folder(`${working}`).delete()
  await folder(`${working}`).addContents(baseUrl, {
    extensionRename: [],
    specifierRename: [['.ts', '']],
    removeNotices: true
  })
  const indexList = await folder(baseUrl).indexList()
  const files = indexList.map(file => file)
  await file(`${working}/tsconfig.json`).create(JSON.stringify({
    compilerOptions: {
      strict: true,
      target: "ES2020",
      module: "CommonJS",
      declaration: true,
    },
    files
  }, null, 2))
  await tsc(options.compiler).run(`-p ${working}/tsconfig.json --outDir ${outdir} --declaration`)
  await folder(`${working}`).delete()
}

// ------------------------------------------------------------------
// BuildEsm
// ------------------------------------------------------------------
async function buildEsm(baseUrl: string, options: BuildOptions): Promise<void> {
  console.log('build: esm')
  const working = `${settings.get().tempDirectory}/build-esm`
  const outdir = `${options.outdir}/build/${MBUILD}/esm`
  await folder(`${working}`).delete()
  await folder(`${working}`).addContents(baseUrl, {
    extensionRename: [['.ts', '.mts']],
    specifierRename: [['.ts', '.mjs']],
    removeNotices: true
  })
  const indexList = await folder(baseUrl).indexList()
  const files = indexList.map(file => (file.endsWith('.ts')) ? file.slice(0, file.lastIndexOf('.ts')) + '.mts' : file)
  await file(`${working}/tsconfig.json`).create(JSON.stringify({
    compilerOptions: {
      strict: true,
      target: "ES2020",
      module: "ESNext",
      declaration: true,
    },
    files
  }, null, 2)) 
  await tsc(options.compiler).run(`-p ${working}/tsconfig.json --outDir ${outdir} --declaration`)
  await folder(`${working}`).delete()
}

// ------------------------------------------------------------------
// AdditionalFiles
// ------------------------------------------------------------------
async function additionalFiles(options: BuildOptions): Promise<void> {
  console.log('build: additional-files')
  const outdir = `${options.outdir}/build`
  for(const additional of options.additional) {
    await folder(outdir).add(additional)
  }
}

// ------------------------------------------------------------------
// Pack
// ------------------------------------------------------------------
async function pack(options: BuildOptions): Promise<void> {
  console.log('build: pack')
  const target = `${options.outdir}/build`
  await shell(`cd ${target} && npm pack`)
}

// ------------------------------------------------------------------
// Check
// ------------------------------------------------------------------
async function check(options: BuildOptions): Promise<number> {
  console.log('build: check')
  const target = `${options.outdir}/build`
  const name = options.packageJson.name.replace('@', '').replaceAll('/', '-')
  const pack = `${target}/${name}-${options.packageJson.version}.tgz`
  return await attw(pack)
}

// ------------------------------------------------------------------
// Build
// ------------------------------------------------------------------
/** Builds a npm package from the given baseUrl */
export async function build(baseUrl: string, options: BuildOptions): Promise<void> {
  await clean(baseUrl, options)
  await createPackageJson(baseUrl, options)
  await createCommonJSAliases(baseUrl, options)
  await additionalFiles(options)
  await Promise.all([
    buildCommonJS(baseUrl, options),
    buildEsm(baseUrl, options)
  ])
  await pack(options)
  await check(options)
}