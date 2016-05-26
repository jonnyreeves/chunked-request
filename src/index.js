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
    onComplete = noop,
    onChunk = noop,
    chunkParser = defaultChunkParser
  } = options;

  let prevChunkSuffix = "";

  function processRawChunk(rawChunk, isFinalChunk = false) {
    let parsedChunks = null;
    let parseError = null;
    let suffix = "";

    try {
      [ parsedChunks, suffix ] = chunkParser(rawChunk, prevChunkSuffix, isFinalChunk);
      prevChunkSuffix = suffix || "";
    } catch (e) {
      parseError = e;
      parseError.rawChunk = rawChunk;
      parseError.prevChunkSuffix = prevChunkSuffix;
    } finally {
      if (parseError || (parsedChunks !== null && parsedChunks.length > 0)) {
        onChunk(parseError, parsedChunks);
      }
    }
  }

  function processRawComplete(rawComplete) {
    if (prevChunkSuffix != "") {
      // Call the parser with isFinalChunk=true to flush the prevChunkSuffix
      processRawChunk("", true);
    }
    onComplete(rawComplete);
  }

  let transport = options.transport;
  if (!transport) {
    transport = chunkedRequest.transportFactory();
  }

  transport({
    url,
    headers,
    method,
    body,
    credentials,
    onRawChunk: processRawChunk,
    onRawComplete: processRawComplete
  });
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
  if (o.onChunk && typeof o.onChunk !== 'function') throw new Error('Invalid options.onChunk value');
  if (o.chunkParser && typeof o.chunkParser !== 'function') throw new Error('Invalid options.chunkParser value');
}
