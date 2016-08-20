import { TextDecoder } from './util';

const entryDelimiters = ['\r\n', '\n'];

// The defaultChunkParser expects the response from the server to consist of new-line
// delimited JSON, eg:
//
//  { "chunk": "#1", "data": "Hello" }\n
//  { "chunk": "#2", "data": "World" }
//
// It will correctly handle the case where a chunk is emitted by the server across
// delimiter boundaries.
export default function defaultChunkParser(bytes, state = {}, flush = false) {

  const textDecoder = new TextDecoder();
  const chunkStr = bytes ? textDecoder.decode(bytes, {stream: !flush}) : '';

  const jsonLiterals = entryDelimiters.reduce(function(acc, entryDelimiter) {
    return acc.reduce(function(subacc, x) {
      return subacc.concat(x.split(entryDelimiter));
    }, []);
  }, [chunkStr]);

  if (state.trailer) {
    jsonLiterals[0] = `${state.trailer}${jsonLiterals[0]}`;
  }

  // Is this a complete message?  If not, push the trailing (incomplete) string 
  // into the state. 
  if (!flush && !hasSuffix(chunkStr, entryDelimiters)) {
    state.trailer = jsonLiterals.pop();
  } else {
    state.trailer = null;
  }

  const jsonObjects = jsonLiterals
    .filter(v => v.trim() !== '')
    .map(v => JSON.parse(v));

  return [ jsonObjects, state ];
}

function hasSuffix(s, suffixes) {
  return suffixes.reduce(function(acc, suffix) {
    return acc || s.substr(s.length - suffix.length) === suffix;
  }, false);
}
