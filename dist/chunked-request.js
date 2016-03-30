(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.chunkedRequest = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = defaultChunkParser;
var entryDelimiter = '\n';

// The defaultChunkParser expects the response from the server to consist of new-line
// delimited JSON, eg:
//
//  { "chunk": "#1", "data": "Hello" }
//  { "chunk": "#2", "data": "World" }
//
// It will correctly handle the case where a chunk is emitted by the server across
// delimiter boundaries.
function defaultChunkParser(rawChunk) {
  var prevChunkSuffix = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];

  var chunkSuffix = void 0;

  var rawChunks = ('' + prevChunkSuffix + rawChunk).split(entryDelimiter);

  if (!hasSuffix(rawChunk, entryDelimiter)) {
    chunkSuffix = rawChunks.pop();
  }

  var processedChunks = rawChunks.filter(function (v) {
    return v.trim() !== '';
  }).map(function (v) {
    return JSON.parse(v);
  });

  return [processedChunks, chunkSuffix];
}

function hasSuffix(s, suffix) {
  return s.substr(s.length - suffix.length) === suffix;
}
},{}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = defaultTransportFactory;

var _fetch = require('./impl/fetch');

var _fetch2 = _interopRequireDefault(_fetch);

var _mozXhr = require('./impl/mozXhr');

var _mozXhr2 = _interopRequireDefault(_mozXhr);

var _xhr = require('./impl/xhr');

var _xhr2 = _interopRequireDefault(_xhr);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var selected = null;

function defaultTransportFactory() {
  if (!selected) {
    if (typeof window.ReadableByteStream === 'function') {
      selected = _fetch2.default;
    } else if (navigator.userAgent.toLowerCase().indexOf('firefox') !== -1) {
      selected = _mozXhr2.default;
    } else {
      selected = _xhr2.default;
    }
  }
  return selected;
}
},{"./impl/fetch":4,"./impl/mozXhr":5,"./impl/xhr":6}],3:[function(require,module,exports){
module.exports = require("./index").default;

},{"./index":7}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.READABLE_BYTE_STREAM = undefined;
exports.default = fetchRequest;

var _util = require('../util');

var READABLE_BYTE_STREAM = exports.READABLE_BYTE_STREAM = 'readable-byte-stream';

function fetchRequest(options) {
  var decoder = new TextDecoder();
  var onRawChunk = options.onRawChunk;
  var onComplete = options.onComplete;
  var method = options.method;
  var body = options.body;
  var credentials = options.credentials;

  var headers = marshallHeaders(options.headers);

  function pump(reader, res) {
    return reader.read().then(function (result) {
      if (result.done) {
        return onComplete({
          statusCode: res.status,
          transport: READABLE_BYTE_STREAM,
          raw: res
        });
      }
      onRawChunk(decoder.decode(result.value));
      return pump(reader, res);
    });
  }

  fetch(options.url, { headers: headers, method: method, body: body, credentials: credentials }).then(function (res) {
    return pump(res.body.getReader(), res);
  });
}

function marshallHeaders(v) {
  if (v instanceof Headers) {
    return v;
  } else if ((0, _util.isObject)(v)) {
    return new Headers(v);
  }
}
},{"../util":8}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = mozXhrRequest;
var MOZ_CHUNKED = exports.MOZ_CHUNKED = 'moz-chunked';

function mozXhrRequest(options) {
  var xhr = new XMLHttpRequest();

  function onProgressEvent() {
    var view = new Uint8Array(xhr.response);
    var len = view.length;

    var rawString = new Array(len);
    while (len--) {
      rawString[len] = String.fromCharCode(view[len]);
    }
    options.onRawChunk(rawString.join(''));
  }

  function onLoadEvent() {
    options.onComplete({
      statusCode: xhr.status,
      transport: MOZ_CHUNKED,
      raw: xhr
    });
  }

  xhr.open(options.method, options.url);
  xhr.responseType = 'moz-chunked-arraybuffer';
  if (options.headers) {
    Object.getOwnPropertyNames(options.headers).forEach(function (k) {
      xhr.setRequestHeader(k, options.headers[k]);
    });
  }
  if (options.credentials === 'include') {
    xhr.withCredentials = true;
  }
  xhr.addEventListener('progress', onProgressEvent);
  xhr.addEventListener('load', onLoadEvent);
  xhr.send(options.body);
}
},{}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = xhrRequest;
var XHR = exports.XHR = 'xhr';

function xhrRequest(options) {
  var xhr = new XMLHttpRequest();
  var index = 0;

  function onProgressEvent() {
    var rawChunk = xhr.responseText.substr(index);
    index = xhr.responseText.length;
    options.onRawChunk(rawChunk);
  }

  function onLoadEvent() {
    options.onComplete({
      statusCode: xhr.status,
      transport: XHR,
      raw: xhr
    });
  }

  xhr.open(options.method, options.url);
  xhr.responseType = 'text';
  if (options.headers) {
    Object.getOwnPropertyNames(options.headers).forEach(function (k) {
      xhr.setRequestHeader(k, options.headers[k]);
    });
  }
  if (options.credentials === 'include') {
    xhr.withCredentials = true;
  }
  xhr.addEventListener('progress', onProgressEvent);
  xhr.addEventListener('load', onLoadEvent);
  xhr.send(options.body);
}
},{}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.default = chunkedRequest;

var _util = require('./util');

var _defaultTransportFactory = require('./defaultTransportFactory');

var _defaultTransportFactory2 = _interopRequireDefault(_defaultTransportFactory);

var _defaultChunkParser = require('./defaultChunkParser');

var _defaultChunkParser2 = _interopRequireDefault(_defaultChunkParser);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// chunkedRequest will make a network request to the URL specified in `options.url`
// passing chunks of data extracted by the optional `options.chunkParser` to the
// optional `options.onChunk` callback.  When the request has completed the optional
// `options.onComplete` callback will be invoked.
function chunkedRequest(options) {
  validateOptions(options);

  var url = options.url;
  var headers = options.headers;
  var _options$method = options.method;
  var method = _options$method === undefined ? 'GET' : _options$method;
  var body = options.body;
  var _options$credentials = options.credentials;
  var credentials = _options$credentials === undefined ? 'same-origin' : _options$credentials;
  var _options$onComplete = options.onComplete;
  var onComplete = _options$onComplete === undefined ? _util.noop : _options$onComplete;
  var _options$onChunk = options.onChunk;
  var onChunk = _options$onChunk === undefined ? _util.noop : _options$onChunk;
  var _options$chunkParser = options.chunkParser;
  var chunkParser = _options$chunkParser === undefined ? _defaultChunkParser2.default : _options$chunkParser;


  var prevChunkSuffix = "";

  function processRawChunk(rawChunk) {
    var parsedChunks = null;
    var parseError = null;
    var suffix = "";

    try {
      var _chunkParser = chunkParser(rawChunk, prevChunkSuffix);

      var _chunkParser2 = _slicedToArray(_chunkParser, 2);

      parsedChunks = _chunkParser2[0];
      suffix = _chunkParser2[1];

      prevChunkSuffix = suffix || "";
    } catch (e) {
      parseError = e;
      parseError.rawChunk = rawChunk;
      parseError.prevChunkSuffix = prevChunkSuffix;
    } finally {
      onChunk(parseError, parsedChunks);
    }
  }

  var transport = options.transport;
  if (!transport) {
    transport = chunkedRequest.transportFactory();
  }

  transport({
    url: url,
    headers: headers,
    method: method,
    body: body,
    credentials: credentials,
    onComplete: onComplete,
    onRawChunk: processRawChunk
  });
}

// override this function to delegate to an alternative transport function selection
// strategy; useful when testing.
chunkedRequest.transportFactory = _defaultTransportFactory2.default;

function validateOptions(o) {
  // Required.
  if (!(0, _util.isObject)(o)) throw new Error('Invalid options argument');
  if (typeof o.url !== 'string' || o.length === 0) throw new Error('Invalid options.url value');

  // Optional.
  if (o.onComplete && typeof o.onComplete !== 'function') throw new Error('Invalid options.onComplete value');
  if (o.onChunk && typeof o.onChunk !== 'function') throw new Error('Invalid options.onChunk value');
  if (o.chunkParser && typeof o.chunkParser !== 'function') throw new Error('Invalid options.chunkParser value');
}
},{"./defaultChunkParser":1,"./defaultTransportFactory":2,"./util":8}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.isObject = isObject;
exports.noop = noop;
function isObject(value) {
  return !!value && (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object';
}

function noop() {
  /* No operation */
}
},{}]},{},[3])(3)
});