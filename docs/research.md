# TANGO: research and account-explorer methods

## Provenance and scope

The account explorer is derived **only from the anonymized CSVs provided to participants** in the Sheridan Datathon 2026 Tangerine-track challenge, *Resilience Rewired*. We received `accounts.csv`, `monthly_summary.csv` and `loans.csv` as part of the supplied competition material. The rows represent historical bank data spanning 2020–2025; they are **not** real-time balances, authenticated banking accounts, Tangerine customer records, or a representative sample of Canada's population.

We intentionally do not publish transaction records, names, customer identities, birth dates, account-to-client joins, or bank connection credentials. The checked-in `public/data/account_summaries.json` is a **derived account-level research extract**, with anonymized account IDs and only the seven aggregates used in the track benchmark plus time coverage. All account results are isolated by exact `account_id` lookup. The fictional personas in the other TANGO screens are unrelated synthetic fixtures.

## Reproducing the extract

From the repo root, with the official CSV files in an external directory:

```bash
python3 scripts/prepare_bank_data.py --data-dir /path/to/competition/csvs
npm run check
npm test
python3 -m unittest discover -s tests -p '*_test.py'
npm run build
```

This script reads all 185,326 `monthly_summary` rows, validates the 4,500 account IDs against `accounts.csv`, rejects duplicate account-month pairs, derives 4,500 account summaries, and uses `loans.csv` to surface `monthly_payment` only for loans with track-defined active statuses C/D. The input files are not copied into the repo.

### Exact calculation definitions

All source dollars are converted via `Decimal` to integer cents before aggregation. Account-level:

- `I`, typical monthly money in = median(`money_in`), including incoming deposits and transfers. It is **not necessarily earned salary**.
- `S`, typical monthly spending = median(`money_out`).
- `F`, typical fixed costs = median(monthly `household_bills + insurance + loan_payments`), calculated on each **same month** before taking the median. This is descriptive, not an add-on to `S`.
- `H`, typical household bills = median(`household_bills`).
- `B`, buffer = mean(`avg_daily_balance`) from the account's six most recent available monthly observations, sorted by `month`.
- `P`, contract loan monthly payment = `monthly_payment` if the end-of-2025 loan status is running (C/D); otherwise 0. `P` is shown separately and **not** added again to `S`.
- `runway = 0` if `B - one-off cost` is not positive; “no shortfall (120+)” if spending after shock is no more than income after shock; otherwise `min((B-one-off cost) / (spending after shock-income after shock), 120)`, rounded to one decimal place.

The exact track benchmark corresponds to **start month 1**. TANGO also permits a later start month: this is an explicitly labelled **extension** in which `(I-S) × (startMonth-1)` is added before the shock, not a value the judges supplied. The duration field determines whether the remaining buffer covers the requested number of months. The indefinite runway calculation is based on a constant shocked monthly gap; it does not model a return to employment after the shock. Neither runway nor estimated survival is a guarantee or suitability recommendation.

For goals, the user must explicitly provide the target amount, already-saved amount, and months remaining. A three- or six-month spending buffer is an **optional suggestion**, not assumed customer intent. The required deposit is `ceil((target - saved) / months)` in cents. Monthly affordability is computed separately for baseline (`I - S`) and for a chosen shocked budget. Spending reductions are options to explore; fixed expenses are not automatically classified as reducible.

## Findings from this exact dataset

| Descriptive result | Value |
| --- | ---: |
| Distinct accounts | 4,500 |
| Account-month records | 185,326 |
| Linked loan records | 682 |
| Accounts whose typical spending exceeds typical income | 1,181 / 4,500 = 26.2% |
| Accounts with fewer than 3 benchmark runway months under combined shock | 523 / 4,500 = 11.6% |
| Accounts with fewer than 6 months under same shock | 1,752 / 4,500 |
| Median **finite** runway under same shock | 7.4 months |
| Accounts with a benchmark “no shortfall (120+)” outcome under same shock | 184 |

### Unexpected pattern: high monthly inflows do not guarantee resilience

For a more meaningful comparison, we **exclude 81 effectively inactive accounts** whose medians for either incoming money or spending are zero. Of the 4,419 remaining active accounts, we sort by median monthly incoming money and divide into four near-equal groups. Under the same combined shock:

| Segment | Accounts | Median monthly inflow | Median buffer ÷ typical spending | Accounts below 3-month runway |
| --- | ---: | ---: | ---: | ---: |
| Lowest-inflow quartile | 1,104 | $2,282.52 | 8.02 months | 26 (2.4%) |
| Highest-inflow quartile | 1,105 | $17,759.26 | 1.87 months | 253 (22.9%) |

This is a **descriptive contrast**, not evidence that receiving more credits causes instability. The accounts are not a random sample of Canadians and could differ in balances, transaction patterns, tenure or other unobserved ways. It does show why TANGO must examine spending and buffer alongside deposits: a seemingly large incoming flow can conceal a narrow cash cushion relative to spending.

**Publication note:** the account-level extract is held only in the private TANGO repository. The competition documentation available to us does not specify public redistribution rights for the source banking CSVs or their account-level derivatives. Confirm organizer permission or remove the account-level extract **before making the repository public**. The aggregate cohort findings and the reproducible generator are documented separately.

The combined scenario retains **55%** of income, increases household bills by **15%**, and applies **no** one-off cost. Accounts with nonpositive buffer have zero runway. “Finite” median excludes accounts without a monthly shortfall. These are descriptive findings for the **provided dataset only**, not a causal explanation, statistical model, or a claim about military/veteran/athlete finances. We cannot infer categories like reservists from these records.

## Honest limitations and safeguards

1. Spending categories have incomplete merchant labels; low/zero `household_bills` does **not** prove zero real household costs.
2. Median income and spending may occur in different months. The resulting typical net cash flow is a benchmark approximation, not a cash-flow reconstruction.
3. Six-month trailing daily-balance means can be negative. These accounts get zero buffer runway under the track formula.
4. A loan's active flag uses its 2025 status from the source table; we do not infer missing contracts or early payoff dates.
5. No individual, institution, or demographic cohort conclusions are inferred. The application does not provide financial advice, bank authentication, AI-generated monetary values, or automatic savings transactions.
6. The browser stores the derived public competition extract only in session memory. It does not save selected accounts or entered goal details to a server.

## One-account isolation

The selected anonymized account ID is the sole key used to retrieve a copy of one summary; customer switching discards prior computed shock and goal state before showing the next record. All financial arithmetic lives in `src/domain/benchmark.js` and has boundary tests. The static JSON loading boundary is `src/infrastructure/accountSummaries.js`; the UI is `src/delivery/dataLab.js`.
