import defaults from 'lodash';
import textEncoding from 'text-encoding-utf-8';
import typedArrayPolyfill from 'typedarray';

/**
 * Root reference for iframes.
 * Taken from https://github.com/visionmedia/superagent/blob/master/lib/client.js
 */
let rootCandidate;
if (typeof window !== 'undefined') { // Browser window
  rootCandidate = window;
} else if (typeof self !== 'undefined') { // Web Worker
  rootCandidate = self;
} else { // Other environments
  // TODO should we warn here?
  //console.warn('Using browser-only version of superagent in non-browser environment');
  rootCandidate = this;
}

export function isObject(value) {
  return !!value && typeof value === 'object';
}

export  function noop() {
  /* No operation */
}

// TODO is defaults the right thing to do here for a polyfill?
typedArrayPolyfill.TextEncoder = textEncoding.TextEncoder;
typedArrayPolyfill.TextDecoder = textEncoding.TextDecoder;
defaults(rootCandidate, typedArrayPolyfill);

export const root = rootCandidate;

export const TextEncoder = (typeof root.TextEncoder !== 'undefined') ? root.TextEncoder : textEncoding.TextEncoder;
export const TextDecoder = (typeof root.TextDecoder !== 'undefined') ? root.TextDecoder : textEncoding.TextDecoder;

export function uint8ArrayFromString(str) {
  const encoder = new TextEncoder();
  return encoder.encode(str);
}

export function stringFromUint8Array(arr) {
  const decoder = new TextDecoder();
  return decoder.decode(arr);
}
