import { isObject, noop } from './util';
import defaultTransportFactory  from './defaultTransportFactory';
import defaultChunkParser from './defaultChunkParser';

// chunkedRequest will make a network request to the URL specified in `options.url`
// passing chunks of data extracted by the optional `options.chunkParser` to the
// optional `options.onChunk` callback.  When the request has completed the optional
// `options.onComplete` callback will be invoked.
export default function chunkedRequest(options) {
  validateOptions(options);

  const {
    url,
    headers,
    method = 'GET',
    body,
    credentials = 'same-origin',
    onData = noop,
    parser = defaultChunkParser
  } = options;

  let transport = options.transport;
  if (!transport) {
    transport = chunkedRequest.transportFactory();
  }

  return transport({
    url,
    headers,
    method,
    body,
    credentials
  })
      .then(res => parser(res, onData));
}

// override this function to delegate to an alternative transport function selection
// strategy; useful when testing.
chunkedRequest.transportFactory = defaultTransportFactory;

function validateOptions(o) {
  // Required.
  if (!isObject(o)) throw new Error('Invalid options argument');
  if (typeof o.url !== 'string' || o.length === 0) throw new Error('Invalid options.url value');

  // Optional.
  if (o.onComplete && typeof o.onComplete !== 'function') throw new Error('Invalid options.onComplete value');
  if (o.onData && typeof o.onData !== 'function') throw new Error('Invalid options.onData value');
  if (o.parser && typeof o.parser !== 'function') throw new Error('Invalid options.parser value');
}
