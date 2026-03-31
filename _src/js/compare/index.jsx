import React from "react";
import { createRoot } from "react-dom/client";
import Select from "react-select";
import { schemeSet2 as colors } from "d3-scale-chromatic";

import Total from "./Total.jsx";
import { BUDGET_TYPES } from "./utils.jsx";
import { fetchTotals } from "./api.js";
import Breakdown from "./Breakdown.jsx";

const styles = [{ color: colors[0] }, { color: colors[1] }];
const diffColors = {
  neg: "#e41a1c",
  pos: "#4daf4a",
};

function getBudgetOption(record, index) {
  return {
    value: index,
    label: `${record.fiscal_year_range} ${BUDGET_TYPES[record.budget_type]}`,
  };
}

function getBudgetDefaults(budgets) {
  if (!budgets.length) {
    return [null, null];
  }
  if (budgets.length === 1) {
    return [budgets[0], budgets[0]];
  }
  // fetchTotals already sorts newest-first, so default to the latest
  // two fiscal years available in the dataset.
  return [budgets[0], budgets[1]];
}

class Compare extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeBreakdown: "spendDept",
      changeType: "pct",
      usePct: true,
      budgetChoices: [],
      totals: [],
    };
    this.updateChangeType = this.updateChangeType.bind(this);
    this.selectBudget = this.selectBudget.bind(this);
    this.selectBudget1 = this.selectBudget1.bind(this);
    this.selectBudget2 = this.selectBudget2.bind(this);
  }

  componentDidMount() {
    fetchTotals().then(totals => {
      const budgetChoices = totals.map(getBudgetOption);
      const defaultChoices = getBudgetDefaults(budgetChoices);
      if (!defaultChoices[0] || !defaultChoices[1]) {
        return;
      }
      const budget1Choice = defaultChoices[0].value;
      const budget2Choice = defaultChoices[1].value;
      const budget1Options = budgetChoices.filter(
        option => option.value !== budget2Choice
      );
      const budget2Options = budgetChoices.filter(
        option => option.value !== budget1Choice
      );
      this.setState({
        budgetChoices,
        totals,
        budget1Choice,
        budget1: totals[budget1Choice],
        budget2Choice,
        budget2: totals[budget2Choice],
        budget1Options,
        budget2Options,
      });
    });
  }

  updateChangeType(event) {
    const target = event.target;
    this.setState({
      changeType: target.value,
    });
  }

  selectBudget1(option) {
    this.selectBudget("budget1", "budget2", option.value);
  }

  selectBudget2(option) {
    this.selectBudget("budget2", "budget1", option.value);
  }

  selectBudget(key, otherKey, index) {
    // No change if same selection
    if (this.state[`${key}Choice`] === index) {
      return;
    }

    let otherBudgetOptions = this.state.budgetChoices.slice();
    otherBudgetOptions.splice(index, 1);
    this.setState({
      [`${key}Choice`]: index,
      [key]: this.state.totals[index],
      [`${otherKey}Options`]: otherBudgetOptions,
    });
  }

  render() {
    const usePct = this.state.changeType === "pct";
    const budget1Selected = this.state.budgetChoices.find(
      option => option.value === this.state.budget1Choice
    ) || null;
    const budget2Selected = this.state.budgetChoices.find(
      option => option.value === this.state.budget2Choice
    ) || null;
    const selectedYears = [this.state.budget1, this.state.budget2];
    const totals = selectedYears.map(record => {
      if (record) {
        return {
          key: record.fiscal_year_range,
          total: record.total,
        };
      }
    });
    const breakdowns = [
      {
        key: "spendDept",
        label: "Spending by Department",
        type: "spending",
        dimension: "department",
      },
      {
        key: "spendCat",
        label: "Spending by Category",
        type: "spending",
        dimension: "category",
      },
      {
        key: "revDept",
        label: "Revenue by Department",
        type: "revenue",
        dimension: "department",
      },
      {
        key: "revCat",
        label: "Revenue by Category",
        type: "revenue",
        dimension: "category",
      },
    ];
    const activeBreakdown = breakdowns.find(
      item => item.key === this.state.activeBreakdown
    ) || breakdowns[0];

    return (
      <div>
        <div className="row">
          <div className="col-sm-10">
            <h1>
              Compare{" "}
              <span style={styles[0]} className="choose-budget">
                <Select
                  options={this.state.budget1Options}
                  value={budget1Selected}
                  onChange={this.selectBudget1}
                  isSearchable={false}
                  isClearable={false}
                />
              </span>{" "}
              with{" "}
              <span style={styles[1]} className="choose-budget">
                <Select
                  options={this.state.budget2Options}
                  value={budget2Selected}
                  onChange={this.selectBudget2}
                  isSearchable={false}
                  isClearable={false}
                />
              </span>
            </h1>
          </div>
          <div className="col-sm-2">
            <div className="form-group">
              <label>Show changes as:</label>
              <select
                className="form-control"
                id="sortControl"
                value={this.state.changeType}
                onChange={this.updateChangeType}>
                <option value="pct">percentage</option>
                <option value="usd">dollars</option>
              </select>
            </div>
          </div>
          <div className="col-sm-12">
            <Total
              data={totals}
              colors={colors}
              diffColors={diffColors}
              usePct={usePct}></Total>
            <h2>Budget breakdowns</h2>
            <p>
              Get more detail on where money came from and how it was spent.
            </p>
          </div>
        </div>
        <div className="row">
          <div className="col-sm-3">
            <ul className="nav nav-pills nav-stacked">
              {breakdowns.map(item => (
                <li
                  key={item.key}
                  className={item.key === activeBreakdown.key ? "active" : ""}>
                  <a
                    href={`#${item.key}`}
                    onClick={event => {
                      event.preventDefault();
                      this.setState({ activeBreakdown: item.key });
                    }}>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="col-sm-9">
            <Breakdown
              colors={colors}
              diffColors={diffColors}
              usePct={usePct}
              years={selectedYears}
              type={activeBreakdown.type}
              dimension={activeBreakdown.dimension}></Breakdown>
          </div>
        </div>
      </div>
    );
  }
}

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(<Compare />);
}
