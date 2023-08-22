import {ascending, descending} from 'd3-array'
import {select} from 'd3-selection'
import sankeyChart2 from './sankeyChart2.js'
import {dataWrangle, do_with_budget} from './flowChart.js'
import {csvParse} from 'd3-dsv'

sankeyChart2()
// Process filenames to generate display names.
const filenameArray = Array.from(document.querySelectorAll("input.filename-data"))
let datafiles = filenameArray.map(inputElement => {
  const datafile = {filename: inputElement.value}
  const nameParts = datafile.filename.slice(0, -4).split("__")
  datafile.displayName = nameParts.join(" ")
  datafile.fy = nameParts[0]
  datafile.type = nameParts[1]
  return datafile
}).sort((a, b) => {
  // Years in descending order, types in order of (adjusted, adopted, proposed), which happens to be ascending.
  // TODO: Refactor into one line sort function
  const sortYear = descending(a.fy, b.fy)
  const sortType = ascending(a.type, b.type)
  return sortYear !== 0 ? sortYear : sortType
})
select("#fy.form-control").selectAll('option')
  .data(datafiles)
  .enter()
  .append('option')
  .attr('value', it => it.filename)
  .property('selected', (d, i) => i === 0)
  .text(it => it.displayName)
select("#fy.form-control")
  .on('change', drawFlow)
// Run once to initially populate the chart
drawFlow()

function drawFlow(event) {
  // Get currently selected value
  const fileName = event ? event.target.value : select('#fy.form-control').property("value")
  // TODO: Check and save to local storage
  fetch(`/data/flow/${fileName}`)
    .then(response => response.text())
    .then(text => useCsv(text, fileName))
    .catch(error => console.log(error))
}

function useCsv(text, fileName) {
  let csv = csvParse(text, data => data)
  const final_data = dataWrangle(csv, fileName)
  do_with_budget(final_data)
}