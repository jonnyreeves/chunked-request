import { parseResposneHeaders } from '../util';

export function makeXhrTransport({ responseType, responseParserFactory }) {
  return function xhrTransport(options) {
    const xhr = new XMLHttpRequest();
    const responseParser = responseParserFactory();

    let responseStreamController;
    const responseStream = new ReadableStream({
      start(c) {
        responseStreamController = c
      },
      cancel() {
        xhr.abort()
      }
    });

    xhr.open(options.method, options.url);
    xhr.responseType = responseType;
    if (options.headers) {
      Object.getOwnPropertyNames(options.headers).forEach(k => {
        xhr.setRequestHeader(k, options.headers[k]);
      })
    }
    if (options.credentials === 'include') {
      xhr.withCredentials = true;
    }

    return new Promise((resolve, reject) => {
      xhr.onreadystatechange = function () {
        if (xhr.readyState === xhr.HEADERS_RECEIVED) {
          return resolve({
            body: responseStream,
            headers: parseResposneHeaders(xhr.getAllResponseHeaders()),
            ok: xhr.status >= 200 && xhr.status < 300,
            status: xhr.status,
            statusText: xhr.statusText,
            url: options.url,
          });
        }
      };
      xhr.onerror = function (e) {
        return reject(e);
      };
      xhr.onprogress = function () {
        const bytes = responseParser(xhr.response);
        responseStreamController.enqueue(bytes);
      };
      xhr.onload = function () {
        responseStreamController.close();
      };

      xhr.send(options.body);
    });
  }
}
