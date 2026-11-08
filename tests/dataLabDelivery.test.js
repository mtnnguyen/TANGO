import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { renderDataLab, preloadResearch, handleDataLabSubmit, handleDataLabClick, handleDataLabInput, selectedResearchAccountId } from '../src/delivery/dataLab.js';

const data = JSON.parse(readFileSync(new URL('../public/data/account_summaries.json', import.meta.url)));
const findings = JSON.parse(readFileSync(new URL('../public/data/research_findings.json', import.meta.url)));

test('account explorer loads an exact ID, re-evaluates a twist, and clears state between accounts', async () => {
  const fields = { '#lab-account-id': { value: '20111' } };
  const staleResult = { innerHTML: '' };
  const researchBanner = { outerHTML: 'OLD' };
  globalThis.document = { querySelector(selector) {
    if (selector === '.lab-result') return staleResult;
    if (selector === '.lab-research') return researchBanner;
    return fields[selector] ?? null;
  } };
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async url => ({ ok: true, async json() {
    return url.includes('research_findings') ? findings : data;
  } });
  const render = () => {};
  const submit = (id) => ({ target: { id }, preventDefault() {} });
  const click = preset => ({ target: { closest(selector) {
    return selector === '[data-lab-preset]' ? { dataset: { labPreset: preset } } : null;
  } } });
  try {
    assert.equal(selectedResearchAccountId(), null);
    assert.match(renderDataLab(), /4,500 accounts available/);
    assert.match(renderDataLab(), /data-lab-example="20253"/);
    assert.ok(data.accounts['20253'].household > 0, 'example account must have a real nonzero household-bills figure for judge twists');
    await preloadResearch(render);
    assert.match(researchBanner.outerHTML, /Highest money-in quartile/);
    assert.equal(fields['#lab-account-id'].value, '20111');
    assert.match(renderDataLab(), /Highest money-in quartile/);
    assert.match(renderDataLab(), /22\.9%/);
    await handleDataLabSubmit(submit('lab-account-form'), render);
    assert.equal(selectedResearchAccountId(), '20111');
    assert.match(renderDataLab(), /Account #20111/);
    assert.match(renderDataLab(), /22\.9%/);
    assert.doesNotMatch(renderDataLab(), /Demo customer/);
    handleDataLabClick(click('combined'), render);
    await handleDataLabSubmit(submit('lab-shock-form'), render);
    assert.match(renderDataLab(), /Estimated runway/);
    assert.match(renderDataLab(), /Show the calculation judges can verify/);
    // Form changes remove the visible old answer immediately.
    staleResult.innerHTML = 'STALE';
    handleDataLabInput({ target: { id: 'lab-retained', value: '100' } });
    assert.doesNotMatch(staleResult.innerHTML, /STALE/);
    assert.doesNotMatch(renderDataLab(), /SHOCK OUTCOME/);
    // Goal validation errors must appear directly inside the goal form, not the search panel.
    await handleDataLabSubmit(submit('lab-goal-form'), render);
    assert.match(renderDataLab(), /Calculate the selected shock above/);
    assert.doesNotMatch(renderDataLab().split('lab-search-panel')[1].split('lab-account-heading')[0], /Calculate the selected shock above/);
    // A customer switch clears all old results and plan state.
    const secondId = Object.keys(data.accounts).find(id => id !== '20111');
    fields['#lab-account-id'].value = secondId;
    await handleDataLabSubmit(submit('lab-account-form'), render);
    assert.equal(selectedResearchAccountId(), secondId);
    assert.doesNotMatch(renderDataLab(), /SHOCK OUTCOME/);
    assert.doesNotMatch(renderDataLab(), /Account #20111/);
    fields['#lab-account-id'].value = 'invalid<script>';
    await handleDataLabSubmit(submit('lab-account-form'), render);
    assert.equal(selectedResearchAccountId(), null);
    assert.match(renderDataLab(), /Enter a numeric account ID/);
    assert.doesNotMatch(renderDataLab(), /invalid<script>/);
  } finally {
    globalThis.fetch = originalFetch;
    delete globalThis.document;
  }
});
