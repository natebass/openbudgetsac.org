const fs = require('node:fs/promises');
const path = require('node:path');

const GENERATED_JS_DIR = path.resolve(__dirname, '../generated/js');
const CJS_PROLOGUE =
  /(?:^|\r?\n)Object\.defineProperty\(exports,\s*"__esModule",\s*\{\s*value:\s*true\s*\}\);\r?\n?/;

/**
 * Recursively collects JavaScript files from a directory.
 *
 * @param {string} dir Directory path.
 * @returns {Promise<string[]>} Absolute JS file paths.
 */
async function collectJsFiles(dir: string): Promise<Array<string>> {
  const entries = await fs.readdir(dir, {withFileTypes: true});
  const fileLists = await Promise.all(
    entries.map(async entry => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return await collectJsFiles(fullPath);
      }
      return entry.isFile() && fullPath.endsWith('.js') ? [fullPath] : [];
    }),
  );
  return fileLists.flat();
}

/**
 * Removes TypeScript CommonJS prologue lines that break browser globals.
 *
 * @returns {Promise<void>} Completion promise.
 */
async function stripCjsPrologue(): Promise<void> {
  const files = await collectJsFiles(GENERATED_JS_DIR);
  let updated = 0;

  await Promise.all(
    files.map(async filePath => {
      const source = await fs.readFile(filePath, 'utf8');
      const next = source.replace(CJS_PROLOGUE, '\n');
      if (next !== source) {
        updated += 1;
        await fs.writeFile(filePath, next, 'utf8');
      }
    }),
  );

  console.log(`[strip-cjs-prologue] Updated ${updated} generated JS file(s).`);
}

stripCjsPrologue().catch((error: Error) => {
  console.error('[strip-cjs-prologue] Failed to patch generated JS output.');
  console.error(error.message);
  process.exit(1);
});
