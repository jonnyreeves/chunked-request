## [0.7.0] - 10/03/2017
### Added
- Allow request headers to be supplied in any format supported by [BrowserHeaders](https://github.com/improbable-eng/js-browser-headers) (#26 @MarcusLongmuir)

## [0.6.0] - 02/03/2017
### Added
- `onHeaders` callback (#25 @MarcusLongmuir)

## [0.5.3] - 26/10/2016
### Fixed
- Defer onComplete callback to prevent fetch swallowing exceptions (#23 @MarcusLongmuir)

## [0.5.2] - 07/09/2016
### Fixed
- Fixed a bug where PhantomJS' `Uint8Array` constructor must be invoked with a length argument otherwise it throws an exception...

## [0.5.1] - 07/09/2016
### Fixed
- Fixed a bug in the xhr transport where the chunk parser would be invoked
  with the bytes `[110, 117, 108, 108]` (string value: `"null"`) when using Chrome's native TextEncoder implementation.

## [0.5.0] - 29/08/2016
### Added
- Transport exception handling, eg: 'no route to host'. (#8 @Ruben-Hartog)
- Support for WebWorkers (#11, @ariutta)
- Changed `chunkParser` interface; parsers now receive data as a `Uint8Array` and now pump their own internal state; the `defaultChunkParser` continues to work as before. (#15, @ariutta)

### Fixed
- Chrome ReadableStream detection (#14)

## [0.4.0] - 19/05/2016
### Added
- Support responses that do not end with a trailing delimiter (#9, @MarcusLongmuir)
- Switched to `loadend` event to catch failures as well as success on XHR based transports.

## [0.3.1] - 30/03/2016
### Added
- npm keywords

### Fixed
- Add `dist/` to `.eslintignore` to prevent build failures on release branches
- Exclude dot files and other dev related junk from npm package.

## [0.3.0] - 30/03/2016
### Added
- `credentials` support, defaults to `'same-origin'` for consistency between XHR and fetch based transports. (#5, #6)

## [0.2.1] - 26/03/2016
### Added
- Standalone browser artifact (fixes #4)

## [0.2.0] - 26/03/2016
### Added
- Support for partial chunk parsing where the chunk does not end with the delimiter
- `rawChunk` and `prevChunkSuffix` properties added to chunk parse errors supplied to `onChunk()`

## [0.1.0] - 18/03/2016
### Added
- Initial release
