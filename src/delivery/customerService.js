import { createCustomerService } from '../application/customerService.js';
import { demoCustomerRepository } from '../infrastructure/demoCustomers.js';

// Composition root: wire the concrete demo adapter at the outermost layer.
export const customerService = createCustomerService(demoCustomerRepository);
