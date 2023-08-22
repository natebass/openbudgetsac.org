import {format} from "d3-format"
import {csvParse} from "d3-dsv";
import {dataWrangle} from "./flowChart2";
import {sankey} from "d3-sankey";
// import {nest} from 'd3-collection'
import {select} from "d3-selection";
// import {rgb} from 'd3-color'

// Specify the dimensions of the chart.
const margin = {top: 20, right: 1, bottom: 6, left: 1}
const width = 928;
const height = 600;
const formatFunction = format(",.0f")
const linkColor = 'source-target'

/**
 * Draw Sankey chart.
 * @param fileName
 */
const drawChart = fileName => {
  getData(fileName).then(data => {
    let svg = select("#chart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    svg
      .append("text")
      .text("Revenues")
      .attr("y", margin.top * 0.6)
      .attr("x", margin.left)
    svg
      .append("text")
      .text("Expenses")
      .attr("y", margin.top * 0.6)
      .attr("x", margin.left + width)
      .attr("text-anchor", "end")
    // Constructs and configures a Sankey generator.
    const chart = sankey()
      .nodeId(d => d.name)
      .nodeAlign(sankey.nodeAlign) // d3.sankeyLeft, etc.
      .nodeWidth(15)
      .nodePadding(10)
      // .extent([[1, 5], [width - 1, height - 5]])
    // Applies it to the data. We make a copy of the nodes and links objects
    // so as to avoid mutating the original.
    console.log(data.links.map(d => Object.assign({}, d)))
    const {nodes, links} = chart({
      nodes: data.nodes.map(d => Object.assign({}, d)),
      links: data.links.map(d => Object.assign({}, d))
    })
    //   // Defines a color scale.
    //   const color = scaleOrdinal(schemeCategory10);
    //
    //   // Creates the rects that represent the nodes.
    //   let rect = svg.append("g")
    //     .attr("stroke", "#000")
    //     .selectAll()
    //     .data(nodes)
    //     .join("rect")
    //     .attr("x", d => d.x0)
    //     .attr("y", d => d.y0)
    //     .attr("height", d => d.y1 - d.y0)
    //     .attr("width", d => d.x1 - d.x0)
    //     .attr("fill", d => color(d.category));
    //
    //   // Adds a title on the nodes.
    //   rect.append("title")
    //     .text(d => `${d.name}\n${formatFunction(d.value)} TWh`);
    //
    //   // Creates the paths that represent the links.
    //   let link = svg.append("g")
    //     .attr("fill", "none")
    //     .attr("stroke-opacity", 0.5)
    //     .selectAll()
    //     .data(links)
    //     .join("g")
    //     .style("mix-blend-mode", "multiply");
    //
    //   // Creates a gradient, if necessary, for the source-target color option.
    //   if (linkColor === "source-target") {
    //     // const gradient = link.append("linearGradient")
    //     //   .attr("id", d => (d.uid = DOM.uid("link")).id)
    //     //   .attr("gradientUnits", "userSpaceOnUse")
    //     //   .attr("x1", d => d.source.x1)
    //     //   .attr("x2", d => d.target.x0);
    //     // gradient.append("stop")
    //     //   .attr("offset", "0%")
    //     //   .attr("stop-color", d => color(d.source.category));
    //     // gradient.append("stop")
    //     //   .attr("offset", "100%")
    //     //   .attr("stop-color", d => color(d.target.category));
    //   }
    //   link.append("path")
    //     .attr("d", sankeyLinkHorizontal())
    //     .attr("stroke", linkColor === "source-target" ? (d) => d.uid
    //       : linkColor === "source" ? (d) => color(d.source.category)
    //         : linkColor === "target" ? (d) => color(d.target.category)
    //           : linkColor)
    //     .attr("stroke-width", d => Math.max(1, d.width));
    //
    //   link.append("title")
    //     .text(d => `${d.source.name} → ${d.target.name}\n${formatFunction(d.value)} TWh`);
    //
    //   // Adds labels on the nodes.
    //   svg.append("g")
    //     .selectAll()
    //     .data(nodes)
    //     .join("text")
    //     .attr("x", d => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6)
    //     .attr("y", d => (d.y1 + d.y0) / 2)
    //     .attr("dy", "0.35em")
    //     .attr("text-anchor", d => d.x0 < width / 2 ? "start" : "end")
    //     .text(d => d.name);
  })
}

/**
 * Get data from localhost or fetch from server.
 * @param fileName
 * @returns {{}}
 */
async function getData(fileName) {
  // TODO: Check and save to local storage
  let finalData = {}
  const localStorageKey = `budget-flow-data-${fileName}`
  if (localStorageKey in localStorage) {
    finalData = localStorage.getItem(`budget-flow-data-${fileName}`)
  } else {
    const response = await fetch(`/data/flow/${fileName}`)
    const text = await response.text()
    finalData = parseData(text, fileName)
  }
  return finalData;
}

/**
 * Parse CSV for data used by the chart.
 * @param text
 * @param fileName
 * @returns {{nodes: [{name: string, type: string, order: number},{name: string, type: string, order: number}], links: []}|{nodes: [{name: string, type: string, order: number},{name: string, type: string, order: number}], links: []}}
 */
function parseData(text, fileName) {
  let csv = csvParse(text, data => data)
  return dataWrangle(csv, fileName)
}

export default drawChart