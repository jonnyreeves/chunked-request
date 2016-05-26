import chunkedRequest from '../../src/index';
import isEqual from 'lodash/isEqual';
import isObject from 'lodash/isObject';

// These integration tests run through Karma; check `karma.conf.js` for
// configuration.  Note that the dev-server which provides the `/chunked-response`
// endpoint is proxied through karma to work around CORS constraints.
describe('chunked-request', () => {

  it('should parse a response that consists of a single chunk', done => {
    const receivedChunks = [];

    const onComplete = () => {
      const chunkErrors = receivedChunks.filter(v => v instanceof Error);

      expect(receivedChunks.length).toBe(1, 'receivedChunks');
      expect(chunkErrors.length).toBe(0, 'of which errors');
      expect(isEqual(receivedChunks, [ [ {chunk: '#1', data: '#0'} ] ])).toBe(true, 'parsed chunks');

      done();
    };

    chunkedRequest({
      url: `/chunked-response?numChunks=1&entriesPerChunk=1&delimitLast=1`,
      onChunk: (err, chunk) => receivedChunks.push(err || chunk),
      onComplete
    })
  });

  it('should parse a response that consists of two chunks and ends with a delimiter', done => {
    const receivedChunks = [];

    const onComplete = () => {
      const chunkErrors = receivedChunks.filter(v => v instanceof Error);

      expect(receivedChunks.length).toBe(3, 'receivedChunks');
      expect(chunkErrors.length).toBe(0, 'of which errors');
      expect(isEqual(receivedChunks, [
        [ {chunk: '#1', data: '#0'} ],
        [ {chunk: '#2', data: '#0'} ],
        [ {chunk: '#3', data: '#0'} ]
      ])).toBe(true, 'parsed chunks');

      done();
    };

    chunkedRequest({
      url: `/chunked-response?numChunks=3&entriesPerChunk=1&delimitLast=1`,
      onChunk: (err, chunk) => {
        receivedChunks.push(err || chunk)
      },
      onComplete
    });
  });

  it('should parse a response that consists of two chunks and does not end with a delimiter', done => {
    const receivedChunks = [];

    const onComplete = () => {
      const chunkErrors = receivedChunks.filter(v => v instanceof Error);

      expect(receivedChunks.length).toBe(3, 'receivedChunks');
      expect(chunkErrors.length).toBe(0, 'of which errors');
      expect(isEqual(receivedChunks, [
        [ {chunk: '#1', data: '#0'} ],
        [ {chunk: '#2', data: '#0'} ],
        [ {chunk: '#3', data: '#0'} ]
      ])).toBe(true, 'parsed chunks');

      done();
    };

    chunkedRequest({
      url: `/chunked-response?numChunks=3&entriesPerChunk=1&delimitLast=0`,
      onChunk: (err, chunk) => {
        receivedChunks.push(err || chunk)
      },
      onComplete
    });
  });

  it('should handle incomplete JSON chunks in the response', done => {
    const receivedChunks = [];

    const onComplete = () => {
      const chunkErrors = receivedChunks.filter(v => v instanceof Error);

      expect(receivedChunks.length).toBe(3, 'receivedChunks');
      expect(chunkErrors.length).toBe(0, 'of which errors');
      expect(isEqual(receivedChunks, [
        [ {chunk: '#1', data: '#0'} ],
        [ {chunk: '#1', data: '#1'}, {chunk: '#2', data: '#0'} ],
        [ {chunk: '#2', data: '#1'} ]
      ])).toBe(true, 'parsed chunks');

      done();
    };

    chunkedRequest({
      url: `/split-chunked-response`,
      onChunk: (err, chunk) => {
        receivedChunks.push(err || chunk)
      },
      onComplete
    });
  });

  it('should catch errors raised by the chunkParser and pass them to the `onChunk` callback', done => {
    const receivedChunks = [];
    const onComplete = () => {
      const chunkErrors = receivedChunks.filter(v => v instanceof Error);
      expect(chunkErrors.length).toBe(1, 'one errors caught');
      expect(chunkErrors[0].message).toBe('expected');
      expect(chunkErrors[0].rawChunk).toBe(`{ "chunk": "#1", "data": "#0" }\n`);
      
      done();
    };

    chunkedRequest({
      url: `/chunked-response?numChunks=1&entriesPerChunk=1&delimitLast=1`,
      chunkParser: () => {
        throw new Error("expected");
      },
      onChunk: (err, chunk) => {
        receivedChunks.push(err || chunk)
      },
      onComplete
    });
  });

  describe('response object', () => {
    it('200 OK`', done => {
      chunkedRequest({
        url: `/chunked-response?numChunks=2&entriesPerChunk=1&delimitLast=1`,
        onComplete: result => {
          expect(isObject(result)).toBe(true, 'is an object');
          expect(result.statusCode).toBe(200, 'statusCode');
          expect(isObject(result.raw)).toBe(true, 'raw transport agent provided');

          done();
        }
      })
    });

    it('500 Internal Server Error', done => {
      chunkedRequest({
        url: `/error-response`,
        onComplete: result => {
          expect(isObject(result)).toBe(true, 'is an object');
          expect(result.statusCode).toBe(500, 'statusCode');
          expect(isObject(result.raw)).toBe(true, 'raw transport agent provided');

          done();
        }
      })
    });

    it('should use the supplied request options', done => {
      const receivedChunks = [];

      chunkedRequest({
        url: `/echo-response`,
        headers: { 'accept': 'application/json' },
        method: 'POST',
        body: 'expected-body',
        onChunk: (err, chunk) => receivedChunks.push(err || chunk),
        onComplete: () => {
          const chunkErrors = receivedChunks.filter(v => v instanceof Error);

          expect(receivedChunks.length).toBe(1, 'one chunk');
          expect(chunkErrors.length).toBe(0, 'no errors');

          const { headers, method, body } = receivedChunks[0][0];
          expect(isObject(headers)).toBe(true, 'has headers');
          expect(headers.accept).toBe("application/json", 'accept header');
          expect(method).toBe("POST", 'method');
          expect(body).toBe('expected-body', 'body');

          done();
        }
      });
    });

    describe("credentials", () => {
      const cookieNames = [];

      function setCookie(name, value) {
        document.cookie = `${name}=${value}`;
        cookieNames.push(name);
      }

      function clearSetCookies() {
        cookieNames.forEach(name => {
          document.cookie = `${name}=false;max-age=0`;
        })
      }

      afterEach(clearSetCookies);

      it('should honour the `credentials` flag', done => {
        const receivedChunks = [];

        setCookie('myCookie', 'myValue');

        chunkedRequest({
          url: `/echo-response`,
          method: 'GET',
          onChunk: (err, chunk) => receivedChunks.push(err || chunk),
          onComplete: () => {
            const chunkErrors = receivedChunks.filter(v => v instanceof Error);

            expect(receivedChunks.length).toBe(1, 'one chunk');
            expect(chunkErrors.length).toBe(0, 'no errors');

            const { cookies } = receivedChunks[0][0];
            expect(isObject(cookies)).toBe(true, 'has cookies');
            expect(cookies.myCookie).toEqual('myValue', 'cookie sent');

            done();
          }
        });
      });
    });
  });
});
