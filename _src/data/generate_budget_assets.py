import csv
import json
from collections import defaultdict
from pathlib import Path


CSV_PATH = Path(__file__).with_name("City_of_Sacramento_Approved_Budgets.csv")
DATA_DIR = Path(__file__).parent
COMPARE_DIR = DATA_DIR / "compare"
TREE_DIR = DATA_DIR / "tree"

EXPENSE_VALUES = {"E", "Expenses"}
REVENUE_VALUES = {"R", "Revenues"}


def fy_label(calendar_year):
    return f"FY{str(calendar_year)[-2:]}"


def load_rows():
    with CSV_PATH.open(newline="", encoding="utf-8-sig") as handle:
        reader = csv.DictReader(handle)
        return list(reader)


def sort_rows(grouped_rows, key_name, calendar_year):
    return [
        {
            "budget_type": "1",
            "fiscal_year_range": int(calendar_year),
            key_name: key,
            "total": str(int(round(total))),
            "general_fund": "0",
        }
        for key, total in sorted(grouped_rows.items(), key=lambda item: item[0])
    ]


def write_json(path, payload):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload), encoding="utf-8")


def generate_compare_assets(rows):
    totals_path = COMPARE_DIR / "fiscal-years-expenses" / "totals.json"
    totals = json.loads(totals_path.read_text(encoding="utf-8"))

    existing_years = {entry["fiscal_year_range"] for entry in totals}
    # Only generate missing fiscal years so reruns stay idempotent.
    source_years = {row["Fiscal_Year"] for row in rows if row["Fiscal_Year"]}
    known_years = {f"20{year[-2:]}" for year in existing_years}
    compare_years = sorted(source_years - known_years)

    for calendar_year in compare_years:
        fiscal_year = fy_label(calendar_year)
        year_rows = [row for row in rows if row["Fiscal_Year"] == calendar_year]

        expenses = [row for row in year_rows if row["ExpenseRevenue"] in EXPENSE_VALUES]
        revenues = [row for row in year_rows if row["ExpenseRevenue"] in REVENUE_VALUES]

        expense_by_dept = defaultdict(float)
        expense_by_cat = defaultdict(float)
        revenue_by_dept = defaultdict(float)
        revenue_by_cat = defaultdict(float)

        for row in expenses:
            amount = float(row["Amount"] or 0)
            expense_by_dept[row["Department"]] += amount
            expense_by_cat[row["CATEGORY"]] += amount

        for row in revenues:
            amount = float(row["Amount"] or 0)
            revenue_by_dept[row["Department"]] += amount
            revenue_by_cat[row["CATEGORY"]] += amount

        write_json(
            COMPARE_DIR / "fiscal-years-expenses" / "depts" / f"{fiscal_year}.json",
            sort_rows(expense_by_dept, "department", calendar_year),
        )
        expense_category_path = (
            COMPARE_DIR
            / "fiscal-years-expenses"
            / "account-cats"
            / f"{fiscal_year}.json"
        )
        write_json(
            expense_category_path,
            sort_rows(expense_by_cat, "account_category", calendar_year),
        )
        write_json(
            COMPARE_DIR / "fiscal-years-revenue" / "depts" / f"{fiscal_year}.json",
            sort_rows(revenue_by_dept, "department", calendar_year),
        )
        revenue_category_path = (
            COMPARE_DIR
            / "fiscal-years-revenue"
            / "account-cats"
            / f"{fiscal_year}.json"
        )
        write_json(
            revenue_category_path,
            sort_rows(revenue_by_cat, "account_category", calendar_year),
        )

        # Preserve the historical totals.json shape consumed by compare pages.
        totals.append(
            {
                "budget_type": "1",
                "fiscal_year_range": fiscal_year,
                "total": str(
                    int(round(sum(float(row["Amount"] or 0) for row in expenses)))
                ),
                "general_fund": str(
                    int(
                        round(
                            sum(
                                float(row["Amount"] or 0)
                                for row in expenses
                                if row["Fund"] == "General Fund"
                            )
                        )
                    )
                ),
            }
        )

    totals.sort(key=lambda entry: entry["fiscal_year_range"])
    write_json(totals_path, totals)


def make_tree_node(name, amount, budget_type, children=None):
    node = {
        "data": {
            "amount": amount,
            "revenue": amount if budget_type == "revenue" else 0.0,
            "expense": amount if budget_type == "expense" else 0.0,
        },
        "key": name,
    }
    if children:
        node["values"] = children
    return node


def build_tree(rows, hierarchy, budget_type):
    def build_level(items, index):
        grouped = defaultdict(list)
        for item in items:
            grouped[item[hierarchy[index]]].append(item)

        nodes = []
        for key in sorted(grouped):
            group_items = grouped[key]
            amount = sum(float(row["Amount"] or 0) for row in group_items)
            children = None
            # Recurse until the configured hierarchy depth is exhausted.
            if index + 1 < len(hierarchy):
                children = build_level(group_items, index + 1)
            nodes.append(make_tree_node(key, amount, budget_type, children))
        return nodes

    total = sum(float(row["Amount"] or 0) for row in rows)
    return make_tree_node("Budget", total, budget_type, build_level(rows, 0))


def generate_tree_assets(rows):
    # Limit generation to currently supported fiscal-year tree outputs.
    wanted_years = {"2025", "2026"}
    for calendar_year in wanted_years:
        fiscal_year = fy_label(calendar_year)
        expense_rows = [
            row
            for row in rows
            if (
                row["Fiscal_Year"] == calendar_year
                and row["ExpenseRevenue"] in EXPENSE_VALUES
            )
        ]
        revenue_rows = [
            row
            for row in rows
            if (
                row["Fiscal_Year"] == calendar_year
                and row["ExpenseRevenue"] in REVENUE_VALUES
            )
        ]

        expense_tree = build_tree(
            expense_rows,
            ["Fund", "Department", "CATEGORY", "Fund_Category"],
            "expense",
        )
        revenue_tree = build_tree(
            revenue_rows,
            ["Fund", "CATEGORY"],
            "revenue",
        )

        write_json(TREE_DIR / f"Approved.Expense.{fiscal_year}.json", expense_tree)
        write_json(TREE_DIR / f"Approved.Revenue.{fiscal_year}.json", revenue_tree)


def main():
    rows = load_rows()
    generate_compare_assets(rows)
    generate_tree_assets(rows)


if __name__ == "__main__":
    main()
