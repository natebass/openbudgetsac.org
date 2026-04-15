import fs from 'node:fs/promises';
import path from 'node:path';

const SRC_ROOT = process.cwd();
const OUTPUT_ROOT = path.join(SRC_ROOT, 'docs', 'jsdoc');
const TARGETS = ['.'];
const DOCBLOCK_REGEX = /\/\*\*[\s\S]*?\*\//g;
const EXCLUDE_SEGMENTS = new Set([
  '.cache',
  'build',
  'coverage',
  'docs',
  'generated',
  'node_modules',
]);
const SOURCE_FILE_RE = /\.(?:[cm]?ts|tsx|jsx|js)$/i;

/**
 * Builds normalize slashes.
 *
 * @param {any} value Input value.
 * @returns {any} Function result.
 */
function normalizeSlashes(value: string): string {
  return value.split(path.sep).join('/');
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
 * Checks whether should exclude path.
 *
 * @param {any} filePath Input value.
 * @returns {any} Function result.
 */
function shouldExcludePath(filePath: string): boolean {
  return normalizeSlashes(filePath).split('/').some((segment) => EXCLUDE_SEGMENTS.has(segment));
}

/**
 * Runs walk.
 *
 * @param {any} entryPath Input value.
 * @returns {any} Function result.
 */
async function walk(entryPath: string): Promise<Array<string>> {
  const stat = await fs.stat(entryPath);
  if (stat.isFile()) {
    return isSourceFile(entryPath) && !shouldExcludePath(entryPath) ? [entryPath] : [];
  }
  if (!stat.isDirectory()) {
    return [];
  }

  const children = await fs.readdir(entryPath);
  const nested = await Promise.all(children.map(async (child) => {
    const childPath = path.join(entryPath, child);
    return shouldExcludePath(childPath) ? [] : await walk(childPath);
  }));

  return nested.flat();
}

/**
 * Gets find next code line.
 *
 * @param {any} source Input value.
 * @param {any} afterIndex Input value.
 * @returns {any} Function result.
 */
function findNextCodeLine(source: string, afterIndex: number): string {
  const tail = source.slice(afterIndex);
  const lines = tail.split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('//') || line.startsWith('/*')) {
      continue;
    }
    return line.length > 180 ? `${line.slice(0, 177)}...` : line;
  }
  return '(no following declaration found)';
}

/**
 * Builds build file doc.
 *
 * @param {any} relativeFilePath Input value.
 * @param {any} source Input value.
 * @returns {any} Function result.
 */
function buildFileDoc(relativeFilePath: string, source: string): string {
  const blocks = Array.from(source.matchAll(DOCBLOCK_REGEX)).map((match) => {
    const block = match[0];
    const endIndex = (match.index || 0) + block.length;
    return {
      block,
      nextLine: findNextCodeLine(source, endIndex),
    };
  });

  const infoString = relativeFilePath.endsWith('tsx') ? 'tsx' : relativeFilePath.endsWith('ts') ? 'ts' : 'js';
  const lines = [
    `# ${relativeFilePath}`,
    '',
    `- JSDoc blocks found: ${blocks.length}`,
    '',
  ];

  if (blocks.length === 0) {
    lines.push('No JSDoc blocks were found in this file.', '');
    return lines.join('\n');
  }

  blocks.forEach((entry, index) => {
    lines.push(`## Block ${index + 1}`, '');
    lines.push(`Associated declaration: \`${entry.nextLine.replace(/`/g, '\\`')}\``, '');
    lines.push(`\`\`\`${infoString}`);
    lines.push(entry.block);
    lines.push('```', '');
  });

  return lines.join('\n');
}

/**
 * Runs ensure clean output.
 *
 * @returns {any} Function result.
 */
async function ensureCleanOutput(): Promise<void> {
  await fs.rm(OUTPUT_ROOT, {recursive: true, force: true});
  await fs.mkdir(path.join(OUTPUT_ROOT, 'files'), {recursive: true});
}

/**
 * Runs unique sorted.
 *
 * @param {any} items Input value.
 * @returns {any} Function result.
 */
function uniqueSorted(items: Array<string>): Array<string> {
  return [...new Set(items)].sort((left, right) => left.localeCompare(right));
}

/**
 * Gets get target path.
 *
 * @param {any} target Input value.
 * @returns {any} Function result.
 */
function getTargetPath(target: string): string {
  return path.join(SRC_ROOT, target);
}

/**
 * Runs gather files.
 *
 * @returns {any} Function result.
 */
async function gatherFiles(): Promise<Array<string>> {
  const files: Array<string> = [];
  for (const target of TARGETS) {
    const absolutePath = getTargetPath(target);
    try {
      files.push(...await walk(absolutePath));
    } catch {
      // Keep going when an optional target is missing.
    }
  }
  return uniqueSorted(files);
}

/**
 * Sets write docs for file.
 *
 * @param {any} absolutePath Input value.
 * @returns {any} Function result.
 */
async function writeDocsForFile(absolutePath: string): Promise<{blockCount: number; outputFilePath: string; relativeFilePath: string}> {
  const relativeFilePath = normalizeSlashes(path.relative(SRC_ROOT, absolutePath));
  const source = await fs.readFile(absolutePath, 'utf8');
  const markdown = buildFileDoc(relativeFilePath, source);
  const outputFilePath = path.join(
    OUTPUT_ROOT,
    'files',
    relativeFilePath.replace(/\.(?:[cm]?ts|tsx|jsx|js)$/i, '.md'),
  );

  await fs.mkdir(path.dirname(outputFilePath), {recursive: true});
  await fs.writeFile(outputFilePath, markdown, 'utf8');

  return {
    blockCount: (source.match(DOCBLOCK_REGEX) || []).length,
    outputFilePath,
    relativeFilePath,
  };
}

/**
 * Sets write index.
 *
 * @param {any} entries Input value.
 * @returns {any} Function result.
 */
async function writeIndex(entries: Array<{blockCount: number; outputFilePath: string; relativeFilePath: string}>): Promise<void> {
  const lines = [
    '# Source JSDoc Index',
    '',
    `Generated on ${new Date().toISOString()}.`,
    '',
    `Total files scanned: ${entries.length}`,
    '',
    '| File | JSDoc Blocks | Generated Doc |',
    '| --- | ---: | --- |',
  ];

  entries.forEach((entry) => {
    const relativeDocPath = normalizeSlashes(path.relative(OUTPUT_ROOT, entry.outputFilePath));
    lines.push(`| \`${entry.relativeFilePath}\` | ${entry.blockCount} | [${relativeDocPath}](${relativeDocPath}) |`);
  });

  lines.push('');
  await fs.writeFile(path.join(OUTPUT_ROOT, 'README.md'), lines.join('\n'), 'utf8');
}

/**
 * Runs main.
 *
 * @returns {any} Function result.
 */
async function main(): Promise<void> {
  await ensureCleanOutput();
  const files = await gatherFiles();
  const entries = await Promise.all(files.map(writeDocsForFile));
  entries.sort((left, right) => left.relativeFilePath.localeCompare(right.relativeFilePath));
  await writeIndex(entries);
  console.log(`Generated JSDoc documentation for ${entries.length} files in ${normalizeSlashes(path.relative(SRC_ROOT, OUTPUT_ROOT))}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
