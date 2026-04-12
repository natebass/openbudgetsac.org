/* eslint-disable camelcase, eqeqeq, no-tabs, no-shadow-restricted-names, no-use-before-define, no-var, no-prototype-builtins, no-unused-vars */
var ob = ob || {}
ob.data = ob.data || {}

;(function (namespace, undefined) {
  /**
   * Finds the first index matching the provided comparator.
   *
   * @param {Array<*>} array Input list.
   * @param {*} value Target value.
   * @param {(a:*, b:*) => number} comparitor Comparator returning 0 on match.
   * @returns {number} Matching index or -1.
   */
  namespace.findIndex = function (array, value, comparitor) {
    /* Keep this helper for older runtimes that still lack `Array.prototype.findIndex`. */
    for (let idx = 0; idx < array.length; idx++) {
      if (comparitor(array[idx], value) === 0) {
        return idx
      }
    }
    return -1
  }

  /**
   * Creates hierarchy helpers for budget data trees.
   *
   * @returns {{crunch:function,spelunk:function,path:function,apply:function}} Hierarchy API.
   */
  namespace.hierarchy = function () {
    /**
     * Recursively prepares node values and parent/depth links.
     *
     * @param {object} node Tree node.
     * @returns {{income:number,expense:number,balance:number}} Aggregated totals.
     */
    function _prepare_recurse (node) {
      /* Legacy d3 partition code expects nested nodes under `values`. */

      /* hold sum of child values */
      const value = {
        income: 0.0,
        expense: 0.0,
        balance: 0.0
      }

      /* Recurse through each child and accumulate totals for the current node. */
      node.values.forEach(function (child) {
        child.depth = node.depth + 1
        child.parent = node
        /* `values` is either a numeric leaf amount or a nested child list. */
        if (child.hasOwnProperty('values')) {
          if (isNaN(child.values)) {
            if (child.values instanceof Array) {
              /* Continue walking nested descendants. */
              // child.children = child.values
              const child_value = _prepare_recurse(child)
              value.income += child_value.income
              value.expense += child_value.expense
              value.balance += child_value.balance
            }
          } else {
            /* Parse leaf totals and split into income/expense using legacy sign rules. */
            child.income = 0.0
            child.expense = 0.0
            child.balance = 0.0
            const total = parseFloat(child.values)
            /* child.value = parseFloat(child.values) */
            // Historical source files store income as negative values.
            if (total < 0.0) {
              child.income = -1.0 * total
              value.income += child.income
            } else {
              child.expense = total
              value.expense += child.expense
            }
            child.balance = child.expense - child.income
            value.balance += child.balance
            delete child.values
          }
        }
      })

      /* Assign aggregate totals for the current node. */
      node.balance = value.balance
      node.value = node.balance
      node.income = value.income
      node.expense = value.expense

      /* Sort children by balance so larger categories are shown first. */
      node.values.sort(function (a, b) {
        return b.balance - a.balance
      })

      /* Return aggregate totals to the parent recursion level. */
      return value
    }

    /**
     * Converts nested d3 data into a root node shape used by visualizations.
     *
     * @param {Array<object>} data Nested data array.
     * @returns {object} Root node.
     */
    function _prepare (data) {
      const root = {
        key: 'Budget',
        depth: 0,
        values: data
      }
      _prepare_recurse(root)
      return root
    }

    return {
      /**
       * Nests flat rows into hierarchical budget data.
       *
       * @param {Array<Array<*>>} rows Data rows.
       * @param {string[]} order Dimension order.
       * @returns {object} Prepared root node.
       */
      crunch: function (rows, order) {
        const amount_pos = order.length
        let nest = d3.nest()

        d3.range(order.length)
          .forEach(function (i) {
            /* Add one nesting key per configured hierarchy level. */
            nest = nest.key(function (d) {
              return d[i]
            })
          })

        /* Sum grouped leaf rows at the deepest hierarchy level. */
        nest = nest.rollup(function (d) {
          let sum = 0.0
          d.forEach(function (x) {
            sum += parseFloat(x[amount_pos])
          })
          return sum
        }).entries(rows)

        /* Normalize structure for treemap/spreadsheet rendering. */
        const root = _prepare(nest)
        // root.values = root.children
        return root
      },

      /**
       * Finds the deepest node reachable by a sequence of keys.
       *
       * @param {object} root Root node.
       * @param {string[]} keys Path segments.
       * @param {(a:*, b:*) => number} [cmp] Key comparator.
       * @returns {object} Matching node or deepest ancestor.
       */
      spelunk: function (root, keys, cmp) {
        if (arguments.length < 3) {
          cmp = function (v1, v2) {
            return v1 == v2 ? 0 : 1
          }
        }
        let node = root
        /* Work on a copy so callers can reuse the original path array. */
        const p = keys.slice()
        while (p.length > 0) {
          var next_key = p.shift()
          var next_node = null
          node.values.forEach(function (c) {
            if (cmp(c.key, next_key) === 0) {
              next_node = c
            }
          })
          if (!next_node) {
            return node
          }
          node = next_node
        }
        return node
      },

      /**
       * Builds the path from root to the given node.
       *
       * @param {object} node Tree node.
       * @returns {object[]} Ordered root-to-node path.
       */
      path: function (node) {
        const p = []
        while (node) {
          p.unshift(node)
          node = node.parent
        }
        return p
      },

      /**
       * Applies a callback recursively to a node and descendants.
       *
       * @param {object} node Tree node.
       * @param {(node:object) => void} func Visitor callback.
       * @returns {void}
       */
      apply: function (node, func) {
        const self = this
        func(node)
        if (node.values) {
          node.values.forEach(function (x) {
            self.apply(x, func)
          })
        }
      }
    }
  }
})(ob.data)
