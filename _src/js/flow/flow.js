import {ascending, descending} from "d3-array";
import drawChart from "./sankeyChart";

// Get file names from a hidden input HTML element in the static pug file.
const dataFiles = Array.from(document.querySelectorAll("input.filename-data"))
  .map(parseFileNameAndDisplayName).sort(sortDescending)
const formControl = document.querySelector('#fy.form-control')

// Populate the form control with file names.
dataFiles.forEach((datafile, index) => {
  let option = document.createElement("option");
  option.value = datafile.fileName
  option.text = datafile.displayName
  if (index === 0) option.selected = true
  formControl.add(option)
})

// Update chart when the form control changes.
formControl.addEventListener('change', event => drawChart(event.target.value))

// Run once to initially populate the chart.
drawChart(formControl.value)

/**
 * Parse the data file used by the form control.
 * Conforms to the format of FY13-14__adopted.csv.
 * It also works for FY14.csv.
 * @param inputElement
 * @returns {{filename}}
 */
function parseFileNameAndDisplayName(inputElement) {
  let datafile = {fileName: inputElement.value}
  const nameParts = datafile.fileName.slice(0, -4).split("__")
  datafile.displayName = nameParts.join(" ")
  datafile.fy = nameParts[0]
  datafile.type = nameParts[1]
  return datafile
}

/**
 * Sort years in descending order of the budget types (adjusted, adopted, proposed), which happens to be ascending.
 * @param a The first element for comparison. Will never be undefined.
 * @param b The second element for comparison. Will never be undefined.
 * @returns {boolean} The reference to the original array, now sorted. Note that the array is sorted in place, and no copy is made.
 */
function sortDescending(a, b) {
  // TODO: Remove ascending/descending dependency on d3-array
  const sortYear = descending(a.fy, b.fy)
  const sortType = ascending(a.type, b.type)
  return sortYear !== 0 ? sortYear : sortType
}
