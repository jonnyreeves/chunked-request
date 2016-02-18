import { isObject, noop } from './util';
import { detectOptimalTransport } from './detect-transport';
import defaultChunkParser from './defaultChunkParser';

export default function chunkedRequest(options) {
  validateOptions(options);

  const {
    url,
    headers,
    method = 'GET',
    body,
    transport = detectOptimalTransport(),
    onComplete = noop,
    onChunk = noop,
    chunkParser = defaultChunkParser
  } = options;

  function parseChunk(rawChunk) {
    let parsedChunks = null;
    let parseError = null;

    try {
      parsedChunks = chunkParser(rawChunk);
    } catch (e) {
      parseError = e;
    } finally {
      onChunk(parseError, parsedChunks);
    }
  }

  transport({
    url,
    headers,
    method,
    body,
    onComplete,
    onRawChunk: parseChunk
  });
}

function validateOptions(o) {
  // Required.
  if (!isObject(o)) throw new Error('Invalid options argument');
  if (typeof o.url !== 'string' || o.length === 0) throw new Error('Invalid options.url value');

  // Optional.
  if (o.onComplete && typeof o.onComplete !== 'function') throw new Error('Invalid options.onComplete value');
  if (o.onChunk && typeof o.onChunk !== 'function') throw new Error('Invalid options.onChunk value');
}