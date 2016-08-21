import defaults from 'lodash';
import textEncoding from 'text-encoding-utf-8';
import typedArrayPolyfill from 'typedarray';

/**
 * Root reference for iframes.
 * Taken from https://github.com/visionmedia/superagent/blob/master/lib/client.js
 */
let root;
if (typeof window !== 'undefined') { // Browser window
  root = window;
} else if (typeof self !== 'undefined') { // Web Worker
  root = self;
} else { // Other environments
  // TODO should we warn here?
  //console.warn('Using browser-only version of superagent in non-browser environment');
  root = this;
}

typedArrayPolyfill.TextEncoder = textEncoding.TextEncoder;
typedArrayPolyfill.TextDecoder = textEncoding.TextDecoder;
// TODO is defaults the right thing to do here for a polyfill?
defaults(root, typedArrayPolyfill);

root.TextEncoder = (typeof root.TextEncoder !== 'undefined') ? root.TextEncoder : textEncoding.TextEncoder;
root.TextDecoder = (typeof root.TextDecoder !== 'undefined') ? root.TextDecoder : textEncoding.TextDecoder;
