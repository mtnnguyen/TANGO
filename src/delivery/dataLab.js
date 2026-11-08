import { accountExplorer } from './accountExplorerService.js';

const money = cents => new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(cents / 100);
const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const initialShock = () => ({ incomeRetainedPercent: 55, householdIncreasePercent: 0, oneOffCostCents: 0, startMonth: 1, durationMonths: 6 });
const state = {
  status: 'idle', account: null, requestedId: '', error: '', findings: null,
  shock: initialShock(), result: null,
  goal: { targetCents: null, savedCents: null, months: null }, plan: null,
};
let lookupVersion = 0;

export const selectedResearchAccountId = () => state.account?.id ?? null;

const pill = label => `<span class="lab-pill">${label}</span>`;
const field = (id, title, value, { min = 0, max = 100, step = 1, suffix = '' } = {}) =>
  `<label class="lab-field"><span>${title}</span><div class="lab-input-row"><input id="${id}" aria-label="${title}" type="number" inputmode="decimal" min="${min}" max="${max}" step="${step}" value="${value ?? ''}" required /><em>${suffix}</em></div></label>`;
const metric = (name, amount, extra) => `<div class="lab-metric"><span>${name}</span><strong>${money(Math.round(amount * 100))}</strong><small>${extra}</small></div>`;

function researchBanner() {
  if (!state.findings) return '';
  const f = state.findings;
  return `<section class="lab-research"><div class="lab-research-title"><span>OUR DISCOVERY · ${f.activeAccountsForQuartileComparison.toLocaleString('en-CA')} ACTIVE ACCOUNTS COMPARED</span><h2>More money in. Not always a bigger safety net.</h2><p>Under a 55% retained-inflow + 15% household-bill shock, ${f.highestIncomeQuartile.underThreeMonthsPercent}% of the highest monthly-inflow quartile have under three months of runway, versus ${f.lowestIncomeQuartile.underThreeMonthsPercent}% in the lowest quartile. Despite higher dollar balances, the high-inflow group's median buffer covers just ${f.highestIncomeQuartile.medianBufferToSpending} months of typical spending. <em>Dataset pattern, not causation; incoming credits are not verified wages.</em></p></div><div class="lab-research-number"><strong>${f.highestIncomeQuartile.underThreeMonthsPercent}%</strong><span>highest-inflow quartile<br/>under 3 months runway</span></div></section>`;
}

function accountLookup() {
  return `<section class="panel lab-search-panel"><div class="panel-top"><div><div class="panel-kicker">01 / KNOW THE CUSTOMER</div><h3>Look up an account</h3></div>${pill('4,500 accounts available')}</div><p class="panel-desc">Enter an anonymized account ID from the competition dataset. This view never combines financial records across accounts.</p>
  <form id="lab-account-form" class="lab-lookup"><label class="lab-field"><span>Account ID</span><div class="lab-input-row"><input id="lab-account-id" type="text" inputmode="numeric" pattern="[0-9]+" maxlength="12" placeholder="e.g. 20111" value="${escape(state.requestedId)}" autocomplete="off" required /></div></label><button class="button button-dark" type="submit">Load account →</button></form>
  ${state.status === 'loading' ? '<p class="lab-message" role="status">Loading historical account summaries…</p>' : ''}
  ${state.error ? `<div class="form-error" role="alert">${escape(state.error)}</div>` : ''}
  <p class="lab-source">Source: Sheridan Datathon 2026 anonymized banking dataset · historical 2020–2025 · no live bank connections.</p></section>`;
}

function benchmark() {
  if (!state.account) return '<section class="lab-placeholder">Select an account to see its verified monthly profile, then test a judge-supplied financial shock.</section>';
  const s = state.account.summary;
  return `<section class="lab-account-heading"><div><span class="panel-kicker">ACCOUNT SELECTED</span><h2>Account #${escape(state.account.id)}</h2><p>${s.months} monthly observations · last observed ${escape(s.asOf)} · values derived from account history</p></div>${pill('Observed data')}</section>
  <div class="lab-metrics">${metric('Typical money in', s.income, 'Median monthly credits')}${metric('Typical spending', s.spending, 'Median monthly debits')}${metric('Savings buffer', s.buffer, 'Mean daily balance, last 6 months')}${metric('Typical fixed costs', s.fixed, 'Median bills + insurance + loan debits')}</div>
  <div class="lab-minor-facts"><span>Household bills <strong>${money(s.household * 100)}</strong></span><span>Loan payment if still running <strong>${money(s.loan * 100)}</strong></span><span>Income less spending <strong>${money((s.income - s.spending) * 100)}</strong></span></div>`;
}

function shockForm() {
  if (!state.account) return '';
  const s = state.shock;
  return `<section class="panel lab-shock-panel"><div class="panel-top"><div><div class="panel-kicker">02 / TAKE A SHOCK</div><h3>What if life changes?</h3></div>${pill('Deterministic calculator')}</div><p class="panel-desc">Adjust every number to match the judge's twist. Every field has an explicit unit, start month and duration.</p>
  <div class="lab-presets"><button type="button" data-lab-preset="ei" class="lab-preset">Job loss + 55% EI</button><button type="button" data-lab-preset="furnace" class="lab-preset">Unexpected repair</button><button type="button" data-lab-preset="combined" class="lab-preset">Combined shock</button><button type="button" data-lab-preset="reset" class="lab-preset lab-quiet">Reset</button></div>
  <form id="lab-shock-form"><div class="lab-field-grid">${field('lab-retained', 'Income retained', s.incomeRetainedPercent, { min: 0, max: 100, suffix: '%' })}${field('lab-bills', 'Household bill increase', s.householdIncreasePercent, { min: 0, max: 500, suffix: '%' })}${field('lab-oneoff', 'One-time expense', s.oneOffCostCents / 100, { min: 0, max: 1000000, step: .01, suffix: 'CAD' })}${field('lab-start', 'Shock starts in month', s.startMonth, { min: 1, max: 120, suffix: 'month' })}${field('lab-duration', 'Shock lasts', s.durationMonths, { min: 1, max: 120, suffix: 'months' })}</div><div class="lab-apply-bar"><span>Values are illustrative user inputs, not observed transactions.</span><button class="button button-orange" type="submit">Calculate my runway →</button></div></form></section>`;
}

function scenarioResult() {
  if (!state.result) return '<section class="lab-placeholder lab-outcome-placeholder">Run a scenario to see the runway, a six-month survival check and a practical backup plan.</section>';
  const r = state.result;
  const status = r.survivesDuration ? 'LIKELY COVERS THIS SHOCK' : 'BUFFER MAY NOT COVER THE SHOCK';
  return `<section class="panel lab-result"><div class="panel-kicker">ACCOUNT #${escape(state.account.id)} · SHOCK OUTCOME</div><div class="lab-runway-head"><div><h3>Estimated runway</h3><div class="lab-runway-number">${r.runwayLabel}</div><p>${r.runwayMonths === null ? 'Under this scenario, typical income covers typical spending.' : 'Months until this simplified buffer runs out under the specified shock.'}</p></div><span class="lab-condition ${r.survivesDuration ? 'good' : 'risk'}">${status}</span></div>
    <div class="lab-result-grid"><div><span>Income after shock</span><strong>${money(r.incomeAfter)}</strong></div><div><span>Spending after shock</span><strong>${money(r.spendingAfter)}</strong></div><div><span>Cash after one-time cost</span><strong>${money(r.bufferLeft)}</strong></div><div><span>Monthly shortfall</span><strong>${money(Math.max(0, r.gap))}</strong></div></div>
    <div class="lab-explain">${r.survivesDuration ? `The remaining modeled buffer after ${r.durationMonths} month(s) is ${money(r.remainingAfterShock)}.` : `Over ${r.durationMonths} month(s), this scenario needs ${money(Math.max(0, -r.remainingAfterShock))} more buffer or spending/income adjustments.`} ${r.startMonth > 1 ? `TANGO also rolls the baseline net cash flow forward ${r.startMonth - 1} month(s) before the shock starts.` : ''}</div>
    <details class="lab-math"><summary>Show the calculation judges can verify</summary><p>Buffer after cost ÷ monthly shortfall = (${money(r.bufferAtStart)} − ${money(r.shock.oneOffCostCents)}) ÷ (${money(r.spendingAfter)} − ${money(r.incomeAfter)}). If the buffer is non-positive, runway is zero; if there is no shortfall, the result is “120+”; otherwise it is capped at 120 months. Baseline uses the published track's medians and trailing-six-month daily-balance mean.</p></details></section>`;
}

function goalPanel() {
  if (!state.account) return '';
  const s = state.account.summary;
  const g = state.goal;
  const result = state.plan;
  return `<section class="panel lab-goals"><div class="panel-top"><div><div class="panel-kicker">03 / MAKE A PLAN</div><h3>A safety net with a target</h3></div>${pill('Your choice')}</div><p class="panel-desc">A goal needs your amount, how much you've already saved and a deadline. Choose a suggested buffer to populate the target, then confirm the other fields.</p><div class="lab-presets"><button type="button" class="lab-preset" data-lab-goal="3">Suggest 3 months of spending (${money(s.spending * 300)})</button><button type="button" class="lab-preset" data-lab-goal="6">Suggest 6 months (${money(s.spending * 600)})</button></div>
    <form id="lab-goal-form"><div class="lab-field-grid">${field('lab-goal-target', 'Emergency fund target', g.targetCents == null ? '' : g.targetCents / 100, { min: .01, max: 1000000, step: .01, suffix: 'CAD' })}${field('lab-goal-saved', 'Already saved toward goal', g.savedCents == null ? '' : g.savedCents / 100, { min: 0, max: 1000000, step: .01, suffix: 'CAD' })}${field('lab-goal-months', 'Deadline from today', g.months ?? '', { min: 1, max: 120, suffix: 'months' })}</div><div class="lab-apply-bar"><span>Planning is an illustration, not an automatic savings transfer.</span><button type="submit" class="button button-dark">Build a goal + backup plan →</button></div></form>
    ${result ? `<div class="lab-goal-outcome"><h4>Your target requires ${money(result.requiredMonthlyCents)} per month</h4><p><strong>Regular plan:</strong> ${result.baselineAdjustmentCents > 0 ? `Typical cash flow would need ${money(result.baselineAdjustmentCents)} more per month to reach the target on time.` : `Typical cash flow could support this contribution if the pattern continues.`}</p><p><strong>Backup if this shock happens:</strong> The modeled gap between the target contribution and money remaining after shocked spending is ${money(result.shockAdjustmentCents)}/month. Adjust spending, increase income, or extend the goal deadline by choice. Do not treat fixed costs as automatically reducible.</p></div>` : ''}
  </section>`;
}

export function renderDataLab() {
  return `<div class="lab-page"><div class="heading"><div><div class="eyebrow">TANGERINE TRACK · RESILIENCE REWIRED</div><h1>Every account has a story<span class="orange-period">.</span></h1><p>Real historical patterns. A shock you can change. A plan you control.</p></div>${pill('COMPETITION DATA MODE')}</div>
    ${researchBanner()}${accountLookup()}${benchmark()}
    ${state.account ? `<div class="lab-workspace"><div>${shockForm()}${goalPanel()}</div><div>${scenarioResult()}<section class="lab-method-note"><b>What this measures</b><p>Track benchmark runway uses median monthly deposits and spending and the last six average daily balances. It is not a forecast, eligibility decision or a connected banking service. Changing customer IDs always clears scenario and goal results.</p></section></div></div>` : ''}
    <div class="lab-source lab-bottom-source">Data definitions and caveats: <code>docs/research.md</code> in the TANGO repository. Anonymized account summaries were generated from competition-provided CSVs.</div></div>`;
}

export async function handleDataLabSubmit(event, render) {
  if (event.target.id === 'lab-account-form') {
    event.preventDefault();
    const accountId = document.querySelector('#lab-account-id')?.value.trim() ?? '';
    const requestVersion = ++lookupVersion;
    state.requestedId = accountId;
    state.error = ''; state.status = 'loading';
    state.account = null; state.result = null; state.plan = null;
    render();
    try {
      const [account, findings] = await Promise.all([accountExplorer.lookup(accountId), accountExplorer.findings()]);
      if (requestVersion !== lookupVersion) return true;
      state.findings = findings;
      state.account = account;
      state.shock = initialShock(); state.goal = { targetCents: null, savedCents: null, months: null };
      state.status = 'ready'; state.error = '';
    } catch (error) {
      if (requestVersion !== lookupVersion) return true;
      state.status = 'error'; state.error = error.message;
    }
    render(); return true;
  }
  if (event.target.id === 'lab-shock-form') {
    event.preventDefault();
    try { state.result = accountExplorer.evaluate(state.account, state.shock); state.plan = null; state.error = ''; }
    catch (error) { state.result = null; state.error = error.message; }
    render(); return true;
  }
  if (event.target.id === 'lab-goal-form') {
    event.preventDefault();
    try {
      if (!state.result) throw new Error('Calculate the selected shock above before building its backup plan');
      state.plan = accountExplorer.plan(state.account, state.result, state.goal);
      state.error = '';
    } catch (error) { state.plan = null; state.error = error.message; }
    render(); return true;
  }
  return false;
}

export function handleDataLabClick(event, render) {
  const preset = event.target.closest('[data-lab-preset]')?.dataset.labPreset;
  const months = event.target.closest('[data-lab-goal]')?.dataset.labGoal;
  if (preset) {
    const base = initialShock();
    if (preset === 'ei') state.shock = base;
    else if (preset === 'furnace') state.shock = { ...base, incomeRetainedPercent: 100, oneOffCostCents: Math.round(state.account.summary.spending * 100), durationMonths: 1 };
    else if (preset === 'combined') state.shock = { ...base, householdIncreasePercent: 15 };
    else if (preset === 'reset') state.shock = { ...base, incomeRetainedPercent: 100 };
    state.result = null; state.plan = null; state.error = ''; render(); return true;
  }
  if (months) {
    state.goal.targetCents = Math.round(state.account.summary.spending * 100 * Number(months));
    state.plan = null; state.error = ''; render(); return true;
  }
  return false;
}

export function handleDataLabInput(event) {
  const map = {
    'lab-retained': ['shock', 'incomeRetainedPercent', 1],
    'lab-bills': ['shock', 'householdIncreasePercent', 1],
    'lab-oneoff': ['shock', 'oneOffCostCents', 100],
    'lab-start': ['shock', 'startMonth', 1],
    'lab-duration': ['shock', 'durationMonths', 1],
    'lab-goal-target': ['goal', 'targetCents', 100],
    'lab-goal-saved': ['goal', 'savedCents', 100],
    'lab-goal-months': ['goal', 'months', 1],
  };
  const entry = map[event.target.id];
  if (!entry) return false;
  const [group, key, factor] = entry;
  const raw = event.target.value;
  state[group][key] = raw.trim() === '' ? null : factor === 100 ? Math.round(Number(raw) * factor) : Number(raw);
  if (group === 'shock') state.result = null;
  state.plan = null;
  // Clear visibly stale answers without taking focus away from the field.
  if (group === 'shock') {
    const oldResult = document.querySelector('.lab-result');
    if (oldResult) oldResult.innerHTML = '<div class="panel-kicker">SCENARIO CHANGED</div><p>Press “Calculate my runway” to see the updated result.</p>';
  }
  const oldGoal = document.querySelector('.lab-goal-outcome');
  if (oldGoal) oldGoal.innerHTML = '<p>Inputs changed. Press “Build a goal + backup plan” to recalculate.</p>';
  return true;
}
