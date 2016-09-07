const entryDelimiter = '\n';

export default function jsonLiteralParser(res, onData) {
  const textDecoder = new TextDecoder();
  let trailer = '';

  function processChunk(bytes, flush = false) {
    const str = textDecoder.decode(bytes, { stream: !flush });
    const jsonLiterals = str.split(entryDelimiter);

    // process any trailing state left over from a previous call.
    if (trailer) {
      jsonLiterals[0] = `${trailer}${jsonLiterals[0]}`;
      trailer = '';
    }

    // Is this a complete message?  If not; push the trailing (incomplete) string
    // into the state.
    if (!flush && !hasSuffix(str, entryDelimiter)) {
      trailer = jsonLiterals.pop();
    }

    try {
      const jsonObjects = jsonLiterals
          .filter(v => v.trim() !== '')
          .map(v => JSON.parse(v));
      onData(jsonObjects);
    }
    catch (err) {
      onData(err);
    }
  }

  // call read() recursively until it's exhausted.
  function pump() {
    return res.body.getReader().read()
        .then(next => {
          if (next.done) {
            processChunk(new Uint8Array(), true);
            return res;
          }
          processChunk(next.value);
          return pump();
        });
  }

  return pump();
}

function hasSuffix(s, suffix) {
  return s.substr(s.length - suffix.length) === suffix;
}