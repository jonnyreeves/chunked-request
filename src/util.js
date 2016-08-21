export function isObject(value) {
  return !!value && typeof value === 'object';
}

export  function noop() {
  /* No operation */
}

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
// TODO is there a nicer way to export this without
// defining rootCandidate?
export const root = rootCandidate;
