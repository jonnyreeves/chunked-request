import { BrowserHeaders } from 'browser-headers';

export const READABLE_BYTE_STREAM = 'readable-byte-stream';

export default function fetchRequest(options) {
  const { onRawChunk, onRawComplete, method, body, credentials } = options;
  const headers = options.headers.toHeaders();

  function pump(reader, res) {
    return reader.read()
      .then(result => {
        if (result.done) {
          setTimeout(() => {
            onRawComplete({
              statusCode: res.status,
              transport: READABLE_BYTE_STREAM,
              raw: res
            });
          });
          return;
        }
        onRawChunk(result.value);
        return pump(reader, res);
      });
  }

  function onError(err) {
    setTimeout(() => {
      options.onRawComplete({
        statusCode: 0,
        transport: READABLE_BYTE_STREAM,
        raw: err
      });
    });
  }

  fetch(options.url, { headers, method, body, credentials })
    .then(res => {
      options.onRawHeaders(new BrowserHeaders(res.headers), res.status);
      return pump(res.body.getReader(), res)
    })
    .catch(onError);
}
