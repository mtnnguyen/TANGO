# TANGO agent-wide instructions

## Scope and authority
- **TANGO is the only writable repository.** The Pulp prototype (`AhmadAli137/pulp`) is **read-only**. Never modify it via any GitHub operation.
- These profiles do not authorize unattended actions. Select an agent manually for a human-approved issue. Never merge, deploy, manage secrets, change access or alter other repositories.
- TANGO starts as a scaffold. Do not claim nonexistent code, tests, customer data, models, banking connections or research results.

## Trustworthy finance rules
1. Identify one customer and explicitly authorized accounts; never mix customers through joins, state or caching.
2. Distinguish validated observations, user inputs, model suggestions, assumptions and synthetic fixtures.
3. All monetary values, runway and projections must originate in deterministic, tested calculation code—not LLM responses.
4. Treat scenario approval, persistence of customer context and acceptance of a plan as separate actions.
5. Represent shock type, unit, amount, start time, duration and bounds explicitly. Reject invalid or ambiguous inputs rather than inventing defaults.
6. Do not claim a missing goal amount/deadline is zero or replace it with an invented target.
7. Never commit secrets, raw private customer information or external code/data without provenance and rights.

## Clean Architecture
- **Domain:** pure identity, financial and goal rules with no IO, framework, model-provider or UI dependencies.
- **Application:** typed use cases and boundary interfaces.
- **Infrastructure:** loaders, persistence, model providers and external APIs.
- **Delivery:** HTTP routes, React interface, voice and chat.
Dependencies point inward. Avoid decorative abstractions or massive folder movements. Prove behavior-preserving changes with tests.

## Working agreement
1. Read the relevant issue, existing implementation, documentation and tests.
2. State observed evidence, scope and acceptance tests before editing.
3. Implement one small PR; coordinate shared types and contracts first.
4. Run available lint, type checks, calculations and tests; report truthful results and blockers.
5. Request SENTRY-style independent review and human approval. Never auto-merge.

When asked to do a general audit, stay read-only and draft focused issues instead of writing broad unsolicited refactors.
