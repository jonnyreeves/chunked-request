import BrowserHeaders from 'browser-headers';

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
      const browserHeaders = new BrowserHeaders(this.getAllResponseHeaders());
      options.onRawHeaders(browserHeaders, this.status);
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
  if (options.headers) {
    Object.getOwnPropertyNames(options.headers).forEach(k => {
      xhr.setRequestHeader(k, options.headers[k]);
    })
  }
  if (options.credentials === 'include') {
    xhr.withCredentials = true;
  }
  xhr.addEventListener('readystatechange', onStateChange);
  xhr.addEventListener('progress', onProgressEvent);
  xhr.addEventListener('loadend', onLoadEvent);
  xhr.addEventListener('error', onError);
  xhr.send(options.body);
}
