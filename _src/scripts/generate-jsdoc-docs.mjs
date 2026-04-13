import fs from 'node:fs/promises'
import path from 'node:path'

const SRC_ROOT = process.cwd()
const OUTPUT_ROOT = path.join(SRC_ROOT, 'docs', 'jsdoc')

const TARGETS = ['.']

const EXCLUDE_SEGMENTS = new Set([
  'node_modules',
  '.cache'
])

const DOCBLOCK_REGEX = /\/\*\*[\s\S]*?\*\//g

function normalizeSlashes (value) {
  return value.split(path.sep).join('/')
}

function isJavaScriptFile (filePath) {
  return filePath.endsWith('.js') || filePath.endsWith('.jsx')
}

function shouldExcludePath (filePath) {
  const normalized = normalizeSlashes(filePath)
  return normalized.split('/').some(segment => EXCLUDE_SEGMENTS.has(segment))
}

async function walk (entryPath) {
  const stat = await fs.stat(entryPath)
  if (stat.isFile()) {
    return isJavaScriptFile(entryPath) && !shouldExcludePath(entryPath) ? [entryPath] : []
  }

  if (!stat.isDirectory()) {
    return []
  }

  const children = await fs.readdir(entryPath)
  const nested = await Promise.all(children.map(async (child) => {
    const childPath = path.join(entryPath, child)
    if (shouldExcludePath(childPath)) {
      return []
    }
    return walk(childPath)
  }))

  return nested.flat()
}

function findNextCodeLine (source, afterIndex) {
  const tail = source.slice(afterIndex)
  const lines = tail.split(/\r?\n/)
  for (const raw of lines) {
    const line = raw.trim()
    if (!line) {
      continue
    }
    if (line.startsWith('//')) {
      continue
    }
    if (line.startsWith('/*')) {
      continue
    }
    return line.length > 180 ? line.slice(0, 177) + '...' : line
  }
  return '(no following declaration found)'
}

function buildFileDoc (relativeFilePath, source) {
  const blocks = []
  for (const match of source.matchAll(DOCBLOCK_REGEX)) {
    const block = match[0]
    const endIndex = (match.index || 0) + block.length
    blocks.push({
      block,
      nextLine: findNextCodeLine(source, endIndex)
    })
  }

  const lines = []
  lines.push(`# ${relativeFilePath}`)
  lines.push('')
  lines.push(`- JSDoc blocks found: ${blocks.length}`)
  lines.push('')

  if (blocks.length === 0) {
    lines.push('No JSDoc blocks were found in this file.')
    lines.push('')
    return lines.join('\n')
  }

  blocks.forEach((entry, index) => {
    lines.push(`## Block ${index + 1}`)
    lines.push('')
    lines.push(`Associated declaration: \`${entry.nextLine.replace(/`/g, '\\`')}\``)
    lines.push('')
    lines.push('```js')
    lines.push(entry.block)
    lines.push('```')
    lines.push('')
  })

  return lines.join('\n')
}

async function ensureCleanOutput () {
  await fs.rm(OUTPUT_ROOT, { recursive: true, force: true })
  await fs.mkdir(path.join(OUTPUT_ROOT, 'files'), { recursive: true })
}

function uniqueSorted (items) {
  return [...new Set(items)].sort((a, b) => a.localeCompare(b))
}

function getTargetPath (target) {
  return path.join(SRC_ROOT, target)
}

async function gatherFiles () {
  const paths = []
  for (const target of TARGETS) {
    const absolute = getTargetPath(target)
    try {
      const discovered = await walk(absolute)
      paths.push(...discovered)
    } catch {
      // Ignore missing targets.
    }
  }
  return uniqueSorted(paths)
}

async function writeDocsForFile (absolutePath) {
  const relativeFilePath = normalizeSlashes(path.relative(SRC_ROOT, absolutePath))
  const source = await fs.readFile(absolutePath, 'utf8')
  const markdown = buildFileDoc(relativeFilePath, source)

  const outputFilePath = path.join(OUTPUT_ROOT, 'files', relativeFilePath.replace(/\.(js|jsx)$/i, '.md'))
  await fs.mkdir(path.dirname(outputFilePath), { recursive: true })
  await fs.writeFile(outputFilePath, markdown, 'utf8')

  const blockCount = (source.match(DOCBLOCK_REGEX) || []).length
  return { relativeFilePath, outputFilePath, blockCount }
}

async function writeIndex (entries) {
  const lines = []
  lines.push('# JavaScript JSDoc Index')
  lines.push('')
  lines.push(`Generated on ${new Date().toISOString()}.`)
  lines.push('')
  lines.push(`Total files scanned: ${entries.length}`)
  lines.push('')
  lines.push('| File | JSDoc Blocks | Generated Doc |')
  lines.push('| --- | ---: | --- |')

  entries.forEach((entry) => {
    const relativeDocPath = normalizeSlashes(path.relative(OUTPUT_ROOT, entry.outputFilePath))
    lines.push(`| \`${entry.relativeFilePath}\` | ${entry.blockCount} | [${relativeDocPath}](${relativeDocPath}) |`)
  })

  lines.push('')
  await fs.writeFile(path.join(OUTPUT_ROOT, 'README.md'), lines.join('\n'), 'utf8')
}

async function main () {
  await ensureCleanOutput()
  const files = await gatherFiles()
  const entries = await Promise.all(files.map(writeDocsForFile))
  entries.sort((a, b) => a.relativeFilePath.localeCompare(b.relativeFilePath))
  await writeIndex(entries)
  console.log(`Generated JSDoc documentation for ${entries.length} files in ${normalizeSlashes(path.relative(SRC_ROOT, OUTPUT_ROOT))}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
