import json
import os
import sys

import numpy as np
import pandas as pd


def load_config(cfg_file):
    """
    Directly loads a config .json file. This .json file specifies the way that
    each treemap .json file is built, including how to pivot the data.

    cfg_file --> the path to the config .json file to load
    """
    if os.path.exists(cfg_file):  # check for the file
        try:
            return json.load(open(cfg_file))  # load and parse json text to object
        except Exception as ex:
            print("Couldn't parse .json file: {}\n\t{}".format(cfg_file, ex))
            return json.loads("{}")  # empty object
    else:
        print("File", cfg_file, "is missing.")
        return json.loads("{}")  # empty object


def load_csv_data(csv_file):
    """
    Directly loads a budget .csv file. This .csv file contains all relevant
    budget data in a tabular format. The config.json file refers to column names
    that are in the .csv file in its instructions. This function loads .csv data
    into a pandas DataFrame.

    csv_file --> the path to the budget .csv file to load
    """
    if os.path.exists(csv_file):  # check for the file
        try:
            return pd.read_csv(csv_file)  # load it into a pandas dataframe
        except Exception as ex:
            print("Couldn't parse .csv file: {}\n\t{}".format(csv_file, ex))
            return pd.DataFrame()  # blank dataframe
    else:
        print("File", csv_file, "is missing")
        return pd.DataFrame()  # blank dataframe


def create_department_table(df, config):
    return pd.pivot_table(df, values=config["amount_header"],
                          index=[config["categories"]["fiscal_year_range"], config["categories"]["department"],
                                 config["categories"]["fund"]],
                          columns=[config["account_type_header"]], aggfunc=np.sum, fill_value=0)


def create_account_type_table(df, config):
    return pd.pivot_table(df, values=config["amount_header"],
                          index=[config["categories"]["fiscal_year_range"], config["categories"]["department"],
                                 config["categories"]["fund"]],
                          columns=[config["account_type_header"]], aggfunc=np.sum, fill_value=0)


def generate_file_path(filename):
    return filename


def filter_data_frame(df):
    return df


def generate_files(df, config):
    account_type_table = create_account_type_table(df, config)
    departments_table = create_account_type_table(df, config)
    for group in config["groups"]:
        if group["values"][0] == config["account_types"]["revenue"]:
            json.dump(account_type_table, open(generate_file_path(group['filename']), 'w'))
        elif group["values"][0] == config["account_types"]["expense"]:
            json.dump(filter_data_frame(create_department_table(df, config)),
                      open(generate_file_path(group['filename']), 'w'))


def main():
    '''
    Load the configuration, load the raw data from .csv, then transform it all
    '''
    print(*sys.argv)
    if len(sys.argv) != 3:
        print("This script requires two extra arguments: <config>.json <budget data>.csv")
    cfg = load_config(sys.argv[1])  # load the config file
    df = load_csv_data(sys.argv[2])  # load the csv data
    generate_files(df, cfg)


if __name__ == '__main__':
    main()
