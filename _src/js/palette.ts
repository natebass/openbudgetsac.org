/* eslint-disable no-shadow-restricted-names, no-var */
var ob = ob || {};
ob.palette = ob.palette || {}

;(function(namespace, undefined) {
  /**
   * Creates a stack-based palette helper.
   *
   * @returns {{_stack:Array,transform:function,palette:function,shift:function,unshift:function}}
   * Palette API.
   */
  namespace.stack = function() {
    /**
     * Builds a darker linear scale from a source color.
     *
     * @param {string} color CSS color string.
     * @param {number} count Number of bins.
     * @returns {*} d3 linear color scale.
     */
    let _transform = function(color, count) {
      color = d3.rgb(color);
      const new_color = d3.scale.linear()
        .domain([0, count])
        .range([color, color.darker(2.0)]);
      return new_color;
    };

    const _default_palette = d3.scale.ordinal().range([
      '#D9CEB2',
      '#948C75',
      '#D5DED9',
      '#7A6A53',
      '#99B2B7',
    ]);

    return {
      _stack: [_default_palette],

      /**
       * Gets/sets the transform used to derive nested palettes.
       *
       * @returns {*}
       */
      transform: function() {
        if (arguments.length === 0) {
          return _transform;
        }
        _transform = arguments[0];
        return this;
      },

      /**
       * Gets/sets the current top palette.
       *
       * @returns {*}
       */
      palette: function() {
        if (arguments.length === 0) {
          if (this._stack.length > 0) {
            // Use the newest palette first so nested levels inherit deeper shades.
            return this._stack[0];
          }
          return null;
        }
        this._stack[this._stack.length - 1] = arguments[0];
        return this;
      },

      /**
       * Removes the active palette from the stack.
       *
       * @returns {void}
       */
      shift: function() {
        this._stack.shift();
      },

      /**
       * Pushes a derived palette to the front of the stack.
       *
       * @param {string} color Base color.
       * @param {number} count Depth/size hint.
       * @returns {void}
       */
      unshift: function(color, count) {
        this._stack.unshift(_transform(color, count));
      },
    };
  };
})(ob.palette);
