/* eslint-disable no-shadow-restricted-names, no-var */
var ob = ob || {};

((namespace, undefined) => {
  namespace.hash =
    /**
     * Checks whether hash.
     *
     * @returns {any} Function result.
     */
    () => {
      let _s = '.';

      return {
        separator: s => {
          _s = s;
        },
        parse: () => {
          if (window.location.hash.length < 2) {
            return [];
          }
          let str = window.location.hash;
          str = str.replace('#', '');
          const keys = str
            .split(_s)
            .map(segment => {
              try {
                return decodeURIComponent(segment);
              } catch (error) {
                // Ignore malformed segments so one bad value does not break page load.
                console.warn(
                  'Ignoring malformed hash segment. URL hash appears invalid.',
                  error,
                );
                return '';
              }
            })
            .filter(segment => segment.length > 0);
          return keys;
        },
        set: keys => {
          if (!Array.isArray(keys)) {
            return;
          }
          const safeHash = keys
            .map(segment => encodeURIComponent(String(segment)))
            .join(_s);
          window.location.hash = safeHash;
        },
      };
    };
})(ob);
