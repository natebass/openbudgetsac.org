import React from "react"
import {useQuery} from "react-query"
import DiffTable from './DiffTable.jsx';
import {fetchBreakdownData} from './api.js'
import Trend from './Trend.jsx';

const Breakdown = props => {
  const {colors, diffColors, usePercent, years, type, dimension} = props
  const yearNames = years.map(year => year.value)
  const yearTypes = years.map(year => year.budget_type)
  const {data, status} = useQuery(yearNames, () => fetchBreakdownData(yearNames, yearTypes, type, dimension))
  return (
    <div>
      {status === "error" && <p>Error fetching data</p>}
      {status === "loading" && <p>Loading...</p>}
      console.log("LOADING")
      {status === "success" && (
        <div>
          <Trend data={data} colors={colors} years={years}/>
          <DiffTable
            data={data}
            years={years}
            colors={colors}
            diffColors={diffColors}
            usePercent={usePercent}
          />
        </div>
      )}
    </div>
  )
}
export default Breakdown;