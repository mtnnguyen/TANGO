import { createAccountExplorer } from '../application/accountExplorer.js';
import { loadAccountSummaries, loadResearchFindings, selectAccount } from '../infrastructure/accountSummaries.js';

// Composition root: the delivery layer owns the external adapter wiring.
export const accountExplorer = createAccountExplorer({
  load: loadAccountSummaries,
  select: selectAccount,
  findings: loadResearchFindings,
});
