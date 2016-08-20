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

  // parserState can be utilised by the chunkParser to hold on to state; the
  // defaultChunkParser uses it to keep track of any trailing text the last
  // delimiter in the chunk.  There is no contract for parserState.
  let parserState;

  function processRawChunk(chunkBytes, flush = false) {
    let parsedChunks = null;
    let parseError = null;

    try {
      [ parsedChunks, parserState ] = chunkParser(chunkBytes, parserState, flush);
    } catch (e) {
      parseError = e;
      parseError.chunkBytes = chunkBytes;
      parseError.parserState = parserState;
    } finally {
      if (parseError || (parsedChunks && parsedChunks.length > 0)) {
        onChunk(parseError, parsedChunks);
      }
    }
  }

  function processRawComplete(rawComplete) {
    if (parserState) {
      // Flush the parser to process any remaining state.
      processRawChunk(null, true);
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
