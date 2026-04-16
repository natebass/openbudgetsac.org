/* eslint-disable no-shadow-restricted-names, no-var */
var ob = ob || {};
ob.display = ob.display || {};

((namespace, undefined) => {
  /**
   * Creates the legacy treemap renderer.
   *
   * @returns {object} Treemap API.
   */
  namespace.treemap = () => {
    let _data = null;
    let _root = null;

    /* Define display element references. */
    let _svg: any = null;
    let _g: any = null;
    let _grandparent: any = null;
    let _colors: any = null;
    let _current_display: any = null;

    /* Define layout settings. */
    const _margin = {top: 0, right: 0, bottom: 0, left: 0};
    let _width = 800;
    let _height = 500;
    const _min_area_for_text = 0.0125;
    let _max_rects = 40;
    let _transitioning = false;

    let _treemap: any = null;

    /* Track interaction handlers. */
    const _on_handlers: Record<
      string,
      ((...args: Array<any>) => any) | undefined
    > = {};

    /**
     * Calculates inner drawable height.
     *
     * @returns {number} Inner height.
     */
    function _inner_height() {
      return _height - _margin.top - _margin.bottom;
    }

    /**
     * Calculates inner drawable width.
     *
     * @returns {number} Inner width.
     */
    function _inner_width() {
      return _width - _margin.left - _margin.right;
    }

    /* Define data access settings. */
    /**
     * Default node value accessor.
     *
     * @param {object} d Node datum.
     * @returns {number} Node value.
     */
    let _get_value = d => d.value;

    /**
     * Default rectangle label renderer.
     *
     * @param {object} d Node datum.
     * @param {number} i Index.
     * @returns {string} Label HTML.
     */
    let _rect_text = (d, i) => '' + _get_value(d.value);

    /**
     * Builds root-to-node ancestry path.
     *
     * @param {object} d Node.
     * @returns {object[]} Ancestor path.
     */
    function _path(d) {
      const p = [];
      while (d.parent) {
        p.push(d);
        d = d.parent;
      }
      p.reverse();
      return p;
    }

    /* Define display helper functions. */
    /**
     * Initializes root layout coordinates.
     *
     * @param {object} root Root node.
     * @returns {void}
     */
    function _initialize(root) {
      root.x = root.y = 0;
      root.dx = 1.0;
      root.dy = 1.0;
      root.depth = 0;
    }

    /**
     * Creates display helpers for a particular node context.
     *
     * @param {object} d Display node.
     * @returns {object} Display helpers.
     */
    function _create_display(d: any): any {
      const x = d3.scale.linear().domain([0.0, 1.0]).range([0, _inner_width()]);

      const y = d3.scale
        .linear()
        .domain([0.0, 1.0])
        .range([0, _inner_height()]);

      return {
        d,
        x,
        y,

        text: text => {
          text.attr('x', d => x(d.x) + 6).attr('y', d => y(d.y) + 6);
        },

        rect: rect => {
          rect
            .attr('x', d => x(d.x))
            .attr('y', d => y(d.y))
            .attr('width', d => x(d.x + d.dx) - x(d.x))
            .attr('height', d => y(d.y + d.dy) - y(d.y));
        },

        foreign: foreign => {
          foreign
            .attr('x', d => x(d.x))
            .attr('y', d => y(d.y))
            .attr('width', d => x(d.x + d.dx) - x(d.x))
            .attr('height', d => y(d.y + d.dy) - y(d.y));
        },
      };
    }

    /* Render the treemap and register its transition handler. */
    /**
     * Displays a treemap view and prepares transitions.
     *
     * @param {object} d Node to display.
     * @returns {object} Display state object.
     */
    function _display(d: any): any {
      const displayed_data = d;
      if (_on_handlers.display) {
        _on_handlers.display(d);
      }
      const disp: any = _create_display(d);

      disp.g = _svg
        .insert('g', '.grandparent')
        .datum(d)
        .attr('style', 'cursor: pointer;')
        .attr('class', 'depth');

      /* Bind child node data. */
      _g = disp.g
        .selectAll('g')
        .data(d.children)
        .enter()
        .append('g')
        .on('click', (d, i) => {
          disp.transition(d, i, true);
        })
        .attr('class', 'groups');

      /* Enable transitions when users click child nodes. */
      _g.filter(d => d.children)
        .classed('children', true)
        .on('click', (d, i) => {
          disp.transition(d, i, true);
        });

      /* Render parent rectangles. */
      _g.append('rect')
        .attr('class', 'parent')
        .style('fill', (d, i) => _colors(i))
        .call(disp.rect)
        .on('mouseover', function (d, i) {
          d3.select(this).style('fill', d3.rgb(_colors(i)).darker());
          if (_on_handlers.mouseover) {
            _on_handlers.mouseover(d, i);
          }
        })
        .on('mousemove', (d, i) => {
          if (_on_handlers.mousemove) {
            _on_handlers.mousemove(d, i);
          }
        })
        .on('mouseout', function (d, i) {
          d3.select(this).style('fill', _colors(i));
          if (_on_handlers.mouseout) {
            _on_handlers.mouseout(d, i);
          }
        });

      /* Use foreignObject so labels can wrap. */
      const fo = _g
        .append('foreignObject')
        .call(disp.rect)
        .attr('class', 'foreignobj')
        .append('xhtml:div')
        .attr('class', 'textdiv')
        .on('mouseover', function (d, i) {
          d3.select(this.parentNode.parentNode)
            .select('rect')
            .style('fill', d3.rgb(_colors(i)).darker());
          if (_on_handlers.mouseover) {
            _on_handlers.mouseover(d, i);
          }
        })
        .on('mousemove', (d, i) => {
          if (_on_handlers.mousemove) {
            _on_handlers.mousemove(d, i);
          }
        })
        .on('mouseout', function (d, i) {
          d3.select(this.parentNode.parentNode)
            .select('rect')
            .style('fill', _colors(i));
          if (_on_handlers.mouseout) {
            _on_handlers.mouseout(d, i);
          }
        });

      fo.html((d, i) => _rect_text(d, i));

      /* Create the transition function for this display state. */
      disp.transition =
        /**
         * Runs transition.
         *
         * @param {any} d Input value.
         * @param {any} i Input value.
         * @param {any} direction Input value.
         * @returns {any} Function result.
         */
        (d, i, direction) => {
          if (_transitioning || !d) {
            return;
          }
          if (!d.children) {
            return;
          }
          _transitioning = true;
          if (_on_handlers.transition) {
            _on_handlers.transition(d, i, direction);
          }
          /* Use this fallback span for items that are too small for the treemap layout. */
          const small_span = {x: 0.99, dx: 0.01, y: 0.99, dy: 0.01};
          let span1 = d.visible ? d : small_span;
          let span2 = disp.d.visible ? disp.d : small_span;

          if (i < -1) {
            span1 = small_span;
            span2 = small_span;
          }

          /* Create the next display and initialize its coordinate domains. */
          const disp2 = _display(d);
          if (direction) {
            disp2.x.domain([
              (-1.0 * span1.x) / span1.dx,
              (1.0 - span1.x) / span1.dx,
            ]);
            disp2.y.domain([
              (-1.0 * span1.y) / span1.dy,
              (1.0 - span1.y) / span1.dy,
            ]);
          } else {
            /* Map the new display around the currently visible display. */
            disp2.x.domain([span2.x, span2.x + span2.dx]);
            disp2.y.domain([span2.y, span2.y + span2.dy]);
          }
          /* Fade-in entering text. */
          disp2.g.selectAll('text').style('fill-opacity', 0);

          /* Transition to the new view. */
          disp2.g.selectAll('text').call(disp2.text).style('fill-opacity', 0);
          disp2.g.selectAll('rect').call(disp2.rect).style('fill-opacity', 0);

          disp2.g.selectAll('.textdiv').style('display', 'block');
          disp2.g.selectAll('.foreignobj').call(disp2.foreign);

          const t1 = disp.g.transition().duration(750);
          const t2 = disp2.g.transition().duration(750);

          /* Update domains to match the state at transition end. */
          if (direction) {
            /* Expand the current display past the bounds while moving in. */
            disp.x.domain([span1.x, span1.x + span1.dx]);
            disp.y.domain([span1.y, span1.y + span1.dy]);
          } else {
            /* Shrink the current display to fit within bounds while moving out. */

            disp.x.domain([
              (-1.0 * span2.x) / span2.dx,
              (1.0 - span2.x) / span2.dx,
            ]);
            disp.y.domain([
              (-1.0 * span2.y) / span2.dy,
              (1.0 - span2.y) / span2.dy,
            ]);
          }
          /* Set the new display to fill the entire square. */
          disp2.x.domain([0, 1.0]);
          disp2.y.domain([0, 1.0]);

          /* Enable anti-aliasing during the transition. */
          _svg.style('shape-rendering', null);

          /* Draw child nodes on top of parent nodes. */
          if (direction) {
            _svg.selectAll('.depth').sort((a, b) => b.depth - a.depth);
          } else {
            _svg.selectAll('.depth').sort((a, b) => a.depth - b.depth);
          }

          // Transition to the new view.
          t1.selectAll('text').call(disp.text).style('fill-opacity', 0);
          t2.selectAll('text').call(disp2.text).style('fill-opacity', 1);
          t1.selectAll('rect')
            .call(disp.rect)
            .style('fill-opacity', 0)
            .style('stroke-opacity', 0);
          t2.selectAll('rect')
            .call(disp2.rect)
            .style('fill-opacity', 1)
            .style('stroke-opacity', 1);

          t1.selectAll('.textdiv').style('display', 'none');
          t1.selectAll('.foreignobj').call(disp.foreign);
          t2.selectAll('.textdiv').style('display', 'block');
          t2.selectAll('.foreignobj').call(disp2.foreign);

          /* Remove the old node when the transition is finished. */
          t1.remove().each('end', () => {
            _transitioning = false;
          });
          t1.select('.depth').remove();

          _transitioning = false;
          _current_display = disp2;
        };

      return disp;
    }

    /* Recursively lay out nodes inside a normalized 1x1 square. */
    /**
     * Recursively lays out node descendants in normalized coordinates.
     *
     * @param {object} d Node to layout.
     * @returns {void}
     */
    function _layout(d) {
      if (d.values) {
        /* Layout only up to the configured maximum number of children. */
        d.values.sort((a, b) => _get_value(b) - _get_value(a));
        d.children = d.values.slice(0, _max_rects);
        _treemap.nodes({children: d.children});
        d.children.forEach(c => {
          /* Move each child position to the top-left coordinate system. */
          c.x = 1.0 - (c.x + c.dx);
          c.y = 1.0 - (c.y + c.dy);
          c.visible = true;
        });
        d.values.slice(_max_rects).forEach(c => {
          c.x = 0.0;
          c.y = 0.0;
          c.dx = 1.0;
          c.dy = 1.0;
          c.visible = false;
        });
        d.values.forEach(c => {
          /* Restore parent references after d3 treemap processing. */
          c.parent = d;
          _layout(c);
        });
      }
      d.area = d.dx * d.dy;
    }

    return {
      /* Expose layout settings. */
      width: function () {
        if (arguments.length == 0) {
          return _width;
        } else {
          _width = arguments[0];
          return this;
        }
      },

      height: function () {
        if (arguments.length == 0) {
          return _height;
        } else {
          _height = arguments[0];
          return this;
        }
      },

      value: function () {
        if (arguments.length == 0) {
          return _get_value;
        } else {
          _get_value = arguments[0];
          return this;
        }
      },

      rects: function () {
        if (arguments.length == 0) {
          return _max_rects;
        } else {
          _max_rects = arguments[0];
          return this;
        }
      },

      on: function (eventname, eventfunc) {
        _on_handlers[eventname] = eventfunc;
        return this;
      },

      rect_text: function () {
        if (arguments.length == 0) {
          return _rect_text;
        } else {
          _rect_text = arguments[0];
          return this;
        }
      },

      data: function () {
        if (arguments.length == 0) {
          return _data;
        } else {
          _data = arguments[0];
          _root = _data;
          while (_root.parent) {
            _root = _root.parent;
          }
          return this;
        }
      },

      colors: function () {
        if (arguments.length == 0) {
          return _colors;
        } else {
          _colors = arguments[0];
          return this;
        }
      },

      display: function (element, d) {
        _treemap = d3.layout
          .treemap()
          .round(false)
          .value(_get_value)
          .sort((a, b) => b.value - a.value);

        // Accept either a d3 scale function or a plain color array.
        // This keeps old callers working and supports simpler integrations.
        if (_colors && _colors instanceof Array) {
          _colors = d3.scale.ordinal().range(_colors);
        }
        if (!_colors) {
          _colors = d3.scale.category10().domain([0, _max_rects]);
        }

        /* Create the SVG container. */
        _svg = element
          .append('svg')
          .attr('class', 'treemap')
          .attr('width', _width)
          .attr('height', _height)
          .append('g')
          .attr(
            'transform',
            'translate(' + _margin.left + ',' + _margin.top + ')',
          )
          .style('shape-rendering', 'crispEdges');

        _grandparent = _svg.append('g').attr('class', 'grandparent');

        _grandparent
          .append('text')
          .attr('x', 6)
          .attr('y', 6 - _margin.top)
          .attr('dy', '.75em');

        _initialize(_data);
        _layout(_data);
        _current_display = _display(d || _data);

        return this;
      },

      node: () => _current_display.d,

      transition: function (d, i, dir) {
        if (arguments.length < 3) {
          dir = true;
        }
        _current_display.transition(d, i, dir);
        return this;
      },
    };
  };
})(ob.display);
