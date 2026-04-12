/* eslint-disable no-useless-escape */
/*
 * JQuery URL Parser plugin, v2.2.1
 * Developed and maintained by Mark Perkins, mark@allmarkedup.com
 * Source repository: https://github.com/allmarkedup/jQuery-URL-Parser
 * Licensed under an MIT-style license. See https://github.com/allmarkedup/jQuery-URL-Parser/blob/master/LICENSE for details.
 */

;(function (factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD available; use anonymous module
    if (typeof jQuery !== 'undefined') {
      define(['jquery'], factory)
    } else {
      define([], factory)
    }
  } else {
    // No AMD available; mutate global vars
    if (typeof jQuery !== 'undefined') {
      factory(jQuery)
    } else {
      factory()
    }
  }
})(function ($) {
  const tag2attr = {
    a: 'href',
    img: 'src',
    form: 'action',
    base: 'href',
    script: 'src',
    iframe: 'src',
    link: 'href'
  }

  const key = ['source', 'protocol', 'authority', 'userInfo', 'user', 'password', 'host', 'port', 'relative', 'path', 'directory', 'file', 'query', 'fragment'] // keys available to query

  const aliases = { anchor: 'fragment' } // aliases for backward compatibility

  const parser = {
    strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/, // less intuitive, more accurate to the specs
    loose: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/ // more intuitive, fails on relative paths and deviates from specs
  }

  const isint = /^[0-9]+$/

  function parseUri (url, strictMode) {
    const str = decodeURI(url)
    const res = parser[strictMode || false ? 'strict' : 'loose'].exec(str)
    const uri = { attr: {}, param: {}, seg: {} }
    let i = 14

    while (i--) {
      uri.attr[key[i]] = res[i] || ''
    }

    // build query and fragment parameters
    uri.param.query = parseString(uri.attr.query)
    uri.param.fragment = parseString(uri.attr.fragment)

    // split path and fragment into segments
    uri.seg.path = uri.attr.path.replace(/^\/+|\/+$/g, '').split('/')
    uri.seg.fragment = uri.attr.fragment.replace(/^\/+|\/+$/g, '').split('/')

    // compile a 'base' domain attribute
    uri.attr.base = uri.attr.host ? (uri.attr.protocol ? uri.attr.protocol + '://' + uri.attr.host : uri.attr.host) + (uri.attr.port ? ':' + uri.attr.port : '') : ''

    return uri
  }

  function getAttrName (elm) {
    const tn = elm.tagName
    if (typeof tn !== 'undefined') return tag2attr[tn.toLowerCase()]
    return tn
  }

  function promote (parent, key) {
    if (parent[key].length === 0) {
      parent[key] = {}
      return parent[key]
    }
    const t = {}
    for (const i in parent[key]) t[i] = parent[key][i]
    parent[key] = t
    return t
  }

  function parse (parts, parent, key, val) {
    let part = parts.shift()
    if (!part) {
      if (isArray(parent[key])) {
        parent[key].push(val)
      } else if (typeof parent[key] === 'object') {
        parent[key] = val
      } else if (typeof parent[key] === 'undefined') {
        parent[key] = val
      } else {
        parent[key] = [parent[key], val]
      }
    } else {
      let obj = parent[key] = parent[key] || []
      if (part === ']') {
        if (isArray(obj)) {
          if (val !== '') obj.push(val)
        } else if (typeof obj === 'object') {
          obj[keys(obj).length] = val
        } else {
          obj = parent[key] = [parent[key], val]
        }
      } else if (~part.indexOf(']')) {
        part = part.substr(0, part.length - 1)
        if (!isint.test(part) && isArray(obj)) obj = promote(parent, key)
        parse(parts, obj, part, val)
        // key
      } else {
        if (!isint.test(part) && isArray(obj)) obj = promote(parent, key)
        parse(parts, obj, part, val)
      }
    }
  }

  function merge (parent, key, val) {
    if (~key.indexOf(']')) {
      const parts = key.split('[')
      parse(parts, parent, 'base', val)
    } else {
      if (!isint.test(key) && isArray(parent.base)) {
        const t = {}
        for (const k in parent.base) t[k] = parent.base[k]
        parent.base = t
      }
      set(parent.base, key, val)
    }
    return parent
  }

  function parseString (str) {
    return reduce(String(str).split(/&|;/), function (ret, pair) {
      try {
        pair = decodeURIComponent(pair.replace(/\+/g, ' '))
      } catch (e) {
        // ignore
      }
      const eql = pair.indexOf('=')
      const brace = lastBraceInKey(pair)
      let key = pair.substr(0, brace || eql)
      let val = pair.substr(brace || eql, pair.length)
      val = val.substr(val.indexOf('=') + 1, val.length)

      if (key === '') {
        key = pair
        val = ''
      }

      return merge(ret, key, val)
    }, { base: {} }).base
  }

  function set (obj, key, val) {
    const v = obj[key]
    if (undefined === v) {
      obj[key] = val
    } else if (isArray(v)) {
      v.push(val)
    } else {
      obj[key] = [v, val]
    }
  }

  function lastBraceInKey (str) {
    const len = str.length
    let brace
    let c
    for (let i = 0; i < len; ++i) {
      c = str[i]
      if (c === ']') brace = false
      if (c === '[') brace = true
      if (c === '=' && !brace) return i
    }
  }

  function reduce (obj, accumulator) {
    let i = 0
    const l = obj.length >> 0
    let curr = arguments[2]
    while (i < l) {
      if (i in obj) curr = accumulator(curr, obj[i], i, obj)
      ++i
    }
    return curr
  }

  function isArray (vArg) {
    return Object.prototype.toString.call(vArg) === '[object Array]'
  }

  function keys (obj) {
    const keys = []
    for (const prop in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, prop)) keys.push(prop)
    }
    return keys
  }

  function purl (url, strictMode) {
    if (arguments.length === 1 && url === true) {
      strictMode = true
      url = undefined
    }
    strictMode = strictMode || false
    url = url || window.location.toString()

    return {

      data: parseUri(url, strictMode),

      // get various attributes from the URI
      attr: function (attr) {
        attr = aliases[attr] || attr
        return typeof attr !== 'undefined' ? this.data.attr[attr] : this.data.attr
      },

      // return query string parameters
      param: function (param) {
        return typeof param !== 'undefined' ? this.data.param.query[param] : this.data.param.query
      },

      // return fragment parameters
      fparam: function (param) {
        return typeof param !== 'undefined' ? this.data.param.fragment[param] : this.data.param.fragment
      },

      // return path segments
      segment: function (seg) {
        if (typeof seg === 'undefined') {
          return this.data.seg.path
        } else {
          seg = seg < 0 ? this.data.seg.path.length + seg : seg - 1 // negative segments count from the end
          return this.data.seg.path[seg]
        }
      },

      // return fragment segments
      fsegment: function (seg) {
        if (typeof seg === 'undefined') {
          return this.data.seg.fragment
        } else {
          seg = seg < 0 ? this.data.seg.fragment.length + seg : seg - 1 // negative segments count from the end
          return this.data.seg.fragment[seg]
        }
      }

    }
  }

  if (typeof $ !== 'undefined') {
    $.fn.url = function (strictMode) {
      let url = ''
      if (this.length) {
        url = $(this).attr(getAttrName(this[0])) || ''
      }
      return purl(url, strictMode)
    }

    $.url = purl
  } else {
    window.purl = purl
  }
})
