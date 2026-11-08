import test from 'node:test';
import assert from 'node:assert/strict';

test('browser delivery renders, approves a shock and resets when the customer changes', async () => {
  const handlers = new Map();
  const app = { innerHTML: '' };
  globalThis.document = {
    addEventListener(type, fn) { handlers.set(type, fn); },
    querySelector(selector) { return selector === '#app' ? app : null; },
    title: ''
  };
  globalThis.window = { scrollTo() {} };
  await import('../src/delivery/app.js');
  assert.match(app.innerHTML, /Good to see you, Maya/);
  assert.match(app.innerHTML, /FICTIONAL DATA/);

  const click = dataset => handlers.get('click')({ target: { closest(selector) {
    if (selector === '[data-nav]' && dataset.nav) return { dataset };
    if (selector === '[data-shock-type]' && dataset.shockType) return { dataset };
    if (selector === '[data-action]' && dataset.action) return { dataset };
    return null;
  } } });
  click({ nav: 'scenario' });
  assert.match(app.innerHTML, /Plan for the unexpected/);
  assert.match(app.innerHTML, /Calculate impact/);
  click({ action: 'evaluate' });
  assert.match(app.innerHTML, /SCENARIO CALCULATED/);
  assert.match(app.innerHTML, /CASH PROJECTION/);

  handlers.get('change')({ target: { id: 'customer-select', value: 'demo-jordan' } });
  assert.match(app.innerHTML, /Good to see you, Jordan/);
  click({ nav: 'scenario' });
  assert.doesNotMatch(app.innerHTML, /SCENARIO CALCULATED/);

  delete globalThis.document;
  delete globalThis.window;
});
