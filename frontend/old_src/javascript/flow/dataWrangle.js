import {nest} from "d3-collection";
import * as d3 from "d3";

// wrangle the data
export function dataWrangle(dataset, fileName) {
  const fiscalYear = fileName.slice(0, 4)
  switch (fiscalYear) {
    case "FY15":
    case "FY16":
    case "FY17":
    case "FY18":
      return (data_wrangle_v1(dataset, fiscalYear))
    case "FY13":
    case "FY14":
    case "FY19":
    case "FY20":
    case "FY21":
    case "FY22":
      return (data_wrangle_v2(dataset, fiscalYear))
  }
}

function data_wrangle_v1(dataset, fy) {
  let newdata = dataset.filter(it => it.budget_year === fy)
  const rev_order = [
    // NOTE(Donny) list is specific to Sacramento Data
    "Taxes",
    "Charges, Fees, and Services",
    "Miscellaneous Revenue",
    "Intergovernmental",
    "Contributions from Other Funds",
    "Licenses and Permits",
    "Fines, Forfeitures, and  Penalties",
    "Interest, Rents, and Concessions",
  ]
  rev = newdata.filter(value => value.account_type === "Revenues")
  revcats = nest()
    .key(it => it.account_category)
    .sortKeys((a, b) => rev_order.indexOf(a) - rev_order.indexOf(b))
    .key(data => data.fund_code === "General Funds" ? "General Fund" : "Non-discretionary funds")
    .rollup(values => {
      values.total = d3.sum(values, data => +data.amount)
      return values
    })
    .entries(rev)
  let nodes = [
    {name: "General Funds", type: "fund", order: 0},
    {name: "Non-discretionary funds", type: "fund", order: 1},
  ]
  let nodeoffset = nodes.length
  let links = []
  for (let i = 0; i < revcats.length; i++) {
    nodes.push({name: revcats[i].key, type: "revenue"})
    for (let x = 0; x < revcats[i].values.length; x++) {
      const link = {
        source: i + nodeoffset,
        value: revcats[i].values[x].values.total,
      }
      if (revcats[i].values[x].key === "General Fund") {
        link.target = 0
      } else if (revcats[i].values[x].key === "Non-discretionary funds") {
        link.target = 1
      }
      links.push(link)
    }
  }
  exp = newdata.filter(value => value.account_type === "Expenses")
  // NOTE(Donny) list is specific to Sacramento Data
  const exp_order = [
    "Police",
    "Utilities",
    "Citywide and Community Support",
    "General Services",
    "Fire",
    "Debt Service",
    "Public Works",
    "Human Resources",
    "Parks and Recreation",
    "Community Development",
    "Convention and Cultural Services",
    "Finance",
    "Information Technology",
    "City Attorney",
    "Mayor/Council",
    "City Manager",
    "City Treasurer",
    "Economic Development",
    "City Clerk",
    "Non-Appropriated",
  ]
  expdivs = nest()
    .key(it => it.department)
    .sortKeys((a, b) => exp_order.indexOf(a) - exp_order.indexOf(b))
    .key(data => data.fund_code === "General Funds" ? "General Fund" : "Non-discretionary funds")
    .rollup(values => {
      values.total = d3.sum(values, it => it.amount)
      return values
    })
    .entries(exp)
  for (let i = 0; i < expdivs.length; i++) {
    nodes.push({name: expdivs[i].key, type: "expense"})
    for (let x = 0; x < expdivs[i].values.length; x++) {
      const link = {
        target: i + nodeoffset + revcats.length,
        value: expdivs[i].values[x].values.total,
      }
      if (expdivs[i].values[x].key === "General Fund") {
        link.source = 0
      } else if (expdivs[i].values[x].key === "Non-discretionary funds") {
        link.source = 1
      }
      links.push(link)
    }
  }
  return {nodes: nodes, links: links}
}

function data_wrangle_v2(dataset, fiscalYear) {
  const rev_order = [
    // This list is specific to Sacramento Data
    "Taxes",
    "Charges, Fees, and Services",
    "Miscellaneous Revenue",
    "Intergovernmental",
    "Contributions from Other Funds",
    "Licenses and Permits",
    "Fines, Forfeitures, and  Penalties",
    "Interest, Rents, and Concessions",
  ]
  let revenue = dataset.filter(value => value.ExpenseRevenue === "R")
  let revenueCategories = nest()
    .key(data => data.CATEGORY)
    .sortKeys((a, b) => rev_order.indexOf(a) - rev_order.indexOf(b))
    .key(data => {
      if (data.Fund === "General Fund") {
        return "General Fund"
      } else {
        return "Non-discretionary funds"
      }
    })
    .rollup(v => {
      var values = v;
      values.total = d3.sum(values, data => +data.Amount)
      return values
    })
    .entries(revenue)
  let nodes = [
    {name: "General Funds", type: "fund", order: 0},
    {name: "Non-discretionary funds", type: "fund", order: 1},
  ]
  let nodeOffset = nodes.length
  let links = []
  for (let i = 0; i < revenueCategories.length; i++) {
    nodes.push({name: revenueCategories[i].key, type: "revenue"})
    for (let x = 0; x < revenueCategories[i].values.length; x++) {
      let link = {
        source: i + nodeOffset,
        value: revenueCategories[i].values[x].value.total,
      }
      if (revenueCategories[i].values[x].key === "General Fund") {
        link.target = 0
      } else if (revenueCategories[i].values[x].key === "Non-discretionary funds") {
        link.target = 1
      }
      links.push(link)
    }
  }
  let exp = dataset.filter(value => value.ExpenseRevenue === "E")
  // NOTE(Donny) list is specific to Sacramento Data
  const exp_order = [
    "Police",
    "Utilities",
    "Citywide and Community Support",
    "General Services",
    "Fire",
    "Debt Service",
    "Public Works",
    "Human Resources",
    "Parks and Recreation",
    "Community Development",
    "Convention and Cultural Services",
    "Finance",
    "Information Technology",
    "City Attorney",
    "Mayor/Council",
    "City Manager",
    "City Treasurer",
    "Economic Development",
    "City Clerk",
    "Non-Appropriated",
  ]
  let expdivs = nest()
    .key(data => data.Department)
    .sortKeys((a, b) => exp_order.indexOf(a) - exp_order.indexOf(b))
    .key(data => data.Fund === "General Fund" ? "General Fund" : "Non-discretionary funds")
    .rollup(values => {
      values.total = d3.sum(values, data => data.Amount)
      return values
    })
    .entries(exp)
  for (let i = 0; i < expdivs.length; i++) {
    nodes.push({name: expdivs[i].key, type: "expense"})
    for (let x = 0; x < expdivs[i].values.length; x++) {
      const link = {
        target: i + nodeOffset + revenueCategories.length,
        value: expdivs[i].values[x].value.total,
      }
      if (expdivs[i].values[x].key === "General Fund") {
        link.source = 0
      } else if (expdivs[i].values[x].key === "Non-discretionary funds") {
        link.source = 1
      }
      links.push(link)
    }
  }
  return {nodes, links}
}
