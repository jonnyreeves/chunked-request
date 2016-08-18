import { getStringFromBytes } from 'utf-8';

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
  const chunkStr = getStringFromBytes(bytes, 0, undefined, true);
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