const fs = require('node:fs/promises');
const http = require('node:http');
const path = require('node:path');
const zlib = require('node:zlib');

const BUILD_DIR = path.resolve(__dirname, '../../build');
const HOST = process.env.HOST || '127.0.0.1';
const PORT = Number(process.env.PORT || 8011);

const CONTENT_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

/**
 * Sets set security headers.
 *
 * @param {any} res Input value.
 * @returns {any} Function result.
 */
function setSecurityHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
}

/**
 * Builds build etag.
 *
 * @param {any} stat Input value.
 * @returns {any} Function result.
 */
function buildEtag(stat) {
  return `W/"${stat.size}-${Math.floor(stat.mtimeMs)}"`;
}

/**
 * Checks whether is text response.
 *
 * @param {any} contentType Input value.
 * @returns {any} Function result.
 */
function isTextResponse(contentType) {
  return contentType.startsWith('text/') || contentType.includes('javascript') || contentType.includes('json') || contentType.includes('svg');
}

const server = http.createServer(async (req, res) => {
  setSecurityHeaders(res);
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, {'Content-Type': 'text/plain; charset=utf-8', 'Allow': 'GET, HEAD'});
    res.end('Method Not Allowed');
    return;
  }

  try {
    const reqUrl = new URL(req.url || '/', 'http://127.0.0.1');
    const pathname = decodeURIComponent(reqUrl.pathname);
    const normalized = path.normalize(pathname).replace(/^(\.\.[/\\])+/, '');
    const rootRelative = normalized.replace(/^[/\\]+/, '');

    let filePath = path.join(BUILD_DIR, rootRelative);
    if (pathname.endsWith('/')) {
      filePath = path.join(filePath, 'index.html');
    } else if (!path.extname(filePath)) {
      filePath = path.join(filePath, 'index.html');
    }

    if (!filePath.startsWith(BUILD_DIR)) {
      res.writeHead(403, {'Content-Type': 'text/plain; charset=utf-8'});
      res.end('Forbidden');
      return;
    }

    const stat = await fs.stat(filePath);
    const etag = buildEtag(stat);
    const contentType = CONTENT_TYPES[path.extname(filePath)] || 'application/octet-stream';
    const acceptEncoding = req.headers['accept-encoding'] || '';
    const useGzip = isTextResponse(contentType) && acceptEncoding.includes('gzip');

    res.setHeader('Content-Type', contentType);
    res.setHeader('ETag', etag);
    res.setHeader('Last-Modified', stat.mtime.toUTCString());
    if (contentType.includes('html')) {
      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    } else {
      res.setHeader('Cache-Control', 'public, max-age=86400');
    }

    if (req.headers['if-none-match'] === etag) {
      res.writeHead(304);
      res.end();
      return;
    }

    const file = await fs.readFile(filePath);

    if (useGzip) {
      const gzipped = zlib.gzipSync(file);
      res.setHeader('Content-Encoding', 'gzip');
      res.setHeader('Vary', 'Accept-Encoding');
      res.setHeader('Content-Length', String(gzipped.length));
      res.writeHead(200);
      if (req.method === 'HEAD') {
        res.end();
        return;
      }
      res.end(gzipped);
      return;
    }

    res.setHeader('Content-Length', String(file.length));
    res.writeHead(200);
    if (req.method === 'HEAD') {
      res.end();
      return;
    }
    res.end(file);
  } catch {
    res.writeHead(404, {'Content-Type': 'text/plain; charset=utf-8'});
    res.end('Not found');
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Serving ${BUILD_DIR} at http://${HOST}:${PORT}`);
});
