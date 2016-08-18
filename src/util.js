import { getBytesForCharCode, setBytesFromString } from 'utf-8';

export function isObject(value) {
  return !!value && typeof value === 'object';
}

export  function noop() {
  /* No operation */
}

export function uint8ArrayFromString(str) {
  let size = 0;
  for (let i = 0, len = str.length; i < len; i++) {
    size += getBytesForCharCode(str.charCodeAt(i))
  }
  return setBytesFromString(str, new Uint8Array(size), 0, size, true);
}