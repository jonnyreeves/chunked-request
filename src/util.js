export function isObject(value) {
  return !!value && typeof value === 'object';
}

export  function noop() {
  /* No operation */
}

class HeadersPolyfill {
  constructor(h = {}) {
    this.h = h;
  }
  append(key, value) {
    if (!Array.isArray(this.h[key])) {
      this.h[key] = [];
    }
    this.h[key].push(value);
  }
  set(key, value) {
    this.h[key] = [ value ];
  }
  has(key) {
    return Array.isArray(this.h[key]);
  }
  get(key) {
    if (Array.isArray(this.h[key])) {
      return this.h[key][0];
    }
  }
  getAll(key) {
    return this.h[key];
  }
}

function makeHeaders() {
  if (window.Headers) {
    return new Headers();
  }
  return new HeadersPolyfill();
}

export function parseResposneHeaders(str) {
  const hdrs = makeHeaders();
  if (str) {
    const pairs = str.split('\u000d\u000a');
    for (let i = 0; i < pairs.length; i++) {
      const p = pairs[i];
      const index = p.indexOf('\u003a\u0020');
      if (index > 0) {
        const key = p.substring(0, index);
        const value = p.substring(index + 2);
        hdrs.append(key, value);
      }
    }
  }
  return hdrs;
}