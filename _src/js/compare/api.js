const API_BASE = '/data/compare'

const typePaths = {
  spending: "/fiscal-years-expenses",
  revenue: "/fiscal-years-revenue",
}

const dimensionPaths = {
  department: "/depts",
  category: "/account-cats",
}

const dimensionKeys = {
  department: "department",
  category: "account_category",
}

export async function fetchBreakdownData(years, yearTypes, type, dimension) {
  // start two concurrent requests, one per year
  // wait for them both to return before ending the fetch
  const urls = years.map(year => `${API_BASE}${typePaths[type]}${dimensionPaths[dimension]}/${year}.json`)
  try {
    const response = await Promise.all(urls.map(url => {
      let response = fetch(url)
      return response
    }))
    const [...budgets] = await Promise.all(response.map(data => {
      let budgets = data.json()
      return budgets
    }))
    const result = budgets.map((budget, index) => {
      // put the data in the thing
      // TODO: filter by budget type, API returns records from all
      return budget.reduce((accumulator, row) => {
        // filter rows that don't match the desired budget type
        // double-equals because it might be an integer in string form
        if (parseInt(row.budget_type) === parseInt(yearTypes[index])) {
          // convert to object and cast totals to numbers
          accumulator[row[dimensionKeys[dimension]]] = +row.total
        }
        return accumulator
      }, {})
    })
    return result
  } catch (err) {
    console.log(err)
  }
}

export async function fetchTotals() {
  try {
    const response = await fetch(`${API_BASE}${typePaths.spending}/totals.json`)
    const data = await response.json()
    if (data) {
      data.sort((a, b) => {
        // sort in reverse chronological order,
        // then adjusted,adopted,proposed within each year
        const [indexA, indexB] = [a, b].map((record) => {
          const year = record.fiscal_year_range.slice(2, 4)
          // type numbers don't really correspond to the order we want
          // this rearranges them
          const type = 6 / record.budget_type
          // construct numbers that will sort in descending order
          // 2 digit year before the decimal, transformed type number after
          return +`${year}.${type}`
        })
        return indexA < indexB ? 1 : -1
      })
    }
    return data
  } catch (err) {
    console.log(err)
  }
}