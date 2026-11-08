import { validateSnapshot } from './finance.js';

/** Computes a user-specified goal without silently making up an amount or date. */
export function evaluateGoal(snapshot, { name, targetCents, alreadySavedCents, monthsToGoal }, scenario = null) {
  validateSnapshot(snapshot);
  if (!name || typeof name !== 'string' || !name.trim()) throw new TypeError('A goal name is required');
  for (const [field, value] of Object.entries({ targetCents, alreadySavedCents })) {
    if (!Number.isSafeInteger(value) || value < 0) throw new RangeError(`${field} must be nonnegative cents`);
  }
  if (!Number.isInteger(monthsToGoal) || monthsToGoal < 1 || monthsToGoal > 120) throw new RangeError('Choose a deadline of 1–120 months');
  const remainingCents = Math.max(0, targetCents - alreadySavedCents);
  const requiredMonthlyCents = Math.ceil(remainingCents / monthsToGoal);
  const baselineAvailableCents = snapshot.monthlyIncomeCents - snapshot.essentialSpendingCents - snapshot.flexibleSpendingCents;
  const projectionAvailableCents = scenario
    ? Math.min(baselineAvailableCents, ...scenario.months.slice(0, monthsToGoal).map(month => month.netCents))
    : baselineAvailableCents;
  return {
    name: name.trim(), remainingCents, requiredMonthlyCents,
    availableMonthlyCents: Math.max(0, projectionAvailableCents),
    feasible: remainingCents === 0 || requiredMonthlyCents <= Math.max(0, projectionAvailableCents),
    monthlyAdjustmentCents: Math.max(0, requiredMonthlyCents - Math.max(0, projectionAvailableCents)),
    note: 'Uses the most constrained simulated month; projections are not guarantees.'
  };
}
