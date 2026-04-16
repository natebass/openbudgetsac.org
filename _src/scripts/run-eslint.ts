import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {ESLint} from 'eslint';

/**
 * Loads the flat ESLint config from the TypeScript config file.
 *
 * @returns {Promise<Array<unknown>>} ESLint flat config entries.
 */
async function loadFlatConfig(): Promise<Array<unknown>> {
  const configPath = path.join(process.cwd(), 'eslint.config.ts');
  const configModule = await import(pathToFileURL(configPath).href);
  const config = (configModule.default ?? configModule) as Array<unknown>;
  return config;
}

/**
 * Sums a numeric field across all ESLint results.
 *
 * @param {Array<ESLint.LintResult>} results ESLint result list.
 * @param {'errorCount' | 'fatalErrorCount' | 'warningCount'} field Field name.
 * @returns {number} Total count.
 */
function sumResultField(
  results: Array<ESLint.LintResult>,
  field: 'errorCount' | 'fatalErrorCount' | 'warningCount',
): number {
  return results.reduce(function(total, result) {
    return total + result[field];
  }, 0);
}

/**
 * Runs ESLint with the repository's TypeScript flat config.
 *
 * @returns {Promise<void>} Completion signal.
 */
async function main(): Promise<void> {
  const config = await loadFlatConfig();
  const eslint = new ESLint({
    cwd: process.cwd(),
    overrideConfig: config,
    overrideConfigFile: true,
  });

  const results = await eslint.lintFiles(['.']);
  const formatter = await eslint.loadFormatter('stylish');
  const output = formatter.format(results);
  if (output) {
    console.log(output);
  }

  const errorCount = sumResultField(results, 'errorCount') +
    sumResultField(results, 'fatalErrorCount');
  const warningCount = sumResultField(results, 'warningCount');
  if (errorCount > 0 || warningCount > 0) {
    process.exitCode = 1;
  }
}

main().catch(function(error: unknown) {
  console.error(error);
  process.exit(1);
});
