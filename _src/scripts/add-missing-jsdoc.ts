import fs from 'node:fs/promises';
import path from 'node:path';
import {parse} from '@babel/parser';
import type {ParserOptions} from '@babel/parser';

const ROOT = process.cwd();
const CHECK_MODE = process.argv.includes('--check');
const EXCLUDED_PATH_PREFIXES = [
  'build/',
  'coverage/',
  'css/bower_components/',
  'docs/',
  'generated/',
  'js/dist/',
  'node_modules/',
  'styles/',
  'vendor/',
];
const AST_IGNORED_KEYS = new Set([
  'loc',
  'start',
  'end',
  'leadingComments',
  'trailingComments',
  'innerComments',
]);
const FUNCTION_NODE_TYPES = new Set([
  'FunctionDeclaration',
  'FunctionExpression',
  'ArrowFunctionExpression',
  'ObjectMethod',
  'ClassMethod',
]);
const PARSER_OPTIONS: ParserOptions = {
  sourceType: 'unambiguous',
  plugins: ['jsx', 'typescript'],
  errorRecovery: false,
  attachComment: true,
};
const SOURCE_FILE_RE = /\.(?:[cm]?ts|tsx|jsx|js)$/i;

/**
 * Builds normalize relative.
 *
 * @param {any} filePath Input value.
 * @returns {any} Function result.
 */
function normalizeRelative(filePath: string): string {
  return filePath.split(path.sep).join('/');
}

/**
 * Checks whether should skip.
 *
 * @param {any} relativePath Input value.
 * @returns {any} Function result.
 */
function shouldSkip(relativePath: string): boolean {
  const normalized = normalizeRelative(relativePath);
  return EXCLUDED_PATH_PREFIXES.some(prefix => normalized.startsWith(prefix));
}

/**
 * Checks whether is source file.
 *
 * @param {any} filePath Input value.
 * @returns {any} Function result.
 */
function isSourceFile(filePath: string): boolean {
  return SOURCE_FILE_RE.test(filePath) && !filePath.endsWith('.d.ts');
}

/**
 * Gets collect files.
 *
 * @param {any} dir Input value.
 * @returns {any} Function result.
 */
async function collectFiles(dir: string): Promise<Array<string>> {
  const entries = await fs.readdir(dir, {withFileTypes: true});
  const files: Array<string> = [];

  for (const entry of entries) {
    const absolutePath = path.join(dir, entry.name);
    const relativePath = normalizeRelative(path.relative(ROOT, absolutePath));
    if (shouldSkip(relativePath)) {
      continue;
    }
    if (entry.isDirectory()) {
      files.push(...(await collectFiles(absolutePath)));
      continue;
    }
    if (entry.isFile() && isSourceFile(absolutePath)) {
      files.push(absolutePath);
    }
  }

  return files;
}

/**
 * Checks whether has jsdoc before.
 *
 * @param {any} node Input value.
 * @param {any} comments Input value.
 * @returns {any} Function result.
 */
function hasJSDocBefore(node: any, comments: Array<any>): boolean {
  const leading = comments
    .filter(comment => comment.end <= node.start)
    .slice(-2);
  if (!leading.length) {
    return false;
  }
  const last = leading[leading.length - 1];
  return last.type === 'CommentBlock' && last.value.startsWith('*');
}

/**
 * Runs to words.
 *
 * @param {any} name Input value.
 * @returns {any} Function result.
 */
function toWords(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .trim()
    .toLowerCase();
}

/**
 * Runs describe name.
 *
 * @param {any} name Input value.
 * @returns {any} Function result.
 */
function describeName(name: string): string {
  const words = toWords(name);
  if (/^(is|has|can|should|supports|validate|assert)/i.test(name)) {
    return `Checks whether ${words}.`;
  }
  if (/^(get|fetch|read|list|find|resolve|collect|parse)/i.test(name)) {
    return `Gets ${words}.`;
  }
  if (/^(set|apply|write|save|update|propagate)/i.test(name)) {
    return `Sets ${words}.`;
  }
  if (/^(build|create|derive|format|normalize|interpolate)/i.test(name)) {
    return `Builds ${words}.`;
  }
  return `Runs ${words}.`;
}

/**
 * Runs param name.
 *
 * @param {any} node Input value.
 * @param {any} index Input value.
 * @returns {any} Function result.
 */
function paramName(node: any, index: number): string {
  if (!node) {
    return `param${index + 1}`;
  }
  if (node.type === 'Identifier') {
    return node.name;
  }
  if (node.type === 'AssignmentPattern') {
    return paramName(node.left, index);
  }
  if (node.type === 'RestElement') {
    return paramName(node.argument, index);
  }
  if (node.type === 'ObjectPattern') {
    return `options${index ? index + 1 : ''}`;
  }
  if (node.type === 'ArrayPattern') {
    return `items${index ? index + 1 : ''}`;
  }
  return `param${index + 1}`;
}

/**
 * Gets get indent.
 *
 * @param {any} source Input value.
 * @param {any} index Input value.
 * @returns {any} Function result.
 */
function getIndent(source: string, index: number): string {
  const lineStart = source.lastIndexOf('\n', index - 1) + 1;
  const prefix = source.slice(lineStart, index);
  const match = prefix.match(/^\s*/);
  return match ? match[0] : '';
}

/**
 * Gets get function name.
 *
 * @param {any} node Input value.
 * @param {any} parent Input value.
 * @returns {any} Function result.
 */
function getFunctionName(node: any, parent: any): string | null {
  if (node.type === 'FunctionDeclaration' && node.id?.name) {
    return node.id.name;
  }
  if (
    (node.type === 'FunctionExpression' ||
      node.type === 'ArrowFunctionExpression') &&
    parent?.type === 'VariableDeclarator' &&
    parent.id?.type === 'Identifier'
  ) {
    return parent.id.name;
  }
  if (
    (node.type === 'FunctionExpression' ||
      node.type === 'ArrowFunctionExpression') &&
    parent?.type === 'AssignmentExpression'
  ) {
    if (parent.left?.type === 'Identifier') {
      return parent.left.name;
    }
    if (parent.left?.type === 'MemberExpression') {
      if (!parent.left.computed && parent.left.property?.name) {
        return parent.left.property.name;
      }
      if (
        parent.left.computed &&
        parent.left.property?.type === 'StringLiteral'
      ) {
        return parent.left.property.value;
      }
    }
  }
  if (
    (node.type === 'ObjectMethod' || node.type === 'ClassMethod') &&
    !node.computed
  ) {
    if (node.key?.type === 'Identifier') {
      return node.key.name;
    }
    if (node.key?.type === 'StringLiteral') {
      return node.key.value;
    }
  }
  return null;
}

/**
 * Builds build jsdoc.
 *
 * @param {any} name Input value.
 * @param {any} params Input value.
 * @param {any} indent Input value.
 * @returns {any} Function result.
 */
function buildJSDoc(name: string, params: Array<any>, indent: string): string {
  const lines = [
    `${indent}/**`,
    `${indent} * ${describeName(name)}`,
    `${indent} *`,
  ];

  params.forEach((param, index) => {
    lines.push(
      `${indent} * @param {any} ${paramName(param, index)} Input value.`,
    );
  });

  lines.push(`${indent} * @returns {any} Function result.`);
  lines.push(`${indent} */`);
  return `${lines.join('\n')}\n`;
}

/**
 * Runs traverse and collect.
 *
 * @param {any} node Input value.
 * @param {any} parent Input value.
 * @param {any} comments Input value.
 * @param {any} source Input value.
 * @param {any} inserts Input value.
 * @returns {any} Function result.
 */
function traverseAndCollect(
  node: any,
  parent: any,
  comments: Array<any>,
  source: string,
  inserts: Array<{index: number; text: string}>,
): void {
  if (!node || typeof node !== 'object') {
    return;
  }

  if (FUNCTION_NODE_TYPES.has(node.type)) {
    const name = getFunctionName(node, parent);
    if (name && !hasJSDocBefore(node, comments)) {
      inserts.push({
        index: node.start,
        text: buildJSDoc(
          name,
          node.params || [],
          getIndent(source, node.start),
        ),
      });
    }
  }

  for (const [key, value] of Object.entries(node)) {
    if (AST_IGNORED_KEYS.has(key)) {
      continue;
    }
    if (Array.isArray(value)) {
      value.forEach(child => {
        if (child && typeof child === 'object') {
          traverseAndCollect(child, node, comments, source, inserts);
        }
      });
      continue;
    }
    if (value && typeof value === 'object') {
      traverseAndCollect(value, node, comments, source, inserts);
    }
  }
}

/**
 * Runs patch file.
 *
 * @param {any} absolutePath Input value.
 * @returns {any} Function result.
 */
async function patchFile(
  absolutePath: string,
): Promise<{inserted: number; relativePath: string; skipped: boolean}> {
  const source = await fs.readFile(absolutePath, 'utf8');
  let ast;

  try {
    ast = parse(source, PARSER_OPTIONS);
  } catch {
    return {
      inserted: 0,
      relativePath: normalizeRelative(path.relative(ROOT, absolutePath)),
      skipped: true,
    };
  }

  const inserts: Array<{index: number; text: string}> = [];
  traverseAndCollect(ast.program, null, ast.comments || [], source, inserts);
  if (!inserts.length) {
    return {
      inserted: 0,
      relativePath: normalizeRelative(path.relative(ROOT, absolutePath)),
      skipped: false,
    };
  }

  let nextSource = source;
  inserts
    .sort((left, right) => right.index - left.index)
    .forEach(insert => {
      nextSource =
        nextSource.slice(0, insert.index) +
        insert.text +
        nextSource.slice(insert.index);
    });

  if (!CHECK_MODE) {
    await fs.writeFile(absolutePath, nextSource, 'utf8');
  }
  return {
    inserted: inserts.length,
    relativePath: normalizeRelative(path.relative(ROOT, absolutePath)),
    skipped: false,
  };
}

/**
 * Runs main.
 *
 * @returns {any} Function result.
 */
async function main(): Promise<void> {
  const files = (await collectFiles(ROOT)).sort((left, right) =>
    left.localeCompare(right),
  );
  let totalInserted = 0;
  const changed: Array<{inserted: number; relativePath: string}> = [];

  for (const file of files) {
    const result = await patchFile(file);
    if (result.skipped || result.inserted === 0) {
      continue;
    }
    totalInserted += result.inserted;
    changed.push(result);
  }

  changed.forEach(entry => {
    console.log(`${entry.relativePath}: +${entry.inserted} JSDoc block(s)`);
  });
  console.log(
    `${CHECK_MODE ? 'TOTAL_MISSING' : 'TOTAL_INSERTED'}=${totalInserted}`,
  );
  if (CHECK_MODE && totalInserted > 0) {
    process.exit(1);
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
