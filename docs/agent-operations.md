# How to use TANGO's six custom agents

The files under `.github/agents/` configure **manually selected GitHub Copilot agents**. They are not always-on services and do not independently scan or write the repository. Your account needs the GitHub Copilot cloud agent feature enabled.

## Start an approved issue
1. Ask **PILOT** to *propose* small tasks after inspecting the current TANGO repository.
2. A human reviews and creates the GitHub Issue with clear acceptance criteria.
3. In the GitHub Agents interface choose TANGO, then explicitly select **ATLAS**, **LEDGER**, **SHIELD** or **COMPASS** for its specialty. If available, assign the coding agent to the issue.
4. Require an isolated branch/PR with actual test results.
5. Invoke **SENTRY** separately to critique the PR; human reviewers decide whether to merge.

## Safe first prompts
- PILOT: "Read-only audit TANGO and propose five issues with owners, tests, dependencies and priority."
- ATLAS: "Audit current repository architecture and propose three small safe boundaries. No code changes."
- LEDGER: "Inventory actual datasets and required customer-identity joins. No code changes."
- SHIELD: "Define a shock contract and edge-case test plan for TANGO's current state. No code changes."
- COMPASS: "Propose the smallest goal-planning flow with verified calculation dependencies. No code changes."
- SENTRY: "Review the latest PR or current scaffold and report specific, evidence-backed risks. No edits."

## Controls
- `disable-model-invocation: true` means agents require manual selection.
- PILOT has read/search tools only and drafts issues; it does not autonomously publish them.
- SENTRY can execute checks but cannot edit implementation.
- All writes are confined to TANGO. **Pulp is reference-only, with zero permitted mutations.**
- No agent auto-merges, deploys, shares data or changes access controls.
