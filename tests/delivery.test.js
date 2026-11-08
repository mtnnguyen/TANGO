import test from 'node:test';
import assert from 'node:assert/strict';

test('browser delivery renders, approves a shock and resets when the customer changes', async () => {
  const handlers = new Map();
  const app = { innerHTML: '' };
  const scenarioPanel = { innerHTML: '' };
  const goalResultPanel = { innerHTML: '' };
  const amountInput = { value: '35' };
  const goalFields = {
    '#goal-name': { value: 'Emergency fund', focus() {} },
    '#goal-target': { value: '5000' },
    '#goal-saved': { value: '1000' },
    '#goal-months': { value: '10' }
  };
  globalThis.document = {
    addEventListener(type, fn) { handlers.set(type, fn); },
    querySelector(selector) {
      if (selector === '#app') return app;
      if (selector === '.scenario-results') return scenarioPanel;
      if (selector === '.goal-result') return goalResultPanel;
      if (selector === '#shock-amount') return amountInput;
      return goalFields[selector] ?? null;
    },
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

  // Editing scheduling controls must remove the previously approved results.
  handlers.get('change')({ target: { id: 'shock-start', value: '3' } });
  assert.doesNotMatch(app.innerHTML, /SCENARIO CALCULATED/);
  click({ action: 'evaluate' });
  assert.match(app.innerHTML, /SCENARIO CALCULATED/);
  handlers.get('change')({ target: { id: 'shock-duration', value: '3' } });
  assert.doesNotMatch(app.innerHTML, /SCENARIO CALCULATED/);

  // Slider drag must clear the visible result without replacing the input node.
  click({ action: 'evaluate' });
  scenarioPanel.innerHTML = 'STALE OLD RESULT';
  handlers.get('input')({ target: { id: 'shock-slider', value: '70' } });
  assert.equal(amountInput.value, '70');
  assert.match(scenarioPanel.innerHTML, /YOUR RESULTS WILL APPEAR HERE/);
  assert.doesNotMatch(scenarioPanel.innerHTML, /STALE OLD RESULT/);

  click({ shockType: 'one_time_cost' });
  assert.match(app.innerHTML, /Once, in the selected month/);
  assert.doesNotMatch(app.innerHTML, /id="shock-duration"/);

  click({ nav: 'goals' });
  click({ action: 'new-goal' });
  assert.match(app.innerHTML, /id="goal-target"[^>]*value=""/);
  assert.match(app.innerHTML, /id="goal-months"[^>]*value=""/);
  for (const input of Object.values(goalFields)) input.value = '';
  click({ action: 'plan-goal' });
  assert.match(app.innerHTML, /Complete every goal field/);

  // A built plan must be visibly invalidated as soon as any goal value changes.
  goalFields['#goal-name'].value = 'Emergency fund';
  goalFields['#goal-target'].value = '5000';
  goalFields['#goal-saved'].value = '1000';
  goalFields['#goal-months'].value = '10';
  click({ action: 'plan-goal' });
  assert.match(app.innerHTML, /YOUR GOAL PLAN/);
  goalFields['#goal-target'].value = '7500';
  goalResultPanel.innerHTML = 'OLD PLAN';
  handlers.get('input')({ target: { id: 'goal-target' } });
  assert.match(goalResultPanel.innerHTML, /PLAN NEEDS RECALCULATION/);
  assert.doesNotMatch(goalResultPanel.innerHTML, /OLD PLAN/);

  handlers.get('change')({ target: { id: 'customer-select', value: 'demo-jordan' } });
  assert.match(app.innerHTML, /Good to see you, Jordan/);
  click({ nav: 'scenario' });
  assert.doesNotMatch(app.innerHTML, /SCENARIO CALCULATED/);

  delete globalThis.document;
  delete globalThis.window;
});
