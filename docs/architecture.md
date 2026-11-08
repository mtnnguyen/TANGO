# TANGO target architecture

**Implementation status:** the browser MVP implements the domain, application, synthetic-fixture and delivery layers. A server, real data pipeline, authenticated accounts and LLM explainer are **not implemented**.

## Trust boundary

Verified selected customer and approved scenario → deterministic evaluator → evidence-backed result → optional, explicitly accepted goal plan.

| Layer | Responsibilities | Must not depend on |
|---|---|---|
| Domain | Customer scope, financial values, shocks, runway, goals | Frameworks, network, database, LLM, UI |
| Application | Typed use cases, consent state, orchestration | Concrete third-party service classes |
| Infrastructure | Data loaders, SQL/CSV, cache, providers | UI components |
| Delivery | HTTP routes, React, voice/chat | Hidden financial rules |

### Current implementation (Nov 2026)

- `src/domain/finance.js`: snapshots and approved shocks, validation, deterministic monthly cents-based liquidity simulation, formatters.
- `src/domain/goals.js`: optional explicit goal planning from user-specified name/amount/savings/deadline.
- `src/application/customerService.js`: repository-agnostic customer use cases, validates selected identity and transaction ownership, and rejects scenarios from another customer.
- `src/infrastructure/demoCustomers.js`: defensive copies of exactly three fictional personas and sample transactions.
- `src/delivery/customerService.js`: application composition root, injecting the demo repository adapter into the customer use cases.
- `src/delivery/app.js` and `styles.css`: dependency-free SPA and responsive view; switching customers resets state, and editing a scenario or goal immediately invalidates its previous result.
- `tests/finance.test.js`: domain, validation, shock schedule, isolation and goal cases.

**Why no framework or backend yet?** A small, standard ECMAScript frontend with zero dependencies makes the core demonstration reproducible even without package-registry access. The domain and application functions have stable seams and can later be consumed by a React app or service without copying rules into components. This is not an authenticated or scalable bank product.

**Data provenance:** all values are synthetic, in Canadian cents, and have no empirical provenance. Sample monthly snapshots are fixture estimates separate from the deliberately incomplete transaction subset. No historical account data, military pay rates or player earnings are represented.

**Scenario contract:** `type` (`income_drop`, `expense_increase`, `one_time_cost`), `unit` (`percent` or `cents` according to type), finite nonnegative `amount`, explicit `startMonth` (1–36), `durationMonths` (1–36), and `approved=true`. Income loss cannot exceed 100%; expense increases can reach 5,000%; one-time costs are bounded by a documented safe-cents limit. Invalid numbers, units and dates throw a visible error.

**Interpretation:** an input shock influences selected calendar-relative months. Cash is updated by income minus expenses in each month, starting from reported liquid savings. Results show the first negative monthly ending balance, worst aggregate funding gap, shocked-month cash gap, and a 12-month outcome. A shortfall is not an automatic loan. The plan calculator uses the lowest simulated monthly net income within the available simulation window and is therefore illustrative, not a guarantee.

## Intended contracts (to agree before implementing)
- **CustomerContext:** selected client, permitted accounts, source and version.
- **FinancialSnapshot:** values, currency, time period, provenance and as-of date.
- **ShockRequest:** type, amount, units, start, duration and explicit approval state.
- **ScenarioResult:** baseline, shocked cash flow, runway, shortfall, assumptions and calculation version.
- **GoalRequest:** optional target, deadline, priority, constraints and confirmation.
- **PlanOption:** actions, source scenario, projected verified impact, limits and acceptance state.

## Explicit failure cases
- Customer/account identity mismatch or stale customer selection.
- Missing account data, duplicate joins or unresolved shared dispositions.
- Unknown shock type, nonfinite input, impossible percentage or ambiguous timing.
- Insufficient savings, zero income, immediate one-time shortfall, negative budget.
- Missing goal amount or deadline: ask or mark unknown, do not manufacture.
- Data/LLM/API error: return a safe error, not a fabricated answer.

No broad refactor should be accepted without tested behavior parity. Reference `AhmadAli137/pulp` is READ-ONLY.
