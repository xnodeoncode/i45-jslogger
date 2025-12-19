# i45-jslogger Revisions

## v2.0.0

### December 19, 2025

**Major Release - Breaking Changes**

This release consolidates all v1.4.0 improvements and removes deprecated exports for a cleaner, simpler API.

**Breaking Changes:**

- **Property Name Improvements** - Better, clearer names with proper grammar:
  - `enableLogging` → `loggingEnabled` (better grammar for state property)
  - `enableEvents` → `enableDispatchEvents` (clearer what it controls vs `maxEvents`)
- **Removed `iLogger` and `iLoggerValidator` exports** - These are no longer available as public exports. Client validation is now internal to the Logger class.
- **Removed subpath exports** - `i45-jslogger/validator` and `i45-jslogger/interface` are no longer available.
- **Changed `addClient()` return type** - Now returns `boolean` instead of `0|1`.
- **Changed `removeClient()` return type** - Now returns `boolean` instead of `void`.
- **Event namespacing** - CustomEvent names now prefixed with `i45-logger:` (e.g., `i45-logger:LOG` instead of `LOG`)
- **Removed deprecated `clearEvents()` method** - Use `clearEventLog()`, `clearConsole()`, or `clearAll()` instead.

**Migration Guide:**

```javascript
// Before v2.0.0
import { Logger, iLogger, iLoggerValidator } from "i45-jslogger";
const isValid = iLoggerValidator.isValid(myClient);
if (logger.addClient(myClient) === 1) {
  /* ... */
}
logger.enableLogging = true;
logger.enableEvents = true;
window.addEventListener("LOG", handler);
logger.clearEvents();

// After v2.0.0
import { Logger } from "i45-jslogger";
// or: import logger from 'i45-jslogger';
const isValid = logger.isValidClient(myClient);
if (logger.addClient(myClient)) {
  /* ... */
}
logger.loggingEnabled = true;
logger.enableDispatchEvents = true;
window.addEventListener("i45-logger:LOG", handler);
logger.clearAll(); // or clearEventLog() / clearConsole()
```

**New Features from v1.4.0:**

- **Default logger export** - Simple usage: `import logger from 'i45-jslogger'`
- **Hybrid API** - Default instance for simple cases, `new Logger()` for advanced use
- **Comprehensive TypeScript definitions** - Full IntelliSense support with JSDoc comments
- **Environment detection** - Safe for Node.js, SSR, and browser environments
- **Streamlined documentation** - Example-focused README, API details in TypeScript definitions
- **Storage limits** - `maxEvents` property to limit stored events (prevents unbounded memory growth)
- **Improved error handling** - Client errors are isolated and logged without breaking the logging chain
- **Comprehensive test coverage** - 30+ tests across 5 test files covering all features

**Architecture Improvements:**

- **Internal validation** - Client validation consolidated into Logger class
- **Smaller bundle** - Reduced from 4 build outputs to 2 (logger.js + logger.d.ts)
- **Cleaner API** - No exposed implementation details
- **Better build process** - Rollup bundler with proper ES modules
- **Event namespacing** - Prevents global window pollution and conflicts with other libraries
- **Removed deprecated methods** - Clearer, more focused public API
- **Error isolation** - Try-catch blocks around client calls prevent failures from propagating
- **Better error messages** - Property validation provides specific, actionable feedback

**New Methods:**

- `clearEventLog()` - Clear event log from localStorage
- `clearConsole()` - Clear browser console
- `clearAll()` - Clear both event log and console
- `maxEvents` property - Limit stored events (null=unlimited, positive integer=limit, 0=disable storage)
- `loggingEnabled` property - Control all logging (replaces `enableLogging` with better grammar)
- `enableDispatchEvents` property - Control CustomEvent dispatching (replaces `enableEvents` with clearer naming)

**Deprecated Methods (still functional):**

None - all deprecated methods have been removed in v2.0.0 for a cleaner API.

**Environment Support:**

| Environment | Logging | localStorage | Events      | Status     |
| ----------- | ------- | ------------ | ----------- | ---------- |
| Browser     | ✅      | ✅           | ✅          | Full       |
| Node.js     | ✅      | ❌           | ❌          | Limited    |
| SSR         | ✅      | ⚠️ (client)  | ⚠️ (client) | Compatible |

**What You Get:**

- TypeScript support with full type definitions
- Method chaining for all logging methods
- Custom logger clients for extensibility
- Event dispatching with CustomEvents
- localStorage persistence
- Environment-safe execution

**Documentation:**

- Streamlined README focused on practical examples
- Comprehensive TypeScript definitions with JSDoc
- Clear migration guide for v1.x users
- Full changelog with breaking changes highlighted

**Production Ready:**

v2.0.0 is production-ready with:

- ✅ 25+ comprehensive tests (100% passing)
- ✅ Complete TypeScript definitions
- ✅ Full documentation and migration guides
- ✅ Clean, validated API with proper error handling
- ✅ Storage limits and error isolation
- ✅ Event namespacing to prevent conflicts

**Looking Ahead:**

Planning for v3.0.0 has begun - see [v3.0.0.md](../docs/v3.0.0.md) for:

- Architecture refactoring (separated concerns)
- Plugin system
- Async client support
- Enhanced Node.js compatibility
- Performance optimizations

---

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
