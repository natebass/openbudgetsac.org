/* eslint-disable no-shadow-restricted-names, no-var */
var ob = ob || {};

((namespace, undefined) => {
  /**
   * Checks whether is safe identifier.
   *
   * @param {any} value Input value.
   * @returns {any} Function result.
   */
  function isSafeIdentifier(value) {
    return typeof value === 'string' && /^[A-Za-z0-9_. -]+$/.test(value);
  }

  namespace.fusion =
    /**
     * Runs fusion.
     *
     * @param {any} api_key Input value.
     * @param {any} table_id Input value.
     * @returns {any} Function result.
     */
    (api_key, table_id) => ({
      key: api_key,
      table: table_id,

      url: function (hierarchy, sum) {
        if (!Array.isArray(hierarchy) || !hierarchy.every(isSafeIdentifier)) {
          throw new Error('Unsafe hierarchy fields passed to fusion.url');
        }
        if (sum && !isSafeIdentifier(sum)) {
          throw new Error('Unsafe sum field passed to fusion.url');
        }

        // Fusion Tables SQL requires single-quoted column names.
        const columns = hierarchy.map(x => "'" + x + "'");

        // Build a grouped aggregate query for the treemap hierarchy.
        let query = 'SELECT ' + columns.join(',');
        if (sum) {
          query += ',Sum(' + sum + ')';
        }
        query += ' FROM ' + this.table + ' GROUP BY ' + columns.join(',');

        // Encode once so user-provided identifiers cannot break URL structure.
        query = encodeURIComponent(query);

        // Keep this endpoint for backward compatibility with archived datasets.
        let url = 'https://www.googleapis.com/fusiontables/v1/';
        url += 'query?sql=' + query;
        url += '&key=' + this.key;
        return url;
      },
    });
})(ob);
