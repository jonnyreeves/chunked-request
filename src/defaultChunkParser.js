export default function defaultChunkParser(value) {
  const entryDelimiter = '\n';

  return value.split(entryDelimiter)
    .filter(v => !!v.trim())
    .map(v => JSON.parse(v));
}