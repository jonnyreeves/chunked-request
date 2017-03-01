'use strict';

const http = require('http');
const url = require('url');
const cookieParser = require('cookie');

// Which port should HTTP traffic be served over?
const httpPort = process.env.HTTP_PORT || 2001;

// How frequently should chunks be written to the response?  Note that we have no
// control over when chunks are actually emitted to the client so it's best to keep
// this value high and pray to the gods of TCP.
const chunkIntervalMs = 1000;

function formatChunk(chunkNumber, numEntries, delimitLastMessage) {
  let data = '';
  for (let i = 0; i < numEntries; i++) {
    data += '{ "chunk": "#' + chunkNumber + '", "data": "#' + i + '" }';
    if (delimitLastMessage || i < numEntries - 1) {
      data += '\n';
    }
  }
  return data;
}

function readRequestBody(req, callback) {
  const body = [];
  req
    .on('data', function (chunk) {
      body.push(chunk);
    })
    .on('end', function () {
      callback(Buffer.concat(body).toString());
    });
}

function serveEchoResponse(req, res) {
  res.setHeader('Content-Type', 'text/html; charset=UTF-8');
  res.setHeader('Transfer-Encoding', 'chunked');

  readRequestBody(req, body => {
    res.write(JSON.stringify({
      headers: req.headers,
      method: req.method,
      cookies: cookieParser.parse(req.headers.cookie || ''),
      body
    }) + "\n");
    res.end();
  });
}

function serveSplitChunkedResponse(req, res) {
  res.setHeader('Content-Type', 'text/html; charset=UTF-8');
  res.setHeader('Transfer-Encoding', 'chunked');

  let firstChunk = formatChunk(1, 2, true);
  let secondChunk = formatChunk(2, 2, false);

  secondChunk = firstChunk.substr(firstChunk.length - 5) + secondChunk;
  firstChunk = firstChunk.substr(0, firstChunk.length - 5);

  res.write(firstChunk);
  setTimeout(function () {
    res.write(secondChunk);
    res.end();
  }, chunkIntervalMs);
}

function serveChunkedUtf8Response(req, res) {
  res.setHeader('Content-Type', 'text/html; charset=UTF-8');
  res.setHeader('Transfer-Encoding', 'chunked');
  res.write(JSON.stringify({ "message": "𝌆" }) + "\n");
  res.end();
}

function serveChunkedResponse(req, res) {
  const query = url.parse(req.url, true).query;
  const numChunks = parseInt(query.numChunks, 10) || 4;
  const entriesPerChunk = parseInt(query.entriesPerChunk, 10) || 2;
  const delimitLast = parseInt(query.delimitLast, 10)===1;

  res.setHeader('Content-Type', 'text/html; charset=UTF-8');
  res.setHeader('Transfer-Encoding', 'chunked');
  res.setHeader('My-Header', 'My-Header-Value');

  // Start at 1 as we serve the first chunk immediately.
  let i = 1;
  res.write(formatChunk(i, entriesPerChunk, numChunks!==1 || delimitLast));

  // Only serving a single chunk?  We're done.
  if (numChunks === 1) {
    return res.end();
  }

  // Let the chunks begin!
  const chunkIntervalId = setInterval(function () {
    i++;
    const delimitLastMessage = i!==numChunks || delimitLast;
    res.write(formatChunk(i, entriesPerChunk, delimitLastMessage));
    if (i >= numChunks) {
      clearInterval(chunkIntervalId);
      res.end();
    }
  }, chunkIntervalMs);
}

function serveErrorResponse(req, res) {
  res.writeHead(500, {'My-Error-Header': 'My-Error-Header-Value'});
  res.write(JSON.stringify({ error: "internal" }));
  res.end();
}

function handler(req, res) {
  req.parsedUrl = url.parse(req.url, true);

  switch (req.parsedUrl.pathname) {
  case '/chunked-response':
    return serveChunkedResponse(req, res);
  case '/chunked-utf8-response':
    return serveChunkedUtf8Response(req, res);
  case '/split-chunked-response':
    return serveSplitChunkedResponse(req, res);
  case '/echo-response':
    return serveEchoResponse(req, res);
  case '/error-response':
    return serveErrorResponse(req, res);
  }
}

console.log("Serving on http://localhost:" + httpPort);
http.createServer(handler).listen(httpPort);