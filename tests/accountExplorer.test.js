import test from 'node:test';
import assert from 'node:assert/strict';
import { createAccountExplorer } from '../src/application/accountExplorer.js';

const sample = { income: 4000, spending: 3000, fixed: 1000, household: 700, buffer: 9000, loan: 0, months: 12 };

test('explorer application scopes scenario and plan to selected ID', async () => {
  const calls = [];
  const service = createAccountExplorer({
    async load() { return { accounts: { 123: sample, 456: sample } }; },
    select(dataset, accountId) {
      calls.push(accountId);
      return { id: accountId, summary: structuredClone(dataset.accounts[accountId]) };
    },
    async findings() { return { accounts: 2 }; },
  });
  const account = await service.lookup('123');
  const scenario = service.evaluate(account, { incomeRetainedPercent: 55, householdIncreasePercent: 0, oneOffCostCents: 0, startMonth: 1, durationMonths: 6 });
  assert.equal(scenario.accountId, '123');
  assert.deepEqual(calls, ['123']);
  assert.throws(() => service.plan({ id: '456', summary: sample }, scenario, { targetCents: 100000, savedCents: 0, months: 12 }), /selected account/);
  assert.equal(service.plan(account, scenario, { targetCents: 100000, savedCents: 0, months: 12 }).requiredMonthlyCents, 8334);
});
