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

import { path } from "../path/index.ts"

// ----------------------------------------------------------------------
// Remove Module-Level MIT Notice on Package Distribution
//
// The MIT copyright notice unnecessarily increases the distribution
// size of the package. This code removes it. The MIT license remains
// available in the package root.
//
// ----------------------------------------------------------------------
function escape(content: string) {
  return content.split('').map((c) => `\\${c}`).join('')
}
/** Removes the MIT licence on a codefile */
function removeNotice(content: string): string {
  const open = escape('/*--------------------------------------------------------------------------')
  const close = escape('---------------------------------------------------------------------------*/')
  const criteria = 'Permission is hereby granted, free of charge'
  const pattern = new RegExp(`${open}[\\s\\S]*?${close}`, 'gm')
  while (true) {
    const match = pattern.exec(content)
    if (match === null) return content.trimStart()
    if (!match[0].includes(criteria)) continue
    content = content.replace(match[0], '')
  }
}

// ------------------------------------------------------------------
// Rename Extension Rule
// ------------------------------------------------------------------
function renameExtensionRule(filePath: string, rules: [string, string][]): string {
  let renamedPath = filePath;
  for (const [old_extension, new_extension] of rules) {
    if (renamedPath.endsWith(old_extension)) {
      renamedPath = renamedPath.slice(0, -old_extension.length) + new_extension
      break;
    }
  }
  return renamedPath
}

// ------------------------------------------------------------------
// Escape RegExp Special Characters
// ------------------------------------------------------------------
function escapeRegExp(content: string): string {
  return content.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
}

// ------------------------------------------------------------------
// Rename Specifier Rule
// ------------------------------------------------------------------
function renameSpecifierRule(content: string, rules: [string, string][]): string {
  for (const [old_extension, new_extension] of rules) {
    const escapedOldExt = escapeRegExp(old_extension)
    // Replace static imports: e.g. from './module.ts'
    const staticRegex = new RegExp(`(from\\s+['"][^'"]*)${escapedOldExt}(['"])`, "g")
    content = content.replace(staticRegex, `$1${new_extension}$2`)
    // Replace dynamic imports: e.g. import('./module.ts')
    const dynamicRegex = new RegExp(`(import\\(\\s*['"][^'"]*)${escapedOldExt}(['"]\\s*\\))`, "g")
    content = content.replace(dynamicRegex, `$1${new_extension}$2`)
  }
  return content;
}
// ------------------------------------------------------------------
// Process a Single File
// ------------------------------------------------------------------
// async function processFile(srcPath: string, destPath: string, options: AddOptions): Promise<void> {
//   const tsOrJsRegex = /\.(ts|tsx|js|jsx)$/
//   const shouldProcessText = tsOrJsRegex.test(srcPath)
//   const renamedDestPath = renameExtensionRule(destPath, options.extensionRename)
//   if (shouldProcessText) {
//     let content = await Deno.readTextFile(srcPath)
//     content = renameSpecifierRule(content, options.specifierRename)
//     await Deno.writeTextFile(renamedDestPath, content)
//   } else {
//     await Deno.copyFile(srcPath, renamedDestPath)
//   }
//   //console.log(`Copied: ${srcPath} -> ${renamedDestPath}`)
// }
// ------------------------------------------------------------------
// Process a Single File
// ------------------------------------------------------------------
async function processFile(srcPath: string, destPath: string, options: AddOptions): Promise<void> {
  const tsOrJsRegex = /\.(ts|tsx|js|jsx)$/
  const shouldProcessText = tsOrJsRegex.test(srcPath)
  const renamedDestPath = renameExtensionRule(destPath, options.extensionRename)
  if (shouldProcessText) {
    let content = await Deno.readTextFile(srcPath)
    if (options.removeNotices) {
      content = removeNotice(content)
    }
    content = renameSpecifierRule(content, options.specifierRename)
    await Deno.writeTextFile(renamedDestPath, content)
  } else {
    await Deno.copyFile(srcPath, renamedDestPath)
  }
}
// ------------------------------------------------------------------
// Copy Folder (Recursively)
// ------------------------------------------------------------------
async function copyFolder(sourceDirectory: string, targetDirectory: string, options: AddOptions = defaultAddOptions()): Promise<void> {
  await Deno.mkdir(targetDirectory, { recursive: true });
  for await (const entry of Deno.readDir(sourceDirectory)) {
    const srcPath = path.join(sourceDirectory, entry.name);
    const destPath = path.join(targetDirectory, entry.name);
    if (entry.isDirectory) {
      await copyFolder(srcPath, destPath, options);
    } else if (entry.isFile) {
      await processFile(srcPath, destPath, options);
    }
  }
}
// ------------------------------------------------------------------
// Options Interface
// ------------------------------------------------------------------
export interface AddOptions {
  extensionRename: [old_extension: string, new_extension: string][]
  specifierRename: [old_specifier: string, new_specifier: string][]
  removeNotices: boolean
}
function defaultAddOptions(): AddOptions {
  return {
    extensionRename: [], 
    specifierRename: [], 
    removeNotices: false 
  }
}
// ------------------------------------------------------------------
// Add: Copy a File or a Folder into the given directory
// ------------------------------------------------------------------
export async function add(directoryPath: string, fileOrFolderPath: string, options: AddOptions = defaultAddOptions()): Promise<void> {
  await Deno.mkdir(directoryPath, { recursive: true })
  const stat = await Deno.stat(fileOrFolderPath);
  const basename = fileOrFolderPath.split("/").pop()!
  if (stat.isDirectory) {
    const targetPath = path.join(directoryPath, basename)
    await copyFolder(fileOrFolderPath, targetPath, options)
  } else if (stat.isFile) {
    const destPath = path.join(directoryPath, basename)
    await processFile(fileOrFolderPath, destPath, options)
  }
}

// ------------------------------------------------------------------
// Add Contents: Copy the contents of a folder into the given directory
// ------------------------------------------------------------------
export async function addContents(directoryPath: string, folderPath: string, options: AddOptions = defaultAddOptions()): Promise<void> {
  const stat = await Deno.stat(folderPath)
  if (!stat.isDirectory) {
    throw new Error(`Expected directory: ${folderPath}`)
  }
  await Deno.mkdir(directoryPath, { recursive: true })
  for await (const entry of Deno.readDir(folderPath)) {
    const sourcePath = path.join(folderPath, entry.name)
    const targetPath = path.join(directoryPath, entry.name)
    const entryStat = await Deno.stat(sourcePath)
    if (entryStat.isDirectory) {
      await copyFolder(sourcePath, targetPath, options)
    } else if (entryStat.isFile) {
      await processFile(sourcePath, targetPath, options)
    }
  }
}