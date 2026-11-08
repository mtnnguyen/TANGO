"""Run with python3 -m unittest discover -s tests -p '*_test.py'."""

import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
from prepare_bank_data import cents, runway, summarize_account  # noqa: E402


class BankDataTests(unittest.TestCase):
    def test_money_rounds_from_decimal_input(self):
        self.assertEqual(cents("10.005"), 1001)
        self.assertEqual(cents("-1.005"), -101)

    def test_medians_fixed_costs_and_last_six_mean(self):
        rows = [
            dict(month=f"2025-{month:02d}", money_in=month * 100, money_out=month * 70,
                 household_bills=month * 30, insurance=month * 10, loan_payments=month * 5,
                 avg_daily_balance=month * 1000)
            for month in range(1, 9)
        ]
        summary = summarize_account(rows, loan_payment_cents=800)
        self.assertEqual(summary["income"], 4.5)
        self.assertEqual(summary["spending"], 3.15)
        self.assertEqual(summary["fixed"], 2.02)  # 4.5 * 45 cents, rounded to nearest cent
        self.assertEqual(summary["buffer"], 55)
        self.assertEqual(summary["loan"], 8)
        self.assertEqual(summary["months"], 8)

    def test_runway_matches_benchmark_special_cases(self):
        self.assertEqual(runway(50000, 40000, 50000, 20000), 3)
        self.assertEqual(runway(1000, 40000, 50000, 2000), 0)
        self.assertIsNone(runway(1000, 60000, 50000))
        self.assertEqual(runway(1_000_000, 0, 100), 120)


if __name__ == "__main__":
    unittest.main()
