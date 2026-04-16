/* eslint-disable no-shadow-restricted-names, no-var */
var ob = ob || {}

;(function(namespace, undefined) {
  namespace.hash = /**
   * Checks whether hash.
   *
   * @returns {any} Function result.
   */
function() {
  let _s = '.';

  return {
    separator: function(s) {
      _s = s;
    },
    parse: function() {
      if (window.location.hash.length < 2) {
        return [];
      }
      let str = window.location.hash;
      str = str.replace('#', '');
      const keys = str.split(_s).map(function(segment) {
        try {
          return decodeURIComponent(segment);
        } catch (error) {
          // Ignore malformed segments so one bad value does not break page load.
          console.warn('Ignoring malformed hash segment. URL hash appears invalid.', error);
          return '';
        }
      }).filter(function(segment) {
        return segment.length > 0;
      });
      return keys;
    },
    set: function(keys) {
      if (!Array.isArray(keys)) {
        return;
      }
      const safeHash = keys.map(function(segment) {
        return encodeURIComponent(String(segment));
      }).join(_s);
      window.location.hash = safeHash;
    },

  };
};
})(ob);
