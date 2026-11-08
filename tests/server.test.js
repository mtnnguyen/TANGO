import test from 'node:test';
import assert from 'node:assert/strict';
import { createTangoServer } from '../scripts/serve.mjs';

test('development server serves the app and blocks repository metadata', async () => {
  const server = createTangoServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const landing = await fetch(`${base}/`);
    assert.equal(landing.status, 200);
    assert.match(await landing.text(), /TANGO — Plan for what changes/);
    const script = await fetch(`${base}/src/delivery/app.js`);
    assert.equal(script.status, 200);
    assert.match(script.headers.get('content-type'), /javascript/);
    const secretPaths = ['/.git/config', '/AGENTS.md', '/.env', '/package.json'];
    for (const path of secretPaths) assert.equal((await fetch(`${base}${path}`)).status, 403);
  } finally {
    await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  }
});
