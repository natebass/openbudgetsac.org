/* eslint-disable camelcase, eqeqeq, no-tabs, no-shadow-restricted-names, no-use-before-define, no-var, no-prototype-builtins, no-unused-vars */
var ob = ob || {}
ob.display = ob.display || {}

;(function (namespace, undefined) {
  function escapeHtml (value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
  }

  /**
	 * Creates the composed budget treemap experience (treemap + table + controls).
	 *
	 * @returns {object} Budget treemap API.
	 */
  namespace.budget_treemap = function () {
    let _url = null
    let _treemap = null
    let _spreadsheet = null
    let _dropdown = null
    /* The cruncher reshapes flat budget rows into a drillable hierarchy. */
    const _cruncher = ob.data.hierarchy()
    /**
     * Default accessor for node amount value.
     *
     * @param {object} d Node datum.
     * @returns {number} Amount value.
     */
    let _get_value = function (d) {
      return d.data.amount
    }
    let _max_rects = 40
    const _max_spreadsheet_rows = 10
    const _min_area_for_text = 0.0125
    let _palette = [
      '#970000',
      '#CD0059',
      '#E23600',
      '#F07400',
      '#EDA400',
      '#009F76',
      // '#009DB0',
      // '#00C0D7',
      '#008F16',
      '#395BF6',
      '#690180'
    ]
    let _spreadsheet_selector = '#table'
    let _treemap_selector = '#treemap'
    let _dropdown_selector = '#dropdown'
    let _title_selector = '#title'
    let _breadcrumbs_selector = '#breadcrumbs'
    /* layout settings */
    const _layout = {
      width: 800,
      height: 500
    }

    /* used to convert numerical data into text data */
    const _format = {
      number: d3.format('$,d'),
      percent: d3.format('.2%')
    }

    let _config = {
      url: function () {
        return ''
      }
    }

    /**
     * Normalizes hash path segments.
     *
     * @param {string} s Hash segment.
     * @returns {string} Normalized segment.
     */
    let _hash_normalize = function (s) {
      return s
    }

    /**
     * Compares hash path segment values.
     *
     * @param {*} v1 Segment value A.
     * @param {*} v2 Segment value B.
     * @returns {number} 0 when equal, otherwise 1.
     */
    let _hash_compare = function (v1, v2) {
      return v1 == v2 ? 0 : 1
    }

    /* interaction */
    const _on_handlers = {}
    /* Apply registered events to any object that exposes a d3-style `.on` API. */
    /**
     * Applies registered interaction handlers to a d3-like object.
     *
     * @param {*} d3obj Object implementing `.on`.
     * @returns {void}
     */
    function _apply_handlers (d3obj) {
      for (const event_name in _on_handlers) {
        if (_on_handlers.hasOwnProperty(event_name)) {
          if (_on_handlers[event_name]) {
            d3obj.on(event_name, _on_handlers[event_name])
          }
        }
      }
    }

    /* create and configure the tooltip */
    /**
     * Builds tooltip HTML content for treemap rectangles.
     *
     * @param {object} d Node datum.
     * @param {number} i Node index.
     * @returns {string} Tooltip HTML.
     */
    let _tooltip_function = function (d, i) {
      /* Build tooltip HTML for the hovered treemap node. */
      let percent = 1.0
      if (d.parent) {
        const parentValue = _get_value(d.parent)
        percent = parentValue ? (_get_value(d) / parentValue) : 0
      }
      let display = '<p class="treemap_tooltip title">' + escapeHtml(d.key) + '</p>'
      display += '<p class="treemap_tooltip amount">' + escapeHtml(_format.number(_get_value(d))) + '</p>'
      display += '<p class="treemap_tooltip percentage">' + _format.percent(percent) + '</p>'
      return display
    }

    /* Resolve the active hierarchy view from the current URL hash. */
    const _hash = {
      _expected_hash: '',

      /**
       * Gets/sets expected hash to avoid redundant refreshes.
       *
       * @returns {*}
       */
      expected: function () {
        if (arguments.length) {
          this._expected_hash = arguments[0]
          return this
        }
        return this._expected_hash
      },

      /**
       * Resolves the currently selected node from window hash.
       *
       * @param {object} root Root node.
       * @returns {object} Active node.
       */
      get: function (root) {
        let hash = window.location.hash.replace('#', '')
        if (_on_handlers.hasOwnProperty('get_hash')) {
          hash = _on_handlers.get_hash(hash)
        }

        if (hash.length < 1) {
          return root
        }
        // When part of the path is stale or missing, `spelunk` returns the
        // deepest valid node so the page still renders instead of failing hard.
        return _cruncher.spelunk(
          root,
          hash.split('.'),
          _hash_compare
        )
      },
      /**
       * Sets window hash to represent the provided node path.
       *
       * @param {object} node Active node.
       * @returns {void}
       */
      set: function (node) {
        let hash = _cruncher.path(node)
          .slice(1)
          .map(function (d) { return _hash_normalize(d.key) })
          .join('.')
        if (_on_handlers.hasOwnProperty('set_hash')) {
          hash = _on_handlers.set_hash(hash)
        }
        this.expected(hash)
        window.location.hash = hash
      }
    }

    return {
      width: function () {
        if (arguments.length) {
          _layout.width = arguments[0]
          return this
        }
        return _layout.width
      },

      height: function () {
        if (arguments.length) {
          _layout.height = arguments[0]
          return this
        }
        return _layout.height
      },

      url: function () {
        if (arguments.length) {
          _url = arguments[0]
          return this
        }
        return _url
      },

      count: function () {
        if (arguments.length) {
          _max_rects = arguments[0]
          return this
        }
        return _max_rects
      },

      palette: function () {
        if (arguments.length) {
          _palette = arguments[0]
          return this
        }
        return _palette
      },

      hashnorm: function () {
        if (arguments.length) {
          _hash_normalize = arguments[0]
          return this
        }
        return _hash_normalize
      },

      hashcmp: function () {
        if (arguments.length) {
          _hash_compare = arguments[0]
          return this
        }
        return _hash_compare
      },

      value: function () {
        if (arguments.length) {
          _get_value = arguments[0]
          return this
        }
        return _get_value
      },

      on: function (eventname, eventfunc) {
        _on_handlers[eventname] = eventfunc
        if (_treemap) {
          _treemap.on(eventname, eventfunc)
        }
        if (_spreadsheet) {
          _spreadsheet.on(eventname, eventfunc)
        }
        if (_dropdown) {
          _dropdown.on(eventname, eventfunc)
        }
        return this
      },

      config: function () {
        if (arguments.length) {
          _config = arguments[0]
          return this
        }
        return _config
      },

      tooltip: function () {
        if (arguments.length) {
          _tooltip_function = arguments[0]
          return this
        }
        return _tooltip_function
      },

      dropdown: function () {
        if (arguments.length) {
          _dropdown_selector = arguments[0]
          return this
        }
        return _dropdown_selector
      },

      spreadsheet: function () {
        if (arguments.length) {
          _spreadsheet_selector = arguments[0]
          return this
        }
        return _spreadsheet_selector
      },

      treemap: function () {
        if (arguments.length) {
          _treemap_selector = arguments[0]
          return this
        }
        return _treemap_selector
      },

      title: function () {
        if (arguments.length) {
          _title_selector = arguments[0]
          return this
        }
        return _title_selector
      },

      breadcrumbs: function () {
        if (arguments.length) {
          _breadcrumbs_selector = arguments[0]
          return this
        }
        return _breadcrumbs_selector
      },

      /**
       * Loads data and initializes composed treemap UI widgets.
       *
       * @returns {void}
       */
      create: function () {
        /* Handle browser back/forward navigation by reloading the active node. */
        const self = this
        window.onhashchange = function (e) {
          const hash = window.location.hash.replace('#', '')
          // Ignore hash updates we triggered ourselves during normal transitions.
          if (hash != _hash.expected()) {
            self.refresh()
          }
        }

        /* create initial color palette */
        const _color_stack = ob.palette.stack().palette(d3.scale.ordinal().range(_palette))
        this._create_dropdown()

        /* create and configure the tooltip */
        const _tooltip = ob.display.tooltip().html(_tooltip_function)

        /* call d3 to load the budget data, and then display the data
        * after it has loaded */
        d3.json(_url, function (errOrData, maybeData) {
          const error = arguments.length > 1 ? errOrData : null
          const data = arguments.length > 1 ? maybeData : errOrData
          if (error || !data) {
            console.error('Unable to load treemap data', error || new Error('No data returned'))
            d3.select(_title_selector).text('Unable to load data')
            return
          }

          const root = data
          /**
           * Renders clickable breadcrumb path for the current node.
           *
           * @param {object} d Current node.
           * @returns {void}
           */
          function _create_breadcrumbs (d) {
            const current_node = d
            d3.select(_breadcrumbs_selector).selectAll('.crumb').remove()

            const crumbs = d3.select(_breadcrumbs_selector)
              .selectAll('.crumb')
              .data(ob.data.hierarchy().path(d))

            crumbs.enter().append('span')
              .attr('class', 'crumb')
              .on('click', function (clicked, i) {
                if (clicked == current_node) {
                  /* don't transition if they click on the same data that is already
                     being display */
                  return
                }
                let levels = 0
                let current = current_node
                while (current && current != clicked) {
                  levels -= 1
                  current = current.parent
                }
                _treemap.transition(clicked, levels, false)
              })
              .text(function (d, i) {
                return i > 0 ? ' > ' + d.key : d.key
              })
          }

          /* set parent links */
          _cruncher.apply(root, function (node) {
            if (node.values) {
              node.values.forEach(function (child) {
                child.parent = node
              })
            }
          })

          /* Calculate percentages for downstream UI consumers. */
          _cruncher.apply(root, function (node) {
            if (node.parent) {
              // Keep both spellings for backward compatibility with old templates.
              const ratio = _get_value(node) / _get_value(node.parent)
              node.precentage = ratio
              node.percentage = ratio
            } else {
              node.percentage = 1.0
              node.precentage = 1.0
            }
          })
          const node = _hash.get(root)

          _cruncher.path(node).forEach(function (d) {
            if (d.parent) {
              const i = d.parent.values.indexOf(d)
              _color_stack.unshift(
                _color_stack.palette()(i),
                Math.min(d.values.length, _max_rects))
            }
          })

          _spreadsheet = ob.display.spreadsheet()
            .element(d3.select(_spreadsheet_selector))
            .width(_layout.width)
            .value(function (d) {
              /* D3 treemap drops zero-area nodes. Use a tiny floor so rows remain visible. */
              return _get_value(d) <= 0 ? 0.001 : _get_value(d)
            })
            .columns(['', 'Item', 'Expense', 'Revenue'])
            .column(function (d, i, elem) {
              if (i == 1) {
                elem.attr('class', 'item').text(d)
              } else if (i == 2) {
                elem.attr('class', 'money').text(d)
              } else if (i == 3) {
                elem.attr('class', 'money').text(d)
              }
            })
            .cell(function (d, i, j, elem) {
              if (i == 0) {
                elem.append('div')
                  .attr('class', 'square')
                  .style('background-color', _color_stack.palette()(j))
              } else if (i == 1) {
                elem.attr('class', 'item').text(d.key)
              } else if (i == 2) {
                elem.attr('class', 'money').text(_format.number(d.data.expense))
              } else if (i == 3) {
                elem.attr('class', 'money').text(_format.number(d.data.revenue))
              }
              if (i == 0) {
                const parent_node = d3.select(elem.node().parentNode)
                if (j > _max_spreadsheet_rows) {
                  parent_node.style('visibility', 'hidden')
                    .style('display', 'none')
                } else {
                  parent_node.style('visibility', 'visible')
                    .style('display', 'table-row')
                }
                if (j == (_max_spreadsheet_rows + 1)) {
                  const spreadsheet_element = d3.select(_spreadsheet_selector)
                  spreadsheet_element.append('button')
                    .attr('class', 'btn btn-default')
                    .attr('id', 'more')
                    .text('Show more')
                    .on('click', function () {
                      spreadsheet_element.selectAll('tr')
                        .style('visibility', 'visible')
                        .style('display', 'table-row')
                      spreadsheet_element.select('#more').remove()
                    })
                }
              }
            })

          /* apply any "on" handlers to spreadsheet */
          _apply_handlers(_spreadsheet)

          /* create treemap using current color scheme */
          _treemap = ob.display.treemap()
            .colors(_color_stack.palette())
            .value(_get_value)

          /* apply any "on" handlers to treemap */
          _apply_handlers(_treemap)

          /* configure treemap and display */
          _treemap.width(_layout.width)
            .height(_layout.height)
            .value(function (d) {
              /* D3 treemap drops zero-area nodes. Use a tiny floor so rows remain visible. */
              return _get_value(d) <= 0 ? 0.001 : _get_value(d)
            })
            .rects(_max_rects)
            .rect_text(function (d, i) {
              /* Show labels only when rectangles are large enough to stay legible. */
              const text_width = _layout.width * d.dx
              const text_height = _layout.height * d.dy
              if (text_width < 100 || text_height < 40) {
                return ''
              }
              let html = '<div class="amount">'
              html += escapeHtml(_format.number(_get_value(d)))
              html += '</div><div class="name">'
              html += escapeHtml(d.key)
              html += '</div>'
              return html
            })
            .on('mouseover', function (d, i) {
              /* Show tooltip for the currently hovered rectangle. */
              _tooltip.show(d, i)
            })
            .on('mousemove', function (d, i) {
              /* Keep tooltip anchored to the pointer while moving. */
              _tooltip.track()
            })
            .on('mouseout', function (d, i) {
              /* Hide tooltip when leaving a rectangle. */
              _tooltip.hide()
            })
            .on('display', function (d) {
              /* Sync URL hash and detail table whenever the active node changes. */
              _hash.set(d)
              _spreadsheet.data(d.values)
                .display()
              d3.select(_title_selector).text(d.key)
              /* set breadcrumbs */
              _create_breadcrumbs(d)
            })
            .on('transition', function (d, i, direction) {
              /* Update stacked palettes before each transition animation. */
              if (direction) {
                /* Add a deeper shade range for the next level down. */
                _color_stack.unshift(_treemap.colors()(i), d.children.length)
              } else {
                /* Remove one shade range per level when moving up. */
                while (i < 0) {
                  _color_stack.shift()
                  i += 1
                }
              }
              /* Apply the updated palette to subsequent rectangle renders. */
              _treemap.colors(_color_stack.palette())
            })
            .data(root)
            .display(d3.select(_treemap_selector), node)
          /* Clicking a table row triggers the matching treemap transition. */
          _spreadsheet.on('click', _treemap.transition)

          /* set title */
          d3.select(_title_selector).text(node.key)

          /* set breadcrumbs */
          _create_breadcrumbs(node)
        })
      },

      /**
       * Creates and binds dropdown filters.
       *
       * @returns {void}
       */
      _create_dropdown: function () {
        const self = this
        const values = []
        for (const key in _config.dropdown_values) {
          if (_config.dropdown_values.hasOwnProperty(key)) {
            values.push(key)
          }
        }
        /* add dropdown */
        _dropdown = d3.select(_dropdown_selector)
          .selectAll('#selector')
          .data(values)
          .enter()
          .append('div')
          .attr('class', 'col-sm-6 dropdown')
          .text(function (d) {
            return d
          })
          .append('select')
          .attr('class', 'form-control')
          .on('change', function (d) {
            _config.dropdown_choice[d] = this.options[this.selectedIndex].value
            _hash.set(_treemap.node())
            self.refresh()
          })
        _apply_handlers(_dropdown)

        /* add options to dropdown */
        _dropdown.selectAll('option')
          .data(function (d) {
            return _config.dropdown_values[d].map(function (v) { return { key: d, value: v } })
          })
          .enter()
          .append('option')
          .text(function (d) { return d.value })
          .attr('selected', function (d) {
            if (d.value == _config.dropdown_choice[d.key]) { return 'selected' }
          })
      },

      /**
       * Rebuilds the visualization based on current configuration.
       *
       * @returns {void}
       */
      refresh: function () {
        d3.select(_spreadsheet_selector).select('svg').remove()
        d3.select(_treemap_selector).select('svg').remove()
        d3.select(_dropdown_selector).selectAll('.dropdown').remove()
        this.url(_config.url())
        this.create()
      }
    }
  }
})(ob.display)
