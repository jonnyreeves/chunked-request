import { isObject } from '../util';

export const READABLE_BYTE_STREAM = 'readable-byte-stream';

export default function fetchRequest(options) {
  const decoder = new TextDecoder();
  const { onRawChunk, onRawComplete, method, body, credentials } = options;
  const headers = marshallHeaders(options.headers);

  function pump(reader, res) {
    return reader.read()
      .then(result => {
        if (result.done) {
          return onRawComplete({
            statusCode: res.status,
            transport: READABLE_BYTE_STREAM,
            raw: res
          });
        }
        onRawChunk(decoder.decode(result.value));
        return pump(reader, res);
      });
  }

  fetch(options.url, { headers, method, body, credentials })
    .then(res => pump(res.body.getReader(), res))
    .catch(err => options.onComplete({
      statusCode: 0,
      transport: READABLE_BYTE_STREAM,
      raw: err
    }));
}

function marshallHeaders(v) {
  if (v instanceof Headers) {
    return v;
  } else if (isObject(v)) {
    return new Headers(v);
  }
}
