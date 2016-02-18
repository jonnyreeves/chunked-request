# chunked-request
> Compatibility layer for efficient streaming of chunked-transfer encoded responses

You can leverage [chunked-transfer](https://en.wikipedia.org/wiki/Chunked_transfer_encoding) encoded responses on your service tier to provide partial responses to the client before the entire response has been sent.

At the time of writing (Feb 2016) there is fragmented support for efficient chunked transfer encoding in Javascript with `moz-chunked-text` provided only in Firefox and `ReadableByteStream` support only present in Chrome.  Other browsers need to fall-back to substring'ing the `responseText` property when the XHR's readyState event is fired.

This library aims to smooth over the available implementations and provide a consistent API for dealing with cross-browser support.

## API

```js
import chunkedRequest from 'chunked-request';

chunkedRequest({ 
  url: 'http://my.api/endpoint',
  method: 'POST',
  headers: { /*...*/ },
  body: JSON.stringify({ /*...*/ }),
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

#### chunkParser (optional) 
A function which takes the raw, textual chunk response returned by the server and converts it into the value passed to the `onChunk` callback (see `options.onChunk`).  If this value throws an exception, the chunk will be discarded and the error will be passed to the `onChunk` callback.  If no `chunkParser` is supplied the `defaultChunkParser` will be used which expects the chunks returned by the server to consist of one or more lines of JSON object literals which are parsed into an Array or objects. 

#### onChunk (optional)
A function which will be invoked each time a chunk of data it returned by the server. This function will be invoked one or more times depending on the response.  The function is invoked with two arguments; the first is an optional error which will be null unless there was a parsing error.  The second argument is an optional parsedChunk value which is produced by the supplied `chunkParser` (see: `options.chunkParser`).

#### onComplete (optional)
A function which will be invoked once when the browser has closed the connection to the server. This function is invoked with a single argument which contains the following properties:

* `statusCode` - HTTP status code returned by the underlying transport
* `transport` - The transport used for the request (see `options.transport`)
* `raw` - The underlying object used to make the request; typically an XHR or fetch response depending on the `transport` value.

Note that the `onChunk` option should be used to process the incoming response body.

#### transport (optional)
The underlying function to use to make the request, see the provided implementations if you wish to provide a custom extension. If no value is supplied an environment check will infer the best option for the user's browser.  Note that the `fetch` transport requires the underlying implementation to support `ReadableByteStream` and is incompatible with polyfills.