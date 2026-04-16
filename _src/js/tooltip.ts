/* eslint-disable no-shadow-restricted-names, no-var */
var ob = ob || {};
ob.display = ob.display || {}

;(function(namespace, undefined) {
  /**
   * Creates a floating tooltip helper.
   *
   * @returns {{html:function,show:function,track:function,hide:function}} Tooltip API.
   */
  namespace.tooltip = function() {
    let _html = null;
    const _tooltip = d3.select('body')
      .append('div')
      .style('position', 'absolute')
      .style('z-index', '10')
      .style('visibility', 'hidden')
      .attr('id', 'tooltip')
      .text('a simple tooltip');
    const _offset = {top: -10, left: 10};

    return {
      /**
       * Gets/sets tooltip html renderer.
       *
       * @returns {*}
       */
      html: function() {
        if (arguments.length === 0) {
          return _html;
        }
        _html = arguments[0];
        return this;
      },

      /**
       * Shows tooltip and updates content.
       *
       * @returns {*}
       */
      show: function() {
        _tooltip.style('visibility', 'visible');
        if (_html) {
          try {
            _tooltip.html(_html.apply(this, arguments));
          } catch (error) {
            console.error('Tooltip render error', error);
            _tooltip.text('');
          }
        }
        return this;
      },

      /**
       * Repositions tooltip near the pointer.
       *
       * @returns {void}
       */
      track: function() {
        // Legacy d3 handlers expose a global `event`; guard for modern browsers.
        const pointerEvent = event as MouseEvent | undefined;
        if (typeof pointerEvent === 'undefined' || !pointerEvent) {
          return;
        }
        const width = parseFloat(_tooltip.style('width'));
        const window_width = window.innerWidth;
        let left = pointerEvent.pageX + _offset.left;
        if ((left + width) > window_width) {
          left = window_width - width;
        }
        _tooltip.style('top', (pointerEvent.pageY + _offset.top) + 'px')
          .style('left', left + 'px');
      },

      /**
       * Hides tooltip.
       *
       * @returns {*}
       */
      hide: function() {
        _tooltip.style('visibility', 'hidden');
        return this;
      },
    };
  };
})(ob.display);
