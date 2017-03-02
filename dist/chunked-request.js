(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["chunkedRequest"] = factory();
	else
		root["chunkedRequest"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 11);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var BrowserHeaders_1 = __webpack_require__(8);
exports.default = BrowserHeaders_1.default;
//# sourceMappingURL=index.js.map

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.isObject = isObject;
exports.noop = noop;
function isObject(value) {
  return !!value && (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object';
}

function noop() {
  /* No operation */
}

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.default = chunkedRequest;

var _util = __webpack_require__(1);

var _defaultTransportFactory = __webpack_require__(4);

var _defaultTransportFactory2 = _interopRequireDefault(_defaultTransportFactory);

var _defaultChunkParser = __webpack_require__(3);

var _defaultChunkParser2 = _interopRequireDefault(_defaultChunkParser);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// chunkedRequest will make a network request to the URL specified in `options.url`
// passing chunks of data extracted by the optional `options.chunkParser` to the
// optional `options.onChunk` callback. When the headers of the response are received
// the optional `options.onHeaders` callback will be invoked with the headers as an
// instance of BrowserHeaders and the numeric status code. When the request has
// completed the optional `options.onComplete` callback will be invoked.
function chunkedRequest(options) {
  validateOptions(options);

  var url = options.url;
  var headers = options.headers;
  var _options$method = options.method;
  var method = _options$method === undefined ? 'GET' : _options$method;
  var body = options.body;
  var _options$credentials = options.credentials;
  var credentials = _options$credentials === undefined ? 'same-origin' : _options$credentials;
  var _options$onHeaders = options.onHeaders;
  var onHeaders = _options$onHeaders === undefined ? _util.noop : _options$onHeaders;
  var _options$onComplete = options.onComplete;
  var onComplete = _options$onComplete === undefined ? _util.noop : _options$onComplete;
  var _options$onChunk = options.onChunk;
  var onChunk = _options$onChunk === undefined ? _util.noop : _options$onChunk;
  var _options$chunkParser = options.chunkParser;
  var chunkParser = _options$chunkParser === undefined ? _defaultChunkParser2.default : _options$chunkParser;

  // parserState can be utilised by the chunkParser to hold on to state; the
  // defaultChunkParser uses it to keep track of any trailing text the last
  // delimiter in the chunk.  There is no contract for parserState.

  var parserState = void 0;

  function processRawHeaders(headers, status) {
    onHeaders(headers, status);
  }

  function processRawChunk(chunkBytes) {
    var flush = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

    var parsedChunks = null;
    var parseError = null;

    try {
      var _chunkParser = chunkParser(chunkBytes, parserState, flush);

      var _chunkParser2 = _slicedToArray(_chunkParser, 2);

      parsedChunks = _chunkParser2[0];
      parserState = _chunkParser2[1];
    } catch (e) {
      parseError = e;
      parseError.chunkBytes = chunkBytes;
      parseError.parserState = parserState;
    } finally {
      if (parseError || parsedChunks && parsedChunks.length > 0) {
        onChunk(parseError, parsedChunks);
      }
    }
  }

  function processRawComplete(rawComplete) {
    if (parserState) {
      // Flush the parser to process any remaining state.
      processRawChunk(new Uint8Array(0), true);
    }
    onComplete(rawComplete);
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
    onRawHeaders: processRawHeaders,
    onRawChunk: processRawChunk,
    onRawComplete: processRawComplete
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
  if (o.onHeaders && typeof o.onHeaders !== 'function') throw new Error('Invalid options.onHeaders value');
  if (o.onChunk && typeof o.onChunk !== 'function') throw new Error('Invalid options.onChunk value');
  if (o.chunkParser && typeof o.chunkParser !== 'function') throw new Error('Invalid options.chunkParser value');
}

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = defaultChunkParser;
var entryDelimiter = '\n';

// The defaultChunkParser expects the response from the server to consist of new-line
// delimited JSON, eg:
//
//  { "chunk": "#1", "data": "Hello" }\n
//  { "chunk": "#2", "data": "World" }
//
// It will correctly handle the case where a chunk is emitted by the server across
// delimiter boundaries.
function defaultChunkParser(bytes) {
  var state = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
  var flush = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

  if (!state.textDecoder) {
    state.textDecoder = new TextDecoder();
  }
  var textDecoder = state.textDecoder;
  var chunkStr = textDecoder.decode(bytes, { stream: !flush });
  var jsonLiterals = chunkStr.split(entryDelimiter);
  if (state.trailer) {
    jsonLiterals[0] = '' + state.trailer + jsonLiterals[0];
    state.trailer = '';
  }

  // Is this a complete message?  If not; push the trailing (incomplete) string 
  // into the state. 
  if (!flush && !hasSuffix(chunkStr, entryDelimiter)) {
    state.trailer = jsonLiterals.pop();
  }

  var jsonObjects = jsonLiterals.filter(function (v) {
    return v.trim() !== '';
  }).map(function (v) {
    return JSON.parse(v);
  });

  return [jsonObjects, state];
}

function hasSuffix(s, suffix) {
  return s.substr(s.length - suffix.length) === suffix;
}

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = defaultTransportFactory;

var _fetch = __webpack_require__(5);

var _fetch2 = _interopRequireDefault(_fetch);

var _mozXhr = __webpack_require__(6);

var _mozXhr2 = _interopRequireDefault(_mozXhr);

var _xhr = __webpack_require__(7);

var _xhr2 = _interopRequireDefault(_xhr);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var selected = null;

function defaultTransportFactory() {
  if (!selected) {
    selected = detectTransport();
  }
  return selected;
}

function detectTransport() {
  if (typeof Response !== 'undefined' && Response.prototype.hasOwnProperty("body") && typeof Headers === 'function') {
    return _fetch2.default;
  }
  var mozChunked = 'moz-chunked-arraybuffer';
  if (supportsXhrResponseType(mozChunked)) {
    return _mozXhr2.default;
  }

  return _xhr2.default;
}

function supportsXhrResponseType(type) {
  try {
    var tmpXhr = new XMLHttpRequest();
    tmpXhr.responseType = type;
    return tmpXhr.responseType === type;
  } catch (e) {/* IE throws on setting responseType to an unsupported value */}
  return false;
}

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.READABLE_BYTE_STREAM = undefined;
exports.default = fetchRequest;

var _browserHeaders = __webpack_require__(0);

var _browserHeaders2 = _interopRequireDefault(_browserHeaders);

var _util = __webpack_require__(1);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var READABLE_BYTE_STREAM = exports.READABLE_BYTE_STREAM = 'readable-byte-stream';

function fetchRequest(options) {
  var onRawChunk = options.onRawChunk;
  var onRawComplete = options.onRawComplete;
  var method = options.method;
  var body = options.body;
  var credentials = options.credentials;

  var headers = marshallHeaders(options.headers);

  function pump(reader, res) {
    return reader.read().then(function (result) {
      if (result.done) {
        setTimeout(function () {
          onRawComplete({
            statusCode: res.status,
            transport: READABLE_BYTE_STREAM,
            raw: res
          });
        });
        return;
      }
      onRawChunk(result.value);
      return pump(reader, res);
    });
  }

  function onError(err) {
    setTimeout(function () {
      options.onRawComplete({
        statusCode: 0,
        transport: READABLE_BYTE_STREAM,
        raw: err
      });
    });
  }

  fetch(options.url, { headers: headers, method: method, body: body, credentials: credentials }).then(function (res) {
    options.onRawHeaders(new _browserHeaders2.default(res.headers), res.status);
    return pump(res.body.getReader(), res);
  }).catch(onError);
}

function marshallHeaders(v) {
  if (v instanceof Headers) {
    return v;
  } else if ((0, _util.isObject)(v)) {
    return new Headers(v);
  }
}

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MOZ_CHUNKED = undefined;
exports.default = mozXhrRequest;

var _browserHeaders = __webpack_require__(0);

var _browserHeaders2 = _interopRequireDefault(_browserHeaders);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var MOZ_CHUNKED = exports.MOZ_CHUNKED = 'moz-chunked';

function mozXhrRequest(options) {
  var xhr = new XMLHttpRequest();

  function onProgressEvent() {
    options.onRawChunk(new Uint8Array(xhr.response));
  }

  function onLoadEvent() {
    options.onRawComplete({
      statusCode: xhr.status,
      transport: MOZ_CHUNKED,
      raw: xhr
    });
  }

  function onStateChange() {
    if (this.readyState == this.HEADERS_RECEIVED) {
      options.onRawHeaders(new _browserHeaders2.default(this.getAllResponseHeaders()), this.status);
    }
  }
  function onError(err) {
    options.onRawComplete({
      statusCode: 0,
      transport: MOZ_CHUNKED,
      raw: err
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
  xhr.addEventListener('readystatechange', onStateChange);
  xhr.addEventListener('progress', onProgressEvent);
  xhr.addEventListener('loadend', onLoadEvent);
  xhr.addEventListener('error', onError);
  xhr.send(options.body);
}

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.XHR = undefined;
exports.default = xhrRequest;

var _browserHeaders = __webpack_require__(0);

var _browserHeaders2 = _interopRequireDefault(_browserHeaders);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var XHR = exports.XHR = 'xhr';

function xhrRequest(options) {
  var textEncoder = new TextEncoder();
  var xhr = new XMLHttpRequest();
  var index = 0;

  function onProgressEvent() {
    var rawText = xhr.responseText.substr(index);
    index = xhr.responseText.length;
    options.onRawChunk(textEncoder.encode(rawText, { stream: true }));
  }

  function onLoadEvent() {
    // Force the textEncoder to flush.
    options.onRawChunk(textEncoder.encode("", { stream: false }));
    options.onRawComplete({
      statusCode: xhr.status,
      transport: XHR,
      raw: xhr
    });
  }

  function onStateChange() {
    if (this.readyState == this.HEADERS_RECEIVED) {
      options.onRawHeaders(new _browserHeaders2.default(this.getAllResponseHeaders()), this.status);
    }
  }

  function onError(err) {
    options.onRawComplete({
      statusCode: 0,
      transport: XHR,
      raw: err
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
  xhr.addEventListener('readystatechange', onStateChange);
  xhr.addEventListener('progress', onProgressEvent);
  xhr.addEventListener('loadend', onLoadEvent);
  xhr.addEventListener('error', onError);
  xhr.send(options.body);
}

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = __webpack_require__(10);
var BrowserHeaders = (function () {
    function BrowserHeaders(init, options) {
        if (init === void 0) { init = ""; }
        if (options === void 0) { options = { splitValues: false }; }
        var _this = this;
        this.keyValueMap = {};
        if (init) {
            if (typeof Headers !== "undefined" && init instanceof Headers) {
                var keys = util_1.getHeaderKeys(init);
                keys.forEach(function (key) {
                    var values = util_1.getHeaderValues(init, key);
                    values.forEach(function (value) {
                        if (options.splitValues) {
                            _this.append(key, util_1.splitHeaderValue(value));
                        }
                        else {
                            _this.append(key, value);
                        }
                    });
                });
            }
            else if (init instanceof BrowserHeaders) {
                init.forEach(function (key, values) {
                    _this.append(key, values);
                });
            }
            else if (typeof Map !== "undefined" && init instanceof Map) {
                var asMap = init;
                asMap.forEach(function (value, key) {
                    _this.append(key, value);
                });
            }
            else if (typeof init === "string") {
                this.appendFromString(init);
            }
            else if (typeof init === "object") {
                Object.getOwnPropertyNames(init).forEach(function (key) {
                    var asObject = init;
                    var values = asObject[key];
                    if (Array.isArray(values)) {
                        values.forEach(function (value) {
                            _this.append(key, value);
                        });
                    }
                    else {
                        _this.append(key, values);
                    }
                });
            }
        }
    }
    BrowserHeaders.prototype.appendFromString = function (str) {
        var pairs = str.split("\r\n");
        for (var i = 0; i < pairs.length; i++) {
            var p = pairs[i];
            var index = p.indexOf(": ");
            if (index > 0) {
                var key = p.substring(0, index);
                var value = p.substring(index + 2);
                this.append(key, value);
            }
        }
    };
    BrowserHeaders.prototype.delete = function (key, value) {
        var normalizedKey = util_1.normalizeName(key);
        if (value === undefined) {
            delete this.keyValueMap[normalizedKey];
        }
        else {
            var existing = this.keyValueMap[normalizedKey];
            if (existing) {
                var index = existing.indexOf(value);
                if (index >= 0) {
                    existing.splice(index, 1);
                }
                if (existing.length === 0) {
                    delete this.keyValueMap[normalizedKey];
                }
            }
        }
    };
    BrowserHeaders.prototype.append = function (key, value) {
        var _this = this;
        var normalizedKey = util_1.normalizeName(key);
        if (!Array.isArray(this.keyValueMap[normalizedKey])) {
            this.keyValueMap[normalizedKey] = [];
        }
        if (Array.isArray(value)) {
            value.forEach(function (arrayValue) {
                _this.keyValueMap[normalizedKey].push(util_1.normalizeValue(arrayValue));
            });
        }
        else {
            this.keyValueMap[normalizedKey].push(util_1.normalizeValue(value));
        }
    };
    BrowserHeaders.prototype.set = function (key, value) {
        var normalizedKey = util_1.normalizeName(key);
        if (Array.isArray(value)) {
            var normalized_1 = [];
            value.forEach(function (arrayValue) {
                normalized_1.push(util_1.normalizeValue(arrayValue));
            });
            this.keyValueMap[normalizedKey] = normalized_1;
        }
        else {
            this.keyValueMap[normalizedKey] = [util_1.normalizeValue(value)];
        }
    };
    BrowserHeaders.prototype.has = function (key, value) {
        var keyArray = this.keyValueMap[util_1.normalizeName(key)];
        var keyExists = Array.isArray(keyArray);
        if (!keyExists) {
            return false;
        }
        if (value !== undefined) {
            var normalizedValue = util_1.normalizeValue(value);
            return keyArray.indexOf(normalizedValue) >= 0;
        }
        else {
            return true;
        }
    };
    BrowserHeaders.prototype.get = function (key) {
        var values = this.keyValueMap[util_1.normalizeName(key)];
        if (values !== undefined) {
            return values.concat();
        }
        return [];
    };
    BrowserHeaders.prototype.forEach = function (callback) {
        var _this = this;
        Object.getOwnPropertyNames(this.keyValueMap)
            .forEach(function (key) {
            callback(key, _this.keyValueMap[key]);
        }, this);
    };
    return BrowserHeaders;
}());
exports.default = BrowserHeaders;
//# sourceMappingURL=BrowserHeaders.js.map

/***/ }),
/* 9 */
/***/ (function(module, exports) {

// This function is written in JS (ES5) to avoid an issue with TypeScript targeting ES5, but requiring Symbol.iterator
function iterateHeaders(headers, callback) {
  var iterator = headers[Symbol.iterator]();
  var entry = iterator.next();
  while(!entry.done) {
    callback(entry.value[0]);
    entry = iterator.next();
  }
}

function iterateHeadersKeys(headers, callback) {
  var iterator = headers.keys();
  var entry = iterator.next();
  while(!entry.done) {
    callback(entry.value);
    entry = iterator.next();
  }
}

module.exports = {
  iterateHeaders: iterateHeaders,
  iterateHeadersKeys: iterateHeadersKeys
};


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var iterateHeaders_1 = __webpack_require__(9);
function normalizeName(name) {
    if (typeof name !== "string") {
        name = String(name);
    }
    if (/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(name)) {
        throw new TypeError("Invalid character in header field name");
    }
    return name.toLowerCase();
}
exports.normalizeName = normalizeName;
function normalizeValue(value) {
    if (typeof value !== "string") {
        value = String(value);
    }
    return value;
}
exports.normalizeValue = normalizeValue;
function getHeaderValues(headers, key) {
    if (headers instanceof Headers && headers.getAll) {
        return headers.getAll(key);
    }
    var getValue = headers.get(key);
    if (getValue && typeof getValue === "string") {
        return [getValue];
    }
    return getValue;
}
exports.getHeaderValues = getHeaderValues;
function getHeaderKeys(headers) {
    var asMap = {};
    var keys = [];
    if (headers.keys) {
        iterateHeaders_1.iterateHeadersKeys(headers, function (key) {
            if (!asMap[key]) {
                asMap[key] = true;
                keys.push(key);
            }
        });
    }
    else if (headers.forEach) {
        headers.forEach(function (_, key) {
            if (!asMap[key]) {
                asMap[key] = true;
                keys.push(key);
            }
        });
    }
    else {
        iterateHeaders_1.iterateHeaders(headers, function (entry) {
            var key = entry[0];
            if (!asMap[key]) {
                asMap[key] = true;
                keys.push(key);
            }
        });
    }
    return keys;
}
exports.getHeaderKeys = getHeaderKeys;
function splitHeaderValue(str) {
    var values = [];
    var commaSpaceValues = str.split(", ");
    commaSpaceValues.forEach(function (commaSpaceValue) {
        commaSpaceValue.split(",").forEach(function (commaValue) {
            values.push(commaValue);
        });
    });
    return values;
}
exports.splitHeaderValue = splitHeaderValue;
//# sourceMappingURL=util.js.map

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(2).default;


/***/ })
/******/ ]);
});
//# sourceMappingURL=chunked-request.js.map