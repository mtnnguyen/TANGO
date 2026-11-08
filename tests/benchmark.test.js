import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { evaluateAccountShock, planAccountGoal } from '../src/domain/benchmark.js';
import { selectAccount } from '../src/infrastructure/accountSummaries.js';

const summary = Object.freeze({ income: 4000, spending: 3000, fixed: 1800, household: 1000, buffer: 9000, loan: 0, months: 12, asOf: '2025-12' });
const shock = Object.freeze({ incomeRetainedPercent: 55, householdIncreasePercent: 15, oneOffCostCents: 0, startMonth: 1, durationMonths: 6 });

test('published combined-shock benchmark and six-month survival agree', () => {
  const result = evaluateAccountShock(summary, shock);
  assert.equal(result.incomeAfter, 220000);
  assert.equal(result.spendingAfter, 315000);
  assert.equal(result.gap, 95000);
  assert.equal(result.runwayLabel, '9.5 months');
  assert.equal(result.survivesDuration, true);
  assert.equal(result.remainingAfterShock, 330000);
});

test('one-off cost, starting month and runway zero are explicit', () => {
  const repair = evaluateAccountShock(summary, { ...shock, incomeRetainedPercent: 100, oneOffCostCents: 950000 });
  assert.equal(repair.runwayMonths, 0);
  assert.equal(repair.bufferLeft, -50000);
  const delayed = evaluateAccountShock(summary, { ...shock, startMonth: 3 });
  assert.equal(delayed.bufferAtStart, 1100000);
});

test('no monthly shortfall returns 120+ even with a positive buffer', () => {
  const r = evaluateAccountShock(summary, { ...shock, incomeRetainedPercent: 100, householdIncreasePercent: 0 });
  assert.equal(r.runwayMonths, null);
  assert.equal(r.runwayLabel, 'No shortfall (120+)');
});

test('arbitrary shocks reject malformed amounts, start months and duration', () => {
  for (const override of [
    { incomeRetainedPercent: 101 }, { householdIncreasePercent: -1 },
    { oneOffCostCents: NaN }, { startMonth: 1.5 }, { durationMonths: 0 },
    { incomeRetainedPercent: null },
  ]) assert.throws(() => evaluateAccountShock(summary, { ...shock, ...override }));
});

test('goal requires explicit target, amount saved and deadline', () => {
  const r = evaluateAccountShock(summary, shock);
  assert.throws(() => planAccountGoal(summary, r, { targetCents: null, savedCents: 0, months: 12 }));
  assert.throws(() => planAccountGoal(summary, r, { targetCents: 100000, savedCents: 0, months: null }));
  assert.throws(() => planAccountGoal(summary, r, { targetCents: 100000, savedCents: 200000, months: 12 }));
  const g = planAccountGoal(summary, r, { targetCents: 300000, savedCents: 60000, months: 12 });
  assert.equal(g.requiredMonthlyCents, 20000);
  assert.equal(g.baselineAdjustmentCents, 0);
  assert.equal(g.shockAdjustmentCents, 17500);
  assert.equal(g.shockMonthsWithinGoal, 6);
});

test('goal backup ignores a shock that begins after the goal deadline', () => {
  const r = evaluateAccountShock(summary, { ...shock, startMonth: 12 });
  const g = planAccountGoal(summary, r, { targetCents: 300000, savedCents: 0, months: 3 });
  assert.equal(g.shockMonthsWithinGoal, 0);
  assert.equal(g.shockAdjustmentCents, 0);
  assert.equal(g.oneOffWithinGoalCents, 0);
});

test('goal backup includes a one-off repair only when it occurs within the deadline', () => {
  const goal = { targetCents: 300000, savedCents: 0, months: 3 };
  const during = evaluateAccountShock(summary, {
    ...shock, incomeRetainedPercent: 100, householdIncreasePercent: 0,
    oneOffCostCents: 90000, startMonth: 2, durationMonths: 1,
  });
  const withRepair = planAccountGoal(summary, during, goal);
  assert.equal(withRepair.shockMonthsWithinGoal, 1);
  assert.equal(withRepair.oneOffWithinGoalCents, 90000);
  assert.equal(withRepair.shockAdjustmentCents, 30000);
  const after = evaluateAccountShock(summary, { ...during.shock, startMonth: 12 });
  assert.equal(planAccountGoal(summary, after, goal).shockAdjustmentCents, 0);
});

test('research extract contains 4,500 distinct account IDs and no identifying client fields', () => {
  const data = JSON.parse(readFileSync(new URL('../public/data/account_summaries.json', import.meta.url)));
  assert.equal(Object.keys(data.accounts).length, 4500);
  assert.equal(data.schemaVersion, 1);
  const { id, summary: account } = selectAccount(data, '20111');
  assert.equal(id, '20111');
  assert.ok(account.months > 0);
  assert.ok(account.spending >= 0);
  assert.deepEqual(Object.keys(account).sort(), ['asOf','buffer','fixed','household','income','loan','months','spending']);
  assert.throws(() => selectAccount(data, 'not an ID'));
  assert.throws(() => selectAccount(data, '999999999999'));
});
