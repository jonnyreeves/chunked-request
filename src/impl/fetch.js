import { isObject } from '../util';

export default function fetchRequest(options) {
  const { method, body, credentials } = options;
  const headers = marshallHeaders(options.headers);

  return fetch(options.url, { headers, method, body, credentials })
    .then(res => {
      return {
        body: res.body,
        headers: res.headers,
        ok: res.ok,
        status: res.status,
        statusText: res.statusText,
        url: res.url
      };
    });
}

function marshallHeaders(v) {
  if (v instanceof Headers) {
    return v;
  } else if (isObject(v)) {
    return new Headers(v);
  }
}
