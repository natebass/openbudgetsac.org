/* eslint-disable camelcase, eqeqeq, no-tabs, no-shadow-restricted-names, no-use-before-define, no-var, no-prototype-builtins, no-unused-vars */
const margin = { top: 20, right: 1, bottom: 6, left: 1 }
const width = 1140 - margin.left - margin.right
const height = 630 - margin.top - margin.bottom

const formatNumber = d3.format(',.0f')
const format = /**
 * Builds format.
 *
 * @param {any} d Input value.
 * @returns {any} Function result.
 */
function (d) {
  return '$' + formatNumber(d)
}

const i18nT = /**
 * Runs i18n t.
 *
 * @param {any} key Input value.
 * @param {any} fallback Input value.
 * @param {any} vars Input value.
 * @returns {any} Function result.
 */
function (key, fallback, vars) {
  if (window.obI18n && typeof window.obI18n.t === 'function') {
    return window.obI18n.t(key, fallback, vars)
  }
  if (!vars) {
    return fallback
  }
  return fallback.replace(/\{\{(\w+)\}\}/g, function (_full, name) {
    return Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : ''
  })
}
/* exported data_wrangle, data_wrangle_v1, do_with_budget */
const hoverDescription = d3.select('#hover_description')
let hoverRaf = null
let pendingHoverPosition = null

const svg = d3
  .select('#chart')
  .append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)

svg
  .append('text')
  .text(i18nT('flow.revenues', 'Revenues'))
  .attr('y', margin.top * 0.6)
  .attr('x', margin.left)

svg
  .append('text')
  .text(i18nT('flow.expenses', 'Expenses'))
  .attr('y', margin.top * 0.6)
  .attr('x', margin.left + width)
  .attr('text-anchor', 'end')

// Keep color buckets fixed across fiscal years so users can compare years visually.
const fundColors = d3.scale
  .ordinal()
  // Keep both singular and plural labels mapped to the same color.
  .domain(['General Fund', 'General Funds', 'Non-discretionary funds'])
  .range(['#4285ff', '#4285ff', '#8249b7']) // 2020 renovation
// .range(["#276419", "#4db029"]);
// .range(["#276419", "#b8e186"]);
const erColors = d3.scale
  .ordinal()
  .domain(['expense', 'revenue'])
  .range(['#ff8129', '#7fc97f'])
// .range(["#ffb36b", "#7fc97f"]);
// .range(["#ffd92f", "#ffd92f"])
// .range(["#c51b7d", "#8e0152"]);

// Gradients encode flow direction (revenue -> fund -> expense) without extra labels.
svg
  .append('linearGradient')
  .attr('id', 'gradientRtoGF')
  .attr('x1', 0)
  .attr('y1', 0)
  .attr('x2', '100%')
  .attr('y2', 0)
  .selectAll('stop')
  .data([
    { offset: '10%', color: erColors('revenue') },
    { offset: '90%', color: fundColors('General Funds') }
  ])
  .enter()
  .append('stop')
  .attr('offset', function (d) {
    return d.offset
  })
  .attr('stop-color', function (d) {
    return d.color
  })
svg
  .append('linearGradient')
  .attr('id', 'gradientRtoNF')
  .attr('x1', 0)
  .attr('y1', 0)
  .attr('x2', '100%')
  .attr('y2', 0)
  .selectAll('stop')
  .data([
    { offset: '10%', color: erColors('revenue') },
    { offset: '90%', color: fundColors('Non-discretionary funds') }
  ])
  .enter()
  .append('stop')
  .attr('offset', function (d) {
    return d.offset
  })
  .attr('stop-color', function (d) {
    return d.color
  })
svg
  .append('linearGradient')
  .attr('id', 'gradientNFtoE')
  .attr('x1', 0)
  .attr('y1', 0)
  .attr('x2', '100%')
  .attr('y2', 0)
  .selectAll('stop')
  .data([
    { offset: '10%', color: fundColors('Non-discretionary funds') },
    { offset: '90%', color: erColors('expense') }
  ])
  .enter()
  .append('stop')
  .attr('offset', function (d) {
    return d.offset
  })
  .attr('stop-color', function (d) {
    return d.color
  })
svg
  .append('linearGradient')
  .attr('id', 'gradientGFtoE')
  .attr('x1', 0)
  .attr('y1', 0)
  .attr('x2', '100%')
  .attr('y2', 0)
  .selectAll('stop')
  .data([
    { offset: '10%', color: fundColors('General Funds') },
    { offset: '90%', color: erColors('expense') }
  ])
  .enter()
  .append('stop')
  .attr('offset', function (d) {
    return d.offset
  })
  .attr('stop-color', function (d) {
    return d.color
  })

/**
 * Normalizes schema differences across fiscal year datasets.
 *
 * @param {Array<object>} dataset Raw CSV row data.
 * @param {string} fy Fiscal year label (for example `FY26`).
 * @returns {{nodes:Array<object>,links:Array<object>}} Sankey graph input.
 */
function data_wrangle (dataset, fy) {
  fy = fy.slice(0, 4)
  // Each fiscal-year export uses slightly different column names.
  // This switch keeps old datasets readable without rewriting source files.
  switch (fy) {
    case 'FY15':
    case 'FY16':
    case 'FY17':
    case 'FY18':
      return (data_wrangle_v1(dataset, 'account_category', 'department', 'account_type', 'Revenues', 'Expenses', 'fund_code', 'General Funds', 'amount'))
    case 'FY13':
    case 'FY14':
    case 'FY19':
    case 'FY20':
    case 'FY21':
    case 'FY22':
    case 'FY23':
    case 'FY24':
      return (data_wrangle_v1(dataset, 'CATEGORY', 'Department', 'ExpenseRevenue', 'R', 'E', 'Fund', 'General Fund', 'Amount'))
    case 'FY25':
      return (data_wrangle_v1(dataset, 'CATEGORY', 'Department', 'ExpenseRevenue', 'Revenues', 'Expenses', 'Fund', 'General Fund', 'Amount'))
    case 'FY26':
      return (data_wrangle_v1(dataset, 'CATEGORY', 'Department', 'ExpenseRevenue', 'Revenues', 'Expenses', 'Fund', 'General Fund', 'Amount'))
    default:
      return (data_wrangle_v1(dataset, 'CATEGORY', 'Department', 'ExpenseRevenue', 'Revenues', 'Expenses', 'Fund', 'General Fund', 'Amount'))
  }
}

// This ordering is Sacramento-specific and intentionally not alphabetical.
const rev_order = [
  'Taxes',
  'Charges, Fees, and Services',
  'Miscellaneous Revenue',
  'Intergovernmental',
  'Contributions from Other Funds',
  'Licenses and Permits',
  'Fines, Forfeitures, and  Penalties',
  'Interest, Rents, and Concessions'
]

// This ordering mirrors local budget reading conventions for department comparisons.
const exp_order = [
  'Police',
  'Utilities',
  'Citywide and Community Support',
  'General Services',
  'Fire',
  'Debt Service',
  'Public Works',
  'Human Resources',
  'Parks and Recreation',
  'Community Development',
  'Convention and Cultural Services',
  'Finance',
  'Information Technology',
  'City Attorney',
  'Mayor/Council',
  'City Manager',
  'City Treasurer',
  'Economic Development',
  'City Clerk',
  'Non-Appropriated'
]

/**
 * Creates a comparator by explicit value ordering.
 *
 * @param {string[]} fields_arr Ordered values.
 * @returns {(a:string, b:string) => number} Comparator.
 */
const sort_by = (fields_arr) => {
  const rank = fields_arr.reduce((acc, field, index) => {
    acc[field] = index
    return acc
  }, {})

  return (a, b) => {
    const rankA = Object.prototype.hasOwnProperty.call(rank, a) ? rank[a] : Number.MAX_SAFE_INTEGER
    const rankB = Object.prototype.hasOwnProperty.call(rank, b) ? rank[b] : Number.MAX_SAFE_INTEGER
    if (rankA === rankB) {
      return d3.ascending(a, b)
    }
    return rankA - rankB
  }
}
/**
 * Creates fund bucket accessor for grouped keys.
 *
 * @param {string} fund_field Source field name.
 * @param {string} general_fund Value treated as General Fund.
 * @returns {(d:object) => string} Grouping key accessor.
 */
const fundKey = (fund_field, general_fund) => d => d[fund_field] == general_fund ? 'General Fund' : 'Non-discretionary funds'
/**
 * Creates rollup function that adds numeric totals.
 *
 * @param {string} amount_field Amount field name.
 * @returns {(v:Array<object>) => object} Rollup reducer.
 */
const rollupFn = amount_field => v => ({ total: d3.sum(v, d => +d[amount_field]) })
/**
 * Maps grouped records into sankey nodes/links.
 *
 * @param {Array<{key:string,values:Array<{key:string,values:{total:number}}>} data Grouped data.
 * @param {'revenue'|'expense'} type Flow segment type.
 * @param {number} offset Node index offset.
 * @returns {{nodes:Array<object>,links:Array<object>}} Partial graph.
 */
const flatten = nested => nested.reduce((acc, row) => acc.concat(row), [])

const generateNodesAndLinks = (data, type, offset) => ({
  nodes: data.map(kv => ({ name: kv.key, type })),
  links: flatten(data.map((kv, i) =>
    kv.values.map((kv2) => ({
      [type === 'revenue' ? 'source' : 'target']: i + offset,
      value: kv2.values.total,
      [type === 'revenue' ? 'target' : 'source']: kv2.key === 'General Fund' ? 0 : 1
    }))
  ))
})

/**
 * Builds sankey nodes and links from a normalized row schema.
 *
 * @param {Array<object>} dataset Row data.
 * @param {string} category_field Revenue category field.
 * @param {string} department_field Expense department field.
 * @param {string} expense_field Expense/revenue discriminator field.
 * @param {string} revenue_value Revenue discriminator value.
 * @param {string} expense_value Expense discriminator value.
 * @param {string} fund_field Fund code field.
 * @param {string} general_fund General fund label.
 * @param {string} amount_field Amount field name.
 * @returns {{nodes:Array<object>,links:Array<object>}} Sankey graph data.
 */
function data_wrangle_v1 (dataset, category_field, department_field, expense_field, revenue_value, expense_value, fund_field, general_fund, amount_field) {
  const nodes = [
    { name: 'General Funds', type: 'fund', order: 0 },
    { name: 'Non-discretionary funds', type: 'fund', order: 1 }
  ]

  const rev = []
  const exp = []
  for (let i = 0; i < dataset.length; i++) {
    const row = dataset[i]
    if (row[expense_field] == revenue_value) {
      rev.push(row)
    } else if (row[expense_field] == expense_value) {
      exp.push(row)
    }
  }

  const revcats = d3
    .nest()
    .key(d => d[category_field])
    .sortKeys(sort_by(rev_order))
    .key(fundKey(fund_field, general_fund))
    .rollup(rollupFn(amount_field))
    .entries(rev)
  const rev_data = generateNodesAndLinks(revcats, 'revenue', nodes.length)

  const expdivs = d3
    .nest()
    .key(d => d[department_field])
    .sortKeys(sort_by(exp_order))
    .key(fundKey(fund_field, general_fund))
    .rollup(rollupFn(amount_field))
    .entries(exp)
  const exp_data = generateNodesAndLinks(expdivs, 'expense', nodes.length + rev_data.nodes.length)

  return { nodes: [...nodes, ...rev_data.nodes, ...exp_data.nodes], links: [...rev_data.links, ...exp_data.links] }
}

/**
 * Renders the sankey chart for prepared data.
 *
 * @param {{nodes:Array<object>,links:Array<object>}} data Graph data.
 * @returns {void}
 */
function do_with_budget (data) {
  svg.select('#chart').remove()

  const chart = svg
    .append('g')
    .attr('id', 'chart')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

  const sankey = d3.sankey().nodeWidth(20).nodePadding(10).size([width, height])

  const path = sankey.link()

  sankey.nodes(data.nodes).links(data.links).layout(0)

  const scheduleHoverPosition = function () {
    if (!pendingHoverPosition || hoverRaf) {
      return
    }

    hoverRaf = window.requestAnimationFrame(function () {
      hoverRaf = null
      if (!pendingHoverPosition) {
        return
      }
      hoverDescription.style({
        top: (pendingHoverPosition.y - 10) + 'px',
        left: (pendingHoverPosition.x + 10) + 'px'
      })
      pendingHoverPosition = null
    })
  }

  const link = chart
    .append('g')
    .selectAll('.link')
    .data(data.links)
    .enter()
    .append('path')
    .attr('class', 'link')
    .attr('d', path)
    .style('stroke-width', function (d) {
      return Math.max(1, d.dy)
    })
    .style('stroke', function (d) {
      // Gradient selection depends on normalized fund node names from `data_wrangle_v1`.
      // If links render with no color, check for label drift in source data.
      switch (d.target.name) {
        case 'General Funds':
          return "url('#gradientRtoGF')"
        case 'Non-discretionary funds':
          return "url('#gradientRtoNF')"
      }
      switch (d.source.name) {
        case 'General Funds':
          return "url('#gradientGFtoE')"
        case 'Non-discretionary funds':
          return "url('#gradientNFtoE')"
      }
    })
    .sort(function (a, b) {
      return b.dy - a.dy
    })
    .on('mouseover', function (d) {
      d3.select(this).classed('highlight', true)
      hoverDescription
        .classed('show', true)
        .text(
          d.source.name + ' → ' + d.target.name + ': ' + format(d.value)
        )
    })
    .on('mousemove', function () {
      const evt = d3.event || window.event || {}
      const eventX = typeof evt.pageX === 'number'
        ? evt.pageX
        : (typeof evt.clientX === 'number' ? evt.clientX + window.pageXOffset : 0)
      const eventY = typeof evt.pageY === 'number'
        ? evt.pageY
        : (typeof evt.clientY === 'number' ? evt.clientY + window.pageYOffset : 0)
      pendingHoverPosition = {
        x: eventX,
        y: eventY
      }
      scheduleHoverPosition()
    })
    .on('mouseout', function () {
      d3.select(this).classed('highlight', function () {
        return d3.select(this).classed('click')
      })
      pendingHoverPosition = null
      if (hoverRaf) {
        window.cancelAnimationFrame(hoverRaf)
        hoverRaf = null
      }
      hoverDescription.classed('show', false)
    })

  const node = chart
    .append('g')
    .selectAll('.node')
    .data(data.nodes)
    .enter()
    .append('g')
    .attr('class', function (d) {
      return 'node ' + d.type
    })
    .attr('transform', function (d) {
      return 'translate(' + d.x + ',' + d.y + ')'
    })

  node
    .append('rect')
    .attr('height', function (d) {
      return d.dy
    })
    .attr('width', sankey.nodeWidth())
    .style('fill', function (d) {
      switch (d.type) {
        case 'fund':
          d.color = fundColors(d.name)
          // d.color = "transparent";
          break
        default:
          d.color = erColors(d.type)
          break
      }
      return d.color
    })
    .style('stroke', function (d) {
      if (d.type === 'fund') {
        return d3.rgb(d.color)
      } else {
        return d3.rgb(d.color).darker(1)
      }
    })
    .on('mouseover', function (d) {
      const thisnode = d3.select(this.parentNode)

      //   highlight node only, not flows
      thisnode.classed('hover', true)

      //   append total amount to label
      thisnode
        .select('text')
        .transition()
        .text(function (d) {
          let text = d.name
          text += ': ' + format(d.value)
          return text
        })
    })
    .on('mouseout', function (d) {
      const thisnode = d3.select(this.parentNode)
      //   remove node highlight
      thisnode.classed('hover', false)
      //   remove amount from label
      if (!thisnode.classed('highlight')) {
        thisnode
          .select('text')
          .transition()
          .text(function (d) {
            return d.name
          })
      }
    })
    .on('click', function (d) {
      const thisnode = d3.select(this.parentNode)
      if (thisnode.classed('highlight')) {
        thisnode.classed('highlight', false)
        thisnode.classed('hover', false)
      } else {
        //   node.classed("highlight", false);
        thisnode.classed('highlight', true)
      }

      link.classed('highlight click', function (link_d) {
        if ([link_d.target.name, link_d.source.name].indexOf(d.name) >= 0) {
          return thisnode.classed('highlight')
        } else {
          return d3.select(this).classed('click')
        }
      })

      thisnode
        .select('text')
        .transition()
        .text(function (d) {
          let text = d.name
          if (thisnode.classed('highlight')) {
            text += ': ' + format(d.value)
          }
          return text
        })
    })

  node
    .append('text')
    .attr('x', -6)
    .attr('y', function (d) {
      return d.dy / 2
    })
    .attr('dy', '.35em')
    .attr('class', 'main-text')
    .attr('text-anchor', 'end')
    .attr('transform', null)
    .text(function (d) {
      return d.name
    })
    .filter(function (d) {
      return d.x < width / 2
    })
    .attr('x', 6 + sankey.nodeWidth())
    .attr('text-anchor', 'start')
}
