# TANGO

## Sheridan Datathon: account explorer

TANGO opens in **Account explorer**, where a judge can enter any of the 4,500 anonymized account IDs in the provided Tangerine-track extract. It shows the track benchmark money-in, spending, fixed costs, and six-month buffer; runs bounded income-credit, household-bill, one-time-cost, timing, and duration shocks; and builds explicitly user-defined emergency fund and backup plans. The other customer screens are **fictional demonstration personas** kept separate from the historical account explorer.

The historical dataset covers 2020–2025. TANGO is a prototype, not a bank account service. See [research methodology, precise equations and limitations](docs/research.md). The checked-in research extract contains derived, anonymized account-level aggregates only, not raw transactions or client identities. **Confirm organizer redistribution permission before publishing these account-level aggregates in a public repository.**

To reproduce the summary from organizer-provided files, run `python3 scripts/prepare_bank_data.py --data-dir /path/to/competition/csvs`. Run `npm run check`, `npm test`, `python3 -m unittest discover -s tests -p '*_test.py'`, and `npm run build` locally; `.github/workflows/ci.yml` runs these checks on pull requests.

**Status:** Working, self-contained prototype with two explicitly separated modes: a historical anonymized account explorer and a synthetic consumer-dashboard preview. Financial calculations are deterministic and tested. There is **no** live bank connection, banking API, login, or production authentication system.

## Mission

Help people understand how changing income affects financial stability, explore explainable what-if scenarios, and plan realistic steps toward their personal goals.

> Financial security isn't just about how much you earn. It's about how prepared you are when that income changes.

## Run the prototype

Node.js 20+ is required. No package installation, API keys, database or environment variables are needed.

```bash
npm run dev
```

Open `http://localhost:4173`.

```bash
npm run check  # checks JavaScript module syntax
npm test       # domain and customer-isolation tests
npm run build  # copies a static, deployable site to dist/
```

The site is a standards-based, responsive ESM application with zero runtime dependencies. It loads the account-level extract on the first account search; a remote font is optional and falls back to system fonts. A static hosting provider can serve `dist/` from its root. Do not deploy or change repo settings without human approval.

## What actually works

- **Account explorer (default):** select an anonymized account, apply benchmark-compatible or custom combined shocks, see runway math, and enter a dated goal with a shock-aware backup calculation.
- **Overview (fictional preview):** selected customer, sample monthly income and spending, cash buffer, illustrative no-shock trend and recent transactions.
- **Resilience lab:** explicitly approve a scenario with a drop in income, increase in expenses or one-time cost. Edit the shock amount, start month, and duration; see monthly balances, the first unfunded shortfall, and the extra cash buffer required within 12 months.
- **Goals:** enter the goal name, exact amount, already-saved amount and deadline. TANGO computes a required monthly contribution and tests it against current income/spending (or the latest approved scenario).
- **Activity:** search and filter synthetic transactions, strictly scoped to the chosen fictional customer.
- **How it works:** visible calculation assumptions and honest limitations.

Switching customers discards the previous customer's scenario and goal work. Neither those calculations nor transactions are saved. This is intentional for a privacy-safe demonstration.

## Design and calculation boundaries

| Layer | Files | Purpose |
|---|---|---|
| Domain | `src/domain/` | Pure cents-based shock and goal calculations; validation; no UI or I/O |
| Application | `src/application/` | Customer-scoped use cases and ownership checks |
| Infrastructure | `src/infrastructure/` | Lazy-loaded anonymized account aggregates and three separately labelled fictional fixtures |
| Delivery | `src/delivery/`, `index.html` | Accessible browser flows, scenario controls, charts and responsive styling |

In the **fictional preview**, transaction lists are illustrative, incomplete sample records and do not support the sample monthly snapshot amounts. In **Account explorer**, historical figures are computed from the provided `monthly_summary.csv` account rows only, using the published track definitions. See [research methods](docs/research.md) for descriptive findings and caveats; do not generalize those findings beyond the supplied dataset.

The resilience engine models cash changes month by month, beginning with liquid savings. It includes baseline net cash flow, applies the specified shock in the specified months, and reports the first month savings fall below $0. A negative result is an **unfunded shortfall, not a bank-approved overdraft**. No interest, tax changes, credit facilities, investment returns or other implicit safety net are assumed. The goal result is an educational calculation, not individual financial advice.

For data definitions, assumptions, and known extensions, see [docs/architecture.md](docs/architecture.md).

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

## Next roadmap

1. Independently reproduce defensible empirical insights from licensed public datasets, with a documented data dictionary and checked joins.
2. Add accessible comparative scenario views and goal plan acceptance (distinct from merely running a simulation).
3. Add a real authenticated API boundary, consent model, audit trail and authorized bank integrations only with appropriate agreements.
4. Obtain independent review of the domain and UI; test browser flows and accessibility across devices.
5. Investigate an optional language model for **plain-language explanations only**, never the source of numbers.

See `AGENTS.md`, `.github/copilot-instructions.md`, and `docs/` for working agreements.

**Not a bank, banking integration, or personalized financial-advice service.**
