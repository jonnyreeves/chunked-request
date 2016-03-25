const entryDelimiter = '\n';

// The defaultChunkParser expects the response from the server to consist of new-line
// delimited JSON, eg:
//
//  { "chunk": "#1", "data": "Hello" }
//  { "chunk": "#2", "data": "World" }
//
// It will correctly handle the case where a chunk is emitted by the server across
// delimiter boundaries.
export default function defaultChunkParser(rawChunk, prevChunkSuffix) {
  let chunkSuffix;

  const rawChunks = `${prevChunkSuffix}${rawChunk}`
      .split(entryDelimiter)
      .filter(v => !!v.trim());

  if (!rawChunk.endsWith(entryDelimiter)) {
    chunkSuffix = rawChunks.pop();
  }

  return [ rawChunks.map(v => JSON.parse(v)), chunkSuffix ];
}