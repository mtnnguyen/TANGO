# TANGO target architecture

**Design only:** no application modules below are claimed to exist yet.

## Trust boundary

Verified selected customer and approved scenario → deterministic evaluator → evidence-backed result → optional, explicitly accepted goal plan.

| Layer | Responsibilities | Must not depend on |
|---|---|---|
| Domain | Customer scope, financial values, shocks, runway, goals | Frameworks, network, database, LLM, UI |
| Application | Typed use cases, consent state, orchestration | Concrete third-party service classes |
| Infrastructure | Data loaders, SQL/CSV, cache, providers | UI components |
| Delivery | HTTP routes, React, voice/chat | Hidden financial rules |

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
