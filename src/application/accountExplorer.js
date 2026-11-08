import { evaluateAccountShock, planAccountGoal, validateAccountSummary } from '../domain/benchmark.js';

/** Account-explorer use cases. No HTTP, UI, or filesystem dependency here. */
export function createAccountExplorer({ load, select, findings }) {
  if (typeof load !== 'function' || typeof select !== 'function' || typeof findings !== 'function') {
    throw new TypeError('Account explorer needs explicit data-boundary functions');
  }
  return Object.freeze({
    async lookup(accountId) {
      const selected = select(await load(), accountId);
      validateAccountSummary(selected.summary);
      return selected;
    },
    findings,
    evaluate(account, shock) {
      if (!account?.id) throw new TypeError('Choose an account first');
      return { ...evaluateAccountShock(account.summary, shock), accountId: account.id };
    },
    plan(account, scenario, goal) {
      if (!account?.id || scenario?.accountId !== account.id) {
        throw new Error('Goal scenario must belong to the selected account');
      }
      return planAccountGoal(account.summary, scenario, goal);
    },
  });
}
