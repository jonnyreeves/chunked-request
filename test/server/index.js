'use strict';

const http = require('http');
const url = require('url');

// Which port should HTTP traffic be served over?
const httpPort = process.env.HTTP_PORT || 2001;

function formatChunk(chunkNumber, numEntries) {
  let data = '';
  for (let i = 0; i < numEntries; i++) {
    data += '{ "chunk": "#' + chunkNumber + '", "data": "#' + i + '" }\n';
  }
  return data + '\n';
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
      body
    }));
    res.end();
  });
}

function serveChunkedResponse(req, res) {
  const query = url.parse(req.url, true).query;
  const numChunks = parseInt(query.numChunks, 10) || 4;
  const entriesPerChunk = parseInt(query.entriesPerChunk, 10) || 2;
  const intervalMs = parseInt(query.intervalMs, 10) || 100;

  res.setHeader('Content-Type', 'text/html; charset=UTF-8');
  res.setHeader('Transfer-Encoding', 'chunked');

  // Start at 1 as we serve the first chunk immediately.
  let i = 1;
  res.write(formatChunk(i, entriesPerChunk));

  // Only serving a single chunk?  We're done.
  if (numChunks === 1) {
    return res.end();
  }

  // Let the chunks begin!
  const chunkIntervalId = setInterval(function () {
    i++;
    res.write(formatChunk(i, entriesPerChunk));
    if (i >= numChunks) {
      clearInterval(chunkIntervalId);
      res.end();
    }
  }, intervalMs);
}

function serveErrorResponse(req, res) {
  res.writeHead(500);
  res.write(JSON.stringify({ error: "internal" }));
  res.end();
}

function handler(req, res) {
  req.parsedUrl = url.parse(req.url, true);

  switch (req.parsedUrl.pathname) {
  case '/chunked-response':
    return serveChunkedResponse(req, res);
  case '/echo-response':
    return serveEchoResponse(req, res);
  case '/error-response':
    return serveErrorResponse(req, res);
  }
}

console.log("Serving on http://localhost:" + httpPort);
http.createServer(handler).listen(httpPort);