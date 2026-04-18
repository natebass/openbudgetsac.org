const net = require('node:net');
const {spawn} = require('node:child_process');

/**
 * Gets parse args.
 *
 * @returns {any} Function result.
 */
function parseArgs() {
  const args = new Set(process.argv.slice(2));
  return {
    noBuild: args.has('--nobuild'),
    inBand: args.has('--in-band'),
  };
}

/**
 * Runs run command.
 *
 * @param {any} command Input value.
 * @param {any} args Input value.
 * @param {any} env Input value.
 * @returns {any} Function result.
 */
function runCommand(command, args, env) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      env,
      shell: false,
    });

    child.on('error', reject);
    child.on('close', (code, signal) => {
      if (signal) {
        reject(new Error(`${command} exited with signal ${signal}`));
        return;
      }
      resolve(code || 0);
    });
  });
}

/**
 * Checks whether can bind port.
 *
 * @param {any} host Input value.
 * @param {any} port Input value.
 * @returns {any} Function result.
 */
function canBindPort(host, port) {
  return new Promise(resolve => {
    const server = net.createServer();

    server.once('error', () => {
      resolve(false);
    });

    server.listen(port, host, () => {
      server.close(() => resolve(true));
    });
  });
}

/**
 * Gets get random port.
 *
 * @param {any} host Input value.
 * @returns {any} Function result.
 */
function getRandomPort(host) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();

    server.once('error', reject);
    server.listen(0, host, () => {
      const address = server.address();
      const port = typeof address === 'object' && address ? address.port : null;
      server.close(closeError => {
        if (closeError) {
          reject(closeError);
          return;
        }

        if (!port) {
          reject(new Error('Unable to resolve an available port.'));
          return;
        }

        resolve(port);
      });
    });
  });
}

/**
 * Gets resolve port.
 *
 * @param {any} host Input value.
 * @returns {any} Function result.
 */
async function resolvePort(host) {
  const preferred = Number(process.env.E2E_PORT || 18011);
  if (Number.isInteger(preferred) && preferred > 0 && preferred <= 65535) {
    const preferredAvailable = await canBindPort(host, preferred);
    if (preferredAvailable) {
      return preferred;
    }
  }

  return await getRandomPort(host);
}

/**
 * Runs main.
 *
 * @returns {any} Function result.
 */
async function main() {
  const host = process.env.HOST || '127.0.0.1';
  const options = parseArgs();
  const port = await resolvePort(host);
  const baseUrl = `http://${host}:${port}`;

  console.log(`[e2e] Using ${baseUrl}`);

  const serverScript = options.noBuild
    ? 'npm run serve:test:static:nobuild'
    : 'npm run serve:test:static';
  const testScript = options.inBand
    ? 'npm run test:e2e:run:ci'
    : 'npm run test:e2e:run';

  const exitCode = await runCommand(
    'npx',
    ['start-server-and-test', serverScript, baseUrl, testScript],
    {
      ...process.env,
      HOST: host,
      PORT: String(port),
      BASE_URL: baseUrl,
    },
  );

  process.exit(Number(exitCode));
}

main().catch(error => {
  console.error('[e2e] Failed to run end-to-end tests.');
  console.error(error.message);
  process.exit(1);
});
