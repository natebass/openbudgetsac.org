import * as d3 from "d3"
import {nest} from 'd3-collection'
import {interpolateNumber} from 'd3-interpolate'

export default function sankeyChart2() {
  let sankey = {}
  let nodeWidth = 24
  let nodePadding = 8
  let size = [1, 1]
  let nodes = []
  let links = []
  sankey.nodeWidth = it => {
    if (!arguments.length) return nodeWidth
    nodeWidth = +it
    return sankey
  }
  sankey.nodePadding = it => {
    if (!arguments.length) return nodePadding
    nodePadding = +it
    return sankey
  }
  sankey.nodes = function (it) {
    if (!arguments.length) return nodes
    nodes = it
    return sankey
  }
  sankey.links = function (it) {
    if (!arguments.length) return links
    links = it
    return sankey
  }
  sankey.size = function (it) {
    if (!arguments.length) return size
    size = it
    return sankey
  }
  sankey.layout = function (iterations) {
    computeNodeLinks()
    computeNodeValues()
    computeNodeBreadths()
    computeNodeDepths(iterations)
    computeLinkDepths()
    return sankey
  }
  sankey.relayout = function () {
    computeLinkDepths()
    return sankey
  }
  sankey.link = function () {
    let curvature = .5
    const link = data => {
      const x0 = data.source.x + data.source.dx,
        x1 = data.target.x,
        xi = interpolateNumber(x0, x1),
        x2 = xi(curvature),
        x3 = xi(1 - curvature),
        y0 = data.source.y + data.sy + data.dy / 2,
        y1 = data.target.y + data.ty + data.dy / 2
      return "M" + x0 + "," + y0
        + "C" + x2 + "," + y0
        + " " + x3 + "," + y1
        + " " + x1 + "," + y1
    }
    link.curvature = it => {
      if (!arguments.length) return curvature
      curvature = +it
      return link
    }
    return link
  }
  // Populate the sourceLinks and targetLinks for each node.
  // Also, if the source and target are not objects, assume they are indices.
  function computeNodeLinks() {
    nodes.forEach(function (node) {
      node.sourceLinks = []
      node.targetLinks = []
    })
    links.forEach(link => {
      let source = link.source
      let target = link.target
      if (typeof source === "number") source = link.source = nodes[link.source]
      if (typeof target === "number") target = link.target = nodes[link.target]
      source.sourceLinks.push(link)
      target.targetLinks.push(link)
    })
  }

  // Compute the value (size) of each node by summing the associated links.
  function computeNodeValues() {
    nodes.forEach(function (node) {
      node.value = Math.max(
        d3.sum(node.sourceLinks, value),
        d3.sum(node.targetLinks, value)
      )
    })
  }

  // Iteratively assign the breadth (x-position) for each node.
  // Nodes are assigned the maximum breadth of incoming neighbors plus one
  // nodes with no incoming links are assigned breadth zero, while
  // nodes with no outgoing links are assigned the maximum breadth.
  function computeNodeBreadths() {
    let remainingNodes = nodes
    let x = 0
    while (remainingNodes.length) {
      let nextNodes = []
      remainingNodes.forEach(function (node) {
        node.x = x
        node.dx = nodeWidth
        node.sourceLinks.forEach(function (link) {
          nextNodes.push(link.target)
        })
      })
      remainingNodes = nextNodes
      ++x
    }
    //
    moveSinksRight(x)
    scaleNodeBreadths((width - nodeWidth) / (x - 1))
  }

  function moveSourcesRight() {
    nodes.forEach(function (node) {
      if (!node.targetLinks.length) {
        node.x = d3.min(node.sourceLinks, function (d) {
          return d.target.x
        }) - 1
      }
    })
  }

  function moveSinksRight(x) {
    nodes.forEach(function (node) {
      if (!node.sourceLinks.length) {
        node.x = x - 1
      }
    })
  }

  function scaleNodeBreadths(kx) {
    nodes.forEach(function (node) {
      node.x *= kx
    })
  }

  function computeNodeDepths(iterations) {
    const ascendingDepth = (a, b) => a.y - b.y
    // custom placement of Funds
    const centerFunds = () => {
      // figure out leftover vertical space
      let funds = nodesByBreadth[2]
      let vpad = sankey.size()[1] - sankey.nodePadding()
      funds.forEach(node => vpad -= node.dy)
      // space funds out more
      funds[0].y += vpad / 3
      funds[1].y += (vpad / 3) * 2
    }
    nodesByBreadth = nest()
      .key(function (d) {
        return d.x
      })
      .sortKeys(d3.ascending)
      .entries(nodes)
      .map(function (d) {
        return d.values
      })
    initializeNodeDepth()
    resolveCollisions()
    centerFunds()
    for (let alpha = 1; iterations > 0; --iterations) {
      relaxRightToLeft(alpha *= .99)
      resolveCollisions()
      relaxLeftToRight(alpha)
      resolveCollisions()
    }

    function initializeNodeDepth() {
      const ky = d3.min(nodesByBreadth, nodes => (size[1] - (nodes.length - 1) * nodePadding) / d3.sum(nodes, value))
      nodesByBreadth.forEach(nodes => {
        nodes.forEach((node, i) => {
          node.y = i
          node.dy = node.value * ky
        })
      })
      links.forEach(link => link.dy = link.value * ky)
    }

    function relaxLeftToRight(alpha) {
      nodesByBreadth.forEach(nodes => {
        nodes.forEach(node => {
          if (node.targetLinks.length) {
            const y = d3.sum(node.targetLinks, weightedSource) / d3.sum(node.targetLinks, value)
            node.y += (y - center(node)) * alpha
          }
        })
      })
      const weightedSource = link => center(link.source) * link.value
    }

    function relaxRightToLeft(alpha) {
      const weightedTarget = link => center(link.target) * link.value
      nodesByBreadth.slice().reverse().forEach(nodes => {
        nodes.forEach(node => {
          if (node.sourceLinks.length) {
            const y = d3.sum(node.sourceLinks, weightedTarget) / d3.sum(node.sourceLinks, value)
            node.y += (y - center(node)) * alpha
          }
        })
      })
    }

    function resolveCollisions() {
      nodesByBreadth.forEach(function (nodes) {
        let node
        let dy
        let y0 = 0
        let n = nodes.length
        // Push any overlapping nodes down.
        nodes.sort(ascendingDepth)
        for (let i = 0; i < n; ++i) {
          node = nodes[i]
          dy = y0 - node.y
          if (dy > 0) node.y += dy
          y0 = node.y + node.dy + nodePadding
        }
        // If the bottom-most node goes outside the bounds, push it back up.
        dy = y0 - nodePadding - size[1]
        if (dy > 0) {
          y0 = node.y -= dy
          // Push any overlapping nodes back up.
          for (i = n - 2; i >= 0; --i) {
            node = nodes[i]
            dy = node.y + node.dy + nodePadding - y0
            if (dy > 0) node.y -= dy
            y0 = node.y
          }
        }
      })
    }
  }

  function computeLinkDepths() {
    nodes.forEach(node => {
      node.sourceLinks.sort(ascendingTargetDepth)
      node.targetLinks.sort(ascendingSourceDepth)
    })
    nodes.forEach(node => {
      let sy = 0
      let ty = 0
      node.sourceLinks.forEach(link => {
        link.sy = sy
        sy += link.dy
      })
      node.targetLinks.forEach(link => {
        link.ty = ty
        ty += link.dy
      })
    })
    const ascendingSourceDepth = (a, b) => a.source.y - b.source.y
    const ascendingTargetDepth = (a, b) => a.target.y - b.target.y
  }

  const center = node => node.y + node.dy / 2
  const value = link => link.value
  return sankey
}
