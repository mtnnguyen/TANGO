/**
 * Deterministic financial scenarios. All money is integer Canadian cents.
 * This layer has no I/O, browser state, external dependencies or AI inference.
 * @typedef {{ customerId: string, monthlyIncomeCents: number, essentialSpendingCents: number, flexibleSpendingCents: number, liquidSavingsCents: number }} Snapshot
 * @typedef {{ type: 'income_drop'|'expense_increase'|'one_time_cost', amount: number, unit: 'percent'|'cents', startMonth: number, durationMonths: number, approved: boolean }} Shock
 */

const MAX_CENTS = 1_000_000_000_00;

function assertCents(value, name) {
  if (!Number.isSafeInteger(value) || value < 0 || value > MAX_CENTS) {
    throw new RangeError(`${name} must be a nonnegative whole number of cents`);
  }
}

export function validateSnapshot(snapshot) {
  if (!snapshot || typeof snapshot.customerId !== 'string' || !snapshot.customerId) {
    throw new TypeError('A verified customer ID is required');
  }
  for (const field of ['monthlyIncomeCents', 'essentialSpendingCents', 'flexibleSpendingCents', 'liquidSavingsCents']) {
    assertCents(snapshot[field], field);
  }
  return snapshot;
}

export function validateShock(shock) {
  if (!shock || !['income_drop', 'expense_increase', 'one_time_cost'].includes(shock.type)) {
    throw new TypeError('Choose a supported shock type');
  }
  if (shock.approved !== true) throw new Error('A scenario must be explicitly approved before evaluation');
  if (!Number.isInteger(shock.startMonth) || shock.startMonth < 1 || shock.startMonth > 36) {
    throw new RangeError('Start month must be between 1 and 36');
  }
  if (!Number.isInteger(shock.durationMonths) || shock.durationMonths < 1 || shock.durationMonths > 36) {
    throw new RangeError('Duration must be between 1 and 36 months');
  }
  if (shock.type === 'one_time_cost') {
    if (shock.unit !== 'cents') throw new TypeError('One-time costs must be in cents');
    assertCents(shock.amount, 'One-time cost');
  } else {
    if (shock.unit !== 'percent' || !Number.isFinite(shock.amount) || shock.amount < 0) {
      throw new TypeError('Percentage shocks require a finite, nonnegative percent');
    }
    const max = shock.type === 'income_drop' ? 100 : 5000;
    if (shock.amount > max) throw new RangeError(`Percentage cannot exceed ${max}%`);
  }
  return shock;
}

/** Simulates monthly account liquidity, without invented borrowing or investment returns. */
export function evaluateScenario(snapshot, shock, horizonMonths = 12) {
  validateSnapshot(snapshot);
  validateShock(shock);
  if (!Number.isInteger(horizonMonths) || horizonMonths < 1 || horizonMonths > 36) {
    throw new RangeError('Horizon must be 1–36 months');
  }

  const baselineSpendingCents = snapshot.essentialSpendingCents + snapshot.flexibleSpendingCents;
  const baselineNetCents = snapshot.monthlyIncomeCents - baselineSpendingCents;
  let balanceCents = snapshot.liquidSavingsCents;
  let firstShortfallMonth = null;
  let totalShortfallCents = 0;
  const months = [];

  for (let month = 1; month <= horizonMonths; month++) {
    const active = month >= shock.startMonth && month < shock.startMonth + shock.durationMonths;
    const incomeLossCents = active && shock.type === 'income_drop'
      ? Math.round(snapshot.monthlyIncomeCents * shock.amount / 100) : 0;
    const addedSpendingCents = active && shock.type === 'expense_increase'
      ? Math.round(baselineSpendingCents * shock.amount / 100) : 0;
    const oneTimeCostCents = month === shock.startMonth && shock.type === 'one_time_cost' ? shock.amount : 0;
    const incomeCents = snapshot.monthlyIncomeCents - incomeLossCents;
    const spendingCents = baselineSpendingCents + addedSpendingCents + oneTimeCostCents;
    const netCents = incomeCents - spendingCents;
    balanceCents += netCents;
    if (balanceCents < 0 && firstShortfallMonth === null) firstShortfallMonth = month;
    if (balanceCents < 0) totalShortfallCents = Math.max(totalShortfallCents, -balanceCents);
    months.push({ month, active, incomeCents, spendingCents, netCents, endingBalanceCents: balanceCents });
  }

  const firstActive = months[Math.min(shock.startMonth, horizonMonths) - 1];
  const shockMonthlyGapCents = shock.type === 'one_time_cost'
    ? Math.max(0, -baselineNetCents)
    : Math.max(0, -firstActive.netCents);
  const endBalanceCents = months.at(-1).endingBalanceCents;
  return Object.freeze({
    customerId: snapshot.customerId,
    baselineNetCents,
    baselineSpendingCents,
    shockMonthlyGapCents,
    firstShortfallMonth,
    additionalBufferNeededCents: totalShortfallCents,
    endingBalanceCents: endBalanceCents,
    months,
    assumptions: ['Illustrative balances, not linked to an actual financial institution', 'No interest, tax changes, debt financing, or investment returns', 'Spending stays constant unless the scenario explicitly changes it'],
    calculationVersion: 'tango-scenario-v1'
  });
}

export function currency(cents, options = {}) {
  if (!Number.isFinite(cents)) return '—';
  return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: options.round ? 0 : 2 }).format(cents / 100);
}

export function percent(numerator, denominator) {
  return denominator <= 0 ? 0 : (numerator / denominator) * 100;
}
