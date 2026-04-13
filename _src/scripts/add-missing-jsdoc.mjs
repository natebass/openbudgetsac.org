import fs from 'node:fs/promises'
import path from 'node:path'
import { parse } from '@babel/parser'

const ROOT = process.cwd()
const EXCLUDE_PREFIXES = [
  'node_modules/',
  '.cache/',
  'docs/',
  'coverage/',
  'css/bower_components/',
  'js/dist/',
  'styles/'
]

function normalizeRel (filePath) {
  return filePath.split(path.sep).join('/')
}

function shouldSkip (relativePath) {
  const rel = normalizeRel(relativePath)
  return EXCLUDE_PREFIXES.some((prefix) => rel.startsWith(prefix))
}

async function collectFiles (dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const out = []
  for (const entry of entries) {
    const abs = path.join(dir, entry.name)
    const rel = normalizeRel(path.relative(ROOT, abs))
    if (shouldSkip(rel)) continue
    if (entry.isDirectory()) {
      out.push(...(await collectFiles(abs)))
      continue
    }
    if (entry.isFile() && (abs.endsWith('.js') || abs.endsWith('.jsx'))) {
      out.push(abs)
    }
  }
  return out
}

function hasJSDocBefore (node, comments) {
  const leading = comments
    .filter((comment) => comment.end <= node.start)
    .slice(-2)
  if (!leading.length) return false
  const last = leading[leading.length - 1]
  return last.type === 'CommentBlock' && last.value.startsWith('*')
}

function toWords (name) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .trim()
    .toLowerCase()
}

function describeName (name) {
  const words = toWords(name)
  if (/^(is|has|can|should|supports|validate|assert)/i.test(name)) {
    return `Checks whether ${words}.`
  }
  if (/^(get|fetch|read|list|find|resolve|collect|parse)/i.test(name)) {
    return `Gets ${words}.`
  }
  if (/^(set|apply|write|save|update|propagate)/i.test(name)) {
    return `Sets ${words}.`
  }
  if (/^(build|create|derive|format|normalize|interpolate)/i.test(name)) {
    return `Builds ${words}.`
  }
  if (/^(run|print|log|walk|merge|reduce|promote|sample|ensure)/i.test(name)) {
    return `Runs ${words}.`
  }
  return `Runs ${words}.`
}

function paramName (node, idx) {
  if (!node) return `param${idx + 1}`
  if (node.type === 'Identifier') return node.name
  if (node.type === 'AssignmentPattern') return paramName(node.left, idx)
  if (node.type === 'RestElement') return paramName(node.argument, idx)
  if (node.type === 'ObjectPattern') return `options${idx ? idx + 1 : ''}`
  if (node.type === 'ArrayPattern') return `items${idx ? idx + 1 : ''}`
  return `param${idx + 1}`
}

function getIndent (source, index) {
  const lineStart = source.lastIndexOf('\n', index - 1) + 1
  const prefix = source.slice(lineStart, index)
  const match = prefix.match(/^\s*/)
  return match ? match[0] : ''
}

function getFunctionName (node, parent) {
  if (node.type === 'FunctionDeclaration' && node.id?.name) return node.id.name
  if ((node.type === 'FunctionExpression' || node.type === 'ArrowFunctionExpression') && parent?.type === 'VariableDeclarator' && parent.id?.type === 'Identifier') {
    return parent.id.name
  }
  if ((node.type === 'FunctionExpression' || node.type === 'ArrowFunctionExpression') && parent?.type === 'AssignmentExpression') {
    if (parent.left?.type === 'Identifier') return parent.left.name
    if (parent.left?.type === 'MemberExpression') {
      if (!parent.left.computed && parent.left.property?.name) return parent.left.property.name
      if (parent.left.computed && parent.left.property?.type === 'StringLiteral') return parent.left.property.value
    }
  }
  if ((node.type === 'ObjectMethod' || node.type === 'ClassMethod') && !node.computed) {
    if (node.key?.type === 'Identifier') return node.key.name
    if (node.key?.type === 'StringLiteral') return node.key.value
  }
  return null
}

function buildJSDoc (name, params, indent) {
  const lines = []
  lines.push(`${indent}/**`)
  lines.push(`${indent} * ${describeName(name)}`)
  lines.push(`${indent} *`)
  for (let i = 0; i < params.length; i++) {
    const pName = paramName(params[i], i)
    lines.push(`${indent} * @param {any} ${pName} Input value.`)
  }
  lines.push(`${indent} * @returns {any} Function result.`)
  lines.push(`${indent} */`)
  return lines.join('\n') + '\n'
}

function traverseAndCollect (node, parent, comments, source, inserts) {
  if (!node || typeof node !== 'object') return

  const fnTypes = new Set(['FunctionDeclaration', 'FunctionExpression', 'ArrowFunctionExpression', 'ObjectMethod', 'ClassMethod'])
  if (fnTypes.has(node.type)) {
    const name = getFunctionName(node, parent)
    if (name && !hasJSDocBefore(node, comments)) {
      const indent = getIndent(source, node.start)
      inserts.push({
        index: node.start,
        text: buildJSDoc(name, node.params || [], indent)
      })
    }
  }

  for (const [key, value] of Object.entries(node)) {
    if (key === 'loc' || key === 'start' || key === 'end' || key === 'leadingComments' || key === 'trailingComments' || key === 'innerComments') continue
    if (Array.isArray(value)) {
      for (const child of value) {
        if (child && typeof child === 'object') traverseAndCollect(child, node, comments, source, inserts)
      }
      continue
    }
    if (value && typeof value === 'object') {
      traverseAndCollect(value, node, comments, source, inserts)
    }
  }
}

async function patchFile (absolutePath) {
  const source = await fs.readFile(absolutePath, 'utf8')
  let ast
  try {
    ast = parse(source, {
      sourceType: 'unambiguous',
      plugins: ['jsx'],
      errorRecovery: false,
      attachComment: true
    })
  } catch {
    return { relativePath: normalizeRel(path.relative(ROOT, absolutePath)), inserted: 0, skipped: true }
  }

  const inserts = []
  traverseAndCollect(ast.program, null, ast.comments || [], source, inserts)

  if (!inserts.length) {
    return { relativePath: normalizeRel(path.relative(ROOT, absolutePath)), inserted: 0, skipped: false }
  }

  const sorted = inserts.sort((a, b) => b.index - a.index)
  let nextSource = source
  for (const insert of sorted) {
    nextSource = nextSource.slice(0, insert.index) + insert.text + nextSource.slice(insert.index)
  }

  await fs.writeFile(absolutePath, nextSource, 'utf8')
  return {
    relativePath: normalizeRel(path.relative(ROOT, absolutePath)),
    inserted: inserts.length,
    skipped: false
  }
}

async function main () {
  const files = (await collectFiles(ROOT)).sort((a, b) => a.localeCompare(b))
  let totalInserted = 0
  const changed = []

  for (const file of files) {
    const result = await patchFile(file)
    if (result.skipped) continue
    if (result.inserted > 0) {
      totalInserted += result.inserted
      changed.push(result)
    }
  }

  for (const entry of changed) {
    console.log(`${entry.relativePath}: +${entry.inserted} JSDoc block(s)`)
  }
  console.log(`TOTAL_INSERTED=${totalInserted}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
