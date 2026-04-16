// Legacy treemap runtime for archived OpenSpending pages.
// Keep behavior stable unless you can verify all legacy routes end to end.
OpenSpending = 'OpenSpending' in window ? OpenSpending : {};

(function($) {
  /**
   * Runs escape html.
   *
   * @param {any} value Input value.
   * @returns {any} Function result.
   */
  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * Runs safe navigate.
   *
   * @param {any} rawUrl Input value.
   * @returns {any} Function result.
   */
  function safeNavigate(rawUrl) {
    try {
      const parsed = new URL(rawUrl, window.location.origin);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        // Legacy widget nodes may contain external links; only allow http(s).
        document.location.href = parsed.toString();
      }
    } catch (error) {
      console.error('Blocked unsafe navigation target', error);
    }
  }

  OpenSpending.Treemap = /**
   * Runs treemap.
   *
   * @param {any} elem Input value.
   * @param {any} context Input value.
   * @param {any} state Input value.
   * @returns {any} Function result.
   */
function(elem, context, state) {
  const self = this;

  const resources = [
    OpenSpending.scriptRoot + '/widgets/treemap/js/thejit-2.min.js',
    OpenSpending.scriptRoot + '/widgets/treemap/css/treemap.css',
  ];

  if ($.browser.msie) {
    resources.push(OpenSpending.scriptRoot + '/widgets/treemap/js/excanvas.js');
  }

  self.context = _.extend({
    click: function(node) {
      if (node.data.link) {
        const link = context.embed ? node.data.link + '?embed=true' : node.data.link;
        safeNavigate(link);
      }
    },
    hasClick: function(node) {
      return node.data.link !== undefined;
    },
    createLabel: function(widget, domElement, node) {
      if ((node.data.value / self.total) > 0.03) {
        domElement.innerHTML = '<div class=\'desc\'><div class=\'amount\'>' + escapeHtml(OpenSpending.Utils.formatAmountWithCommas(node.data.value, 0, self.currency)) + '</div><div class=\'lbl\'>' + escapeHtml(node.name) + '</div></div>';
      }
    },
    tooltipMessage: function(widget, node) {
      const percentualValue = (node.data.value * 100) / widget.total;
      return node.name + ' (' + OpenSpending.Utils.formatAmountWithCommas(percentualValue, 2) + '%)';
    },
    drilldown: function(node) {
      self.drilldown(node);
    },
  }, context);
  self.state = state;

  this.configure = /**
     * Runs configure.
     *
     * @param {any} endConfigure Input value.
     * @returns {any} Function result.
     */
function(endConfigure) {
  self.$qb.empty();
  self.qbWidget = new OpenSpending.Widgets.QueryBuilder(
    self.$qb, self.update, endConfigure, self.context, [
      {
        variable: 'drilldowns',
        label: 'Tiles:',
        type: 'select',
        default: self.state.drilldowns,
        help: 'Each selected dimension will display as an additional level of tiles for the treemap.',
      },
      {
        variable: 'year',
        label: 'Year:',
        type: 'slider',
        dimension: 'time',
        attribute: 'year',
        default: self.state.year,
        help: 'Filter by year.',
      },
      {
        variable: 'cuts',
        label: 'Filters:',
        type: 'cuts',
        default: self.state.cuts,
        help: 'Limit the set of data to display.',
      },
    ],
  );
};

  this.update = /**
     * Sets update.
     *
     * @param {any} state Input value.
     * @returns {any} Function result.
     */
function(state) {
  self.state = state;
  self.state.drilldowns = self.state.drilldowns || [self.state.drilldown];
  self.state.cuts = self.state.cuts || {};

  const cuts = [];
  for (const field in self.state.cuts) {
    cuts.push(field + ':' + self.state.cuts[field]);
  }

  if (self.state.year) {
    cuts.push('time.year:' + self.state.year);
  }

  if (typeof self.context.member !== 'undefined' && typeof self.context.dimension !== 'undefined') {
    cuts.push(self.context.dimension + ':' + self.context.member);
  }

  if (self.state.drilldowns) {
    self.aggregator = new OpenSpending.Aggregator({
      siteUrl: self.context.siteUrl,
      dataset: self.context.dataset,
      drilldowns: self.state.drilldowns,
      cuts,
      rootNodeLabel: 'Total',
      callback: function(data) {
        self.setDataFromAggregator(this.dataset, data);
      },
    });
  }
};

  this.getDownloadURL = /**
     * Gets get download url.
     *
     * @returns {any} Function result.
     */
function() {
  return self.aggregator.getCSVURL();
};

  this.serialize = /**
     * Runs serialize.
     *
     * @returns {any} Function result.
     */
function() {
  return self.state;
};

  this.init = /**
     * Runs init.
     *
     * @returns {any} Function result.
     */
function() {
  self.$e = elem;
  self.$e.before('<div class="treemap-qb"></div>');
  self.$qb = elem.prev();
  self.$e.addClass('treemap-widget');
  self.update(state);
};

  this.setDataFromAggregator = /**
     * Sets set data from aggregator.
     *
     * @param {any} dataset Input value.
     * @param {any} data Input value.
     * @returns {any} Function result.
     */
function(dataset, data) {
  self.currency = data.currency;
  self.setNode(data);
};

  this.setNode = /**
     * Sets set node.
     *
     * @param {any} node Input value.
     * @returns {any} Function result.
     */
function(node) {
  let needsColorization = true;
  self.total = node.amount;
  self.data = {
    children: _.map(node.children, function(item) {
      if (item.color) {needsColorization = false;}
      return {
        children: [],
        id: item.id,
        name: item.label || item.name,
        data: {
          node: item,
          value: item.amount,
          $area: item.amount,
          title: item.label || item.name,
          link: item.html_url,
          name: item.name,
          $color: item.color || '#333333',
        },
      };
    }),
  };

  if (needsColorization) {
    // Older OpenSpending payloads do not include node colors.
    this.autoColorize();
  }
  self.draw();
};

  this.drilldown = /**
     * Runs drilldown.
     *
     * @param {any} tile Input value.
     * @returns {any} Function result.
     */
function(tile) {
  if (!tile.data.node.children.length) {
    self.context.click(tile);
  } else {
    self.setNode(tile.data.node);
  }
};

  this.autoColorize = /**
     * Runs auto colorize.
     *
     * @returns {any} Function result.
     */
function() {
  const nodes = self.data.children.length;
  const colors = OpenSpending.Utils.getColorPalette(nodes);
  for (let i = 0; i < nodes; i++) {
    self.data.children[i].data.$color = colors[i];
  }
};

  this.draw = /**
     * Runs draw.
     *
     * @returns {any} Function result.
     */
function() {
  self.$e.empty();
  if (!self.data.children.length) {
    $(self.$e).hide();
    return;
  }
  $(self.$e).show();
  self.tm = new $jit.TM.Squarified({
    injectInto: self.$e.prop('id'),
    levelsToShow: 1,
    titleHeight: 0,
    animate: true,
    transition: $jit.Trans.Expo.easeOut,

    offset: 2,
    Label: {
      type: 'HTML',
      size: 12,
      family: 'Tahoma, Verdana, Arial',
      color: '#DDE7F0',
    },
    Node: {
      color: '#243448',
      CanvasStyles: {
        shadowBlur: 0,
        shadowColor: '#000',
      },
    },
    Events: {
      enable: true,
      onClick: function(node) {
        if (node) {
          self.context.drilldown(node);
        }
      },
      onRightClick: function() {
        self.tm.out();
      },
      onMouseEnter: function(node, eventInfo) {
        if (node) {
          if (!self.context.hasClick(node)) {
            self.$e.find('#' + node.id).css('cursor', 'default');
          }
          node.setCanvasStyle('shadowBlur', 8);
          node.orig_color = node.getData('color');
          node.setData('color', '#A3B3C7');
          self.tm.fx.plotNode(node, self.tm.canvas);
        }
      },
      onMouseLeave: function(node) {
        if (node) {
          node.removeData('color');
          node.removeCanvasStyle('shadowBlur');
          node.setData('color', node.orig_color);
          self.tm.plot();
        }
      },
    },
    duration: 1000,
    Tips: {
      enable: true,
      type: 'Native',
      offsetX: 20,
      offsetY: 20,
      onShow: function(tip, node, isLeaf, domElement) {
        const html = '<div class="tip-title">' +
                escapeHtml(self.context.tooltipMessage(self, node)) +
                '</div><div class="tip-text">';
        tip.innerHTML = html;
      },
    },
    // Return a pruned subtree for the selected node so the legacy JIT widget
    // can render drill-down views without changing its callback contract.
    request: function(nodeId, level, onComplete) {
      // Keep this legacy hook for JIT compatibility.
      const tree = json;
      const subtree = $jit.json.getSubtree(tree, nodeId);
      $jit.json.prune(subtree, 1);
      onComplete.onComplete(nodeId, subtree);
    },
    // Add a label when the widget creates a DOM node for a treemap cell.
    onCreateLabel: function(domElement, node) {
      self.context.createLabel(self, domElement, node);
    },
  });
  self.tm.loadJSON(this.data);
  self.tm.refresh();
};

  const dfd = $.Deferred();
  dfd.done(function(that) {that.init();});

  if (!window.treemapWidgetLoaded) {
    yepnope({
      load: resources,
      complete: function() {
        window.treemapWidgetLoaded = true;
        dfd.resolve(self);
      },
    });
  } else {
    dfd.resolve(self);
  }

  return dfd.promise();
};
})(jQuery);
