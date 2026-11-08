import { allDemoCustomers, loadDemoCustomer } from '../infrastructure/demoCustomers.js';
import { evaluateScenario, validateSnapshot } from '../domain/finance.js';
import { evaluateGoal } from '../domain/goals.js';

export function listCustomers() { return allDemoCustomers(); }

export function getCustomerContext(customerId) {
  const context = loadDemoCustomer(customerId);
  validateSnapshot(context.snapshot);
  if (context.transactions.some(tx => tx.customerId !== customerId)) throw new Error('Customer ownership check failed');
  return context;
}

export function runCustomerScenario(customerId, approvedShock, horizonMonths = 12) {
  const context = getCustomerContext(customerId);
  return evaluateScenario(context.snapshot, approvedShock, horizonMonths);
}

export function calculateCustomerGoal(customerId, userGoal, approvedScenario = null) {
  const context = getCustomerContext(customerId);
  if (approvedScenario?.customerId !== undefined && approvedScenario.customerId !== customerId) {
    throw new Error('Scenario belongs to a different customer');
  }
  return evaluateGoal(context.snapshot, userGoal, approvedScenario);
}
