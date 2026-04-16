/**
 * Creates a d3 sankey layout instance.
 *
 * @returns {object} Sankey layout API.
 */
d3.sankey = () => {
  const sankey: any = {};
  let nodeWidth = 24;
  let nodePadding = 8;
  let size = [1, 1];
  let nodes: Array<any> = [];
  let links: Array<any> = [];

  sankey.nodeWidth = function (_) {
    if (!arguments.length) {
      return nodeWidth;
    }
    nodeWidth = +_;
    return sankey;
  };

  sankey.nodePadding = function (_) {
    if (!arguments.length) {
      return nodePadding;
    }
    nodePadding = +_;
    return sankey;
  };

  sankey.nodes = function (_) {
    if (!arguments.length) {
      return nodes;
    }
    nodes = _;
    return sankey;
  };

  sankey.links = function (_) {
    if (!arguments.length) {
      return links;
    }
    links = _;
    return sankey;
  };

  sankey.size = function (_) {
    if (!arguments.length) {
      return size;
    }
    size = _;
    return sankey;
  };

  sankey.layout = iterations => {
    computeNodeLinks();
    computeNodeValues();
    computeNodeBreadths();
    computeNodeDepths(iterations);
    computeLinkDepths();
    return sankey;
  };

  sankey.relayout = () => {
    computeLinkDepths();
    return sankey;
  };

  sankey.link = () => {
    let curvature = 0.5;

    /**
     * Generates a cubic Bézier path for a sankey link.
     *
     * @param {{source:object,target:object,sy:number,ty:number,dy:number}} d Link datum.
     * @returns {string} SVG path command.
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

    link.curvature = function (_) {
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
   * Populates `sourceLinks` and `targetLinks` for each node.
   *
   * @returns {void}
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
   * Computes each node value from incoming/outgoing link totals.
   *
   * @returns {void}
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
   * Assigns horizontal breadth (`x`) positions for each node.
   *
   * @returns {void}
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

    // `width` is a legacy global from `flow.ts`.
    // Keep this coupling explicit so refactors do not break node placement.
    moveSinksRight(x);
    scaleNodeBreadths((width - nodeWidth) / (x - 1));
  }

  /**
   * Moves sink nodes to the right-most column.
   *
   * @param {number} x Max breadth index.
   * @returns {void}
   */
  function moveSinksRight(x) {
    nodes.forEach(node => {
      if (!node.sourceLinks.length) {
        node.x = x - 1;
      }
    });
  }

  /**
   * Scales node breadth coordinates to pixel units.
   *
   * @param {number} kx Scaling factor.
   * @returns {void}
   */
  function scaleNodeBreadths(kx) {
    nodes.forEach(node => {
      node.x *= kx;
    });
  }

  /**
   * Computes vertical positions and heights for nodes.
   *
   * @param {number} iterations Relaxation iterations.
   * @returns {void}
   */
  function computeNodeDepths(iterations) {
    const nodesByBreadth = d3
      .nest()
      .key(d => d.x)
      .sortKeys(d3.ascending)
      .entries(nodes)
      .map(d => d.values);

    initializeNodeDepth();
    resolveCollisions();
    centerFunds();
    for (let alpha = 1; iterations > 0; --iterations) {
      relaxRightToLeft((alpha *= 0.99));
      resolveCollisions();
      relaxLeftToRight(alpha);
      resolveCollisions();
    }

    /**
     * Initializes node/link depths before relaxation passes.
     *
     * @returns {void}
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
     * Relaxes node depth from left to right.
     *
     * @param {number} alpha Relaxation coefficient.
     * @returns {void}
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
       * Calculates weighted source center by link value.
       *
       * @param {object} link Sankey link.
       * @returns {number} Weighted source center.
       */
      function weightedSource(link) {
        return center(link.source) * link.value;
      }
    }

    /**
     * Relaxes node depth from right to left.
     *
     * @param {number} alpha Relaxation coefficient.
     * @returns {void}
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
       * Calculates weighted target center by link value.
       *
       * @param {object} link Sankey link.
       * @returns {number} Weighted target center.
       */
      function weightedTarget(link) {
        return center(link.target) * link.value;
      }
    }

    /**
     * Resolves overlapping nodes within each breadth column.
     *
     * @returns {void}
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
     * Sort comparator for y-position.
     *
     * @param {object} a Node A.
     * @param {object} b Node B.
     * @returns {number} Sort order.
     */
    function ascendingDepth(a, b) {
      return a.y - b.y;
    }

    // Keep the two fund nodes separated for readability.
    // This assumes the fund column always has exactly two nodes.
    /**
     * Applies custom vertical centering for fund nodes.
     *
     * @returns {void}
     */
    function centerFunds() {
      // Compute extra vertical space after assigning fund node heights.
      const funds = nodesByBreadth[2];
      let vpad = sankey.size()[1] - sankey.nodePadding();
      funds.forEach((node, i) => {
        vpad -= node.dy;
      });

      // Bias spacing away from the middle so crossing links are easier to follow.
      funds[0].y += vpad / 3;
      funds[1].y += (vpad / 3) * 2;
    }
  }

  /**
   * Computes `sy` and `ty` offsets for link stacking.
   *
   * @returns {void}
   */
  function computeLinkDepths() {
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
     * Sort comparator by source y-position.
     *
     * @param {object} a Link A.
     * @param {object} b Link B.
     * @returns {number} Sort order.
     */
    function ascendingSourceDepth(a, b) {
      return a.source.y - b.source.y;
    }

    /**
     * Sort comparator by target y-position.
     *
     * @param {object} a Link A.
     * @param {object} b Link B.
     * @returns {number} Sort order.
     */
    function ascendingTargetDepth(a, b) {
      return a.target.y - b.target.y;
    }
  }

  /**
   * Computes vertical center for a node.
   *
   * @param {object} node Sankey node.
   * @returns {number} Center y coordinate.
   */
  function center(node) {
    return node.y + node.dy / 2;
  }

  /**
   * Value accessor for links.
   *
   * @param {{value:number}} link Sankey link.
   * @returns {number} Link value.
   */
  function value(link) {
    return link.value;
  }

  return sankey;
};
