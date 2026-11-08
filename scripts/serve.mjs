import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, relative, sep } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const port = Number(process.env.PORT || 4173);
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.json': 'application/json' };
createServer(async (req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, `http://${req.headers.host || 'localhost'}`).pathname);
  const filePath = resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
  if (relative(root,filePath).startsWith('..' + sep) || filePath === root || !filePath.startsWith(root + sep)) { res.writeHead(403).end(); return; }
  try {
    const info = await stat(filePath);
    if (!info.isFile()) throw new Error('Not a file');
    const payload = await readFile(filePath);
    res.writeHead(200, { 'Content-Type': types[extname(filePath)] || 'application/octet-stream', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' }); res.end(payload);
  } catch { res.writeHead(404, { 'Content-Type': 'text/plain' }).end('Not found'); }
}).listen(port, '0.0.0.0', () => { process.stdout.write(`TANGO running on http://localhost:${port}\n`); });
