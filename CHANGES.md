# i45-jslogger Revisions

## v2.0.0

### December 19, 2025

**Breaking Changes:**

- **Removed `iLogger` and `iLoggerValidator` exports** - These are no longer available as public exports. Client validation is now internal to the Logger class.
- **Removed subpath exports** - `i45-jslogger/validator` and `i45-jslogger/interface` are no longer available.
- **Changed `addClient()` return type** - Now returns `boolean` instead of `0|1`.
- **Changed `removeClient()` return type** - Now returns `boolean` instead of `void`.

**Migration Guide:**

- If you were importing `iLogger` or `iLoggerValidator`, remove those imports. Use `logger.isValidClient(client)` for validation.
- If you were checking `addClient() === 1`, change to `addClient() === true`.
- If you were relying on specific return values, update to use boolean checks.

**Improvements:**

- **Internal validation** - Client validation consolidated into Logger class (simpler codebase).
- **Smaller bundle** - Reduced from 4 outputs to 2 (logger.js + logger.d.ts).
- **Cleaner API** - No exposed implementation details.

**All v1.4.0 features included:**

- Default logger export for simple usage
- Hybrid API (default instance + custom instances)
- Comprehensive TypeScript definitions
- Environment detection for Node.js safety
- Streamlined README focused on examples

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

### September 4, 2025

- Removed getEvents() as a required method for custom loggers.
- Changed react and react-dom from dependencies to dev dependencies.

## v1.4.0

### December 19, 2025

**Critical Fixes:**

- Fixed all syntax errors in README documentation (typos, extra periods, incorrect parameter names)
- Fixed build process - now uses Rollup for proper bundling instead of simple file copying
- Added comprehensive TypeScript definitions with full API documentation
- Added environment detection for browser-only APIs (window, localStorage, CustomEvent)
- Fixed `addClient()` and `removeClient()` to return boolean instead of 0/1 for consistency

**Breaking Changes:**

- `addClient()` now returns `boolean` instead of `0|1`
- `removeClient()` now returns `boolean` instead of `void`
- Removed `iLogger` and `iLoggerValidator` exports - validation is now internal
- Removed subpath exports (`./validator` and `./interface`)

**New Features:**

- **Default logger export** - Can now use `import logger from 'i45-jslogger'` for simple cases
- **Hybrid API** - Supports both default instance and custom instances for flexibility
- **Internal validation** - Client validation consolidated into Logger class (no separate files needed)
- Package now includes proper exports map for better tree-shaking
- Added TypeScript type definitions file (`logger.d.ts`)
- Environment-safe: Won't crash in Node.js environments
- Simplified build process with Rollup bundler (2 outputs instead of 4)

**Improvements:**

- Deprecated clearEvents() method
- Added clearEventLog(), clearConsole(), and clearAll() methods
- Added getters and setters with validation for properties
- Enhanced package.json with module and types fields
- Streamlined README - focused on examples, TypeScript definitions provide API details

**Developer Experience:**

- Full IntelliSense/autocomplete support in TypeScript and JavaScript
- Comprehensive JSDoc comments for all public APIs
- Improved error messages and validation
- Smaller package size (removed separate interface/validator files)
