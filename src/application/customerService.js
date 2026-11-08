import { evaluateScenario, validateSnapshot } from '../domain/finance.js';
import { evaluateGoal } from '../domain/goals.js';

/**
 * Customer use cases depend on an injected repository contract, not a data loader.
 * @param {{ listCustomers: () => Array<{id:string}>, getCustomer: (id:string) => object }} repository
 */
export function createCustomerService(repository) {
  if (!repository || typeof repository.listCustomers !== 'function' || typeof repository.getCustomer !== 'function') {
    throw new TypeError('A customer repository with listCustomers and getCustomer is required');
  }

  function listCustomers() { return repository.listCustomers(); }

  function getCustomerContext(customerId) {
    const context = repository.getCustomer(customerId);
    if (!context || context.id !== customerId || context.snapshot?.customerId !== customerId) {
      throw new Error('Customer identity mismatch');
    }
    validateSnapshot(context.snapshot);
    if (!Array.isArray(context.transactions) || context.transactions.some(tx => tx.customerId !== customerId)) {
      throw new Error('Customer ownership check failed');
    }
    return context;
  }

  function runCustomerScenario(customerId, approvedShock, horizonMonths = 12) {
    const context = getCustomerContext(customerId);
    return evaluateScenario(context.snapshot, approvedShock, horizonMonths);
  }

  function calculateCustomerGoal(customerId, userGoal, approvedScenario = null) {
    const context = getCustomerContext(customerId);
    if (approvedScenario && approvedScenario.customerId !== customerId) {
      throw new Error('Scenario belongs to a different customer');
    }
    return evaluateGoal(context.snapshot, userGoal, approvedScenario);
  }

  return Object.freeze({ listCustomers, getCustomerContext, runCustomerScenario, calculateCustomerGoal });
}
