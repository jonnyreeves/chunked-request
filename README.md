# chunked-request
> Compatibility layer for efficient streaming of chunked-transfer encoded responses

## Somewhat deprecated in favor of [jonnyreeves/fetch-readablestream](https://github.com/jonnyreeves/fetch-readablestream/)

You can leverage [chunked-transfer](https://en.wikipedia.org/wiki/Chunked_transfer_encoding) encoded responses on your service tier to provide partial responses to the client before the entire response has been sent.

At the time of writing (August 2016) there is fragmented support for efficient chunked transfer encoding in Javascript with `moz-chunked-text` provided only in Firefox and `ReadableStream` support only present in Chrome.  Other browsers need to fall-back to substring'ing the `responseText` property when the XHR's readyState event is fired.

This library aims to smooth over the available implementations and provide a consistent API for dealing with cross-browser support.

## Installation
via npm as an ES5/ES6 module:

```bash
$ npm install chunked-request
```

or as a standalone ES5 browser script by obtaining `dist/chunked-request.js` from a [tagged release](https://github.com/jonnyreeves/chunked-request/releases).

## Browser Support
This library is tested against IE 10, Safari, Firefox and Chrome.  It relies on browser support for [TypedArray](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray), [TextDecoder](https://developer.mozilla.org/en-US/docs/Web/API/TextEncoder) and [TextDecoder](https://developer.mozilla.org/en-US/docs/Web/API/TextDecoder) Browser APIs; for legacy environments such as Safari and IE10, you will need to supply one or more of the polyfills listed below:

* [TextEncoder / TextDecoder Polyfill](https://www.npmjs.com/package/text-encoding) (IE10, Safari, PhantomJS)

## API

```js
import chunkedRequest from 'chunked-request';

chunkedRequest({ 
  url: 'http://my.api/endpoint',
  method: 'POST',
  headers: { /*...*/ },
  body: JSON.stringify({ /*...*/ }),
  credentials: 'include',
  chunkParser(rawChunk) { /*...*/ },
  onChunk(err, parsedChunk) { /*...*/ },
  onHeaders(headers, status) { /*...*/ }
  onComplete(result) { /*...*/ }
});
```

#### url (required)
The URL to make the request against as a string

#### method (optional)
The HTTP method to use when making the request.

#### headers (optional)
A hash of HTTP headers to sent with the request.

#### body (optional)
The value to send along with the request.

#### credentials (optional)
Determine if HTTP cookies will be sent along with the request, one of `same-origin`, `include` or `omit` (mirroring the fetch API).  Defaults to `same-domain` for consistency between fetch and XHR based transport; note that a value of `omit` will not affect XHR based transports which will always send cookies with requests made against the same origin.

#### chunkParser (optional) 
A function which implements the following interface:

```js
(chunkBytes, state, flush) => [ parsed, state ]
```

The chunk parser converts the supplied Uint8Array of bytes into structured data which will be supplied to the `onChunk` callback.  If no `chunkParser` function is supplied the `defaultChunkParser` will be used which expects the data to be JSON literals delimited by newline (`\\n`) characters.

See [Writing a Custom Chunk Parser](#Writing a Custom Chunk Parser) below for more deatils on how to implement this interface.

If the `chunkParser` throws an exception, the chunk will be discarded and the error that was raised will be passed to the `onChunk` callback augmented with a `chunkBytes` property that contains the byte Array supplied to the parser and a `parserState` property which contains the state that was supplied (see below).

#### onChunk (optional)
A function which implements the following interface:

```js
(err, parsedChunk) => undefined
```

The `onChunk` handler will be invoked each time a chunk of data it returned by the server. This function will be invoked one or more times depending on the response.  The function is invoked with two arguments; the first is an optional error which will be null unless there was a parsing error thrown by the `chunkParser``.  The second argument is an optional parsedChunk value which is produced by the supplied `chunkParser` (see: `options.chunkParser`).

#### onHeaders (optional)
A function which implements the following interface:

```js
(headers, statusCode) => undefined
```

A function which will be invoked once when the browser has returned the headers of the response. This will be invoked *before* the first `onChunk` callback. This function is invoked with two arguments:

* `headers` - An instance of [BrowserHeaders](https://github.com/improbable-eng/js-browser-headers)
* `statusCode` - HTTP status code returned by the underlying transport


#### onComplete (optional)
A function which implements the following interface:

```js
({ statusCode, transport, raw }) => undefined
```

A function which will be invoked once when the browser has closed the connection to the server. This function is invoked with a single argument which contains the following properties:

* `statusCode` - HTTP status code returned by the underlying transport
* `transport` - The transport used for the request (see `options.transport`)
* `raw` - The underlying object used to make the request; typically an XHR or fetch response depending on the `transport` value.

Failed connections will have a status code of 0. Note that the `onChunk` option should be used to process the incoming response body.

#### transport (optional)
A function which implements the following interface:

```js
({ url, headers, method, body, credentials, onComplete, onRawChunk }) => undefined
```

The underlying function used to make the request, see the provided implementations if you wish to provide a custom extension.  Note that you must supply a Uint8Array to the `onRawChunk` callback.

If no value is supplied the `chunkedRequest.transportFactory` function will be invoked to determine which transport method to use.  The default `transportFactory` will attempt to select the best available method for the current platform; but you can override this method for substituting a test-double or custom implementation.


## Writing a Custom Chunk Parser
The `chunkParser` takes a 'chunk' of bytes in the form of a `Uint8Array` which were provided by the remote server and then converts it into the value passed to the `onChunk` callback (see `options.onChunk`).  In it's simplest form the `chunkParser` acts as a passthru; the following example converts the supplied bytes into a string:

```js
chunkedRequest({
  chunkParser(bytes) {
    const str = utf8BytesToString(bytes);
    return [ str ];
  }
  onChunk(err, str) {
    console.log(`Chunk recieved: ${str}`);
  }
}
```


Chunk Parsers will typically be dealing with structured data (eg: JSON literals) where a message can only be parsed if it is well formed (ie: a complete JSON literal).  Because of the nature of chunked transfer, the server may end up flushing a chunk of data to the browser that contains an incomplete datastructure.  The example below illustrates this where the first chunk from the server (Chunk 1) has an incomplete JSON literal which is subsiquently completed by the proceeding chunk (Chunk 2).

```
Server (Chunk 1)> { "name": "Jonny" }\n{ "name": "Frank" }\n{ "na
Server (Chunk 2)> me": "Bob" }
```

A naieve chunk parser implementation would attempt to parse the JSON literals contained in each chunk like so:

```js
chunkParser(bytes) {
  const jsonLiterals = utf8BytesToString(bytes).split("\n");
  // This will not work; Array index 2 `'{ "nam' is an incomplete JSON
  // literal and will cause a SyntaxError from JSON.parse
  return [ jsonLiterals.map(v => JSON.parse(v)) ];
}
```

Instead, the chunkParser should make use of the `state` object to retain any incomplete messages so they can be processed in the next pass:

```js
chunkParser(bytes, state = {}) {
  const jsonLiterals = utf8BytesToString(bytes).split("\n");

  // Does the state object contain any data that was not parsed
  // in a previous pass (see below).
  if (state.trailer) {
    // Glue the data back together for a (potentially) complete literal.
    jsonLiterals[0] = `${state.trailer}${jsonLiterals[0]}`;
  }
  
  // Check to see if the last literal parsed from this chunk ended with a 
  // message delimiter.
  if (jsonLiterals[jsonLiterals.length-1] !== "\n") {
    // move the last entry into the parser's state as it's incomplete; we
    // can process it on the next pass.
    state.trailer = jsonLiterals.pop();
  }

  return [ jsonLiterals.map(v => JSON.parse(v)), state ];
}
```

Finally, stateful chunk parsers must observe the third argument, `flush`.  This flag will be true when the server has closed the conneciton indicating that there will be no further data.  The chunkParser must process any remaining data in the state object at this point.
