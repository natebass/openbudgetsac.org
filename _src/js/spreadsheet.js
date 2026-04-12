/* eslint-disable camelcase, eqeqeq, no-tabs, no-shadow-restricted-names, no-use-before-define, no-var, no-prototype-builtins, no-unused-vars */
var ob = ob || {}
ob.display = ob.display || {}

;(function (namespace, undefined) {
  /**
   * Creates spreadsheet/table renderer for budget rows.
   *
   * @returns {{width:function,on:function,columns:function,column:function,cell:function,value:function,data:function,element:function,display:function}} Spreadsheet API.
   */
  namespace.spreadsheet = function () {
    let _data = null
    let _element = null
    let _width = null
    const _on = {}
    let _columns = []

    /**
     * Default value accessor used for sorting.
     *
     * @param {object} d Row datum.
     * @returns {*} Sort value.
     */
    let _get_value = function (d) {
      return d.value
    }

    /**
     * Default cell renderer.
     *
     * @param {*} d Cell datum.
     * @param {number} i Cell index.
     * @param {*} elem d3 cell selection.
     */
    let _cell = function (d, i, elem) {
      elem.text(d.value == null ? '' : String(d.value))
    }

    /**
     * Default header renderer.
     *
     * @param {*} d Header datum.
     * @param {number} i Header index.
     * @param {*} elem d3 header selection.
     */
    let _column = function (d, i, elem) {
      elem.text(d.value == null ? '' : String(d.value))
    }

    return {
      /**
       * Gets/sets table width.
       */
      width: function () {
        if (arguments.length === 0) {
          return _width
        }
        _width = arguments[0]
        return this
      },

      /**
       * Gets/sets event handlers.
       */
      on: function (action, callback) {
        if (callback) {
          _on[action] = callback
        } else if (action) {
          return _on[action]
        }
        return this
      },

      /**
       * Gets/sets column labels.
       */
      columns: function () {
        if (arguments.length === 0) {
          return _columns
        }
        _columns = arguments[0]
        return this
      },

      /**
       * Gets/sets column renderer.
       */
      column: function () {
        if (arguments.length === 0) {
          return _column
        }
        _column = arguments[0]
        return this
      },

      /**
       * Gets/sets cell renderer.
       */
      cell: function () {
        if (arguments.length === 0) {
          return _cell
        }
        _cell = arguments[0]
        return this
      },

      /**
       * Gets/sets value accessor for row sorting.
       */
      value: function () {
        if (arguments.length === 0) {
          return _get_value
        }
        _get_value = arguments[0]
        return this
      },

      /**
       * Gets/sets source data.
       */
      data: function () {
        if (arguments.length === 0) {
          return _data
        }

        _data = arguments[0].slice()
        _data.sort(function (a, b) {
          return _get_value(b) - _get_value(a)
        })
        return this
      },

      /**
       * Gets/sets host element.
       */
      element: function () {
        if (arguments.length === 0) {
          return _element
        }
        _element = arguments[0]
        return this
      },

      /**
       * Renders the spreadsheet table.
       */
      display: function () {
        /* Clear the previous render before rebuilding the table. */
        _element.select('table').remove()
        const table = _element.append('table')
          .attr('class', 'spreadsheet table')
          .attr('width', _width)
        const thead_tr = table.append('thead').append('tr')
        const tbody = table.append('tbody')
        _element.select('#more').remove()

        /* Render headers from the current column definition list. */
        for (let i = 0; i < _columns.length; i++) {
          _column(_columns[i], i, thead_tr.append('th'))
        }

        tbody.selectAll('tr').remove()
        const rows = tbody.selectAll('tr').data(_data)
        const row = rows.enter().append('tr')
          .on('click', function (d, i) {
            if (_on.click) {
              _on.click(d, i)
            }
          })

        const cells = row.selectAll('td').data(function (d, i) {
          const new_data = []
          for (let j = 0; j < _columns.length; j++) {
            new_data.push({ d, row: i })
          }
          return new_data
        })

        const cell = cells.enter().append('td')
        cell.datum(function (d, i) {
          try {
            _cell(d.d, i, d.row, d3.select(this))
          } catch (error) {
            // Keep the rest of the table usable if one cell renderer fails.
            console.error('Spreadsheet cell render error', error)
            d3.select(this).text('')
          }
        })
        cells.exit().remove()

        return this
      }
    }
  }
})(ob.display)
