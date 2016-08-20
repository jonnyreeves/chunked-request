import fetchRequest from './impl/fetch';
import mozXhrRequest from './impl/mozXhr';
import xhrRequest from './impl/xhr';

let selected = null;

export default function defaultTransportFactory() {
  const userAgent = navigator.userAgent.toLowerCase();

  if (!selected) {
    if (userAgent.indexOf("chrome") !== -1) {
      selected = fetchRequest;
    } else if (userAgent.indexOf('firefox') !== -1) {
      selected = mozXhrRequest;
    } else {
      selected = xhrRequest;
    }
  }
  return selected;
}

