import React, {useState} from 'react';
import {Bar} from 'react-chartjs-2';
import {keys, set} from 'd3-collection';
import {ascending, descending} from 'd3-array';
import {DiffStyled, horizontalChartOptions} from './utils.jsx';
import Select from "react-select";

const DiffTable = ({data, usePercent, years, colors, diffColors}) => {
  const [sortBy, setSortBy] = useState("diff")
  const sortFunc = sortBy === "diff" ? descending : ascending;
  const options = [{"value": "diff", "label": 'Amount'}, {"value": "key", "label": 'Name'}]
  const allKeys = set()
  keys(data[0]).forEach(key => allKeys.add(key))
  keys(data[1]).forEach(key => allKeys.add(key))
  const diffList = allKeys
    .values()
    .map(key => {
      // check for key in both years; if one is missing,
      // set some special value that indicates that
      const response = {
        key,
        value: data[0][key],
        prev: data[1][key]
      }
      // If key exists in previous, we can calculate a diff.
      // For missing values (removed entities) cast to zero for -100% diff
      if (response.prev) {
        response.diff = (response.value || 0) - response.prev
        if (usePercent) response.diff = response.diff / Math.abs(response.prev)
      } else {
        // Sentinel value: indicates there was no previous budget, so this is a newly created entity.
        // The UI can handle these differently if desired, and they will sort to the top of the list.
        response.diff = Infinity
      }
      return response
    })
    .sort((a, b) => sortFunc(a[sortBy], b[sortBy]))
    .map(entry => {
      const data = {
        labels: [""],
        datasets: [
          {
            data: [entry.value],
            label: years[0].value,
            backgroundColor: colors[0],
          },
          {
            data: [entry.prev],
            label: years[1].value,
            backgroundColor: colors[1],
          },
        ],
      }
      return (
        // TODO: Fix table styling resize bug. Rewrite and clean up styles.
        <div className="flex mt-6" key={entry.key}>
          <div style={{position: "relative", margin: "auto", width: "70vw"}} className="flex-1">
            {entry.key}
            <Bar className="grow w-max" data={data} options={horizontalChartOptions} height={40}></Bar>
          </div>
          <div className="">
            <DiffStyled
              diff={entry.diff}
              colors={diffColors}
              usePercent={usePercent}
            ></DiffStyled>
          </div>
        </div>
      )
    })

  return (
    <div className="mt-6">
      <div className="flex justify-end">
        <div className="flex items-center w-fit">
          <label className="h-fit mr-3">Sort by:</label>
          <Select
            options={options}
            value={options.filter(option => option.value === sortBy)[0]}
            onChange={selection => setSortBy(selection.value)}
            searchable={false}
            clearable={false}
          />
        </div>
      </div>
      <div className="">{diffList}</div>
    </div>
  )
}

export default DiffTable;