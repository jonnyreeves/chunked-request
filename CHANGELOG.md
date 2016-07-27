## unreleased
### Added
- Transport exception handling, eg: 'no route to host'. (#8 @Ruben-Hartog)
- Support for WebWorkers (#11, @ariutta)

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
