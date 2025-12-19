/**
 * Basic validation test for i45-jslogger v1.4.0
 * Tests critical fixes and changes
 */

import { Logger } from "../dist/logger.js";

console.log("Testing i45-jslogger v1.4.0\n");

// Test 1: Logger instantiation
console.log("✓ Test 1: Logger instantiation");
const logger = new Logger();
console.log("  Logger created successfully\n");

// Test 2: Environment detection
console.log("✓ Test 2: Environment detection");
console.log(`  isBrowser: ${Logger.isBrowser}`);
console.log(`  hasLocalStorage: ${Logger.hasLocalStorage}`);
console.log(`  supportsCustomEvents: ${Logger.supportsCustomEvents}\n`);

// Test 3: Basic logging methods
console.log("✓ Test 3: Basic logging methods");
logger.log("Test log message");
logger.info("Test info message");
logger.warn("Test warning message");
logger.error("Test error message");
console.log("  All logging methods work\n");

// Test 4: addClient returns boolean (critical fix)
console.log("✓ Test 4: addClient returns boolean");
const mockClient = {
  log: (msg) => {},
  info: (msg) => {},
  warn: (msg) => {},
  error: (msg) => {},
};

const addResult = logger.addClient(mockClient);
console.log(`  addClient returned: ${addResult} (type: ${typeof addResult})`);
if (typeof addResult !== "boolean") {
  throw new Error("FAILED: addClient should return boolean");
}
console.log("  ✓ Returns boolean as expected\n");

// Test 5: removeClient returns boolean (critical fix)
console.log("✓ Test 5: removeClient returns boolean");
const removeResult = logger.removeClient(mockClient);
console.log(
  `  removeClient returned: ${removeResult} (type: ${typeof removeResult})`
);
if (typeof removeResult !== "boolean") {
  throw new Error("FAILED: removeClient should return boolean");
}
console.log("  ✓ Returns boolean as expected\n");

// Test 6: Duplicate client detection
console.log("✓ Test 6: Duplicate client detection");
logger.addClient(mockClient);
const duplicateResult = logger.addClient(mockClient);
console.log(`  Adding duplicate client returned: ${duplicateResult}`);
if (duplicateResult !== false) {
  throw new Error("FAILED: Adding duplicate client should return false");
}
console.log("  ✓ Correctly rejects duplicate clients\n");

// Test 7: Invalid client rejection
console.log("✓ Test 7: Invalid client rejection");
const invalidClient = { log: () => {} }; // Missing info, warn, error
const invalidResult = logger.addClient(invalidClient);
console.log(`  Adding invalid client returned: ${invalidResult}`);
if (invalidResult !== false) {
  throw new Error("FAILED: Adding invalid client should return false");
}
console.log("  ✓ Correctly rejects invalid clients\n");

// Test 8: Method chaining
console.log("✓ Test 8: Method chaining");
const chainResult = logger
  .log("Chain 1")
  .info("Chain 2")
  .warn("Chain 3")
  .error("Chain 4");
if (chainResult !== logger) {
  throw new Error("FAILED: Methods should return this for chaining");
}
console.log("  ✓ Method chaining works correctly\n");

console.log("========================================");
console.log("All tests passed! ✓");
console.log("========================================");
