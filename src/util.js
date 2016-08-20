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

//export function uint8ArrayFromString(str) {
//  let size = 0;
//  for (let i = 0, len = str.length; i < len; i++) {
//    size += getBytesForCharCode(str.charCodeAt(i))
//  }
//  return setBytesFromString(str, new Uint8Array(size), 0, size, true);
//}

typedArrayPolyfill.TextEncoder = textEncoding.TextEncoder;
typedArrayPolyfill.TextDecoder = textEncoding.TextDecoder;
defaults(rootCandidate, typedArrayPolyfill);

export const root = rootCandidate;

export const TextEncoderPolyfill = textEncoding.TextEncoder;
export const TextDecoderPolyfill = textEncoding.TextDecoder;
