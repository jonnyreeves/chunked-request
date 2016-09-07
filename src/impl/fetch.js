import { isObject } from '../util';

export const READABLE_BYTE_STREAM = 'readable-byte-stream';

export default function fetchRequest(options) {
  const { method, body, credentials } = options;
  const headers = marshallHeaders(options.headers);

  return fetch(options.url, { headers, method, body, credentials })
    .then(res => ({
      body: {
        getReader: res.body.getReader
      },
      headers: res.headers,
      status: res.status,
      cancel: res.cancel
    }));
}

function marshallHeaders(v) {
  if (v instanceof Headers) {
    return v;
  } else if (isObject(v)) {
    return new Headers(v);
  }
}
