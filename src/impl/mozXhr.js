export const MOZ_CHUNKED = 'moz-chunked';

export default function mozXhrRequest(options) {
  const xhr = new XMLHttpRequest();

  function onProgressEvent() {
    const view = new Uint8Array(xhr.response);
    let len = view.length;

    const rawString = new Array(len);
    while(len--) {
      rawString[len] = String.fromCharCode(view[len]);
    }
    options.onRawChunk(rawString.join(''));
  }

  function onLoadEvent() {
    options.onRawComplete({
      statusCode: xhr.status,
      transport: MOZ_CHUNKED,
      raw: xhr
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
  xhr.addEventListener('progress', onProgressEvent);
  xhr.addEventListener('loadend', onLoadEvent);
  xhr.addEventListener('error', err => options.onComplete({
    statusCode: 0,
    transport: MOZ_CHUNKED,
    raw: err
  }));
  xhr.send(options.body);
}
