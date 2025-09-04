# i45-jslogger Revisions

## v1.0.0

### August 26,2025

- Initial release.
- Basic logging to the console and local storage.

## v1.1.0

### August 29, 2025

- Added iLogger interface that can be used to implement and extend the Logger.
- Added iLoggerValidator to validate a custom Logger against the interface.

## v1.2.2

### August 29, 2025

- Refactoring and minor bug fixes.

## v1.3.0

### September 3, 2025

- Added support for custom logger.
- Added support for dispatch events.
- Updated documentation.
- Added test project.
- iLoggerValidator now validates against an Array of method names instead of an object.

## v1.3.1

- Removed getEvents() as a required method for custom loggers.
