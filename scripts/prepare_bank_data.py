"""Create a small, reproducible account-level research extract for the TANGO demo.

Usage: python3 scripts/prepare_bank_data.py --data-dir /path/to/datathon/csvs

The input CSVs are never copied. This publishes only benchmark-level aggregates
for anonymized account IDs; no clients, cards, or transaction-level records.
"""

import argparse
import csv
import json
from collections import defaultdict
from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path
from statistics import mean, median


def cents(value):
    return int((Decimal(value) * 100).quantize(Decimal("1"), rounding=ROUND_HALF_UP))


def dollars(value):
    return round(value / 100, 2)


def runway(buffer_cents, income_cents, spending_cents, one_off_cents=0):
    left = buffer_cents - one_off_cents
    gap = spending_cents - income_cents
    if left <= 0:
        return 0.0
    if gap <= 0:
        return None  # No shortfall; the judging convention is "120+".
    return min(left / gap, 120.0)


def summarize_account(rows, loan_payment_cents=0):
    if not rows:
        raise ValueError("An account requires at least one monthly row")
    rows = sorted(rows, key=lambda item: item["month"])
    if len({row["month"] for row in rows}) != len(rows):
        raise ValueError("Duplicate account-month entry")
    med = lambda key: median(row[key] for row in rows)
    return {
        "income": dollars(med("money_in")),
        "spending": dollars(med("money_out")),
        "fixed": dollars(median(row["household_bills"] + row["insurance"] + row["loan_payments"] for row in rows)),
        "household": dollars(med("household_bills")),
        "buffer": dollars(mean(row["avg_daily_balance"] for row in rows[-6:])),
        "loan": dollars(loan_payment_cents),
        "months": len(rows),
        "asOf": rows[-1]["month"],
    }


def quantile(sorted_values, fraction):
    if not sorted_values:
        return None
    return sorted_values[round((len(sorted_values) - 1) * fraction)]


def build(data_dir):
    required = {"accounts.csv", "monthly_summary.csv", "loans.csv"}
    for filename in required:
        if not (data_dir / filename).is_file():
            raise FileNotFoundError(f"Missing {filename} under {data_dir}")

    with (data_dir / "accounts.csv").open(newline="", encoding="utf-8-sig") as handle:
        ids = [row["account_id"] for row in csv.DictReader(handle)]
    if len(set(ids)) != len(ids):
        raise ValueError("Duplicate IDs in accounts.csv")
    account_ids = set(ids)

    loans = {}
    with (data_dir / "loans.csv").open(newline="", encoding="utf-8-sig") as handle:
        for row in csv.DictReader(handle):
            account_id = row["account_id"]
            if account_id not in account_ids or account_id in loans:
                raise ValueError(f"Unknown or duplicate loan account: {account_id}")
            loans[account_id] = cents(row["monthly_payment"]) if row["status"] in {"C", "D"} else 0

    monthly = defaultdict(list)
    row_count = 0
    fields = ("money_in", "money_out", "household_bills", "insurance", "loan_payments", "avg_daily_balance")
    with (data_dir / "monthly_summary.csv").open(newline="", encoding="utf-8-sig") as handle:
        for row in csv.DictReader(handle):
            account_id = row["account_id"]
            if account_id not in account_ids:
                raise ValueError(f"Unknown account in monthly_summary: {account_id}")
            month = row["month"]
            if len(month) != 7 or month[4] != "-" or not month[:4].isdigit() or not month[5:].isdigit() or not 1 <= int(month[5:]) <= 12:
                raise ValueError(f"Invalid month: {month}")
            monthly[account_id].append({"month": month, **{key: cents(row[key]) for key in fields}})
            row_count += 1

    missing = account_ids - monthly.keys()
    if missing:
        raise ValueError(f"Accounts without monthly observations: {len(missing)}")

    summaries = {account_id: summarize_account(monthly[account_id], loans.get(account_id, 0)) for account_id in sorted(ids, key=int)}
    baseline_deficit = sum(v["spending"] > v["income"] for v in summaries.values())
    shocked = [
        runway(v["buffer"] * 100, v["income"] * 55, v["spending"] * 100 + v["household"] * 15)
        for v in summaries.values()
    ]
    finite = sorted(v for v in shocked if v is not None)
    count = len(summaries)
    # Compare only accounts with positive median income AND spending: including
    # dormant accounts makes the low-income group appear artificially resilient.
    eligible = sorted((s for s in summaries.values() if s["income"] > 0 and s["spending"] > 0), key=lambda s: s["income"])
    def income_quartile(index):
        group = eligible[index * len(eligible) // 4:(index + 1) * len(eligible) // 4]
        at_risk = sum(
            (r := runway(s["buffer"] * 100, s["income"] * 55, s["spending"] * 100 + s["household"] * 15)) is not None and r < 3
            for s in group
        )
        return {
            "accounts": len(group),
            "medianIncome": round(median(s["income"] for s in group), 2),
            "medianBufferToSpending": round(median(s["buffer"] / s["spending"] for s in group), 2),
            "underThreeMonths": at_risk,
            "underThreeMonthsPercent": round(100 * at_risk / len(group), 1),
        }
    findings = {
        "source": "Sheridan Datathon 2026 Tangerine track, supplied anonymized banking CSVs",
        "period": "2020–2025 (historical, not live bank information)",
        "accounts": count,
        "monthlyRows": row_count,
        "loans": len(loans),
        "incomeBelowSpendingAccounts": baseline_deficit,
        "incomeBelowSpendingPercent": round(100 * baseline_deficit / count, 1),
        "combinedShock": "Income retained at 55% and household bills increased by 15%; no one-off charge",
        "shockNoShortfallAccounts": count - len(finite),
        "shockBelowThreeMonthsAccounts": sum(v is not None and v < 3 for v in shocked),
        "shockBelowThreeMonthsPercent": round(100 * sum(v is not None and v < 3 for v in shocked) / count, 1),
        "shockBelowSixMonthsAccounts": sum(v is not None and v < 6 for v in shocked),
        "medianFiniteShockRunwayMonths": round(median(finite), 1) if finite else None,
        "finiteShockRunwayP25Months": round(quantile(finite, 0.25), 1) if finite else None,
        "finiteShockRunwayP75Months": round(quantile(finite, 0.75), 1) if finite else None,
        "activeAccountsForQuartileComparison": len(eligible),
        "lowestIncomeQuartile": income_quartile(0),
        "highestIncomeQuartile": income_quartile(3),
        "limitations": "Descriptive historical account-level statistics, not population estimates or causation. Uses track benchmark formulas; negative buffers count as zero months of runway.",
    }
    return {"schemaVersion": 1, "provenance": findings["source"], "accounts": summaries}, findings


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--data-dir", required=True, type=Path)
    parser.add_argument("--out-dir", default=Path("public/data"), type=Path)
    args = parser.parse_args()
    dataset, findings = build(args.data_dir)
    args.out_dir.mkdir(parents=True, exist_ok=True)
    (args.out_dir / "account_summaries.json").write_text(json.dumps(dataset, separators=(",", ":"), ensure_ascii=False) + "\n", encoding="utf-8")
    (args.out_dir / "research_findings.json").write_text(json.dumps(findings, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps(findings, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
