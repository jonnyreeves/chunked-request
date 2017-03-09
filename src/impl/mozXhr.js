import { BrowserHeaders } from 'browser-headers';

export const MOZ_CHUNKED = 'moz-chunked';

export default function mozXhrRequest(options) {
  const xhr = new XMLHttpRequest();

  function onProgressEvent() {
    options.onRawChunk(new Uint8Array(xhr.response));
  }

  function onLoadEvent() {
    options.onRawComplete({
      statusCode: xhr.status,
      transport: MOZ_CHUNKED,
      raw: xhr
    });
  }

  function onStateChange() {
    if(this.readyState == this.HEADERS_RECEIVED) {
      options.onRawHeaders(new BrowserHeaders(this.getAllResponseHeaders()), this.status);
    }
  }
  function onError(err) {
    options.onRawComplete({
      statusCode: 0,
      transport: MOZ_CHUNKED,
      raw: err
    });
  }

  xhr.open(options.method, options.url);
  xhr.responseType = 'moz-chunked-arraybuffer';
  options.headers.forEach((key, values) => {
    xhr.setRequestHeader(key, values.join(", "));
  });
  if (options.credentials === 'include') {
    xhr.withCredentials = true;
  }
  xhr.addEventListener('readystatechange', onStateChange);
  xhr.addEventListener('progress', onProgressEvent);
  xhr.addEventListener('loadend', onLoadEvent);
  xhr.addEventListener('error', onError);
  xhr.send(options.body);
}
