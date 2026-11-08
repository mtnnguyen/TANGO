/** Pure, deterministic Tangerine-track benchmark calculations (amounts in cents). */

const assertFinite = (name, value, min, max) => {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) {
    throw new RangeError(`${name} must be between ${min} and ${max}`);
  }
};

const toCents = value => Math.round(value * 100);

export function validateAccountSummary(summary) {
  if (!summary || typeof summary !== 'object') throw new TypeError('An account summary is required');
  for (const key of ['income', 'spending', 'fixed', 'household', 'buffer', 'loan']) {
    assertFinite(key, summary[key], key === 'buffer' ? -1e10 : 0, 1e10);
  }
  if (!Number.isSafeInteger(summary.months) || summary.months < 1) throw new RangeError('No monthly observations');
  return summary;
}

/**
 * The default scenario starts in month 1 so the runway exactly matches the
 * published datathon definition. Starting later rolls forward the baseline
 * cash flow first and is labelled as an explicit TANGO extension.
 */
export function evaluateAccountShock(summary, shock) {
  validateAccountSummary(summary);
  if (!shock || typeof shock !== 'object') throw new TypeError('A shock with explicit values is required');
  const { incomeRetainedPercent, householdIncreasePercent, oneOffCostCents, startMonth, durationMonths } = shock;
  assertFinite('Income retained (%)', incomeRetainedPercent, 0, 100);
  assertFinite('Household bill increase (%)', householdIncreasePercent, 0, 500);
  assertFinite('One-off cost (cents)', oneOffCostCents, 0, 100_000_000);
  for (const [key, value] of [['startMonth', startMonth], ['durationMonths', durationMonths]]) {
    if (!Number.isSafeInteger(value) || value < 1 || value > 120) throw new RangeError(`${key} must be an integer between 1 and 120`);
  }
  const monthlyIncome = toCents(summary.income);
  const monthlySpending = toCents(summary.spending);
  const householdBills = toCents(summary.household);
  const initialBuffer = toCents(summary.buffer);
  const bufferAtStart = initialBuffer + (startMonth - 1) * (monthlyIncome - monthlySpending);
  const bufferLeft = bufferAtStart - oneOffCostCents;
  const incomeAfter = Math.round(monthlyIncome * incomeRetainedPercent / 100);
  const spendingAfter = monthlySpending + Math.round(householdBills * householdIncreasePercent / 100);
  const gap = spendingAfter - incomeAfter;
  const runwayMonths = bufferLeft <= 0 ? 0 : gap <= 0 ? null : Math.min(120, bufferLeft / gap);
  // A six-month event is evaluated over its requested duration, not in perpetuity.
  const remainingAfterShock = bufferLeft - gap * durationMonths;
  const survivesDuration = bufferLeft > 0 && remainingAfterShock >= 0;
  return {
    monthlyIncome, monthlySpending, householdBills,
    fixedCosts: toCents(summary.fixed), loanPayment: toCents(summary.loan),
    initialBuffer, bufferAtStart, bufferLeft, incomeAfter, spendingAfter, gap,
    runwayMonths, runwayLabel: runwayMonths === null ? 'No shortfall (120+)' : `${(Math.round(runwayMonths * 10) / 10).toFixed(1)} months`,
    survivesDuration, remainingAfterShock, startMonth, durationMonths,
    // Reducing non-fixed costs cannot exceed the household budget; do not
    // pretend all baseline spending is discretionary.
    monthlyGapToCover: Math.max(0, gap),
    shock: { ...shock },
  };
}

export function planAccountGoal(summary, scenario, goal) {
  validateAccountSummary(summary);
  if (!goal || typeof goal !== 'object') throw new TypeError('A goal is required');
  assertFinite('Goal amount (cents)', goal.targetCents, 1, 100_000_000);
  assertFinite('Already saved (cents)', goal.savedCents, 0, 100_000_000);
  if (!Number.isSafeInteger(goal.months) || goal.months < 1 || goal.months > 120) {
    throw new RangeError('Goal deadline must be 1–120 months');
  }
  if (goal.savedCents > goal.targetCents) throw new RangeError('Amount saved cannot exceed target');
  if (!scenario || !Number.isFinite(scenario.gap)) throw new TypeError('Evaluate a scenario first');
  const requiredMonthlyCents = Math.ceil((goal.targetCents - goal.savedCents) / goal.months);
  const baselineAvailableCents = toCents(summary.income) - toCents(summary.spending);
  const shockAvailableCents = scenario.incomeAfter - scenario.spendingAfter;
  return {
    requiredMonthlyCents, baselineAvailableCents, shockAvailableCents,
    baselineAdjustmentCents: Math.max(0, requiredMonthlyCents - baselineAvailableCents),
    shockAdjustmentCents: Math.max(0, requiredMonthlyCents - shockAvailableCents),
    targetCents: goal.targetCents, savedCents: goal.savedCents, months: goal.months,
  };
}
