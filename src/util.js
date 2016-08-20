export function isObject(value) {
  return !!value && typeof value === 'object';
}

export  function noop() {
  /* No operation */
}

export function uint8ArrayFromString(str) {
  const encoder = new TextEncoder();
  return encoder.encode(str);
}

export function stringFromUint8Array(arr) {
  const decoder = new TextDecoder();
  return decoder.decode(arr);
}