import json
import os
import sys
from pathlib import Path

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


def write_json_file(path, contents, overwrite=True):
    directory = Path(os.path.dirname(path))
    directory.mkdir(parents=True, exist_ok=overwrite)
    with open(path, 'w', encoding="utf-8") as file:
        json.dump(contents, file)


def create_budget_expenses_totals_file(departments_table, expense_key, fiscal_years):
    # departments_table.index.get_level_values(0).unique()
    totals_list = list()
    for year in fiscal_years:
        total_dict = dict()
        total_dict["budget_type"] = str(1)
        fiscal_year_range_string = f"FY{year[-2:]}"
        total_dict["fiscal_year_range"] = fiscal_year_range_string
        total_dict["total"] = str(int(departments_table.loc[fiscal_year_range_string].sum()[expense_key]))
        total_dict["general_fund"] = str(
            int(departments_table.loc[fiscal_year_range_string].sum()[f"General Fund {expense_key}"]))
        totals_list.append(total_dict)
    write_json_file(Path("compare", "fiscal-years-expenses", "totals.json"), totals_list)


# {
#     "budget_type": "1",
#     "fiscal_year_range": "FY15",
#     "total": "828593876",
#     "general_fund": "378038530"
# },


def create_files_by_year(department_table, account_categories_table, revenue_key, expense_key, config):
    for group in config["groups"]:
        fiscal_year_key = f"FY{group['values'][1][-2:]}"
        budget_type = group["values"][0]
        if budget_type == revenue_key:
            account_category_list = list()
            departments_list = list()
            account_category_by_year = account_categories_table.loc[fiscal_year_key]
            account_category_budget_table = account_category_by_year[
                account_category_by_year[budget_type] != 0].reset_index()
            account_category_budget_table = account_category_budget_table.filter(
                ["account_category", budget_type, f"General Fund {budget_type}"])
            department_by_year = department_table.loc[fiscal_year_key]
            department_budget_table = department_by_year[department_by_year[budget_type] != 0].reset_index()
            department_budget_table = department_budget_table.filter(
                ["department", budget_type, f"General Fund {budget_type}"])
            for index, row in account_category_budget_table.iterrows():
                account_categories_dict = dict()
                account_categories_dict["budget_type"] = "1"
                account_categories_dict["fiscal_year_range"] = fiscal_year_key
                account_categories_dict["account_category"] = row.account_category
                account_categories_dict["total"] = str(row[budget_type])
                account_categories_dict["general_fund"] = str(int(row[f"General Fund {budget_type}"]))
                account_category_list.append(account_categories_dict)
            for index, row in department_budget_table.iterrows():
                departments_dict = dict()
                departments_dict["budget_type"] = "1"
                departments_dict["fiscal_year_range"] = fiscal_year_key
                departments_dict["department"] = row.department
                departments_dict["total"] = str(row[budget_type])
                departments_dict["general_fund"] = str(int(row[f"General Fund {budget_type}"]))
                departments_list.append(departments_dict)
            write_json_file(Path("fiscal-years-revenue", "account-cats", f"{fiscal_year_key}.json"),
                            account_category_list)
            write_json_file(Path("fiscal-years-revenue", "depts", f"{fiscal_year_key}.json"), departments_list)
        elif budget_type == expense_key:
            account_category_list = list()
            departments_list = list()
            account_category_by_year = account_categories_table.loc[fiscal_year_key]
            account_category_budget_table = account_category_by_year[
                account_category_by_year[budget_type] != 0].reset_index()
            account_category_budget_table = account_category_budget_table.filter(
                ["account_category", budget_type, f"General Fund {budget_type}"])
            department_by_year = department_table.loc[fiscal_year_key]
            department_budget_table = department_by_year[department_by_year[budget_type] != 0].reset_index()
            department_budget_table = department_budget_table.filter(
                ["department", budget_type, f"General Fund {budget_type}"])
            for index, row in account_category_budget_table.iterrows():
                account_categories_dict = dict()
                account_categories_dict["budget_type"] = "1"
                account_categories_dict["fiscal_year_range"] = fiscal_year_key
                account_categories_dict["account_category"] = row.account_category
                account_categories_dict["total"] = str(row[budget_type])
                account_categories_dict["general_fund"] = str(int(row[f"General Fund {budget_type}"]))
                account_category_list.append(account_categories_dict)
            for index, row in department_budget_table.iterrows():
                departments_dict = dict()
                departments_dict["budget_type"] = "1"
                departments_dict["fiscal_year_range"] = fiscal_year_key
                departments_dict["department"] = row.department
                departments_dict["total"] = str(row[budget_type])
                departments_dict["general_fund"] = str(int(row[f"General Fund {budget_type}"]))
                departments_list.append(departments_dict)
            write_json_file(Path("compare", "fiscal-years-expenses", "account-cats", f"{fiscal_year_key}.json"),
                            account_category_list)
            write_json_file(Path("compare", "fiscal-years-expenses", "depts", f"{fiscal_year_key}.json"),
                            departments_list)


def generate_files(df, config):
    departments_general_funds_table = pd.pivot_table(df[df[config["categories"]["fund"]] == 'General Funds'],
                                                     values=config["amount_header"],
                                                     index=[config["categories"]["fiscal_year_range"],
                                                            config["categories"]["department"]],
                                                     columns=[config["account_type_header"]], aggfunc=np.sum,
                                                     fill_value=0)
    departments_totals_table = pd.pivot_table(df, values=config["amount_header"],
                                              index=[config["categories"]["fiscal_year_range"],
                                                     config["categories"]["department"]],
                                              columns=[config["account_type_header"]], aggfunc=np.sum, fill_value=0)
    account_categories_general_funds_table = pd.pivot_table(df[df[config["categories"]["fund"]] == 'General Funds'],
                                                            values=config["amount_header"],
                                                            index=[config["categories"]["fiscal_year_range"],
                                                                   config["categories"]["account_category"]],
                                                            columns=[config["account_type_header"]], aggfunc=np.sum,
                                                            fill_value=0)
    account_categories_totals_table = pd.pivot_table(df, values=config["amount_header"],
                                                     index=[config["categories"]["fiscal_year_range"],
                                                            config["categories"]["account_category"]],
                                                     columns=[config["account_type_header"]], aggfunc=np.sum,
                                                     fill_value=0)
    account_categories_totals_table[['General Fund Revenues', 'General Fund Expenses']] = \
        account_categories_general_funds_table[['Revenues', 'Expenses']]
    account_categories_totals_table.fillna(0, inplace=True)
    departments_totals_table[['General Fund Revenues', 'General Fund Expenses']] = \
        departments_general_funds_table[['Revenues', 'Expenses']]
    departments_totals_table.fillna(0, inplace=True)
    fiscal_years = np.sort(df[config["categories"]["fiscal_year_range"]].unique())
    revenue_key = config["account_types"]["revenue"]
    expense_key = config["account_types"]["expense"]
    create_files_by_year(departments_totals_table, account_categories_totals_table, revenue_key, expense_key, config)
    create_budget_expenses_totals_file(departments_totals_table, expense_key, fiscal_years)


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
