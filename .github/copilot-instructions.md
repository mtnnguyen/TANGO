# TANGO Copilot repository instructions

Read and comply with `AGENTS.md`, `docs/architecture.md`, `docs/roadmap.md` and the chosen profile in `.github/agents/`.

- TANGO (`mtnnguyen/TANGO`) is the only write target. Pulp (`AhmadAli137/pulp`) is a read-only learning reference, not a fork or destination.
- Do not assume existing app code, datasets, tests or integrations until verified.
- Prefer a clear, tested vertical slice and explicit types over large generated abstractions.
- Preserve customer identity, source provenance, numerical correctness and user consent across boundaries.
- Never use LLM text as the source of financial math or research statistics.
- Work from an approved GitHub Issue, on a branch, with a narrow PR. A human decides what merges.
