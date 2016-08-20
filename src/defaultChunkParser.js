import { root, TextDecoderPolyfill } from './util';

const entryDelimiter = '\n';

// The defaultChunkParser expects the response from the server to consist of new-line
// delimited JSON, eg:
//
//  { "chunk": "#1", "data": "Hello" }\n
//  { "chunk": "#2", "data": "World" }
//
// It will correctly handle the case where a chunk is emitted by the server across
// delimiter boundaries.
export default function defaultChunkParser(bytes, state = {}, flush = false) {
  root.console.log('TextDecoderPolyfill');
  root.console.log(TextDecoderPolyfill);
  root.console.log('typeof TextDecoder');
  root.console.log(typeof TextDecoder);
  let textDecoder;
  if (typeof root.TextDecoder !== 'undefined') {
    textDecoder = new root.TextDecoder();
  } else {
    textDecoder = new TextDecoderPolyfill();
  }

  const chunkStr = textDecoder.decode(bytes);
  const jsonLiterals = chunkStr.split(entryDelimiter);
  if (state.trailer) {
    jsonLiterals[0] = `${state.trailer}${jsonLiterals[0]}`;
  }

  // Is this a complete message?  If not; push the trailing (incomplete) string 
  // into the state. 
  if (!flush && !hasSuffix(chunkStr, entryDelimiter)) {
    state.trailer = jsonLiterals.pop();
  }

  const jsonObjects = jsonLiterals
    .filter(v => v.trim() !== '')
    .map(v => JSON.parse(v));

  return [ jsonObjects, state ];
}

function hasSuffix(s, suffix) {
  return s.substr(s.length - suffix.length) === suffix;
}
