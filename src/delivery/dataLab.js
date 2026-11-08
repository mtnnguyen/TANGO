import { accountExplorer } from './accountExplorerService.js';

const money = cents => new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(cents / 100);
const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const initialShock = () => ({ incomeRetainedPercent: 55, householdIncreasePercent: 0, oneOffCostCents: 0, startMonth: 1, durationMonths: 6 });
const state = {
  status: 'idle', account: null, requestedId: '', errors: { lookup: '', shock: '', goal: '' }, findings: null,
  shock: initialShock(), result: null,
  goal: { targetCents: null, savedCents: null, months: null }, plan: null,
};
let lookupVersion = 0;
let findingsRequest;

/** Research loads independently so a temporary findings failure never blocks account lookup. */
export function preloadResearch() {
  if (state.findings) return Promise.resolve();
  if (!findingsRequest) {
    findingsRequest = accountExplorer.findings()
      .then(findings => {
        state.findings = findings;
        // Replace only the banner. Replacing the whole app here would discard
        // a judge's partially typed account ID or current keyboard focus.
        const banner = document.querySelector('.lab-research');
        if (banner) banner.outerHTML = researchBanner();
      })
      .catch(() => { findingsRequest = null; });
  }
  return findingsRequest;
}

export const selectedResearchAccountId = () => state.account?.id ?? null;

const pill = label => `<span class="lab-pill">${label}</span>`;
const field = (id, title, value, { min = 0, max = 100, step = 1, suffix = '' } = {}) =>
  `<label class="lab-field"><span>${title}</span><div class="lab-input-row"><input id="${id}" aria-label="${title}" type="number" inputmode="decimal" min="${min}" max="${max}" step="${step}" value="${value ?? ''}" required /><em>${suffix}</em></div></label>`;
const metric = (name, amount, extra) => `<div class="lab-metric"><span>${name}</span><strong>${money(Math.round(amount * 100))}</strong><small>${extra}</small></div>`;

function researchBanner() {
  if (!state.findings) return '<section class="lab-research lab-research-loading"><div><span class="panel-kicker">OUR DATA DISCOVERY</span><h2>What protects an account when money changes?</h2><p>Review the account’s real historical cash flow and test the financial shocks below.</p></div></section>';
  const f = state.findings;
  const high = f.highestIncomeQuartile.underThreeMonthsPercent;
  const low = f.lowestIncomeQuartile.underThreeMonthsPercent;
  return `<section class="lab-research"><div class="lab-research-title"><span>OUR DISCOVERY · ${f.activeAccountsForQuartileComparison.toLocaleString('en-CA')} ACTIVE ACCOUNTS COMPARED</span><h2>More money in. Not always a bigger safety net.</h2><p>With income credits retained at 55% and household bills up 15%, the highest-inflow accounts are more likely to have a short buffer in this dataset. Incoming credits include transfers and deposits, not verified wages.</p><div class="lab-comparison" role="img" aria-label="Share with under three months runway: highest money-in quartile ${high} percent, lowest money-in quartile ${low} percent"><div><span>Highest money-in quartile</span><strong>${high}%</strong><i><b style="width:${high}%"></b></i></div><div><span>Lowest money-in quartile</span><strong>${low}%</strong><i><b style="width:${low}%"></b></i></div></div><p class="lab-research-caveat">Descriptive contrast across these accounts, not causation. The high-inflow group's median buffer was only ${f.highestIncomeQuartile.medianBufferToSpending}× its typical monthly spending.</p></div><div class="lab-research-number"><strong>${high}%</strong><span>highest-inflow quartile<br/>under 3 months runway</span></div></section>`;
}

function accountLookup() {
  return `<section class="panel lab-search-panel"><div class="panel-top"><div><div class="panel-kicker">01 / KNOW THE CUSTOMER</div><h3>Look up an account</h3></div>${pill('4,500 accounts available')}</div><p class="panel-desc">Enter an anonymized account ID from the competition dataset. This view never combines financial records across accounts.</p>
  <form id="lab-account-form" class="lab-lookup"><label class="lab-field"><span>Account ID</span><div class="lab-input-row"><input id="lab-account-id" type="text" inputmode="numeric" pattern="[0-9]+" maxlength="12" placeholder="e.g. 20111" value="${escape(state.requestedId)}" autocomplete="off" required /></div></label><button class="button button-dark" type="submit">Load account →</button></form>
  ${state.status === 'loading' ? '<p class="lab-message" role="status">Loading historical account summaries…</p>' : ''}
  ${state.errors.lookup ? `<div class="form-error" role="alert">${escape(state.errors.lookup)}</div>` : ''}
  <div class="lab-example">Have a twist card? Enter its account ID. Just exploring? <button type="button" data-lab-example="20111">Try example account #20111</button></div>
  <p class="lab-source">Source: Sheridan Datathon 2026 anonymized banking dataset · historical 2020–2025 · no live bank connections.</p></section>`;
}

function benchmark() {
  if (!state.account) return '<section class="lab-placeholder">Select an account to see its verified monthly profile, then test a judge-supplied financial shock.</section>';
  const s = state.account.summary;
  return `<section class="lab-account-heading"><div><span class="panel-kicker">ACCOUNT SELECTED</span><h2>Account #${escape(state.account.id)}</h2><p>${s.months} monthly observations · last observed ${escape(s.asOf)} · values derived from account history</p></div>${pill('Observed data')}</section>
  <div class="lab-metrics">${metric('Typical money in', s.income, 'Median monthly credits')}${metric('Typical spending', s.spending, 'Median monthly debits')}${metric('Savings buffer', s.buffer, 'Mean daily balance, last 6 months')}${metric('Typical fixed costs', s.fixed, 'Median bills + insurance + loan debits')}</div>
  <div class="lab-minor-facts"><span>Household bills <strong>${money(s.household * 100)}</strong></span><span>Loan payment if still running <strong>${money(s.loan * 100)}</strong></span><span>Monthly money-in minus spending <strong>${money((s.income - s.spending) * 100)}</strong></span></div>${s.household === 0 ? '<p class="lab-data-note">This account has $0.00 in <em>labelled</em> median household-bill debits. A bills-percentage shock therefore has no effect under the track benchmark; this does not establish that the customer has no housing costs.</p>' : ''}`;
}

function shockForm() {
  if (!state.account) return '';
  const s = state.shock;
  return `<section class="panel lab-shock-panel"><div class="panel-top"><div><div class="panel-kicker">02 / TAKE A SHOCK</div><h3>What if life changes?</h3></div>${pill('Deterministic calculator')}</div><p class="panel-desc">Adjust every number to match the judge's twist. Every field has an explicit unit, start month and duration.</p>
  <div class="lab-presets"><button type="button" data-lab-preset="ei" class="lab-preset">55% retained credits (EI example)</button><button type="button" data-lab-preset="furnace" class="lab-preset">Unexpected repair</button><button type="button" data-lab-preset="combined" class="lab-preset">Combined shock</button><button type="button" data-lab-preset="reset" class="lab-preset lab-quiet">Reset</button></div>
  <form id="lab-shock-form"><div class="lab-field-grid">${field('lab-retained', 'Incoming credits retained', s.incomeRetainedPercent, { min: 0, max: 100, step: 'any', suffix: '%' })}${field('lab-bills', 'Household bill increase', s.householdIncreasePercent, { min: 0, max: 500, step: 'any', suffix: '%' })}${field('lab-oneoff', 'One-time expense', s.oneOffCostCents / 100, { min: 0, max: 1000000, step: .01, suffix: 'CAD' })}${field('lab-start', 'Shock starts in month', s.startMonth, { min: 1, max: 120, suffix: 'month' })}${field('lab-duration', 'Shock lasts', s.durationMonths, { min: 1, max: 120, suffix: 'months' })}</div><div class="lab-apply-bar"><span>Values are user-entered scenario assumptions, not observed transactions.</span><button class="button button-orange" type="submit">Calculate my runway →</button></div>${state.errors.shock ? `<div class="form-error" role="alert">${escape(state.errors.shock)}</div>` : ''}</form></section>`;
}

function scenarioResult() {
  if (!state.result) return '<section class="lab-placeholder lab-outcome-placeholder">Run a scenario to see the runway, a six-month survival check and a practical backup plan.</section>';
  const r = state.result;
  const status = r.survivesDuration ? 'LIKELY COVERS THIS SHOCK' : 'BUFFER MAY NOT COVER THE SHOCK';
  return `<section class="panel lab-result"><div class="panel-kicker">ACCOUNT #${escape(state.account.id)} · SHOCK OUTCOME</div><div class="lab-runway-head"><div><h3>Estimated runway</h3><div class="lab-runway-number">${r.runwayLabel}</div><p>${r.runwayMonths === null ? 'Under this scenario, typical incoming credits cover typical spending.' : 'Months until this simplified buffer runs out under the specified shock.'}</p></div><span class="lab-condition ${r.survivesDuration ? 'good' : 'risk'}">${status}</span></div>
    <div class="lab-result-grid"><div><span>Money in after shock</span><strong>${money(r.incomeAfter)}</strong></div><div><span>Spending after shock</span><strong>${money(r.spendingAfter)}</strong></div><div><span>Cash after one-time cost</span><strong>${money(r.bufferLeft)}</strong></div><div><span>Monthly shortfall</span><strong>${money(Math.max(0, r.gap))}</strong></div></div>
    <div class="lab-explain">${r.survivesDuration ? `The remaining modeled buffer after ${r.durationMonths} month(s) is ${money(r.remainingAfterShock)}.` : `Over ${r.durationMonths} month(s), this scenario needs ${money(Math.max(0, -r.remainingAfterShock))} more buffer or spending/income adjustments.`} ${r.startMonth > 1 ? `TANGO also rolls the baseline net cash flow forward ${r.startMonth - 1} month(s) before the shock starts.` : ''}</div>
    <details class="lab-math"><summary>Show the calculation judges can verify</summary><p>Buffer after cost ÷ monthly shortfall = (${money(r.bufferAtStart)} − ${money(r.shock.oneOffCostCents)}) ÷ (${money(r.spendingAfter)} − ${money(r.incomeAfter)}). If the buffer is non-positive, runway is zero; if there is no shortfall, the result is “120+”; otherwise it is capped at 120 months. Baseline uses the published track's medians and trailing-six-month daily-balance mean.</p></details></section>`;
}

function goalPanel() {
  if (!state.account) return '';
  const s = state.account.summary;
  const g = state.goal;
  const result = state.plan;
  return `<section class="panel lab-goals"><div class="panel-top"><div><div class="panel-kicker">03 / MAKE A PLAN</div><h3>A safety net with a target</h3></div>${pill('Your choice')}</div><p class="panel-desc">A goal needs your amount, how much you've already saved and a deadline. Choose a suggested buffer to populate the target, then confirm the other fields.</p><div class="lab-presets"><button type="button" class="lab-preset" data-lab-goal="3">Suggest 3 months of spending (${money(s.spending * 300)})</button><button type="button" class="lab-preset" data-lab-goal="6">Suggest 6 months (${money(s.spending * 600)})</button></div>
    <form id="lab-goal-form"><div class="lab-field-grid">${field('lab-goal-target', 'Emergency fund target', g.targetCents == null ? '' : g.targetCents / 100, { min: .01, max: 1000000, step: .01, suffix: 'CAD' })}${field('lab-goal-saved', 'Already saved toward goal', g.savedCents == null ? '' : g.savedCents / 100, { min: 0, max: 1000000, step: .01, suffix: 'CAD' })}${field('lab-goal-months', 'Deadline from today', g.months ?? '', { min: 1, max: 120, suffix: 'months' })}</div><div class="lab-apply-bar"><span>Planning is an illustration, not an automatic savings transfer.</span><button type="submit" class="button button-dark">Build a goal + backup plan →</button></div>${state.errors.goal ? `<div class="form-error" role="alert">${escape(state.errors.goal)}</div>` : ''}</form>
    ${result ? `<div class="lab-goal-outcome"><h4>Your target requires ${money(result.requiredMonthlyCents)} per month</h4><p><strong>Regular plan:</strong> ${result.baselineAdjustmentCents > 0 ? `Typical cash flow would need ${money(result.baselineAdjustmentCents)} more per month to reach the target on time.` : `Typical cash flow could support this contribution if the pattern continues.`}</p><p><strong>Backup over your ${result.months}-month goal horizon:</strong> ${result.shockMonthsWithinGoal} month(s) overlap this shock${result.oneOffWithinGoalCents ? `, including a ${money(result.oneOffWithinGoalCents)} one-time cost` : ''}. You would need an average ${money(result.shockAdjustmentCents)}/month in additional room to meet the goal on schedule under this scenario.</p><p>That is a cash-flow average, not a guarantee that funds are available every month. You can adjust spending, increase incoming money, or choose a longer deadline. Fixed costs are not assumed to be reducible.</p></div>` : ''}
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
    state.errors = { lookup: '', shock: '', goal: '' }; state.status = 'loading';
    state.account = null; state.result = null; state.plan = null;
    render();
    try {
      const account = await accountExplorer.lookup(accountId);
      if (requestVersion !== lookupVersion) return true;
      state.account = account;
      state.shock = initialShock(); state.goal = { targetCents: null, savedCents: null, months: null };
      state.status = 'ready'; state.errors.lookup = '';
    } catch (error) {
      if (requestVersion !== lookupVersion) return true;
      state.status = 'error'; state.errors.lookup = error.message;
    }
    render(); return true;
  }
  if (event.target.id === 'lab-shock-form') {
    event.preventDefault();
    try { state.result = accountExplorer.evaluate(state.account, state.shock); state.plan = null; state.errors.shock = ''; state.errors.goal = ''; }
    catch (error) { state.result = null; state.errors.shock = error.message; }
    render(); return true;
  }
  if (event.target.id === 'lab-goal-form') {
    event.preventDefault();
    try {
      if (!state.result) throw new Error('Calculate the selected shock above before building its backup plan');
      state.plan = accountExplorer.plan(state.account, state.result, state.goal);
      state.errors.goal = '';
    } catch (error) { state.plan = null; state.errors.goal = error.message; }
    render(); return true;
  }
  return false;
}

export function handleDataLabClick(event, render) {
  const example = event.target.closest('[data-lab-example]')?.dataset.labExample;
  if (example) {
    const input = document.querySelector('#lab-account-id');
    if (input) {
      input.value = example;
      void handleDataLabSubmit({ target: { id: 'lab-account-form' }, preventDefault() {} }, render);
    }
    return true;
  }
  const preset = event.target.closest('[data-lab-preset]')?.dataset.labPreset;
  const months = event.target.closest('[data-lab-goal]')?.dataset.labGoal;
  if (preset) {
    const base = initialShock();
    if (preset === 'ei') state.shock = base;
    else if (preset === 'furnace') state.shock = { ...base, incomeRetainedPercent: 100, oneOffCostCents: Math.round(state.account.summary.spending * 100), durationMonths: 1 };
    else if (preset === 'combined') state.shock = { ...base, householdIncreasePercent: 15 };
    else if (preset === 'reset') state.shock = { ...base, incomeRetainedPercent: 100 };
    state.result = null; state.plan = null; state.errors.shock = ''; state.errors.goal = ''; render(); return true;
  }
  if (months) {
    state.goal.targetCents = Math.round(state.account.summary.spending * 100 * Number(months));
    state.plan = null; state.errors.goal = ''; render(); return true;
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
  if (group === 'shock') state.errors.shock = '';
  if (group === 'goal') state.errors.goal = '';
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
