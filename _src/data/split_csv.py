# Split one CSV file into many files based on a grouping column.
# This supports legacy flow-chart inputs that expect one file per fiscal year.
#
# usage: split_csv.py <csv_file> <column_name> <output_dir> [--txf <transform_name>]
# example:
# python3 split_csv.py test.csv Fiscal_Year _src/data/flow --txf fy_suffix
# The --txf option transforms values such as 2019 -> FY19.
# Supported transforms are "identity" and "fy_suffix".
import argparse
from pathlib import Path

import pandas as pd


def get_transform(name):
    normalized = str(name).replace("\\", "").strip()
    transforms = {
        "identity": lambda value: value,
        "fy_suffix": lambda value: f"FY{str(value)[-2:]}",
        # Keep aliases so older README examples and shell history still work.
        "lambda x: x": lambda value: value,
        "lambda x: 'FY' + str(x)[-2:]": lambda value: f"FY{str(value)[-2:]}",
    }
    if normalized not in transforms:
        raise ValueError(
            f'Unsupported transform "{name}". Use one of: identity, fy_suffix.'
        )
    return transforms[normalized]


def main():
    parser = argparse.ArgumentParser(
        description="Split one CSV into multiple files grouped by a column value."
    )
    parser.add_argument("csv_file")
    parser.add_argument("column_name")
    parser.add_argument("output_dir")
    parser.add_argument("--txf", required=False, default="identity")
    args = parser.parse_args()

    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    txf = get_transform(args.txf)
    df = pd.read_csv(args.csv_file)

    # Calculate all bucket values from the target column.
    buckets = df[args.column_name].unique()

    # Write one CSV file per bucket.
    for bucket in buckets:
        # Do not overwrite existing files automatically.
        # Delete old outputs first when you intentionally want to regenerate.
        filename = output_dir / f"{txf(bucket)}.csv"
        if not filename.exists():
            df[df[args.column_name] == bucket].to_csv(filename, index=False)


if __name__ == "__main__":
    main()
