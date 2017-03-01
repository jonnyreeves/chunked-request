import fetchRequest from './impl/fetch';
import mozXhrRequest from './impl/mozXhr';
import xhrRequest from './impl/xhr';

let selected = null;

export default function defaultTransportFactory() {
  if (!selected) {
    selected = detectTransport();
  }
  return selected;
}

function detectTransport() {
  if (typeof Response !== 'undefined' && Response.prototype.hasOwnProperty("body") && typeof Headers === 'function') {
    return fetchRequest;
  }
  const mozChunked = 'moz-chunked-arraybuffer';
  if (supportsXhrResponseType(mozChunked)) {
    return mozXhrRequest;
  }

  return xhrRequest;
}

function supportsXhrResponseType(type) {
  try {
    const tmpXhr = new XMLHttpRequest();
    tmpXhr.responseType = type;
    return tmpXhr.responseType === type;
  } catch (e) { /* IE throws on setting responseType to an unsupported value */ }
  return false;
}