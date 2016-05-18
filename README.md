# chunked-request
> Compatibility layer for efficient streaming of chunked-transfer encoded responses

You can leverage [chunked-transfer](https://en.wikipedia.org/wiki/Chunked_transfer_encoding) encoded responses on your service tier to provide partial responses to the client before the entire response has been sent.

At the time of writing (Feb 2016) there is fragmented support for efficient chunked transfer encoding in Javascript with `moz-chunked-text` provided only in Firefox and `ReadableByteStream` support only present in Chrome.  Other browsers need to fall-back to substring'ing the `responseText` property when the XHR's readyState event is fired.

This library aims to smooth over the available implementations and provide a consistent API for dealing with cross-browser support.

## Installation
via npm as an ES5/ES6 module:

```bash
$ npm install chunked-request
```

or as a standalone ES5 browser script by obtaining `dist/chunked-request.js` from a [tagged release](https://github.com/jonnyreeves/chunked-request/releases).

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
(rawChunk, previousChunkSuffix, isFinalChunk) => [ parsedChunk, chunkSuffix ]
```

The `chunkParser` takes the raw, textual chunk response returned by the server and converts it into the value passed to the `onChunk` callback (see `options.onChunk`).  The function may also yield an optional chunkSuffix which will be not be passed to the `onChunk` callback but will instead be supplied as the `previousChunkSuffix` value the next time the `chunkParser` is invoked.

If the `chunkParser` throws an exception, the chunk will be discarded and the error that was raised will be passed to the `onChunk` callback augmented with a `rawChunk` property consisting of the textual chunk for logging / recovery.

If no `chunkParser` is supplied the `defaultChunkParser` will be used which expects the chunks returned by the server to consist of one or more `\n` delimited lines of JSON object literals which are parsed into an Array.

`chunkParser` will be called with `isFinalChunk` as `true` when the response has completed and there was a non-empty `chunkSuffix` from the last chunk. The `rawChunk` will be an empty string and the `previousChunkSuffix` will be the last returned `chunkSuffix`.

#### onChunk (optional)
A function which implements the following interface:

```js
(err, parsedChunk) => undefined
```

The `onChunk` handler will be invoked each time a chunk of data it returned by the server. This function will be invoked one or more times depending on the response.  The function is invoked with two arguments; the first is an optional error which will be null unless there was a parsing error thrown by the `chunkParser``.  The second argument is an optional parsedChunk value which is produced by the supplied `chunkParser` (see: `options.chunkParser`).

#### onComplete (optional)
A function which implements the following interface:

```js
({ statusCode, transport, raw }) => undefined
```

A function which will be invoked once when the browser has closed the connection to the server. This function is invoked with a single argument which contains the following properties:

* `statusCode` - HTTP status code returned by the underlying transport
* `transport` - The transport used for the request (see `options.transport`)
* `raw` - The underlying object used to make the request; typically an XHR or fetch response depending on the `transport` value.

Note that the `onChunk` option should be used to process the incoming response body.

#### transport (optional)
A function which implements the following interface:

```js
({ url, headers, method, body, credentials, onComplete, onRawChunk }) => undefined
```

The underlying function to use to make the request, see the provided implementations if you wish to provide a custom extension.

If no value is supplied the `chunkedRequest.transportFactory` function will be invoked to determine which transport method to use.  The deafult `transportFactory` will attempt to select the best available method for the current platform; but you can override this method for substituting a test-double or custom implementation.