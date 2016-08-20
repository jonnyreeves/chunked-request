import { root, TextEncoderPolyfill } from '../util';

export const XHR = 'xhr';

export default function xhrRequest(options) {
  root.console.log('TextEncoderPolyfill');
  root.console.log(TextEncoderPolyfill);
  root.console.log('typeof TextEncoder');
  root.console.log(typeof TextEncoder);
  let textEncoder;
  if (typeof root.TextEncoder !== 'undefined') {
    textEncoder = new root.TextEncoder();
  } else {
    textEncoder = new TextEncoderPolyfill();
  }
  root.console.log('textEncoder');
  root.console.log(textEncoder);
  const xhr = new XMLHttpRequest();
  let index = 0;

  function onProgressEvent() {
    const rawText = xhr.responseText.substr(index);
    index = xhr.responseText.length;
    options.onRawChunk(textEncoder.encode(rawText));
  }

  function onLoadEvent() {
    options.onRawComplete({
      statusCode: xhr.status,
      transport: XHR,
      raw: xhr
    });
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
  xhr.addEventListener('progress', onProgressEvent);
  xhr.addEventListener('loadend', onLoadEvent);
  xhr.addEventListener('error', onError);
  xhr.send(options.body);
}
