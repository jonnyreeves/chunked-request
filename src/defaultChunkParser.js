const entryDelimiter = '\n';

// The defaultChunkParser expects the response from the server to consist of new-line
// delimited JSON, eg:
//
//  { "chunk": "#1", "data": "Hello" }
//  { "chunk": "#2", "data": "World" }
//
// It will correctly handle the case where a chunk is emitted by the server across
// delimiter boundaries.
export default function defaultChunkParser(rawChunk, prevChunkSuffix = '', isFinalChunk = false) {
  let chunkSuffix;

  const rawChunks = `${prevChunkSuffix}${rawChunk}`
    .split(entryDelimiter);

  if (!isFinalChunk && !hasSuffix(rawChunk, entryDelimiter)) {
    chunkSuffix = rawChunks.pop();
  }

  const processedChunks = rawChunks
    .filter(v => v.trim() !== '')
    .map(v => JSON.parse(v));

  return [ processedChunks, chunkSuffix ];
}

function hasSuffix(s, suffix) {
  return s.substr(s.length - suffix.length) === suffix;
}