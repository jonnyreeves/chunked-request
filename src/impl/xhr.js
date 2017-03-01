import BrowserHeaders from 'browser-headers';

export const XHR = 'xhr';

export default function xhrRequest(options) {
  const textEncoder = new TextEncoder();
  const xhr = new XMLHttpRequest();
  let index = 0;

  function onProgressEvent() {
    const rawText = xhr.responseText.substr(index);
    index = xhr.responseText.length;
    options.onRawChunk(textEncoder.encode(rawText, { stream: true }));
  }

  function onLoadEvent() {
    // Force the textEncoder to flush.
    options.onRawChunk(textEncoder.encode("", { stream: false }));
    options.onRawComplete({
      statusCode: xhr.status,
      transport: XHR,
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
      transport: XHR,
      raw: err
    });
  }

  xhr.open(options.method, options.url);
  xhr.responseType = 'text';
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
