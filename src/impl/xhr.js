export const XHR = 'xhr';

export default function xhrRequest(options) {
  const xhr = new XMLHttpRequest();
  let index = 0;

  function onProgressEvent() {
    const rawChunk = xhr.responseText.substr(index);
    index = xhr.responseText.length;
    options.onRawChunk(rawChunk);
  }

  function onLoadEvent() {
    options.onComplete({
      statusCode: xhr.status,
      transport: XHR,
      raw: xhr
    });
  }

  xhr.open(options.method, options.url);
  xhr.responseType = 'text';
  if (options.headers) {
    Object.getOwnPropertyNames(options.headers).forEach(k => {
      xhr.setRequestHeader(k, options.headers[k]);
    })
  }
  xhr.addEventListener('progress', onProgressEvent);
  xhr.addEventListener('load', onLoadEvent);
  xhr.send(options.body);
}