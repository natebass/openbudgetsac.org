/*
 * JQuery URL Parser plugin, v2.2.1
 * Developed and maintained by Mark Perkins, mark@allmarkedup.com
 * Source repository: https://github.com/allmarkedup/jQuery-URL-Parser
 * Licensed under an MIT-style license. See https://github.com/allmarkedup/jQuery-URL-Parser/blob/master/LICENSE for details.
 */
// This is a legacy third-party parser that older pages still load.
// Do not refactor this logic unless you verify legacy query-string behavior end to end.

(factory => {
  if (typeof define === 'function' && define.amd) {
    // AMD is available, so use an anonymous module.
    if (typeof jQuery !== 'undefined') {
      define(['jquery'], factory);
    } else {
      define([], factory);
    }
  } else {
    // AMD is not available, so write to globals.
    if (typeof jQuery !== 'undefined') {
      factory(jQuery);
    } else {
      factory();
    }
  }
})(($?: JQueryStatic) => {
  const tag2attr = {
    a: 'href',
    img: 'src',
    form: 'action',
    base: 'href',
    script: 'src',
    iframe: 'src',
    link: 'href',
  };

  const key = [
    'source',
    'protocol',
    'authority',
    'userInfo',
    'user',
    'password',
    'host',
    'port',
    'relative',
    'path',
    'directory',
    'file',
    'query',
    'fragment',
  ]; // Keys callers can request.

  const aliases = {anchor: 'fragment'}; // Backward-compatibility aliases.

  const parser = {
    // `strict` follows URL rules more closely.
    strict:
      /^(?:([^:/?#]+):)?(?:\/\/((?:(([^:@]*):?([^:@]*))?@)?([^:/?#]*)(?::(\d*))?))?((((?:[^?#/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/, // Less intuitive, but closer to the spec.
    // `loose` accepts informal URLs but is less standards-compliant.
    loose:
      /^(?:(?![^:@]+:[^:@/]*@)([^:/?#.]+):)?(?:\/\/)?((?:(([^:@]*):?([^:@]*))?@)?([^:/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#/]*\.[^?#/.]+(?:[?#]|$)))*\/?)?([^?#/]*))(?:\?([^#]*))?(?:#(.*))?)/, // More intuitive, but fails on some relative paths.
  };

  const isint = /^[0-9]+$/;

  /**
   * Gets parse uri.
   *
   * @param {any} url Input value.
   * @param {any} strictMode Input value.
   * @returns {any} Function result.
   */
  function parseUri(url: string, strictMode?: boolean): any {
    const str = decodeURI(url);
    const res = parser[strictMode || false ? 'strict' : 'loose'].exec(str);
    const uri: any = {attr: {}, param: {}, seg: {}};
    let i = 14;

    while (i--) {
      uri.attr[key[i]] = res[i] || '';
    }

    // Build query and fragment parameters.
    uri.param.query = parseString(uri.attr.query);
    uri.param.fragment = parseString(uri.attr.fragment);

    // Split path and fragment into segments.
    uri.seg.path = uri.attr.path.replace(/^\/+|\/+$/g, '').split('/');
    uri.seg.fragment = uri.attr.fragment.replace(/^\/+|\/+$/g, '').split('/');

    // Build the base domain attribute.
    uri.attr.base = uri.attr.host
      ? (uri.attr.protocol
          ? uri.attr.protocol + '://' + uri.attr.host
          : uri.attr.host) + (uri.attr.port ? ':' + uri.attr.port : '')
      : '';

    return uri;
  }

  /**
   * Gets get attr name.
   *
   * @param {any} elm Input value.
   * @returns {any} Function result.
   */
  function getAttrName(elm: Element): string | undefined {
    const tn = elm.tagName;
    if (typeof tn !== 'undefined') {
      return tag2attr[tn.toLowerCase()];
    }
    return tn;
  }

  /**
   * Runs promote.
   *
   * @param {any} parent Input value.
   * @param {any} key Input value.
   * @returns {any} Function result.
   */
  function promote(
    parent: Record<string, any>,
    key: string,
  ): Record<string, any> {
    if (parent[key].length === 0) {
      parent[key] = {};
      return parent[key];
    }
    const t = {};
    for (const i in parent[key]) {
      t[i] = parent[key][i];
    }
    parent[key] = t;
    return t;
  }

  /**
   * Gets parse.
   *
   * @param {any} parts Input value.
   * @param {any} parent Input value.
   * @param {any} key Input value.
   * @param {any} val Input value.
   * @returns {any} Function result.
   */
  function parse(
    parts: Array<string>,
    parent: Record<string, any>,
    key: string,
    val: any,
  ): void {
    let part = parts.shift();
    if (!part) {
      if (isArray(parent[key])) {
        parent[key].push(val);
      } else if (typeof parent[key] === 'object') {
        parent[key] = val;
      } else if (typeof parent[key] === 'undefined') {
        parent[key] = val;
      } else {
        parent[key] = [parent[key], val];
      }
    } else {
      let obj = (parent[key] = parent[key] || []);
      if (part === ']') {
        if (isArray(obj)) {
          if (val !== '') {
            obj.push(val);
          }
        } else if (typeof obj === 'object') {
          obj[keys(obj).length] = val;
        } else {
          parent[key] = [parent[key], val];
        }
      } else if (~part.indexOf(']')) {
        part = part.substr(0, part.length - 1);
        if (!isint.test(part) && isArray(obj)) {
          obj = promote(parent, key);
        }
        parse(parts, obj, part, val);
      } else {
        if (!isint.test(part) && isArray(obj)) {
          obj = promote(parent, key);
        }
        parse(parts, obj, part, val);
      }
    }
  }

  /**
   * Runs merge.
   *
   * @param {any} parent Input value.
   * @param {any} key Input value.
   * @param {any} val Input value.
   * @returns {any} Function result.
   */
  function merge(
    parent: Record<string, any>,
    key: string,
    val: any,
  ): Record<string, any> {
    if (~key.indexOf(']')) {
      const parts = key.split('[');
      parse(parts, parent, 'base', val);
    } else {
      if (!isint.test(key) && isArray(parent.base)) {
        const t = {};
        for (const k in parent.base) {
          t[k] = parent.base[k];
        }
        parent.base = t;
      }
      set(parent.base, key, val);
    }
    return parent;
  }

  /**
   * Gets parse string.
   *
   * @param {any} str Input value.
   * @returns {any} Function result.
   */
  function parseString(str: string): Record<string, any> {
    return reduce(
      String(str).split(/&|;/),
      (ret, pair) => {
        try {
          pair = decodeURIComponent(pair.replace(/\+/g, ' '));
        } catch (e) {
          // Ignore invalid escape sequences and keep parsing.
        }
        const eql = pair.indexOf('=');
        const brace = lastBraceInKey(pair);
        let key = pair.substr(0, brace || eql);
        let val = pair.substr(brace || eql, pair.length);
        val = val.substr(val.indexOf('=') + 1, val.length);

        if (key === '') {
          key = pair;
          val = '';
        }

        return merge(ret, key, val);
      },
      {base: {}},
    ).base;
  }

  /**
   * Sets set.
   *
   * @param {any} obj Input value.
   * @param {any} key Input value.
   * @param {any} val Input value.
   * @returns {any} Function result.
   */
  function set(obj: Record<string, any>, key: string, val: any): void {
    const v = obj[key];
    if (undefined === v) {
      obj[key] = val;
    } else if (isArray(v)) {
      v.push(val);
    } else {
      obj[key] = [v, val];
    }
  }

  /**
   * Runs last brace in key.
   *
   * @param {any} str Input value.
   * @returns {any} Function result.
   */
  function lastBraceInKey(str: string): number | undefined {
    const len = str.length;
    let brace;
    let c;
    for (let i = 0; i < len; ++i) {
      c = str[i];
      if (c === ']') {
        brace = false;
      }
      if (c === '[') {
        brace = true;
      }
      if (c === '=' && !brace) {
        return i;
      }
    }
  }

  /**
   * Runs reduce.
   *
   * @param {any} obj Input value.
   * @param {any} accumulator Input value.
   * @returns {any} Function result.
   */
  function reduce(
    obj: Array<any>,
    accumulator: (
      current: any,
      value: any,
      index: number,
      source: Array<any>,
    ) => any,
    initial?: any,
  ): any {
    let i = 0;
    const l = obj.length >> 0;
    let curr = initial;
    while (i < l) {
      if (i in obj) {
        curr = accumulator(curr, obj[i], i, obj);
      }
      ++i;
    }
    return curr;
  }

  /**
   * Checks whether is array.
   *
   * @param {any} vArg Input value.
   * @returns {any} Function result.
   */
  function isArray(vArg: any): boolean {
    return Object.prototype.toString.call(vArg) === '[object Array]';
  }

  /**
   * Runs keys.
   *
   * @param {any} obj Input value.
   * @returns {any} Function result.
   */
  function keys(obj: Record<string, any>): Array<string> {
    const keys: Array<string> = [];
    for (const prop in obj) {
      if (Object.hasOwn(obj, prop)) {
        keys.push(prop);
      }
    }
    return keys;
  }

  /**
   * Runs purl.
   *
   * @param {any} url Input value.
   * @param {any} strictMode Input value.
   * @returns {any} Function result.
   */
  function purl(url?: string | boolean, strictMode?: boolean): PurlApi {
    if (arguments.length === 1 && url === true) {
      strictMode = true;
      url = undefined;
    }
    strictMode = strictMode || false;
    const resolvedUrl =
      typeof url === 'string' ? url : window.location.toString();

    return {
      data: parseUri(resolvedUrl, strictMode),

      // Return URI attributes.
      attr: function (attr) {
        attr = aliases[attr] || attr;
        return typeof attr !== 'undefined'
          ? this.data.attr[attr]
          : this.data.attr;
      },

      // Return query-string parameters.
      param: function (param) {
        return typeof param !== 'undefined'
          ? this.data.param.query[param]
          : this.data.param.query;
      },

      // Return fragment parameters.
      fparam: function (param) {
        return typeof param !== 'undefined'
          ? this.data.param.fragment[param]
          : this.data.param.fragment;
      },

      // Return path segments.
      segment: function (seg) {
        if (typeof seg === 'undefined') {
          return this.data.seg.path;
        } else {
          seg = seg < 0 ? this.data.seg.path.length + seg : seg - 1; // Negative segment values count from the end.
          return this.data.seg.path[seg];
        }
      },

      // Return fragment segments.
      fsegment: function (seg) {
        if (typeof seg === 'undefined') {
          return this.data.seg.fragment;
        } else {
          seg = seg < 0 ? this.data.seg.fragment.length + seg : seg - 1; // Negative segment values count from the end.
          return this.data.seg.fragment[seg];
        }
      },
    };
  }

  if (typeof $ !== 'undefined') {
    $.fn.url =
      /**
       * Runs url.
       *
       * @param {any} strictMode Input value.
       * @returns {any} Function result.
       */
      function (strictMode?: boolean) {
        let url = '';
        if (this.length) {
          url = $(this).attr(getAttrName(this[0])) || '';
        }
        return purl(url, strictMode);
      };

    $.url = purl;
  } else {
    window.purl = purl;
  }
});
