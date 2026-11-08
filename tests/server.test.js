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
    const labJs = await fetch(`${base}/src/delivery/dataLab.js`);
    assert.equal(labJs.status, 200);
    const labCss = await fetch(`${base}/src/delivery/dataLab.css`);
    assert.equal(labCss.status, 200);
    assert.match(labCss.headers.get('content-type'), /css/);
    const mainCss = await fetch(`${base}/src/delivery/styles.css`);
    assert.equal(mainCss.status, 200);
    assert.match(mainCss.headers.get('content-type'), /css/);
    const mainStyles = await mainCss.text();
    assert.match(mainStyles, /^@import url\('[^\r\n]*'\);/, 'font URL must be a single valid CSS string');
    assert.match(mainStyles, /\.app-shell\s*\{/, 'banking layout styles must load');
    const summaries = await fetch(`${base}/public/data/account_summaries.json`);
    assert.equal(summaries.status, 200);
    assert.equal(Object.keys((await summaries.json()).accounts).length, 4500);
    const findings = await fetch(`${base}/public/data/research_findings.json`);
    assert.equal(findings.status, 200);
    assert.equal((await findings.json()).highestIncomeQuartile.underThreeMonthsPercent, 22.9);
    const secretPaths = ['/.git/config', '/AGENTS.md', '/.env', '/package.json'];
    for (const path of secretPaths) assert.equal((await fetch(`${base}${path}`)).status, 403);
  } finally {
    await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  }
});
