# (Donny)
#
# split a csv file into multiple files based on the value of a column. used for
# splitting up the csvs for the flow graphs. old openbudget used one file for
# every year, new one takes one file per chart
#
# usage: split_csv.py <csv_file> <column_name> <output_dir> [--txf <transform_name>]
# example:
# python3 split_csv.py test.csv Fiscal_Year _src/data/flow --txf fy_suffix
# This --txf transforms 2019 to FY19
# supported transforms are "identity" and "fy_suffix"
import os
import pandas as pd
import argparse


def get_transform(name):
    normalized = str(name).replace('\\', '').strip()
    transforms = {
        'identity': lambda value: value,
        'fy_suffix': lambda value: f"FY{str(value)[-2:]}",
        # Backward-compatible aliases for older docs and shell history.
        'lambda x: x': lambda value: value,
        "lambda x: 'FY' + str(x)[-2:]": lambda value: f"FY{str(value)[-2:]}",
    }
    if normalized not in transforms:
        raise ValueError(
            f'Unsupported transform "{name}". Use one of: identity, fy_suffix.'
        )
    return transforms[normalized]

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('csv_file')
    parser.add_argument('column_name')
    parser.add_argument('output_dir')
    parser.add_argument('--txf', required=False, default='identity')
    args = parser.parse_args()

    if not os.path.exists(args.output_dir):
        os.makedirs(args.output_dir)

    txf = get_transform(args.txf)
    df = pd.read_csv(args.csv_file)

    #calculate the list of unique column_name values
    buckets = df[args.column_name].unique()

    #loop through the unique column_name values
    for bkt in buckets:
        # write the file if it is not already there
        # NOTE: you must delete files in the target folder first if you want
        # to replace them... so that if there are multiple data sources for
        # the same year you won't accidentally overwrite the old ones
        filename = os.path.join(args.output_dir, '{}.csv'.format(txf(bkt)))
        if not os.path.exists(filename):
            df[df[args.column_name] == bkt].to_csv(filename, index=False)

if __name__ == '__main__':
    main()
