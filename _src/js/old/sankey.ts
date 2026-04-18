// Legacy Sankey layout used by archived pages.
// Keep behavior stable because those pages still depend on this D3 v3 code.
d3.sankey =
  /**
   * Runs sankey.
   *
   * @returns {any} Function result.
   */
  () => {
    const sankey: any = {};
    let nodeWidth = 24;
    let nodePadding = 8;
    let size = [1, 1];
    let nodes: Array<any> = [];
    let links: Array<any> = [];

    sankey.nodeWidth =
      /**
       * Runs node width.
       *
       * @param {any} _ Input value.
       * @returns {any} Function result.
       */
      function (_) {
        if (!arguments.length) {
          return nodeWidth;
        }
        nodeWidth = +_;
        return sankey;
      };

    sankey.nodePadding =
      /**
       * Runs node padding.
       *
       * @param {any} _ Input value.
       * @returns {any} Function result.
       */
      function (_) {
        if (!arguments.length) {
          return nodePadding;
        }
        nodePadding = +_;
        return sankey;
      };

    sankey.nodes =
      /**
       * Runs nodes.
       *
       * @param {any} _ Input value.
       * @returns {any} Function result.
       */
      function (_) {
        if (!arguments.length) {
          return nodes;
        }
        nodes = _;
        return sankey;
      };

    sankey.links =
      /**
       * Runs links.
       *
       * @param {any} _ Input value.
       * @returns {any} Function result.
       */
      function (_) {
        if (!arguments.length) {
          return links;
        }
        links = _;
        return sankey;
      };

    sankey.size =
      /**
       * Runs size.
       *
       * @param {any} _ Input value.
       * @returns {any} Function result.
       */
      function (_) {
        if (!arguments.length) {
          return size;
        }
        size = _;
        return sankey;
      };

    sankey.layout =
      /**
       * Runs layout.
       *
       * @param {any} iterations Input value.
       * @returns {any} Function result.
       */
      iterations => {
        computeNodeLinks();
        computeNodeValues();
        computeNodeBreadths();
        computeNodeDepths(iterations);
        computeLinkDepths();
        return sankey;
      };

    sankey.relayout =
      /**
       * Runs relayout.
       *
       * @returns {any} Function result.
       */
      () => {
        computeLinkDepths();
        return sankey;
      };

    sankey.link =
      /**
       * Runs link.
       *
       * @returns {any} Function result.
       */
      () => {
        let curvature = 0.5;

        /**
         * Runs link.
         *
         * @param {any} d Input value.
         * @returns {any} Function result.
         */
        function link(d) {
          const x0 = d.source.x + d.source.dx;
          const x1 = d.target.x;
          const xi = d3.interpolateNumber(x0, x1);
          const x2 = xi(curvature);
          const x3 = xi(1 - curvature);
          const y0 = d.source.y + d.sy + d.dy / 2;
          const y1 = d.target.y + d.ty + d.dy / 2;
          return (
            'M' +
            x0 +
            ',' +
            y0 +
            'C' +
            x2 +
            ',' +
            y0 +
            ' ' +
            x3 +
            ',' +
            y1 +
            ' ' +
            x1 +
            ',' +
            y1
          );
        }

        link.curvature =
          /**
           * Runs curvature.
           *
           * @param {any} _ Input value.
           * @returns {any} Function result.
           */
          function (_) {
            if (!arguments.length) {
              return curvature;
            }
            curvature = +_;
            return link;
          };

        return link;
      };

    // Fill `sourceLinks` and `targetLinks` for each node.
    // If source or target is not an object, treat it as an index.
    /**
     * Runs compute node links.
     *
     * @returns {any} Function result.
     */
    function computeNodeLinks() {
      nodes.forEach(node => {
        node.sourceLinks = [];
        node.targetLinks = [];
      });
      links.forEach(link => {
        let source = link.source;
        let target = link.target;
        if (typeof source === 'number') {
          source = link.source = nodes[link.source];
        }
        if (typeof target === 'number') {
          target = link.target = nodes[link.target];
        }
        source.sourceLinks.push(link);
        target.targetLinks.push(link);
      });
    }

    // Compute each node value by summing its connected links.
    /**
     * Runs compute node values.
     *
     * @returns {any} Function result.
     */
    function computeNodeValues() {
      nodes.forEach(node => {
        node.value = Math.max(
          d3.sum(node.sourceLinks, value),
          d3.sum(node.targetLinks, value),
        );
      });
    }

    // Assign breadth (`x`) in passes.
    // Use the max incoming breadth plus one.
    // Nodes with no incoming links start at zero.
    // Nodes with no outgoing links move to the last breadth.
    /**
     * Runs compute node breadths.
     *
     * @returns {any} Function result.
     */
    function computeNodeBreadths() {
      let remainingNodes = nodes;
      let nextNodes;
      let x = 0;

      while (remainingNodes.length) {
        nextNodes = [];
        remainingNodes.forEach(node => {
          node.x = x;
          node.dx = nodeWidth;
          node.sourceLinks.forEach(link => {
            nextNodes.push(link.target);
          });
        });
        remainingNodes = nextNodes;
        ++x;
      }

      // `width` comes from the page script and is part of the legacy API.
      // Keep this dependency explicit until this chart is retired.
      moveSinksRight(x);
      scaleNodeBreadths((width - nodeWidth) / (x - 1));
    }

    /**
     * Runs move sinks right.
     *
     * @param {any} x Input value.
     * @returns {any} Function result.
     */
    function moveSinksRight(x) {
      nodes.forEach(node => {
        if (!node.sourceLinks.length) {
          node.x = x - 1;
        }
      });
    }

    /**
     * Runs scale node breadths.
     *
     * @param {any} kx Input value.
     * @returns {any} Function result.
     */
    function scaleNodeBreadths(kx) {
      nodes.forEach(node => {
        node.x *= kx;
      });
    }

    /**
     * Runs compute node depths.
     *
     * @param {any} iterations Input value.
     * @returns {any} Function result.
     */
    function computeNodeDepths(iterations) {
      const nodesByBreadth = d3
        .nest()
        .key(d => d.x)
        .sortKeys(d3.ascending)
        .entries(nodes)
        .map(d => d.values);

      // Initialize positions, then relax node groups in both directions.
      initializeNodeDepth();
      resolveCollisions();
      for (let alpha = 1; iterations > 0; --iterations) {
        relaxRightToLeft((alpha *= 0.99));
        resolveCollisions();
        relaxLeftToRight(alpha);
        resolveCollisions();
      }

      /**
       * Runs initialize node depth.
       *
       * @returns {any} Function result.
       */
      function initializeNodeDepth() {
        const ky = d3.min(
          nodesByBreadth,
          nodes =>
            (size[1] - (nodes.length - 1) * nodePadding) / d3.sum(nodes, value),
        );

        nodesByBreadth.forEach(nodes => {
          nodes.forEach((node, i) => {
            node.y = i;
            node.dy = node.value * ky;
          });
        });

        links.forEach(link => {
          link.dy = link.value * ky;
        });
      }

      /**
       * Runs relax left to right.
       *
       * @param {any} alpha Input value.
       * @returns {any} Function result.
       */
      function relaxLeftToRight(alpha) {
        nodesByBreadth.forEach((nodes, breadth) => {
          nodes.forEach(node => {
            if (node.targetLinks.length) {
              const y =
                d3.sum(node.targetLinks, weightedSource) /
                d3.sum(node.targetLinks, value);
              node.y += (y - center(node)) * alpha;
            }
          });
        });

        /**
         * Runs weighted source.
         *
         * @param {any} link Input value.
         * @returns {any} Function result.
         */
        function weightedSource(link) {
          return center(link.source) * link.value;
        }
      }

      /**
       * Runs relax right to left.
       *
       * @param {any} alpha Input value.
       * @returns {any} Function result.
       */
      function relaxRightToLeft(alpha) {
        nodesByBreadth
          .slice()
          .reverse()
          .forEach(nodes => {
            nodes.forEach(node => {
              if (node.sourceLinks.length) {
                const y =
                  d3.sum(node.sourceLinks, weightedTarget) /
                  d3.sum(node.sourceLinks, value);
                node.y += (y - center(node)) * alpha;
              }
            });
          });

        /**
         * Runs weighted target.
         *
         * @param {any} link Input value.
         * @returns {any} Function result.
         */
        function weightedTarget(link) {
          return center(link.target) * link.value;
        }
      }

      /**
       * Gets resolve collisions.
       *
       * @returns {any} Function result.
       */
      function resolveCollisions() {
        nodesByBreadth.forEach(nodes => {
          let node;
          let dy;
          let y0 = 0;
          const n = nodes.length;
          let i;

          // Push overlapping nodes down.
          nodes.sort(ascendingDepth);
          for (i = 0; i < n; ++i) {
            node = nodes[i];
            dy = y0 - node.y;
            if (dy > 0) {
              node.y += dy;
            }
            y0 = node.y + node.dy + nodePadding;
          }

          // If the last node exceeds bounds, push it back up.
          dy = y0 - nodePadding - size[1];
          if (dy > 0) {
            y0 = node.y -= dy;

            // Push overlapping nodes back up.
            for (i = n - 2; i >= 0; --i) {
              node = nodes[i];
              dy = node.y + node.dy + nodePadding - y0;
              if (dy > 0) {
                node.y -= dy;
              }
              y0 = node.y;
            }
          }
        });
      }

      /**
       * Runs ascending depth.
       *
       * @param {any} a Input value.
       * @param {any} b Input value.
       * @returns {any} Function result.
       */
      function ascendingDepth(a, b) {
        return a.y - b.y;
      }
    }

    /**
     * Runs compute link depths.
     *
     * @returns {any} Function result.
     */
    function computeLinkDepths() {
      // Keep link stacking stable so hover targets do not jump between renders.
      nodes.forEach(node => {
        node.sourceLinks.sort(ascendingTargetDepth);
        node.targetLinks.sort(ascendingSourceDepth);
      });
      nodes.forEach(node => {
        let sy = 0;
        let ty = 0;
        node.sourceLinks.forEach(link => {
          link.sy = sy;
          sy += link.dy;
        });
        node.targetLinks.forEach(link => {
          link.ty = ty;
          ty += link.dy;
        });
      });

      /**
       * Runs ascending source depth.
       *
       * @param {any} a Input value.
       * @param {any} b Input value.
       * @returns {any} Function result.
       */
      function ascendingSourceDepth(a, b) {
        return a.source.y - b.source.y;
      }

      /**
       * Runs ascending target depth.
       *
       * @param {any} a Input value.
       * @param {any} b Input value.
       * @returns {any} Function result.
       */
      function ascendingTargetDepth(a, b) {
        return a.target.y - b.target.y;
      }
    }

    /**
     * Runs center.
     *
     * @param {any} node Input value.
     * @returns {any} Function result.
     */
    function center(node) {
      return node.y + node.dy / 2;
    }

    /**
     * Runs value.
     *
     * @param {any} link Input value.
     * @returns {any} Function result.
     */
    function value(link) {
      return link.value;
    }

    return sankey;
  };
