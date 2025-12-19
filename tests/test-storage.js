/**
 * Storage and event management tests
 */

import { Logger } from "../dist/logger.js";

console.log("Testing storage and event management\n");

// Test 1: Event storage
console.log("✓ Test 1: Event storage");
const logger = new Logger();
logger.log("Event 1");
logger.info("Event 2");
logger.warn("Event 3");
const events = logger.getEvents();
if (events.length !== 3) {
  throw new Error(`FAILED: Expected 3 events, got ${events.length}`);
}
console.log(`  ✓ ${events.length} events stored correctly\n`);

// Test 2: Event structure
console.log("✓ Test 2: Event structure");
const event = events[0];
if (!event.id || !event.type || !event.event || !event.timestamp) {
  throw new Error("FAILED: Event missing required fields");
}
if (event.type !== "LOG") {
  throw new Error(`FAILED: Expected type LOG, got ${event.type}`);
}
console.log("  ✓ Event structure is correct\n");

// Test 3: clearEventLog
console.log("✓ Test 3: clearEventLog");
const clearResult = logger.clearEventLog();
if (clearResult !== logger) {
  throw new Error("FAILED: clearEventLog should return this");
}
const eventsAfterClear = logger.getEvents();
if (eventsAfterClear.length !== 0) {
  throw new Error(
    `FAILED: Expected 0 events after clear, got ${eventsAfterClear.length}`
  );
}
console.log("  ✓ clearEventLog works correctly\n");

// Test 4: Suppress native logging
console.log("✓ Test 4: Suppress native logging");
const logger2 = new Logger();
logger2.suppressNative = true;
logger2.log("This should not be stored");
const noEvents = logger2.getEvents();
if (noEvents.length !== 0) {
  throw new Error("FAILED: No events should be stored with suppressNative");
}
console.log("  ✓ suppressNative prevents event storage\n");

// Test 5: Enable/disable logging
console.log("✓ Test 5: Enable/disable logging");
const logger3 = new Logger();
logger3.loggingEnabled = false;
logger3.log("Should not log");
const noEventsWhenDisabled = logger3.getEvents();
if (noEventsWhenDisabled.length !== 0) {
  throw new Error("FAILED: No events should be stored when logging disabled");
}
logger3.loggingEnabled = true;
logger3.log("Should log");
const eventsWhenEnabled = logger3.getEvents();
if (eventsWhenEnabled.length !== 1) {
  throw new Error("FAILED: Event should be stored when logging enabled");
}
console.log("  ✓ loggingEnabled controls event storage\n");

console.log("========================================");
console.log("All storage tests passed! ✓");
console.log("========================================");
