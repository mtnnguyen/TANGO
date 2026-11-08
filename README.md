# TANGO

**Status:** Clean project foundation. TANGO is a new financial-resilience application informed by lessons from the Pulp datathon prototype. No customer-data pipeline, financial engine, AI planning council, authentication, or production deployment has been implemented in this repository yet.

## Mission

Help people understand how changing income affects financial stability, explore explainable what-if scenarios, and plan realistic steps toward their personal goals.

> Financial security isn't just about how much you earn. It's about how prepared you are when that income changes.

## Non-negotiable product rules

1. **One customer context:** never silently mix customer/account data. Identity and account ownership must be validated at every boundary.
2. **Evidence over invention:** separate dataset observations, user statements, assumptions, and synthetic examples; document sources and limitations.
3. **Deterministic financial calculations:** tested code produces all monetary and runway values. Language models may explain trade-offs but cannot invent financial outputs.
4. **Explicit consent:** scenario approval, context persistence, and plan acceptance are distinct user actions.
5. **Arbitrary valid shocks:** accept bounded, validated user-defined shocks; reject impossible or ambiguous requests clearly.
6. **Honest product behaviour:** display uncertainty, missing fields, failures, and model limitations rather than quietly guessing.
7. **Incremental engineering:** stable contracts, automated tests, and small reviewed PRs precede ambitious new features.

## Development agents

Six *manually invoked* GitHub custom agent profiles live under `.github/agents/`:

| Agent | Responsibility |
|---|---|
| ATLAS | Architecture, code boundaries, safe refactoring |
| LEDGER | Data dictionary, joins, provenance, customer identity |
| SHIELD | Scenario calculations, input validation, invariants, tests |
| COMPASS | User goals, plan options, product clarity and accessibility |
| PILOT | GitHub issue triage, priorities, dependencies, handoffs |
| SENTRY | Independent code review, testing, security and release risks |

Agents are **not autonomous background workers**, and they are not TANGO's eventual end-user financial AI agents. A human must select a task, inspect PRs, and decide what merges.

## Reference boundary

The original [Pulp prototype](https://github.com/AhmadAli137/pulp) is a **read-only research reference** for architecture, pitfalls and feature behaviour. **No agent may create issues, branches, commits, or any other changes in that repository.** TANGO is the sole development destination. Do not import data, secrets, licenses, or code without provenance and permission checks.

## Starting roadmap

1. Inventory reference functionality and known limitations without copying implementation.
2. Create an evidence-based issue backlog and a small synthetic test fixture.
3. Define customer/account and scenario contracts before implementing integrations.
4. Deliver one vertical slice: selected customer → approved shock → verified calculation → understandable result → personal goal choice.
5. Review every change against the architecture and data-integrity checks.

See `AGENTS.md`, `.github/copilot-instructions.md`, and `docs/` for working agreements.

**Not a banking integration or personalized financial-advice service.**
