import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateScenario, validateShock } from '../src/domain/finance.js';
import { evaluateGoal } from '../src/domain/goals.js';
import { listCustomers, getCustomerContext, runCustomerScenario, calculateCustomerGoal } from '../src/application/customerService.js';

const snapshot = { customerId: 'a', monthlyIncomeCents: 300000, essentialSpendingCents: 180000, flexibleSpendingCents: 100000, liquidSavingsCents: 100000 };
const shock = { type: 'income_drop', unit: 'percent', amount: 50, startMonth: 1, durationMonths: 6, approved: true };

test('income loss is applied only during explicit months', () => {
  const result = evaluateScenario(snapshot, shock, 8);
  assert.equal(result.months[0].netCents, -130000);
  assert.equal(result.months[5].netCents, -130000);
  assert.equal(result.months[6].netCents, 20000);
  assert.equal(result.firstShortfallMonth, 1);
  assert.equal(result.additionalBufferNeededCents, 680000);
});
test('no income loss at 0%; full income loss at 100%', () => {
  assert.equal(evaluateScenario(snapshot, { ...shock, amount: 0 }, 1).months[0].netCents, 20000);
  assert.equal(evaluateScenario(snapshot, { ...shock, amount: 100 }, 1).months[0].netCents, -280000);
});
test('one-time cost lands in exactly the requested start month', () => {
  const scenario = { type: 'one_time_cost', unit: 'cents', amount: 400000, startMonth: 3, durationMonths: 1, approved: true };
  const result = evaluateScenario(snapshot, scenario, 4);
  assert.equal(result.months[1].netCents, 20000);
  assert.equal(result.months[2].netCents, -380000);
  assert.equal(result.months[3].netCents, 20000);
});
test('rejects unapproved, over-100% income loss, NaN, ambiguous unit, invalid dates', () => {
  for (const change of [{ approved: false }, { amount: 101 }, { amount: NaN }, { unit: 'cents' }, { startMonth: -1 }, { durationMonths: 0 }]) {
    assert.throws(() => validateShock({ ...shock, ...change }));
  }
});
test('expense shock can be more than 100%; never silently clipped', () => {
  const result = evaluateScenario(snapshot, { ...shock, type: 'expense_increase', amount: 300 }, 1);
  assert.equal(result.months[0].spendingCents, 1120000);
});
test('explicit customer scoping, isolation and defensive copies', () => {
  const [first, second] = listCustomers();
  const a = getCustomerContext(first.id); const b = getCustomerContext(second.id);
  assert.notEqual(a.snapshot.customerId, b.snapshot.customerId);
  assert.ok(a.transactions.every(tx => tx.customerId === a.id));
  a.snapshot.monthlyIncomeCents = 1;
  assert.notEqual(getCustomerContext(first.id).snapshot.monthlyIncomeCents, 1);
  assert.throws(() => getCustomerContext('does-not-exist'));
  assert.throws(() => calculateCustomerGoal(first.id, { name: 'X', targetCents: 10000, alreadySavedCents: 0, monthsToGoal: 5 }, runCustomerScenario(second.id, shock)));
});
test('goal math never invents a target or deadline', () => {
  const result = evaluateGoal(snapshot, { name: 'Emergency fund', targetCents: 500000, alreadySavedCents: 100000, monthsToGoal: 10 });
  assert.equal(result.requiredMonthlyCents, 40000);
  assert.equal(result.monthlyAdjustmentCents, 20000);
  assert.equal(result.feasible, false);
  assert.throws(() => evaluateGoal(snapshot, { name: 'Unknown', targetCents: undefined, alreadySavedCents: 0, monthsToGoal: 10 }));
});
