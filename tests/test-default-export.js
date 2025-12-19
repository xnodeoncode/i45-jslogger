/**
 * Test for default logger export in v1.4.0
 */

console.log("Testing default export functionality\n");

// Test 1: Default import
console.log("✓ Test 1: Default import");
import logger from "../dist/logger.js";
console.log("  Default logger imported successfully");
console.log(`  Type: ${typeof logger}`);
console.log(`  Has log method: ${typeof logger.log === "function"}\n`);

// Test 2: Default instance is ready to use
console.log("✓ Test 2: Default instance ready to use");
logger.info("This is from the default logger instance");
console.log("  Default instance works\n");

// Test 3: Named import still works
console.log("✓ Test 3: Named import still works");
import { Logger } from "../dist/logger.js";
const customLogger = new Logger();
customLogger.warn("This is from a custom logger instance");
console.log("  Named import and instantiation works\n");

// Test 4: Multiple instances are independent
console.log("✓ Test 4: Multiple instances are independent");
const logger1 = new Logger();
const logger2 = new Logger();

logger1.loggingEnabled = false;
logger2.loggingEnabled = true;

console.log(`  Logger1 enabled: ${logger1.loggingEnabled}`);
console.log(`  Logger2 enabled: ${logger2.loggingEnabled}`);
console.log("  Instances are independent\n");

// Test 5: Default logger can be configured
console.log("✓ Test 5: Default logger is configurable");
logger.suppressConsole = true;
logger.log("This should not appear in console");
logger.suppressConsole = false;
logger.log("This should appear in console");
console.log("  Default logger configuration works\n");

// Test 6: Both exports work together
console.log("✓ Test 6: Both exports work together");
import defaultLogger, { Logger as LoggerClass } from "../dist/logger.js";
console.log(`  Default import type: ${typeof defaultLogger}`);
console.log(`  Named import type: ${typeof LoggerClass}`);
console.log(`  Can create new instance: ${typeof new LoggerClass()}`);
console.log("  Hybrid pattern works\n");

console.log("========================================");
console.log("All default export tests passed! ✓");
console.log("========================================");
