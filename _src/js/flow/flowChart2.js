import * as d3 from "d3"
import {sankey, sankeyLinkHorizontal} from "d3-sankey"
import {nest} from 'd3-collection'
import {scaleOrdinal} from 'd3-scale'
import {rgb} from 'd3-color'

const margin = {top: 20, right: 1, bottom: 6, left: 1}
const width = 1140 - margin.left - margin.right
const height = 630 - margin.top - margin.bottom
const formatNumber = d3.format(",.0f")
const format = data => "$" + formatNumber(data)
const color = scaleOrdinal(d3.schemeCategory10)
let svg = d3
  .select("#chart")
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
// define color scales
const fundColors = scaleOrdinal()
  .domain(["General Fund", "Non-discretionary funds"])
  .range(["#4285ff", "#8249b7"]) //2020 renovation
// .range(["#276419", "#4db029"])
// .range(["#276419", "#b8e186"])
const erColors = scaleOrdinal()
  .domain(["expense", "revenue"])
  .range(["#ff8129", "#7fc97f"])
// .range(["#ffb36b", "#7fc97f"])
// .range(["#ffd92f", "#ffd92f"])
// .range(["#c51b7d", "#8e0152"])
// create color gradients for links
svg
  .append("linearGradient")
  .attr("id", "gradientRtoGF")
  .attr("x1", 0)
  .attr("y1", 0)
  .attr("x2", "100%")
  .attr("y2", 0)
  .selectAll("stop")
  .data([
    {offset: "10%", color: erColors("revenue")},
    {offset: "90%", color: fundColors("General Funds")},
  ])
  .enter()
  .append("stop")
  .attr("offset", data => data.offset)
  .attr("stop-color", data => data.color)
svg
  .append("linearGradient")
  .attr("id", "gradientRtoNF")
  .attr("x1", 0)
  .attr("y1", 0)
  .attr("x2", "100%")
  .attr("y2", 0)
  .selectAll("stop")
  .data([
    {offset: "10%", color: erColors("revenue")},
    {offset: "90%", color: fundColors("Non-discretionary funds")},
  ])
  .enter()
  .append("stop")
  .attr("offset", data => data.offset)
  .attr("stop-color", data => data.color)
svg
  .append("linearGradient")
  .attr("id", "gradientNFtoE")
  .attr("x1", 0)
  .attr("y1", 0)
  .attr("x2", "100%")
  .attr("y2", 0)
  .selectAll("stop")
  .data([
    {offset: "10%", color: fundColors("Non-discretionary funds")},
    {offset: "90%", color: erColors("expense")},
  ])
  .enter()
  .append("stop")
  .attr("offset", data => data.offset)
  .attr("stop-color", data => data.color)
svg
  .append("linearGradient")
  .attr("id", "gradientGFtoE")
  .attr("x1", 0)
  .attr("y1", 0)
  .attr("x2", "100%")
  .attr("y2", 0)
  .selectAll("stop")
  .data([
    {offset: "10%", color: fundColors("General Funds")},
    {offset: "90%", color: erColors("expense")},
  ])
  .enter()
  .append("stop")
  .attr("offset", it => it.offset)
  .attr("stop-color", it => it.color)


// render the sankey
export function do_with_budget(data) {
  // svg.select("#chart").remove()
  const chart = svg
    .append("g")
    .attr("id", "chart")
    .attr("transform", `translate(${margin.left},${margin.top})`)
  let graph = sankey().nodeWidth(20).nodePadding(10).size([width, height])
  console.log(data)
  // graph.nodes(data.nodes).links(data.links)
  graph.update(data)
  let link = chart
    .append("g")
    .selectAll(".link")
    .data(data.links)
    .enter()
    .append("path")
    .attr("class", "link")
    .attr("d", sankeyLinkHorizontal())
    .style("stroke-width", data => {
      Math.max(1, data.dy)
    })
    .style("stroke", data => {
      // NOTE(donny): if you are having problems getting the links to render, make
      // sure both of these cases are matching data.target.name at some point
      switch (data.target.name) {
        case "General Funds":
          return "url('#gradientRtoGF')"
        case "Non-discretionary funds":
          return "url('#gradientRtoNF')"
      }
      switch (data.source.name) {
        case "General Funds":
          return "url('#gradientGFtoE')"
        case "Non-discretionary funds":
          return "url('#gradientNFtoE')"
      }
    })
    .sort((a, b) => b.dy - a.dy)
    .on("mouseover", data => {
      let definition = ""
      const sourceWords = data.source.name.split(" ")
      console.log(`hovering over ${sourceWords[sourceWords.length - 1]}`)
      // TODO(donny) - function is referencing results from an api which has not been set up for sacramento yet.
      //
      // if (
      //   sourceWords[sourceWords.length - 1] === "Funds" &&
      //   window.localStorage.getItem(data.target.name)
      // ) {
      //   definition = window.localStorage.getItem(data.target.name)
      // } else if (window.localStorage.getItem(data.source.name)) {
      //   definition = window.localStorage.getItem(data.source.name)
      // } else {
      //   definition = "definition unavailable"
      // }
      d3.select(this).classed("highlight", true)
      d3.select("#hover_description")
        .classed("show", true)
        .text(
          data.source.name + " → " + data.target.name + ": " + format(data.value)
          // see previos todo
          //
          // +
          //   ` (${definition})`
        )
    })
    .on("mousemove", event => {
      d3.select("#hover_description").style({
        top: event.y - 10 + document.window.scrollTop() + "px",
        left: event.x + 10 + "px",
      })
    })
    .on("mouseout", () => {
      d3.select(this).classed("highlight", () => d3.select(this).classed("click"))
      d3.select("#hover_description").classed("show", false)
    })
  let node = chart
    .append("g")
    .selectAll(".node")
    .data(data.nodes)
    .enter()
    .append("g")
    .attr("class", data => "node " + data.type)
    .attr("transform", data => {
      // console.log(data)
      return `translate(${data.x},${data.y})`
    })
  node
    .append("rect")
    .attr("height", data => data.dy)
    .attr("width", graph.nodeWidth())
    .style("fill", data => {
      switch (data.type) {
        case "fund":
          data.color = fundColors(data.name)
          // data.color = "transparent"
          break
        default:
          data.color = erColors(data.type)
          break
      }
      return data.color
    })
    .style("stroke", data => {
      if (data.type === "fund") {
        return rgb(data.color)
      } else {
        return rgb(data.color).darker(1)
      }
    })
    .on("mouseover", data => {
      const thisNode = d3.select(this.parentNode)
      //   highlight node only, not flows
      thisNode.classed("hover", true)
      //   append total amount to label
      thisNode
        .select("text")
        .transition()
        .text(data => {
          let text = data.name
          text += ": " + format(data.value)
          return text
        })
    })
    .on("mouseout", data => {
      const thisNode = d3.select(this.parentNode)
      //   remove node highlight
      thisNode.classed("hover", false)
      //   remove amount from label
      if (!thisNode.classed("highlight")) {
        thisNode
          .select("text")
          .transition()
          .text(data => data.name)
      }
    })
    .on("click", data => {
      const thisNode = d3.select(this.parentNode)
      if (thisNode.classed("highlight")) {
        thisNode.classed("highlight", false)
        thisNode.classed("hover", false)
      } else {
        //   node.classed("highlight", false)
        thisNode.classed("highlight", true)
      }
      link.classed("highlight click", link_data => {
        if ([link_data.target.name, link_data.source.name].indexOf(data.name) >= 0) {
          return thisNode.classed("highlight")
        } else {
          return d3.select(this).classed("click")
        }
      })
      thisNode
        .select("text")
        .transition()
        .text(data => {
          let text = data.name
          if (thisNode.classed("highlight")) {
            text += ": " + format(data.value)
          }
          return text
        })
    })
  node
    .append("text")
    .attr("x", -6)
    .attr("y", data => data.dy / 2)
    .attr("dy", ".35em")
    .attr("class", "main-text")
    .attr("text-anchor", "end")
    .attr("transform", null)
    .text(data => data.name)
    .filter(data => data.x < width / 2)
    .attr("x", 6 + graph.nodeWidth())
    .attr("text-anchor", "start")
}
