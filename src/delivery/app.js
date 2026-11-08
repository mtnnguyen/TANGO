import { currency, percent } from '../domain/finance.js';
import { customerService } from './customerService.js';
import { renderDataLab, preloadResearch, selectedResearchAccountId, handleDataLabClick, handleDataLabInput, handleDataLabSubmit } from './dataLab.js';

const { listCustomers, getCustomerContext, runCustomerScenario, calculateCustomerGoal } = customerService;

const customers = listCustomers();
const state = {
  customerId: customers[0].id,
  page: 'dataset',
  shockType: 'income_drop',
  shockAmount: 35,
  oneTimeAmount: 1800,
  shockStart: 1,
  shockDuration: 6,
  scenario: null,
  goalIndex: 0,
  goalDraft: null,
  goalResult: null,
  activitySearch: '',
  activityCategory: 'All',
  menuOpen: false,
  notice: ''
};

const nav = [
  ['dataset', 'Account explorer', 'search'],
  ['overview', 'Overview', 'home'],
  ['scenario', 'Resilience lab', 'activity'],
  ['goals', 'My goals', 'target'],
  ['activity', 'Activity', 'receipt'],
  ['insights', 'How it works', 'book']
];

const paths = {
  home: '<rect x="3" y="10" width="18" height="11" rx="2"/><path d="m3 10 9-7 9 7M9 21v-7h6v7"/>',
  activity: '<path d="M3 12h4l3-7 4 14 3-7h4"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  receipt: '<path d="M5 3h14v18l-3-2-4 2-4-2-3 2V3zM8 8h8M8 12h8"/>',
  book: '<path d="M3 5a3 3 0 0 1 3-3h14v18H6a3 3 0 0 0-3 2V5zM3 17a3 3 0 0 1 3-3h14"/>',
  arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
  arrowup: '<path d="m7 17 10-10M8 7h9v9"/>',
  chevron: '<path d="m6 9 6 6 6-6"/>',
  shield: '<path d="m12 2 9 4v6c0 5-4 8-9 10-5-2-9-5-9-10V6l9-4z"/><path d="m8 12 3 3 5-6"/>',
  wallet: '<rect x="3" y="6" width="18" height="15" rx="3"/><path d="M3 10h18M6 6V4a2 2 0 0 1 2-2h11"/><path d="M16 15h2"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 2v6M17 2v6M3 11h18"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  sparkles: '<path d="m12 2 2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4L12 2z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10h.01"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  check: '<path d="m4 12 5 5L20 6"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/>'
};
const icon = (name, size = 20) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]}</svg>`;
const fmt = cents => currency(cents, { round: true });
const esc = value => String(value).replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[char]);
const compact = value => new Intl.NumberFormat('en-CA', { maximumFractionDigits: 1, notation: 'compact' }).format(value / 100);
const customer = () => getCustomerContext(state.customerId);

function brandmark(size = 39) {
  return `<svg viewBox="0 0 44 44" width="${size}" height="${size}" aria-label="TANGO logo" role="img"><rect width="44" height="44" rx="14" fill="#ef5e2c"/><path d="M9.5 12.5H35L22.1 34z" fill="#fff6ec"/><path d="M15.7 17.4h12.8L22.1 28z" fill="#ffad69"/><path d="M22.1 17.5V28M16.4 19l5.7 9m5.7-9-5.7 9" stroke="#fff2e5" stroke-width="1.3"/><circle cx="18.9" cy="21.8" r=".8" fill="#40241d"/><circle cx="25.2" cy="21.8" r=".8" fill="#40241d"/><path d="M19.6 24c1.6 1.6 3.3 1.6 5 0" fill="none" stroke="#40241d" stroke-width=".9" stroke-linecap="round"/></svg>`;
}

function shell(context) {
  const navButton = ([key, name, symbol]) => `<button type="button" class="nav-item ${state.page === key ? 'active' : ''}" data-nav="${key}" aria-label="${esc(name)}" title="${esc(name)}" ${state.page === key ? 'aria-current="page"' : ''}>${icon(symbol, 19)}<span>${name}</span>${state.page === key ? '<i></i>' : ''}</button>`;
  return `<div class="app-shell ${state.menuOpen ? 'show-menu' : ''}">
    <aside class="sidebar" aria-label="Main navigation">
      <div class="brand">${brandmark()}<div class="brand-name">TANGO<span class="brand-period">.</span><small>Banking for life's changes</small></div></div>
      <div class="side-label">YOUR WORKSPACES</div>
      <nav class="side-nav" aria-label="TANGO workspaces"><div class="side-label nav-subhead">COMPETITION DATA</div>${nav.slice(0,1).map(navButton).join('')}<div class="side-label nav-subhead">FICTIONAL PREVIEW</div>${nav.slice(1).map(navButton).join('')}</nav>
      <div class="sidebar-bottom">
        <div class="tip-card"><div class="tip-icon">${icon('sparkles', 19)}</div><div class="tip-title">A little more prepared.</div><p>Test real anonymized account patterns against life's what-ifs.</p><button data-nav="dataset" class="tip-link">Explore a real account ${icon('arrow', 15)}</button></div>
        <div class="side-foot">Built for the Sheridan Datathon<br/><span>Financial resilience · 2026</span></div>
      </div>
    </aside>
    <div class="content-shell"><header class="topbar">
      <div class="top-left"><button class="mobile-toggle" aria-label="Toggle navigation" data-action="menu">${icon('menu')}</button><span class="breadcrumb">${state.page === 'dataset' ? 'Research workspace' : 'Fictional customer preview'}</span><span class="breadcrumb-separator">/</span><strong>${nav.find(item => item[0] === state.page)?.[1]}</strong></div>
      <div class="top-actions">${state.page === 'dataset' ? `<span class="demo-pill"><span></span> HISTORICAL · ANONYMIZED</span><div class="account-control"><span class="avatar" style="--avatar:#fff0e4">#</span><div class="account-names"><strong>${selectedResearchAccountId() ? `Account ${selectedResearchAccountId()}` : 'Account explorer'}</strong><small>Competition dataset</small></div></div>` : `<span class="demo-pill"><span></span> LIVE DEMO · FICTIONAL DATA</span><div class="account-control"><span class="avatar" style="--avatar:${context.tone}">${context.initials}</span><div class="account-names"><strong>${esc(context.name)}</strong><small>Demo customer</small></div>${icon('chevron', 16)}<select id="customer-select" aria-label="Switch demo customer">${customers.map(c => `<option value="${c.id}" ${state.customerId === c.id ? 'selected' : ''}>${esc(c.name)} — ${esc(c.role)}</option>`).join('')}</select></div>`}</div>
    </header><main class="main" id="main-content">${renderPage(context)}</main>
    <footer class="footer"><span>${brandmark(22)} TANGO</span><span>Illustrative demo only. Not a bank, account service, or financial adviser.</span><span>Made with care, for life's what-ifs.</span></footer></div>
  </div>`;
}

function pageHeading(kicker, title, subtitle, right = '') {
  return `<div class="heading"><div><div class="eyebrow">${kicker}</div><h1>${title}</h1><p>${subtitle}</p></div>${right}</div>`;
}

function stat(label, value, detail, symbol = 'wallet', valueClass = '') {
  return `<div class="stat-card"><div class="stat-head"><span>${label}</span><span class="stat-icon">${icon(symbol, 19)}</span></div><div class="stat-value ${valueClass}">${value}</div><div class="stat-foot">${detail}</div></div>`;
}

function budgetBar(snapshot) {
  const spend = snapshot.essentialSpendingCents + snapshot.flexibleSpendingCents;
  const ess = snapshot.essentialSpendingCents;
  const income = Math.max(snapshot.monthlyIncomeCents, spend, 1);
  const free = Math.max(0, snapshot.monthlyIncomeCents - spend);
  return `<div class="budget-track"><span class="essential" style="width:${ess / income * 100}%"></span><span class="flexible" style="width:${snapshot.flexibleSpendingCents / income * 100}%"></span><span class="remaining" style="width:${free / income * 100}%"></span></div><div class="budget-legend"><span><i class="legend-dot essential-dot"></i> Essentials <b>${fmt(ess)}</b></span><span><i class="legend-dot flexible-dot"></i> Flexible <b>${fmt(snapshot.flexibleSpendingCents)}</b></span><span><i class="legend-dot remaining-dot"></i> Left over <b>${fmt(Math.max(0, free))}</b></span></div>`;
}

function lineChart(points, { labels = null, negative = false, height = 200 } = {}) {
  const values = points.map(p => p.value);
  const min = Math.min(0, ...values), max = Math.max(1, ...values);
  const pad = 18, w = 720, h = height, usable = h - 2 * pad;
  const x = i => pad + i * (w - 2 * pad) / Math.max(1, points.length - 1);
  const y = v => pad + (max - v) / (max - min || 1) * usable;
  const coords = points.map((p, i) => [x(i), y(p.value)]);
  const d = coords.map(([a,b],i) => `${i ? 'L' : 'M'}${a.toFixed(1)},${b.toFixed(1)}`).join(' ');
  const fill = `${d} L${x(points.length - 1)},${h-pad} L${pad},${h-pad} Z`;
  const ticks = [0,1,2,3].map(i => { const vy = pad + i * usable / 3; return `<path d="M${pad} ${vy}H${w-pad}" class="gridline"/>`; }).join('');
  return `<div class="chart-wrap"><svg class="chart-svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" role="img" aria-label="${negative ? 'Projected balance after shock' : 'Illustrative monthly balance trend'}">${ticks}<defs><linearGradient id="line-gradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#ee6b40" stop-opacity=".18"/><stop offset="100%" stop-color="#ee6b40" stop-opacity="0"/></linearGradient></defs><path d="${fill}" fill="url(#line-gradient)"/><path d="${d}" fill="none" stroke="#ed6b3e" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>${coords.map(([a,b],i) => i === coords.length - 1 ? `<circle cx="${a}" cy="${b}" r="5" fill="#ed6b3e" stroke="#fff" stroke-width="3"/>` : '').join('')}</svg><div class="chart-labels">${(labels ?? points.map((_,i) => `M${i+1}`)).map(l => `<span>${l}</span>`).join('')}</div></div>`;
}

function activityList(context, limit = 4) {
  const tx = context.transactions.slice(0, limit);
  return `<div class="transactions">${tx.map(t => `<div class="transaction"><div class="transaction-icon ${t.amountCents > 0 ? 'income-icon' : ''}">${icon(t.amountCents > 0 ? 'arrowup' : t.category === 'Housing' ? 'home' : 'wallet', 19)}</div><div class="transaction-text"><strong>${esc(t.merchant)}</strong><span>${esc(t.category)} <b>·</b> ${new Date(`${t.date}T12:00:00`).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })}</span></div><strong class="transaction-amount ${t.amountCents > 0 ? 'positive' : ''}">${t.amountCents > 0 ? '+' : '−'}${currency(Math.abs(t.amountCents))}</strong></div>`).join('')}</div>`;
}

function overview(context) {
  const s = context.snapshot;
  const net = s.monthlyIncomeCents - s.essentialSpendingCents - s.flexibleSpendingCents;
  const savingsMonths = Math.max(0, s.liquidSavingsCents / Math.max(1, s.essentialSpendingCents + s.flexibleSpendingCents));
  const baseline = Array.from({ length: 7 }, (_, i) => ({ value: s.liquidSavingsCents + net * i }));
  return `${pageHeading('HERE IS YOUR FINANCIAL PICTURE', `Good to see you, ${esc(context.name.split(' ')[0])}<span class="orange-period">.</span>`, 'A clearer picture of your money, and a plan for what comes next.', '<span class="heading-note">'+icon('shield',16)+' Private sample workspace</span>')}
    <section class="overview-hero"><div class="hero-content"><span class="hero-kicker">YOUR FINANCIAL HOME <span class="hero-sparkle">✳</span></span><h2>Make room for<br/>what's next.</h2><p>Because feeling secure shouldn't depend on every month going exactly to plan.</p><button class="button button-dark" data-nav="scenario">Explore your resilience ${icon('arrow',17)}</button></div><div class="hero-art"><div class="arc arc-one"></div><div class="arc arc-two"></div><div class="orange-orb"><span>YOU'VE<br/>GOT THIS.</span><svg viewBox="0 0 100 58"><path d="M18 29q32 36 64 0" fill="none" stroke="#6b2e18" stroke-width="5" stroke-linecap="round"/><circle cx="26" cy="10" r="4" fill="#6b2e18"/><circle cx="74" cy="10" r="4" fill="#6b2e18"/></svg></div><span class="deco deco-one">✳</span><span class="deco deco-two">+</span></div></section>
    <div class="section-top"><h3>At a glance</h3><span>Monthly snapshot · illustrative</span></div>
    <section class="stats-grid">${stat('Available savings', fmt(s.liquidSavingsCents), `${savingsMonths.toFixed(1)} months of current spending`, 'wallet')}${stat('Monthly income', fmt(s.monthlyIncomeCents), 'Regular monthly estimate', 'arrowup')}${stat('Monthly spending', fmt(s.essentialSpendingCents + s.flexibleSpendingCents), 'Essentials + flexible spending', 'receipt')}${stat('Monthly breathing room', fmt(net), net >= 0 ? 'After estimated spending' : 'Spending exceeds income', 'activity', net < 0 ? 'danger-text' : '')}</section>
    <section class="overview-grid"><div class="panel balance-panel"><div class="panel-top"><div><div class="panel-kicker">YOUR TRAJECTORY</div><h3>Where your balance is headed</h3></div><span class="soft-tag">Baseline estimate</span></div><p class="panel-desc">A simple projection if your current monthly income and spending remain unchanged.</p>${lineChart(baseline, { labels: ['Now', '1 mo', '2 mo', '3 mo', '4 mo', '5 mo', '6 mo'] })}<div class="chart-foot">${icon('info',15)} No interest, taxes changes, or unexpected expenses included.</div></div>
    <div class="panel budget-panel"><div class="panel-top"><div><div class="panel-kicker">THIS MONTH</div><h3>Money in, money out</h3></div><span class="panel-mini-icon">${icon('activity')}</span></div><div class="budget-big">${fmt(s.monthlyIncomeCents)} <span>estimated income</span></div>${budgetBar(s)}<div class="budget-divider"></div><div class="action-callout"><span class="callout-icon">${icon('shield',19)}</span><div><strong>Know your safety net</strong><p>See how income changes affect this plan before they happen.</p></div></div><button class="text-action" data-nav="scenario">Explore a what-if ${icon('arrow',16)}</button></div></section>
    <section class="overview-grid bottom-grid"><div class="panel"><div class="panel-top"><div><div class="panel-kicker">RECENT ACTIVITY</div><h3>Your latest transactions</h3></div><button class="text-action" data-nav="activity">View all ${icon('arrow',15)}</button></div>${activityList(context)}</div><div class="panel goals-panel"><div class="panel-top"><div><div class="panel-kicker">LOOKING AHEAD</div><h3>Goals worth planning for</h3></div><span class="panel-mini-icon">${icon('target')}</span></div>${context.goals.map((goal, i) => `<div class="goal-mini"><div class="goal-mini-icon">${i === 0 ? '✳' : '↗'}</div><div><strong>${esc(goal.name)}</strong><span>${fmt(goal.alreadySavedCents)} of ${fmt(goal.targetCents)}</span></div><strong>${Math.min(100,Math.round(percent(goal.alreadySavedCents, goal.targetCents)))}%</strong></div><div class="goal-progress"><span style="width:${Math.min(100, percent(goal.alreadySavedCents,goal.targetCents))}%"></span></div>`).join('')}<button class="text-action goal-cta" data-nav="goals">Build my goal plan ${icon('arrow',15)}</button></div></section>`;
}

function scenarioEmptyResult() {
  return `<div class="empty-result"><div class="empty-result-icon">${brandmark(72)}</div><span class="panel-kicker">YOUR RESULTS WILL APPEAR HERE</span><h3>Meet the unexpected<br/>with a plan.</h3><p>Adjust the scenario, then calculate to see what happens to your cash flow, savings, and financial runway.</p><div class="empty-facts"><div>${icon('check',17)} Clear calculations</div><div>${icon('check',17)} No hidden assumptions</div><div>${icon('check',17)} Choices you can act on</div></div></div>`;
}

function scenarioPage(context) {
  const result = state.scenario;
  const isIncome = state.shockType === 'income_drop', isOneTime = state.shockType === 'one_time_cost';
  const typeDescriptions = { income_drop: 'A pay cut, missed shifts, or lost contract', expense_increase: 'Higher rent, bills, or recurring costs', one_time_cost: 'An unexpected repair or major expense' };
  return `${pageHeading('YOUR RESILIENCE LAB', 'Plan for the unexpected<span class="orange-period">.</span>', 'Life changes. Your plan can change with it. Test a situation and see the numbers behind it.')}
    <div class="scenario-layout"><section class="panel scenario-form"><div class="panel-top"><div><div class="panel-kicker">STEP 01 / BUILD YOUR SCENARIO</div><h3>What if life changes?</h3></div><span class="panel-mini-icon">${icon('activity')}</span></div><p class="panel-desc">Choose a change and tell us how it might affect you.</p>
    <div class="field-heading">Type of change</div><div class="shock-choices">${[['income_drop','Income drops','↓'],['expense_increase','Expenses rise','↑'],['one_time_cost','One-time cost','✳']].map(([value,label,symbol]) => `<button class="shock-choice ${state.shockType === value ? 'selected' : ''}" data-shock-type="${value}"><span class="choice-symbol">${symbol}</span>${label}</button>`).join('')}</div>
    <div class="field-help">${typeDescriptions[state.shockType]}</div>
    <div class="form-separator"></div><div class="field-heading">${isOneTime ? 'Cost of the unexpected expense' : 'Size of the change'} <span>${isOneTime ? 'CAD' : '%'}</span></div>
    <div class="shock-value-wrap"><span class="shock-big-value">${isOneTime ? '$' : ''}</span><input aria-label="${isOneTime ? 'Unexpected expense in dollars' : 'Shock percentage'}" id="shock-amount" class="shock-big-input" type="number" min="0" max="${isOneTime ? '10000000' : isIncome ? '100' : '5000'}" step="${isOneTime ? '1' : '0.5'}" value="${isOneTime ? state.oneTimeAmount : state.shockAmount}"/><span class="shock-big-value">${isOneTime ? 'CAD' : '%'}</span></div>
    ${isOneTime ? '<p class="hint">Enter a one-time amount. We apply it once, on the selected month.</p>' : `<input id="shock-slider" class="shock-slider" aria-label="Adjust shock percentage" type="range" min="0" max="${isIncome ? 100 : 300}" step="1" value="${Math.min(isIncome ? 100 : 300, state.shockAmount)}"/><div class="slider-labels"><span>0%</span><span>${isIncome ? '100%' : '300%'}</span></div>`}
    <div class="two-fields"><label>When does it start?<div class="input-wrap">${icon('calendar',17)}<select id="shock-start" aria-label="Start month">${Array.from({length:12},(_,i)=>`<option value="${i+1}" ${state.shockStart === i+1 ? 'selected' : ''}>${i===0?'Next month':`In ${i+1} months`}</option>`).join('')}</select>${icon('chevron',15)}</div></label>${isOneTime ? `<label>How often?<div class="input-wrap">${icon('clock',17)}<span class="fixed-duration">Once, in the selected month</span></div></label>` : `<label>How long does it last?<div class="input-wrap">${icon('clock',17)}<select id="shock-duration" aria-label="Duration">${[1,2,3,4,6,9,12,18,24,36].map(n=>`<option value="${n}" ${state.shockDuration === n ? 'selected' : ''}>${n} month${n>1?'s':''}</option>`).join('')}</select>${icon('chevron',15)}</div></label>`}</div>
    <div class="consent-note">${icon('info',17)} Nothing is saved or applied to a real account. Select “Calculate impact” to approve this one simulated scenario.</div>
    <button class="button button-orange full-width" data-action="evaluate">Calculate impact ${icon('arrow',18)}</button>${state.notice ? `<div class="form-error" role="alert">${esc(state.notice)}</div>` : ''}</section>
    <section class="scenario-results">${result ? resultMarkup(result, context) : scenarioEmptyResult()}</section></div>
    <section class="trust-strip">${icon('shield',18)} <span><strong>In control, always.</strong> This is an illustration using fictional finances. We never change account data, and no loan or overdraft is assumed.</span></section>`;
}

function resultMarkup(result, context) {
  const first = result.firstShortfallMonth;
  const baseline = context.snapshot.liquidSavingsCents;
  const impact = result.endingBalanceCents - (baseline + result.baselineNetCents * result.months.length);
  const labels = ['Now', ...result.months.map(m => `M${m.month}`)];
  const series = [{value:baseline},...result.months.map(m => ({value:m.endingBalanceCents}))];
  return `<div class="result-top"><div class="result-check">${icon('check',18)}</div><div><span class="panel-kicker">SCENARIO CALCULATED</span><h3>Here's what changes.</h3></div></div><div class="result-banner ${first ? 'at-risk' : 'comfortable'}"><span>${first ? 'WATCH YOUR CASH BUFFER' : 'YOUR BUFFER HOLDS UP'}</span><strong>${first ? `A cash shortfall begins in month ${first}.` : 'No cash shortfall in this window.'}</strong><p>${first ? 'Your liquid savings may run out unless something changes.' : 'Your cash position stays at or above $0 across the simulated months.'}</p></div>
  <div class="result-metrics"><div><small>Cash buffer after ${result.months.length} months</small><strong class="${result.endingBalanceCents<0?'danger-text':''}">${fmt(result.endingBalanceCents)}</strong></div><div><small>Cash deficit in first shock month</small><strong>${fmt(result.shockMonthlyGapCents)}</strong></div><div><small>Extra buffer needed</small><strong>${fmt(result.additionalBufferNeededCents)}</strong></div><div><small>Impact vs. no shock</small><strong class="danger-text">${fmt(impact)}</strong></div></div>
  <div class="panel result-graph"><div class="panel-top"><div><div class="panel-kicker">YOUR CASH PROJECTION</div><h3>What your buffer looks like</h3></div><span class="soft-tag">${result.months.length}-month view</span></div>${lineChart(series,{labels,negative:true,height:190})}<div class="chart-foot">${icon('info',15)} Below $0 means an unfunded shortfall, not automatic borrowing.</div></div>
  <div class="nextstep-banner"><div class="nextstep-icon">${icon('target',20)}</div><div><strong>There's more than one way forward.</strong><p>Connect this scenario to a personal savings goal.</p></div><button class="button button-outline" data-nav="goals">See my options ${icon('arrow',16)}</button></div>`;
}

function goalsPage(context) {
  const goal = state.goalDraft ?? context.goals[state.goalIndex];
  const g = state.goalResult;
  const s = context.snapshot;
  return `${pageHeading('YOUR NEXT CHAPTER', 'Goals with a game plan<span class="orange-period">.</span>', 'Big life plans start with practical steps. See what reaching yours would take.')}
  <div class="goal-layout"><section class="panel goal-editor"><div class="panel-top"><div><div class="panel-kicker">STEP 02 / MAKE IT PERSONAL</div><h3>What are you working toward?</h3></div><span class="panel-mini-icon">${icon('target')}</span></div><p class="panel-desc">Start with a fictional example or write your own goal. We won't invent a target or a deadline.</p><div class="goal-pills">${context.goals.map((item,i)=>`<button data-goal="${i}" class="goal-pill ${state.goalIndex===i?'selected':''}">${esc(item.name)}</button>`).join('')}<button data-action="new-goal" class="goal-pill">${icon('plus',14)} New goal</button></div>
  <div class="goal-inputs"><label>Goal name<input id="goal-name" type="text" maxlength="60" value="${esc(goal.name)}" placeholder="e.g. Emergency fund" /></label><label>Amount I want to reach (CAD)<input id="goal-target" type="number" min="0" max="10000000" step="1" value="${goal.targetCents == null ? '' : goal.targetCents/100}" placeholder="Enter target amount"/></label><label>Amount I already have (CAD)<input id="goal-saved" type="number" min="0" max="10000000" step="1" value="${goal.alreadySavedCents == null ? '' : goal.alreadySavedCents/100}" placeholder="Enter saved amount"/></label><label>Months to reach my goal<input id="goal-months" type="number" min="1" max="120" step="1" value="${goal.monthsToGoal ?? ''}" placeholder="Enter months"/></label></div><div class="consent-note">${icon('info',17)} Your plan is calculated from these inputs, not from an AI-generated guess. Nothing is saved to a bank.</div><button data-action="plan-goal" class="button button-orange full-width">Build my plan ${icon('arrow',17)}</button>${state.notice ? `<div class="form-error" role="alert">${esc(state.notice)}</div>` : ''}</section>
  <div>${g ? `<section class="panel goal-result"><div class="panel-kicker">YOUR GOAL PLAN</div><h3>${esc(g.name)}</h3><div class="goal-number">${fmt(g.requiredMonthlyCents)}<span>/ month</span></div><p>Put this much aside each month to cover the remaining ${fmt(g.remainingCents)} by your chosen date.</p><div class="goal-outcome ${g.feasible?'good':'needs-work'}">${icon(g.feasible?'check':'info',19)}<span>${g.feasible?'Looks possible with your current plan.':'Your current cash flow may need an adjustment.'}</span></div><div class="goal-facts"><div><span>Money available per month</span><b>${fmt(g.availableMonthlyCents)}</b></div><div><span>Extra monthly room needed</span><b>${fmt(g.monthlyAdjustmentCents)}</b></div><div><span>Scenario considered</span><b>${state.scenario?'Approved shock':'Current baseline'}</b></div></div><div class="options-panel"><div class="panel-kicker">TWO PRACTICAL OPTIONS</div><p><b>Option A · Adjust spending.</b> ${g.monthlyAdjustmentCents ? `Look for ${fmt(g.monthlyAdjustmentCents)} in monthly changes to close the gap.` : 'Keep your current monthly contribution on track.'}</p><p><b>Option B · Change the timeline.</b> Keep the same savings target but allow more months if your cash flow is tight.</p></div><span class="goal-caption">${g.note}</span></section>` : `<section class="goal-empty"><span class="empty-result-icon">${icon('target',42)}</span><div class="panel-kicker">YOUR GOAL, YOUR TIMELINE</div><h3>Make the future feel<br/>a little closer.</h3><p>Choose or edit a goal, then build a plan based on the numbers you entered.</p><div class="mini-goal-art"><span>01</span><div><span class="line"></span><span class="line short"></span></div><span>GO!</span></div></section>`}
  <div class="goal-tip"><div class="tip-icon">${icon('sparkles',19)}</div><div><strong>Planning for a career change?</strong><p>Whether income is seasonal, contract-based, or changing, test it in the Resilience lab first.</p><button class="text-action" data-nav="scenario">Open the lab ${icon('arrow',15)}</button></div></div></div></div>`;
}

function activityPage(context) {
  const categories = ['All', ...new Set(context.transactions.map(t=>t.category))];
  const rows = context.transactions.filter(tx => (state.activityCategory === 'All' || tx.category === state.activityCategory) && `${tx.merchant} ${tx.category}`.toLowerCase().includes(state.activitySearch.toLowerCase()));
  return `${pageHeading('MONEY MOVEMENT', 'Your activity<span class="orange-period">.</span>', 'See the sample transactions behind this financial snapshot.')}
  <section class="panel activity-page-panel"><div class="panel-top"><div><div class="panel-kicker">EVERYDAY CHEQUING</div><h3>${esc(context.accountLabel)}</h3></div><span class="soft-tag">Fictional examples</span></div><div class="activity-filters"><div class="search-box">${icon('search',18)}<input id="activity-search" type="search" aria-label="Search transactions" placeholder="Search your transactions" value="${esc(state.activitySearch)}" /></div><select id="activity-category" aria-label="Transaction category">${categories.map(c=>`<option ${c===state.activityCategory?'selected':''}>${esc(c)}</option>`).join('')}</select></div><div class="activity-table"><div class="activity-table-head"><span>TRANSACTION</span><span>DATE</span><span>AMOUNT</span></div>${rows.map(tx=>`<div class="activity-table-row"><div class="transaction-name"><div class="transaction-icon ${tx.amountCents > 0?'income-icon':''}">${icon(tx.amountCents>0?'arrowup':'wallet',19)}</div><div><strong>${esc(tx.merchant)}</strong><span>${esc(tx.category)}</span></div></div><span class="activity-date">${new Date(`${tx.date}T12:00:00`).toLocaleDateString('en-CA', {month:'short', day:'numeric',year:'numeric'})}</span><strong class="transaction-amount ${tx.amountCents>0?'positive':''}">${tx.amountCents>0?'+':'−'}${currency(Math.abs(tx.amountCents))}</strong></div>`).join('') || '<div class="no-transactions">No transactions match this filter.</div>'}</div><div class="chart-foot">${icon('info',15)} Synthetic examples for demonstration, not actual transaction history or a complete ledger.</div></section>`;
}

function insightsPage(context) {
  return `${pageHeading('THE THINKING BEHIND TANGO', 'Clarity over complexity<span class="orange-period">.</span>', 'Our goal is simple: financial decisions should be explainable, especially when income is uncertain.')}
  <section class="method-hero"><div class="panel-kicker">OUR GUIDING IDEA</div><blockquote>“Financial security isn't just about how much you earn. It's about how prepared you are when that income changes.”</blockquote><span>THE TANGO TEAM · SHERIDAN DATATHON 2026</span></section>
  <div class="method-grid"><div class="panel method-card"><span class="method-icon">${icon('shield',23)}</span><h3>One person, one picture.</h3><p>Every scenario and goal calculation runs only on the selected demo customer's financial context. Switching customers clears results from the previous customer.</p><span class="method-label">CUSTOMER ISOLATION</span></div><div class="panel method-card"><span class="method-icon">${icon('activity',23)}</span><h3>Show the math.</h3><p>No language model invents cash-flow numbers. A tested deterministic engine applies the shock exactly where you tell it to, then shows the monthly balances.</p><span class="method-label">EXPLAINABLE SCENARIOS</span></div><div class="panel method-card"><span class="method-icon">${icon('target',23)}</span><h3>Goals that are yours.</h3><p>You choose the target, what you have saved, and your deadline. TANGO calculates the monthly contribution and whether your current cash flow could support it.</p><span class="method-label">USER-DEFINED PLANNING</span></div></div>
  <section class="panel research-panel"><div class="panel-top"><div><div class="panel-kicker">DATA NOTES & LIMITATIONS</div><h3>What this demo can and cannot tell you</h3></div>${icon('info',21)}</div><div class="method-rows"><div><strong>Data used today</strong><p>Three fictional Canadian customer personas and illustrative transaction histories. These are synthetic teaching fixtures, not real Tangerine or Canadian Armed Forces financial records.</p></div><div><strong>What we calculate</strong><p>12-month cash projections, income reductions, spending increases, one-time costs, first simulated shortfall month, additional cash buffer needed, and monthly savings targets.</p></div><div><strong>What we do not claim</strong><p>We do not predict future income, model interest or debt, provide personalized regulated financial advice, or assert that the fictional data represents any population.</p></div><div><strong>Where this could go</strong><p>With consent and appropriate data access, future work could validate bank transaction trends and study resilience across irregular-income groups using clearly documented real sources.</p></div></div></section>
  <section class="trust-strip">${icon('shield',18)} <span><strong>Honest by design.</strong> The concept is financial resilience, not a claim that this prototype is a licensed bank.</span></section>`;
}

function renderPage(context) {
  switch (state.page) {
    case 'dataset': return renderDataLab();
    case 'scenario': return scenarioPage(context);
    case 'goals': return goalsPage(context);
    case 'activity': return activityPage(context);
    case 'insights': return insightsPage(context);
    default: return overview(context);
  }
}

function render() {
  document.querySelector('#app').innerHTML = shell(customer());
  document.title = `${nav.find(item=>item[0]===state.page)?.[1]} | TANGO`;
}

/** Clear the visual result immediately, without interrupting slider dragging or typing. */
function invalidateScenario() {
  state.scenario = null;
  state.goalResult = null;
  state.notice = '';
  const resultPanel = document.querySelector('.scenario-results');
  if (resultPanel) resultPanel.innerHTML = scenarioEmptyResult();
}

function invalidateGoalPlan() {
  state.goalResult = null;
  state.notice = '';
  const resultPanel = document.querySelector('.goal-result');
  if (resultPanel) {
    resultPanel.innerHTML = `<div class="panel-kicker">PLAN NEEDS RECALCULATION</div><h3>Your goal has changed.</h3><p>Use “Build my plan” to calculate the result using your updated inputs.</p>`;
  }
}

function updateGoalDraft() {
  const value = selector => document.querySelector(selector)?.value ?? '';
  const toCents = raw => raw.trim() === '' ? null : Math.round(Number(raw) * 100);
  state.goalDraft = {
    name: value('#goal-name'),
    targetCents: toCents(value('#goal-target')),
    alreadySavedCents: toCents(value('#goal-saved')),
    monthsToGoal: value('#goal-months').trim() === '' ? null : Number(value('#goal-months'))
  };
}

function setPage(page) {
  state.page = page; state.menuOpen = false; state.notice = '';
  render(); window.scrollTo({ top: 0, behavior: 'instant' });
  if (page === 'dataset') void preloadResearch();
}

function readShock() {
  return {
    type: state.shockType,
    unit: state.shockType === 'one_time_cost' ? 'cents' : 'percent',
    amount: state.shockType === 'one_time_cost' ? Math.round(state.oneTimeAmount * 100) : state.shockAmount,
    startMonth: state.shockStart,
    durationMonths: state.shockType === 'one_time_cost' ? 1 : state.shockDuration,
    approved: true
  };
}

function goalFromForm() {
  const value = id => document.querySelector(id)?.value;
  for (const selector of ['#goal-name', '#goal-target', '#goal-saved', '#goal-months']) {
    if (!value(selector)?.trim()) throw new Error('Complete every goal field to build a plan');
  }
  return { name:value('#goal-name'), targetCents: Math.round(Number(value('#goal-target')) * 100), alreadySavedCents: Math.round(Number(value('#goal-saved')) * 100), monthsToGoal: Number(value('#goal-months')) };
}

document.addEventListener('click', event => {
  if (handleDataLabClick(event, render)) return;
  const navButton = event.target.closest('[data-nav]');
  if (navButton) { setPage(navButton.dataset.nav); return; }
  const typeButton = event.target.closest('[data-shock-type]');
  if (typeButton) { state.shockType = typeButton.dataset.shockType; state.scenario = null; state.goalResult=null; render(); return; }
  const goalButton = event.target.closest('[data-goal]');
  if (goalButton) { state.goalIndex=Number(goalButton.dataset.goal); state.goalDraft=null; state.goalResult=null; render(); return; }
  const action = event.target.closest('[data-action]')?.dataset.action;
  if (action === 'menu') { state.menuOpen=!state.menuOpen; render(); return; }
  if (action === 'new-goal') {
    state.goalDraft={name:'',targetCents:null,alreadySavedCents:null,monthsToGoal:null}; state.goalResult=null; render();
    document.querySelector('#goal-name')?.focus(); return;
  }
  if (action === 'evaluate') {
    try { state.scenario = runCustomerScenario(state.customerId, readShock(), 12); state.goalResult=null; state.notice=''; }
    catch (error) { state.scenario=null; state.notice=error.message; }
    render(); return;
  }
  if (action === 'plan-goal') {
    try { const values=goalFromForm(); state.goalResult=calculateCustomerGoal(state.customerId,values,state.scenario); state.goalDraft=values; state.notice=''; }
    catch (error) { state.goalResult=null; state.notice=error.message; }
    render(); return;
  }
});

document.addEventListener('change', event => {
  const { id, value } = event.target;
  if (id === 'customer-select') {
    state.customerId=value; state.scenario=null; state.goalResult=null; state.goalDraft=null; state.goalIndex=0; state.activityCategory='All'; state.activitySearch=''; state.notice=''; setPage('overview'); return;
  }
  if (id === 'shock-start') { state.shockStart=Number(value); invalidateScenario(); render(); return; }
  if (id === 'shock-duration') { state.shockDuration=Number(value); invalidateScenario(); render(); return; }
  if (id === 'shock-amount') {
    if (state.shockType==='one_time_cost') state.oneTimeAmount=value.trim() === '' ? NaN : Number(value);
    else state.shockAmount=value.trim() === '' ? NaN : Number(value);
    invalidateScenario(); render(); return;
  }
  if (id === 'activity-category') { state.activityCategory=value; render(); }
});

document.addEventListener('input', event => {
  if (handleDataLabInput(event)) return;
  if (event.target.id === 'shock-slider') {
    state.shockAmount=Number(event.target.value); invalidateScenario();
    const amountInput=document.querySelector('#shock-amount'); if (amountInput) amountInput.value=String(state.shockAmount);
  }
  if (event.target.id === 'shock-amount') {
    const value = event.target.value;
    if (state.shockType==='one_time_cost') state.oneTimeAmount=value.trim() === '' ? NaN : Number(value);
    else state.shockAmount=value.trim() === '' ? NaN : Number(value);
    invalidateScenario();
  }
  if (['goal-name','goal-target','goal-saved','goal-months'].includes(event.target.id)) {
    updateGoalDraft();
    invalidateGoalPlan();
  }
  if (event.target.id === 'activity-search') {
    state.activitySearch=event.target.value;
    const cursor=event.target.selectionStart; render();
    const input=document.querySelector('#activity-search'); input?.focus(); input?.setSelectionRange(cursor,cursor);
  }
});

document.addEventListener('submit', event => {
  if (event.target.id.startsWith('lab-')) void handleDataLabSubmit(event, render);
});

render();
// A static research summary is safe to preload; the full account extract remains lazy.
if (typeof window?.location?.href === 'string') void preloadResearch();
