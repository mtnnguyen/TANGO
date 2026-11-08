# TANGO agent-wide instructions

## Scope and authority
- **TANGO is the only writable repository.** The Pulp prototype (`AhmadAli137/pulp`) is **read-only**. Never modify it via any GitHub operation.
- These profiles do not authorize unattended actions. Select an agent manually for a human-approved issue. Agents may review pull requests and perform **case-by-case, explicitly authorized** TANGO merges under the policy below. Never deploy, manage secrets, change access, bypass repository protections or alter other repositories.
- Do not claim nonexistent code, tests, customer data, models, banking connections or research results. Verify the current repository state before describing implemented features.

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
5. Request SENTRY-style independent review and human approval. Never merge without the named pull request's explicit authorization from Martin.

## Pull request review and merge policy

- Agents may open branches, commits, issues and pull requests **only in TANGO** for work Martin has authorized.
- Agents may review TANGO pull requests, comment on defects, request changes, request human reviewers and submit a formal review when the GitHub account/app has the required permissions. An agent must not misrepresent its own review as independent human approval.
- **Explicit permission is required for each merge.** Martin must name the TANGO pull request (number or link) and explicitly instruct the agent to merge it. A general statement such as "manage our PRs" is not standing merge permission.
- Before an authorized merge, inspect the latest diff and base branch, verify tests and required checks, check for secrets, out-of-scope changes, security and customer-isolation regressions, and report material risks. If a blocker remains, stop and ask Martin to resolve it.
- Use the requested merge method; if none is specified, ask before merging. Never enable auto-merge, force-push, bypass branch protection, dismiss blocking reviews or weaken required checks to make a merge succeed.
- Do not merge changes authored by the agent based solely on that same agent's approval when repository policy requires independent review. GitHub's required human approvals and checks still apply.
- Never merge, modify, comment on or otherwise write to `AhmadAli137/pulp`. Never deploy, manage secrets, change repository access or modify unrelated repositories without separate explicit authority.

When asked to do a general audit, stay read-only and draft focused issues instead of writing broad unsolicited refactors.
