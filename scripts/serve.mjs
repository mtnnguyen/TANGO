import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(import.meta.dirname, '..');
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.json': 'application/json' };

export function createTangoServer() {
  return createServer(async (req, res) => {
    let pathname;
    try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
    catch { res.writeHead(400).end('Invalid path'); return; }
    const allowed = pathname === '/' || pathname === '/index.html' || pathname.startsWith('/src/') || pathname.startsWith('/public/');
    if (!allowed || pathname.split('/').some(part => part.startsWith('.'))) { res.writeHead(403).end('Forbidden'); return; }
    const filePath = resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (relative(root,filePath).startsWith('..' + sep) || filePath === root || !filePath.startsWith(root + sep)) { res.writeHead(403).end('Forbidden'); return; }
    try {
      const info = await stat(filePath);
      if (!info.isFile()) throw new Error('Not a file');
      const payload = await readFile(filePath);
      res.writeHead(200, { 'Content-Type': types[extname(filePath)] || 'application/octet-stream', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' }); res.end(payload);
    } catch { res.writeHead(404, { 'Content-Type': 'text/plain' }).end('Not found'); }
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 4173);
  createTangoServer().listen(port, '0.0.0.0', () => process.stdout.write(`TANGO running on http://localhost:${port}\n`));
}
